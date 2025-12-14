import { CommonModule } from '@angular/common';
import { Component, signal, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RestClientService } from '../../../../services/rest-cliente.service';


/**
 * Componente para restablecer la contraseña con el token recibido por correo
 */
@Component({
  selector: 'app-restablecer-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './restablecer-password.component.html',
  styleUrl: './restablecer-password.component.css'
})
export class RestablecerPasswordComponent implements OnInit {
  //#region Dependencies
  private restClient = inject(RestClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  //#endregion

  //#region Signals
  submitting = signal(false);
  serverError = signal<string>('');
  successMsg = signal<string>('');
  token = signal<string | null>(null);
  tokenInvalido = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  //#endregion

  //#region Form
  form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  });
  //#endregion

  //#region Lifecycle
  ngOnInit(): void {
    // Obtener token de la URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (!token) {
        this.tokenInvalido.set(true);
        this.serverError.set('Token no proporcionado. Solicita un nuevo enlace de recuperación.');
      } else {
        this.token.set(token);
      }
    });
  }
  //#endregion

  //#region Métodos
  /**
   * Alterna visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Alterna visibilidad de la confirmación de contraseña
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  /**
   * Verifica si las contraseñas coinciden
   */
  passwordsMatch(): boolean {
    const password = this.form.controls['password'].value;
    const confirmPassword = this.form.controls['confirmPassword'].value;
    return password === confirmPassword;
  }

  /**
   * Restablece la contraseña
   */
  async onSubmit() {
    if (this.form.invalid || this.submitting() || !this.token()) return;

    // Validar que las contraseñas coincidan
    if (!this.passwordsMatch()) {
      this.serverError.set('Las contraseñas no coinciden.');
      return;
    }

    this.serverError.set('');
    this.successMsg.set('');
    this.submitting.set(true);

    try {
      const password = this.form.controls['password'].value as string;
      const token = this.token() as string;

      // Usa el método RestablecerPassword del RestClientService
      this.restClient.RestablecerPassword(token, password).subscribe({
        next: (response) => {
          if (response.codigo === 0) {
            this.successMsg.set('Contraseña restablecida exitosamente. Redirigiendo al login...');
            this.form.reset();

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
              this.router.navigate(['/usuario/login']);
            }, 2000);
          } else {
            this.serverError.set(response.mensaje || 'No se pudo restablecer la contraseña.');
          }
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error al restablecer contraseña:', error);

          if (error.status === 400) {
            this.serverError.set('El enlace ha expirado o no es válido. Solicita un nuevo enlace.');
            this.tokenInvalido.set(true);
          } else {
            this.serverError.set('Error de conexión. Inténtalo más tarde.');
          }

          this.submitting.set(false);
        }
      });
    } catch (error) {
      this.serverError.set('Error inesperado. Inténtalo más tarde.');
      this.submitting.set(false);
    }
  }
  //#endregion
}
