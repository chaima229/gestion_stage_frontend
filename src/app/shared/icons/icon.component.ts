import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Icons } from './icons';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<span
    [innerHTML]="svgContent"
    [class]="class"
    [style.width.px]="size"
    [style.height.px]="size"
  ></span>`,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      span ::ng-deep svg {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class IconComponent {
  @Input() name: keyof typeof Icons = 'layoutDashboard';
  @Input() size: number = 24;
  @Input() class: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  get svgContent(): SafeHtml {
    const svg = Icons[this.name] || Icons.layoutDashboard;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
