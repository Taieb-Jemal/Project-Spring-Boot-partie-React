// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'ETUDIANT' | 'FORMATEUR';
  firstName: string;
  lastName: string;
  active?: boolean;
  createdAt?: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  user: User;
}

// Student types
export interface Student {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  dateInscription?: string;
}

export interface StudentFormData {
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
}

// Trainer types
export interface Trainer {
  id: number;
  idFormateur?: string;
  nom: string;
  prenom: string;
  email: string;
  specialite: string;
}

export interface TrainerFormData {
  idFormateur: string;
  nom: string;
  prenom: string;
  email: string;
  specialite: string;
}

// Course types
export interface Course {
  id: number;
  code: string;
  titre: string;
  description: string;
  credits?: number;
  heures?: number;
  formateur?: Trainer;
  actif?: boolean;
}

export interface CourseFormData {
  code: string;
  titre: string;
  description: string;
  credits?: number;
  heures?: number;
  formateurId?: number;
}

// Registration types
export type RegistrationStatus = 'ACTIVE' | 'ANNULEE' | 'COMPLETEE';

export interface Registration {
  id: number;
  etudiant: Student;
  cours: Course;
  dateInscription: string;
  statut: RegistrationStatus;
}

export interface RegistrationFormData {
  etudiantId: number;
  coursId: number;
  statut?: RegistrationStatus;
}

// Grade types
export interface Grade {
  id: number;
  etudiant: Student;
  cours: Course;
  valeur: number;
  dateAttribution?: string;
}

export interface GradeFormData {
  etudiantId: number;
  coursId: number;
  valeur: number;
}

// API Error type
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
