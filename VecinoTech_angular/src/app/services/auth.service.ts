import { Injectable, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import IRestMessage from '../models/IRestMessage';
import { StorageGlobalService } from './storage-global.service';
import { IAuthPayload } from '../models/auth/IAuthPayload';
import { IUsuario } from '../models/usuario/IUsuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/zonaUsuario';
  private readonly PORTAL_API_URL = 'http://localhost:8080/api/portal';

  // Computed: reactivo al estado de los signals
  public isAuthenticated = computed(() => {
    const token = this.storage.accessTokenSig();
    return token !== null && token.length > 0;
  });

  public currentUser = computed(() => this.storage.usuarioSig());

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageGlobalService
  ) {}

  login(email: string, password: string): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      `${this.API_URL}/login`,
      { email, password },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap((response: IRestMessage) => {
        if (response.codigo === 0 && response.datos) {
          const payload = response.datos as IAuthPayload;
          this.storage.setSession(payload);
        }
      }),
      catchError(error => {
        this.storage.clearSession();
        return throwError(() => error);
      })
    );
  }

  register(userData: any): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      `${this.API_URL}/registro`,
      userData,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  reenviarActivacion(email: string): Observable<IRestMessage> {
    return this.http.post<IRestMessage>(
      `${this.API_URL}/reenvio-activacion`,
      { email },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  /**
   * Recarga el usuario actual desde el backend
   * Útil para obtener datos actualizados (ej: es_voluntario)
   */
  recargarUsuarioActual(): Observable<IUsuario> {
    return this.http.get<IRestMessage>(`${this.PORTAL_API_URL}/perfil/me`).pipe(
      map(response => {
        if (response.codigo === 0) {
          const usuario = response.datos as IUsuario;

          // Actualiza el storage con los datos frescos
          this.storage.actualizarUsuario(usuario);

          console.log('Usuario recargado desde backend:', usuario);

          return usuario;
        }
        throw new Error(response.mensaje || 'Error al recargar usuario');
      }),
      catchError(error => {
        console.error('❌ Error recargando usuario:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.storage.clearSession();
    this.router.navigate(['/usuario/login']);
  }

  getAccessToken(): string | null {
    return this.storage.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.storage.getRefreshToken();
  }
}
