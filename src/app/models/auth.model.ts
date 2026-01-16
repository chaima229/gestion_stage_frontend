import { UserRole } from './user.model';

/**
 * Requête de connexion
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Requête d'enregistrement
 */
export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role?: UserRole; // Par défaut: ETUDIANT si non spécifié
  filiereId?: number; // Pour les étudiants
  annee?: string; // Pour les étudiants
}

/**
 * Requête de changement de mot de passe
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Requête de réinitialisation de mot de passe
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Requête de réinitialisation de mot de passe avec token
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Réponse d'authentification complète
 */
export interface AuthResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  token: string;
  refreshToken?: string;
  expiresIn?: number; // En secondes
  filiereId?: number;
  annee?: string;
}

/**
 * Réponse générique d'erreur d'authentification
 */
export interface AuthErrorResponse {
  error: string;
  message: string;
  timestamp: Date;
  path?: string;
}

/**
 * État d'authentification
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: AuthResponse | null;
}

/**
 * Token JWT décodé
 */
export interface JWTToken {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Réponse de vérification du token
 */
export interface TokenVerificationResponse {
  valid: boolean;
  expiresIn: number;
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}
