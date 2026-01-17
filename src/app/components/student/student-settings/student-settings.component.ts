import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-student-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-settings.component.html',
  styleUrl: './student-settings.component.css',
})
export class StudentSettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  currentUser = this.authService.currentUser;

  // Formulaire profil
  profileForm = {
    nom: '',
    prenom: '',
    email: '',
  };

  // Formulaire mot de passe
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  isLoadingProfile = false;
  isLoadingPassword = false;
  profileSuccess: string | null = null;
  profileError: string | null = null;
  passwordSuccess: string | null = null;
  passwordError: string | null = null;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserData();
    }
  }

  loadUserData() {
    const user = this.currentUser();
    if (user) {
      this.profileForm.nom = user.nom || '';
      this.profileForm.prenom = user.prenom || '';
      this.profileForm.email = user.email || '';
    }
  }

  updateProfile() {
    this.isLoadingProfile = true;
    this.profileSuccess = null;
    this.profileError = null;

    const userId = this.currentUser()?.id;
    if (!userId) {
      this.profileError = 'Utilisateur non identifié';
      this.isLoadingProfile = false;
      return;
    }

    this.userService
      .updateProfile(userId, {
        nom: this.profileForm.nom,
        prenom: this.profileForm.prenom,
      })
      .subscribe({
        next: (updatedUser) => {
          this.profileSuccess = 'Profil mis à jour avec succès';
          this.isLoadingProfile = false;
          // Mettre à jour le formulaire et le profil local avec les nouvelles valeurs
          if (updatedUser) {
            this.profileForm.nom = updatedUser.nom || this.profileForm.nom;
            this.profileForm.prenom = updatedUser.prenom || this.profileForm.prenom;
            // Synchroniser le profil local (authService et localStorage)
            const current = this.currentUser();
            if (current) {
              current.nom = updatedUser.nom;
              current.prenom = updatedUser.prenom;
              this.authService.currentUser.set({ ...current });
              if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem('currentUser', JSON.stringify({ ...current }));
              }
            }
          }
          setTimeout(() => {
            this.profileSuccess = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du profil:', err);
          // Si le backend indique SESSION_EXPIRED ou 403, forcer la déconnexion avec message et redirection différée
          if (err.status === 403 || err.error?.error === 'SESSION_EXPIRED') {
            this.profileError =
              err.error?.message || 'Votre session a expiré. Veuillez vous reconnecter.';
            setTimeout(() => {
              this.authService.logout();
            }, 2000);
          } else {
            this.profileError = err.error?.message || 'Erreur lors de la mise à jour du profil';
          }
          this.isLoadingProfile = false;
        },
      });
  }

  updatePassword() {
    this.isLoadingPassword = true;
    this.passwordSuccess = null;
    this.passwordError = null;

    // Validation
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas';
      this.isLoadingPassword = false;
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.passwordError = 'Le mot de passe doit contenir au moins 6 caractères';
      this.isLoadingPassword = false;
      return;
    }

    const userId = this.currentUser()?.id;
    if (!userId) {
      this.passwordError = 'Utilisateur non identifié';
      this.isLoadingPassword = false;
      return;
    }

    this.userService
      .updatePassword(userId, {
        currentPassword: this.passwordForm.currentPassword,
        newPassword: this.passwordForm.newPassword,
      })
      .subscribe({
        next: () => {
          this.passwordSuccess = 'Mot de passe modifié avec succès';
          this.isLoadingPassword = false;
          // Réinitialiser le formulaire
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          };
          setTimeout(() => {
            this.passwordSuccess = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur lors du changement de mot de passe:', err);
          this.passwordError = err.error?.message || 'Erreur lors du changement de mot de passe';
          this.isLoadingPassword = false;
        },
      });
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return '??';
    const p = user.prenom?.charAt(0)?.toUpperCase() || '';
    const n = user.nom?.charAt(0)?.toUpperCase() || '';
    return p + n || '??';
  }

  goBack() {
    this.router.navigate(['/student/dashboard']);
  }
}
