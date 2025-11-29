import { Component, computed, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageGlobalService } from '../../../services/storage-global.service';

type NavbarMode = 'portal' | 'solicitante' | 'voluntario';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly storage = inject(StorageGlobalService);
  private readonly router = inject(Router);

  // ==================== INPUTS ====================

  /**
   * Modo del navbar: determina qué botones se muestran
   */
  @Input() mode: NavbarMode = 'portal';

  // ==================== COMPUTED ====================

  readonly usuarioSig = this.storage.usuarioSig;

  readonly avatarUrlSig = computed(() => {
    const u = this.usuarioSig();
    if (!u) return 'https://i.pravatar.cc/80';
    return u.avatarUrl ?? `https://i.pravatar.cc/80?u=${u.id}`;
  });

  readonly nombreUsuario = computed(() => {
    const u = this.usuarioSig();
    return u?.nombre ?? 'Usuario';
  });

  // ==================== COMPUTED - BOTONES DINÁMICOS ====================

  /**
   * Determina si se muestra el botón "Volver al Portal"
   */
  readonly mostrarBotonPortal = computed(() => this.mode !== 'portal');

  /**
   * Determina si se muestra el botón "Mapa"
   */
  readonly mostrarBotonMapa = computed(() => this.mode === 'voluntario');

  /**
   * Determina si se muestra el botón "Mis Voluntariados"
   */
  readonly mostrarBotonVoluntariados = computed(() => this.mode === 'voluntario');

  /**
   * Determina si se muestra el botón "Historial"
   */
  readonly mostrarBotonHistorial = computed(() =>
    this.mode === 'voluntario' || this.mode === 'solicitante'
  );

  // ==================== MÉTODOS DE NAVEGACIÓN ====================

  irAlPortal(): void {
    this.router.navigate(['/portal']);
  }

  irAlMapa(): void {
    this.router.navigate(['/portal/voluntario']);
  }

  irAMisVoluntariados(): void {
    this.router.navigate(['/portal/mis-voluntariados']);
  }

  irAHistorial(): void {
    this.router.navigate(['/portal/historial']);
  }

  irAPerfil(): void {
    this.router.navigate(['/portal/perfil']);
  }

  logout(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      this.storage.clearSession();
      this.router.navigateByUrl('/VecinoTech/Home');
    }
  }
}
