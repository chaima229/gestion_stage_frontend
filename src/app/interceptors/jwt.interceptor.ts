import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si on est côté navigateur
  if (isPlatformBrowser(platformId)) {
    // Récupérer le token du localStorage
    const token = localStorage.getItem('token');

    // Ajouter le token aux headers si disponible
    if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
      console.log('JWT Interceptor: Adding token to request:', req.url);
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Gestion des erreurs 401 uniquement (seulement côté navigateur)
      if (isPlatformBrowser(platformId) && error.status === 401) {
        console.error("Erreur d'authentification (401):", error.status);
        // Déconnecter l'utilisateur
        authService.logout();
        // Rediriger vers la page de login
        router.navigate(['/login'], {
          queryParams: { reason: 'session-expired' },
        });
      }

      return throwError(() => error);
    })
  );
};
