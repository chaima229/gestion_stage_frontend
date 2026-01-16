import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

export interface ImportResult {
  totalTraite: number;
  succes: number;
  erreurs: number;
  detailsErreurs: string[];
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = '/api/users';

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  /**
   * Récupérer tous les enseignants (accessible aux étudiants)
   */
  getAllEnseignants(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/enseignants`);
  }

  /**
   * Récupérer les enseignants d'une filière spécifique
   */
  getEnseignantsByFiliere(filiereId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/enseignants/filiere/${filiereId}`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  createUser(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, data);
  }

  updateUser(id: number, data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  searchUsers(filters: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/search`, { params: filters });
  }

  getEtudiantsByFiliere(filiereId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/filiere/${filiereId}`);
  }

  /**
   * Importer des utilisateurs depuis un fichier Excel
   */
  importUsersFromExcel(file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResult>(`${this.baseUrl}/import`, formData);
  }

  /**
   * Mettre à jour le profil d'un utilisateur (nom, prénom)
   */
  updateProfile(userId: number, data: { nom: string; prenom: string }): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${userId}/profile`, data);
  }

  /**
   * Changer le mot de passe d'un utilisateur
   */
  updatePassword(
    userId: number,
    data: { currentPassword: string; newPassword: string }
  ): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/password`, data);
  }

  /**
   * Bloquer ou débloquer un compte utilisateur
   */
  toggleUserStatus(userId: number, actif: boolean): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${userId}/status`, { actif });
  }
}
