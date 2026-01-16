import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IconComponent } from '../../../shared/icons/icon.component';
import { Icons } from '../../../shared/icons/icons';

@Component({
  selector: 'app-student-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './student-sidebar.component.html',
  styleUrl: './student-sidebar.component.css',
})
export class StudentSidebarComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  menuItems = [
    {
      label: 'Tableau de bord',
      icon: 'layoutDashboard' as keyof typeof Icons,
      route: '/student/dashboard',
    },
    { label: 'Mes Stages', icon: 'briefcase' as keyof typeof Icons, route: '/student/my-stages' },
    { label: 'Paramètres', icon: 'settings' as keyof typeof Icons, route: '/student/settings' },
  ];

  logout(): void {
    this.authService.logout();
  }
}
