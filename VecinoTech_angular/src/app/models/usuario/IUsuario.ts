export interface IUsuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  codigoPostal?: string;
  rol?: 'USER' | 'ADMIN';
  activo: boolean;
  fechaCreacion?: string; // ISO (opcional)
  avatarUrl?: string
  esVoluntario?: boolean;

  // OPCIONAL: Coordenadas (si las usas)
  latitud?: number;
  longitud?: number;
}
