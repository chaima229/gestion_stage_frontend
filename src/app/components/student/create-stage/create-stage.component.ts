import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Stage, StageState, CreateStageRequest } from '../../../models/stage.model';
import { StageService } from '../../../services/stage.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-create-stage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-stage.component.html',
  styleUrl: './create-stage.component.css',
})
export class CreateStageComponent implements OnInit {
  private stageService = inject(StageService);
  private userService = inject(UserService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  isLoading = false;
  isEditing = false;
  error: string | null = null;
  success: string | null = null;
  stageId: number | null = null;
  encadrants: User[] = [];

  // Upload de fichier
  selectedFile: File | null = null;
  isDragging = false;

  formData: CreateStageRequest = {
    sujet: '',
    description: '',
    entreprise: '',
    ville: '',
    dateDebut: new Date(),
    dateFin: new Date(),
    encadrantId: undefined,
  };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Charger la liste des encadrants
      this.loadEncadrants();

      // Si on vient d'une édition, charger le stage
      const id = this.router.url.split('/').pop();
      if (id && id !== 'create') {
        this.isEditing = true;
        this.stageId = parseInt(id);
        this.loadStage();
      }
    }
  }

  loadEncadrants() {
    this.userService.getAllEnseignants().subscribe({
      next: (enseignants) => {
        console.log('Encadrants chargés:', enseignants);
        this.encadrants = enseignants;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des encadrants:', err);
      },
    });
  }

  loadStage() {
    if (!this.stageId) return;
    console.log('=== loadStage called with id:', this.stageId);
    this.isLoading = true;

    this.stageService.getStageById(this.stageId).subscribe({
      next: (stage) => {
        console.log('✅ Stage loaded for editing:', stage);
        this.formData = {
          sujet: stage.sujet,
          description: stage.description,
          entreprise: stage.entreprise,
          ville: stage.ville,
          dateDebut: stage.dateDebut,
          dateFin: stage.dateFin,
          encadrantId: stage.encadrantId,
        };
        console.log('FormData après chargement:', this.formData);
        console.log(
          'encadrantId value:',
          this.formData.encadrantId,
          'type:',
          typeof this.formData.encadrantId
        );
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading stage:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        this.error = `Impossible de charger le stage (${err.status || 'erreur'}). ${
          err.error?.message || err.message || ''
        }`;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  saveStage() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.error = null;
    this.success = null;

    // S'assurer que encadrantId est bien inclus dans formData
    const dataToSend = {
      ...this.formData,
      encadrantId: this.formData.encadrantId || undefined,
    };

    if (this.isEditing && this.stageId) {
      console.log('Updating stage with data:', dataToSend);
      this.stageService.updateStage(this.stageId, dataToSend).subscribe({
        next: () => {
          // Si un fichier est sélectionné, l'uploader
          if (this.selectedFile) {
            this.uploadDocument(this.stageId!);
          } else {
            this.success = 'Stage modifié avec succès';
            this.isLoading = false;
            this.cdr.detectChanges();
            setTimeout(() => this.router.navigate(['/student/my-stages']), 1500);
          }
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.error = 'Erreur lors de la mise à jour du stage';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.stageService.createStage(dataToSend).subscribe({
        next: () => {
          this.success = 'Stage créé avec succès';
          this.isLoading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/student/my-stages']), 1500);
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          this.error = 'Erreur lors de la création du stage';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  saveAndSubmit() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.error = null;
    this.success = null;

    if (this.isEditing && this.stageId) {
      // Mettre à jour puis soumettre
      this.stageService.updateStage(this.stageId, this.formData).subscribe({
        next: () => {
          this.submitStageForValidation(this.stageId!);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.error = 'Erreur lors de la mise à jour du stage';
          this.isLoading = false;
        },
      });
    } else {
      // Créer puis soumettre
      this.stageService.createStage(this.formData).subscribe({
        next: (stage) => {
          if (stage.id) {
            this.submitStageForValidation(stage.id);
          } else {
            this.success = 'Stage créé mais non soumis';
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          console.error("Détails de l'erreur:", JSON.stringify(err));
          const errorMsg =
            err?.error?.message || err?.message || 'Erreur lors de la création du stage';
          this.error = `Erreur: ${errorMsg}`;
          this.isLoading = false;
        },
      });
    }
  }

  private submitStageForValidation(stageId: number) {
    this.stageService.submitStageForValidation(stageId).subscribe({
      next: () => {
        this.success = '✅ Demande de stage envoyée avec succès ! Votre encadrant sera notifié.';
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/student/my-stages']), 2500);
      },
      error: (err) => {
        console.error('Erreur lors de la soumission:', err);
        this.error = 'Stage créé mais erreur lors de la soumission';
        this.isLoading = false;
      },
    });
  }

  submitForValidation() {
    if (!this.stageId) {
      this.error = "Veuillez d'abord créer le stage";
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.stageService.submitStageForValidation(this.stageId).subscribe({
      next: () => {
        this.success = 'Stage soumis pour validation';
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/student/stages']), 1500);
      },
      error: (err) => {
        console.error('Erreur lors de la soumission:', err);
        this.error = 'Erreur lors de la soumission';
        this.isLoading = false;
      },
    });
  }

  validateForm(): boolean {
    if (!this.formData.sujet.trim()) {
      this.error = 'Le sujet est obligatoire';
      return false;
    }
    if (!this.formData.description.trim()) {
      this.error = 'La description est obligatoire';
      return false;
    }
    if (!this.formData.entreprise.trim()) {
      this.error = "L'entreprise est obligatoire";
      return false;
    }
    if (!this.formData.ville.trim()) {
      this.error = 'La ville est obligatoire';
      return false;
    }
    if (new Date(this.formData.dateDebut) >= new Date(this.formData.dateFin)) {
      this.error = 'La date de début doit être antérieure à la date de fin';
      return false;
    }
    return true;
  }

  // Gestion du drag & drop pour l'upload de fichier
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      this.error = 'Seuls les fichiers PDF sont acceptés';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.error = 'Le fichier ne doit pas dépasser 10 Mo';
      return;
    }

    this.selectedFile = file;
    this.error = null;
  }

  removeFile() {
    this.selectedFile = null;
  }

  uploadDocument(stageId: number) {
    if (!this.selectedFile) {
      this.success = 'Stage modifié avec succès';
      this.isLoading = false;
      this.cdr.detectChanges();
      setTimeout(() => this.router.navigate(['/student/my-stages']), 1500);
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // Appeler le service d'upload de document
    this.stageService.uploadDocument(stageId, formData).subscribe({
      next: () => {
        this.success = 'Stage modifié et document uploadé avec succès';
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/student/my-stages']), 1500);
      },
      error: (err) => {
        console.error("Erreur lors de l'upload du document:", err);
        this.error = "Stage modifié mais erreur lors de l'upload du document";
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancel() {
    this.router.navigate(['/student/my-stages']);
  }
}
