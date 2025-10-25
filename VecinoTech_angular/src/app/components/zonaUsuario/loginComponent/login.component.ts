import { AuthService } from './../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StorageGlobalService } from '../../../services/storage-global.service';
import { RestClientService } from '../../../services/rest-cliente.service';
import IRestMessage from '../../../models/IRestMessage';
import { IAuthPayload } from '../../../models/IAuthPayload';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Inyecciones
  private readonly router = inject(Router);
  private readonly storage = inject(StorageGlobalService);
  private readonly AuthService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly rest = inject(RestClientService);

  // UI State signals
  readonly mobileOpen = signal(false);
  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly serverError = signal<string>('');

  // Signal para la respuesta actual del login
  private readonly currentLoginResponse = signal<ReturnType<typeof this.rest.LoginRegistroUsuario> | null>(null);

  // Form
  readonly formLogin = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  // Computed signals
  readonly isFormValid = computed(() => this.formLogin.valid);
  readonly canSubmit = computed(() => this.isFormValid() && !this.submitting());

  // Computed para el estado del botón de submit
  readonly submitButtonState = computed(() => {
    if (this.submitting()) return 'loading';
    if (this.formLogin.invalid) return 'disabled';
    return 'enabled';
  });

  // Form field getters para template
  readonly emailControl = this.formLogin.get('email')!;
  readonly passwordControl = this.formLogin.get('password')!;

  constructor() {

    if(this.AuthService.isAuthenticated()){
      this.router.navigate(['/Portal']);
      return;
    }

    // Effect para manejar las respuestas del login
    effect(() => {
      const responseSignal = this.currentLoginResponse();
      if (!responseSignal) return;

      const response = responseSignal();
      if (!response) return;

      // Si está cargando, mantener estado
      if (response.codigo === 100) {
        return;
      }

      // Procesar respuesta final
      this.submitting.set(false);

      if (response.codigo === 0 && response.datos) {
        this.handleLoginSuccess(response);
      } else {
        this.handleLoginError(response);
      }

      // Para limpiar la respuesta después de procesarla
      this.currentLoginResponse.set(null);
    });

    // Cargar email guardado al inicializar
    this.loadSavedEmail();
  }

  // UI Actions
  toggleMobile() {
    this.mobileOpen.set(!this.mobileOpen());
  }

  closeMobile() {
    this.mobileOpen.set(false);
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit() {
    // Early return si el form es inválido
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    // Si ya está enviando, no hacer nada
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

    // Hacer la petición y asignar el signal de respuesta
    const responseSignal = this.rest.LoginRegistroUsuario(credenciales, 'login');
    this.currentLoginResponse.set(responseSignal);
  }

  private handleLoginSuccess(response: IRestMessage) {
    const payload = response.datos as IAuthPayload;
    const remember = this.formLogin.value.remember || false;

    // Guardar sesión
    this.storage.setSession(payload);

    // Recordar email si está marcado
    if (remember) {
      this.saveEmailToLocalStorage(payload.usuario.email);
    }

    // Navegar al portal
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
