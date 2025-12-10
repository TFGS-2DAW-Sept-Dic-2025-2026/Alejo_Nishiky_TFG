import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Services
import { RestPortalService } from './rest-portal.service';

// Models

import IRestMessage from '../models/IRestMessage';
import { ICrearValoracionRequest, IValoracion } from '../models/valoracion/IValoracion';

/**
 * Servicio especializado en lógica de negocio de valoraciones
 * Delega TODAS las peticiones HTTP a RestPortalService
 *
 * Responsabilidades:
 * ✅ Lógica de negocio (cálculos, validaciones)
 * ✅ Formateo de datos
 * ✅ Estadísticas y promedios
 * ❌ NO hace peticiones HTTP directas
 */
@Injectable({
  providedIn: 'root'
})
export class ValoracionesService {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly restPortal = inject(RestPortalService);

  // ==================== SIGNALS (estado reactivo) ====================

  /**
   * Signal para forzar recarga de valoraciones
   */
  private readonly _reloadTrigger = signal<number>(0);

  // ==================== HTTP DELEGADO A RestPortalService ====================

  /**
   * Crea una valoración
   * ✅ Delega a RestPortalService
   */
  crearValoracion(request: ICrearValoracionRequest): Observable<IRestMessage> {
    return this.restPortal.crearValoracion(request);
  }

  /**
   * Verifica si una solicitud ya fue valorada
   * ✅ Delega a RestPortalService
   */
  verificarSiYaValorada(solicitudId: number): Observable<IRestMessage> {
    return this.restPortal.verificarSiYaValorada(solicitudId);
  }

  /**
   * Obtiene valoraciones de un voluntario (con toSignal)
   * ✅ Delega a RestPortalService
   */
  obtenerValoracionesVoluntario(voluntarioId: number) {
    return this.restPortal.obtenerValoracionesVoluntario(voluntarioId);
  }

  /**
   * Obtiene valoración de una solicitud (con toSignal)
   * ✅ Delega a RestPortalService
   */
  obtenerValoracionSolicitud(solicitudId: number) {
    return this.restPortal.obtenerValoracionSolicitud(solicitudId);
  }

  /**
   * Obtiene promedio de valoraciones de un usuario
   * ✅ Delega a RestPortalService
   */
  obtenerPromedioValoraciones(usuarioId: number): Observable<IRestMessage> {
    return this.restPortal.obtenerPromedioValoraciones(usuarioId);
  }

  // ==================== LÓGICA DE NEGOCIO (SOLO AQUÍ) ====================

  /**
   * Calcula el promedio de valoraciones de un array
   * @param valoraciones Array de valoraciones
   * @returns Promedio redondeado a 1 decimal
   */
  calcularPromedioLocal(valoraciones: IValoracion[]): number {
    if (!valoraciones || valoraciones.length === 0) return 0;

    const suma = valoraciones.reduce((acc, v) => acc + v.puntuacion, 0);
    const promedio = suma / valoraciones.length;

    return Math.round(promedio * 10) / 10; // Redondear a 1 decimal
  }

  /**
   * Obtiene estadísticas detalladas de un conjunto de valoraciones
   * @param valoraciones Array de valoraciones
   * @returns Objeto con estadísticas
   */
  obtenerEstadisticas(valoraciones: IValoracion[]) {
    if (!valoraciones || valoraciones.length === 0) {
      return {
        total: 0,
        promedio: 0,
        excelentes: 0,
        buenas: 0,
        regulares: 0,
        malas: 0,
        distribucion: [0, 0, 0, 0, 0]
      };
    }

    // Contador por puntuación (1-5)
    const distribucion = [0, 0, 0, 0, 0];
    valoraciones.forEach(v => {
      if (v.puntuacion >= 1 && v.puntuacion <= 5) {
        distribucion[v.puntuacion - 1]++;
      }
    });

    return {
      total: valoraciones.length,
      promedio: this.calcularPromedioLocal(valoraciones),
      excelentes: valoraciones.filter(v => v.puntuacion === 5).length,
      buenas: valoraciones.filter(v => v.puntuacion === 4).length,
      regulares: valoraciones.filter(v => v.puntuacion === 3).length,
      malas: valoraciones.filter(v => v.puntuacion <= 2).length,
      distribucion // [cant_1_estrella, cant_2_estrellas, ...]
    };
  }

