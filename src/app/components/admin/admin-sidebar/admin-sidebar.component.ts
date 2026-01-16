import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IconComponent } from '../../../shared/icons/icon.component';
import { Icons } from '../../../shared/icons/icons';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css'],
})
export class AdminSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: 'layoutDashboard' as keyof typeof Icons,
      route: '/admin/dashboard',
    },
    {
      id: 'stages',
      label: 'Stages',
      icon: 'briefcase' as keyof typeof Icons,
      route: '/admin/stages',
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: 'users' as keyof typeof Icons,
      route: '/admin/users',
    },
    {
      id: 'filieres',
      label: 'Filières',
      icon: 'bookOpen' as keyof typeof Icons,
      route: '/admin/filieres',
    },
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: 'user' as keyof typeof Icons,
      route: '/admin/profile',
    },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
