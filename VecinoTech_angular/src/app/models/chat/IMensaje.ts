export interface IMensaje {
  id: number;
  solicitudId: number;
  remitenteId: number;
  remitenteNombre: string;
  contenido: string;
  fechaEnvio: string; // ISO 8601
  leido: boolean;
}
