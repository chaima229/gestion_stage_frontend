import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  Stage,
  StageState,
  StageSearchFilter,
  StagePaginatedResponse,
  StageWithDetails,
} from '../../../models/stage.model';
import { StageService } from '../../../services/stage.service';
import { Filiere } from '../../../models/filiere.model';
import { FiliereService } from '../../../services/filiere.service';
import { IconComponent } from '../../../shared/icons/icon.component';

@Component({
  selector: 'app-stages-management',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './stages-management.component.html',
  styleUrl: './stages-management.component.css',
})
export class StagesManagementComponent implements OnInit {
  private stageService = inject(StageService);
  private filiereService = inject(FiliereService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  stages: StageWithDetails[] = [];
  filieres: Filiere[] = [];
  isLoading = true;
  isFiltering = false; // Pour le chargement lors du filtrage
  error: string | null = null;
  selectedStage: StageWithDetails | null = null;
  showDetails = false;

  // Filtres
  filters: StageSearchFilter = {
    etat: undefined,
    filiereId: undefined,
    entreprise: undefined,
    page: 0,
    pageSize: 50,
  };

  // Recherche textuelle
  searchKeyword = '';

  // Pagination
  Math = Math;  // Pour utiliser Math.min dans le template
  currentPage = 1;
  itemsPerPage = 5;

  StageState = StageState;

  ngOnInit() {
    // Ne charger les données que côté navigateur (pas SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.loadInitialData();
    } else {
      this.isLoading = false;
    }
  }

  // Chargement initial en parallèle pour optimiser les performances
  loadInitialData() {
    this.isLoading = true;
    this.error = null;

    // Charger stages et filières en parallèle
    forkJoin({
      stages: this.stageService.getAllStages(),
      filieres: this.filiereService.getAllFilieres(),
    }).subscribe({
      next: ({ stages, filieres }) => {
        this.stages = stages;
        this.filieres = filieres;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.error = 'Impossible de charger les données';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadStages() {
    this.isFiltering = true;
    this.error = null;

    // Vérifier si des filtres sont actifs
    const hasFilters = this.filters.etat || this.filters.filiereId || this.filters.entreprise;

    if (!hasFilters) {
      // Sans filtres, charger tous les stages directement
      this.stageService.getAllStages().subscribe({
        next: (stages) => {
          this.stages = stages;
          this.isFiltering = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement:', err);
          this.error = 'Impossible de charger les stages';
          this.isFiltering = false;
        },
      });
    } else {
      // Avec filtres, utiliser l'endpoint de recherche
      this.stageService.searchStages(this.filters).subscribe({
        next: (response: StagePaginatedResponse) => {
          this.stages = response.content;
          this.isFiltering = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement:', err);
          this.error = 'Impossible de charger les stages';
          this.isFiltering = false;
        },
      });
    }
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

  search() {
    this.filters.page = 0;
    this.loadStages();
  }

  resetFilters() {
    this.filters = {
      etat: undefined,
      filiereId: undefined,
      entreprise: undefined,
      page: 0,
      pageSize: 50,
    };
    this.loadStages();
  }

  viewDetails(stage: Stage) {
    this.selectedStage = stage;
    this.showDetails = true;
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedStage = null;
  }

  deleteStage(id: number | undefined) {
    if (!id) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer ce stage ?')) {
      this.stageService.deleteStage(id).subscribe({
        next: () => {
          this.loadStages();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.error = 'Erreur lors de la suppression';
        },
      });
    }
  }

  reassignTeacher(stageId: number | undefined, newTeacherId: number) {
    if (!stageId) return;
    this.stageService.reassignEncadrant(stageId, { encadrantId: newTeacherId }).subscribe({
      next: () => {
        this.loadStages();
        this.closeDetails();
      },
      error: (err) => {
        console.error('Erreur lors de la réassignation:', err);
        this.error = 'Erreur lors de la réassignation';
      },
    });
  }

  getStateColor(state: StageState): string {
    const colors: { [key in StageState]: string } = {
      [StageState.BROUILLON]: '#6C757D',
      [StageState.EN_ATTENTE_VALIDATION]: '#FFC107',
      [StageState.VALIDE]: '#28A745',
      [StageState.REFUSE]: '#DC3545',
      [StageState.EN_COURS]: '#8B5CF6',
      [StageState.TERMINE]: '#14B8A6',
      [StageState.SOUTENU]: '#06B6D4',
      [StageState.ANNULE]: '#DC2626',
    };
    return colors[state];
  }

  getStateLabel(state: StageState): string {
    const labels: { [key in StageState]: string } = {
      [StageState.BROUILLON]: 'Brouillon',
      [StageState.EN_ATTENTE_VALIDATION]: 'En attente',
      [StageState.VALIDE]: 'Validé',
      [StageState.REFUSE]: 'Refusé',
      [StageState.EN_COURS]: 'En cours',
      [StageState.TERMINE]: 'Terminé',
      [StageState.SOUTENU]: 'Soutenu',
      [StageState.ANNULE]: 'Annulé',
    };
    return labels[state];
  }

  // Génère les initiales à partir du nom et prénom
  getInitials(prenom?: string, nom?: string): string {
    const p = prenom?.charAt(0)?.toUpperCase() || '';
    const n = nom?.charAt(0)?.toUpperCase() || '';
    return p + n || '??';
  }

  // Retourne une couleur de fond pour l'avatar basée sur le nom
  getAvatarColor(nom?: string): string {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    if (!nom) return colors[0];
    const index = nom.charCodeAt(0) % colors.length;
    return colors[index];
  }

  // Filtre les stages par mot-clé
  get filteredStages(): StageWithDetails[] {
    if (!this.searchKeyword.trim()) {
      return this.stages;
    }
    const keyword = this.searchKeyword.toLowerCase();
    return this.stages.filter(
      (stage) =>
        stage.sujet.toLowerCase().includes(keyword) ||
        stage.entreprise.toLowerCase().includes(keyword) ||
        stage.ville?.toLowerCase().includes(keyword) ||
        stage.etudiant?.nom?.toLowerCase().includes(keyword) ||
        stage.etudiant?.prenom?.toLowerCase().includes(keyword) ||
        stage.encadrant?.nom?.toLowerCase().includes(keyword) ||
        stage.encadrant?.prenom?.toLowerCase().includes(keyword)
    );
  }

  // Pagination
  get paginatedStages(): StageWithDetails[] {
    const filtered = this.filteredStages;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStages.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
