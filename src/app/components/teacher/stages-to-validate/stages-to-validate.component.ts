import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Stage,
  StageState,
  ValidateStageRequest,
  RefuseStageRequest,
} from '../../../models/stage.model';
import { StageService } from '../../../services/stage.service';

@Component({
  selector: 'app-stages-to-validate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stages-to-validate.component.html',
  styleUrl: './stages-to-validate.component.css',
})
export class StagesToValidateComponent implements OnInit {
  private stageService = inject(StageService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  stages: Stage[] = [];
  isLoading = true;
  error: string | null = null;
  selectedStage: Stage | null = null;
  showValidateModal = false;
  showRefuseModal = false;
  showDetailsModal = false;

  refuseComment = '';
  encadrantId: number | null = null;

  StageState = StageState;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStagesToValidate();
    } else {
      this.isLoading = false;
    }
  }

  loadStagesToValidate() {
    this.isLoading = true;
    this.error = null;

    // Charger les stages en attente de validation
    this.stageService.getStagesToValidate().subscribe({
      next: (data) => {
        this.stages = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.error = 'Impossible de charger les stages';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  viewStage(stage: Stage) {
    this.selectedStage = stage;
    this.showDetailsModal = true;
  }

  closeModals() {
    this.showValidateModal = false;
    this.showRefuseModal = false;
    this.showDetailsModal = false;
    this.refuseComment = '';
    this.encadrantId = null;
  }

  openValidateModal(stage: Stage) {
    this.selectedStage = stage;
    this.showValidateModal = true;
  }

  openRefuseModal(stage: Stage) {
    this.selectedStage = stage;
    this.showRefuseModal = true;
  }

  validateStage() {
    if (!this.selectedStage || !this.selectedStage.id) return;
    if (!this.encadrantId) {
      this.error = 'Veuillez sélectionner un encadrant';
      return;
    }

    const request: ValidateStageRequest = {
      encadrantId: this.encadrantId,
    };

    this.stageService.validateStage(this.selectedStage.id, request).subscribe({
      next: () => {
        this.loadStagesToValidate();
        this.closeModals();
      },
      error: (err) => {
        console.error('Erreur lors de la validation:', err);
        this.error = 'Erreur lors de la validation';
      },
    });
  }

  refuseStage() {
    if (!this.selectedStage || !this.selectedStage.id) return;
    if (!this.refuseComment.trim()) {
      this.error = 'Veuillez fournir un commentaire pour le refus';
      return;
    }

    const request: RefuseStageRequest = {
      commentaire: this.refuseComment,
    };

    this.stageService.refuseStage(this.selectedStage.id, request).subscribe({
      next: () => {
        this.loadStagesToValidate();
        this.closeModals();
      },
      error: (err) => {
        console.error('Erreur lors du refus:', err);
        this.error = 'Erreur lors du refus';
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
}
