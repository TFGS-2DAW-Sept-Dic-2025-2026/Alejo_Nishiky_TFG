import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as L from 'leaflet';

// Services
import { RestPortalService } from './rest-portal.service';
import { StorageGlobalService } from './storage-global.service';

// Models
import IRestMessage from '../models/IRestMessage';

/**
 * Servicio especializado en lógica de Leaflet Maps
 * Delega TODAS las peticiones HTTP a RestPortalService
 *
 * Responsabilidades:
 * ✅ Crear iconos personalizados de Leaflet
 * ✅ Helpers de mapas (distancias, centrado, etc.)
 * ✅ Lógica de presentación de mapas
 * ❌ NO hace peticiones HTTP directas
 */
@Injectable({providedIn: 'root'})
export class MapService {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly restPortal = inject(RestPortalService);
  private readonly storage = inject(StorageGlobalService);

  // ==================== HTTP ESTA DELEGADO A RestPortalService ====================

  /**
   * Obtiene todas las solicitudes abiertas para el mapa
   * ✅ Delega a RestPortalService
   */
  getSolicitudesMapa(): Observable<IRestMessage> {
    return this.restPortal.getSolicitudesMapa();
  }

  /**
   * Obtiene solicitudes cercanas al usuario
   * ✅ Delega a RestPortalService
   */
  getSolicitudesCercanas(radiusKm: number = 5): Observable<IRestMessage> {
    return this.restPortal.getSolicitudesCercanas(radiusKm);
  }

  /**
   * Actualiza la ubicación del usuario (geocodificación)
   * ✅ Delega a RestPortalService
   */
  actualizarUbicacion(): Observable<IRestMessage> {
    return this.restPortal.actualizarUbicacion();
  }

  /**
   * Acepta una solicitud como voluntario
   * ✅ Delega a RestPortalService
   */
  aceptarSolicitud(solicitudId: number): Observable<IRestMessage> {
    return this.restPortal.aceptarSolicitud(solicitudId);
  }

  /**
   * Marca una solicitud como completada
   * ✅ Delega a RestPortalService
   */
  completarSolicitud(solicitudId: number): Observable<IRestMessage> {
    return this.restPortal.completarSolicitud(solicitudId);
  }

  /**
   * Obtiene las solicitudes creadas por el usuario
   * ✅ Delega a RestPortalService
   */
  getMisSolicitudes(): Observable<IRestMessage> {
    return this.restPortal.getMisSolicitudes();
  }

  /**
   * Obtiene las solicitudes donde el usuario es voluntario
   * ✅ Delega a RestPortalService
   */
  getSolicitudesComoVoluntario(): Observable<IRestMessage> {
    return this.restPortal.getSolicitudesComoVoluntario();
  }

  /**
   * Crea una nueva solicitud de ayuda
   * ✅ Delega a RestPortalService
   */
  crearSolicitud(solicitud: {
    asunto: string;
    descripcion: string;
    categoria: string
  }): Observable<IRestMessage> {
    return this.restPortal.crearSolicitud(solicitud);
  }

  // ==================== LÓGICA LEAFLET (SOLO AQUÍ) ====================

  /**
   * Crea un icono personalizado de Leaflet según la categoría
   * @param categoria Categoría de la solicitud (GENERAL, MOVIL, etc.)
   * @returns Icono de Leaflet personalizado
   */
  crearIcono(categoria: string): L.Icon {
    const colores: Record<string, string> = {
      'GENERAL': 'blue',
      'MOVIL': 'green',
      'ORDENADOR': 'orange',
      'TABLET': 'red',
      'SMART_TV': 'violet'
    };

    const color = colores[categoria] || 'blue';

    return L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  /**
   * Crea un icono para la ubicación del usuario
   * @returns Icono dorado de Leaflet
   */
  crearIconoUsuario(): L.Icon {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  /**
   * Calcula la distancia entre dos puntos geográficos (Haversine)
   * @param lat1 Latitud del primer punto
   * @param lon1 Longitud del primer punto
   * @param lat2 Latitud del segundo punto
   * @param lon2 Longitud del segundo punto
   * @returns Distancia en kilómetros
   */
  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;

    return Math.round(distancia * 10) / 10; // Redondear a 1 decimal
  }

  /**
   * Convierte grados a radianes
   * @param grados Ángulo en grados
   * @returns Ángulo en radianes
   */
  private toRad(grados: number): number {
    return grados * (Math.PI / 180);
  }

  /**
   * Centra el mapa en una ubicación específica
   * @param mapa Instancia del mapa de Leaflet
   * @param lat Latitud
   * @param lng Longitud
   * @param zoom Nivel de zoom (default: 13)
   */
  centrarMapa(mapa: L.Map, lat: number, lng: number, zoom: number = 13): void {
    mapa.setView([lat, lng], zoom);
  }

  /**
   * Ajusta el mapa para mostrar todos los marcadores
   * @param mapa Instancia del mapa de Leaflet
   * @param marcadores Array de marcadores
   */
  ajustarVistaAMarcadores(mapa: L.Map, marcadores: L.Marker[]): void {
    if (marcadores.length === 0) return;

    const grupo = L.featureGroup(marcadores);
    mapa.fitBounds(grupo.getBounds().pad(0.1)); // 10% padding
  }

  /**
   * Formatea la distancia para mostrarla de forma legible
   * @param distanciaKm Distancia en kilómetros
   * @returns String formateado (ej: "1.5 km", "850 m")
   */
  formatearDistancia(distanciaKm: number): string {
    if (distanciaKm < 1) {
      const metros = Math.round(distanciaKm * 1000);
      return `${metros} m`;
    }
    return `${distanciaKm.toFixed(1)} km`;
  }

  // ==================== HELPERS PRIVADOS ====================

  /**
   * Obtiene el usuario actual desde el storage
   */
  private getUsuarioActual() {
    return this.storage.getUsuario();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  private isAuthenticated(): boolean {
    return this.storage.getAccessToken() !== null;
  }
}
