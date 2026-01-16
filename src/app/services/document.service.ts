import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UploadDocumentResponse, DeleteDocumentResponse, Document } from '../models/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private http = inject(HttpClient);
  private baseUrl = '/api/documents';
  private stageBaseUrl = '/api/stages';

  uploadRapport(stageId: number, formData: FormData): Observable<UploadDocumentResponse> {
    return this.http.post<UploadDocumentResponse>(
      `${this.stageBaseUrl}/${stageId}/rapport/upload`,
      formData
    );
  }

  downloadRapport(stageId: number): Observable<Blob> {
    return this.http.get(`${this.stageBaseUrl}/${stageId}/rapport/download`, {
      responseType: 'blob',
    });
  }

  deleteRapport(stageId: number): Observable<DeleteDocumentResponse> {
    return this.http.delete<DeleteDocumentResponse>(`${this.stageBaseUrl}/${stageId}/rapport`);
  }

  getDocumentsByStage(stageId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.stageBaseUrl}/${stageId}/documents`);
  }

  deleteDocument(documentId: number): Observable<DeleteDocumentResponse> {
    return this.http.delete<DeleteDocumentResponse>(`${this.baseUrl}/${documentId}`);
  }
}
