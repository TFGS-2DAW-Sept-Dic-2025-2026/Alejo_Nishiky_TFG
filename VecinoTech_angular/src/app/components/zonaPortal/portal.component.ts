import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { StorageGlobalService } from '../../services/storage-global.service';
import { RestPortalService } from '../../services/rest-portal.service';
import { IPortalLeader } from '../../models/portal/IPortalLeader';
import { NavbarComponent } from './portal-layout/portal-navbar/navbar.component';

@Component({
  selector: 'app-portal',
  imports: [CommonModule],
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.css']
})
export class PortalComponent {

  // ==================== DEPENDENCY INJECTION ====================

  private readonly _storage = inject(StorageGlobalService);
  private readonly _portalService = inject(RestPortalService);
  private readonly _router = inject(Router);

  // ==================== SIGNALS ====================

  /**
   * Usuario actual (reactivo, readonly)
   */
  readonly usuarioSig = this._storage.usuarioSig;

  // ==================== BANNER ALEATORIO ====================

  /**
   * Número aleatorio para seleccionar banner (1-3)
   */
  readonly randomNumber = Math.floor(Math.random() * 3) + 1;

  /**
   * URL del banner aleatorio
   */
  readonly bannerUrl = `assets/portal/slide-${this.randomNumber}.jpg`;

  // ==================== AVATAR ====================

  /**
   * URL del avatar del usuario
   * Usa pravatar.cc con el ID del usuario para mantener consistencia
   * Si el usuario tiene avatarUrl, usa ese; de lo contrario genera uno estable
   */
  readonly avatarUrlSig = computed(() => {
    const u = this.usuarioSig();
    if (!u) return 'https://i.pravatar.cc/80';

    // Si algún día agregas avatarUrl al modelo, prioriza esa:
    // return u.avatarUrl ?? `https://i.pravatar.cc/80?u=${u.id}`;
    return `https://i.pravatar.cc/80?u=${u.id}`;
  });

  // ==================== LEADERBOARD ====================

  /**
   * Respuesta del endpoint de leaderboard
   */
  readonly leaderboardR = this._portalService.getLeaderboard();

  /**
   * Lista de líderes del ranking
   */
  readonly leaders = computed(() => (this.leaderboardR().datos ?? []) as IPortalLeader[]);

  /**
   * Puntuación máxima del leaderboard
   * Usado para calcular el ancho de las barras de progreso
   */
  readonly maxPoints = computed(() => {
    const leader = this.leaders();
    return leader.length ? Math.max(...leader.map(x => x.points)) : 1;
  });

  /**
   * Calcula el ancho de la barra de progreso en porcentaje
   * @param points - Puntos del líder
   * @returns Porcentaje del ancho (0-100)
   */
  barWidth = (points: number): number => Math.round((points / this.maxPoints()) * 100);

  // ==================== ACCIONES PRINCIPALES ====================

  /**
   * Navega a la vista de voluntario
   * El usuario puede ver el mapa y aceptar solicitudes
   */
  onVolunteer(): void {
    console.log('📍 Usuario seleccionó modo voluntario');
    // const r = this._portalService.postVolunteer(); // Por si necesito registrar en backend
    this._router.navigate(['/portal/voluntario']);
  }

  /**
   * Navega a la vista de solicitante
   * El usuario puede crear solicitudes de ayuda
   */
  onNeedHelp(): void {
    console.log('🆘 Usuario solicitó ayuda');
    // const r = this._portalService.postNeedHelp(); // Por si necesito registrar en backend
    this._router.navigate(['/portal/solicitante']);
  }

  // ==================== NAVEGACIÓN ====================

  /**
   * Navega a la lista de voluntariados del usuario
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
   * Navega al perfil del usuario
   */
  irAPerfil(): void {
    this._router.navigate(['/portal/perfil']);
  }

  // ==================== AUTENTICACIÓN ====================

  /**
   * Cierra la sesión del usuario
   * Pide confirmación antes de cerrar sesión y redirige al home
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
        this._storage.clearSession();
        this._router.navigateByUrl('/VecinoTech/Home');
      }
    });
  }
}
