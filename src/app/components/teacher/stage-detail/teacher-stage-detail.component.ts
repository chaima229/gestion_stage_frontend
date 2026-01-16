import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  LOCALE_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, Location, registerLocaleData } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import localeFr from '@angular/common/locales/fr';
import { StageService } from '../../../services/stage.service';
import { DocumentService } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';
import { Stage } from '../../../models/stage.model';

// Enregistrer la locale française
registerLocaleData(localeFr);

@Component({
  selector: 'app-teacher-stage-detail',
  standalone: true,
  imports: [CommonModule],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
  templateUrl: './teacher-stage-detail.component.html',
  styleUrl: './teacher-stage-detail.component.css',
})
export class TeacherStageDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private stageService = inject(StageService);
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  currentUser = this.authService.currentUser;
  stage: Stage | null = null;
  isLoading = true;
  error: string | null = null;
  success: string | null = null;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const stageId = this.route.snapshot.paramMap.get('id');
      if (stageId) {
        this.loadStage(+stageId);
      } else {
        this.error = 'ID du stage non trouvé';
        this.isLoading = false;
      }
    } else {
      this.isLoading = false;
    }
  }

  loadStage(id: number) {
    this.isLoading = true;
    console.log('Chargement du stage ID:', id);

    // Timeout de sécurité
    const timeout = setTimeout(() => {
      if (this.isLoading) {
        console.error('Timeout: Le chargement a pris trop de temps');
        this.error = 'Le chargement a pris trop de temps. Veuillez réessayer.';
        this.isLoading = false;
      }
    }, 10000);

    this.stageService.getStageById(id).subscribe({
      next: (stage) => {
        clearTimeout(timeout);
        console.log('Stage reçu:', stage);
        setTimeout(() => {
          this.stage = stage;
          this.isLoading = false;
          console.log('isLoading après mise à jour:', this.isLoading);
          this.cdr.markForCheck();
        }, 0);
      },
      error: (err) => {
        clearTimeout(timeout);
        console.error('Erreur chargement stage:', err);
        setTimeout(() => {
          this.error = 'Impossible de charger les détails du stage';
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 0);
      },
    });
  }

  goBack() {
    this.location.back();
  }

  getStateLabel(etat: string | undefined): string {
    if (!etat) return 'Inconnu';
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

  getStateColor(etat: string | undefined): string {
    if (!etat) return '#6B7280';
    const colors: { [key: string]: string } = {
      BROUILLON: '#6B7280',
      EN_ATTENTE_VALIDATION: '#F59E0B',
      VALIDE: '#10B981',
      EN_COURS: '#3B82F6',
      TERMINE: '#8B5CF6',
      SOUTENU: '#059669',
      REFUSE: '#EF4444',
      ANNULE: '#DC2626',
    };
    return colors[etat] || '#6B7280';
  }

  downloadRapport() {
    if (!this.stage?.id) return;

    this.documentService.downloadRapport(this.stage.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport_stage_${this.stage?.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur téléchargement:', err);
        this.error = 'Erreur lors du téléchargement du rapport.';
      },
    });
  }

  viewRapport() {
    if (!this.stage?.id) return;

    this.documentService.downloadRapport(this.stage.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err) => {
        console.error('Erreur ouverture rapport:', err);
        this.error = "Erreur lors de l'ouverture du rapport.";
      },
    });
  }

  sendWarning() {
    if (!this.stage) return;

    // TODO: Implémenter l'envoi d'email
    this.success = `Un avertissement a été envoyé à l'étudiant ${this.stage.etudiantPrenom} ${this.stage.etudiantNom}.`;
    setTimeout(() => (this.success = null), 5000);
  }

  validateStage() {
    if (!this.stage?.id) return;

    const updatedStage = { ...this.stage, etat: 'VALIDE' };
    this.stageService.updateStage(this.stage.id, updatedStage).subscribe({
      next: () => {
        this.success = 'Le stage a été validé avec succès.';
        this.loadStage(this.stage!.id!);
      },
      error: (err) => {
        console.error('Erreur validation:', err);
        this.error = 'Erreur lors de la validation du stage.';
      },
    });
  }

  refuseStage() {
    if (!this.stage?.id) return;

    if (!confirm('Êtes-vous sûr de vouloir refuser ce stage ?')) return;

    const updatedStage = { ...this.stage, etat: 'REFUSE' };
    this.stageService.updateStage(this.stage.id, updatedStage).subscribe({
      next: () => {
        this.success = 'Le stage a été refusé.';
        this.loadStage(this.stage!.id!);
      },
      error: (err) => {
        console.error('Erreur refus:', err);
        this.error = 'Erreur lors du refus du stage.';
      },
    });
  }

  cancelStage() {
    if (!this.stage?.id) return;

    if (!confirm('Êtes-vous sûr de vouloir annuler ce stage ? Cette action est irréversible.'))
      return;

    const updatedStage = { ...this.stage, etat: 'ANNULE' };
    this.stageService.updateStage(this.stage.id, updatedStage).subscribe({
      next: () => {
        this.success = 'Le stage a été annulé.';
        this.loadStage(this.stage!.id!);
      },
      error: (err) => {
        console.error('Erreur annulation:', err);
        this.error = "Erreur lors de l'annulation du stage.";
      },
    });
  }
}
