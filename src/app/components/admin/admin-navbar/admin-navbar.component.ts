import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IconComponent } from '../../../shared/icons/icon.component';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css'],
})
export class AdminNavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  isDropdownOpen = false;

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  logout(): void {
    this.closeDropdown();
    this.authService.logout();
  }

  navigateToProfile(): void {
    this.closeDropdown();
    // À implémenter selon votre structure de routes
  }

  navigateToSettings(): void {
    this.closeDropdown();
    // À implémenter selon votre structure de routes
  }
}
