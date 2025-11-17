import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componente hijo


// Servicios
import { MapService } from '../../../services/map.service';

// Interfaces
import ISolicitudMapa from '../../../models/interfaces_orm/mapa/ISolicitudMapa';
import { MapaComponent } from './mapaComponent/mapa.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-voluntario',
  standalone: true,
  imports: [CommonModule, MapaComponent], // ← Ya NO necesitamos FormsModule
  templateUrl: './voluntario.component.html',
  styleUrls: ['./voluntario.component.css']
})
export class VoluntarioComponent implements OnInit {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly mapService = inject(MapService);
  private readonly _router = inject(Router);

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
    return this._solicitudes().slice(0, 5);
  });

  /**
   * Solicitudes filtradas por búsqueda (para el mapa)
   */
  readonly solicitudesFiltradas = computed(() => {
    return this._solicitudes();
  });

  // ✅ Computed públicos para el template
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

    this.mapService.getSolicitudesMapa().subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          this._solicitudes.set(response.datos as ISolicitudMapa[]);
        } else {
          this._error.set(response.mensaje || 'Error al cargar solicitudes');
        }
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando solicitudes:', err);
        this._error.set('No se pudieron cargar las solicitudes');
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

  // ==================== MÉTODOS PÚBLICOS - BÚSQUEDA ====================

  /**
   * Actualiza búsqueda de ubicación
   */
  // buscarLocation(query: string): void {
  //   this._busquedaLocation.set(query);
  // }

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
          this.cargarSolicitudes(); // Recargar lista
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

  // ==================== MÉTODOS PÚBLICOS - RECORDATORIOS ====================

  /**
   * Actualiza el subject del reminder
   */
  setReminderSubject(subject: string): void {
    this._reminderSubject.set(subject);
  }

  /**
   * Actualiza el time del reminder
   */
  setReminderTime(time: string): void {
    this._reminderTime.set(time);
  }

  /**
   * Establece un recordatorio
   */
  setReminder(): void {
    const subject = this._reminderSubject();
    const time = this._reminderTime();

    if (!subject || !time) {
      alert('⚠️ Por favor selecciona una materia y un horario');
      return;
    }

    // TODO: Implementar backend de recordatorios
    alert(`✅ Recordatorio establecido:\n${subject} - ${time}`);

    // Resetear formulario
    this._reminderSubject.set('');
    this._reminderTime.set('');
  }

  // ==================== HELPERS ====================

  /**
   * Calcula tiempo transcurrido desde una fecha
   */
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

  //Regresar al dashboard del portal
  volverPortal(): void {
  this._router.navigate(['/portal']);
}

  /**
   * Obtiene iniciales del nombre
   */
  obtenerIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map(palabra => palabra.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

    /**
   * Navega a mis voluntariados
   */
  irAMisVoluntariados(): void {
    this._router.navigate(['/portal/mis-voluntariados']);
  }

  /**
   * Logout
   */
  logout(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      // TODO: Implementar logout con AuthService
      console.log('Logout');
    }
  }
}
