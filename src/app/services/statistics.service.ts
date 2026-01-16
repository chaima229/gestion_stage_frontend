import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DashboardStatistics,
  TeacherDashboardStatistics,
  StudentDashboardStatistics,
  PlatformStatistics,
} from '../models/statistics.model';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private http = inject(HttpClient);
  private baseUrl = '/api/statistics';

  getDashboardStatistics(): Observable<DashboardStatistics> {
    console.log('🔵 Appel API: GET /api/statistics/admin/dashboard');
    return this.http.get<DashboardStatistics>(`${this.baseUrl}/admin/dashboard`).pipe(
      map((data) => {
        console.log('🔵 Réponse brute admin dashboard:', data);
        return data;
      })
    );
  }

  getTeacherDashboardStatistics(): Observable<TeacherDashboardStatistics> {
    console.log('🟢 Appel API: GET /api/statistics/teacher/dashboard');
    return this.http.get<TeacherDashboardStatistics>(`${this.baseUrl}/teacher/dashboard`).pipe(
      map((data) => {
        console.log('🟢 Réponse brute teacher dashboard:', data);
        return data;
      })
    );
  }

  getStudentDashboardStatistics(): Observable<StudentDashboardStatistics> {
    console.log('🟡 Appel API: GET /api/statistics/student/dashboard');
    return this.http.get<StudentDashboardStatistics>(`${this.baseUrl}/student/dashboard`).pipe(
      map((stats) => {
        console.log('🟡 Réponse brute student dashboard:', stats);
        const result = {
          ...stats,
          lastStageUpdate: stats.lastStageUpdate ? new Date(stats.lastStageUpdate) : new Date(0),
          nextDeadline: stats.nextDeadline ? new Date(stats.nextDeadline) : undefined,
        };
        console.log('🟡 Réponse transformée student dashboard:', result);
        return result;
      })
    );
  }

  getPlatformStatistics(): Observable<PlatformStatistics> {
    return this.http.get<PlatformStatistics>(`${this.baseUrl}/platform`);
  }

  getStagesByState(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stages/by-state`);
  }

  getStagesByFiliere(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stages/by-filiere`);
  }

  getTopEntreprises(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/top-enterprises`);
  }

  export(format: 'CSV' | 'PDF' | 'JSON'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export?format=${format}`, {
      responseType: 'blob',
    });
  }
}
