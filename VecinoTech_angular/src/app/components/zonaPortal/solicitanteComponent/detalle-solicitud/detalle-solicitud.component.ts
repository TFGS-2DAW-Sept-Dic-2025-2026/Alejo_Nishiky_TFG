import { Component, signal, computed, inject, effect, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, switchMap, map } from 'rxjs';
import Swal from 'sweetalert2';

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

  /**
   * Signal trigger para completar solicitud
   */
  private readonly _triggerCompletar = signal<number | null>(null);

  /**
   * Signal con el ID de la solicitud desde la ruta
   */
  private readonly _solicitudId = signal<number | null>(null);

  // ==================== toSignal - PETICIONES HTTP ====================

  /**
   * Carga automática de todas las solicitudes al inicializar
   * Combina mis solicitudes como solicitante + mis voluntariados
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
   * Resultado de completar solicitud (reactivo)
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
     * Effect: Busca la solicitud cuando se cargan todas
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
     * Effect: Reacciona al resultado de completar solicitud
     */
    effect(() => {
      const resultado = this._resultadoCompletar();

      if (resultado) {
        this._loading.set(false);

        if (resultado.codigo === 0) {
          console.log('✅ Solicitud completada exitosamente');

          Swal.fire({
            icon: 'success',
            title: '¡Solicitud completada!',
            text: 'La solicitud se ha marcado como completada',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#10b981',
            timer: 2500,
            timerProgressBar: true
          }).then(() => {
            this.volver();
          });
        } else {
          console.error('❌ Error:', resultado.mensaje);

          Swal.fire({
            icon: 'error',
            title: 'Error al completar',
            text: resultado.mensaje,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3b82f6'
          });
        }
      }
    }, { injector: this.injector });
  }

  // ==================== GESTIÓN DE SOLICITUD ====================

  /**
   * Completa la solicitud actual
   * Pide confirmación antes de marcar como completada
   */
  completarSolicitud(): void {
    const solicitud = this._solicitud();
    if (!solicitud) return;

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

      // Actualizar el signal para triggear la petición HTTP
      this._triggerCompletar.set(solicitud.id);
    });
  }

  // ==================== NAVEGACIÓN ====================

  /**
   * Vuelve a la página anterior
   */
  volver(): void {
    window.history.back();
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
}
