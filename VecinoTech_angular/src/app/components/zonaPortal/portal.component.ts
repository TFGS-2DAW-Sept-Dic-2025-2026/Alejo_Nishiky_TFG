import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageGlobalService } from '../../services/storage-global.service';
import { RestPortalService } from '../../services/rest-portal.service';
import { IPortalLeader } from '../../models/portal/IPortalLeader';
import { routes } from '../../app.routes';
import { Router } from '@angular/router';




@Component({
  selector: 'app-portal',
  imports: [CommonModule],
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.css']
})
export class PortalComponent {
   // Simula usuario logueado (conecta esto a tu StorageGlobalService si quieres)
  private _storage = inject(StorageGlobalService);
  private _portalService = inject(RestPortalService);
  private _router = inject(Router);

  // Usuario (reactivo, readonly)
  usuarioSig = this._storage.usuarioSig;

  // Banner random con nuestras imagenes
  randomNumber = Math.floor(Math.random() * 3) + 1;
  bannerUrl = `assets/portal/slide-${this.randomNumber}.jpg`;


  // Llamadas remotas (signals)
  leaderboardR = this._portalService.getLeaderboard();
  activitiesR = this._portalService.getRecentActivities();

  leaders = computed( () => (this.leaderboardR().datos ?? []) as IPortalLeader[]);
  maxPoints = computed(() => {
    const l = this.leaders();
    return l.length ? Math.max(...l.map(x => x.points)) : 1;
  });
  barWidth = (points: number) => Math.round((points / this.maxPoints()) * 100);

  // Actividades recientes

  // Botones de accion
  logout() {
    this._storage.clearSession();
    this._router.navigateByUrl('/VecinoTech/Home');
  }

  onVolunteer() {
    console.log('Has escogido voluntario!!!!');
    const r = this._portalService.postVolunteer();
  }
  onNeedHelp() {
    console.log('Has escogido Ayuda!!!!!!!!!');
    const r = this._portalService.postNeedHelp();
  }
}
