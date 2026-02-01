# TODO - MrBrico Immo

## En cours

_Aucune tâche en cours actuellement_

---

## ✅ Complété Récemment

### Gestion Complète des Gestionnaires - CRUD (Admin) (2026-02-01)
- [x] Page `/admin/managers` avec cartes cliquables
- [x] Page détail `/admin/managers/[id]` avec infos complètes
- [x] Liste des immeubles du gestionnaire
- [x] Liste des demandes récentes du gestionnaire
- [x] Statistiques (immeubles, demandes, actif depuis)
- [x] Page création `/admin/managers/new` avec formulaire
- [x] Page édition `/admin/managers/[id]/edit` complète
- [x] API route POST `/api/admin/managers` - Création
- [x] API route PUT `/api/admin/managers` - Modification
- [x] Utilisation de `createServiceClient()` pour bypass RLS
- [x] Création via `auth.admin.createUser()` Supabase
- [x] Bouton "Nouveau gestionnaire" dans liste
- [x] Bouton "Modifier" sur chaque carte
- [x] Navigation fluide entre liste, détail et édition
- [x] Tests complets avec Chrome
- [x] Débogage et vérification base de données
- [x] Documentation complète dans CHANGELOG.md

### Interface Admin Améliorée (2026-02-01)
- [x] Ajouter filtre par gestionnaire dans `/admin/requests`
- [x] Créer composant `AdminRequestCard` avec actions rapides
- [x] Implémenter menu dropdown avec actions contextuelles
- [x] Changement de statut rapide (nouveau → en_evaluation, refuser, etc.)
- [x] Bouton réinitialiser tous les filtres
- [x] Auto-refresh après changement de statut
- [x] Historique automatique des changements
- [x] Documentation dans CHANGELOG.md

### Édition de Demande + Checklist Collaborative (2026-02-01)
- [x] Créer table `checklist_items` avec politiques RLS
- [x] Créer composant `Checklist` réutilisable (modes edit/view)
- [x] Page d'édition `/manager/requests/[id]/edit`
- [x] Modification complète des informations
- [x] Ajout/suppression de photos après création
- [x] Gestion checklist côté gestionnaire (créer/modifier/supprimer)
- [x] Gestion checklist côté admin (cocher les tâches)
- [x] Barre de progression des tâches
- [x] Intégration dans formulaire de création
- [x] Intégration dans pages de détail
- [x] Auto-save en temps réel
- [x] Bouton "Modifier" dans page détail
- [x] Types TypeScript mis à jour

### Upload Photos (2026-01-31)
- [x] Créer fonction utilitaire `getPhotoUrl()` pour générer les URLs publiques
- [x] Intégrer dans formulaire nouvelle demande (preview + upload)
- [x] Sauvegarder dans Supabase Storage bucket "photos"
- [x] Afficher dans page détail demande (manager)
- [x] Afficher dans page détail demande (admin)
- [x] Configuration bucket Supabase avec politiques RLS
- [x] Documentation complète (PHOTOS-UPLOAD.md)

---

## À faire - Priorité Haute

### Dashboard Manager
- [ ] Widget: Demandes récentes
- [ ] Widget: Demandes par statut (graphique)
- [ ] Widget: Statistiques mensuelles
- [ ] Widget: Immeubles avec demandes en cours

### Interface Admin
- [x] Page `/admin/requests` - Toutes les demandes
- [x] Filtres par gestionnaire, statut, priorité
- [x] Changer le statut d'une demande (actions rapides)
- [x] Page `/admin/managers` - Liste des gestionnaires
- [x] Page `/admin/managers/[id]` - Détail gestionnaire
- [x] Page `/admin/managers/new` - Créer gestionnaire
- [x] Page `/admin/managers/[id]/edit` - Modifier gestionnaire
- [x] API route pour création gestionnaire (auth.admin)
- [x] API route pour modification gestionnaire
- [ ] Assigner un entrepreneur
- [ ] Ajouter une soumission/devis

### Notifications
- [ ] Système de notifications en temps réel
- [ ] Badge sur l'icône cloche
- [ ] Page liste des notifications
- [ ] Marquer comme lu

---

## À faire - Priorité Moyenne

### Gestion des immeubles
- [ ] Page ajout immeuble (`/manager/buildings/new`)
- [ ] Page modification immeuble (`/manager/buildings/[id]/edit`)
- [ ] Suppression immeuble (soft delete)
- [ ] Liste des unités par immeuble

### Documents
- [ ] Page `/manager/documents`
- [ ] Upload de documents (PDF, Word)
- [ ] Catégorisation (factures, contrats, etc.)
- [ ] Lier documents aux demandes

### Paramètres
- [ ] Page `/manager/settings`
- [ ] Modifier profil (nom, email, téléphone)
- [ ] Changer mot de passe
- [ ] Préférences de notification

---

## À faire - Priorité Basse

### Améliorations UX
- [ ] Mode sombre
- [ ] Pagination sur les listes
- [ ] Recherche globale
- [ ] Export CSV des demandes

### Intégrations
- [ ] Trello API - Sync automatique
- [ ] Envoi email de confirmation
- [ ] SMS notifications (Twilio)

### Mobile
- [ ] PWA (Progressive Web App)
- [ ] Optimisation mobile
- [ ] Push notifications

---

## Bugs connus

- Aucun bug majeur actuellement

---

## Idées futures

- [ ] Chat en temps réel entre manager et admin
- [ ] Calendrier des interventions
- [ ] Suivi GPS des entrepreneurs
- [ ] Système de facturation intégré
- [ ] Rapports PDF automatiques
- [ ] Multi-langue (FR/EN)
