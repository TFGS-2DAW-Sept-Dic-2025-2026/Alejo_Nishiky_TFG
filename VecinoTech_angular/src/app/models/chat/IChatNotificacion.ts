import { IMensaje } from './IMensaje';

export interface IChatNotificacion {
  tipo: 'solicitud-aceptada' | 'usuario-conectado' | 'nuevo-mensaje' | 'usuario-desconectado' | 'chat-finalizado' | 'video-call-invite'; // ✅ AÑADIR 'chat-finalizado'
  solicitudId: number;
  usuarioId: number;
  usuarioNombre: string;
  mensaje?: IMensaje;

  // ✅ AÑADIR:
  videoRoomUrl?: string;
  videoRoomName?: string;
}
