import { Component, signal, computed, inject, effect, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';

// Servicios
import { AuthService } from '../../../services/auth.service';
import { RestPortalService } from '../../../services/rest-portal.service';
import { StorageGlobalService } from '../../../services/storage-global.service';

// Componentes
import { ModalEditarComponent } from './modal-editar/modal-editar.component';
import { IUsuario } from '../../../models/usuario/IUsuario';

// Interfaces


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
  standalone: true,
  imports: [CommonModule, ModalEditarComponent],
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

  // Signal para trigger de actualización
  private readonly _triggerActualizacion = signal<ActualizarPerfilRequest | null>(null);

  // ==================== toSignal para petición HTTP ====================

  /**
   *  Convierte el trigger de actualización en Observable y ejecuta la petición HTTP
   */
  private readonly _resultadoActualizacion = toSignal(
    toObservable(this._triggerActualizacion).pipe(
      filter(request => request !== null),
      switchMap(request => this.restPortal.putActualizarPerfil(request!))
    ),
    { initialValue: null, injector: this.injector }
  );

  // ==================== COMPUTED SIGNALS ====================

  readonly perfil = computed(() => this._perfil());
  readonly estadisticas = computed(() => this._estadisticas());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  /**
   * URL del avatar
   */
  readonly avatarUrl = computed(() => {
    const perfil = this._perfil();
    if (!perfil) return 'https://ui-avatars.com/api/?name=Usuario&background=random&size=128';

    // Si tiene avatarUrl personalizado
    if (perfil.avatarUrl) {
      // Si es una URL relativa (/avatars/...), añadir el backend
      if (perfil.avatarUrl.startsWith('/avatars/')) {
        return `http://localhost:8080${perfil.avatarUrl}`;
      }
      // Si es URL completa (http://...), usarla tal cual
      return perfil.avatarUrl;
    }

    // Si no tiene avatar, generar uno con iniciales
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(perfil.nombre)}&background=random&size=128`;
  });

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
     * Reemplaza el callback .subscribe()
     */
    effect(() => {
      const resultado = this._resultadoActualizacion();

      if (resultado) {
        if (resultado.codigo === 0) {
          console.log('✅ Perfil actualizado correctamente');

          // Actualizar usuario en storage y recargar perfil
          const datosActualizados = this._triggerActualizacion();
          if (datosActualizados) {
            this.storage.actualizarUsuario(datosActualizados);
            this._perfil.set(this.authService.currentUser());
          }

          this.mostrarModal.set(false);
          alert('✅ Perfil actualizado correctamente');
        } else {
          console.error('❌ Error en actualización:', resultado.mensaje);
          alert('❌ ' + resultado.mensaje);
        }
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

    // Obtener datos del usuario desde AuthService (computed signal)
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
  }

  /**
   * Guarda los cambios del perfil
   * ✅ MEJORADO: Sin .subscribe(), solo actualiza el signal trigger
   */
  guardarPerfil(datos: Partial<IUsuario>): void {
    console.log('📤 Guardando perfil:', datos);

    const request: ActualizarPerfilRequest = {
      nombre: datos.nombre!,
      avatarUrl: datos.avatarUrl,
      telefono: datos.telefono,
      direccion: datos.direccion,
      codigoPostal: datos.codigoPostal
    };

    // ✅ Actualizamos el signal para triggear la petición HTTP
    this._triggerActualizacion.set(request);
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
