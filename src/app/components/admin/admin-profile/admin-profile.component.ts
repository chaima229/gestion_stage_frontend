import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css',
})
export class AdminProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  currentUser = this.authService.currentUser;
  isEditing = false;
  isChangingPassword = false;
  isLoading = false;
  successMessage: string | null = null;
  error: string | null = null;

  profileForm = {
    nom: '',
    prenom: '',
    email: '',
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  ngOnInit() {
    const user = this.currentUser();
    if (user) {
      this.profileForm = {
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
      };
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form
      const user = this.currentUser();
      if (user) {
        this.profileForm = {
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
        };
      }
    }
    this.error = null;
    this.successMessage = null;
  }

  saveProfile() {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    const user = this.currentUser();
    if (!user?.id) {
      this.error = 'Utilisateur non trouvé';
      this.isLoading = false;
      return;
    }

    this.userService.updateUser(user.id, this.profileForm).subscribe({
      next: () => {
        this.successMessage = 'Profil mis à jour avec succès !';
        this.isEditing = false;
        this.isLoading = false;
        this.cdr.detectChanges();

        // Rafraîchir les données utilisateur
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour:', err);
        this.error = 'Erreur lors de la mise à jour du profil';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleChangePassword() {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
    }
    this.error = null;
    this.successMessage = null;
  }

  changePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    // TODO: Appeler l'API pour changer le mot de passe
    // Pour l'instant, simulons un succès
    setTimeout(() => {
      this.successMessage = 'Mot de passe modifié avec succès !';
      this.isChangingPassword = false;
      this.isLoading = false;
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
      this.cdr.detectChanges();

      setTimeout(() => {
        this.successMessage = null;
        this.cdr.detectChanges();
      }, 3000);
    }, 1000);
  }
}
