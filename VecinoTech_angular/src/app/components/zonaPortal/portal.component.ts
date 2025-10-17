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
  //Injecciones
  private _storage = inject(StorageGlobalService);
  private _portalService = inject(RestPortalService);
  private _router = inject(Router);

  // Usuario (reactivo, readonly)
  usuarioSig = this._storage.usuarioSig;

  // Banner random con las imagenes
  randomNumber = Math.floor(Math.random() * 3) + 1;
  bannerUrl = `assets/portal/slide-${this.randomNumber}.jpg`;

  // Avatar estable: si no hay foto, usa pravatar con el id del usuario para que no cambie
  avatarUrlSig = computed(() => {
      const u = this.usuarioSig();
      if (!u) return 'https://i.pravatar.cc/80';
      // Si algún día agregas avatarUrl al modelo, prioriza esa:
      // return u.avatarUrl ?? `https://i.pravatar.cc/80?u=${u.id}`;
      return `https://i.pravatar.cc/80?u=${u.id}`;
  });

  // Llamadas remotas (signals)
  leaderboardR = this._portalService.getLeaderboard();
  leaders = computed( () => (this.leaderboardR().datos ?? []) as IPortalLeader[]);
  maxPoints = computed(() => {
    const l = this.leaders();
    return l.length ? Math.max(...l.map(x => x.points)) : 1;
  });
  barWidth = (points: number) => Math.round((points / this.maxPoints()) * 100);


  // Botones de acciones
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
