import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Stage, StageState } from '../../../models/stage.model';
import { StageService } from '../../../services/stage.service';
import { DocumentService } from '../../../services/document.service';

@Component({
  selector: 'app-my-stages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './my-stages.component.html',
  styleUrl: './my-stages.component.css',
})
export class MyStagesComponent implements OnInit {
  private stageService = inject(StageService);
  private documentService = inject(DocumentService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  stages: Stage[] = [];
  isLoading = true;
  error: string | null = null;
  selectedStage: Stage | null = null;
  showDetails = false;
  showUploadModal = false;
  uploadFile: File | null = null;
  uploadingStageId: number | null = null;

  StageState = StageState;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadMyStages();
    } else {
      this.isLoading = false;
    }
  }

  loadMyStages() {
    console.log('=== loadMyStages called ===');
    this.isLoading = true;
    this.error = null;

    this.stageService.getMyStages().subscribe({
      next: (data) => {
        console.log('✅ Stages loaded successfully:', data);
        this.stages = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading stages:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        this.error = `Impossible de charger vos stages (${err.status || 'erreur'}). ${
          err.error?.message || err.message || ''
        }`;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  viewDetails(stage: Stage) {
    this.selectedStage = stage;
    this.showDetails = true;
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedStage = null;
  }

  editStage(stage: Stage) {
    if (stage.etat === StageState.BROUILLON || stage.etat === StageState.REFUSE) {
      this.router.navigate(['/student/edit-stage', stage.id]);
    } else {
      this.error = 'Vous ne pouvez modifier que les stages en brouillon ou refusés';
    }
  }

  deleteStage(id: number | undefined) {
    if (!id) return;
    const stage = this.stages.find((s) => s.id === id);
    if (
      stage &&
      (stage.etat === StageState.EN_ATTENTE_VALIDATION || stage.etat === StageState.VALIDE)
    ) {
      this.error = 'Vous ne pouvez supprimer que les stages en brouillon ou refusés';
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce stage ?')) {
      this.stageService.deleteStage(id).subscribe({
        next: () => {
          this.loadMyStages();
          this.closeDetails();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.error = 'Erreur lors de la suppression';
        },
      });
    }
  }

  submitForValidation(stage: Stage) {
    if (!stage.id) return;
    if (confirm('Êtes-vous sûr de vouloir soumettre ce stage pour validation ?')) {
      this.stageService.submitStageForValidation(stage.id).subscribe({
        next: () => {
          this.loadMyStages();
          this.closeDetails();
        },
        error: (err) => {
          console.error('Erreur lors de la soumission:', err);
          this.error = 'Erreur lors de la soumission';
        },
      });
    }
  }

  openUploadModal(stage: Stage) {
    this.uploadingStageId = stage.id || null;
    this.showUploadModal = true;
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.uploadFile = null;
    this.uploadingStageId = null;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.error = 'Seuls les fichiers PDF sont acceptés';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10 MB
        this.error = 'Le fichier ne doit pas dépasser 10 MB';
        return;
      }
      this.uploadFile = file;
      this.error = null;
    }
  }

  uploadRapport() {
    if (!this.uploadingStageId || !this.uploadFile) {
      this.error = 'Veuillez sélectionner un fichier';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.uploadFile);

    this.documentService.uploadRapport(this.uploadingStageId, formData).subscribe({
      next: () => {
        this.loadMyStages();
        this.closeUploadModal();
      },
      error: (err) => {
        console.error("Erreur lors de l'upload:", err);
        this.error = "Erreur lors de l'upload du rapport";
      },
    });
  }

  downloadRapport(stage: Stage) {
    if (!stage.id || !stage.rapportPath) return;
    this.documentService.downloadRapport(stage.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_stage_${stage.id}.pdf`;
        a.click();
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement:', err);
        this.error = 'Erreur lors du téléchargement';
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

  canEdit(stage: Stage): boolean {
    return stage.etat === StageState.BROUILLON || stage.etat === StageState.REFUSE;
  }

  canDelete(stage: Stage): boolean {
    return stage.etat === StageState.BROUILLON || stage.etat === StageState.REFUSE;
  }

  canSubmit(stage: Stage): boolean {
    return stage.etat === StageState.BROUILLON || stage.etat === StageState.REFUSE;
  }
}
