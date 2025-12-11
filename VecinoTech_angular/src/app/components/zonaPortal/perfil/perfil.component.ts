import { Component, signal, computed, inject, effect, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap, tap } from 'rxjs';

// Servicios
import { AuthService } from '../../../services/auth.service';
import { RestPortalService } from '../../../services/rest-portal.service';
import { StorageGlobalService } from '../../../services/storage-global.service';

// Componentes
import { ModalEditarComponent } from './modal-editar/modal-editar.component';
import { IUsuario } from '../../../models/usuario/IUsuario';
import { AvatarUrlPipe } from '../../../pipes/avatar-url.pipe';

interface EstadisticasUsuario {
  solicitudes_creadas: number;
  solicitudes_completadas: number;
  ayudas_realizadas: number;
  tasa_exito: number;
}

interface ActualizarPerfilRequest {
  nombre: string;
  avatarUrl?: string;
  telefono?: string;
  direccion?: string;
  codigoPostal?: string;
}

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ModalEditarComponent, AvatarUrlPipe],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly restPortal = inject(RestPortalService);
  private readonly storage = inject(StorageGlobalService);
  private readonly injector = inject(Injector);

  // ==================== SIGNALS ====================

  private readonly _perfil = signal<IUsuario | null>(null);
  private readonly _estadisticas = signal<EstadisticasUsuario>({
    solicitudes_creadas: 0,
    solicitudes_completadas: 0,
    ayudas_realizadas: 0,
    tasa_exito: 0
  });
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');

  // Signal para controlar el modal
  readonly mostrarModal = signal<boolean>(false);

  // Signal para el loading de la actualización
  readonly actualizandoPerfil = signal<boolean>(false);

  // Signal para el loading del toggle voluntario
  readonly cambiandoModoVoluntario = signal<boolean>(false);

  // Signal para trigger de actualización
  private readonly _triggerActualizacion = signal<ActualizarPerfilRequest | null>(null);

  // ==================== toSignal para petición HTTP ====================

  /**
   * Convierte el trigger de actualización en Observable
   */
  private readonly _resultadoActualizacion = toSignal(
    toObservable(this._triggerActualizacion).pipe(
      filter((request): request is ActualizarPerfilRequest => request !== null),
      tap(() => {
        this.actualizandoPerfil.set(true);
      }),
      switchMap(request => this.restPortal.putActualizarPerfil(request))
    ),
    { initialValue: null, injector: this.injector }
  );

  // ==================== COMPUTED SIGNALS ====================

  readonly perfil = computed(() => this._perfil());
  readonly estadisticas = computed(() => this._estadisticas());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  /**
   * Iniciales del usuario
   */
  readonly iniciales = computed(() => {
    const perfil = this._perfil();
    if (!perfil) return 'U';
    return perfil.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  });

  /**
   * Fecha de registro formateada
   */
  readonly fechaRegistroFormateada = computed(() => {
    const perfil = this._perfil();
    if (!perfil || !perfil.fechaCreacion) return 'No disponible';

    const fecha = new Date(perfil.fechaCreacion);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // ==================== CONSTRUCTOR ====================

  constructor() {
    this.cargarPerfil();

    /**
     * Effect que reacciona al resultado de actualización
     */
    effect(() => {
      const resultado = this._resultadoActualizacion();

      if (!resultado || !this.actualizandoPerfil()) return;

      console.log('📥 Respuesta del backend:', resultado);

      this.actualizandoPerfil.set(false);

      if (resultado.codigo === 0) {
        console.log(' Perfil actualizado correctamente!!');

        const usuarioActualizado = resultado.datos as IUsuario;

        if (usuarioActualizado) {
          this._perfil.set(usuarioActualizado);
          this.storage.actualizarUsuario(usuarioActualizado);
        } else {
          this.cargarPerfil();
        }

        this.mostrarModal.set(false);
        this._error.set('');

        alert('Perfil actualizado correctamente ...');
      } else {
        console.error('❌ Error del backend:', resultado.mensaje);
        this._error.set(resultado.mensaje || 'No se pudo actualizar el perfil');
        alert('❌ ' + resultado.mensaje);
      }
    }, { injector: this.injector });
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Carga el perfil del usuario actual
   */
  private cargarPerfil(): void {
    this._loading.set(true);
    this._error.set('');

    const usuario = this.authService.currentUser();

    if (usuario) {
      this._perfil.set(usuario);
      this.cargarEstadisticas();
    } else {
      this._error.set('No se pudo cargar el perfil');
    }

    this._loading.set(false);
  }

  /**
   * Carga las estadísticas del usuario
   */
  private cargarEstadisticas(): void {
    // TODO: Implementar endpoint real para estadísticas
    this._estadisticas.set({
      solicitudes_creadas: 12,
      solicitudes_completadas: 8,
      ayudas_realizadas: 15,
      tasa_exito: 85
    });
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Abre el modal de edición
   */
  editarPerfil(): void {
    this.mostrarModal.set(true);
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.mostrarModal.set(false);
    this._error.set('');
  }

  /**
   * Guarda los cambios del perfil
   */
  public guardarPerfil(datos: Partial<IUsuario>): void {
    console.log('📤 Guardando perfil:', datos);

    this._error.set('');

    const perfilActual = this._perfil();

    const request: ActualizarPerfilRequest = {
      nombre: datos.nombre ?? perfilActual?.nombre ?? '',
      avatarUrl: datos.avatarUrl,
      telefono: datos.telefono,
      direccion: datos.direccion,
      codigoPostal: datos.codigoPostal
    };

    this._triggerActualizacion.set(request);
  }

  /**
   * Toggle del modo voluntario
   */
  toggleModoVoluntario(): void {
    const perfil = this._perfil();
    if (!perfil) return;

    const nuevoEstado = !perfil.esVoluntario;

    const mensaje = nuevoEstado
      ? '¿Deseas activar el Modo Voluntario?\n\nPodrás aceptar solicitudes de ayuda en tu comunidad.'
      : '¿Deseas desactivar el Modo Voluntario?\n\nNo podrás aceptar nuevas solicitudes hasta que lo reactives.';

    if (!confirm(mensaje)) {
      return;
    }

    this.cambiandoModoVoluntario.set(true);

    // Llamar al endpoint del backend
    this.restPortal.toggleVoluntario().subscribe({
      next: (response) => {
        this.cambiandoModoVoluntario.set(false);

        if (response.codigo === 0) {
          // Actualizar el perfil local
          const perfilActualizado: IUsuario = {
            ...perfil,
            esVoluntario: nuevoEstado
          };

          this._perfil.set(perfilActualizado);
          this.storage.actualizarUsuario(perfilActualizado);

          const mensajeExito = nuevoEstado
            ? 'Modo Voluntario activado correctamente'
            : 'Modo Voluntario desactivado correctamente';

          alert(mensajeExito);
        } else {
          alert('❌ ' + response.mensaje);
        }
      },
      error: (error) => {
        this.cambiandoModoVoluntario.set(false);
        console.error('Error al cambiar modo voluntario:', error);
        alert('❌ Error al cambiar el modo voluntario');
      }
    });
  }

  /**
   * Cambiar contraseña
   */
  cambiarContrasena(): void {
    alert('🔒 Funcionalidad en desarrollo');
  }

  /**
   * Volver al portal
   */
  volverPortal(): void {
    this.router.navigate(['/portal']);
  }

  /**
   * Logout
   */
  logout(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }
}
