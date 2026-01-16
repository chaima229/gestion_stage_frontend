/**
 * Niveaux d'étude
 */
export enum NiveauFiliere {
  M1 = 'M1',
  M2 = 'M2',
}

/**
 * Interface Filière
 */
export interface Filiere {
  id: number;
  nom: string;
  niveau: NiveauFiliere;
  description?: string;
  enseignants?: number[]; // IDs des enseignants associés
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Requête pour créer/modifier une filière
 */
export interface CreateFilierRequest {
  nom: string;
  niveau: NiveauFiliere;
  description?: string;
}

/**
 * Requête pour mettre à jour une filière
 */
export interface UpdateFilierRequest {
  nom?: string;
  niveau?: NiveauFiliere;
  description?: string;
}

/**
 * Réponse pour les statistiques d'une filière
 */
export interface FiliereStatistics {
  filiereId: number;
  filiereName: string;
  nombreEtudiants: number;
  nombreStages: number;
  nombreEtudiants_M1?: number;
  nombreEtudiants_M2?: number;
}
