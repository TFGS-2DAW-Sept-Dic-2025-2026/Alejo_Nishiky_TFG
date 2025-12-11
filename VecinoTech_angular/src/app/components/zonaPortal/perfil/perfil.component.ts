import { Component, signal, computed, inject, effect, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';

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
        console.log('✅ Perfil actualizado correctamente');

        const usuarioActualizado = resultado.datos as IUsuario;

        if (usuarioActualizado) {
          this._perfil.set(usuarioActualizado);
          this.storage.actualizarUsuario(usuarioActualizado);
        } else {
          this.cargarPerfil();
        }

        this.mostrarModal.set(false);
        this._error.set('');

        Swal.fire({
          icon: 'success',
          title: '¡Perfil actualizado!',
          text: 'Tus cambios se han guardado correctamente',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#10b981',
          timer: 2500,
          timerProgressBar: true
        });
      } else {
        console.error('❌ Error del backend:', resultado.mensaje);
        this._error.set(resultado.mensaje || 'No se pudo actualizar el perfil');

        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: resultado.mensaje || 'No se pudo actualizar el perfil',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3b82f6'
        });
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
      ? 'Podrás aceptar solicitudes de ayuda en tu comunidad.'
      : 'No podrás aceptar nuevas solicitudes hasta que lo reactives.';

    const titulo = nuevoEstado
      ? '¿Activar Modo Voluntario?'
      : '¿Desactivar Modo Voluntario?';

    Swal.fire({
      icon: 'question',
      title: titulo,
      text: mensaje,
      showCancelButton: true,
      confirmButtonText: nuevoEstado ? 'Sí, activar' : 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: nuevoEstado ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (!result.isConfirmed) return;

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
              ? 'Ahora puedes aceptar solicitudes de ayuda'
              : 'Ya no recibirás nuevas solicitudes';

            const tituloExito = nuevoEstado
              ? '¡Modo Voluntario activado!'
              : 'Modo Voluntario desactivado';

            Swal.fire({
              icon: 'success',
              title: tituloExito,
              text: mensajeExito,
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#10b981',
              timer: 3000,
              timerProgressBar: true
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al cambiar modo',
              text: response.mensaje,
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#3b82f6'
            });
          }
        },
        error: (error) => {
          this.cambiandoModoVoluntario.set(false);
          console.error('❌ Error al cambiar modo voluntario:', error);

          Swal.fire({
            icon: 'error',
            title: 'Error al cambiar el modo',
            text: 'Por favor, inténtalo de nuevo',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3b82f6'
          });
        }
      });
    });
  }

  /**
   * Cambiar contraseña
   */
  cambiarContrasena(): void {
    Swal.fire({
      icon: 'info',
      title: 'Funcionalidad en desarrollo',
      text: 'Pronto podrás cambiar tu contraseña',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3b82f6'
    });
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
    Swal.fire({
      icon: 'question',
      title: '¿Cerrar sesión?',
      text: 'Tendrás que volver a iniciar sesión',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
      }
    });
  }
}
