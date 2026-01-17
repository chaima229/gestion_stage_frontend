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

  // Utiliser le signal pour toujours avoir l'utilisateur à jour
  get currentUser() {
    return this.authService.currentUser();
  }
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
    const user = this.currentUser;
    if (user) {
      this.profileForm.nom = user.nom;
      this.profileForm.prenom = user.prenom;
    }
  }

  saveProfile() {
    const user = this.currentUser;
    if (!user?.id) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.userService.updateProfile(user.id, this.profileForm).subscribe({
      next: (updatedUser) => {
        this.successMessage = 'Profil mis à jour avec succès';
        this.isLoading = false;
        // Mettre à jour les données locales et synchroniser le profil local (authService et localStorage)
        if (updatedUser) {
          this.profileForm.nom = updatedUser.nom || this.profileForm.nom;
          this.profileForm.prenom = updatedUser.prenom || this.profileForm.prenom;
          if (user) {
            user.nom = updatedUser.nom;
            user.prenom = updatedUser.prenom;
            this.authService.currentUser.set({ ...user });
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('currentUser', JSON.stringify({ ...user }));
            }
          }
        }
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du profil';
        this.isLoading = false;
      },
    });
  }

  changePassword() {
    const user = this.currentUser;
    if (!user?.id) return;

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
      .updatePassword(user.id, {
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
          if (err.status === 403 || err.error?.error === 'SESSION_EXPIRED') {
            this.errorMessage =
              err.error?.message || 'Votre session a expiré. Veuillez vous reconnecter.';
            setTimeout(() => {
              this.authService.logout();
            }, 2000);
          } else {
            this.errorMessage = err.error?.message || 'Erreur lors du changement de mot de passe';
          }
          this.isLoading = false;
        },
      });
  }
}
