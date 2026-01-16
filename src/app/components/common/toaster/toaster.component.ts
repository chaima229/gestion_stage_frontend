import { Component, OnInit, PLATFORM_ID, inject, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule],
  template: `<div id="sonner-toaster"></div>`,
})
export class ToasterComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const { Toaster } = await import('sonner');
      // Sonner will auto-initialize when imported
    }
  }
}
