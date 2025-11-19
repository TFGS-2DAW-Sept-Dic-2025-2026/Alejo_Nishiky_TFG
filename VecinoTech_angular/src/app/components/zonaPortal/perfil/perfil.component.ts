import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Servicios
import { AuthService } from '../../../services/auth.service';

// Interfaces
import { IUsuario } from '../../../models/interfaces_orm/IUsuario';

interface EstadisticasUsuario {
  solicitudes_creadas: number;
  solicitudes_completadas: number;
  ayudas_realizadas: number;
  tasa_exito: number;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // ==================== SIGNALS ====================

  private readonly _perfil = signal<IUsuario | null>(null);
  private readonly _estadisticas = signal<EstadisticasUsuario>({
    solicitudes_creadas: 0,
    solicitudes_completadas: 0,
    ayudas_realizadas: 0,
    tasa_exito: 0
  });
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');

  // ==================== COMPUTED SIGNALS ====================

  readonly perfil = computed(() => this._perfil());
  readonly estadisticas = computed(() => this._estadisticas());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  /**
   * URL del avatar
   */
  readonly avatarUrl = computed(() => {
    const perfil = this._perfil();
    if (!perfil) return 'https://ui-avatars.com/api/?name=Usuario&background=random&size=128';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(perfil.nombre)}&background=random&size=128`;
  });

  /**
   * Iniciales del usuario
   */
  readonly iniciales = computed(() => {
    const perfil = this._perfil();
    if (!perfil) return 'U';
    return perfil.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  });

  /**
   * Fecha de registro formateada
   */
  readonly fechaRegistroFormateada = computed(() => {
    const perfil = this._perfil();
    if (!perfil || !perfil.fechaCreacion) return 'No disponible';

    const fecha = new Date(perfil.fechaCreacion);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // ==================== CONSTRUCTOR ====================

  constructor() {
    this.cargarPerfil();
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Carga el perfil del usuario actual
   */
  private cargarPerfil(): void {
    this._loading.set(true);
    this._error.set('');

    // Obtener datos del usuario desde AuthService (computed signal)
    const usuario = this.authService.currentUser();

    if (usuario) {
      // Usar directamente el objeto IUsuario
      this._perfil.set(usuario);

      // Cargar estadísticas (temporal con datos de ejemplo)
      this.cargarEstadisticas();
    } else {
      this._error.set('No se pudo cargar el perfil');
    }

    this._loading.set(false);
  }

  /**
   * Carga las estadísticas del usuario
   */
  private cargarEstadisticas(): void {
    // TODO: Implementar endpoint real para estadísticas
    // Por ahora usamos datos de ejemplo
    this._estadisticas.set({
      solicitudes_creadas: 12,
      solicitudes_completadas: 8,
      ayudas_realizadas: 15,
      tasa_exito: 85
    });
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Navega a editar perfil
   */
  editarPerfil(): void {
    this.router.navigate(['/portal/perfil/editar']);
  }

  /**
   * Abre modal o página para cambiar contraseña
   */
  cambiarContrasena(): void {
    // TODO: Implementar cambio de contraseña
    alert('Funcionalidad de cambiar contraseña en desarrollo');
  }

  /**
   * Volver al portal
   */
  volverPortal(): void {
    this.router.navigate(['/portal']);
  }

  /**
   * Logout
   */
  logout(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/usuario/login']);
    }
  }
}
