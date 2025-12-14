import { Injectable, computed, inject, effect, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import IRestMessage from '../models/IRestMessage';
import { StorageGlobalService } from './storage-global.service';
import { RestClientService } from './rest-cliente.service';
import { IAuthPayload } from '../models/auth/IAuthPayload';
import { IUsuario } from '../models/usuario/IUsuario';
import { HttpClient } from '@angular/common/http';
import { Signal } from '@angular/core';

/**
 * Servicio de Autenticación - Angular 19
 * Responsabilidades:
 * - Gestión del estado de autenticación (isAuthenticated, currentUser)
 * - Gestión de sesión (logout)
 * - Acceso a tokens desde storage
 * - Coordinación entre RestClientService y StorageGlobalService
 *
 * Usa signals de Angular 19 para login/registro
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //#region Dependencies
  private storage = inject(StorageGlobalService);
  private router = inject(Router);
  private restClient = inject(RestClientService);
  private http = inject(HttpClient);
  private injector = inject(Injector);
  //#endregion

  //#region URLs
  private readonly PORTAL_API_URL = 'http://localhost:8080/api/portal';
  //#endregion

  //#region Computed Properties
  /**
   * Indica si el usuario está autenticado
   * Reactivo al estado del token en storage
   */
  public isAuthenticated = computed(() => {
    const token = this.storage.accessTokenSig();
    return token !== null && token.length > 0;
  });

  /**
   * Usuario actual desde storage
   * Reactivo a cambios en el storage
   */
  public currentUser = computed(() => this.storage.usuarioSig());
  //#endregion

  //#region Authentication Methods
  /**
   * Inicia sesión con email y contraseña
   * Retorna un signal con el estado de la petición
   * Automáticamente actualiza el storage cuando el login es exitoso
   *
   * Estados del signal:
   * - codigo 100: Cargando
   * - codigo 0: Exitoso (datos contienen AuthPayload)
   * - codigo > 0: Error (mensaje contiene descripción)
   *
   * @example
   * // En el componente:
   * loginSignal = this.authService.login(email, password);
   *
   * // En el template con @if:
   * @if (loginSignal().codigo === 100) {
   *   <p>Cargando...</p>
   * }
   * @if (loginSignal().codigo === 0) {
   *   <p>Login exitoso!</p>
   * }
   * @if (loginSignal().codigo > 0 && loginSignal().codigo !== 100) {
   *   <p class="error">{{ loginSignal().mensaje }}</p>
   * }
   */
  login(email: string, password: string): Signal<IRestMessage> {
    const loginSignal = this.restClient.LoginRegistroUsuario({ email, password }, 'login');

    // Effect que observa el signal y actualiza storage automáticamente
    effect(() => {
      const response = loginSignal();

      // Ignorar estado de loading
      if (response.codigo === 100) return;

      // Procesar respuesta exitosa - actualizar storage
      if (response.codigo === 0 && response.datos) {
        const payload = response.datos as IAuthPayload;
        this.storage.setSession(payload);
        console.log('✅ Sesión iniciada correctamente');
      }
      // Procesar error - limpiar storage
      else if (response.codigo !== 0) {
        this.storage.clearSession();
        console.log('❌ Error en login:', response.mensaje);
      }
    }, {
      injector: this.injector,
      allowSignalWrites: true // Angular 19: permite escribir signals dentro del effect
    });

    return loginSignal;
  }

  /**
   * Registra un nuevo usuario
   * Retorna un signal con el estado de la petición
   *
   * @example
   * registerSignal = this.authService.register(userData);
   */
  register(userData: any): Signal<IRestMessage> {
    return this.restClient.LoginRegistroUsuario(userData, 'registro');
  }

  /**
   * Reenvía correo de activación
   * Retorna Observable para compatibilidad
   */
  reenviarActivacion(email: string): Observable<IRestMessage> {
    return this.restClient.ReenviarActivacion(email);
  }

  /**
   * Solicita recuperación de contraseña
   * Retorna Observable para compatibilidad
   */
  solicitarRecuperacion(email: string): Observable<IRestMessage> {
    return this.restClient.SolicitarRecuperacion(email);
  }

  /**
   * Restablece la contraseña usando el token
   * Retorna Observable para compatibilidad
   */
  restablecerPassword(token: string, nuevaPassword: string): Observable<IRestMessage> {
    return this.restClient.RestablecerPassword(token, nuevaPassword);
  }

  /**
   * Cierra sesión y limpia el storage
   * Redirige al login
   */
  logout(): void {
    this.storage.clearSession();
    this.router.navigate(['/usuario/login']);
  }
  //#endregion

  //#region Token Management
  /**
   * Obtiene el access token actual
   */
  getAccessToken(): string | null {
    return this.storage.getAccessToken();
  }

  /**
   * Obtiene el refresh token actual
   */
  getRefreshToken(): string | null {
    return this.storage.getRefreshToken();
  }
  //#endregion

  //#region User Data
  /**
   * Recarga el usuario actual desde el backend
   * NOTA: Este endpoint está en /api/portal, no en /api/zonaUsuario
   */
  recargarUsuarioActual(): Observable<IUsuario> {
    return this.http.get<IRestMessage>(`${this.PORTAL_API_URL}/perfil/me`).pipe(
      map(response => {
        if (response.codigo === 0) {
          const usuario = response.datos as IUsuario;

          // Actualiza el storage con los datos frescos
          this.storage.actualizarUsuario(usuario);

          console.log('✅ Usuario recargado desde backend:', usuario);

          return usuario;
        }
        throw new Error(response.mensaje || 'Error al recargar usuario');
      })
    );
  }
  //#endregion
}
