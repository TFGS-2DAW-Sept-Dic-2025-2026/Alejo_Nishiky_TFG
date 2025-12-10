import { AuthService } from './../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StorageGlobalService } from '../../../services/storage-global.service';
import { RestClientService } from '../../../services/rest-cliente.service';
import IRestMessage from '../../../models/IRestMessage';
import { IAuthPayload } from '../../../models/auth/IAuthPayload';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // ==================== DEPENDENCY INJECTION ====================
  private readonly router = inject(Router);
  private readonly storage = inject(StorageGlobalService);
  private readonly AuthService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly rest = inject(RestClientService);

  // ==================== SIGNALS ====================
  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly serverError = signal<string>('');

  private readonly currentLoginResponse = signal<ReturnType<typeof this.rest.LoginRegistroUsuario> | null>(null);

  // ==================== FORM ====================
  readonly formLogin = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  // ==================== COMPUTED ====================
  readonly isFormValid = computed(() => this.formLogin.valid);
  readonly canSubmit = computed(() => this.isFormValid() && !this.submitting());

  readonly submitButtonState = computed(() => {
    if (this.submitting()) return 'loading';
    if (this.formLogin.invalid) return 'disabled';
    return 'enabled';
  });

  readonly emailControl = this.formLogin.get('email')!;
  readonly passwordControl = this.formLogin.get('password')!;

  // ==================== CONSTRUCTOR ====================
  constructor() {
    if (this.AuthService.isAuthenticated()) {
      this.router.navigate(['/portal']);
      return;
    }

    effect(() => {
      const responseSignal = this.currentLoginResponse();
      if (!responseSignal) return;

      const response = responseSignal();
      if (!response) return;

      if (response.codigo === 100) {
        return;
      }

      this.submitting.set(false);

      if (response.codigo === 0 && response.datos) {
        this.handleLoginSuccess(response);
      } else {
        this.handleLoginError(response);
      }

      this.currentLoginResponse.set(null);
    });

    this.loadSavedEmail();
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit() {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    if (this.submitting()) {
      return;
    }

    this.serverError.set('');
    this.submitting.set(true);

    const formValue = this.formLogin.value;
    const credenciales = {
      email: (formValue.email || '').trim(),
      password: (formValue.password || '').toString()
    };

    const responseSignal = this.rest.LoginRegistroUsuario(credenciales, 'login');
    this.currentLoginResponse.set(responseSignal);
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private handleLoginSuccess(response: IRestMessage) {
    const payload = response.datos as IAuthPayload;
    const remember = this.formLogin.value.remember || false;

    this.storage.setSession(payload);

    if (remember) {
      this.saveEmailToLocalStorage(payload.usuario.email);
    }

    this.router.navigate(['/portal']);
  }

  private handleLoginError(response: IRestMessage) {
    this.serverError.set(response.mensaje || 'Email o contraseña inválidos');
  }

  private saveEmailToLocalStorage(email: string) {
    try {
      localStorage.setItem('vt_last_email', email);
    } catch (error) {
      console.warn('No se pudo guardar el email en localStorage:', error);
    }
  }

  private loadSavedEmail() {
    try {
      const savedEmail = localStorage.getItem('vt_last_email');
      if (savedEmail) {
        this.emailControl.setValue(savedEmail);
      }
    } catch (error) {
      console.warn('No se pudo cargar el email guardado:', error);
    }
  }
}
