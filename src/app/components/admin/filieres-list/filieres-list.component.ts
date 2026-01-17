import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Filiere, NiveauFiliere, CreateFilierRequest } from '../../../models/filiere.model';
import { FiliereService } from '../../../services/filiere.service';
import { ToastService } from '../../../services/toast.service';
import { IconComponent } from '../../../shared/icons/icon.component';

@Component({
  selector: 'app-filieres-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './filieres-list.component.html',
  styleUrl: './filieres-list.component.css',
})
export class FiliersListComponent implements OnInit {
  private filiereService = inject(FiliereService);
  private toastService = inject(ToastService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  filieres: Filiere[] = [];
  isLoading = true;
  error: string | null = null;
  showForm = false;
  editingId: number | null = null;
  showImportModal = false;
  importLoading = false;

  // Pagination
  Math = Math; // Pour utiliser Math.min dans le template
  currentPage = 1;
  itemsPerPage = 5;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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
        setTimeout(() => {
          this.filieres = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 0);
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        setTimeout(() => {
          this.error = 'Impossible de charger les filières';
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 0);
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
      this.toastService.error('Erreur de validation', 'Le nom de la filière est requis');
      return;
    }

    if (this.editingId) {
      this.filiereService.updateFiliere(this.editingId, this.formData).subscribe({
        next: () => {
          this.toastService.success('Filière mise à jour', 'La filière a été modifiée avec succès');
          this.loadFilieres();
          this.closeForm();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.toastService.error('Erreur', 'Impossible de mettre à jour la filière');
        },
      });
    } else {
      this.filiereService.createFiliere(this.formData).subscribe({
        next: () => {
          this.toastService.success('Filière créée', 'La filière a été ajoutée avec succès');
          this.loadFilieres();
          this.closeForm();
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          this.toastService.error('Erreur', 'Impossible de créer la filière');
        },
      });
    }
  }

  deleteFiliere(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette filière ?')) {
      this.filiereService.deleteFiliere(id).subscribe({
        next: () => {
          this.toastService.success('Filière supprimée', 'La filière a été supprimée avec succès');
          this.loadFilieres();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.toastService.error('Erreur', 'Impossible de supprimer la filière');
        },
      });
    }
  }

  openImportModal() {
    this.showImportModal = true;
  }

  closeImportModal() {
    this.showImportModal = false;
    this.importLoading = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.importFilieres(file);
    }
  }

  async importFilieres(file: File) {
    this.importLoading = true;
    this.error = null;

    try {
      // Charger dynamiquement la bibliothèque xlsx
      const XLSX = await import('xlsx');

      // Lire le fichier
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // Lire la première feuille
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[];

          // Ignorer la première ligne (en-têtes)
          const rows = jsonData.slice(1);

          // Transformer en objets Filiere
          const filieres: CreateFilierRequest[] = rows
            .filter((row: any) => row[0] && row[1]) // Filtrer les lignes vides
            .map((row: any) => ({
              nom: String(row[0] || '').trim(),
              niveau: this.validateNiveau(String(row[1] || '').trim()),
              description: String(row[2] || '').trim() || undefined,
            }))
            .filter((f: any) => f.nom && f.niveau); // Filtrer les entrées invalides

          console.log('=== IMPORT FILIÈRES ===');
          console.log('Nombre de lignes dans le fichier:', rows.length);
          console.log('Nombre de filières valides:', filieres.length);
          console.log('Filières à importer:', filieres);

          if (filieres.length === 0) {
            this.toastService.error(
              'Fichier vide',
              'Aucune filière valide trouvée dans le fichier Excel'
            );
            this.importLoading = false;
            return;
          }

          // Envoyer au backend
          this.filiereService.importFilieres(filieres).subscribe({
            next: (result) => {
              this.importLoading = false;
              this.closeImportModal();
              this.loadFilieres();
              this.toastService.success(
                'Import réussi',
                `${result.success} filière(s) importée(s)${
                  result.errors > 0 ? `, ${result.errors} erreur(s)` : ''
                }`
              );
            },
            error: (err) => {
              console.error("Erreur lors de l'import:", err);
              this.importLoading = false;
              this.toastService.error(
                "Erreur d'import",
                "Impossible d'importer les filières. Vérifiez le format du fichier."
              );
            },
          });
        } catch (error) {
          console.error('Erreur de lecture du fichier:', error);
          this.importLoading = false;
          this.toastService.error(
            'Fichier invalide',
            'Impossible de lire le fichier Excel. Vérifiez le format.'
          );
        }
      };

      reader.onerror = () => {
        this.importLoading = false;
        this.toastService.error('Erreur de lecture', 'Impossible de lire le fichier sélectionné');
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erreur:', error);
      this.importLoading = false;
      this.toastService.error('Erreur', "Une erreur est survenue lors de l'import");
    }
  }

  private validateNiveau(niveau: string): NiveauFiliere {
    const normalized = niveau.toUpperCase().trim();
    if (normalized === 'B1') return NiveauFiliere.B1;
    if (normalized === 'B2') return NiveauFiliere.B2;
    if (normalized === 'B3') return NiveauFiliere.B3;
    if (normalized === 'M1') return NiveauFiliere.M1;
    if (normalized === 'M2') return NiveauFiliere.M2;
    // Par défaut, retourner M1
    return NiveauFiliere.M1;
  }

  getFiliereBadgeColor(niveau: string): string {
    const colors: { [key: string]: string } = {
      B1: 'bg-green-100 text-green-700',
      B2: 'bg-teal-100 text-teal-700',
      B3: 'bg-cyan-100 text-cyan-700',
      M1: 'bg-blue-100 text-blue-700',
      M2: 'bg-purple-100 text-purple-700',
    };
    return colors[niveau] || 'bg-gray-100 text-gray-700';
  }

  // Pagination
  get paginatedFilieres(): Filiere[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filieres.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filieres.length / this.itemsPerPage);
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
