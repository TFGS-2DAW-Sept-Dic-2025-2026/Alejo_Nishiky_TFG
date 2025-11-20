import { Component, signal, input, output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // ✅ AÑADIR

// Interfaces
import { IUsuario } from '../../../../models/interfaces_orm/IUsuario';
import IRestMessage from '../../../../models/IRestMessage'; // ✅ AÑADIR

@Component({
  selector: 'app-modal-editar',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-editar.component.html',
  styleUrls: ['./modal-editar.component.css']
})
export class ModalEditarComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient); // ✅ AÑADIR

  // ==================== INPUTS/OUTPUTS ====================

  readonly isOpen = input.required<boolean>();
  readonly usuario = input.required<IUsuario>();

  readonly close = output<void>();
  readonly save = output<Partial<IUsuario>>();

  // ==================== SIGNALS ====================

  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');
  readonly archivoSeleccionado = signal<File | null>(null);  // ✅ AÑADIR
  readonly previsualizacion = signal<string>('');             // ✅ AÑADIR

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

  /**
   * Obtiene el token de autenticación
   */
  private getToken(): string | null {
    // Asumiendo que tienes el token en localStorage
    return localStorage.getItem('access_token');
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * ✅ NUEVO: Maneja la selección de archivo
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
   * ✅ NUEVO: Elimina la imagen seleccionada
   */
  eliminarImagen(): void {
    this.archivoSeleccionado.set(null);
    this.previsualizacion.set('');
  }

  /**
   * Envía el formulario
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

      // ✅ Si hay archivo seleccionado, subirlo primero
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

      console.log('📤 Enviando perfil:', formData);

      // Emitir datos al padre
      this.save.emit(formData);

    } catch (error) {
      console.error('❌ Error:', error);
      this.error.set('Error al subir la imagen');
      this.loading.set(false);
    }
  }

  /**
   * ✅ NUEVO: Sube la imagen al backend y retorna la URL
   */
  private subirImagen(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', archivo);

      const token = this.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.post<IRestMessage>(
        'http://localhost:8080/api/portal/perfil/avatar',
        formData,
        { headers }
      ).subscribe({
        next: (response) => {
          if (response.codigo === 0 && response.datos) {
            const avatarUrl = (response.datos as any).avatarUrl;
            resolve(avatarUrl);
          } else {
            reject(new Error(response.mensaje));
          }
        },
        error: (error) => {
          console.error('Error al subir imagen:', error);
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
        this.resetState();
      }
    } else {
      this.close.emit();
      this.resetState();
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
    this.archivoSeleccionado.set(null);
    this.previsualizacion.set('');
  }
}
