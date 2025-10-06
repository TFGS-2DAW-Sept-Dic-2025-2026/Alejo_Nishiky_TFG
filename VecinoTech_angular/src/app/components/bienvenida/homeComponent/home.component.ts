import { Component, ElementRef, QueryList, signal, ViewChildren } from '@angular/core';
import {CountUpModule} from 'ngx-countup';
import { ContadorComponent } from '../contadorComponent/contador.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ContadorComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // Números que quiero alcanzar
  endVals: number[] = [10000, 1000, 400];

  // We’ll flip these to real numbers when each item is in view
  counters = signal<number[]>([0, 0, 0]);

  @ViewChildren('counterEl') counterEls!: QueryList<ElementRef<HTMLElement>>;
  private io?: IntersectionObserver;

  ngAfterViewInit() {
    this.io = new IntersectionObserver((entries) => {
      const arr = [...this.counters()];
      entries.forEach((e, idx) => {
        if (e.isIntersecting && arr[idx] === 0) {
          arr[idx] = this.endVals[idx];      // trigger animation by changing endVal
          this.io?.unobserve(e.target);
        }
      });
      this.counters.set(arr);
    }, { threshold: 0.3 });

    // Observe each counter
    this.counterEls.forEach((el, idx) => this.io!.observe(el.nativeElement));
  }
}
