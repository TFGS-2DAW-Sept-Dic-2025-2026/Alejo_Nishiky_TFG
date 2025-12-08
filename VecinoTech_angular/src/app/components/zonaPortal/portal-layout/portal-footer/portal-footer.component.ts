import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-portal-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './portal-footer.component.html',
  styleUrl: './portal-footer.component.css'
})
export class PortalFooterComponent {
  readonly today = new Date();
}
