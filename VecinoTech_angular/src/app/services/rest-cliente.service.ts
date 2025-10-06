import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { inject, Injectable, Injector } from "@angular/core";
import IRestMessage from "../models/IRestMessage";
import { catchError, of, startWith } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";


@Injectable({
  providedIn: 'root'
})
export class RestClientService{

  private _httpClient = inject(HttpClient);
  private _injector = inject(Injector);

  constructor() {}

  //#region ------------------ metodos pet.a servicio de zonaUsuario ---------------
  public LoginRegistroUsuario(datos: any, operacion:string ){
    return toSignal(
            this._httpClient
                .post<IRestMessage>(
                  `http://localhost:8080/api/zonaUsuario/${operacion}`,
                  datos,
                  { headers: new HttpHeaders( { 'Content-Type': 'application/json' } ) }
                )
                .pipe(
                  catchError((error: HttpErrorResponse) => of<IRestMessage>({
                    codigo: error.status || 500,
                    mensaje: error.error?.mensaje || 'Error de red o servidor',
                    datos: null
                  })
                ),
                  startWith( { codigo: 100, mensaje: '... esperando respuesta del servidor ...', datos: null } ),
                )
                , { injector: this._injector, requireSync: true }
    )
  }

  public ReenviarActivacion(email: string){
    return this._httpClient.post<IRestMessage>(
      'http://localhost:8080/api/zonaUsuario/reenvio-activacion',
      { email },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  public RefrescarTokens(refreshToken: string) {
    return this._httpClient.post<IRestMessage>(
      'http://localhost:8080/api/zonaUsuario/refresh',
      { refreshToken },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }


}
