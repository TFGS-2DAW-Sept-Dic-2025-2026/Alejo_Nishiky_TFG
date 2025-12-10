import { Component, signal, computed, inject, effect, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, switchMap, map } from 'rxjs';
import { MapService } from '../../../../services/map.service';
import ISolicitudMapa from '../../../../models/solicitud/ISolicitudMapa';


@Component({
  selector: 'app-detalle-solicitud',
  imports: [CommonModule],
  templateUrl: './detalle-solicitud.component.html',
  styleUrls: ['./detalle-solicitud.component.css']
})
export class DetalleSolicitudComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly mapService = inject(MapService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  // ==================== SIGNALS ====================

  private readonly _solicitud = signal<ISolicitudMapa | null>(null);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');

  // ✅ NUEVO: Signal para trigger de completar solicitud
  private readonly _triggerCompletar = signal<number | null>(null);

  // ✅ NUEVO: Signal para el ID de la ruta
  private readonly _solicitudId = signal<number | null>(null);

  // ==================== toSignal para peticiones HTTP ====================

  /**
   * ✅ Carga automática de solicitudes al inicializar
   * Combina mis solicitudes + mis voluntariados
   */
  private readonly _todasLasSolicitudes = toSignal(
    combineLatest({
      misSolicitudes: this.mapService.getMisSolicitudes(),
      misVoluntariados: this.mapService.getSolicitudesComoVoluntario()
    }).pipe(
      map(({ misSolicitudes, misVoluntariados }) => {
        const todas: ISolicitudMapa[] = [];

        if (misSolicitudes.codigo === 0) {
          todas.push(...(misSolicitudes.datos as ISolicitudMapa[]));
        }

        if (misVoluntariados.codigo === 0) {
          todas.push(...(misVoluntariados.datos as ISolicitudMapa[]));
        }

        return todas;
      })
    ),
    { initialValue: [], injector: this.injector }
  );

  /**
   * ✅ Resultado de completar solicitud
   */
  private readonly _resultadoCompletar = toSignal(
    toObservable(this._triggerCompletar).pipe(
      filter(id => id !== null),
      switchMap(id => this.mapService.completarSolicitud(id!))
    ),
    { initialValue: null, injector: this.injector }
  );

  // ==================== COMPUTED SIGNALS ====================

  readonly solicitud = computed(() => this._solicitud());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  // ==================== CONSTRUCTOR ====================

  constructor() {
    // Obtener ID de la ruta
    const id = this.route.snapshot.params['id'];
    if (id) {
      this._solicitudId.set(Number(id));
    } else {
      this._error.set('ID de solicitud no válido');
      this._loading.set(false);
    }

    /**
     * ✅ Effect que busca la solicitud cuando se cargan todas
     */
    effect(() => {
      const todas = this._todasLasSolicitudes();
      const solicitudId = this._solicitudId();

      if (todas.length > 0 && solicitudId) {
        const solicitud = todas.find(s => s.id === solicitudId);

        if (solicitud) {
          this._solicitud.set(solicitud);
          this._error.set('');
        } else {
          this._error.set('Solicitud no encontrada');
        }

        this._loading.set(false);
      }
    }, { injector: this.injector });

    /**
     * ✅ Effect que reacciona al resultado de completar
     */
    effect(() => {
      const resultado = this._resultadoCompletar();

      if (resultado) {
        this._loading.set(false);

        if (resultado.codigo === 0) {
          console.log('✅ Solicitud completada exitosamente');
          alert('✅ Solicitud completada exitosamente');
          this.volver();
        } else {
          console.error('❌ Error:', resultado.mensaje);
          alert(`❌ ${resultado.mensaje}`);
        }
      }
    }, { injector: this.injector });
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Vuelve a la página anterior
   */
  volver(): void {
    window.history.back();
  }

  /**
   * Completa la solicitud
   * ✅ MEJORADO: Sin .subscribe(), solo actualiza el signal trigger
   */
  completarSolicitud(): void {
    const solicitud = this._solicitud();
    if (!solicitud) return;

    if (!confirm('¿Marcar esta solicitud como completada?')) {
      return;
    }

    this._loading.set(true);

    // ✅ Actualizamos el signal para triggear la petición HTTP
    this._triggerCompletar.set(solicitud.id);
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
   * Obtiene el texto legible del estado
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
   * Calcula el tiempo transcurrido desde la fecha
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
}
