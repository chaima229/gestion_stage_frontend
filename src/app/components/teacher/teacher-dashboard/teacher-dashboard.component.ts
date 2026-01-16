import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TeacherDashboardStatistics } from '../../../models/statistics.model';
import { StatisticsService } from '../../../services/statistics.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css',
})
export class TeacherDashboardComponent implements OnInit {
  private statisticsService = inject(StatisticsService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  statistics: TeacherDashboardStatistics | null = null;
  isLoading = true;
  error: string | null = null;

  ngOnInit() {
    console.log('=== TeacherDashboardComponent ngOnInit ===');
    if (isPlatformBrowser(this.platformId)) {
      this.loadStatistics();
    } else {
      this.isLoading = false;
    }
  }

  loadStatistics() {
    console.log('=== Teacher loadStatistics called ===');
    this.isLoading = true;
    this.error = null;

    // Timeout de sécurité
    const safetyTimeout = setTimeout(() => {
      if (this.isLoading) {
        console.warn("⚠️ Loading timeout - forçage de l'affichage");
        this.isLoading = false;
        this.error = 'Le chargement a pris trop de temps';
      }
    }, 10000);

    this.statisticsService.getTeacherDashboardStatistics().subscribe({
      next: (data) => {
        console.log('✅ Statistiques teacher reçues:', data);
        clearTimeout(safetyTimeout);
        this.statistics = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des statistiques:', err);
        clearTimeout(safetyTimeout);
        this.error = 'Impossible de charger les statistiques';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getStateColor(state: string): string {
    const colors: { [key: string]: string } = {
      BROUILLON: '#6C757D',
      EN_ATTENTE_VALIDATION: '#FFC107',
      VALIDE: '#28A745',
      REFUSE: '#DC3545',
    };
    return colors[state] || '#007BFF';
  }

  getStateLabel(state: string): string {
    const labels: { [key: string]: string } = {
      BROUILLON: 'Brouillon',
      EN_ATTENTE_VALIDATION: 'En attente',
      VALIDE: 'Validé',
      REFUSE: 'Refusé',
    };
    return labels[state] || state;
  }

  getTotalStages(): number {
    if (!this.statistics) return 0;
    return (
      this.statistics.stagesValidated +
      this.statistics.stagesRefused +
      this.statistics.totalStagesToValidate
    );
  }

  getValidationRate(): number {
    const total = this.getTotalStages();
    if (total === 0) return 0;
    return Math.round((this.statistics!.stagesValidated / total) * 100);
  }

  getFilierePercentage(count: number): number {
    const total = this.getTotalStages();
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }
}
