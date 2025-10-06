import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, Observable } from 'rxjs';

import { IAuthPayload } from '../models/IAuthPayload';
import { StorageGlobalService } from '../services/storage-global.service';
import { RestClientService } from '../services/rest-cliente.service';
import IRestMessage from '../models/IRestMessage';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const storage = inject(StorageGlobalService);
  const router = inject(Router);
  const restCliente = inject(RestClientService);

  const jwts = storage.getJWT(); // { accessToken, refreshToken }

  let authReq = req;

  if (jwts.accessToken) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${jwts.accessToken}` }
    });
  }

  return next(authReq).pipe(
    catchError(err => {
      console.log('❌ Error capturado en interceptor:', err);

      if (err.status === 401 && jwts.refreshToken) {

        // Intentar refresh
        return restCliente.RefrescarTokens(jwts.refreshToken).pipe(
          switchMap((resp: IRestMessage) => {
            if (resp.codigo === 0 && resp.datos) {
              const payload = resp.datos as IAuthPayload; // casteo manual
              storage.setSession(payload);

              const retry = req.clone({
                setHeaders: { Authorization: `Bearer ${payload.accessToken}` }
              });
              return next(retry);
            } else {
              storage.clearSession();
              router.navigate(['/login']);
              return throwError(() => new Error('Fallo en refresh token'));
            }
          })
        );
      }

      return throwError(() => err);
    })
  );
};
