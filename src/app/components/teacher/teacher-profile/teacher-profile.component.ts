import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-profile.component.html',
  styleUrl: './teacher-profile.component.css',
})
export class TeacherProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  currentUser = this.authService.currentUser();
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Formulaire de profil
  profileForm = {
    nom: '',
    prenom: '',
  };

  // Formulaire de mot de passe
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  ngOnInit() {
    if (this.currentUser) {
      this.profileForm.nom = this.currentUser.nom;
      this.profileForm.prenom = this.currentUser.prenom;
    }
  }

  saveProfile() {
    if (!this.currentUser?.id) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.userService.updateProfile(this.currentUser.id, this.profileForm).subscribe({
      next: () => {
        this.successMessage = 'Profil mis à jour avec succès';
        this.isLoading = false;
        // Mettre à jour les données locales
        if (this.currentUser) {
          this.currentUser.nom = this.profileForm.nom;
          this.currentUser.prenom = this.profileForm.prenom;
        }
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil:', err);
        this.errorMessage = 'Erreur lors de la mise à jour du profil';
        this.isLoading = false;
      },
    });
  }

  changePassword() {
    if (!this.currentUser?.id) return;

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.userService
      .updatePassword(this.currentUser.id, {
        currentPassword: this.passwordForm.currentPassword,
        newPassword: this.passwordForm.newPassword,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Mot de passe modifié avec succès';
          this.isLoading = false;
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          };
        },
        error: (err) => {
          console.error('Erreur lors du changement de mot de passe:', err);
          this.errorMessage = err.error?.message || 'Erreur lors du changement de mot de passe';
          this.isLoading = false;
        },
      });
  }
}
