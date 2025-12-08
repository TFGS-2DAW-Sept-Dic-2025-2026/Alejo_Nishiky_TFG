import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

// Servicios
import { MapService } from '../../../../services/map.service';

// Interfaces
import ISolicitudMapa from '../../../../models/interfaces_orm/mapa/ISolicitudMapa';

@Component({
  selector: 'app-detalle-solicitud',
  imports: [CommonModule],
  templateUrl: './detalle-solicitud.component.html',
  styleUrls: ['./detalle-solicitud.component.css']
})
export class DetalleSolicitudComponent implements OnInit {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly mapService = inject(MapService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ==================== SIGNALS ====================

  private readonly _solicitud = signal<ISolicitudMapa | null>(null);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');

  // ==================== COMPUTED SIGNALS ====================

  readonly solicitud = computed(() => this._solicitud());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.cargarDetalleSolicitud(Number(id));
    } else {
      this._error.set('ID de solicitud no válido');
      this._loading.set(false);
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Carga los detalles de una solicitud buscando en TODAS las fuentes
   */
  private cargarDetalleSolicitud(id: number): void {
    this._loading.set(true);
    this._error.set('');

    // ✅ Buscar en AMBAS listas: como solicitante Y como voluntario
    forkJoin({
      misSolicitudes: this.mapService.getMisSolicitudes(),
      misVoluntariados: this.mapService.getSolicitudesComoVoluntario()
    }).subscribe({
      next: ({ misSolicitudes, misVoluntariados }) => {
        // Combinar ambas listas
        const todasLasSolicitudes: ISolicitudMapa[] = [];

        if (misSolicitudes.codigo === 0) {
          todasLasSolicitudes.push(...(misSolicitudes.datos as ISolicitudMapa[]));
        }

        if (misVoluntariados.codigo === 0) {
          todasLasSolicitudes.push(...(misVoluntariados.datos as ISolicitudMapa[]));
        }

        // Buscar la solicitud por ID
        const solicitud = todasLasSolicitudes.find(s => s.id === id);

        if (solicitud) {
          this._solicitud.set(solicitud);
        } else {
          this._error.set('Solicitud no encontrada');
        }

        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando detalle:', err);
        this._error.set('No se pudo cargar la solicitud');
        this._loading.set(false);
      }
    });
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  volver(): void {
    // Intentar volver a la página anterior
    window.history.back();
  }

  completarSolicitud(): void {
    const solicitud = this._solicitud();
    if (!solicitud) return;

    if (!confirm('¿Marcar esta solicitud como completada?')) {
      return;
    }

    this._loading.set(true);

    this.mapService.completarSolicitud(solicitud.id).subscribe({
      next: (response) => {
        this._loading.set(false);

        if (response.codigo === 0) {
          alert('✅ Solicitud completada exitosamente');
          this.volver();
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
}
