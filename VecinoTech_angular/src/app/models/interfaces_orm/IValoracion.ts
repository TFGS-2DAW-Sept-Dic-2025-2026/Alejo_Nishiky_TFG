export interface IValoracion {
  id: number;
  solicitanteId: number;
  solicitanteNombre: string;
  voluntarioId: number;
  voluntarioNombre: string;
  solicitudId: number;
  puntuacion: number; // 1-5
  comentario?: string;
  fechaCreacion: string;
}

export interface ICrearValoracionRequest {
  solicitudId: number;
  puntuacion: number; // 1-5
  comentario?: string;
}
