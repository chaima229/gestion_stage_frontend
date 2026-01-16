import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User, UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  UserRole = UserRole;

  isMenuOpen = false;

  isAuthPage(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/register';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (user) {
      return (user.prenom?.charAt(0) || '') + (user.nom?.charAt(0) || '');
    }
    return 'U';
  }

  getNavLinks() {
    const user = this.currentUser();
    if (!user) return [];

    const baseLinks = [];

    if (user.role === UserRole.ADMIN) {
      baseLinks.push(
        { label: 'Tableau de Bord', path: '/admin/dashboard' },
        { label: 'Filières', path: '/admin/filieres' },
        { label: 'Utilisateurs', path: '/admin/users' },
        { label: 'Stages', path: '/admin/stages' }
      );
    } else if (user.role === UserRole.ENSEIGNANT) {
      baseLinks.push(
        { label: 'Tableau de Bord', path: '/teacher/dashboard' },
        { label: 'Stages à Valider', path: '/teacher/stages-to-validate' },
        { label: 'Mes Étudiants', path: '/teacher/students' }
      );
    } else if (user.role === UserRole.ETUDIANT) {
      baseLinks.push(
        { label: 'Tableau de Bord', path: '/student/dashboard' },
        { label: 'Mes Stages', path: '/student/stages' }
      );
    }

    return baseLinks;
  }
}
