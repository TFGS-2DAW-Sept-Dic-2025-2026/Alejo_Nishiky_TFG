import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Servicios
import { MapService } from '../../../services/map.service';

// Interfaces
import ISolicitudMapa from '../../../models/interfaces_orm/mapa/ISolicitudMapa';

@Component({
  selector: 'app-solicitante',
  imports: [CommonModule],
  templateUrl: './solicitante.component.html',
  styleUrls: ['./solicitante.component.css']
})
export class SolicitanteComponent implements OnInit {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly mapService = inject(MapService);
  private readonly router = inject(Router);

  // ==================== SIGNALS ====================

  private readonly _solicitudes = signal<ISolicitudMapa[]>([]);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');

  // ==================== COMPUTED SIGNALS ====================

  /**
   * Solicitudes activas (ABIERTA o EN_PROCESO)
   */
  readonly solicitudesActivas = computed(() => {
    return this._solicitudes().filter(s =>
      s.estado === 'ABIERTA' || s.estado === 'EN_PROCESO'
    );
  });

  /**
   * Solicitudes cerradas
   */
  readonly solicitudesCerradas = computed(() => {
    return this._solicitudes().filter(s => s.estado === 'CERRADA');
  });

  /**
   * Total de solicitudes activas
   */
  readonly totalActivas = computed(() => this.solicitudesActivas().length);

  /**
   * Total de solicitudes completadas
   */
  readonly totalCompletadas = computed(() => this.solicitudesCerradas().length);

  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.cargarMisSolicitudes();
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Carga las solicitudes del usuario actual
   */
  private cargarMisSolicitudes(): void {
    this._loading.set(true);
    this._error.set('');

    // Usamos el endpoint getMisSolicitudes
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

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Navega a la página para crear una nueva solicitud
   */
  crearNuevaSolicitud(): void {
    this.router.navigate(['/portal/crear-solicitud']);
  }

  /**
   * Ver detalles de una solicitud
   */
  verDetalles(solicitudId: number): void {
    this.router.navigate(['/portal/solicitud', solicitudId]);
  }

  /**
   * Completar una solicitud (marcar como cerrada)
   * De momento solo el solicitante puede completar su solicitud
   */
  completarSolicitud(solicitudId: number): void {
    if (!confirm('¿Marcar esta solicitud como completada?')) {
      return;
    }

    this._loading.set(true);

    console.log('Completar solicitud:', solicitudId);
    // ✅ Llamar al endpoint real
    this.mapService.completarSolicitud(solicitudId).subscribe({
      next: (response) => {
        this._loading.set(false);

        if (response.codigo === 0) {
          alert('✅ Solicitud completada exitosamente');
          this.cargarMisSolicitudes(); // Recargar lista
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

  /**
   * Obtiene el color del badge según el estado
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
   * Obtiene el texto del estado en español
   */
  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'ABIERTA':
        return 'Pendiente';
      case 'EN_PROCESO':
        return 'En Progreso';
      case 'CERRADA':
        return 'Completada';
      default:
        return estado;
    }
  }

  /**
   * Obtiene la imagen por categoría
   */
  getImagenCategoria(categoria: string): string {
    const imagenes: Record<string, string> = {
      'ORDENADOR': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
      'MOVIL': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
      'TABLET': 'https://images.unsplash.com/photo-1561154464-82e9adf32764',
      'SMART_TV': 'https://images.unsplash.com/photo-1593784991095-a205069470b6',
      'GENERAL': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b'
    };
    return imagenes[categoria] || imagenes['GENERAL'];
  }

  /**
   * Calcula tiempo transcurrido
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
      // TODO: Implementar logout
      console.log('Logout');
    }
  }
}
