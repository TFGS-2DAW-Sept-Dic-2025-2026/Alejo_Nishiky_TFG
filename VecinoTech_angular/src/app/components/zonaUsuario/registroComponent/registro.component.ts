import { CommonModule} from '@angular/common';
import { Component, computed, effect, EffectRef, inject, Injector, Signal, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import IRestMessage from '../../../models/IRestMessage';
import Swal from 'sweetalert2';

import { toSignal } from '@angular/core/rxjs-interop';
import { RestClientService } from '../../../services/rest-cliente.service';
import { IUsuario } from '../../../models/usuario/IUsuario';


@Component({
  selector: 'app-registro',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class  RegistroComponent {

  // ==================== INJECTION SERVICIOS ====================
  private _router = inject(Router);
  private _injector = inject(Injector);
  private _restSvc:RestClientService = inject(RestClientService);

  // ==================== SIGNALS ====================
  showPassword = signal(false);
  showRepeatPassword = signal(false);
  mensajeError = signal<string>('');
  cargando = signal(false);
  private submitEffect?: EffectRef;

  //Atributos para el header
  mobileOpen = signal(false);
  toggleMobile() { this.mobileOpen.set(!this.mobileOpen()); }
  closeMobile()  { this.mobileOpen.set(false); }

  // Respuesta del backend
  respuesta: Signal<IRestMessage> | null = null;

  // Formulario reactivo
  readonly formRegistro = new FormGroup({
    nombreCompleto: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ]+(?: [A-Za-zÁÉÍÓÚáéíóúñÑ]+)+$/), // al menos dos palabras
    ]),
    telefono: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[6789]\d{8}$/), // 9 dígitos, empieza por 6/7/8/9
    ]),
    direccion: new FormControl('', [Validators.required, Validators.minLength(5)]),
    cp: new FormControl('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/), // 8+ caracteres, 1 mayús, 1 minús, 1 número
    ]),
    repassword: new FormControl('', [Validators.required]),
  });


  // Señal con los valores del formulario
  valoresFormRegistro = toSignal(this.formRegistro.valueChanges, {
    initialValue: this.formRegistro.value,
    injector: this._injector,
  });

  // ===== Visibilidad de contraseñas =====
  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }
  toggleRepeatPassword() {
    this.showRepeatPassword.set(!this.showRepeatPassword());
  }
  // ===== Comprobacion de contraseñas iguales ======
  contrasenasIguales(): boolean {
    return this.formRegistro.controls['password'].value === this.formRegistro.controls['repassword'].value;
  }

  formularioValido(): boolean {
    return this.formRegistro.valid && this.contrasenasIguales();
  }

  passwordError = computed(() => {
    const repass = this.formRegistro.controls['repassword'].value || '';
    return !this.contrasenasIguales() && repass.length > 0;
  });



  // ====== ENVIO AL BACKEND =====
  onSubmit() {
    if (!this.formularioValido()) {
      this.mensajeError.set('Revisa los campos.');
      return;
    }
    this.cargando.set(true);

    const v = this.formRegistro.value;
    // payload que espera el backend Spring
    const payload = {
      email:    v.email!,
      nombre:   v.nombreCompleto!,         // mapeo nombreCompleto -> nombre
      telefono: v.telefono || '',
      direccion: v.direccion || '',
      codigoPostal: v.cp || '',            // mapeo cp -> codigoPostal
      password: v.password!,
      confirmarPassword: v.repassword!     // mapeo repassword -> confirmarPassword
  };
  this.submitEffect?.destroy();

  // opción B: patrón /api/zonaUsuario/{operacion} con 'registro' en minúsculas
    this.respuesta = this._restSvc.LoginRegistroUsuario(payload, 'registro');
    console.log('Se ha enviado al servidor los sgtes datos', payload);

    // 3) crea un effect que dependa de ESTA signal
    this.submitEffect = effect(() => {
      const r = this.respuesta?.();
      if (!r || r.codigo === 100) return; // ... esperando

      this.cargando.set(false);

      if (r.codigo === 0) {
        const email = (this.formRegistro.controls['email'].value || '').toString();
        Swal.fire({
          icon: 'success',
          title: '¡Registro completado!',
          html: 'Te hemos enviado un correo para <b>activar tu cuenta</b>. Revisa la bandeja de entrada (y Spam).',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#2563eb'
        }).then(() => this._router.navigate(['/Usuario/Login'], { state: { email } }));
      } else {
        this.mensajeError.set(r.mensaje || 'Error en el registro');
        Swal.fire({
          icon: 'error',
          title: 'No pudimos registrarte',
          text: r.mensaje || 'Error en el registro',
          confirmButtonText: 'Ok'
        });
      }

      // (2) destruye el efecto tras procesar la respuesta
      this.submitEffect?.destroy();
      this.submitEffect = undefined;

    }, { injector: this._injector });
  }

  constructor(){}

}
