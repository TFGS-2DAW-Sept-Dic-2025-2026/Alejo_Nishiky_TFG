import { ApplicationConfig, InjectionToken, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

// export const HTTP_INJECTIONTOKEN_STORAGE_SVCS: InjectionToken<IStorageService> =
//   new InjectionToken<IStorageService>('token para servicios de storage');


export const appConfig: ApplicationConfig = {
  providers: [

    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]) //<---Registrar aquí lo he cambiado de withInterceptorsfromDMI -- Angular de version 14-17 para class-based, no se estila
    ),
  ]

};
