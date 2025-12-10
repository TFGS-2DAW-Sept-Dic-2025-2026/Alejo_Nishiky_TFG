import { Component, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  readonly solicitudesActivas = computed(() => {
    return this._solicitudes().filter(s =>
      s.estado === 'ABIERTA' || s.estado === 'EN_PROCESO'
    );
  });

  readonly solicitudesCerradas = computed(() => {
    return this._solicitudes().filter(s => s.estado === 'CERRADA');
  });

  readonly totalActivas = computed(() => this.solicitudesActivas().length);
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

  // ==================== MÉTODOS PRIVADOS ====================

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
        console.error('Error cargando solicitudes:', err);
        this._error.set('No se pudieron cargar tus solicitudes');
        this._loading.set(false);
      }
    });
  }

  private inicializarNotificaciones(): void {
    console.log('🔔 Inicializando notificaciones...');
    this.chatService.conectarWebSocket();

    setTimeout(() => {
      this.chatService.suscribirseANotificaciones();
      this.escucharNotificaciones();
    }, 1000);
  }

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

  // ==================== MÉTODOS PÚBLICOS ====================

  crearNuevaSolicitud(): void {
    this._router.navigate(['/portal/crear-solicitud']);
  }

  verDetalles(solicitudId: number): void {
    this._router.navigate(['/portal/solicitud', solicitudId]);
  }

  completarSolicitud(solicitudId: number): void {
    if (!confirm('¿Marcar esta solicitud como completada?')) {
      return;
    }

    this._loading.set(true);

    this.mapService.completarSolicitud(solicitudId).subscribe({
      next: (response) => {
        this._loading.set(false);

        if (response.codigo === 0) {
          alert('✅ Solicitud completada exitosamente');
          this.cargarMisSolicitudes();
        } else {
          alert(`❌ ${response.mensaje}`);
        }
      },
      error: (err) => {
        this._loading.set(false);
        console.error('Error completando solicitud:', err);
        alert('❌ Error al completar la solicitud');
      }
    });
  }

  irAlChat(solicitudId: number): void {
    this.chatService.eliminarNotificacion(solicitudId);
    this._notificacionActiva.set(null);
    this._router.navigate(['/portal/chat', solicitudId]);
  }

  cerrarNotificacion(solicitudId: number): void {
    this.chatService.eliminarNotificacion(solicitudId);
    this._notificacionActiva.set(null);
  }

  // ==================== HELPERS ====================

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

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'ABIERTA': return 'Pendiente';
      case 'EN_PROCESO': return 'En Progreso';
      case 'CERRADA': return 'Completada';
      default: return estado;
    }
  }

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

  volverPortal(): void {
    this._router.navigate(['/portal']);
  }

  irAHistorial(): void {
    this._router.navigate(['/portal/historial']);
  }

  irAMisVoluntariados(): void {
    this._router.navigate(['/portal/mis-voluntariados']);
  }

  irAVoluntario(): void {
    this._router.navigate(['/portal/voluntario']);
  }

  logout(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      console.log('Logout');
    }
  }
}
