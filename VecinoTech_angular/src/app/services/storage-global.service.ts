import { Injectable, signal } from '@angular/core';
import { IUsuario } from '../models/interfaces_orm/IUsuario';
import { IAuthPayload } from '../models/IAuthPayload';

@Injectable({
  providedIn: 'root'
})
export class StorageGlobalService {

  // señales internas
  private _accessToken = signal<string | null>(null);
  private _refreshToken = signal<string | null>(null);
  private _usuario = signal<IUsuario | null>(null);

  //! señales readonly para que los componentes se suscriban de forma reactiva
  accessTokenSig = this._accessToken.asReadonly();
  refreshTokenSig = this._refreshToken.asReadonly();
  usuarioSig = this._usuario.asReadonly();

  constructor() {}

  //#region ============= Métodos para gestionar sesión =========
  getAccessToken(): string | null {
    return this._accessToken();
  }

  getRefreshToken(): string | null {
    return this._refreshToken();
  }

  getUsuario(): IUsuario | null {
    return this._usuario();
  }

  getJWT(): { accessToken: string; refreshToken: string } {
  return {
    accessToken: this._accessToken() ?? '',
    refreshToken: this._refreshToken() ?? ''
  };
}


  /* Inicializar la sesión con el payload desde el backend */
  setSession(payload: IAuthPayload) {
    this._accessToken.set(payload.accessToken);
    this._refreshToken.set(payload.refreshToken);
    this._usuario.set(payload.usuario);
  }

  /* Limpio todo al hacer logout */
  clearSession() {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._usuario.set(null);
  }

  //#endregion ===========================================================
}
