import { Routes } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './services/auth.service';

// Public Components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

// Admin Components
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { FiliersListComponent } from './components/admin/filieres-list/filieres-list.component';
import { UsersManagementComponent } from './components/admin/users-management/users-management.component';
import { StagesManagementComponent } from './components/admin/stages-management/stages-management.component';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';

// Teacher Components
import { TeacherDashboardComponent } from './components/teacher/teacher-dashboard/teacher-dashboard.component';
import { StagesToValidateComponent } from './components/teacher/stages-to-validate/stages-to-validate.component';
import { TeacherLayoutComponent } from './components/teacher/teacher-layout/teacher-layout.component';
import { TeacherProfileComponent } from './components/teacher/teacher-profile/teacher-profile.component';
import { MyStudentsComponent } from './components/teacher/my-students/my-students.component';
import { TeacherStageDetailComponent } from './components/teacher/stage-detail/teacher-stage-detail.component';

// Student Components
import { StudentDashboardComponent } from './components/student/student-dashboard/student-dashboard.component';
import { CreateStageComponent } from './components/student/create-stage/create-stage.component';
import { MyStagesComponent } from './components/student/my-stages/my-stages.component';
import { StudentLayoutComponent } from './components/student/student-layout/student-layout.component';
import { StageDetailComponent } from './components/student/stage-detail/stage-detail.component';
import { StudentSettingsComponent } from './components/student/student-settings/student-settings.component';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Côté serveur (SSR), laisser passer - le client gérera l'authentification
  if (!isPlatformBrowser(platformId)) {
    console.log('authGuard: Côté serveur, laisser passer');
    return true;
  }

  console.log(
    'authGuard: isInitialized =',
    authService.isInitialized(),
    ', isAuthenticated =',
    authService.isAuthenticated()
  );

  if (authService.isAuthenticated()) {
    return true;
  }

  console.log('authGuard: Non authentifié, redirection vers login');
  router.navigate(['/login']);
  return false;
};

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Côté serveur (SSR), laisser passer - le client gérera l'authentification
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const user = authService.currentUser();
  console.log('adminGuard: user =', user?.email, ', role =', user?.role);

  if (authService.isAuthenticated() && user?.role === 'ADMIN') {
    return true;
  }

  console.warn('Accès refusé: rôle ADMIN requis');
  router.navigate(['/login']);
  return false;
};

export const teacherGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Côté serveur (SSR), laisser passer - le client gérera l'authentification
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const user = authService.currentUser();
  console.log('teacherGuard: user =', user?.email, ', role =', user?.role);

  if (authService.isAuthenticated() && user?.role === 'ENSEIGNANT') {
    return true;
  }

  console.warn('Accès refusé: rôle ENSEIGNANT requis');
  router.navigate(['/login']);
  return false;
};

export const studentGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Côté serveur (SSR), laisser passer - le client gérera l'authentification
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const user = authService.currentUser();
  console.log('studentGuard: user =', user?.email, ', role =', user?.role);

  if (authService.isAuthenticated() && user?.role === 'ETUDIANT') {
    return true;
  }

  console.warn('Accès refusé: rôle ETUDIANT requis');
  router.navigate(['/login']);
  return false;
};

export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Admin routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'filieres', component: FiliersListComponent },
      { path: 'users', component: UsersManagementComponent },
      { path: 'stages', component: StagesManagementComponent },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/admin/admin-profile/admin-profile.component').then(
            (m) => m.AdminProfileComponent
          ),
      },
    ],
  },

  // Teacher routes
  {
    path: 'teacher',
    component: TeacherLayoutComponent,
    canActivate: [authGuard, teacherGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TeacherDashboardComponent },
      { path: 'stages-to-validate', component: StagesToValidateComponent },
      { path: 'encadrements', component: MyStudentsComponent },
      { path: 'stage/:id', component: TeacherStageDetailComponent },
      { path: 'profile', component: TeacherProfileComponent },
    ],
  },

  // Student routes
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [authGuard, studentGuard],
    children: [
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'my-stages', component: MyStagesComponent },
      { path: 'create-stage', component: CreateStageComponent },
      { path: 'edit-stage/:id', component: CreateStageComponent },
      { path: 'stage/:id', component: StageDetailComponent },
      { path: 'settings', component: StudentSettingsComponent },
    ],
  },

  // Catch all
  { path: '**', redirectTo: '/login' },
];
