import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentDashboardStatistics } from '../../../models/statistics.model';
import { StatisticsService } from '../../../services/statistics.service';
import { AuthService } from '../../../services/auth.service';
import { StageService } from '../../../services/stage.service';
import { Stage, StageState } from '../../../models/stage.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css',
})
export class StudentDashboardComponent implements OnInit {
  private statisticsService = inject(StatisticsService);
  private authService = inject(AuthService);
  private stageService = inject(StageService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  currentUser = this.authService.currentUser;
  statistics: StudentDashboardStatistics | null = null;
  stages: Stage[] = [];
  isLoading = true;
  error: string | null = null;

  ngOnInit() {
    console.log('=== StudentDashboardComponent ngOnInit ===');
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    } else {
      this.isLoading = false;
    }
  }

  loadData() {
    console.log('=== loadData called ===');
    this.isLoading = true;
    this.error = null;

    let statisticsLoaded = false;
    let stagesLoaded = false;

    // Timeout de sécurité: forcer l'arrêt du loading après 10 secondes
    const safetyTimeout = setTimeout(() => {
      if (this.isLoading) {
        console.warn("⚠️ Loading timeout - forçage de l'affichage");
        this.isLoading = false;
        if (!statisticsLoaded || !stagesLoaded) {
          this.error =
            'Le chargement a pris trop de temps. Certaines données peuvent être incomplètes.';
        }
      }
    }, 10000);

    const checkAndFinishLoading = () => {
      console.log(`Loading status - Statistics: ${statisticsLoaded}, Stages: ${stagesLoaded}`);
      if (statisticsLoaded && stagesLoaded) {
        clearTimeout(safetyTimeout);
        this.isLoading = false;
        console.log('✅ Chargement terminé avec succès');
        this.cdr.detectChanges();
      }
    };

    // Charger les statistiques
    this.statisticsService.getStudentDashboardStatistics().subscribe({
      next: (data) => {
        console.log('✅ Statistiques reçues:', data);
        this.statistics = data;
        statisticsLoaded = true;
        checkAndFinishLoading();
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des statistiques:', err);
        statisticsLoaded = true;
        this.error = 'Impossible de charger les statistiques';
        checkAndFinishLoading();
      },
    });

    // Charger les stages
    this.stageService.getMyStages().subscribe({
      next: (data) => {
        console.log('✅ Stages reçus:', data);
        this.stages = data;
        stagesLoaded = true;
        checkAndFinishLoading();
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des stages:', err);
        stagesLoaded = true;
        if (!this.error) {
          this.error = 'Impossible de charger les stages';
        }
        checkAndFinishLoading();
      },
    });
  }

  loadStatistics() {
    this.loadData();
  }

  getStateColor(state: string): string {
    const colors: { [key: string]: string } = {
      BROUILLON: '#6C757D',
      EN_ATTENTE_VALIDATION: '#F59E0B',
      VALIDE: '#10B981',
      REFUSE: '#EF4444',
      EN_COURS: '#3B82F6',
      TERMINE: '#8B5CF6',
      SOUTENU: '#06B6D4',
    };
    return colors[state] || '#6B7280';
  }

  getStateLabel(state: string): string {
    const labels: { [key: string]: string } = {
      BROUILLON: 'Brouillon',
      EN_ATTENTE_VALIDATION: 'En attente',
      VALIDE: 'Validé',
      REFUSE: 'Refusé',
      EN_COURS: 'En cours',
      TERMINE: 'Terminé',
      SOUTENU: 'Soutenu',
    };
    return labels[state] || state;
  }

  getStateBgClass(state: string): string {
    const classes: { [key: string]: string } = {
      BROUILLON: 'bg-gray-100 text-gray-700',
      EN_ATTENTE_VALIDATION: 'bg-amber-100 text-amber-700',
      VALIDE: 'bg-emerald-100 text-emerald-700',
      REFUSE: 'bg-red-100 text-red-700',
      EN_COURS: 'bg-blue-100 text-blue-700',
      TERMINE: 'bg-purple-100 text-purple-700',
      SOUTENU: 'bg-cyan-100 text-cyan-700',
    };
    return classes[state] || 'bg-gray-100 text-gray-700';
  }

  getValidatedCount(): number {
    if (!this.statistics?.stagesByState) return 0;
    const validated = this.statistics.stagesByState.find((s) => s.state === 'VALIDE');
    return validated?.count || 0;
  }

  getPendingCount(): number {
    if (!this.statistics?.stagesByState) return 0;
    const pending = this.statistics.stagesByState.find((s) => s.state === 'EN_ATTENTE_VALIDATION');
    return pending?.count || 0;
  }

  getRejectedCount(): number {
    if (!this.statistics?.stagesByState) return 0;
    const rejected = this.statistics.stagesByState.find((s) => s.state === 'REFUSE');
    return rejected?.count || 0;
  }

  getDraftCount(): number {
    if (!this.statistics?.stagesByState) return 0;
    const draft = this.statistics.stagesByState.find((s) => s.state === 'BROUILLON');
    return draft?.count || 0;
  }
}
