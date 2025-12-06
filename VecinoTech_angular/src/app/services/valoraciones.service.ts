import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

// Models
import { IValoracion, ICrearValoracionRequest } from '../models/interfaces_orm/IValoracion';
import IRestMessage from '../models/IRestMessage';
import { StorageGlobalService } from './storage-global.service';

@Injectable({
  providedIn: 'root'
})
export class ValoracionesService {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageGlobalService);

  // ==================== PROPIEDADES ====================

  private readonly API_URL = 'http://localhost:8080/api/portal/valoraciones';

  // ==================== SIGNALS (para datos reactivos) ====================

  /**
   * Signal para forzar recarga de valoraciones
   */
  private readonly _reloadTrigger = signal<number>(0);

  // ==================== MÉTODOS CON OBSERVABLES (acciones CRUD) ====================

  /**
   * Crea una valoración (acción puntual - Observable)
   */
  crearValoracion(request: ICrearValoracionRequest): Observable<IRestMessage> {
    const headers = this.getAuthHeaders();
    return this.http.post<IRestMessage>(
      this.API_URL,
      request,
      { headers }
    );
  }

  /**
   * Verifica si una solicitud ya fue valorada (consulta puntual - Observable)
   */
  verificarSiYaValorada(solicitudId: number): Observable<IRestMessage> {
    const headers = this.getAuthHeaders();
    return this.http.get<IRestMessage>(
      `${this.API_URL}/verificar/${solicitudId}`,
      { headers }
    );
  }

  // ==================== MÉTODOS CON toSignal() (consultas reactivas) ====================

  /**
   * Obtiene valoraciones de un voluntario (reactivo - toSignal)
   * Uso: const valoraciones = this.valoracionesService.obtenerValoracionesVoluntario(voluntarioId);
   */
  obtenerValoracionesVoluntario(voluntarioId: number) {
    const headers = this.getAuthHeaders();

    return toSignal(
      this.http.get<IRestMessage>(
        `${this.API_URL}/voluntario/${voluntarioId}`,
        { headers }
      ),
      {
        initialValue: {
          codigo: 100,
          mensaje: 'Cargando...',
          datos: []
        }
      }
    );
  }

  /**
   * Obtiene valoración de una solicitud (reactivo - toSignal)
   */
  obtenerValoracionSolicitud(solicitudId: number) {
    const headers = this.getAuthHeaders();

    return toSignal(
      this.http.get<IRestMessage>(
        `${this.API_URL}/solicitud/${solicitudId}`,
        { headers }
      ),
      {
        initialValue: {
          codigo: 100,
          mensaje: 'Cargando...',
          datos: null
        }
      }
    );
  }

  // ==================== HELPERS ====================

  /**
   * Obtiene headers con autenticación
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.storage.getAccessToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * Fuerza recarga de datos (opcional, para casos específicos)
   */
  recargarDatos(): void {
    this._reloadTrigger.update(v => v + 1);
  }
}

/*
Método |Tipo | Cuándo usar
crearValoracion() |Observable✅ | Acción puntual (crear)
verificarSiYaValorada | ()Observable✅  | Consulta puntual (sí/no)
obtenerValoracionesVoluntario() | toSignal()✅ | Datos reactivos para ranking
obtenerValoracionSolicitud() | toSignal() ✅ | Datos reactivos para historial
*/
