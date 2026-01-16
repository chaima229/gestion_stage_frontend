import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, UserRole, CreateUserRequest } from '../../../models/user.model';
import { UserService, ImportResult } from '../../../services/user.service';
import { Filiere } from '../../../models/filiere.model';
import { FiliereService } from '../../../services/filiere.service';
import { IconComponent } from '../../../shared/icons/icon.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css',
})
export class UsersManagementComponent implements OnInit {
  private userService = inject(UserService);
  private filiereService = inject(FiliereService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  currentUser = this.authService.currentUser;

  users: User[] = [];
  filieres: Filiere[] = [];
  isLoading = true;
  error: string | null = null;
  showForm = false;
  editingId: number | null = null;
  searchRole: string = 'ETUDIANT'; // Par défaut sur étudiants
  searchNom: string = '';
  activeTab: 'students' | 'teachers' | 'all' = 'students'; // Tab actif par défaut

  UserRole = UserRole;

  // Import Excel
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  showImportModal = false;
  importLoading = false;
  importResult: ImportResult | null = null;

  formData: CreateUserRequest = {
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'ETUDIANT',
    filiereId: undefined,
    annee: '',
  };

  ngOnInit() {
    // Ne charger les données que côté navigateur (pas SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
      this.loadFilieres();
    } else {
      this.isLoading = false;
    }
  }

  loadUsers() {
    this.isLoading = true;
    this.error = null;

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        setTimeout(() => {
          this.users = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 0);
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        setTimeout(() => {
          this.error = 'Impossible de charger les utilisateurs';
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 0);
      },
    });
  }

  loadFilieres() {
    this.filiereService.getAllFilieres().subscribe({
      next: (data) => {
        this.filieres = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des filières:', err);
      },
    });
  }

  get filteredUsers(): User[] {
    return this.users.filter((user) => {
      // Filtrer les admins sauf l'admin connecté
      if (user.role === 'ADMIN' || user.role === 'SOUS_ADMIN') {
        if (user.id !== this.currentUser()?.id) {
          return false;
        }
      }

      const matchRole = !this.searchRole || user.role === this.searchRole;
      const matchNom =
        !this.searchNom ||
        user.nom.toLowerCase().includes(this.searchNom.toLowerCase()) ||
        user.prenom.toLowerCase().includes(this.searchNom.toLowerCase());
      return matchRole && matchNom;
    });
  }

  getFilteredUsers(role: string): User[] {
    return this.users.filter((user) => {
      // Filtrer les admins sauf l'admin connecté
      if (user.role === 'ADMIN' || user.role === 'SOUS_ADMIN') {
        if (user.id !== this.currentUser()?.id) {
          return false;
        }
      }
      return user.role === role;
    });
  }

  openForm(user?: User) {
    if (user) {
      // Empêcher la modification des autres admins
      if (
        (user.role === 'ADMIN' || user.role === 'SOUS_ADMIN') &&
        user.id !== this.currentUser()?.id
      ) {
        return;
      }

      this.editingId = user.id || null;
      this.formData = {
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role as string,
        filiereId: user.filiereId,
        annee: user.annee,
        motDePasse: '',
      };
    } else {
      this.editingId = null;
      this.formData = {
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
        role: 'ETUDIANT',
        filiereId: undefined,
        annee: '',
      };
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  saveUser() {
    if (!this.formData.nom.trim() || !this.formData.prenom.trim() || !this.formData.email.trim()) {
      this.error = 'Les champs obligatoires doivent être remplis';
      return;
    }

    if (!this.editingId && !this.formData.motDePasse.trim()) {
      this.error = 'Le mot de passe est requis pour un nouvel utilisateur';
      return;
    }

    // Validation : filière obligatoire pour les étudiants ET les enseignants
    if (
      (this.formData.role === 'ETUDIANT' || this.formData.role === 'ENSEIGNANT') &&
      !this.formData.filiereId
    ) {
      this.error = 'La filière est obligatoire pour les étudiants et les enseignants';
      return;
    }

    if (this.editingId) {
      this.userService.updateUser(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeForm();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.error = 'Erreur lors de la mise à jour';
        },
      });
    } else {
      this.userService.createUser(this.formData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeForm();
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          this.error = 'Erreur lors de la création';
        },
      });
    }
  }

  isAdminRole(user: User): boolean {
    return user.role === 'ADMIN' || user.role === 'SOUS_ADMIN';
  }

  toggleUserStatus(user: User) {
    if (!user.id) return;

    const action = user.actif ? 'bloquer' : 'débloquer';
    const confirmMessage = `Êtes-vous sûr de vouloir ${action} ce compte ?`;

    if (confirm(confirmMessage)) {
      this.userService.toggleUserStatus(user.id, !user.actif).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Erreur lors du changement de statut:', err);
          this.error = `Erreur lors du ${action}age du compte`;
        },
      });
    }
  }

  getRoleLabel(role: UserRole): string {
    const labels: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'Administrateur',
      [UserRole.SOUS_ADMIN]: 'Sous-Admin',
      [UserRole.ENSEIGNANT]: 'Enseignant',
      [UserRole.ETUDIANT]: 'Étudiant',
    };
    return labels[role] || role;
  }

  getRoleColor(role: UserRole): string {
    const colors: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'danger',
      [UserRole.SOUS_ADMIN]: 'purple',
      [UserRole.ENSEIGNANT]: 'warning',
      [UserRole.ETUDIANT]: 'info',
    };
    return colors[role] || 'info';
  }

  // ============ Import Excel ============

  openImportModal() {
    this.showImportModal = true;
    this.importResult = null;
    this.error = null;
  }

  closeImportModal() {
    this.showImportModal = false;
    this.importResult = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.importExcel(file);
    }
  }

  importExcel(file: File) {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.error = 'Le fichier doit être au format Excel (.xlsx ou .xls)';
      return;
    }

    this.importLoading = true;
    this.error = null;
    this.importResult = null;

    this.userService.importUsersFromExcel(file).subscribe({
      next: (result) => {
        this.importResult = result;
        this.importLoading = false;
        if (result.succes > 0) {
          this.loadUsers();
        }
      },
      error: (err) => {
        console.error("Erreur lors de l'import:", err);
        this.error = err.error?.error || "Erreur lors de l'import du fichier";
        this.importLoading = false;
      },
    });
  }

  downloadTemplate() {
    // Créer un fichier CSV comme template
    const headers = ['Nom', 'Prenom', 'Email', 'MotDePasse', 'Role', 'FiliereId', 'Annee'];
    const example = [
      'Dupont',
      'Jean',
      'jean.dupont@example.com',
      'password123',
      'ETUDIANT',
      '1',
      'M1',
    ];

    const csvContent = headers.join(',') + '\n' + example.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_utilisateurs.csv';
    link.click();
  }
}
