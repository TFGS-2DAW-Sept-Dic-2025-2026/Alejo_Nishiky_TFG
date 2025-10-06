import { Component } from '@angular/core';
import { HeaderComponent } from './headerComponent/header.component';
import { FooterComponent } from './footerComponent/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
