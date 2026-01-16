/**
 * Rôles utilisateur
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  SOUS_ADMIN = 'SOUS_ADMIN',
  ENSEIGNANT = 'ENSEIGNANT',
  ETUDIANT = 'ETUDIANT',
}

/**
 * Interface User complète avec gestion des rôles
 */
export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string; // Ne sera pas retourné par l'API
  role: UserRole;
  filiereId?: number; // Pour les étudiants
  annee?: string; // Pour les étudiants (M1, M2, etc.)
  actif?: boolean; // État du compte (actif/bloqué)
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Réponse de connexion
 */
export interface LoginResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  token: string;
  filiereId?: number;
  annee?: string;
}

/**
 * Réponse d'enregistrement
 */
export interface RegisterResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
}

/**
 * Données utilisateur pour les opérations CRUD (Admin)
 */
export interface CreateUserRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: string;
  filiereId?: number | null;
  annee?: string;
}

/**
 * Données pour la mise à jour d'un utilisateur
 */
export interface UpdateUserRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  motDePasse?: string;
  role?: string;
  filiereId?: number | null;
  annee?: string;
}
