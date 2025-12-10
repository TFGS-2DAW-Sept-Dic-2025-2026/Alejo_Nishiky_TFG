import { Component, signal, input, output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Services
import { RestPortalService } from '../../../../services/rest-portal.service';
import { IUsuario } from '../../../../models/usuario/IUsuario';

@Component({
  selector: 'app-modal-editar',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-editar.component.html',
  styleUrls: ['./modal-editar.component.css']
})
export class ModalEditarComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly fb = inject(FormBuilder);
  private readonly restPortal = inject(RestPortalService);

  // ==================== INPUTS/OUTPUTS ====================

  readonly isOpen = input.required<boolean>();
  readonly usuario = input.required<IUsuario>();

  readonly close = output<void>();
  readonly save = output<Partial<IUsuario>>();

  // ==================== SIGNALS ====================

  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');
  readonly archivoSeleccionado = signal<File | null>(null);
  readonly previsualizacion = signal<string>('');

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
          avatarUrl: user.avatarUrl || '',
          telefono: user.telefono || '',
          direccion: user.direccion || '',
          codigoPostal: user.codigoPostal || ''
        });
      }
    });

    // ✅ NUEVO: Effect que detecta cuando se cierra el modal para resetear
    effect(() => {
      const abierto = this.isOpen();

      if (!abierto) {
        // Modal cerrado → resetear estado
        this.resetState();
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
      avatarUrl: ['', [
        Validators.maxLength(300)
      ]],
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
   * Maneja la selección de archivo
   */
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];

      // Validar tipo
      if (!archivo.type.startsWith('image/')) {
        this.error.set('Solo se permiten imágenes (JPG, PNG)');
        return;
      }

      // Validar tamaño (5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        this.error.set('La imagen no puede superar 5MB');
        return;
      }

      this.archivoSeleccionado.set(archivo);

      // Crear previsualización
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previsualizacion.set(e.target?.result as string);
      };
      reader.readAsDataURL(archivo);

      // Limpiar el campo de URL
      this.perfilForm.patchValue({ avatarUrl: '' });
      this.error.set('');
    }
  }

  /**
   * Elimina la imagen seleccionada
   */
  eliminarImagen(): void {
    this.archivoSeleccionado.set(null);
    this.previsualizacion.set('');
  }

  /**
   * Envía el formulario
   * ✅ CORREGIDO: Maneja mejor los errores y el loading
   */
  async onSubmit(): Promise<void> {
    if (this.perfilForm.invalid) {
      this.markFormGroupTouched(this.perfilForm);
      this.error.set('Por favor, completa todos los campos correctamente');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      let avatarUrl = this.perfilForm.value.avatarUrl;

      // Si hay archivo seleccionado, subirlo primero
      if (this.archivoSeleccionado()) {
        console.log('📤 Subiendo imagen...');
        avatarUrl = await this.subirImagen(this.archivoSeleccionado()!);
        console.log('✅ Imagen subida:', avatarUrl);
      }

      // Preparar datos del perfil
      const formData = {
        nombre: this.perfilForm.value.nombre,
        avatarUrl: avatarUrl || '',
        telefono: this.perfilForm.value.telefono || '',
        direccion: this.perfilForm.value.direccion || '',
        codigoPostal: this.perfilForm.value.codigoPostal || ''
      };

      console.log('📤 Enviando perfil al padre:', formData);

      // ✅ Emitir datos al padre
      this.save.emit(formData);

      // ✅ Resetear loading DESPUÉS de emitir
      // (el padre se encargará de cerrar el modal)
      this.loading.set(false);

    } catch (error) {
      console.error('❌ Error:', error);
      this.error.set('Error al subir la imagen');
      this.loading.set(false);
    }
  }

  /**
   * Sube la imagen usando RestPortalService
   */
  private async subirImagen(archivo: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', archivo);

    return new Promise((resolve, reject) => {
      this.restPortal.subirAvatar(formData).subscribe({
        next: (response) => {
          if (response.codigo === 0 && response.datos) {
            const avatarUrl = (response.datos as any).avatarUrl;
            resolve(avatarUrl);
          } else {
            reject(new Error(response.mensaje));
          }
        },
        error: (error) => {
          console.error('❌ Error al subir imagen:', error);
          reject(error);
        }
      });
    });
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
    if (this.perfilForm.dirty || this.archivoSeleccionado()) {
      if (confirm('¿Descartar los cambios?')) {
        this.close.emit();
        // El resetState se ejecutará automáticamente por el effect
      }
    } else {
      this.close.emit();
      // El resetState se ejecutará automáticamente por el effect
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
   * ✅ NUEVO: Resetea el estado del modal
   */
  resetState(): void {
    this.loading.set(false);
    this.error.set('');
    this.archivoSeleccionado.set(null);
    this.previsualizacion.set('');
    this.perfilForm.markAsPristine();
  }
}

