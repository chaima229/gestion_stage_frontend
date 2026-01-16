import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api/auth';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const url = `${this.baseUrl}/login`;
    console.log('Sending login request to:', url, credentials);

    return this.http
      .post<AuthResponse>(url, credentials, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => {
          console.log('Login response received:', response);
        }),
        catchError((error) => {
          console.error('Login error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            headers: error.headers,
            errorText: error.error instanceof ProgressEvent ? 'Upload in progress' : error.error,
          });
          return throwError(() => error);
        })
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    const url = `${this.baseUrl}/register`;
    console.log('Sending register request to:', url, data);

    return this.http
      .post<AuthResponse>(url, data, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => {
          console.log('Register response received:', response);
        }),
        catchError((error) => {
          console.error('Register error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            headers: error.headers,
            errorText: error.error instanceof ProgressEvent ? 'Upload in progress' : error.error,
          });
          return throwError(() => error);
        })
      );
  }
}
