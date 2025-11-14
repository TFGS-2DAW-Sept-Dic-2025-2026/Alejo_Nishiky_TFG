import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, effect, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import ISolicitudMapa from '../../../../models/interfaces_orm/mapa/ISolicitudMapa';
import * as L from 'leaflet';
import ICategoria from '../../../../models/ICategoria';
import { MapService } from '../../../../services/map.service';

@Component({
  selector: 'app-mapa',
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponent implements OnInit, AfterViewInit, OnDestroy {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly mapService = inject(MapService);

  // ==================== INPUTS ====================

  /**
   * Solicitudes a mostrar en el mapa
   * Recibidas desde el componente padre
   */
  @Input() solicitudes: ISolicitudMapa[] = [];

  /**
   * Búsqueda de ubicación
   */
  @Input() busquedaLocation: string = '';

  // ==================== OUTPUTS ====================

  /**
   * Emite cuando se hace clic en una solicitud del mapa
   */
  @Output() solicitudClick = new EventEmitter<number>();

  /**
   * Emite cuando hay un error
   */
  @Output() errorMapa = new EventEmitter<string>();

  // ==================== SIGNALS ====================

  private readonly _solicitudesInternas = signal<ISolicitudMapa[]>([]);

  // ==================== COMPUTED ====================

  readonly haySolicitudes = computed(() => this._solicitudesInternas().length > 0);

  // ==================== PROPIEDADES ====================

  private map!: L.Map;
  private markers: L.Marker[] = [];

  // ==================== EFFECTS ====================

  /**
   * Detecta cambios en el @Input solicitudes
   */
  private readonly solicitudesEffect = effect(() => {
    // Sincronizar input con signal interno
    this._solicitudesInternas.set(this.solicitudes);

    if (this.map && this.solicitudes.length > 0) {
      setTimeout(() => {
        this.agregarMarcadores();
      }, 100);
    }
  });

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this._solicitudesInternas.set(this.solicitudes);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.inicializarMapa();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Inicializa el mapa de Leaflet
   */
  private inicializarMapa(): void {
    try {
      this.map = L.map('volunteer-map', {
        center: [40.4168, -3.7038],
        zoom: 12,
        zoomControl: false,
        dragging: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.map.on('resize', () => {
        this.map.invalidateSize();
      });

      // Agregar marcadores si ya hay datos
      if (this.solicitudes.length > 0) {
        this.agregarMarcadores();
      }

    } catch (error) {
      console.error('Error inicializando mapa:', error);
      this.errorMapa.emit('Error al inicializar el mapa');
    }
  }

  /**
   * Añade marcadores al mapa
   */
  private agregarMarcadores(): void {
    // Limpiar marcadores anteriores
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    const bounds: L.LatLngTuple[] = [];

    this.solicitudes.forEach(solicitud => {
      const { latitud, longitud } = solicitud.ubicacion;
      const icono = this.mapService.crearIcono(solicitud.categoria);

      const marker = L.marker([latitud, longitud], { icon: icono })
        .addTo(this.map);

      const popupContent = this.crearPopupContent(solicitud);

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'solicitud-popup'
      });

      // Evento click en marcador
      marker.on('click', () => {
        this.solicitudClick.emit(solicitud.id);
      });

      this.markers.push(marker);
      bounds.push([latitud, longitud]);
    });

    // Ajustar vista para mostrar todos los marcadores
    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  /**
   * Crea contenido del popup
   */
  private crearPopupContent(solicitud: ISolicitudMapa): string {
    return `
      <div class="p-3 min-w-[200px] max-w-[280px]">
        <h3 class="text-lg font-bold text-gray-800 mb-2">
          ${this.escaparHTML(solicitud.titulo)}
        </h3>
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <span>📂</span>
            <span class="text-gray-600">${this.escaparHTML(solicitud.categoria)}</span>
          </div>
          <div class="flex items-center gap-2">
            <span>👤</span>
            <span class="text-gray-600">${this.escaparHTML(solicitud.solicitante.nombre)}</span>
          </div>
          <p class="text-gray-500 mt-2 text-xs">
            ${this.escaparHTML(solicitud.descripcion.substring(0, 80))}...
          </p>
        </div>
        <button
          onclick="document.dispatchEvent(new CustomEvent('aceptar-solicitud', {detail: ${solicitud.id}}))"
          class="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded text-sm transition"
        >
          Aceptar Solicitud
        </button>
      </div>
    `;
  }

  /**
   * Escapa HTML
   */
  private escaparHTML(texto: string): string {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Aumentar zoom
   */
  zoomIn(): void {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  /**
   * Disminuir zoom
   */
  zoomOut(): void {
    if (this.map) {
      this.map.zoomOut();
    }
  }

  /**
   * Centrar en ubicación del usuario
   */
  centrarEnMiUbicacion(): void {
    this.mapService.actualizarUbicacion().subscribe({
      next: (response) => {
        if (response.codigo === 0 && response.datos) {
          const { latitud, longitud } = response.datos;

          if (this.map) {
            this.map.setView([latitud, longitud], 14);

            // Añadir marcador del usuario
            const iconoUsuario = this.mapService.crearIconoUsuario();
            L.marker([latitud, longitud], { icon: iconoUsuario })
              .addTo(this.map)
              .bindPopup('<b>Tu ubicación</b>')
              .openPopup();
          }
        }
      },
      error: (err) => {
        console.error('Error obteniendo ubicación:', err);
        this.errorMapa.emit('No se pudo obtener tu ubicación');
      }
    });
  }

  /**
   * Centrar mapa en Madrid (reset)
   */
  centrarMapa(): void {
    if (this.map) {
      this.map.setView([40.4168, -3.7038], 12);
    }
  }
}
