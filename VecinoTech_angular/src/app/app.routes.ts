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

export const routes: Routes = [
  { path:'', redirectTo: '/VecinoTech/Home', pathMatch: 'full'},
  {
    path: 'VecinoTech',
    component: LayoutComponent,
    children: [
      {path: 'Home', component: HomeComponent}
    ]
  },
  {
    path: 'Usuario',
    children: [
      {path: 'Registro', component: RegistroComponent},
      {path: 'Login', component: LoginComponent},
      //{path: 'Verificar/:operacion', component:  Verif2FacodeComponent},
      {path: 'RecuperarPassword', component: RecuPasswordComponent},
      {path: 'Activar', component: ActivarCuentaComponent }
    ]
  },
  {
    path: 'Portal',
    component: PortalComponent,
    canActivate: [authGuard],
    children: [
      {path: 'Voluntario', component: VoluntarioComponent},
      {path: 'Solicitante', component: SolicitanteComponent}
    ]
  }
];
