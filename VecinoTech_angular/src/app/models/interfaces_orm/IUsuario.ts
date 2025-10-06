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
}
