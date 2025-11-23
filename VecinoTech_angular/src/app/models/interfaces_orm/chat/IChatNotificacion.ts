import { IMensaje } from './IMensaje';

export interface IChatNotificacion {
  tipo: 'solicitud-aceptada' | 'usuario-conectado' | 'nuevo-mensaje';
  solicitudId: number;
  usuarioId: number;
  usuarioNombre: string;
  mensaje?: IMensaje;
}
