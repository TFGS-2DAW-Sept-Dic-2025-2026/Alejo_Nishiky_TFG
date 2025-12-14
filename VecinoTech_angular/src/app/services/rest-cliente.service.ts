import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { inject, Injectable, Injector } from "@angular/core";
import IRestMessage from "../models/IRestMessage";
import { catchError, Observable, of, startWith } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";

/**
 * Servicio de Cliente REST - Angular 19
 * Responsabilidad: Todas las peticiones HTTP a la API backend
 */
@Injectable({
  providedIn: 'root'
})
export class RestClientService {
  //#region Dependencies
  private _httpClient = inject(HttpClient);
  private _injector = inject(Injector);
  //#endregion

  //#region Constantes
  private readonly JSON_HEADERS = new HttpHeaders({ 'Content-Type': 'application/json' });
  //#endregion

  //#region ==================== ZONA USUARIO - SIGNALS ====================

  /**
   * Método genérico para Login y Registro usando signals
   * Retorna un signal con el estado de la petición
   *
   * Estados del signal:
   * - codigo 100: Cargando (startWith)
   * - codigo 0: Exitoso
   * - codigo > 0: Error
   *
   * @param datos - Datos del formulario (email, password, etc.)
   * @param operacion - 'login' o 'registro'
   * @returns Signal<IRestMessage> con el estado de la petición
   */
  public LoginRegistroUsuario(datos: any, operacion: string) {
    return toSignal(
      this._httpClient
        .post<IRestMessage>(
          `http://localhost:8080/api/zonaUsuario/${operacion}`,
          datos,
          { headers: this.JSON_HEADERS }
        )
        .pipe(
          catchError((error: HttpErrorResponse) => of<IRestMessage>({
            codigo: error.status || 500,
            mensaje: error.error?.mensaje || 'Error de red o servidor',
            datos: null
          })),
          startWith({ codigo: 100, mensaje: '... esperando respuesta del servidor ...', datos: null }),
        ),
      { injector: this._injector, requireSync: true }
    );
  }
  //#endregion

  //#region ==================== ZONA USUARIO - OBSERVABLES ====================

  /**
   * Reenvía el correo de activación de cuenta
   */
  public ReenviarActivacion(email: string): Observable<IRestMessage> {
    return this._httpClient.post<IRestMessage>(
      'http://localhost:8080/api/zonaUsuario/reenvio-activacion',
      { email },
      { headers: this.JSON_HEADERS }
    );
  }

  /**
   * Refresca los tokens de autenticación
   */
  public RefrescarTokens(refreshToken: string): Observable<IRestMessage> {
    return this._httpClient.post<IRestMessage>(
      'http://localhost:8080/api/zonaUsuario/refresh',
      { refreshToken },
      { headers: this.JSON_HEADERS }
    );
  }

  /**
   * Solicita recuperación de contraseña
   * Envía un correo con enlace para restablecer
   */
  public SolicitarRecuperacion(email: string): Observable<IRestMessage> {
    return this._httpClient.post<IRestMessage>(
      'http://localhost:8080/api/zonaUsuario/solicitar-recuperacion',
      { email },
      { headers: this.JSON_HEADERS }
    );
  }

  /**
   * Restablece la contraseña usando el token recibido por correo
   */
  public RestablecerPassword(token: string, nuevaPassword: string): Observable<IRestMessage> {
    return this._httpClient.post<IRestMessage>(
      'http://localhost:8080/api/zonaUsuario/restablecer-password',
      { token, nuevaPassword },
      { headers: this.JSON_HEADERS }
    );
  }
  //#endregion
}
