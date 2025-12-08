import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Componentes
import { MapaComponent } from './mapaComponent/mapa.component';
import { NavbarComponent } from '../navbar/navbar.component';

// Servicios
import { MapService } from '../../../services/map.service';
import { StorageGlobalService } from '../../../services/storage-global.service';

// Interfaces
import ISolicitudMapa from '../../../models/interfaces_orm/mapa/ISolicitudMapa';

@Component({
  selector: 'app-voluntario',
  imports: [CommonModule, MapaComponent, NavbarComponent],
  templateUrl: './voluntario.component.html',
  styleUrls: ['./voluntario.component.css']
})
export class VoluntarioComponent implements OnInit {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly mapService = inject(MapService);
  private readonly _router = inject(Router);
  private readonly _storage = inject(StorageGlobalService);

  // ==================== SIGNALS - DATA ====================

  private readonly _solicitudes = signal<ISolicitudMapa[]>([]);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');

  // ==================== SIGNALS - UI ====================

  private readonly _reminderSubject = signal<string>('');
  private readonly _reminderTime = signal<string>('');

  // ==================== COMPUTED SIGNALS ====================

  /**
   * Top 5 solicitudes más recientes
   */
  readonly topSolicitudes = computed(() => {
    return this._solicitudes()
      .filter(s => s.estado === 'ABIERTA')
      .slice(0, 5);
  });

  /**
   * Solicitudes EN_PROCESO donde soy voluntario (chats activos)
   */
  readonly misChatsActivos = computed(() => {
    const usuario = this._storage.getUsuario();
    if (!usuario) return [];

    return this._solicitudes()
      .filter(s =>
        s.estado === 'EN_PROCESO' &&
        s.voluntario?.id === usuario.id
      );
  });

  /**
   * Solicitudes filtradas para el mapa (solo ABIERTAS)
   */
  readonly solicitudesFiltradas = computed(() => {
    return this._solicitudes().filter(s => s.estado === 'ABIERTA');
  });

  readonly reminderSubject = computed(() => this._reminderSubject());
  readonly reminderTime = computed(() => this._reminderTime());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly totalSolicitudes = computed(() => this._solicitudes().length);

  // ==================== PROPIEDADES ====================

  readonly reminderSubjects = ['Math', 'Science', 'English', 'History', 'Spanish'];
  readonly reminderTimes = ['Next Hour', 'Tomorrow', 'Next Week'];

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.cargarSolicitudes();
    this.escucharEventosGlobales();
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Carga solicitudes del backend
   */
  private cargarSolicitudes(): void {
    this._loading.set(true);
    this._error.set('');

    // Cargar solicitudes ABIERTAS
    this.mapService.getSolicitudesMapa().subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          const solicitudesAbiertas = response.datos as ISolicitudMapa[];
          this.cargarMisChatsActivos(solicitudesAbiertas);
        } else {
          this._error.set(response.mensaje || 'Error al cargar solicitudes');
          this._loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error cargando solicitudes:', err);
        this._error.set('No se pudieron cargar las solicitudes');
        this._loading.set(false);
      }
    });
  }

  /**
   * Carga solicitudes EN_PROCESO donde soy voluntario
   */
  private cargarMisChatsActivos(solicitudesAbiertas: ISolicitudMapa[]): void {
    this.mapService.getSolicitudesComoVoluntario().subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          const misChats = response.datos as ISolicitudMapa[];
          const todasLasSolicitudes = [...solicitudesAbiertas, ...misChats];
          this._solicitudes.set(todasLasSolicitudes);
        }
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando chats activos:', err);
        this._solicitudes.set(solicitudesAbiertas);
        this._loading.set(false);
      }
    });
  }

  /**
   * Escucha eventos globales desde popups de Leaflet
   */
  private escucharEventosGlobales(): void {
    document.addEventListener('aceptar-solicitud', (event: any) => {
      const solicitudId = event.detail;
      this.aceptarSolicitud(solicitudId);
    });
  }

  // ==================== MÉTODOS PÚBLICOS - SOLICITUDES ====================

  /**
   * Acepta una solicitud
   */
  aceptarSolicitud(solicitudId: number): void {
    if (!confirm('¿Deseas aceptar esta solicitud?')) {
      return;
    }

    this._loading.set(true);

    this.mapService.aceptarSolicitud(solicitudId).subscribe({
      next: (response) => {
        this._loading.set(false);

        if (response.codigo === 0) {
          alert('✅ Solicitud aceptada correctamente');
          this.cargarSolicitudes();
          this._router.navigate(['/portal/chat', solicitudId]);
        } else {
          alert(`❌ ${response.mensaje}`);
        }
      },
      error: (err) => {
        this._loading.set(false);
        console.error('Error aceptando solicitud:', err);
        alert('❌ Error al aceptar la solicitud');
      }
    });
  }

  /**
   * Handler cuando se hace click en el mapa
   */
  onSolicitudClickMapa(solicitudId: number): void {
    console.log('Click en solicitud del mapa:', solicitudId);
    this.aceptarSolicitud(solicitudId);
  }

  /**
   * Handler de errores del mapa
   */
  onErrorMapa(error: string): void {
    this._error.set(error);
  }

  /**
   * Continuar conversación en el chat
   */
  continuarChat(solicitudId: number): void {
    this._router.navigate(['/portal/chat', solicitudId]);
  }

  // ==================== MÉTODOS PÚBLICOS - RECORDATORIOS ====================

  setReminderSubject(subject: string): void {
    this._reminderSubject.set(subject);
  }

  setReminderTime(time: string): void {
    this._reminderTime.set(time);
  }

  setReminder(): void {
    const subject = this._reminderSubject();
    const time = this._reminderTime();

    if (!subject || !time) {
      alert('⚠️ Por favor selecciona una materia y un horario');
      return;
    }

    alert(`✅ Recordatorio establecido:\n${subject} - ${time}`);

    this._reminderSubject.set('');
    this._reminderTime.set('');
  }

  // ==================== MÉTODOS PÚBLICOS - NAVEGACIÓN ====================

  /**
   * Navega al mapa (mismo componente, scroll top)
   */
  irAlMapa(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  volverPortal(): void {
    this._router.navigate(['/portal']);
  }

  irAMisVoluntariados(): void {
    this._router.navigate(['/portal/mis-voluntariados']);
  }

  irAHistorial(): void {
    this._router.navigate(['/portal/historial']);
  }

  // ==================== HELPERS ====================

  calcularTiempoTranscurrido(fecha: string): string {
    if (!fecha) return 'Fecha desconocida';

    const ahora = new Date();
    const fechaSolicitud = new Date(fecha);
    const diff = ahora.getTime() - fechaSolicitud.getTime();

    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Hace menos de 1 minuto';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  }

  obtenerIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map(palabra => palabra.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      console.log('Logout');
    }
  }
}
