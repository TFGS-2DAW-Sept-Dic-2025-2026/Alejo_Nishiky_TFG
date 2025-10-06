import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recu-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recu-password.component.html',
  styleUrl: './recu-password.component.css'
})
export class RecuPasswordComponent {
  submitting = signal(false);
  serverError = signal<string>('');
  successMsg = signal<string>('');

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  // Simulación de request (cámbialo luego por tu RestClientService)
  private async fakeRequest(email: string): Promise<{ ok: boolean; msg?: string }> {
    await new Promise(r => setTimeout(r, 1200));
    // Simula error si contiene 'fail'
    if (email.includes('fail')) return { ok: false, msg: 'No encontramos una cuenta con ese correo.' };
    return { ok: true };
  }

  async onSubmit() {
    if (this.form.invalid || this.submitting()) return;
    this.serverError.set('');
    this.successMsg.set('');
    this.submitting.set(true);

    try {
      const email = this.form.controls['email'].value as string;
      const res = await this.fakeRequest(email);
      if (!res.ok) {
        this.serverError.set(res.msg ?? 'No se pudo procesar la solicitud.');
        return;
      }
      this.successMsg.set('Hemos enviado un enlace/código a tu correo. Revisa también la carpeta de spam.');
      // Aquí podrías navegar a /Usuario/Verificar/Recuperar si quieres un flujo con OTP
    } catch {
      this.serverError.set('Error de conexión. Inténtalo más tarde.');
    } finally {
      this.submitting.set(false);
    }
  }
}
