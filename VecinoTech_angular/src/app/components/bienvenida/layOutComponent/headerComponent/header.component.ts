import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  mobileOpen = signal(false);
  toggleMobile() { this.mobileOpen.set(!this.mobileOpen()); }
  closeMobile()  { this.mobileOpen.set(false); }
}
