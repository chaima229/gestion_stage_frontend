/**
 * Barrel exports pour l'application
 * Permet des imports simples et centralisés
 */

// Models
export * from './models/auth.model';
export * from './models/user.model';
export * from './models/filiere.model';
export * from './models/stage.model';
export * from './models/document.model';
export * from './models/search.model';
export * from './models/statistics.model';

// Services
export * from './services/auth.service';
export * from './services/api.service';
export * from './services/filiere.service';
export * from './services/user.service';
export * from './services/stage.service';
export * from './services/document.service';
export * from './services/statistics.service';

// Components
export * from './components/admin/admin-dashboard/admin-dashboard.component';
export * from './components/admin/filieres-list/filieres-list.component';
export * from './components/admin/users-management/users-management.component';
export * from './components/admin/stages-management/stages-management.component';

export * from './components/teacher/teacher-dashboard/teacher-dashboard.component';
export * from './components/teacher/stages-to-validate/stages-to-validate.component';

export * from './components/student/student-dashboard/student-dashboard.component';
export * from './components/student/create-stage/create-stage.component';
export * from './components/student/my-stages/my-stages.component';

export * from './components/common/navbar/navbar.component';
export * from './components/login/login.component';
export * from './components/register/register.component';
