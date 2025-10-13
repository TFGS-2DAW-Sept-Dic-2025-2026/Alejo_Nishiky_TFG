import { inject, Injectable, Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, startWith } from 'rxjs';
import IRestMessage from '../models/IRestMessage';

import { IPortalLeader } from '../models/portal/IPortalLeader';

@Injectable({ providedIn: 'root' })
export class RestPortalService {
  private _http = inject(HttpClient);
  private _injector = inject(Injector);

  private base = 'http://localhost:8080/api/portal';



  public getLeaderboard() {
    return toSignal(
      this._http.get<IRestMessage>(`${this.base}/leaderboard`)
        .pipe(
          catchError((e: HttpErrorResponse) => of<IRestMessage>({
            codigo: e.status || 500,
            mensaje: e.error?.mensaje || 'No se pudo cargar el ranking',
            datos: []
          })),
          startWith({ codigo: 100, mensaje: 'Cargando ranking...', datos: [] })
        ),
      { injector: this._injector, requireSync: true }
    );
  }

  public postVolunteer() {
    return toSignal(
      this._http.post<IRestMessage>(
        `${this.base}/volunteer`, {},
        { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
      ).pipe(
        catchError((e: HttpErrorResponse) => of<IRestMessage>({
          codigo: e.status || 500,
          mensaje: e.error?.mensaje || 'No se pudo registrar voluntariado',
          datos: { ok: false }
        })),
        startWith({ codigo: 100, mensaje: 'Enviando...', datos: { ok: false } })
      ),
      { injector: this._injector, requireSync: true }
    );
  }

  public postNeedHelp(message?: string) {
    return toSignal(
      this._http.post<IRestMessage>(
        `${this.base}/need-help`, { message },
        { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
      ).pipe(
        catchError((e: HttpErrorResponse) => of<IRestMessage>({
          codigo: e.status || 500,
          mensaje: e.error?.mensaje || 'No se pudo crear solicitud de ayuda',
          datos: { ticketId: '' }
        })),
        startWith({ codigo: 100, mensaje: 'Enviando...', datos: { ticketId: '' } })
      ),
      { injector: this._injector, requireSync: true }
    );
  }
}
