import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  isInitialized = signal(false);

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private apiService = inject(ApiService);
  private userService = inject(UserService);

  constructor() {
    // Ne rien faire ici - l'initialisation sera faite par APP_INITIALIZER via checkAuth()
    // Cela évite les problèmes de timing avec SSR
  }

  /**
   * Décode le JWT et retourne les données
   */
  private decodeToken(token: string): any {
    try {
      if (!token) {
        console.error('Token vide');
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Token JWT invalide - nombre de parties incorrect');
        return null;
      }

      const base64Url = parts[1];
      if (!base64Url) {
        console.error('Payload JWT vide');
        return null;
      }

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      let jsonPayload: string;

      try {
        jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      } catch (decodeError) {
        console.error('Erreur lors du décodage Base64:', decodeError);
        return null;
      }

      const decoded = JSON.parse(jsonPayload);
      console.log('Token décodé avec succès:', decoded);
      return decoded;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  login(email: string, password: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiService.login({ email, password }).subscribe({
      next: (response) => {
        console.log('Login successful - Full response:', response);

        if (!response?.token) {
          console.error('Pas de token dans la réponse');
          this.error.set('Erreur de connexion: pas de token reçu');
          this.isLoading.set(false);
          return;
        }

        // Décoder le token pour extraire les informations de l'utilisateur
        const tokenData = this.decodeToken(response.token);

        if (!tokenData) {
          console.error('Impossible de décoder le token');
          this.error.set('Erreur: token invalide');
          this.isLoading.set(false);
          return;
        }

        console.log('Token decoded:', tokenData);

        // Créer l'utilisateur à partir de la réponse de l'API (contient le rôle)
        const user: User = {
          id: response.id || 0,
          email: response.email || '',
          prenom: response.prenom || 'Utilisateur',
          nom: response.nom || '',
          role: (response.role || 'ETUDIANT') as any,
        };
        console.log('User object created:', user);

        if (!user.email) {
          console.error('Email utilisateur vide');
          this.error.set('Erreur: informations utilisateur incomplètes');
          this.isLoading.set(false);
          return;
        }

        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.isLoading.set(false);

        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', response.token);
        }

        // Redirection selon le rôle
        this.redirectByRole(user.role);
      },
      error: (err) => {
        console.error('Login error:', err);
        const errorMessage = this.getErrorMessage(err);
        this.error.set(errorMessage);
        this.isLoading.set(false);
      },
    });
  }

  private getErrorMessage(err: any): string {
    if (err.status === 0) {
      return 'Impossible de se connecter au serveur. Vérifiez que le backend est lancé sur http://localhost:8081';
    }
    if (err.status === 401 || err.status === 403) {
      return 'Email ou mot de passe incorrect.';
    }
    if (err.status === 400) {
      return err.error?.message || 'Données invalides. Vérifiez votre saisie.';
    }
    if (err.error?.message) {
      return err.error.message;
    }
    return 'Erreur de connexion. Veuillez réessayer.';
  }

  private redirectByRole(role: string): void {
    console.log('Redirecting user with role:', role, 'Type:', typeof role);

    // Normaliser le rôle (supprimer les espaces et convertir en majuscules)
    const normalizedRole = role?.trim().toUpperCase() || '';

    console.log('Normalized role:', normalizedRole);

    switch (normalizedRole) {
      case 'ADMIN':
        console.log('Navigating to admin dashboard');
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'ENSEIGNANT':
        console.log('Navigating to teacher dashboard');
        this.router.navigate(['/teacher/dashboard']);
        break;
      case 'ETUDIANT':
        console.log('Navigating to student dashboard');
        this.router.navigate(['/student/dashboard']);
        break;
      default:
        console.warn('Unknown role:', normalizedRole, '- redirecting to home');
        this.router.navigate(['/']);
    }
  }

  register(email: string, prenom: string, nom: string, password: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiService.register({ email, prenom, nom, password }).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        const user: User = {
          id: response.id,
          email: response.email,
          prenom: response.prenom,
          nom: response.nom,
          role: response.role,
        };
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.isLoading.set(false);

        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }

        // Redirection selon le rôle
        this.redirectByRole(user.role);
      },
      error: (err) => {
        console.error('Registration error:', err);
        const errorMessage = this.getErrorMessage(err);
        this.error.set(errorMessage);
        this.isLoading.set(false);
      },
    });
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.error.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }

  checkAuth(): void {
    console.log('checkAuth appelé, isPlatformBrowser =', isPlatformBrowser(this.platformId));

    if (isPlatformBrowser(this.platformId)) {
      // Toujours restaurer l'état côté client
      this.restoreAuthState();
    } else {
      // Côté serveur, pas de localStorage, juste marquer comme initialisé
      console.log('checkAuth: Côté serveur, pas de restauration');
      this.isInitialized.set(true);
    }

    console.log('checkAuth terminé: isAuthenticated =', this.isAuthenticated());
  }

  restoreAuthState(): void {
    console.log('restoreAuthState appelé');

    if (!isPlatformBrowser(this.platformId)) {
      console.log('restoreAuthState: Pas côté navigateur, skip');
      this.isInitialized.set(true);
      return;
    }

    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');

    console.log(
      'restoreAuthState: storedUser =',
      storedUser ? storedUser.substring(0, 50) + '...' : 'null'
    );
    console.log(
      'restoreAuthState: storedToken =',
      storedToken ? storedToken.substring(0, 30) + '...' : 'null'
    );

    if (storedUser && storedToken) {
      try {
        // Vérifier si le token n'est pas expiré
        const tokenData = this.decodeToken(storedToken);
        if (tokenData && tokenData.exp) {
          const expirationDate = new Date(tokenData.exp * 1000);
          if (expirationDate < new Date()) {
            console.warn('Token expiré, déconnexion...');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
            this.isAuthenticated.set(false);
            this.currentUser.set(null);
            this.isInitialized.set(true);
            return;
          }
        }

        const user = JSON.parse(storedUser);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        console.log(
          "État d'authentification restauré avec succès. User:",
          user?.email,
          'Role:',
          user?.role,
          'isAuthenticated:',
          this.isAuthenticated()
        );
      } catch (error) {
        console.error("Erreur lors de la restauration de l'état d'authentification:", error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
      }
    } else {
      console.log('restoreAuthState: Pas de données utilisateur stockées');
      this.isAuthenticated.set(false);
      this.currentUser.set(null);
    }

    this.isInitialized.set(true);
    console.log(
      'restoreAuthState terminé: isInitialized =',
      this.isInitialized(),
      ', isAuthenticated =',
      this.isAuthenticated()
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.userService.getAllUsers();
  }
}
