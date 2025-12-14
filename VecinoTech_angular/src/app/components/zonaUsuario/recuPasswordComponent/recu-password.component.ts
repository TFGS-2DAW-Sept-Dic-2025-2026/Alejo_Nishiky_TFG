import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RestClientService } from '../../../services/rest-cliente.service';

/**
 * Componente para solicitar recuperación de contraseña
 * Envía un correo con enlace para restablecer la contraseña
 */
@Component({
  selector: 'app-recu-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recu-password.component.html',
  styleUrl: './recu-password.component.css'
})
export class RecuPasswordComponent {
  //#region Dependencies
  private restClient = inject(RestClientService);
  //#endregion

  //#region Signals
  submitting = signal(false);
  serverError = signal<string>('');
  successMsg = signal<string>('');
  //#endregion

  //#region Form
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  //#endregion

  //#region Métodos
  /**
   * Envía solicitud de recuperación de contraseña
   */
  async onSubmit() {
    if (this.form.invalid || this.submitting()) return;

    this.serverError.set('');
    this.successMsg.set('');
    this.submitting.set(true);

    try {
      const email = this.form.controls['email'].value as string;

      // Usa el método SolicitarRecuperacion del RestClientService
      this.restClient.SolicitarRecuperacion(email).subscribe({
        next: (response) => {
          if (response.codigo === 0) {
            this.successMsg.set('Hemos enviado un enlace a tu correo. Revisa también la carpeta de spam.');
            this.form.reset();
          } else {
            this.serverError.set(response.mensaje || 'No se pudo procesar la solicitud.');
          }
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('❌ Error al solicitar recuperación:', error);
          this.serverError.set('Error de conexión. Inténtalo más tarde.');
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
