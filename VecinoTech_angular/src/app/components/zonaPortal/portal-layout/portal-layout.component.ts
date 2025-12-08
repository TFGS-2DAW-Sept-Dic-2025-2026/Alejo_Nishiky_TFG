import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './portal-navbar/navbar.component';
import { PortalFooterComponent } from './portal-footer/portal-footer.component';

@Component({
  selector: 'app-portal-layout',
  imports: [RouterOutlet, NavbarComponent, PortalFooterComponent],
  templateUrl: './portal-layout.component.html',
  styleUrls: ['./portal-layout.component.css']
})
export class PortalLayoutComponent {
  // Este componente solo maneja el layout del portal
  // No tiene lógica propia, solo estructura =)
}
