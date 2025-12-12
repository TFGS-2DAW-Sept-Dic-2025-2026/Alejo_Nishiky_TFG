import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

// Services
import { RestPortalService } from './rest-portal.service';

// Models
import IRestMessage from '../models/IRestMessage';
import { IDiploma, IDiplomaElegibilidad, IDiplomaPublico } from '../models/diploma/IDiploma';

/**
 * Servicio especializado en lógica de negocio de diplomas
 * Delega TODAS las peticiones HTTP a RestPortalService
 *
 * Responsabilidades:
 * ✅ Lógica de negocio (formateo, validaciones)
 * ✅ Helpers para descargar PDF
 * ✅ Formateo de fechas
 * ❌ NO hace peticiones HTTP directas
 */
@Injectable({
  providedIn: 'root'
})
export class DiplomaService {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly restPortal = inject(RestPortalService);

  // ==================== SIGNALS (estado reactivo) ====================

  /**
   * Signal para cachear la elegibilidad (evitar múltiples peticiones)
   */
  private readonly _elegibilidadCache = signal<IDiplomaElegibilidad | null>(null);

  // ==================== HTTP DELEGADO A RestPortalService ====================

  /**
   * Verifica si el usuario actual es elegible para diploma
   * ✅ Delega a RestPortalService
   */
  verificarElegibilidad(): Observable<IRestMessage> {
    return this.restPortal.verificarElegibilidadDiploma();
  }

  /**
   * Genera un diploma para el usuario actual
   * ✅ Delega a RestPortalService
   */
  generarDiploma(): Observable<IRestMessage> {
    return this.restPortal.generarDiploma();
  }

  /**
   * Obtiene el diploma del usuario actual
   * ✅ Delega a RestPortalService
   */
  obtenerMiDiploma(): Observable<IRestMessage> {
    return this.restPortal.obtenerMiDiploma();
  }

  /**
   * Verifica un diploma público por código de verificación
   * ✅ Delega a RestPortalService
   *
   * @param codigoVerificacion UUID del diploma
   */
  verificarDiplomaPublico(codigoVerificacion: string): Observable<IRestMessage> {
    return this.restPortal.verificarDiplomaPublico(codigoVerificacion);
  }

  // ==================== LÓGICA DE NEGOCIO (SOLO AQUÍ) ====================

  /**
   * Calcula el progreso hacia el diploma
   * @param ayudasCompletadas Ayudas completadas
   * @param ayudasNecesarias Ayudas necesarias (normalmente 50)
   * @returns Porcentaje (0-100)
   */
  calcularProgreso(ayudasCompletadas: number, ayudasNecesarias: number): number {
    if (ayudasNecesarias === 0) return 0;
    const progreso = (ayudasCompletadas / ayudasNecesarias) * 100;
    return Math.min(100, Math.round(progreso));
  }

