import { Component, effect, inject, Injector, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verif2-facode',
  imports: [],
  templateUrl: './verif2-facode.component.html',
  styleUrl: './verif2-facode.component.css'
})
export class Verif2FacodeComponent {

  operacion = signal<string>('');
  codigoChars = signal<string[]>(Array(6).fill(''));
  email: string = '';

  private _jwt = '';
  private _injector = inject(Injector);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  // private _restClient = inject(RestClientService);
  // private _storageGlobal = inject(HTTP_INJECTIONTOKEN_STORAGE_SVCS);

  constructor() {
    this.operacion.set(this._route.snapshot.paramMap.get('operacion') || '');
    // this.email = this._storageGlobal.getDatosCliente()?.cuenta?.email || '';
    // this._jwt = this._storageGlobal.getJWT()?.verificacion || '';
  }

  PushValue(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const valor = input.value.replace(/\D/g, '').slice(0, 1);
    this.codigoChars.update(prev => prev.map((el, pos) => pos === index - 1 ? valor : el));

    const nextInput = document.getElementById('code' + (index + 1));
    if (nextInput && valor) (nextInput as HTMLInputElement).focus();
  }

  codigoCompleto(): boolean {
    return this.codigoChars().every(d => d.length === 1);
  }

  async ValidarCodigo() {
    const _codigoIntroducido = this.codigoChars().join('');

    // const _resp = await this._restClient.VerificarCodigo(
    //   this.operacion(),
    //   _codigoIntroducido,
    //   this._jwt,
    //   this.email
    // );

    effect(() => {
      // if (_resp().codigo === 0) {
      //   // this._storageGlobal.setDatosCliente(_resp().datos.datosCliente);
      //   // this._storageGlobal.setJwt('sesion', _resp().datos.sesion);
      //   // this._storageGlobal.setJwt('refresh', _resp().datos.refresh);
      //   // this._storageGlobal.setJwt('verificacion', _resp().datos.verificacion);
      //   // this._router.navigateByUrl('/');
      // } else {
      //   // TODO: mostrar error visual si código no válido
      //   console.warn('Código incorrecto');
      // }
    }, { injector: this._injector });
  }

}
