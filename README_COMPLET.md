# 🎓 Gestion des Stages - Application Angular Complète

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Angular](https://img.shields.io/badge/Angular-17+-red.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📖 Description

Application web complète de gestion des stages pour une école d'ingénieurs, développée en Angular 17+ avec une architecture moderne et modulaire.

## 🎯 Objectif

Permettre la gestion complète du cycle de vie d'un stage, de la proposition par l'étudiant jusqu'à la validation par l'enseignant et le suivi administratif.

## 👥 Utilisateurs et Rôles

### 1. **Administrateur**

- Gestion des filières (CRUD)
- Gestion des utilisateurs (création, modification, suppression)
- Vue globale des stages et statistiques
- Réassignation des encadrants si nécessaire

### 2. **Enseignant (Encadrant)**

- Tableau de bord avec statistiques
- Validation/Refus des propositions de stages
- Assignation automatique comme encadrant lors de la validation
- Vue des stages de ses filières

### 3. **Étudiant**

- Proposition de stages (création)
- Modification des stages en brouillon
- Soumission pour validation
- Upload du rapport PDF après validation
- Suivi personnel des stages

## ⚡ Fonctionnalités Principales

### 📋 Workflow des Stages

```
BROUILLON
    ↓ (Soumis)
EN_ATTENTE_VALIDATION
    ├→ VALIDE (+ Encadrant assigné)
    └→ REFUSE (+ Commentaire + Possibilité de modifier)
```

### 🔍 Recherche et Filtrage

- Filtrage par filière
- Filtrage par état du stage
- Filtrage par année (M1, M2)
- Filtrage par entreprise
- Pagination des résultats

### 📊 Statistiques et Dashboard

- **Admin**: Vue globale (total stages, répartition par état/filière, top 5 entreprises)
- **Enseignant**: Stages à valider, statistiques filière
- **Étudiant**: Suivi personnel, statuts des stages, deadlines

### 📄 Gestion des Documents

- Upload de rapport PDF (max 10 MB)
- Téléchargement du rapport
- Suppression (admin ou propriétaire)

### 🔐 Authentification

- Login/Logout avec JWT
- Autoregistration avec assignation automatique du rôle ETUDIANT
- Guards sur les routes pour protéger l'accès

## 🏗️ Architecture

### Structure du Projet

```
src/app/
├── models/              # TypeScript interfaces (8 fichiers)
├── services/            # Services HTTP (7 fichiers)
├── components/          # Composants UI (10 composants)
│   ├── admin/          # 4 composants admin
│   ├── teacher/        # 2 composants enseignant
│   ├── student/        # 3 composants étudiant
│   └── common/         # 1 navbar + login/register
├── app.routes.ts       # Configuration des routes
├── app.ts              # Composant racine
└── index.ts            # Exports centralisés
```

### Points Clés de l'Architecture

- **Standalone Components**: Tous les composants sont autonomes
- **Services Injectable**: Injection de dépendances centralisée
- **Typed Models**: Interfaces TypeScript strictes
- **Reactive Imports**: Imports fonctionnels avec signals
- **Barrel Exports**: Imports simplifiés via index.ts

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 18+
- npm ou yarn
- Angular CLI 17+

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd projet_final

# Installer les dépendances
npm install

# Démarrer l'application
ng serve

# Ouvrir le navigateur
http://localhost:4200
```

### Configuration Backend

L'application s'attend à une API backend sur:

- **Base URL**: `http://localhost:8080/api`
- **Authentification**: JWT Bearer token

Vérifiez le fichier `proxy.conf.json` pour les configurations de proxy.

## 📁 Structure Détaillée

### Modèles (models/)

- `auth.model.ts` - Authentification JWT
- `user.model.ts` - Utilisateurs et rôles
- `filiere.model.ts` - Filières et niveaux
- `stage.model.ts` - Stages et workflow
- `document.model.ts` - Upload documents
- `search.model.ts` - Recherche et pagination
- `statistics.model.ts` - Statistiques

### Services (services/)

- `auth.service.ts` - Gestion authentification
- `api.service.ts` - Appels API génériques
- `filiere.service.ts` - CRUD filières
- `user.service.ts` - CRUD utilisateurs
- `stage.service.ts` - CRUD stages + workflow
- `document.service.ts` - Upload/téléchargement
- `statistics.service.ts` - Récupération stats

### Composants (components/)

#### Admin (4 composants)

- `admin-dashboard` - Vue globale + statistiques
- `filieres-list` - Gestion filières
- `users-management` - Gestion utilisateurs
- `stages-management` - Vue tous les stages

#### Enseignant (2 composants)

- `teacher-dashboard` - Stats enseignant
- `stages-to-validate` - Stages à valider

#### Étudiant (3 composants)

- `student-dashboard` - Suivi personnel
- `create-stage` - Créer/modifier stage
- `my-stages` - Liste personnelle

#### Commun (3 composants)

- `navbar` - Navigation
- `login` - Connexion
- `register` - Inscription

## 🔗 Endpoints API Attendus

### Authentification

```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/verify
POST /api/auth/logout
```

### Filières

```
GET    /api/filieres
GET    /api/filieres/:id
POST   /api/filieres
PUT    /api/filieres/:id
DELETE /api/filieres/:id
```

### Utilisateurs

```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/filiere/:id
```

### Stages

```
GET    /api/stages
GET    /api/stages/:id
POST   /api/stages
PUT    /api/stages/:id
DELETE /api/stages/:id
POST   /api/stages/:id/submit
POST   /api/stages/:id/validate
POST   /api/stages/:id/refuse
POST   /api/stages/:id/reassign-encadrant
GET    /api/stages/my-stages
GET    /api/stages/to-validate
GET    /api/stages/search?filiere=...&etat=...
```

### Documents

```
POST   /api/stages/:id/rapport/upload
GET    /api/stages/:id/rapport/download
DELETE /api/stages/:id/rapport
```

### Statistiques

```
GET /api/statistics/admin/dashboard
GET /api/statistics/teacher/dashboard
GET /api/statistics/student/dashboard
GET /api/statistics/stages/by-state
GET /api/statistics/stages/by-filiere
GET /api/statistics/top-enterprises
```

## 🎨 UI/UX

### Framework CSS

- **Bootstrap 5** - Framework CSS principal
- **Bootstrap Icons** - Icônes

### Responsive Design

- Mobile-first approach
- Breakpoints: XS, SM, MD, LG, XL
- Navigation adaptative

### Composants UI

- Cartes de statistiques
- Tableaux interactifs
- Modales (validation, refus, upload)
- Formulaires validés
- Badges et alertes
- Barres de progression

## 🔐 Sécurité

- **JWT**: Authentification par token JWT
- **Guards**: Protection des routes selon le rôle
- **HTTPS Ready**: Pour production, utiliser HTTPS
- **CORS**: Configuration CORS appropriée requise côté backend
- **Validation**: Validation frontend et backend requise

## 🧪 Tests

Pour tester l'application:

1. **Login Admin**

   - Email: admin@example.com
   - Mot de passe: Utiliser les credentials fournis

2. **Login Enseignant**

   - Email: teacher@example.com
   - Mot de passe: Utiliser les credentials fournis

3. **Login Étudiant**
   - Email: student@example.com
   - Mot de passe: Utiliser les credentials fournis

## 📊 Données de Test

Des données de test peuvent être créées via:

- L'admin: Gestion utilisateurs et filières
- L'étudiant: Créer des stages
- L'enseignant: Valider/refuser les stages

## 📚 Documentation

- `DOCUMENTATION.md` - Guide complet de l'application
- `STRUCTURE_COMPLETE.md` - Résumé détaillé
- `EXAMPLES.ts` - Exemples d'utilisation

## 🐛 Dépannage

### Erreurs courantes

**1. Erreur 404 sur les requêtes API**

- Vérifier que le backend est lancé
- Vérifier la configuration du proxy.conf.json
- Vérifier l'URL de base dans les services

**2. Erreur CORS**

- Configurer CORS côté backend
- Ajouter les headers appropriés

**3. Session expirée**

- Renouveler le token JWT
- Implémenter un refresh token

## 📈 Améliorations Futures

- [ ] Notifications en temps réel
- [ ] Graphiques avancés (Chart.js)
- [ ] Export PDF/CSV
- [ ] Historique des changements
- [ ] Commentaires sur les stages
- [ ] Rappels par email
- [ ] Mobile app (React Native)

## 🤝 Contribution

Les contributions sont les bienvenues! Veuillez suivre le guide de contribution.

## 📄 License

MIT License - Voir le fichier LICENSE pour les détails.

## 👨‍💻 Auteur

Application développée pour la gestion des stages d'ingénieurs.

## 📞 Support

Pour toute question ou problème:

- Consultez la documentation
- Ouvrez une issue
- Contactez l'équipe support

---

**Status**: ✅ Application frontend complète et prête pour intégration backend

**Version**: 1.0.0  
**Dernière mise à jour**: 10 janvier 2026
