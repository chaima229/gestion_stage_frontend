import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Filiere, NiveauFiliere, CreateFilierRequest } from '../../../models/filiere.model';
import { FiliereService } from '../../../services/filiere.service';

@Component({
  selector: 'app-filieres-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filieres-list.component.html',
  styleUrl: './filieres-list.component.css',
})
export class FiliersListComponent implements OnInit {
  private filiereService = inject(FiliereService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  filieres: Filiere[] = [];
  isLoading = true;
  error: string | null = null;
  showForm = false;
  editingId: number | null = null;

  formData: CreateFilierRequest = {
    nom: '',
    niveau: NiveauFiliere.M1,
    description: '',
  };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFilieres();
    } else {
      this.isLoading = false;
    }
  }

  loadFilieres() {
    this.isLoading = true;
    this.error = null;

    this.filiereService.getAllFilieres().subscribe({
      next: (data) => {
        this.filieres = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.error = 'Impossible de charger les filières';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openForm(filiere?: Filiere) {
    if (filiere) {
      this.editingId = filiere.id;
      this.formData = {
        nom: filiere.nom,
        niveau: filiere.niveau,
        description: filiere.description || '',
      };
    } else {
      this.editingId = null;
      this.formData = {
        nom: '',
        niveau: NiveauFiliere.M1,
        description: '',
      };
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  saveFiler() {
    if (!this.formData.nom.trim()) {
      this.error = 'Le nom de la filière est requis';
      return;
    }

    if (this.editingId) {
      this.filiereService.updateFiliere(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadFilieres();
          this.closeForm();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.error = 'Erreur lors de la mise à jour';
        },
      });
    } else {
      this.filiereService.createFiliere(this.formData).subscribe({
        next: () => {
          this.loadFilieres();
          this.closeForm();
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          this.error = 'Erreur lors de la création';
        },
      });
    }
  }

  deleteFiliere(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette filière ?')) {
      this.filiereService.deleteFiliere(id).subscribe({
        next: () => {
          this.loadFilieres();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.error = 'Erreur lors de la suppression';
        },
      });
    }
  }
}
