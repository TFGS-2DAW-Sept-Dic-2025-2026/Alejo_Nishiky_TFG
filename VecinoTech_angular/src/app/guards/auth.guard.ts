import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageGlobalService } from '../services/storage-global.service';


export const authGuard: CanActivateFn = () => {
  const storage = inject(StorageGlobalService);
  const router = inject(Router);

  const access = storage.getAccessToken();

  if (!access) {
    router.navigate(['/Usuario/Login']);
    return false;
  }

  return true;
};
