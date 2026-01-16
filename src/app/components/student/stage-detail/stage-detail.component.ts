import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Stage, StageState } from '../../../models/stage.model';
import { StageService } from '../../../services/stage.service';
import { DocumentService } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-stage-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './stage-detail.component.html',
  styleUrl: './stage-detail.component.css',
})
export class StageDetailComponent implements OnInit {
  private stageService = inject(StageService);
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  currentUser = this.authService.currentUser;
  stage: Stage | null = null;
  encadrant: User | null = null;
  isLoading = true;
  error: string | null = null;
  success: string | null = null;

  // Upload
  isDragging = false;
  uploadFile: File | null = null;
  isUploading = false;

  StageState = StageState;

  ngOnInit() {
    console.log('=== StageDetailComponent ngOnInit ===');
    if (isPlatformBrowser(this.platformId)) {
      const id = this.route.snapshot.paramMap.get('id');
      console.log('Stage ID from route:', id);
      if (id) {
        this.loadStage(parseInt(id));
      } else {
        console.error('No stage ID found in route');
        this.error = 'ID du stage non trouvé';
        this.isLoading = false;
      }
    } else {
      this.isLoading = false;
    }
  }

  loadStage(id: number) {
    console.log('=== loadStage called with id:', id);
    this.isLoading = true;
    this.error = null;

    this.stageService.getStageById(id).subscribe({
      next: (data) => {
        console.log('✅ Stage loaded successfully:', data);
        this.stage = data;

        // Charger les infos de l'encadrant si présent
        if (data.encadrantId) {
          this.loadEncadrant(data.encadrantId);
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
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

  loadEncadrant(encadrantId: number) {
    this.userService.getUserById(encadrantId).subscribe({
      next: (user) => {
        console.log('✅ Encadrant loaded:', user);
        this.encadrant = user;
        this.isLoading = false;
        console.log('isLoading set to false, triggering change detection');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading encadrant:', err);
        // Ne pas bloquer l'affichage si l'encadrant ne peut pas être chargé
        this.encadrant = null;
        this.isLoading = false;
        console.log('isLoading set to false (error), triggering change detection');
        this.cdr.detectChanges();
      },
    });
  }

  goBack() {
    this.router.navigate(['/student/my-stages']);
  }

  // Gestion du drag & drop
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
      this.error = 'Le fichier ne doit pas dépasser 10 MB';
      return;
    }
    this.uploadFile = file;
    this.error = null;

    // Upload automatique après sélection
    this.uploadRapport();
  }

  uploadRapport() {
    if (!this.stage?.id || !this.uploadFile) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', this.uploadFile);

    this.documentService.uploadRapport(this.stage.id, formData).subscribe({
      next: () => {
        this.success = 'Rapport téléchargé avec succès';
        this.isUploading = false;
        this.loadStage(this.stage!.id!);
      },
      error: (err) => {
        console.error('Erreur upload:', err);
        this.error = 'Erreur lors du téléchargement du rapport';
        this.isUploading = false;
      },
    });
  }

  downloadRapport() {
    if (!this.stage?.id || !this.stage?.rapportPath) return;

    this.documentService.downloadRapport(this.stage.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_stage_${this.stage!.id}.pdf`;
        a.click();
      },
      error: (err) => {
        console.error('Erreur téléchargement:', err);
        this.error = 'Erreur lors du téléchargement';
      },
    });
  }

  getStateColor(state: StageState): string {
    const colors: { [key in StageState]: string } = {
      [StageState.BROUILLON]: '#6B7280',
      [StageState.EN_ATTENTE_VALIDATION]: '#F59E0B',
      [StageState.VALIDE]: '#10B981',
      [StageState.REFUSE]: '#EF4444',
      [StageState.EN_COURS]: '#8B5CF6',
      [StageState.TERMINE]: '#14B8A6',
      [StageState.SOUTENU]: '#06B6D4',
      [StageState.ANNULE]: '#DC2626',
    };
    return colors[state] || '#6B7280';
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
    return labels[state] || state;
  }

  submitForValidation() {
    if (!this.stage?.id) return;
    if (confirm('Êtes-vous sûr de vouloir soumettre ce stage pour validation ?')) {
      this.isUploading = true;
      this.stageService.submitStageForValidation(this.stage.id).subscribe({
        next: () => {
          this.success = 'Stage soumis pour validation avec succès';
          this.isUploading = false;
          setTimeout(() => this.loadStage(this.stage!.id!), 1000);
        },
        error: (err) => {
          console.error('Erreur lors de la soumission:', err);
          this.error = 'Erreur lors de la soumission pour validation';
          this.isUploading = false;
        },
      });
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