  /**
   * Determina el color del progreso según el porcentaje
   * @param progreso Porcentaje (0-100)
   * @returns Clase Tailwind para el color
   */
  getColorProgreso(progreso: number): string {
    if (progreso >= 100) return 'bg-green-500';
    if (progreso >= 75) return 'bg-blue-500';
    if (progreso >= 50) return 'bg-yellow-500';
    if (progreso >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  }

  /**
   * Formatea una fecha ISO a formato legible
   * @param fechaISO Fecha en formato ISO
   * @returns Fecha formateada (ej: "10 de Diciembre, 2024")
   */
  formatearFechaLarga(fechaISO: string): string {
    if (!fechaISO) return 'Fecha no disponible';

    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatea una fecha ISO a formato corto
   * @param fechaISO Fecha en formato ISO
   * @returns Fecha formateada (ej: "10/12/2024")
   */
  formatearFechaCorta(fechaISO: string): string {
    if (!fechaISO) return 'N/A';

    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Calcula la duración entre dos fechas
   * @param fechaInicio Fecha inicial ISO
   * @param fechaFin Fecha final ISO
   * @returns Texto descriptivo (ej: "3 meses")
   */
  calcularDuracion(fechaInicio: string, fechaFin: string): string {
    if (!fechaInicio || !fechaFin) return 'Duración desconocida';

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - inicio.getTime();

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);

    if (años > 0) return `${años} año${años > 1 ? 's' : ''}`;
    if (meses > 0) return `${meses} mes${meses > 1 ? 'es' : ''}`;
    if (dias > 0) return `${dias} día${dias > 1 ? 's' : ''}`;
    return 'Menos de 1 día';
  }

  /**
   * Obtiene mensaje motivacional según el progreso
   * @param ayudasRestantes Ayudas que faltan
   * @returns Mensaje motivacional
   */
  getMensajeMotivacional(ayudasRestantes: number): string {
    if (ayudasRestantes === 0) {
      return '¡Felicidades! Ya puedes generar tu diploma';
    }
    if (ayudasRestantes === 1) {
      return '¡Solo falta 1 ayuda más! 🎉';
    }
    if (ayudasRestantes <= 5) {
      return `¡Casi lo logras! Solo ${ayudasRestantes} ayudas más 💪`;
    }
    if (ayudasRestantes <= 10) {
      return `¡Vas muy bien! Faltan ${ayudasRestantes} ayudas 🚀`;
    }
    return `Sigue así, faltan ${ayudasRestantes} ayudas para tu diploma 📚`;
  }

  /**
   * Valida que un código de verificación tenga formato UUID
   * @param codigo Código a validar
   * @returns true si es un UUID válido
   */
  validarCodigoVerificacion(codigo: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(codigo);
  }

  /**
   * Genera la URL completa de verificación pública
   * @param codigoVerificacion UUID del diploma
   * @returns URL completa
   */
  generarUrlVerificacion(codigoVerificacion: string): string {
    return `${window.location.origin}/diplomas/verify/${codigoVerificacion}`;
  }

  /**
   * Copia texto al portapapeles
   * @param texto Texto a copiar
   * @returns Promise que se resuelve cuando se copia
   */
  async copiarAlPortapapeles(texto: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      return false;
    }
  }

  /**
   * Descarga el diploma como imagen PNG
   * (Requiere html2canvas - instalado aparte)
   *
   * @param elementoHTML Elemento HTML del diploma
   * @param nombreArchivo Nombre del archivo (sin extensión)
   */
  async descargarComoImagen(elementoHTML: HTMLElement, nombreArchivo: string): Promise<void> {
    try {
      // Importación dinámica de html2canvas
      const html2canvas = (await import('html2canvas')).default;

      // Opciones compatibles con html2canvas v1.4.1
      const canvas = await html2canvas(elementoHTML, {
        useCORS: true,
        allowTaint: false,
        width: elementoHTML.scrollWidth,
        height: elementoHTML.scrollHeight
      } as any); // Usamos 'as any' para evitar problemas con tipos

      // Convertir a blob y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${nombreArchivo}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error descargando imagen:', error);
      throw error;
    }
  }

  /**
   * Descarga el diploma como PDF
   * (Requiere jsPDF - instalado aparte)
   *
   * @param elementoHTML Elemento HTML del diploma
   * @param nombreArchivo Nombre del archivo (sin extensión)
   */
  async descargarComoPDF(elementoHTML: HTMLElement, nombreArchivo: string): Promise<void> {
    try {
      // Importación dinámica de jsPDF y html2canvas
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      // Opciones compatibles con html2canvas v1.4.1
      const canvas = await html2canvas(elementoHTML, {
        useCORS: true,
        allowTaint: false,
        width: elementoHTML.scrollWidth,
        height: elementoHTML.scrollHeight
      } as any); // Usamos 'as any' para evitar problemas con tipos

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${nombreArchivo}.pdf`);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      throw error;
    }
  }

  /**
   * Imprime el diploma
   */
  imprimirDiploma(): void {
    window.print();
  }

  /**
   * Limpia el cache de elegibilidad (útil después de generar diploma)
   */
  limpiarCache(): void {
    this._elegibilidadCache.set(null);
  }
}
