import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { StageService } from '../../../services/stage.service';
import { User } from '../../../models/user.model';
import { Stage } from '../../../models/stage.model';

@Component({
  selector: 'app-my-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-students.component.html',
  styleUrl: './my-students.component.css',
})
export class MyStudentsComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private stageService = inject(StageService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  currentUser = this.authService.currentUser;
  students: User[] = [];
  stages: Stage[] = [];
  isLoading = true;
  error: string | null = null;
  searchQuery = '';

  ngOnInit() {
    console.log('MyStudentsComponent - ngOnInit');
    console.log('Utilisateur actuel:', this.currentUser());

    if (isPlatformBrowser(this.platformId)) {
      this.loadStudents();
      this.loadMyStages();
    } else {
      this.isLoading = false;
    }
  }

  loadStudents() {
    const user = this.currentUser();
    console.log('loadStudents - Utilisateur:', user);

    if (!user?.id) {
      this.error = "Impossible d'identifier l'enseignant.";
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = null;

    console.log('Chargement des stages encadrés par:', user.id);

    // Récupérer les stages que j'encadre
    this.stageService.getStagesByEncadrant(user.id).subscribe({
      next: (stages) => {
        console.log('Stages encadrés:', stages);

        // Extraire les IDs uniques des étudiants
        const studentIds = [...new Set(stages.map((s) => s.etudiantId).filter((id) => id))];

        if (studentIds.length === 0) {
          this.students = [];
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        // Charger les informations des étudiants
        this.loadStudentDetails(studentIds);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stages:', err);
        this.error = `Impossible de charger les encadrements.`;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadStudentDetails(studentIds: number[]) {
    // Charger les détails de chaque étudiant
    const requests = studentIds.map((id) => this.userService.getUserById(id));

    Promise.all(requests.map((req) => req.toPromise()))
      .then((students) => {
        this.students = students.filter((s) => s !== null) as User[];
        this.isLoading = false;
        this.cdr.detectChanges();
      })
      .catch((err) => {
        console.error('Erreur lors du chargement des détails étudiants:', err);
        this.error = 'Erreur lors du chargement des étudiants.';
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  loadMyStages() {
    const user = this.currentUser();
    if (!user?.id) return;

    this.stageService.getStagesByEncadrant(user.id).subscribe({
      next: (stages: Stage[]) => {
        console.log('loadMyStages - Stages reçus:', stages);
        this.stages = stages;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des stages:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filteredStudents(): User[] {
    if (!this.searchQuery.trim()) {
      return this.students;
    }
    const query = this.searchQuery.toLowerCase();
    return this.students.filter(
      (student) =>
        student.nom.toLowerCase().includes(query) ||
        student.prenom.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query)
    );
  }

  get filteredStages(): Stage[] {
    if (!this.searchQuery.trim()) {
      return this.stages;
    }
    const query = this.searchQuery.toLowerCase();
    return this.stages.filter(
      (stage) =>
        stage.sujet?.toLowerCase().includes(query) ||
        stage.entreprise?.toLowerCase().includes(query) ||
        stage.description?.toLowerCase().includes(query) ||
        stage.ville?.toLowerCase().includes(query)
    );
  }

  getStudentById(studentId: number | undefined): User | null {
    if (!studentId) return null;
    return this.students.find((s) => s.id === studentId) || null;
  }

  getStudentStages(studentId: number | undefined): Stage[] {
    if (!studentId) return [];
    return this.stages.filter((stage) => stage.etudiantId === studentId);
  }

  getStudentStageCount(studentId: number | undefined): number {
    return this.getStudentStages(studentId).length;
  }

  getFiliereLabel(filiereId: number | undefined): string {
    if (!filiereId) return 'N/A';
    const filieres: { [key: number]: string } = {
      1: 'Développement Digital',
      2: 'Génie Logiciel',
      3: 'Réseaux',
      4: 'Cybersécurité',
      5: 'Data Science',
    };
    return filieres[filiereId] || `Filière ${filiereId}`;
  }

  getStateLabel(etat: string): string {
    const labels: { [key: string]: string } = {
      BROUILLON: 'Brouillon',
      EN_ATTENTE_VALIDATION: 'En attente',
      VALIDE: 'Validé',
      EN_COURS: 'En cours',
      TERMINE: 'Terminé',
      SOUTENU: 'Soutenu',
      REFUSE: 'Refusé',
      ANNULE: 'Annulé',
    };
    return labels[etat] || etat;
  }

  viewStageDetails(stage: Stage) {
    if (stage.id) {
      this.router.navigate(['/teacher/stage', stage.id]);
    }
  }
}