  /**
   * Obtiene el texto descriptivo de una puntuación
   * @param puntuacion Puntuación (1-5)
   * @returns Texto descriptivo
   */
  obtenerTextoValoracion(puntuacion: number): string {
    const textos: Record<number, string> = {
      1: '⭐ Muy mala',
      2: '⭐⭐ Mala',
      3: '⭐⭐⭐ Regular',
      4: '⭐⭐⭐⭐ Buena',
      5: '⭐⭐⭐⭐⭐ Excelente'
    };
    return textos[puntuacion] || '';
  }

  /**
   * Obtiene las estrellas en formato string
   * @param puntuacion Puntuación (1-5)
   * @returns String con estrellas (ej: "⭐⭐⭐⭐⭐")
   */
  obtenerEstrellas(puntuacion: number): string {
    return '⭐'.repeat(Math.max(0, Math.min(5, puntuacion)));
  }

  /**
   * Formatea la fecha de una valoración
   * @param fechaISO Fecha en formato ISO
   * @returns Fecha formateada (ej: "hace 2 días")
   */
  formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();

    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);

    if (años > 0) return `hace ${años} año${años > 1 ? 's' : ''}`;
    if (meses > 0) return `hace ${meses} mes${meses > 1 ? 'es' : ''}`;
    if (dias > 0) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (minutos > 0) return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    return 'hace unos segundos';
  }

  /**
   * Valida que una valoración tenga todos los campos requeridos
   * @param request Request de valoración
   * @returns true si es válida, false si no
   */
  validarValoracion(request: ICrearValoracionRequest): boolean {
    if (!request.solicitudId || request.solicitudId <= 0) return false;
    if (!request.puntuacion || request.puntuacion < 1 || request.puntuacion > 5) return false;
    return true;
  }

  /**
   * Ordena valoraciones por fecha (más recientes primero)
   * @param valoraciones Array de valoraciones
   * @returns Array ordenado
   */
  ordenarPorFecha(valoraciones: IValoracion[]): IValoracion[] {
    return [...valoraciones].sort((a, b) => {
      return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
    });
  }

  /**
   * Filtra valoraciones por puntuación mínima
   * @param valoraciones Array de valoraciones
   * @param puntuacionMinima Puntuación mínima (1-5)
   * @returns Array filtrado
   */
  filtrarPorPuntuacion(valoraciones: IValoracion[], puntuacionMinima: number): IValoracion[] {
    return valoraciones.filter(v => v.puntuacion >= puntuacionMinima);
  }

  /**
   * Obtiene las mejores valoraciones (4-5 estrellas)
   * @param valoraciones Array de valoraciones
   * @returns Array de valoraciones buenas/excelentes
   */
  obtenerMejoresValoraciones(valoraciones: IValoracion[]): IValoracion[] {
    return this.filtrarPorPuntuacion(valoraciones, 4);
  }

  /**
   * Obtiene las peores valoraciones (1-2 estrellas)
   * @param valoraciones Array de valoraciones
   * @returns Array de valoraciones malas
   */
  obtenerPeoresValoraciones(valoraciones: IValoracion[]): IValoracion[] {
    return valoraciones.filter(v => v.puntuacion <= 2);
  }

  /**
   * Calcula el porcentaje de valoraciones positivas
   * @param valoraciones Array de valoraciones
   * @returns Porcentaje (0-100)
   */
  calcularPorcentajePositivo(valoraciones: IValoracion[]): number {
    if (!valoraciones || valoraciones.length === 0) return 0;

    const positivas = valoraciones.filter(v => v.puntuacion >= 4).length;
    const porcentaje = (positivas / valoraciones.length) * 100;

    return Math.round(porcentaje);
  }

  /**
   * Fuerza recarga de datos (para casos específicos)
   */
  recargarDatos(): void {
    this._reloadTrigger.update(v => v + 1);
  }
}
