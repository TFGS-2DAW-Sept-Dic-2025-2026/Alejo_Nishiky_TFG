import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageGlobalService } from './storage-global.service';
import { Observable } from 'rxjs';
import IRestMessage from '../models/IRestMessage';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private readonly API_URL = 'http://localhost:8080/api/portal';

  constructor(private http: HttpClient, private storage: StorageGlobalService) { }

  //Obtenemos el token de autentcacion usando SotrageGlobalService
  private getAuthHeaders(): HttpHeaders {
    const token = this.storage.getAccessToken();
    if(!token){
      throw new Error('No hay token de autenticacion majo!!!!!');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * * Obtiene todas las solicitudes abiertas para el mapa *
   * !Endpoint: GET /api/portal/solicitudes/mapa
   */
  getSolicitudesMapa(): Observable<IRestMessage> {
    return this.http.get<IRestMessage>(
      `${this.API_URL}/solicitudes/mapa`,
      { headers: this.getAuthHeaders() }
    );
  }

    /**
   * * Obtiene solicitudes cercanas al usuario *
   * !Endpoint: GET /api/portal/solicitudes/cercanas?radius={km}
   * @param radiusKm Radio de búsqueda en kilómetros (default: 5)
   */
  getSolicitudesCercanas(radiusKm: number = 5): Observable<IRestMessage> {
    return this.http.get<IRestMessage>(
      `${this.API_URL}/solicitudes/cercanas?radius=${radiusKm}`,
      { headers: this.getAuthHeaders() }
    );
  }

    /**
   * * Actualiza la ubicación del usuario geocodificando su dirección *
   * !Endpoint: POST /api/portal/ubicacion/actualizar
   *
   * En el backend:
   * 1. Lee la dirección del usuario_detalle
   * 2. Geocodifica usando Nominatim
   * 3. Guarda las coordenadas en PostGIS
   */
  actualizarUbicacion(): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      `${this.API_URL}/ubicacion/actualizar`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * * Acepta una solicitud como voluntario *
   * !Endpoint: POST /api/portal/solicitudes/{id}/aceptar
   * @param solicitudId ID de la solicitud a aceptar
   */
  aceptarSolicitud(solicitudId: number): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      `${this.API_URL}/solicitudes/${solicitudId}/aceptar`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * * Marca una solicitud como completada *
   * !Endpoint: POST /api/portal/solicitudes/{id}/completar
   * @param solicitudId ID de la solicitud a completar
   */
  completarSolicitud(solicitudId: number): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      `${this.API_URL}/solicitudes/${solicitudId}/completar`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // *==================== MÉTODOS DE LEAFLET ====================*
    /**
   * Crea un icono personalizado de Leaflet según la categoría
   * @param categoria Categoría de la solicitud (GENERAL, MOVIL, etc.)
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
   * ?Obtenemos la información del usuario autenticado desde el StorageGlobalService
   * * Reactivo: Se actualiza automáticamente con Signals *
   */
  private getUsuarioActual() {
    return this.storage.getUsuario();
  }

  /**
   * * Verifica si el usuario está autenticado - Usa Signals *
   */
  private isAuthenticated(): boolean {
    return this.storage.getAccessToken() !== null;
  }

  /**
 * Obtiene las solicitudes creadas por el usuario autenticado
 * Endpoint: GET /api/portal/mis-solicitudes
 */
  getMisSolicitudes(): Observable<IRestMessage> {
    return this.http.get<IRestMessage>(
      `${this.API_URL}/mis-solicitudes`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Obtiene las solicitudes donde el usuario es voluntario
   * Endpoint: GET /api/portal/solicitudes/voluntario
   */
  getSolicitudesComoVoluntario(): Observable<IRestMessage> {
    return this.http.get<IRestMessage>(
      `${this.API_URL}/solicitudes/voluntario`,
      { headers: this.getAuthHeaders() }
    );
  }


}
