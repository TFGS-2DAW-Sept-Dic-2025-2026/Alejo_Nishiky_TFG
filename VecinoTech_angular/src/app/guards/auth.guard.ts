import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  //Verificar si está autenticando con computed signal
  if (authService.isAuthenticated()) {
    return true;
  }

  //Guardar la URL a la que intentaba acceder.
  const returnUrl = state.url;

  router.navigate(['/usuario/login'], {
    queryParams: { returnUrl }
  });

  return false;
};
