/**
 * Diploma completo para el propietario
 */
export interface IDiploma {
  id: number;
  numeroCertificado: string;
  titulo: string;
  descripcion: string;

  // Info del voluntario
  nombreCompleto: string;
  emailVoluntario: string;

  // Estadísticas
  totalAyudas: number;
  fechaPrimeraAyuda: string; // ISO date
  fechaUltimaAyuda: string;  // ISO date

  // Emisión
  fechaEmision: string; // ISO datetime
  emitidoPor: string;

  // Verificación pública
  urlPublica: string;
  codigoVerificacion: string; // UUID

  // Estado
  activo: boolean;
}

/**
 * Elegibilidad para generar diploma
 */
export interface IDiplomaElegibilidad {
  esElegible: boolean;
  ayudasCompletadas: number;
  ayudasNecesarias: number;
  ayudasRestantes: number;
  tieneDiploma: boolean;
  diploma?: IDiploma;
}

/**
 * Diploma público (para verificación externa)
 * NO incluye email ni datos sensibles
 */
export interface IDiplomaPublico {
  numeroCertificado: string;
  titulo: string;
  descripcion: string;
  nombreCompleto: string;
  totalAyudas: number;
  fechaPrimeraAyuda: string;
  fechaUltimaAyuda: string;
  fechaEmision: string;
  emitidoPor: string;
  esValido: boolean;
}
