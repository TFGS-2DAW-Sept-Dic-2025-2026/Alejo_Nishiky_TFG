/**
 * Request para registro de usuario
 */
export interface IRegisterRequest {
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    codigoPostal?: string;
    pais?: string;
}
