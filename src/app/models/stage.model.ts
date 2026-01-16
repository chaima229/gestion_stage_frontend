/**
 * États possibles d'un stage
 */
export enum StageState {
  BROUILLON = 'BROUILLON',
  EN_ATTENTE_VALIDATION = 'EN_ATTENTE_VALIDATION',
  VALIDE = 'VALIDE',
  REFUSE = 'REFUSE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  SOUTENU = 'SOUTENU',
  ANNULE = 'ANNULE',
}

/**
 * Interface Stage
 */
export interface Stage {
  id?: number;
  sujet: string;
  description: string;
  entreprise: string;
  ville: string;
  dateDebut: Date;
  dateFin: Date;
  etat: StageState;
  etudiantId: number;
  encadrantId?: number; // Optionnel au début, obligatoire après validation
  commentaireRefus?: string; // Uniquement si le stage est REFUSE
  rapportPath?: string; // Chemin du rapport PDF
  createdAt?: Date;
  updatedAt?: Date;

  // Informations de l'étudiant (remplies par l'API)
  etudiantNom?: string;
  etudiantPrenom?: string;
  etudiantEmail?: string;

  // Informations de l'encadrant (remplies par l'API)
  encadrantNom?: string;
  encadrantPrenom?: string;
  encadrantEmail?: string;

  // Informations de la filière (remplies par l'API)
  filiereId?: number;
  filiereNom?: string;
  filiereCode?: string;

  commentaire?: string;
}

/**
 * Requête pour créer/proposer un stage
 */
export interface CreateStageRequest {
  sujet: string;
  description: string;
  entreprise: string;
  ville: string;
  dateDebut: Date;
  dateFin: Date;
  encadrantId?: number; // Optionnel : l'étudiant peut choisir son encadrant
}

/**
 * Requête pour mettre à jour un stage
 */
export interface UpdateStageRequest {
  sujet?: string;
  description?: string;
  entreprise?: string;
  ville?: string;
  dateDebut?: Date;
  dateFin?: Date;
}

/**
 * Requête pour valider un stage (par un enseignant)
 */
export interface ValidateStageRequest {
  encadrantId: number;
}

/**
 * Requête pour refuser un stage (par un enseignant)
 */
export interface RefuseStageRequest {
  commentaire: string;
}

/**
 * Requête pour réassigner un encadrant (par un admin)
 */
export interface ReassignEncadrantRequest {
  encadrantId: number;
}

/**
 * Réponse complète d'un stage avec détails étudiant et encadrant
 */
export interface StageWithDetails extends Stage {
  etudiant?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  encadrant?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  filiere?: {
    id: number;
    nom: string;
    niveau: string;
  };
}

/**
 * Réponse pour l'upload d'un rapport
 */
export interface UploadRapportResponse {
  stageId: number;
  rapportPath: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

/**
 * Paramètres de recherche et filtrage pour les stages
 */
export interface StageSearchFilter {
  filiereId?: number;
  etat?: StageState;
  annee?: string;
  entreprise?: string;
  etudiantId?: number;
  encadrantId?: number;
  dateDebut?: Date;
  dateFin?: Date;
  page?: number;
  pageSize?: number;
}

/**
 * Réponse paginée pour les stages
 */
export interface StagePaginatedResponse {
  content: StageWithDetails[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
