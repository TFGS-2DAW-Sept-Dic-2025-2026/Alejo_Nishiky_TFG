import { Component, signal, computed, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { ValoracionesService } from '../../../services/valoraciones.service';

// Models
import { ICrearValoracionRequest } from '../../../models/valoracion/IValoracion';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-valoracion',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-valoracion.component.html',
  styleUrls: ['./modal-valoracion.component.css']
})
export class ModalValoracionComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly valoracionesService = inject(ValoracionesService);

  // ==================== INPUTS / OUTPUTS ====================

  @Input() isOpen: boolean = false;
  @Input() solicitudId!: number;
  @Input() voluntarioNombre!: string;

  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  // ==================== SIGNALS ====================

  readonly puntuacion = signal<number>(0);
  readonly puntuacionHover = signal<number>(0);
  readonly comentario = signal<string>('');
  readonly enviando = signal<boolean>(false);

  // ==================== COMPUTED ====================

  readonly formularioValido = computed(() => this.puntuacion() > 0);

  // ==================== MÉTODOS ====================

  /**
   * Establece la puntuación al hacer click
   */
  setPuntuacion(valor: number): void {
    this.puntuacion.set(valor);
  }

  /**
   * Establece la puntuación temporal al hacer hover
   */
  setHover(valor: number): void {
    this.puntuacionHover.set(valor);
  }

  /**
   * Limpia el hover
   */
  clearHover(): void {
    this.puntuacionHover.set(0);
  }

  /**
   * Determina si una estrella debe estar llena
   */
  isStarFilled(index: number): boolean {
    const hover = this.puntuacionHover();
    const puntos = this.puntuacion();
    return hover > 0 ? index <= hover : index <= puntos;
  }

  /**
   * Actualiza el comentario
   */
  actualizarComentario(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.comentario.set(textarea.value);
  }

  /**
   * Envía la valoración
   */
  enviarValoracion(): void {
    if (!this.formularioValido() || this.enviando()) return;

    this.enviando.set(true);

    const request: ICrearValoracionRequest = {
      solicitudId: this.solicitudId,
      puntuacion: this.puntuacion(),
      comentario: this.comentario().trim() || undefined
    };

    this.valoracionesService.crearValoracion(request).subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          console.log('Valoracion enviada!!!');
          this.success.emit();
          this.cerrar();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo enviar tu valoración',
            text: response.mensaje,
            confirmButtonText: 'Entendido'
          });
          this.enviando.set(false);
        }
      },
      error: (err) => {
        console.error('Error enviando valoración ... ', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar la valoración',
          text: 'Inténtalo de nuevo en unos minutos.',
          confirmButtonText: 'Entendido'
        });
        this.enviando.set(false);
      }
    });
  }

  /**
   * Obtiene texto descriptivo según la puntuación
   */
  obtenerTextoValoracion(puntos: number): string {
    const textos: Record<number, string> = {
      1: '⭐ Muy mala',
      2: '⭐⭐ Mala',
      3: '⭐⭐⭐ Regular',
      4: '⭐⭐⭐⭐ Buena',
      5: '⭐⭐⭐⭐⭐ Excelente'
    };
    return textos[puntos] || '';
  }

  /**
   * Omite la valoración
   */
  async omitir(): Promise<void> {
    const result = await Swal.fire({
      title: '¿Omitir valoración?',
      text: 'Podrás valorarla más tarde desde el historial.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, omitir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      this.cerrar();
    }
  }


  /**
   * Cierra el modal
   */
  cerrar(): void {
    // Reset
    this.puntuacion.set(0);
    this.puntuacionHover.set(0);
    this.comentario.set('');
    this.enviando.set(false);

    this.close.emit();
  }
}
