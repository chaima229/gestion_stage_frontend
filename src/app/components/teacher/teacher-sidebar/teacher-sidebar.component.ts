import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IconComponent } from '../../../shared/icons/icon.component';
import { Icons } from '../../../shared/icons/icons';

@Component({
  selector: 'app-teacher-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './teacher-sidebar.component.html',
  styleUrl: './teacher-sidebar.component.css',
})
export class TeacherSidebarComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  menuItems = [
    {
      label: 'Dashboard',
      icon: 'layoutDashboard' as keyof typeof Icons,
      route: '/teacher/dashboard',
    },
    {
      label: 'Stages à Valider',
      icon: 'clipboardList' as keyof typeof Icons,
      route: '/teacher/stages-to-validate',
    },
    {
      label: 'Mes Encadrements',
      icon: 'briefcase' as keyof typeof Icons,
      route: '/teacher/encadrements',
    },
    {
      label: 'Paramètres',
      icon: 'settings' as keyof typeof Icons,
      route: '/teacher/profile',
    },
  ];

  logout(): void {
    this.authService.logout();
  }
}
