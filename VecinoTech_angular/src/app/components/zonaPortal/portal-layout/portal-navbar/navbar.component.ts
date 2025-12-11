import { Component, computed, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { StorageGlobalService } from '../../../../services/storage-global.service';
import { AvatarUrlPipe } from '../../../../pipes/avatar-url.pipe';

type NavbarMode = 'portal' | 'solicitante' | 'voluntario';

@Component({
  selector: 'app-portal-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly storage = inject(StorageGlobalService);
  private readonly router = inject(Router);
  private readonly avatarPipe = new AvatarUrlPipe();

  // ==================== INPUTS ====================

  /**
   * Modo del navbar: determina qué botones se muestran
   * - 'portal': Vista principal (sin botón de volver)
   * - 'solicitante': Vista de solicitante
   * - 'voluntario': Vista de voluntario (con mapa y voluntariados)
   */
  @Input() mode: NavbarMode = 'portal';

  // ==================== COMPUTED SIGNALS ====================

  readonly usuarioSig = this.storage.usuarioSig;

  /**
   * URL del avatar del usuario
   * Si no tiene avatar, usa pravatar.cc como fallback
   */
  readonly avatarUrlSig = computed(() => {
    const u = this.usuarioSig();
    if (!u) return 'https://i.pravatar.cc/80';

    // Usa la pipe para transformar la URL
    return this.avatarPipe.transform(u.avatarUrl, u.nombre);
  });

  /**
   * Nombre del usuario actual
   */
  readonly nombreUsuario = computed(() => {
    const u = this.usuarioSig();
    return u?.nombre ?? 'Usuario';
  });

  // ==================== VISIBILIDAD DE BOTONES ====================

  /**
   * Determina si se muestra el botón "Volver al Portal"
   * Solo visible cuando NO estamos en la vista portal
   */
  readonly mostrarBotonPortal = computed(() => this.mode !== 'portal');

  /**
   * Determina si se muestra el botón "Mapa"
   * Solo visible en modo voluntario
   */
  readonly mostrarBotonMapa = computed(() => this.mode === 'voluntario');

  /**
   * Determina si se muestra el botón "Mis Voluntariados"
   * Solo visible en modo voluntario
   */
  readonly mostrarBotonVoluntariados = computed(() => this.mode === 'voluntario');

  /**
   * Determina si se muestra el botón "Historial"
   * Solo visible en modo voluntario
   */
  readonly mostrarBotonHistorial = computed(() => this.mode === 'voluntario');

  // ==================== NAVEGACIÓN ====================

  /**
   * Navega a la vista principal del portal
   */
  irAlPortal(): void {
    this.router.navigate(['/portal']);
  }

  /**
   * Navega al mapa de voluntarios
   */
  irAlMapa(): void {
    this.router.navigate(['/portal/voluntario']);
  }

  /**
   * Navega a la lista de voluntariados del usuario
   */
  irAMisVoluntariados(): void {
    this.router.navigate(['/portal/mis-voluntariados']);
  }

  /**
   * Navega al historial de solicitudes
   */
  irAHistorial(): void {
    this.router.navigate(['/portal/historial']);
  }

  /**
   * Navega al perfil del usuario
   */
  irAPerfil(): void {
    this.router.navigate(['/portal/perfil']);
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
        this.storage.clearSession();
        this.router.navigateByUrl('/VecinoTech/Home');
      }
    });
  }
}
