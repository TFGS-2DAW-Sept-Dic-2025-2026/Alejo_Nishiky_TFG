import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DiplomaService } from '../../../../services/diploma.service';
import { IDiplomaPublico } from '../../../../models/diploma/IDiploma';
import IRestMessage from '../../../../models/IRestMessage';



@Component({
  selector: 'app-diploma-publico',
  imports: [CommonModule],
  templateUrl: './diploma-publico.component.html',
  styleUrl: './diploma-publico.component.css'
})
export class DiplomaPublicoComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly diplomaService = inject(DiplomaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ==================== SIGNALS ====================

  private readonly _diploma = signal<IDiplomaPublico | null>(null);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');

  // ==================== COMPUTED SIGNALS ====================

  readonly diploma = computed(() => this._diploma());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

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
  readonly duracion = computed(() => {
    const diploma = this._diploma();
    if (!diploma) return '';
    return this.diplomaService.calcularDuracion(
      diploma.fechaPrimeraAyuda,
      diploma.fechaUltimaAyuda
    );
  });

  // ==================== CONSTRUCTOR ====================

  constructor() {
    this.verificarDiploma();
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Verifica el diploma por código UUID
   */
  private verificarDiploma(): void {
    const codigo = this.route.snapshot.paramMap.get('codigo');

    if (!codigo) {
      this._error.set('Código de verificación no proporcionado');
      this._loading.set(false);
      return;
    }

    if (!this.diplomaService.validarCodigoVerificacion(codigo)) {
      this._error.set('Código de verificación inválido');
      this._loading.set(false);
      return;
    }

    this.diplomaService.verificarDiplomaPublico(codigo).subscribe({
      next: (response: IRestMessage) => {
        this._loading.set(false);

        if (response.codigo === 0) {
          const diploma = response.datos as IDiplomaPublico;
          this._diploma.set(diploma);
        } else {
          this._error.set(response.mensaje || 'Diploma no encontrado');
        }
      },
      error: (error) => {
        this._loading.set(false);
        console.error('❌ Error verificando diploma:', error);
        this._error.set('No se pudo verificar el diploma');
      }
    });
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Navega al inicio de la aplicación
   */
  volverInicio(): void {
    this.router.navigate(['/vecinotech/home']);
  }
}
