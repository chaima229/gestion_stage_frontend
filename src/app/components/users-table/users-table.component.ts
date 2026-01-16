import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.css',
})
export class UsersTableComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  users: User[] = [];
  currentUser: User | null = null;

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = this.authService.currentUser();

    // Récupérer les utilisateurs du backend
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
