import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import ISolicitudMapa from '../../../../models/interfaces_orm/mapa/ISolicitudMapa';
import { Router } from '@angular/router';
import { MapService } from '../../../../services/map.service';

@Component({
  selector: 'app-mis-voluntariados',
  imports: [CommonModule],
  templateUrl: './mis-voluntariados.component.html',
  styleUrl: './mis-voluntariados.component.css'
})
export class MisVoluntariadosComponent {

    // ==================== DEPENDENCY INJECTION ====================

  private readonly mapService = inject(MapService);
  private readonly router = inject(Router);

  // ==================== SIGNALS ====================

  private readonly _solicitudes = signal<ISolicitudMapa[]>([]);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');
  private readonly _filtroActivo = signal<'todas' | 'en_progreso' | 'completadas'>('todas');

  // ==================== COMPUTED SIGNALS ====================

  /**
   * Solicitudes filtradas según el filtro activo
   */
  readonly solicitudesFiltradas = computed(() => {
    const filtro = this._filtroActivo();
    const todas = this._solicitudes();

    switch (filtro) {
      case 'en_progreso':
        return todas.filter(s => s.estado === 'EN_PROCESO');
      case 'completadas':
        return todas.filter(s => s.estado === 'CERRADA');
      default:
        return todas;
    }
  });

  /**
   * Solicitudes en progreso
   */
  readonly solicitudesEnProgreso = computed(() => {
    return this._solicitudes().filter(s => s.estado === 'EN_PROCESO');
  });

  /**
   * Solicitudes completadas
   */
  readonly solicitudesCompletadas = computed(() => {
    return this._solicitudes().filter(s => s.estado === 'CERRADA');
  });

  /**
   * Total de ayudas
   */
  readonly totalAyudas = computed(() => this._solicitudes().length);

  /**
   * Total en progreso
   */
  readonly totalEnProgreso = computed(() => this.solicitudesEnProgreso().length);

  /**
   * Total completadas
   */
  readonly totalCompletadas = computed(() => this.solicitudesCompletadas().length);

  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly filtroActivo = computed(() => this._filtroActivo());

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.cargarMisVoluntariados();
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Carga las solicitudes donde el usuario es voluntario
   */
  private cargarMisVoluntariados(): void {
    this._loading.set(true);
    this._error.set('');

    this.mapService.getSolicitudesComoVoluntario().subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          this._solicitudes.set(response.datos as ISolicitudMapa[]);
        } else {
          this._error.set(response.mensaje || 'Error al cargar voluntariados');
        }
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando voluntariados:', err);
        this._error.set('No se pudieron cargar tus voluntariados');
        this._loading.set(false);
      }
    });
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Cambia el filtro activo
   */
  cambiarFiltro(filtro: 'todas' | 'en_progreso' | 'completadas'): void {
    this._filtroActivo.set(filtro);
  }

  /**
   * Ver detalles de una solicitud
   */
  verDetalles(solicitudId: number): void {
    this.router.navigate(['/portal/solicitud', solicitudId]);
  }

  /**
   * Navegar al mapa para buscar más solicitudes
   */
  buscarMasSolicitudes(): void {
    this.router.navigate(['/portal/voluntario']);
  }

  /**
   * Volver al portal
   */
  volverPortal(): void {
    this.router.navigate(['/portal']);
  }

  /**
   * Obtiene el color del badge según el estado
   */
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'ABIERTA':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400';
      case 'EN_PROCESO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400';
      case 'CERRADA':
        return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-950/30 dark:text-slate-400';
    }
  }

  /**
   * Obtiene el texto del estado en español
   */
  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'ABIERTA':
        return 'Abierta';
      case 'EN_PROCESO':
        return 'En Progreso';
      case 'CERRADA':
        return 'Completada';
      default:
        return estado;
    }
  }

  /**
   * Obtiene el icono por categoría
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
   * Logout
   */
  logout(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      // TODO: Implementar logout
      console.log('Logout');
    }
  }

}
