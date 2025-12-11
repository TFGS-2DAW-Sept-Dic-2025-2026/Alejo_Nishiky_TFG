import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Componentes
import { MapaComponent } from './mapaComponent/mapa.component';
import { NavbarComponent } from '../portal-layout/portal-navbar/navbar.component';

// Servicios
import { MapService } from '../../../services/map.service';
import { StorageGlobalService } from '../../../services/storage-global.service';
import { AuthService } from '../../../services/auth.service';
import ISolicitudMapa from '../../../models/solicitud/ISolicitudMapa';

@Component({
  selector: 'app-voluntario',
  imports: [CommonModule, MapaComponent],
  templateUrl: './voluntario.component.html',
  styleUrls: ['./voluntario.component.css']
})
export class VoluntarioComponent implements OnInit {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly mapService = inject(MapService);
  private readonly _router = inject(Router);
  private readonly _storage = inject(StorageGlobalService);
  private readonly authService = inject(AuthService);

  // ==================== SIGNALS - DATA ====================

  private readonly _solicitudes = signal<ISolicitudMapa[]>([]);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');

  // ==================== SIGNALS - UI ====================

  private readonly _reminderSubject = signal<string>('');
  private readonly _reminderTime = signal<string>('');

  /**
   * Controla la visibilidad del modal de no voluntario
   */
  readonly mostrarModalNoVoluntario = signal<boolean>(false);

  // ==================== COMPUTED SIGNALS ====================

  /**
   * Top 5 solicitudes más recientes (abiertas)
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
    // Verificar si es voluntario ANTES de cargar solicitudes
    this.verificarEsVoluntario();

    this.cargarSolicitudes();
    this.escucharEventosGlobales();
  }

  // ==================== VERIFICACIÓN DE PERMISOS ====================

  /**
   * Verifica si el usuario es voluntario recargando desde el backend
   * Si no es voluntario, muestra modal para activar el modo
   */
  private verificarEsVoluntario(): void {
    console.log('🔍 Verificando estado de voluntario...');

    // Recargar usuario desde backend para obtener datos frescos
    this.authService.recargarUsuarioActual().subscribe({
      next: (usuario) => {
        console.log('📥 Usuario recargado:', usuario);

        // Si NO es voluntario, mostrar modal
        if (!usuario.esVoluntario) {
          console.log('⚠️ Usuario NO es voluntario, mostrando modal');
          this.mostrarModalNoVoluntario.set(true);
        } else {
          console.log('✅ Usuario SÍ es voluntario');
        }
      },
      error: (err) => {
        console.error('❌ Error recargando usuario:', err);

        // Fallback: usar el usuario del storage (datos potencialmente viejos)
        const usuario = this._storage.getUsuario();
        if (usuario && !usuario.esVoluntario) {
          this.mostrarModalNoVoluntario.set(true);
        }
      }
    });
  }

  // ==================== CARGA DE DATOS ====================

  /**
   * Carga todas las solicitudes disponibles
   * Primero carga solicitudes abiertas, luego chats activos
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
        console.error('❌ Error cargando solicitudes:', err);
        this._error.set('No se pudieron cargar las solicitudes');
        this._loading.set(false);
      }
    });
  }

  /**
   * Carga solicitudes EN_PROCESO donde el usuario es voluntario
   * @param solicitudesAbiertas - Solicitudes abiertas ya cargadas
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
        console.error('❌ Error cargando chats activos:', err);
        this._solicitudes.set(solicitudesAbiertas);
        this._loading.set(false);
      }
    });
  }

  // ==================== EVENTOS GLOBALES ====================

  /**
   * Escucha eventos globales desde popups de Leaflet
   * Permite aceptar solicitudes desde el mapa
   */
  private escucharEventosGlobales(): void {
    document.addEventListener('aceptar-solicitud', (event: any) => {
      const solicitudId = event.detail;
      this.aceptarSolicitud(solicitudId);
    });
  }

  // ==================== GESTIÓN DE SOLICITUDES ====================

