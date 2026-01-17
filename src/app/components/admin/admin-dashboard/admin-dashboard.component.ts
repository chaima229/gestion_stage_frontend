import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardStatistics, StageStateStatistic } from '../../../models/statistics.model';
import { StatisticsService } from '../../../services/statistics.service';
import { IconComponent } from '../../../shared/icons/icon.component';

interface RecentStage {
  title: string;
  company: string;
  status: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private statisticsService = inject(StatisticsService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  statistics: DashboardStatistics | null = null;
  isLoading = true;
  error: string | null = null;

  ngOnInit() {
    console.log('=== AdminDashboardComponent ngOnInit ===');
    if (isPlatformBrowser(this.platformId)) {
      this.loadStatistics();
    } else {
      this.isLoading = false;
    }
  }

  loadStatistics() {
    console.log('=== Admin loadStatistics called ===');
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

    this.statisticsService.getDashboardStatistics().subscribe({
      next: (data) => {
        console.log('✅ Statistiques admin reçues:', data);
        clearTimeout(safetyTimeout);
        this.statistics = data;
        this.isLoading = false;
        console.log('🔄 isLoading set to false, triggering change detection');
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

  getValidatedCount(): number {
    if (!this.statistics?.stagesByState) return 0;
    const states = this.statistics.stagesByState;
    if (Array.isArray(states)) {
      const validated = states.find((s) => s.state === 'VALIDE');
      return validated?.count || 0;
    } else {
      return states['VALIDE'] ?? 0;
    }
  }

  getPendingCount(): number {
    if (!this.statistics?.stagesByState) return 0;
    const states = this.statistics.stagesByState;
    if (Array.isArray(states)) {
      const pending = states.find((s) => s.state === 'EN_ATTENTE_VALIDATION');
      return pending?.count || 0;
    } else {
      return states['EN_ATTENTE_VALIDATION'] ?? 0;
    }
  }

  getRejectedCount(): number {
    if (!this.statistics?.stagesByState) return 0;
    const states = this.statistics.stagesByState;
    if (Array.isArray(states)) {
      const rejected = states.find((s) => s.state === 'REFUSE');
      return rejected?.count || 0;
    } else {
      return states['REFUSE'] ?? 0;
    }
  }

  getDraftCount(): number {
    if (!this.statistics?.stagesByState) return 0;
    const states = this.statistics.stagesByState;
    if (Array.isArray(states)) {
      const draft = states.find((s) => s.state === 'BROUILLON');
      return draft?.count || 0;
    } else {
      return states['BROUILLON'] ?? 0;
    }
  }

  getRecentStages(): RecentStage[] {
    // Mock data for recent stages - replace with real data from API if available
    return this.statistics && Array.isArray((this.statistics as any).recentStages)
      ? (this.statistics as any).recentStages
      : [];
  }

  getStagesByFiliere(): { filiereName: string; count: number }[] {
    if (!this.statistics?.stagesByFiliere) return [];

    // Si c'est déjà un tableau, le retourner
    const filieres = this.statistics.stagesByFiliere;
    if (Array.isArray(filieres)) {
      return filieres;
    }
    // Si c'est un objet (map), le convertir en tableau
    return Object.keys(filieres).map((key) => ({
      filiereName: key,
      count: filieres[key],
    }));
  }

  getTopEntreprises(): { name: string; count: number }[] {
    if (!this.statistics?.topEntreprises) return [];

    // Si c'est déjà un tableau, le retourner
    const entreprises = this.statistics.topEntreprises;
    if (Array.isArray(entreprises)) {
      return entreprises.map((e: any) => ({
        name: e.entreprise || e.name,
        count: e.count,
      }));
    }
    // Si c'est un objet (map), le convertir en tableau
    return Object.keys(entreprises)
      .map((key) => ({
        name: key,
        count: entreprises[key],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getEntreprisePercentage(count: number): number {
    const topEntreprises = this.getTopEntreprises();
    if (topEntreprises.length === 0) return 0;
    const maxCount = Math.max(...topEntreprises.map((e) => e.count));
    return maxCount > 0 ? (count / maxCount) * 100 : 0;
  }

  getStateColor(state: string): string {
    const colors: { [key: string]: string } = {
      BROUILLON: '#CBD5E0',
      EN_ATTENTE_VALIDATION: '#FED7AA',
      VALIDE: '#A7F3D0',
      REFUSE: '#FECACA',
    };
    return colors[state] || '#E2E8F0';
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
}
