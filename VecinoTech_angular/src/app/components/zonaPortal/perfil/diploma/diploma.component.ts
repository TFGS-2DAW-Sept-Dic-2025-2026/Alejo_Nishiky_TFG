import { Component, signal, computed, inject, effect, Injector, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { DiplomaService } from '../../../../services/diploma.service';
import { AuthService } from '../../../../services/auth.service';
import { IDiploma, IDiplomaElegibilidad } from '../../../../models/diploma/IDiploma';
import IRestMessage from '../../../../models/IRestMessage';

// Servicios


// Models


@Component({
  selector: 'app-diploma',
  imports: [CommonModule],
  templateUrl: './diploma.component.html',
  styleUrl: './diploma.component.css'
})
export class DiplomaComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly diplomaService = inject(DiplomaService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  // ==================== VIEW CHILD ====================

  readonly diplomaElementRef = viewChild<ElementRef>('diplomaElement');

  // ==================== SIGNALS ====================

  private readonly _elegibilidad = signal<IDiplomaElegibilidad | null>(null);
  private readonly _diploma = signal<IDiploma | null>(null);
  private readonly _loading = signal<boolean>(true);
  private readonly _generando = signal<boolean>(false);
  private readonly _descargando = signal<boolean>(false);

  // ==================== COMPUTED SIGNALS ====================

  readonly elegibilidad = computed(() => this._elegibilidad());
  readonly diploma = computed(() => this._diploma());
  readonly loading = computed(() => this._loading());
  readonly generando = computed(() => this._generando());
  readonly descargando = computed(() => this._descargando());

  /**
   * Usuario actual
   */
  readonly usuario = computed(() => this.authService.currentUser());

  /**
   * Progreso hacia el diploma (0-100)
   */
  readonly progreso = computed(() => {
    const elegibilidad = this._elegibilidad();
    if (!elegibilidad) return 0;
    return this.diplomaService.calcularProgreso(
      elegibilidad.ayudasCompletadas,
      elegibilidad.ayudasNecesarias
    );
  });

  /**
   * Color del progreso
   */
  readonly colorProgreso = computed(() => {
    return this.diplomaService.getColorProgreso(this.progreso());
  });

  /**
   * Mensaje motivacional
   */
  readonly mensajeMotivacional = computed(() => {
    const elegibilidad = this._elegibilidad();
    if (!elegibilidad) return '';
    return this.diplomaService.getMensajeMotivacional(elegibilidad.ayudasRestantes);
  });

  /**
   * Fecha de emisión formateada
   */
  readonly fechaEmisionFormateada = computed(() => {
    const diploma = this._diploma();
    if (!diploma) return '';
    return this.diplomaService.formatearFechaLarga(diploma.fechaEmision);
  });

  /**
   * Duración del voluntariado
   */
  readonly duracionVoluntariado = computed(() => {
    const diploma = this._diploma();
    if (!diploma) return '';
    return this.diplomaService.calcularDuracion(
      diploma.fechaPrimeraAyuda,
      diploma.fechaUltimaAyuda
    );
  });

  // ==================== CONSTRUCTOR ====================

  constructor() {
    this.cargarElegibilidad();

    /**
     * Effect: Si el usuario ya tiene diploma, cargarlo automáticamente
     */
    effect(() => {
      const elegibilidad = this._elegibilidad();

      if (elegibilidad?.tieneDiploma && elegibilidad.diploma) {
        this._diploma.set(elegibilidad.diploma);
      }
    }, { injector: this.injector });
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Carga la elegibilidad del usuario
   */
  private cargarElegibilidad(): void {
    this._loading.set(true);

    this.diplomaService.verificarElegibilidad().subscribe({
      next: (response: IRestMessage) => {
        this._loading.set(false);

        if (response.codigo === 0) {
          const elegibilidad = response.datos as IDiplomaElegibilidad;
          this._elegibilidad.set(elegibilidad);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al cargar información',
            text: response.mensaje,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3b82f6'
          });
        }
      },
      error: (error) => {
        this._loading.set(false);
        console.error('❌ Error cargando elegibilidad:', error);

        Swal.fire({
          icon: 'error',
          title: 'Error al cargar',
          text: 'No se pudo verificar tu elegibilidad',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3b82f6'
        });
      }
    });
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Genera el diploma
   */
  generarDiploma(): void {
    const elegibilidad = this._elegibilidad();

    if (!elegibilidad?.esElegible) {
      Swal.fire({
        icon: 'warning',
        title: 'No eres elegible',
        text: `Necesitas completar ${elegibilidad?.ayudasRestantes || 50} ayudas más`,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    Swal.fire({
      icon: 'question',
      title: '¿Generar tu Diploma?',
      html: `
        <p class="mb-2">Estás a punto de generar tu diploma oficial de VecinoTech.</p>
        <p class="text-sm text-gray-600">Has completado <strong>${elegibilidad.ayudasCompletadas}</strong> ayudas en tu comunidad.</p>
      `,
      showCancelButton: true,
      confirmButtonText: '🎓 Sí, generar diploma',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this._generando.set(true);

      this.diplomaService.generarDiploma().subscribe({
        next: (response: IRestMessage) => {
          this._generando.set(false);

          if (response.codigo === 0) {
            const diploma = response.datos as IDiploma;
            this._diploma.set(diploma);

            // Actualizar elegibilidad
            if (elegibilidad) {
              elegibilidad.tieneDiploma = true;
              elegibilidad.diploma = diploma;
              this._elegibilidad.set(elegibilidad);
            }

            Swal.fire({
              icon: 'success',
              title: '¡Diploma Generado! 🎉',
              html: `
                <p class="mb-2">Tu diploma ha sido generado exitosamente.</p>
                <p class="text-sm text-gray-600">Certificado: <strong>${diploma.numeroCertificado}</strong></p>
              `,
              confirmButtonText: 'Ver mi diploma',
              confirmButtonColor: '#10b981',
              timer: 3000,
              timerProgressBar: true
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al generar diploma',
              text: response.mensaje,
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#3b82f6'
            });
          }
        },
        error: (error) => {
          this._generando.set(false);
          console.error('❌ Error generando diploma:', error);

          Swal.fire({
            icon: 'error',
            title: 'Error al generar',
            text: 'No se pudo generar tu diploma',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3b82f6'
          });
        }
      });
    });
  }

  /**
   * Descarga el diploma como PDF
   */
  async descargarPDF(): Promise<void> {
    const elemento = this.diplomaElementRef()?.nativeElement;
    if (!elemento) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo encontrar el elemento del diploma',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const diploma = this._diploma();
    if (!diploma) return;

    this._descargando.set(true);

    try {
      await this.diplomaService.descargarComoPDF(
        elemento,
        `diploma-${diploma.numeroCertificado}`
      );

      Swal.fire({
        icon: 'success',
        title: '¡Descarga exitosa!',
        text: 'Tu diploma se ha descargado como PDF',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('❌ Error descargando PDF:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error al descargar',
        text: 'No se pudo descargar el PDF',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      this._descargando.set(false);
    }
  }

  /**
   * Descarga el diploma como imagen PNG
   */
  async descargarImagen(): Promise<void> {
    const elemento = this.diplomaElementRef()?.nativeElement;
    if (!elemento) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo encontrar el elemento del diploma',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const diploma = this._diploma();
    if (!diploma) return;

    this._descargando.set(true);

    try {
      await this.diplomaService.descargarComoImagen(
        elemento,
        `diploma-${diploma.numeroCertificado}`
      );

      Swal.fire({
        icon: 'success',
        title: '¡Descarga exitosa!',
        text: 'Tu diploma se ha descargado como imagen',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('❌ Error descargando imagen:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error al descargar',
        text: 'No se pudo descargar la imagen',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      this._descargando.set(false);
    }
  }

  /**
   * Imprime el diploma
   */
  imprimirDiploma(): void {
    this.diplomaService.imprimirDiploma();
  }

  /**
   * Copia la URL pública al portapapeles
   */
  async copiarUrlPublica(): Promise<void> {
    const diploma = this._diploma();
    if (!diploma) return;

    const url = this.diplomaService.generarUrlVerificacion(diploma.codigoVerificacion);
    const copiado = await this.diplomaService.copiarAlPortapapeles(url);

    if (copiado) {
      Swal.fire({
        icon: 'success',
        title: '¡Copiado!',
        text: 'La URL se ha copiado al portapapeles',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo copiar la URL',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3b82f6'
      });
    }
  }

  /**
   * Volver al perfil
   */
  volverPerfil(): void {
    this.router.navigate(['/portal/perfil']);
  }
}
