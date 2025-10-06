import { NgClass } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-activar-cuenta',
  imports: [RouterLink, NgClass],
  templateUrl: './activar-cuenta.component.html',
  styleUrl: './activar-cuenta.component.css'
})
export class ActivarCuentaComponent {
  private _route = inject(ActivatedRoute);

  // Leemos ?status=ok|error mediante toSignal (Angular 19)
  statusSig = toSignal(
    this._route.queryParamMap.pipe(map(q => q.get('status') ?? 'init')),
    { initialValue: 'init' }
  );

  titulo = computed(() => {
    const s = this.statusSig();
    if (s === 'ok') return 'Cuenta activada';
    if (s === 'error') return 'No se pudo activar la cuenta';
    return 'Procesando activación…';
  });

  mensaje = computed(() => {
    const s = this.statusSig();
    if (s === 'ok') return 'Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión.';
    if (s === 'error') return 'El enlace es inválido o ha caducado. Puedes solicitar un reenvío.';
    return 'Redirigido desde el enlace de activación…';
  });

  // Si quieres ofrecer reenvío desde aquí, descomenta y usa tu RestClientService
  // emailSig = signal('');
  // reenviar() { ... }
}
