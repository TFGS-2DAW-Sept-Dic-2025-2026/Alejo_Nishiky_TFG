import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MapService } from '../../../../services/map.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-solicitud',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-solicitud.component.html',
  styleUrl: './crear-solicitud.component.css'
})
export class CrearSolicitudComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly fb = inject(FormBuilder);
  private readonly mapService = inject(MapService);
  private readonly router = inject(Router);

  // ==================== SIGNALS ====================

  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');
  readonly success = signal<boolean>(false);

  // ==================== FORM ====================

  solicitudForm!: FormGroup;

  // ==================== CATEGORÍAS ====================

  readonly categorias = [
    { value: 'GENERAL', label: 'Ayuda General', icon: '🛠️' },
    { value: 'MOVIL', label: 'Móvil / Smartphone', icon: '📱' },
    { value: 'ORDENADOR', label: 'Ordenador / PC', icon: '💻' },
    { value: 'TABLET', label: 'Tablet', icon: '📲' },
    { value: 'SMART_TV', label: 'Smart TV', icon: '📺' }
  ];

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.initForm();
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    this.solicitudForm = this.fb.group({
      titulo: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]],
      descripcion: ['', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(500)
      ]],
      categoria: ['', Validators.required]
    });
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Envía el formulario
   */
  onSubmit(): void {
    // Validar formulario
    if (this.solicitudForm.invalid) {
      this.markFormGroupTouched(this.solicitudForm);
      this.error.set('Por favor, completa todos los campos correctamente');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const formData = this.solicitudForm.value;

    // Llamar al servicio
    this.mapService.crearSolicitud(formData).subscribe({
      next: (response) => {
        this.loading.set(false);

        if (response.codigo === 0) {
          this.success.set(true);

          // Mostrar mensaje de éxito
          setTimeout(() => {
            this.router.navigate(['/portal/solicitante']);
          }, 1500);
        } else {
          this.error.set(response.mensaje || 'Error al crear la solicitud');
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error creando solicitud:', err);
        this.error.set('No se pudo crear la solicitud. Intenta de nuevo.');
      }
    });
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Verifica si un campo tiene error
   */
  hasError(field: string, error: string): boolean {
    const control = this.solicitudForm.get(field);
    return !!(control?.hasError(error) && control?.touched);
  }

  /**
   * Obtiene el mensaje de error de un campo
   */
  getErrorMessage(field: string): string {
    const control = this.solicitudForm.get(field);

    if (!control?.touched) return '';

    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }

    return '';
  }

  /**
   * Obtiene el contador de caracteres
   */
  getCharCount(field: string): string {
    const control = this.solicitudForm.get(field);
    const value = control?.value || '';
    const maxLength = field === 'titulo' ? 100 : 500;
    return `${value.length}/${maxLength}`;
  }

  /**
   * Cancela y vuelve atrás
   */
  cancelar(): void {
    if (this.solicitudForm.dirty) {
      if (confirm('¿Descartar los cambios?')) {
        this.router.navigate(['/portal/solicitante']);
      }
    } else {
      this.router.navigate(['/portal/solicitante']);
    }
  }

  /**
   * Resetea el formulario
   */
  resetForm(): void {
    this.solicitudForm.reset();
    this.error.set('');
  }
}
