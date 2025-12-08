import { Routes } from '@angular/router';
import { RegistroComponent } from './components/zonaUsuario/registroComponent/registro.component';
import { LoginComponent } from './components/zonaUsuario/loginComponent/login.component';
import { RecuPasswordComponent } from './components/zonaUsuario/recuPasswordComponent/recu-password.component';
import { LayoutComponent } from './components/bienvenida/layOutComponent/layout.component';
import { HomeComponent } from './components/bienvenida/homeComponent/home.component';
import { ActivarCuentaComponent } from './components/zonaUsuario/activar-cuenta/activar-cuenta.component';
import { authGuard } from './guards/auth.guard';
import { PortalComponent } from './components/zonaPortal/portal.component';
import { VoluntarioComponent } from './components/zonaPortal/voluntarioComponent/voluntario.component';
import { SolicitanteComponent } from './components/zonaPortal/solicitanteComponent/solicitante.component';
import { DetalleSolicitudComponent } from './components/zonaPortal/solicitanteComponent/detalle-solicitud/detalle-solicitud.component';
import { CrearSolicitudComponent } from './components/zonaPortal/solicitanteComponent/crear-solicitud/crear-solicitud.component';
import { MisVoluntariadosComponent } from './components/zonaPortal/voluntarioComponent/mis-voluntariados/mis-voluntariados.component';
import { HistorialComponent } from './components/zonaPortal/historial/historial.component';
import { PerfilComponent } from './components/zonaPortal/perfil/perfil.component';
import { ChatComponent } from './components/zonaPortal/chat/chat.component';

export const routes: Routes = [
  { path:'', redirectTo: '/vecinotech/home', pathMatch: 'full'},
  {
    path: 'vecinotech',
    component: LayoutComponent,
    children: [
      {path: 'home', component: HomeComponent}
    ]
  },
  {
    path: 'usuario',
    component: LayoutComponent,
    children: [
      {path: 'registro', component: RegistroComponent},
      {path: 'login', component: LoginComponent},
      {path: 'recuperarPassword', component: RecuPasswordComponent},
      {path: 'activar', component: ActivarCuentaComponent }
    ]
  },
  // ==================== ZONA PORTAL (autenticado, SIN LayoutComponent) ====================
  {
    path: 'portal',
    component: PortalComponent,
    canActivate: [authGuard]

  },
  {
    path: 'portal/voluntario',
    component: VoluntarioComponent,
    canActivate: [authGuard]
  },
  {
    path: 'portal/solicitante',
    component: SolicitanteComponent,
    canActivate: [authGuard]
  },
  {
  path: 'portal/solicitud/:id',
  component: DetalleSolicitudComponent,
  canActivate: [authGuard]
  },
  {
  path: 'portal/crear-solicitud',
  component: CrearSolicitudComponent,
  canActivate: [authGuard]
  },
  {
  path: 'portal/mis-voluntariados',
  component: MisVoluntariadosComponent,
  canActivate: [authGuard]
  },
  {
    path: 'portal/historial',
    component: HistorialComponent,
    canActivate: [authGuard]
  },
  {
    path: 'portal/perfil',
    component: PerfilComponent,
    canActivate: [authGuard]
  },
  {
    path: 'portal/chat/:id',
    component: ChatComponent,
    canActivate: [authGuard]
  },
  // ==================== FALLBACK ====================
  {
    path: '**',
    redirectTo: '/vecinotech/home'
  }
];
