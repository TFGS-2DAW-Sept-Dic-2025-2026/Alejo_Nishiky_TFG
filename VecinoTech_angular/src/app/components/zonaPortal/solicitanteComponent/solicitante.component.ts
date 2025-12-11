import { Component, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Servicios
import { MapService } from '../../../services/map.service';
import { ChatService } from '../../../services/chat.service';

// Interfaces
import { IChatNotificacion } from '../../../models/chat/IChatNotificacion';
import ISolicitudMapa from '../../../models/solicitud/ISolicitudMapa';

@Component({
  selector: 'app-solicitante',
  imports: [CommonModule],
  templateUrl: './solicitante.component.html',
  styleUrls: ['./solicitante.component.css']
})
export class SolicitanteComponent implements OnDestroy {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly mapService = inject(MapService);
  private readonly chatService = inject(ChatService);
  private readonly _router = inject(Router);

  // ==================== SIGNALS ====================

  private readonly _solicitudes = signal<ISolicitudMapa[]>([]);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');
  private readonly _notificacionActiva = signal<IChatNotificacion | null>(null);

  // ==================== COMPUTED SIGNALS ====================

  /**
   * Filtra solicitudes activas (abiertas o en proceso)
   */
  readonly solicitudesActivas = computed(() => {
    return this._solicitudes().filter(s =>
      s.estado === 'ABIERTA' || s.estado === 'EN_PROCESO'
    );
  });

  /**
   * Filtra solicitudes cerradas/completadas
   */
  readonly solicitudesCerradas = computed(() => {
    return this._solicitudes().filter(s => s.estado === 'CERRADA');
  });

  /**
   * Cuenta total de solicitudes activas
   */
  readonly totalActivas = computed(() => this.solicitudesActivas().length);

  /**
   * Cuenta total de solicitudes completadas
   */
  readonly totalCompletadas = computed(() => this.solicitudesCerradas().length);

  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly notificacionActiva = computed(() => this._notificacionActiva());

  // ==================== CONSTRUCTOR ====================

  constructor() {
    this.cargarMisSolicitudes();
    this.inicializarNotificaciones();
  }

  // ==================== LIFECYCLE ====================

  ngOnDestroy(): void {
    this.chatService.desconectarWebSocket();
  }

  // ==================== CARGA DE DATOS ====================

  /**
   * Carga todas las solicitudes del usuario actual
   */
  private cargarMisSolicitudes(): void {
    this._loading.set(true);
    this._error.set('');

    this.mapService.getMisSolicitudes().subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          this._solicitudes.set(response.datos as ISolicitudMapa[]);
        } else {
          this._error.set(response.mensaje || 'Error al cargar solicitudes');
        }
        this._loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error cargando solicitudes:', err);
        this._error.set('No se pudieron cargar tus solicitudes');
        this._loading.set(false);
      }
    });
  }

  // ==================== NOTIFICACIONES ====================

  /**
   * Inicializa el sistema de notificaciones WebSocket
   */
  private inicializarNotificaciones(): void {
    console.log('🔔 Inicializando notificaciones...');
    this.chatService.conectarWebSocket();

    setTimeout(() => {
      this.chatService.suscribirseANotificaciones();
      this.escucharNotificaciones();
    }, 1000);
  }

  /**
   * Escucha notificaciones entrantes cada 500ms
   * Detecta cuando una solicitud es aceptada por un voluntario
   */
  private escucharNotificaciones(): void {
    const notificaciones = this.chatService.notificaciones;

    setInterval(() => {
      const notifs = notificaciones();
      if (notifs.length > 0) {
        const ultimaNotif = notifs[notifs.length - 1];

        if (ultimaNotif.tipo === 'solicitud-aceptada') {
          console.log('🔔 Notificación recibida:', ultimaNotif);
          this._notificacionActiva.set(ultimaNotif);
        }
      }
    }, 500);
  }

  /**
   * Cierra una notificación activa
   * @param solicitudId - ID de la solicitud
   */
  cerrarNotificacion(solicitudId: number): void {
    this.chatService.eliminarNotificacion(solicitudId);
    this._notificacionActiva.set(null);
  }

  // ==================== GESTIÓN DE SOLICITUDES ====================

  /**
   * Navega al formulario de crear nueva solicitud
   */
  crearNuevaSolicitud(): void {
    this._router.navigate(['/portal/crear-solicitud']);
  }

  /**
   * Navega a los detalles de una solicitud
   * @param solicitudId - ID de la solicitud
   */
  verDetalles(solicitudId: number): void {
    this._router.navigate(['/portal/solicitud', solicitudId]);
  }

  /**
   * Marca una solicitud como completada
   * Pide confirmación antes de completar
   * @param solicitudId - ID de la solicitud a completar
   */
  completarSolicitud(solicitudId: number): void {
    Swal.fire({
      icon: 'question',
      title: '¿Marcar como completada?',
      text: 'Confirmas que la asistencia fue satisfactoria',
      showCancelButton: true,
      confirmButtonText: 'Sí, completar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this._loading.set(true);

      this.mapService.completarSolicitud(solicitudId).subscribe({
        next: (response) => {
          this._loading.set(false);

          if (response.codigo === 0) {
            Swal.fire({
              icon: 'success',
              title: '¡Solicitud completada!',
              text: 'La solicitud se ha marcado como completada',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#10b981',
              timer: 2500,
              timerProgressBar: true
            });
            this.cargarMisSolicitudes();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al completar',
              text: response.mensaje,
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#3b82f6'
            });
          }
        },
        error: (err) => {
          this._loading.set(false);
          console.error('❌ Error completando solicitud:', err);

          Swal.fire({
            icon: 'error',
            title: 'Error al completar la solicitud',
            text: 'Por favor, inténtalo de nuevo',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3b82f6'
          });
        }
      });
    });
  }

  /**
   * Navega al chat de una solicitud
   * Elimina la notificación activa antes de navegar
   * @param solicitudId - ID de la solicitud
   */
  irAlChat(solicitudId: number): void {
    this.chatService.eliminarNotificacion(solicitudId);
    this._notificacionActiva.set(null);
    this._router.navigate(['/portal/chat', solicitudId]);
  }

  // ==================== HELPERS DE UI ====================

  /**
   * Obtiene las clases CSS para el color del badge según el estado
   * @param estado - Estado de la solicitud
   * @returns String con clases Tailwind CSS
   */
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'ABIERTA':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'EN_PROCESO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'CERRADA':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  /**
   * Obtiene el texto legible del estado
   * @param estado - Estado de la solicitud
   * @returns Texto formateado para mostrar
   */
  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'ABIERTA': return 'Pendiente';
      case 'EN_PROCESO': return 'En Progreso';
      case 'CERRADA': return 'Completada';
      default: return estado;
    }
  }

  /**
   * Obtiene el icono emoji según la categoría
   * @param categoria - Categoría de la solicitud
   * @returns Emoji representativo
   */
  getIconoCategoria(categoria: string): string {
    const iconos: Record<string, string> = {
      'ORDENADOR': '💻',
      'MOVIL': '📱',
      'TABLET': '📲',
      'SMART_TV': '📺',
      'GENERAL': '🛠️'
    };
    return iconos[categoria] || '🛠️';
  }

  /**
   * Calcula el tiempo transcurrido desde una fecha
   * @param fecha - Fecha en formato string
   * @returns Texto descriptivo del tiempo transcurrido
   */
  calcularTiempoTranscurrido(fecha: string): string {
    if (!fecha) return 'Fecha desconocida';

    const ahora = new Date();
    const fechaSolicitud = new Date(fecha);
    const diff = ahora.getTime() - fechaSolicitud.getTime();

    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Hace menos de 1 minuto';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  }

  // ==================== NAVEGACIÓN ====================

  /**
   * Vuelve al portal principal
   */
  volverPortal(): void {
    this._router.navigate(['/portal']);
  }

  /**
   * Navega al historial de solicitudes
   */
  irAHistorial(): void {
    this._router.navigate(['/portal/historial']);
  }

  /**
   * Navega a la lista de voluntariados
   */
  irAMisVoluntariados(): void {
    this._router.navigate(['/portal/mis-voluntariados']);
  }

  /**
   * Navega al mapa de voluntarios
   */
  irAVoluntario(): void {
    this._router.navigate(['/portal/voluntario']);
  }

  // ==================== AUTENTICACIÓN ====================

  /**
   * Cierra la sesión del usuario
   * Pide confirmación antes de cerrar sesión
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
        console.log('Logout');
        // TODO: Implementar logout completo
      }
    });
  }
}