  /**
   * Acepta una solicitud y navega al chat
   * Pide confirmación antes de aceptar
   * @param solicitudId - ID de la solicitud a aceptar
   */
  aceptarSolicitud(solicitudId: number): void {
    Swal.fire({
      icon: 'question',
      title: '¿Aceptar esta solicitud?',
      text: 'Te comprometes a ayudar con esta solicitud',
      showCancelButton: true,
      confirmButtonText: 'Sí, aceptar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this._loading.set(true);

      this.mapService.aceptarSolicitud(solicitudId).subscribe({
        next: (response) => {
          this._loading.set(false);

          if (response.codigo === 0) {
            Swal.fire({
              icon: 'success',
              title: '¡Solicitud aceptada!',
              text: 'Ahora puedes chatear con el solicitante',
              confirmButtonText: 'Ir al chat',
              confirmButtonColor: '#10b981',
              timer: 2000,
              timerProgressBar: true
            }).then(() => {
              this.cargarSolicitudes();
              this._router.navigate(['/portal/chat', solicitudId]);
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al aceptar',
              text: response.mensaje,
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#3b82f6'
            });
          }
        },
        error: (err) => {
          this._loading.set(false);
          console.error('❌ Error aceptando solicitud:', err);

          Swal.fire({
            icon: 'error',
            title: 'Error al aceptar la solicitud',
            text: 'Por favor, inténtalo de nuevo',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3b82f6'
          });
        }
      });
    });
  }

  /**
   * Handler cuando se hace click en una solicitud del mapa
   * @param solicitudId - ID de la solicitud clickeada
   */
  onSolicitudClickMapa(solicitudId: number): void {
    console.log('📍 Click en solicitud del mapa:', solicitudId);
    this.aceptarSolicitud(solicitudId);
  }

  /**
   * Handler de errores del mapa
   * @param error - Mensaje de error
   */
  onErrorMapa(error: string): void {
    this._error.set(error);
  }

  /**
   * Continúa una conversación existente en el chat
   * @param solicitudId - ID de la solicitud
   */
  continuarChat(solicitudId: number): void {
    this._router.navigate(['/portal/chat', solicitudId]);
  }

  // ==================== RECORDATORIOS ====================

  /**
   * Establece la materia del recordatorio
   * @param subject - Materia seleccionada
   */
  setReminderSubject(subject: string): void {
    this._reminderSubject.set(subject);
  }

  /**
   * Establece el tiempo del recordatorio
   * @param time - Tiempo seleccionado
   */
  setReminderTime(time: string): void {
    this._reminderTime.set(time);
  }

  /**
   * Crea un recordatorio
   * Valida que se hayan seleccionado materia y tiempo
   */
  setReminder(): void {
    const subject = this._reminderSubject();
    const time = this._reminderTime();

    if (!subject || !time) {
      Swal.fire({
        icon: 'warning',
        title: 'Recordatorio incompleto',
        text: 'Por favor selecciona una materia y un horario',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: '¡Recordatorio establecido!',
      html: `<strong>${subject}</strong><br>${time}`,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#10b981',
      timer: 2500,
      timerProgressBar: true
    });

    this._reminderSubject.set('');
    this._reminderTime.set('');
  }

  // ==================== NAVEGACIÓN ====================

  /**
   * Navega al mapa (scroll suave al inicio)
   */
  irAlMapa(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Vuelve al portal principal
   */
  volverPortal(): void {
    this._router.navigate(['/portal']);
  }

  /**
   * Navega a la lista de voluntariados
   */
  irAMisVoluntariados(): void {
    this._router.navigate(['/portal/mis-voluntariados']);
  }

  /**
   * Navega al historial de solicitudes
   */
  irAHistorial(): void {
    this._router.navigate(['/portal/historial']);
  }

  /**
   * Redirige al perfil para activar modo voluntario
   */
  irAPerfil(): void {
    this._router.navigate(['/portal/perfil']);
  }

  // ==================== HELPERS ====================

  /**
   * Calcula el tiempo transcurrido desde una fecha
   * @param fecha - Fecha en formato string
   * @returns Texto descriptivo del tiempo transcurrido
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

  /**
   * Obtiene las iniciales de un nombre
   * @param nombre - Nombre completo
   * @returns Iniciales (máximo 2 caracteres)
   */
  obtenerIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map(palabra => palabra.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // ==================== AUTENTICACIÓN ====================

  /**
   * Cierra la sesión del usuario
   * Pide confirmación antes de cerrar sesión
   */
  logout(): void {
    Swal.fire({
      icon: 'question',
      title: '¿Cerrar sesión?',
      text: 'Tendrás que volver a iniciar sesión',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Logout');
        // TODO: Implementar logout completo
      }
    });
  }
}
