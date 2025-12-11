import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

// Servicios
import { MapService } from '../../../services/map.service';

import { StorageGlobalService } from '../../../services/storage-global.service';
import { ModalValoracionComponent } from '../modal-valoracion/modal-valoracion.component';
import { ValoracionesService } from '../../../services/valoraciones.service';
import ISolicitudMapa from '../../../models/solicitud/ISolicitudMapa';

@Component({
  selector: 'app-historial',
  imports: [CommonModule, FormsModule, ModalValoracionComponent],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly mapService = inject(MapService);
  private readonly router = inject(Router);
  private readonly valoracionesService = inject(ValoracionesService); // ✅ AÑADIR
private readonly storage = inject(StorageGlobalService); // ✅ AÑADIR

  // ==================== SIGNALS ====================

  private readonly _solicitudesComoSolicitante = signal<ISolicitudMapa[]>([]);
  private readonly _solicitudesComoVoluntario = signal<ISolicitudMapa[]>([]);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');
  private readonly _filtroRol = signal<'todas' | 'solicitante' | 'voluntario'>('todas');
  private readonly _categoriaSeleccionada = signal<string>('');

  // ✅ AÑADIR: Set de IDs de solicitudes ya valoradas
  private readonly _solicitudesValoradas = signal<Set<number>>(new Set());
  // ✅ AÑADIR: Signals para modal de valoración
  readonly mostrarModalValoracion = signal<boolean>(false);
  readonly solicitudAValorar = signal<ISolicitudMapa | null>(null);

  // ✅ AÑADIR: Usuario actual
  readonly usuarioActual = this.storage.usuarioSig;

  // ==================== CATEGORÍAS ====================

  readonly categorias = ['GENERAL', 'MOVIL', 'ORDENADOR', 'TABLET', 'SMART_TV'];

  // ==================== COMPUTED SIGNALS ====================

  /**
   * Todas las solicitudes cerradas combinadas
   */
  private readonly todasSolicitudes = computed(() => {
    return [...this._solicitudesComoSolicitante(), ...this._solicitudesComoVoluntario()];
  });

  /**
   * Solicitudes filtradas por rol y categoría
   */
  readonly solicitudesFiltradas = computed(() => {
    let solicitudes: ISolicitudMapa[] = [];

    // Filtrar por rol
    switch (this._filtroRol()) {
      case 'solicitante':
        solicitudes = this._solicitudesComoSolicitante();
        break;
      case 'voluntario':
        solicitudes = this._solicitudesComoVoluntario();
        break;
      default:
        solicitudes = this.todasSolicitudes();
        break;
    }

    // Filtrar por categoría
    const categoria = this._categoriaSeleccionada();
    if (categoria) {
      solicitudes = solicitudes.filter(s => s.categoria === categoria);
    }

    // Ordenar por fecha de creación (más reciente primero)
    return solicitudes.sort((a, b) =>
      new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    );
  });

  /**
   * Total de solicitudes como solicitante
   */
  readonly totalComoSolicitante = computed(() => this._solicitudesComoSolicitante().length);

  /**
   * Total de solicitudes como voluntario
   */
  readonly totalComoVoluntario = computed(() => this._solicitudesComoVoluntario().length);

  /**
   * Total combinado
   */
  readonly totalSolicitudes = computed(() => this.todasSolicitudes().length);

  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly filtroRol = computed(() => this._filtroRol());
  readonly categoriaSeleccionada = computed(() => this._categoriaSeleccionada());

  // ==================== CONSTRUCTOR (Angular 19) ====================

  constructor() {
    // Cargar datos al inicializar el componente
    this.cargarHistorial();
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Carga el historial completo
   */
  private cargarHistorial(): void {
    this._loading.set(true);
    this._error.set('');

    // Cargar solicitudes como solicitante
    this.mapService.getMisSolicitudes().subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          const solicitudes = response.datos as ISolicitudMapa[];
          // Filtrar solo las cerradas
          const cerradas = solicitudes.filter(s => s.estado === 'CERRADA');
          this._solicitudesComoSolicitante.set(cerradas);
          // ✅ AÑADIR: Cargar valoraciones de estas solicitudes
          this.cargarValoraciones(cerradas);
        }
        this.cargarVoluntariados();
      },
      error: (err) => {
        console.error('Error cargando solicitudes:', err);
        this._error.set('No se pudo cargar el historial');
        this._loading.set(false);
      }
    });
  }

  /**
   * Carga las valoraciones de las solicitudes cerradas
   */
  private cargarValoraciones(solicitudes: ISolicitudMapa[]): void {
    // Si no hay solicitudes, no hacer nada
    if (solicitudes.length === 0) return;

    // Por cada solicitud, verificar si ya fue valorada
    const valoradasSet = new Set<number>();
    let pendientes = solicitudes.length;

    solicitudes.forEach(solicitud => {
      this.valoracionesService.verificarSiYaValorada(solicitud.id).subscribe({
        next: (response) => {
          if (response.codigo === 0 && response.datos === true) {
            valoradasSet.add(solicitud.id);
          }

          // Cuando termine de verificar todas, actualizar el signal
          pendientes--;
          if (pendientes === 0) {
            this._solicitudesValoradas.set(valoradasSet);
            console.log('✅ Valoraciones cargadas:', valoradasSet);
          }
        },
        error: (err) => {
          console.error('Error verificando valoración:', err);
          pendientes--;
          if (pendientes === 0) {
            this._solicitudesValoradas.set(valoradasSet);
          }
        }
      });
    });
  }

  /**
   * Carga las solicitudes como voluntario
   */
  private cargarVoluntariados(): void {
    this.mapService.getSolicitudesComoVoluntario().subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          const solicitudes = response.datos as ISolicitudMapa[];
          // Filtrar solo las cerradas
          this._solicitudesComoVoluntario.set(
            solicitudes.filter(s => s.estado === 'CERRADA')
          );
        }
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando voluntariados:', err);
        this._error.set('No se pudo cargar el historial completo');
        this._loading.set(false);
      }
    });
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Cambia el filtro de rol
   */
  cambiarFiltroRol(filtro: 'todas' | 'solicitante' | 'voluntario'): void {
    this._filtroRol.set(filtro);
  }
  /**
   * Abre el modal de valoración
   */
  abrirModalValoracion(solicitud: ISolicitudMapa): void {
    // Validar que sea solicitante
    if (!this.esSolicitante(solicitud)) {
      Swal.fire({
        icon: 'warning',
        title: 'No permitido',
        text: 'Solo el solicitante puede valorar',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    // Validar que haya voluntario
    if (!solicitud.voluntario) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin voluntario',
        text: 'Esta solicitud no tiene voluntario asignado',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    this.solicitudAValorar.set(solicitud);
    this.mostrarModalValoracion.set(true);
  }

  /**
   * Maneja el éxito de la valoración
   */
  onValoracionSuccess(): void {
    console.log('✅ Valoración completada desde historial');

    Swal.fire({
      icon: 'success',
      title: '¡Gracias por tu valoración!',
      text: 'Tu opinión ayuda a mejorar la comunidad',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#10b981',
      timer: 2500,
      timerProgressBar: true
    });

    // ✅ Añadir al Set de valoradas
    const solicitud = this.solicitudAValorar();
    if (solicitud) {
      this._solicitudesValoradas.update(set => {
        const newSet = new Set(set);
        newSet.add(solicitud.id);
        return newSet;
      });
    }

    // Cerrar modal
    this.mostrarModalValoracion.set(false);
    this.solicitudAValorar.set(null);
  }

  /**
   * Cierra el modal de valoración
   */
  onValoracionClose(): void {
    this.mostrarModalValoracion.set(false);
    this.solicitudAValorar.set(null);
  }

  /**
   * Verifica si la solicitud ya fue valorada
   */
  yaFueValorada(solicitud: ISolicitudMapa): boolean {
    return this._solicitudesValoradas().has(solicitud.id);
  }

  /**
   * Cambia la categoría seleccionada
   */
  cambiarCategoria(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this._categoriaSeleccionada.set(select.value);
  }

  /**
   * Ver detalles de una solicitud
   */
  verDetalles(solicitudId: number): void {
    this.router.navigate(['/portal/solicitud', solicitudId]);
  }

  /**
   * Volver al portal
   */
  volverPortal(): void {
    this.router.navigate(['/portal']);
  }

  /**
   * Determina si el usuario fue el solicitante
   */
  esSolicitante(solicitud: ISolicitudMapa): boolean {
    return this._solicitudesComoSolicitante().some(s => s.id === solicitud.id);
  }

  /**
   * Obtiene el color del badge según el rol
   */
  getRolColor(solicitud: ISolicitudMapa): string {
    if (this.esSolicitante(solicitud)) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400';
    }
    return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400';
  }

  /**
   * Obtiene el texto del rol
   */
  getRolTexto(solicitud: ISolicitudMapa): string {
    return this.esSolicitante(solicitud) ? 'Solicitante' : 'Voluntario';
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
   * Formatea una fecha
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return 'Fecha desconocida';

    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Calcula duración entre dos fechas
   */
  calcularDuracion(fechaInicio: string, fechaFin?: string): string {
    if (!fechaInicio) return 'Duración desconocida';

    const inicio = new Date(fechaInicio);
    const fin = fechaFin ? new Date(fechaFin) : new Date();

    const diff = fin.getTime() - inicio.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (dias > 0) {
      return `${dias} día${dias > 1 ? 's' : ''}`;
    }
    if (horas > 0) {
      return `${horas} hora${horas > 1 ? 's' : ''}`;
    }
    return 'Menos de 1 hora';
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
        // TODO: Implementar logout
        console.log('Logout');
      }
    });
  }
}
