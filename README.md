# MrBrico Immo

Portail de gestion des demandes de travaux pour les gestionnaires d'immeubles - Monsieur Bricole, Sherbrooke.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- npm ou pnpm
- Un projet Supabase (gratuit sur [supabase.com](https://supabase.com))

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec tes credentials Supabase

# 3. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans ton navigateur.

### Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans **SQL Editor** et exécuter les scripts :
   - `supabase/migrations/001_initial_schema.sql` (schéma de base)
   - `supabase/migrations/003_checklist_items.sql` (table checklist)
   - `supabase/setup-storage.sql` (configuration du stockage photos)
   - `fix-rls-policies.sql` (corrections des politiques RLS si nécessaire)
3. Copier les credentials depuis **Settings > API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Créer les utilisateurs dans **Authentication > Users**
5. Vérifier dans **Storage** que le bucket `photos` est créé et public

## 🌐 Déploiement en Production

Prêt à mettre votre application en ligne ?

### Déploiement rapide (10 minutes)

Suivez le guide : **[DEPLOIEMENT-RAPIDE.md](DEPLOIEMENT-RAPIDE.md)**

Ce guide vous accompagne étape par étape pour déployer sur Vercel (gratuit).

### Guide complet de déploiement

Pour plus d'options et de détails : **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

Couvre :
- ✅ Vercel (recommandé)
- ✅ Netlify
- ✅ VPS (DigitalOcean, AWS)
- ✅ Configuration Supabase production
- ✅ SSL/HTTPS
- ✅ Domaine personnalisé
- ✅ Monitoring et analytics
- ✅ Checklist de sécurité

## 📁 Structure du projet

```
mrbrico-immo/
├── app/                    # Routes Next.js (App Router)
│   ├── (auth)/            # Routes d'authentification
│   ├── (manager)/         # Routes gestionnaires
│   ├── (admin)/           # Routes administrateurs
│   └── api/               # API routes
├── components/            # Composants React
│   ├── ui/               # Composants shadcn/ui
│   ├── dashboard/        # Composants dashboard
│   ├── layout/           # Header, Sidebar, etc.
│   └── shared/           # Composants partagés
├── hooks/                 # Hooks React personnalisés
├── lib/                   # Librairies et utilitaires
│   ├── supabase/         # Client et types Supabase
│   └── utils/            # Fonctions utilitaires
├── types/                 # Types TypeScript
└── supabase/             # Migrations SQL
```

## 🔧 Stack technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

## 📝 Scripts disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Lancer la production
npm run lint     # Linter ESLint
```

## 🎨 Design System

Couleurs principales:
- **Orange MrBrico**: `#FF6B35`
- **Bleu MrBrico**: `#004E89`
- **Gris**: `#2C3E50`
- **Background**: `#F7F9FC`

## ✨ Fonctionnalités principales

### 📸 Upload de Photos
Le système permet l'upload de photos pour chaque demande de travaux :
- Maximum **5 photos** par demande
- Formats supportés : JPG, PNG, GIF, WebP
- Ajout de photos après création de la demande
- Suppression de photos existantes
- Stockage sécurisé dans Supabase Storage
- URLs publiques pour affichage

📖 **Documentation complète** : Voir [PHOTOS-UPLOAD.md](./PHOTOS-UPLOAD.md)

### ✏️ Édition de Demandes
Les gestionnaires peuvent modifier leurs demandes après création :
- Modification de toutes les informations (unités, type, description, etc.)
- Ajout/suppression de photos
- Gestion de la checklist
- Historique automatique des modifications
- Bouton "Modifier" dans la page de détail

### ✅ Checklist Collaborative
Système de checklist pour suivre l'avancement des travaux :
- **Gestionnaire** : Créer et modifier la liste de tâches
- **Admin** : Cocher les tâches au fur et à mesure de l'avancement
- Barre de progression visuelle (X/Y tâches complétées)
- Auto-save en temps réel
- Intégration dans création et édition de demandes

## 📞 Contact

**Monsieur Bricole**
- Email: info@mrbrico.ca
- Téléphone: (819) 555-0123
- Localisation: Sherbrooke, QC
