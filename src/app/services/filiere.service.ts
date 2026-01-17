import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Filiere, CreateFilierRequest, UpdateFilierRequest } from '../models/filiere.model';

@Injectable({
  providedIn: 'root',
})
export class FiliereService {
  private http = inject(HttpClient);
  private baseUrl = '/api/filieres';

  getAllFilieres(): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(this.baseUrl);
  }

  getFiliereById(id: number): Observable<Filiere> {
    return this.http.get<Filiere>(`${this.baseUrl}/${id}`);
  }

  createFiliere(data: CreateFilierRequest): Observable<Filiere> {
    return this.http.post<Filiere>(this.baseUrl, data);
  }

  updateFiliere(id: number, data: UpdateFilierRequest): Observable<Filiere> {
    return this.http.put<Filiere>(`${this.baseUrl}/${id}`, data);
  }

  deleteFiliere(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getEtudiants(filiereId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${filiereId}/etudiants`);
  }

  getStages(filiereId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${filiereId}/stages`);
  }

  importFilieres(filieres: CreateFilierRequest[]): Observable<{ success: number; errors: number }> {
    return this.http.post<{ success: number; errors: number }>(`${this.baseUrl}/import`, filieres);
  }
}
