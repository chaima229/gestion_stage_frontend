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
      const { Toaster } = await import('sonner');
      // Initialize Sonner toaster with shadcn-style options
      const container = document.getElementById('toaster-container');
      if (container) {
        // Create toaster element
        const toasterDiv = document.createElement('div');
        toasterDiv.setAttribute('data-sonner-toaster', '');
        toasterDiv.style.cssText = `
          --normal-bg: white;
          --normal-border: #e2e8f0;
          --normal-text: #1a1a2e;
          --success-bg: white;
          --success-border: #10b981;
          --success-text: #1a1a2e;
          --error-bg: white;
          --error-border: #ef4444;
          --error-text: #1a1a2e;
          --info-bg: white;
          --info-border: #3b82f6;
          --info-text: #1a1a2e;
        `;
        container.appendChild(toasterDiv);
      }
    }
  }
}
