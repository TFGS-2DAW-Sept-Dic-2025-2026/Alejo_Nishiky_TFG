import { inject, Injectable, Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, Observable, of, startWith } from 'rxjs';

// Models
import IRestMessage from '../models/IRestMessage';
import { IPortalLeader } from '../models/portal/IPortalLeader';
import { INeedHelpRequest } from '../models/solicitud/INeedHelpRequest';
import { ICrearValoracionRequest } from '../models/valoracion/IValoracion';

/**
 * Servicio HTTP para TODOS los endpoints de /api/portal
 * Siguiendo el patrón de Pablo: servicios HTTP por zona
 */
@Injectable({providedIn: 'root'})
export class RestPortalService {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);

  // ==================== CONFIGURACIÓN ====================

  private readonly BASE_URL = 'http://localhost:8080/api/portal';
  private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  // ==================== LEADERBOARD ====================

  /**
   * Obtiene el ranking de voluntarios (con toSignal)
   * GET /api/portal/leaderboard
   */
  public getLeaderboard() {
    return toSignal(
      this.http.get<IRestMessage>(`${this.BASE_URL}/leaderboard`)
        .pipe(
          catchError((e: HttpErrorResponse) => of<IRestMessage>({
            codigo: e.status || 500,
            mensaje: e.error?.mensaje || 'No se pudo cargar el ranking',
            datos: []
          })),
          startWith({ codigo: 100, mensaje: 'Cargando ranking...', datos: [] })
        ),
      { injector: this.injector, requireSync: true }
    );
  }

  // ==================== VOLUNTARIO ====================

  /**
   * Activar/desactivar rol de voluntario (con toSignal)
   * POST /api/portal/volunteer
   */
  public postVolunteer() {
    return toSignal(
      this.http.post<IRestMessage>(
        `${this.BASE_URL}/volunteer`,
        {},
        { headers: this.headers }
      ).pipe(
        catchError((e: HttpErrorResponse) => of<IRestMessage>({
          codigo: e.status || 500,
          mensaje: e.error?.mensaje || 'No se pudo registrar voluntariado',
          datos: { ok: false }
        })),
        startWith({ codigo: 100, mensaje: 'Enviando...', datos: { ok: false } })
      ),
      { injector: this.injector, requireSync: true }
    );
  }

  // ==================== SOLICITUDES ====================

  /**
   * Crear solicitud de ayuda (legacy - con message)
   * POST /api/portal/need-help
   * @deprecated Usar crearSolicitud() con INeedHelpRequest
   */
  public postNeedHelp(message?: string) {
    return toSignal(
      this.http.post<IRestMessage>(
        `${this.BASE_URL}/need-help`,
        { message },
        { headers: this.headers }
      ).pipe(
        catchError((e: HttpErrorResponse) => of<IRestMessage>({
          codigo: e.status || 500,
          mensaje: e.error?.mensaje || 'No se pudo crear solicitud de ayuda',
          datos: { ticketId: '' }
        })),
        startWith({ codigo: 100, mensaje: 'Enviando...', datos: { ticketId: '' } })
      ),
      { injector: this.injector, requireSync: true }
    );
  }

  /**
   * Crear solicitud de ayuda (tipado)
   * POST /api/portal/need-help
   */
  public crearSolicitud(solicitud: INeedHelpRequest): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      `${this.BASE_URL}/need-help`,
      solicitud,
      { headers: this.headers }
    );
  }

  /**
   * Obtener todas las solicitudes para el mapa
   * GET /api/portal/solicitudes/mapa
   */
  public getSolicitudesMapa(): Observable<IRestMessage> {
    return this.http.get<IRestMessage>(
      `${this.BASE_URL}/solicitudes/mapa`
    );
  }

  /**
   * Obtener solicitudes cercanas al usuario
   * GET /api/portal/solicitudes/cercanas?radius={km}
   */
  public getSolicitudesCercanas(radiusKm: number = 5): Observable<IRestMessage> {
    return this.http.get<IRestMessage>(
      `${this.BASE_URL}/solicitudes/cercanas?radius=${radiusKm}`
    );
  }

  /**
   * Contar solicitudes cercanas
   * GET /api/portal/solicitudes/contar-cercanas?radius={km}
   */
  public contarSolicitudesCercanas(radiusKm: number = 5): Observable<IRestMessage> {
    return this.http.get<IRestMessage>(
      `${this.BASE_URL}/solicitudes/contar-cercanas?radius=${radiusKm}`
    );
  }

  /**
   * Obtener mis solicitudes (como solicitante)
   * GET /api/portal/mis-solicitudes
   */
  public getMisSolicitudes(): Observable<IRestMessage> {
    return this.http.get<IRestMessage>(
      `${this.BASE_URL}/mis-solicitudes`
    );
  }

  /**
   * Obtener solicitudes donde soy voluntario
   * GET /api/portal/solicitudes/voluntario
   */
  public getSolicitudesComoVoluntario(): Observable<IRestMessage> {
    return this.http.get<IRestMessage>(
      `${this.BASE_URL}/solicitudes/voluntario`
    );
  }

  /**
   * Aceptar una solicitud como voluntario
   * POST /api/portal/solicitudes/{id}/aceptar
   */
  public aceptarSolicitud(solicitudId: number): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      `${this.BASE_URL}/solicitudes/${solicitudId}/aceptar`,
      {}
    );
  }

  /**
   * Completar/cerrar una solicitud
   * POST /api/portal/solicitudes/{id}/completar
   */
  public completarSolicitud(solicitudId: number): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      `${this.BASE_URL}/solicitudes/${solicitudId}/completar`,
      {}
    );
  }

  /**
   * Completar/cerrar una solicitud (PUT - alternativa)
   * PUT /api/portal/solicitudes/{id}/completar
   */
  public completarSolicitudPUT(solicitudId: number): Observable<IRestMessage> {
    return this.http.put<IRestMessage>(
      `${this.BASE_URL}/solicitudes/${solicitudId}/completar`,
      {}
    );
  }

  // ==================== UBICACIÓN ====================

  /**
   * Actualizar ubicación del usuario (geocodificación)
   * POST /api/portal/ubicacion/actualizar
   */
  public actualizarUbicacion(): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      `${this.BASE_URL}/ubicacion/actualizar`,
      {}
    );
  }

  // ==================== PERFIL ====================

  /**
   * Actualizar perfil del usuario
   * PUT /api/portal/perfil
   */
  public putActualizarPerfil(datos: {
    nombre: string;
    avatarUrl?: string;
    telefono?: string;
    direccion?: string;
    codigoPostal?: string;
  }): Observable<IRestMessage> {
    return this.http.put<IRestMessage>(
      `${this.BASE_URL}/perfil`,
      datos,
      { headers: this.headers }
    );
  }

  /**
   * Subir avatar del usuario
   * POST /api/portal/perfil/avatar
   */
  public subirAvatar(formData: FormData): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      `${this.BASE_URL}/perfil/avatar`,
      formData
      // No enviar Content-Type para FormData
    );
  }

  // ==================== VALORACIONES ====================

  /**
   * Crear valoración
   * POST /api/portal/valoraciones
   */
  public crearValoracion(request: ICrearValoracionRequest): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      `${this.BASE_URL}/valoraciones`,
      request,
      { headers: this.headers }
    );
  }

  /**
   * Verificar si una solicitud ya fue valorada
   * GET /api/portal/valoraciones/verificar/{solicitudId}
   */
  public verificarSiYaValorada(solicitudId: number): Observable<IRestMessage> {
    return this.http.get<IRestMessage>(
      `${this.BASE_URL}/valoraciones/verificar/${solicitudId}`
    );
  }

  /**
   * Obtener valoraciones de un voluntario (con toSignal)
   * GET /api/portal/valoraciones/voluntario/{voluntarioId}
   */
  public obtenerValoracionesVoluntario(voluntarioId: number) {
    return toSignal(
      this.http.get<IRestMessage>(
        `${this.BASE_URL}/valoraciones/voluntario/${voluntarioId}`
      ),
      {
        initialValue: {
          codigo: 100,
          mensaje: 'Cargando valoraciones...',
          datos: []
        },
        injector: this.injector
      }
    );
  }

  /**
   * Obtener valoración de una solicitud (con toSignal)
   * GET /api/portal/valoraciones/solicitud/{solicitudId}
   */
  public obtenerValoracionSolicitud(solicitudId: number) {
    return toSignal(
      this.http.get<IRestMessage>(
        `${this.BASE_URL}/valoraciones/solicitud/${solicitudId}`
      ),
      {
        initialValue: {
          codigo: 100,
          mensaje: 'Cargando valoración...',
          datos: null
        },
        injector: this.injector
      }
    );
  }

  /**
   * Obtener promedio de valoraciones de un usuario
   * GET /api/portal/valoraciones/usuario/{usuarioId}/promedio
   */
  public obtenerPromedioValoraciones(usuarioId: number): Observable<IRestMessage> {
    return this.http.get<IRestMessage>(
      `${this.BASE_URL}/valoraciones/usuario/${usuarioId}/promedio`
    );
  }

  // ==================== CHAT ====================

  /**
   * Enviar mensaje en el chat
   * POST /api/chat/enviar
   */
  public enviarMensaje(request: {
    solicitudId: number;
    contenido: string;
  }): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      'http://localhost:8080/api/chat/enviar',
      request,
      { headers: this.headers }
    );
  }

  /**
   * Obtener mensajes de un chat
   * GET /api/chat/mensajes/{solicitudId}
   */
  public obtenerMensajes(solicitudId: number): Observable<IRestMessage> {
    return this.http.get<IRestMessage>(
      `http://localhost:8080/api/chat/mensajes/${solicitudId}`
    );
  }
}
