/**
 * Types de documents acceptés
 */
export enum DocumentType {
  RAPPORT_STAGE = 'RAPPORT_STAGE',
}

/**
 * Interface Document/Rapport
 */
export interface Document {
  id?: number;
  stageId: number;
  type: DocumentType;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: number; // ID de l'utilisateur qui a uploadé
  uploadedAt: Date;
  updatedAt?: Date;
}

/**
 * Requête pour l'upload d'un document
 */
export interface UploadDocumentRequest {
  file: File;
  type: DocumentType;
}

/**
 * Réponse de l'upload d'un document
 */
export interface UploadDocumentResponse {
  id: number;
  stageId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: Date;
  message: string;
}

/**
 * Paramètres pour le téléchargement d'un document
 */
export interface DocumentDownloadParams {
  documentId: number;
  stageId: number;
}

/**
 * Réponse pour la suppression d'un document
 */
export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
  documentId: number;
}

/**
 * Validations pour les uploads
 */
export interface DocumentUploadValidation {
  maxFileSize: number; // En bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}
