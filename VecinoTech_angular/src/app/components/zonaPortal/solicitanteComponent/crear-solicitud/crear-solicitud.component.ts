import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { MapService } from '../../../../services/map.service';

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

  // ==================== INICIALIZACIÓN ====================

  /**
   * Inicializa el formulario reactivo con validaciones
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

  // ==================== ENVÍO DE FORMULARIO ====================

  /**
   * Envía el formulario de creación de solicitud
   * Valida campos antes de enviar al backend
   */
  onSubmit(): void {
    // Validar formulario
    if (this.solicitudForm.invalid) {
      this.markFormGroupTouched(this.solicitudForm);

      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos correctamente',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f59e0b'
      });
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

          Swal.fire({
            icon: 'success',
            title: '¡Solicitud creada!',
            text: 'Tu solicitud ha sido publicada correctamente',
            confirmButtonText: 'Ver mis solicitudes',
            confirmButtonColor: '#10b981',
            timer: 2500,
            timerProgressBar: true
          }).then(() => {
            this.router.navigate(['/portal/solicitante']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al crear solicitud',
            text: response.mensaje || 'No se pudo crear la solicitud',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3b82f6'
          });
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error('❌ Error creando solicitud:', err);

        Swal.fire({
          icon: 'error',
          title: 'Error al crear solicitud',
          text: 'No se pudo crear la solicitud. Intenta de nuevo.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3b82f6'
        });
      }
    });
  }

  // ==================== VALIDACIÓN DE FORMULARIO ====================

  /**
   * Marca todos los campos del formulario como tocados
   * Útil para mostrar errores al intentar enviar con campos inválidos
   * @param formGroup - FormGroup a marcar
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
   * Verifica si un campo tiene un error específico
   * @param field - Nombre del campo
   * @param error - Tipo de error a verificar
   * @returns true si el campo tiene ese error y ha sido tocado
   */
  hasError(field: string, error: string): boolean {
    const control = this.solicitudForm.get(field);
    return !!(control?.hasError(error) && control?.touched);
  }

  /**
   * Obtiene el mensaje de error apropiado para un campo
   * @param field - Nombre del campo
   * @returns Mensaje de error descriptivo
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
   * Obtiene el contador de caracteres para un campo
   * @param field - Nombre del campo
   * @returns String con formato "actual/máximo"
   */
  getCharCount(field: string): string {
    const control = this.solicitudForm.get(field);
    const value = control?.value || '';
    const maxLength = field === 'titulo' ? 100 : 500;
    return `${value.length}/${maxLength}`;
  }

  // ==================== NAVEGACIÓN Y ACCIONES ====================

  /**
   * Cancela la creación y vuelve atrás
   * Si hay cambios sin guardar, pide confirmación
   */
  cancelar(): void {
    if (this.solicitudForm.dirty) {
      Swal.fire({
        icon: 'question',
        title: '¿Descartar los cambios?',
        text: 'Los cambios no guardados se perderán',
        showCancelButton: true,
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Seguir editando',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/portal/solicitante']);
        }
      });
    } else {
      this.router.navigate(['/portal/solicitante']);
    }
  }

  /**
   * Resetea el formulario a su estado inicial
   */
  resetForm(): void {
    this.solicitudForm.reset();
    this.error.set('');
  }
}