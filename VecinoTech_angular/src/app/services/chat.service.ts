import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Models
import { IMensaje } from '../models/interfaces_orm/chat/IMensaje';
import { IChatNotificacion } from '../models/interfaces_orm/chat/IChatNotificacion';
import IRestMessage from '../models/IRestMessage';
import { StorageGlobalService } from './storage-global.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageGlobalService);

  // ==================== PROPIEDADES ====================

  private readonly API_URL = 'http://localhost:8080/api/portal/chat';
  private readonly WS_URL = 'http://localhost:8080/ws';

  private stompClient: Client | null = null;
  private chatSubscription: StompSubscription | null = null;
  private notificacionesSubscription: StompSubscription | null = null;

  // ==================== SIGNALS ====================

  private readonly _mensajes = signal<IMensaje[]>([]);
  private readonly _conectado = signal<boolean>(false);
  private readonly _usuarioConectado = signal<string>('');
  private readonly _notificaciones = signal<IChatNotificacion[]>([]);

  // Signals readonly
  readonly mensajes = this._mensajes.asReadonly();
  readonly conectado = this._conectado.asReadonly();
  readonly usuarioConectado = this._usuarioConectado.asReadonly();
  readonly notificaciones = this._notificaciones.asReadonly();

  // ==================== COMPUTED ====================

  readonly cantidadMensajes = computed(() => this._mensajes().length);
  readonly notificacionesSinLeer = computed(() =>
    this._notificaciones().filter(n => n.tipo === 'solicitud-aceptada').length
  );

  // ==================== WEBSOCKET ====================

  /**
   * Conecta al WebSocket
   */
  conectarWebSocket(): void {
    if (this.stompClient?.connected) {
      console.log('⚠️ WebSocket ya conectado');
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.WS_URL),
      debug: (str) => console.log('🔌 STOMP:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      console.log('✅ WebSocket conectado');
      this._conectado.set(true);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('❌ Error STOMP:', frame);
      this._conectado.set(false);
    };

    this.stompClient.activate();
  }

  /**
   * Desconecta del WebSocket
   */
  desconectarWebSocket(): void {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
      this.chatSubscription = null;
    }

    if (this.notificacionesSubscription) {
      this.notificacionesSubscription.unsubscribe();
      this.notificacionesSubscription = null;
    }

    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this._conectado.set(false);
      console.log('🔌 WebSocket desconectado');
    }
  }

  /**
   * Suscribe al chat de una solicitud específica
   */
  suscribirseAlChat(solicitudId: number): void {
    if (!this.stompClient?.connected) {
      console.error('❌ WebSocket no conectado');
      return;
    }

    // Desuscribirse del chat anterior si existe
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }

    // Suscribirse al canal del chat
    this.chatSubscription = this.stompClient.subscribe(
      `/topic/chat/${solicitudId}`,
      (message) => {
        const notificacion: IChatNotificacion = JSON.parse(message.body);
        console.log('📨 Notificación recibida:', notificacion);

        switch (notificacion.tipo) {
          case 'nuevo-mensaje':
            if (notificacion.mensaje) {
              this.agregarMensaje(notificacion.mensaje);
            }
            break;

          case 'usuario-conectado':
            this._usuarioConectado.set(notificacion.usuarioNombre);
            console.log(`👤 ${notificacion.usuarioNombre} se conectó al chat`);
            break;
        }
      }
    );

    console.log(`✅ Suscrito al chat de solicitud ${solicitudId}`);

    // Notificar conexión
    this.notificarConexion(solicitudId);
  }

  /**
   * Suscribe a notificaciones del usuario
   */
  suscribirseANotificaciones(): void {
    const usuario = this.storage.getUsuario();
    if (!usuario || !this.stompClient?.connected) {
      console.error('❌ No se puede suscribir a notificaciones');
      return;
    }

    // Desuscribirse anterior si existe
    if (this.notificacionesSubscription) {
      this.notificacionesSubscription.unsubscribe();
    }

    this.notificacionesSubscription = this.stompClient.subscribe(
      `/topic/notificaciones/${usuario.id}`,
      (message) => {
        const notificacion: IChatNotificacion = JSON.parse(message.body);
        console.log('🔔 Notificación personal recibida:', notificacion);

        // Añadir a la lista de notificaciones
        this._notificaciones.update(notifs => [...notifs, notificacion]);
      }
    );

    console.log(`🔔 Suscrito a notificaciones del usuario ${usuario.id}`);
  }

  /**
   * Notifica que el usuario se conectó al chat
   */
  private notificarConexion(solicitudId: number): void {
    if (!this.stompClient?.connected) return;

    this.stompClient.publish({
      destination: `/app/chat/${solicitudId}/conectar`,
      body: JSON.stringify({})
    });
  }

  // ==================== HTTP METHODS ====================

  /**
   * Carga el historial de mensajes
   */
  cargarHistorial(solicitudId: number): Observable<IRestMessage> {
    const headers = this.getAuthHeaders();
    return this.http.get<IRestMessage>(
      `${this.API_URL}/${solicitudId}/mensajes`,
      { headers }
    );
  }

  /**
   * Envía un mensaje (HTTP)
   */
  enviarMensaje(solicitudId: number, contenido: string): Observable<IRestMessage> {
    const headers = this.getAuthHeaders();
    return this.http.post<IRestMessage>(
      `${this.API_URL}/${solicitudId}/enviar`,
      { contenido },
      { headers }
    );
  }

  /**
   * Marca mensajes como leídos
   */
  marcarComoLeidos(solicitudId: number): Observable<IRestMessage> {
    const headers = this.getAuthHeaders();
    return this.http.post<IRestMessage>(
      `${this.API_URL}/${solicitudId}/leer`,
      {},
      { headers }
    );
  }

  // ==================== HELPERS ====================

  /**
   * Agrega un mensaje al signal
   */
  private agregarMensaje(mensaje: IMensaje): void {
    this._mensajes.update(mensajes => [...mensajes, mensaje]);
  }

  /**
   * Limpia los mensajes
   */
  limpiarMensajes(): void {
    this._mensajes.set([]);
  }

  /**
   * Establece mensajes (al cargar historial)
   */
  establecerMensajes(mensajes: IMensaje[]): void {
    this._mensajes.set(mensajes);
  }

  /**
   * Elimina una notificación
   */
  eliminarNotificacion(solicitudId: number): void {
    this._notificaciones.update(notifs =>
      notifs.filter(n => n.solicitudId !== solicitudId)
    );
  }

  /**
   * Obtiene headers con autenticación
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.storage.getAccessToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}
