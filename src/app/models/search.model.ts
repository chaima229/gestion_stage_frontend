import { StageState } from './stage.model';

/**
 * Filtre de recherche pour les stages
 */
export interface StageSearchRequest {
  filiere?: string | number; // Nom ou ID
  etat?: StageState;
  annee?: string; // M1, M2
  entreprise?: string;
  etudiantId?: number;
  encadrantId?: number;
  dateDebutFrom?: Date;
  dateDebutTo?: Date;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

/**
 * Filtre de recherche pour les utilisateurs
 */
export interface UserSearchRequest {
  filiereId?: number;
  role?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  annee?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

/**
 * Filtre de recherche pour les filières
 */
export interface FilierSearchRequest {
  nom?: string;
  niveau?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

/**
 * Réponse générique paginée
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  empty?: boolean;
  last?: boolean;
  first?: boolean;
}

/**
 * Paramètres de pagination
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

/**
 * Configuration de recherche
 */
export interface SearchConfig {
  enableFiltersearch: boolean;
  enableFullTextSearch: boolean;
  defaultPageSize: number;
  maxPageSize: number;
}
