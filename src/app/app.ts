import { Component, OnInit, PLATFORM_ID, inject, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const { toast } = await import('sonner');
      // Initialize toaster
      const container = document.getElementById('toaster-container');
      if (container) {
        const toasterDiv = document.createElement('div');
        toasterDiv.setAttribute('data-sonner-toaster', '');
        container.appendChild(toasterDiv);
      }
    }
  }
}
