import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { CountUp } from 'countup.js';

@Component({
  selector: 'app-contador',
  imports: [],
  templateUrl: './contador.component.html',
  styleUrl: './contador.component.css'
})
export class ContadorComponent implements OnInit {

  @Input() end = 1000;
  @Input() duration = 1.2;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() decimalPlaces = 0;
  @Input() enableScrollTrigger = true;

  constructor(private host: ElementRef<HTMLElement>) {}


  ngOnInit(): void {
    const run = () => {
      const el = this.host.nativeElement.querySelector('span') as HTMLElement;
      const cu = new CountUp(el, this.end, {
        startVal: 0,
        duration: this.duration,
        decimalPlaces: this.decimalPlaces,
        separator: '.',
        decimal: ',',
        prefix: this.prefix,
        suffix: this.suffix,
      });
      if (!cu.error) cu.start();
    };

    if (!this.enableScrollTrigger) {
      run();
      return;
    }

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        run();
        io.disconnect();
      }
    }, { threshold: 0.3 });

    io.observe(this.host.nativeElement);

  }

}
