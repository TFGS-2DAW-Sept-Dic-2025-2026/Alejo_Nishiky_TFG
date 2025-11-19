import { Component, signal, input, output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Interfaces
import { IUsuario } from '../../../../models/interfaces_orm/IUsuario';

@Component({
  selector: 'app-modal-editar',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-editar.component.html',
  styleUrls: ['./modal-editar.component.css']
})
export class ModalEditarComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly fb = inject(FormBuilder);

  // ==================== INPUTS/OUTPUTS ====================

  readonly isOpen = input.required<boolean>();
  readonly usuario = input.required<IUsuario>();

  readonly close = output<void>();
  readonly save = output<Partial<IUsuario>>();

  // ==================== SIGNALS ====================

  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');

  // ==================== FORM ====================

  perfilForm!: FormGroup;

  // ==================== CONSTRUCTOR ====================

  constructor() {
    this.initForm();

    // Recargar formulario cuando cambia el usuario
    effect(() => {
      const user = this.usuario();
      if (user) {
        this.perfilForm.patchValue({
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono || '',
          direccion: user.direccion || '',
          codigoPostal: user.codigoPostal || ''
        });
      }
    });
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Inicializa el formulario
   */
  private initForm(): void {
    this.perfilForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      email: [
        { value: '', disabled: true },
        [Validators.required, Validators.email]
      ],
      telefono: ['', [
        Validators.pattern(/^[0-9]{9}$/)
      ]],
      direccion: ['', [
        Validators.minLength(5),
        Validators.maxLength(200)
      ]],
      codigoPostal: ['', [
        Validators.pattern(/^[0-9]{5}$/)
      ]]
    });
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Envía el formulario
   */
  onSubmit(): void {
    if (this.perfilForm.invalid) {
      this.markFormGroupTouched(this.perfilForm);
      this.error.set('Por favor, completa todos los campos correctamente');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const formData = this.perfilForm.getRawValue();

    // Emitir datos al padre
    this.save.emit(formData);
  }

  /**
   * Marca todos los campos como tocados
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
    const control = this.perfilForm.get(field);
    return !!(control?.hasError(error) && control?.touched);
  }

  /**
   * Obtiene el mensaje de error
   */
  getErrorMessage(field: string): string {
    const control = this.perfilForm.get(field);

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

    if (control.hasError('email')) {
      return 'Email inválido';
    }

    if (control.hasError('pattern')) {
      if (field === 'telefono') {
        return 'Teléfono inválido (9 dígitos)';
      }
      if (field === 'codigoPostal') {
        return 'Código postal inválido (5 dígitos)';
      }
    }

    return '';
  }

  /**
   * Cierra el modal
   */
  onClose(): void {
    if (this.perfilForm.dirty) {
      if (confirm('¿Descartar los cambios?')) {
        this.close.emit();
      }
    } else {
      this.close.emit();
    }
  }

  /**
   * Cierra el modal haciendo clic en el backdrop
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  /**
   * Resetea loading y error (llamado desde el padre)
   */
  resetState(): void {
    this.loading.set(false);
    this.error.set('');
  }
}
