# Changelog - MrBrico Immo

## [0.5.0] - 2026-02-01

### Ajouté
- **Gestion des Gestionnaires (Admin)** 👥
  - Page `/admin/managers` améliorée avec cartes cliquables
  - Page détail `/admin/managers/[id]` complète
    - Informations de contact (email, téléphone, adresse)
    - Liste des immeubles gérés
    - Demandes récentes avec liens directs
    - Statistiques (nombre d'immeubles, demandes, actif depuis)
  - Page création `/admin/managers/new` avec formulaire complet ✅
    - Création compte utilisateur (nom, email, mot de passe)
    - Informations entreprise (nom, téléphone, adresse, notes)
    - **API route `/api/admin/managers` complètement fonctionnelle**
    - Création automatique dans Supabase Auth et table property_managers
    - Redirection automatique vers la liste après création réussie
  - Page édition `/admin/managers/[id]/edit` complète ✅
    - Modification des informations utilisateur et entreprise
    - API PUT pour mise à jour sécurisée
  - Bouton "Nouveau gestionnaire" dans la liste
  - Bouton "Modifier" sur chaque carte gestionnaire

### Amélioré
- Cards gestionnaires maintenant entièrement cliquables
- Navigation fluide entre liste, détail et édition
- Layout responsive avec grille 3 colonnes sur grand écran
- Affichage cohérent des statistiques et données relationnelles
- Gestion complète du cycle de vie des gestionnaires (CRUD complet)

### Technique
- **API Route `/api/admin/managers`** (POST & PUT)
  - Utilisation de `createServiceClient()` pour bypass RLS
  - Méthode `auth.admin.createUser()` pour création sécurisée
  - Vérification du rôle admin avant toute opération
  - Gestion d'erreurs complète avec logs détaillés
- Requête Supabase avec relations imbriquées (buildings, work_requests, users)
- Utilisation de `useParams()` pour routing dynamique
- Gestion d'états de chargement avec `PageLoader`
- Types TypeScript avec ManagerWithDetails et ManagerWithBuildings

### Corrigé
- Colonne `contact_email` maintenant correctement remplie lors de la création
- Utilisation de `contact_phone` au lieu de `phone` (match avec schéma DB)
- Import correct de `createClient` et `createServiceClient` depuis `/lib/supabase/server`

---

## [0.4.0] - 2026-02-01

### Ajouté
- **Interface Admin Améliorée** 🔧
  - Filtre par gestionnaire dans `/admin/requests`
  - Actions rapides sur chaque demande via menu dropdown
  - Changement de statut rapide (Passer en évaluation, Refuser, etc.)
  - Bouton "Réinitialiser" pour effacer tous les filtres
  - Mise à jour automatique de la liste après changement de statut
  - Composant `AdminRequestCard` avec actions contextuelles

### Amélioré
- Page `/admin/requests` avec meilleure organisation des filtres
- Layout des filtres en grille responsive (4 colonnes)
- Hook `useWorkRequests` déjà supportait le filtre par managerId
- Affichage cohérent des demandes avec infos du gestionnaire

### Technique
- Nouveau composant: `components/admin/AdminRequestCard.tsx`
- Gestion d'erreurs avec alert() au lieu de toast
- Auto-refresh de la liste via callback `onStatusChange`
- Historique automatique lors des changements de statut rapides

---

## [0.3.0] - 2026-02-01

### Ajouté
- **Édition de Demande** ✏️
  - Page `/manager/requests/[id]/edit` complète
  - Modification des informations de la demande
  - Ajout de photos supplémentaires après création
  - Suppression de photos existantes
  - Bouton "Modifier" dans la page de détail
  - Historique des modifications automatique

- **Système de Checklist Collaborative** ✅
  - Table `checklist_items` avec politiques RLS
  - Composant `Checklist` réutilisable avec 2 modes:
    - Mode "edit" pour gestionnaires (créer/modifier/supprimer)
    - Mode "view" pour admins (cocher les tâches)
  - Barre de progression visuelle (X/Y complétés)
  - Intégration dans formulaire de création
  - Intégration dans pages de détail (manager et admin)
  - Auto-save en temps réel

### Amélioré
- Page détail manager avec checklist éditable
- Page détail admin avec checklist à cocher
- Formulaire de création avec support checklist
- Gestion avancée des photos (ajout/suppression)

### Base de données
- Nouvelle table `checklist_items`
- Politiques RLS pour checklist_items
- Trigger auto-update pour `updated_at`
- Types TypeScript mis à jour

---

## [0.2.0] - 2026-02-01

### Ajouté
- **Upload de Photos** 📸
  - Fonction utilitaire `getPhotoUrl()` pour générer les URLs publiques Supabase
  - Affichage des photos dans page détail demande (manager)
  - Affichage des photos dans page détail demande (admin)
  - Configuration complète du bucket Supabase Storage "photos"
  - Politiques RLS pour sécuriser l'upload/lecture/suppression
  - Documentation détaillée dans `PHOTOS-UPLOAD.md`
  - Script SQL de configuration (`supabase/setup-storage.sql`)

### Amélioré
- README.md avec section upload de photos et instructions Supabase
- Page admin qui affiche maintenant les photos des demandes

### Documentation
- Ajout de `PHOTOS-UPLOAD.md` - Guide complet d'utilisation
- Mise à jour du README avec instructions de configuration
- Mise à jour du TODO.md pour marquer l'upload de photos comme complété

---

## [0.1.0] - 2026-01-31

### Ajouté
- **Authentification**
  - Page de connexion avec email/mot de passe
  - Hook `useAuth` pour gérer l'état de connexion
  - Protection des routes avec middleware Next.js
  - Redirection automatique selon le rôle (manager/admin)

- **Layout Manager**
  - Sidebar avec navigation (Tableau de bord, Mes demandes, Mes immeubles, Nouvelle demande, Documents, Paramètres)
  - Header avec logo, notifications et menu utilisateur
  - Design responsive

- **Page Mes Immeubles** (`/manager/buildings`)
  - Liste des immeubles du gestionnaire
  - Affichage adresse, ville, code postal, nombre d'unités
  - Bouton "Ajouter un immeuble" dans le dropdown

- **Page Nouvelle Demande** (`/manager/requests/new`)
  - Formulaire multi-étapes (4 étapes)
  - Sélection immeuble, catégorie, type de travaux
  - Description, unités concernées, priorité
  - Infos d'accès et préférences de contact
  - Résumé avant soumission

- **Page Mes Demandes** (`/manager/requests`)
  - Liste des demandes avec filtres par statut
  - Stats cards (Total, Nouvelles, En cours, Complétées)
  - Badge de statut et priorité
  - Lien vers page détail

- **Page Détail Demande** (`/manager/requests/[id]`)
  - Affichage complet de la demande
  - Section messages avec envoi
  - Infos immeuble, préférences contact
  - Affichage photos (si disponibles)

### Corrigé
- Policies RLS Supabase causant "infinite recursion"
- Sidebar qui n'affichait pas les liens manager
- Erreurs de syntaxe (backticks échappés)

### Base de données
- Tables: users, buildings, work_requests, messages, photos, documents
- RLS activé sur toutes les tables
- Bucket Storage "photos" (public) créé
- Policies Storage pour upload/view

---

## Prochaines versions prévues

### [0.3.0] - À venir
- Dashboard avec graphiques
- Notifications temps réel

### [0.4.0] - À venir
- Interface Admin complète
- Gestion des soumissions/devis
- Intégration Trello
