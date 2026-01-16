import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';
import {
  Stage,
  StageWithDetails,
  CreateStageRequest,
  UpdateStageRequest,
  ValidateStageRequest,
  RefuseStageRequest,
  ReassignEncadrantRequest,
  StageSearchFilter,
  StagePaginatedResponse,
} from '../models/stage.model';

@Injectable({
  providedIn: 'root',
})
export class StageService {
  private http = inject(HttpClient);
  private baseUrl = '/api/stages';

  // Cache pour les stages
  private stagesCache$: Observable<StageWithDetails[]> | null = null;

  // Public endpoints
  getAllStages(): Observable<StageWithDetails[]> {
    return this.http
      .get<any[]>(this.baseUrl)
      .pipe(map((stages) => stages.map((stage) => this.mapToStageWithDetails(stage))));
  }

  // Mapper le DTO backend vers StageWithDetails
  private mapToStageWithDetails(dto: any): StageWithDetails {
    return {
      ...dto,
      etudiant: dto.etudiantId
        ? {
            id: dto.etudiantId,
            nom: dto.etudiantNom || '',
            prenom: dto.etudiantPrenom || '',
            email: dto.etudiantEmail || '',
          }
        : undefined,
      encadrant: dto.encadrantId
        ? {
            id: dto.encadrantId,
            nom: dto.encadrantNom || '',
            prenom: dto.encadrantPrenom || '',
            email: dto.encadrantEmail || '',
          }
        : undefined,
      filiere: dto.filiereId
        ? {
            id: dto.filiereId,
            nom: dto.filiereNom || '',
            niveau: dto.filiereCode || '',
          }
        : undefined,
    };
  }

  // Méthode avec cache pour améliorer les performances
  getAllStagesCached(): Observable<StageWithDetails[]> {
    if (!this.stagesCache$) {
      this.stagesCache$ = this.http.get<StageWithDetails[]>(this.baseUrl).pipe(shareReplay(1));
    }
    return this.stagesCache$;
  }

  // Invalider le cache
  invalidateCache(): void {
    this.stagesCache$ = null;
  }

  getStageById(id: number): Observable<Stage> {
    return this.http.get<Stage>(`${this.baseUrl}/${id}`);
  }

  searchStages(filters: StageSearchFilter): Observable<StagePaginatedResponse> {
    // Construire les params avec les bons noms pour le backend
    let params = new HttpParams();

    if (filters.filiereId) {
      params = params.set('filiere', filters.filiereId.toString());
    }
    if (filters.etat) {
      params = params.set('etat', filters.etat);
    }
    if (filters.entreprise) {
      params = params.set('entreprise', filters.entreprise);
    }
    if (filters.annee) {
      params = params.set('annee', filters.annee);
    }

    return this.http.get<StageWithDetails[]>(`${this.baseUrl}/search`, { params }).pipe(
      map((stages) => ({
        content: stages,
        totalElements: stages.length,
        totalPages: 1,
        currentPage: 0,
        pageSize: stages.length,
      }))
    );
  }

  // Student endpoints
  getMyStages(): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.baseUrl}/my-stages`);
  }

  createStage(data: CreateStageRequest): Observable<Stage> {
    return this.http.post<Stage>(this.baseUrl, data);
  }

  updateStage(id: number, data: UpdateStageRequest): Observable<Stage> {
    return this.http.put<Stage>(`${this.baseUrl}/${id}`, data);
  }

  submitStageForValidation(id: number): Observable<Stage> {
    return this.http.put<Stage>(`${this.baseUrl}/${id}/submit`, {});
  }

  deleteStage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadDocument(stageId: number, formData: FormData): Observable<any> {
    return this.http.post(`/api/documents/upload/${stageId}`, formData);
  }

  // Teacher endpoints
  getStagesToValidate(): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.baseUrl}/to-validate`);
  }

  validateStage(id: number, data: ValidateStageRequest): Observable<Stage> {
    const params = new HttpParams().set('encadrantId', data.encadrantId?.toString() || '');
    return this.http.put<Stage>(`${this.baseUrl}/${id}/validate`, null, { params });
  }

  refuseStage(id: number, data: RefuseStageRequest): Observable<Stage> {
    const params = new HttpParams().set('commentaire', data.commentaire || '');
    return this.http.put<Stage>(`${this.baseUrl}/${id}/refuse`, null, { params });
  }

  // Admin endpoints
  reassignEncadrant(id: number, data: ReassignEncadrantRequest): Observable<Stage> {
    return this.http.post<Stage>(`${this.baseUrl}/${id}/reassign-encadrant`, data);
  }

  // Statistics
  getStagesByFiliere(filiereId: number): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.baseUrl}/filiere/${filiereId}`);
  }

  getStagesByStudent(studentId: number): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.baseUrl}/student/${studentId}`);
  }

  getStagesByTeacher(teacherId: number): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.baseUrl}/teacher/${teacherId}`);
  }

  getStagesByEncadrant(encadrantId: number): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.baseUrl}/encadrant/${encadrantId}`);
  }
}
