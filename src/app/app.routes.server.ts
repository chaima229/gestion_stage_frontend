import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Routes avec paramètres dynamiques - utiliser le mode Client pour éviter les problèmes de prerendering
  {
    path: 'student/edit-stage/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'student/stages/edit/**',
    renderMode: RenderMode.Client,
  },
  // Routes protégées par authentification - utiliser Client pour que l'auth fonctionne correctement
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'teacher/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'student/**',
    renderMode: RenderMode.Client,
  },
  // Routes publiques peuvent être prérendues
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
