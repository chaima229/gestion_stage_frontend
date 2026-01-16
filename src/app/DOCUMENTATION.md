# Application de Gestion des Stages - Documentation

## 📋 Vue d'ensemble

Application web complète de gestion des stages pour une école d'ingénieurs, développée avec Angular 17+ en standalone components.

## 👥 Types d'utilisateurs

### 1. **Admin**

- **Tableau de Bord**: Statistiques globales, graphiques
- **Gestion des Filières**: CRUD des filières
- **Gestion des Utilisateurs**: CRUD des utilisateurs, assignation des rôles
- **Gestion des Stages**: Vue tous les stages, réassignation d'encadrants

### 2. **Enseignant (Encadrant)**

- **Tableau de Bord**: Statistiques personnelles
- **Stages à Valider**: Liste des stages en attente de validation
- **Actions**: Validation avec assignation encadrant, Refus avec commentaire

### 3. **Étudiant**

- **Tableau de Bord**: Suivi personnel des stages
- **Mes Stages**: Liste de tous les stages personnels
- **Créer Stage**: Proposition de nouveau stage (état BROUILLON)
- **Modifier Stage**: Modification des stages en BROUILLON ou REFUSE
- **Upload Rapport**: Chargement du rapport PDF après validation

## 📁 Structure du projet

```
src/app/
├── models/
│   ├── auth.model.ts              # Modèles d'authentification
│   ├── user.model.ts              # Modèles utilisateur
│   ├── filiere.model.ts           # Modèles filière
│   ├── stage.model.ts             # Modèles stage et workflow
│   ├── document.model.ts          # Modèles document/rapport
│   ├── search.model.ts            # Modèles recherche/pagination
│   ├── statistics.model.ts        # Modèles statistiques
│   └── index.ts                   # Export centralisé
│
├── services/
│   ├── auth.service.ts            # Authentification JWT
│   ├── api.service.ts             # Requêtes API génériques
│   ├── filiere.service.ts         # Gestion filières
│   ├── user.service.ts            # Gestion utilisateurs
│   ├── stage.service.ts           # Gestion stages
│   ├── document.service.ts        # Gestion documents
│   ├── statistics.service.ts      # Statistiques
│   └── index.ts                   # Export centralisé
│
├── components/
│   ├── admin/
│   │   ├── admin-dashboard/       # TS, HTML, CSS
│   │   ├── filieres-list/
│   │   ├── users-management/
│   │   └── stages-management/
│   │
│   ├── teacher/
│   │   ├── teacher-dashboard/
│   │   └── stages-to-validate/
│   │
│   ├── student/
│   │   ├── student-dashboard/
│   │   ├── create-stage/
│   │   └── my-stages/
│   │
│   ├── common/
│   │   ├── navbar/
│   │   ├── login/
│   │   └── register/
│   │
│   └── index.ts                   # Export centralisé
│
├── app.ts                         # Composant racine
├── app.routes.ts                  # Configuration des routes
└── app.html, app.css              # Templates
```

## 🔀 Workflow des stages

```
BROUILLON
    ↓ (Soumis pour validation)
EN_ATTENTE_VALIDATION
    ├→ VALIDE (+ Encadrant assigné)
    └→ REFUSE (+ Commentaire)
        ↓ (Peut être modifié et renvoyé)
    EN_ATTENTE_VALIDATION
```

## 🔐 Authentification

- **JWT (JSON Web Token)** pour l'authentification
- **Spring Security** côté backend
- **Tokens stockés** en localStorage
- **Guards** pour protéger les routes

## 🔍 Fonctionnalités principales

### Recherche et Filtres

- Filtrage par filière
- Filtrage par état du stage
- Filtrage par entreprise
- Filtrage par année (M1, M2)
- Pagination des résultats

### Gestion des Documents

- Upload de rapports PDF uniquement
- Limit taille: 10 MB max
- Téléchargement des rapports
- Suppression (admin ou propriétaire)

### Statistiques

- **Dashboard Admin**: Vue globale de la plateforme
- **Dashboard Enseignant**: Stages à valider, statistiques filière
- **Dashboard Étudiant**: Suivi personnel, deadlines
- Graphiques et cartes numériques

## 📦 Modèles de données

### User

```typescript
{
  id: number,
  nom: string,
  prenom: string,
  email: string,
  role: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT',
  filiereId?: number,
  annee?: string
}
```

### Stage

```typescript
{
  id: number,
  sujet: string,
  description: string,
  entreprise: string,
  ville: string,
  dateDebut: Date,
  dateFin: Date,
  etat: 'BROUILLON' | 'EN_ATTENTE_VALIDATION' | 'VALIDE' | 'REFUSE',
  etudiantId: number,
  encadrantId?: number,
  commentaireRefus?: string,
  rapportPath?: string
}
```

### Filiere

```typescript
{
  id: number,
  nom: string,
  niveau: 'M1' | 'M2',
  description?: string,
  enseignants?: number[]
}
```

## 🎨 Composants UI

### Cartes de statistiques

- Affichage de chiffres clés
- Couleurs représentant les rôles
- Indicateurs de progression

### Tableaux

- Tri et filtrage
- Actions (Modifier, Supprimer, Voir détails)
- Responsive design

### Modales

- Validation/Refus stages
- Upload de rapports
- Détails des stages

### Badges

- Couleurs par état de stage
- Badges de rôles utilisateur

## 🚀 Points d'accès par rôle

| Rôle       | URL                   | Composants                                |
| ---------- | --------------------- | ----------------------------------------- |
| Admin      | `/admin/dashboard`    | Dashboard, Filières, Utilisateurs, Stages |
| Enseignant | `/teacher/dashboard`  | Dashboard, Stages à valider               |
| Étudiant   | `/student/dashboard`  | Dashboard, Mes stages, Créer stage        |
| Public     | `/login`, `/register` | Login, Register                           |

## 💾 Services HTTP

Tous les services utilisent l'API backend via `/api/`:

- `/api/auth` - Authentification
- `/api/filieres` - Gestion filières
- `/api/users` - Gestion utilisateurs
- `/api/stages` - Gestion stages
- `/api/documents` - Gestion documents
- `/api/statistics` - Statistiques

## 🔄 Flux d'authentification

1. Utilisateur se connecte via `/login`
2. Reçoit un JWT token
3. Token stocké en localStorage
4. Token envoyé en header Authorization pour chaque requête
5. Guard protège les routes privées
6. Logout efface le token

## 📱 Responsive Design

- Mobile-first approach
- Bootstrap 5 pour le layout
- Breakpoints: XS, SM, MD, LG, XL
- Navigation responsive avec hamburger menu

## 🛠 Configuration Bootstrap

- Classes utilitaires Bootstrap
- Grid system 12 colonnes
- Composants buttons, forms, modales, navbar
- Icônes Bootstrap Icons (bi)

## 📝 Notes importantes

1. **Validation des stages**: Seuls les enseignants de la filière peuvent valider
2. **Encadrants**: Assignés au moment de la validation
3. **Rapports**: Uploadables uniquement après validation
4. **Suppression stages**: Possible uniquement en BROUILLON ou REFUSE
5. **Modification stages**: Possible uniquement en BROUILLON ou REFUSE

## 🔗 Liens utiles

- [Angular Documentation](https://angular.io)
- [Bootstrap 5](https://getbootstrap.com)
- [Bootstrap Icons](https://icons.getbootstrap.com)

## 📧 Contact et Support

Pour toute question ou problème avec cette application, contactez l'équipe de développement.
