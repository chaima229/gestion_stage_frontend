import { StageState } from './stage.model';

/**
 * Statistiques d'un état de stage
 */
export interface StageStateStatistic {
  state: StageState;
  count: number;
  percentage?: number;
}

/**
 * Statistiques d'une filière
 */
export interface FiliereStatistic {
  filiereId: number;
  filiereName: string;
  count: number;
  percentage?: number;
}

/**
 * Statistiques d'une entreprise
 */
export interface EntrepriseStatistic {
  entreprise: string;
  count: number;
  percentage?: number;
}

/**
 * Tableau de bord - Statistiques globales
 */
export interface DashboardStatistics {
  // Statistiques globales
  totalStages: number;
  stagesEnCours: number;
  stagesTermines: number;

  // Répartition par état
  stagesByState: StageStateStatistic[];

  // Répartition par filière
  stagesByFiliere: FiliereStatistic[];

  // Top 5 entreprises
  topEntreprises: EntrepriseStatistic[];

  // Statistiques supplémentaires
  nombreFilierEs: number;
  nombreEtudiants: number;
  nombreEnseignants: number;
  // Champs pour compatibilité avec la réponse API
  totalTeachers?: number;
  totalStudents?: number;

  // Dates
  generatedAt: Date;
}

/**
 * Statistiques pour un utilisateur enseignant
 */
export interface TeacherDashboardStatistics {
  totalStagesToValidate: number;
  stagesValidated: number;
  stagesRefused: number;
  totalStudents: number;

  stagesByState: StageStateStatistic[];
  stagesByFiliere: FiliereStatistic[];

  generatedAt: Date;
}

/**
 * Statistiques pour un utilisateur étudiant
 */
export interface StudentDashboardStatistics {
  totalStages: number;
  stagesByState: StageStateStatistic[];
  lastStageUpdate: Date | null;
  nextDeadline?: Date;
}

/**
 * Statistiques de la plateforme (Admin)
 */
export interface PlatformStatistics {
  // Utilisateurs
  totalUsers: number;
  totalAdmins: number;
  totalTeachers: number;
  totalStudents: number;

  // Filières
  totalFilieres: number;

  // Stages
  totalStages: number;
  stagesByState: StageStateStatistic[];
  stagesByFiliere: FiliereStatistic[];
  topEntreprises: EntrepriseStatistic[];

  // Taux de complétion
  completionRate: number;

  // Activité récente
  newStagesThisMonth: number;
  newUsersThisMonth: number;

  generatedAt: Date;
}

/**
 * Données pour les graphiques
 */
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

/**
 * Données pour graphique circulaire (stages par état)
 */
export interface PieChartData extends ChartData {
  total: number;
}

/**
 * Données pour graphique en barres (stages par filière)
 */
export interface BarChartData extends ChartData {}

/**
 * Réponse d'export de statistiques
 */
export interface ExportStatisticsResponse {
  format: 'CSV' | 'PDF' | 'JSON';
  fileName: string;
  downloadUrl: string;
  generatedAt: Date;
}
