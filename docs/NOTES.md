# Notes Techniques - MrBrico Immo

## Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 14.2.18 | Framework React |
| React | 18 | UI Library |
| TypeScript | 5 | Type Safety |
| Tailwind CSS | 3.4 | Styling |
| Supabase | - | Backend (Auth, DB, Storage) |
| shadcn/ui | - | Composants UI |
| Lucide React | - | Icônes |

---

## Structure du projet

```
bricoImmo/
├── app/
│   ├── (auth)/
│   │   └── login/          # Page connexion
│   ├── (protected)/
│   │   ├── admin/          # Interface admin
│   │   └── manager/        # Interface gestionnaire
│   │       ├── buildings/  # Mes immeubles
│   │       ├── requests/   # Mes demandes
│   │       │   ├── new/    # Nouvelle demande
│   │       │   └── [id]/   # Détail demande
│   │       └── layout.tsx  # Layout manager
│   └── layout.tsx          # Layout racine
├── components/
│   ├── layout/             # Sidebar, Header
│   ├── shared/             # Composants partagés
│   └── ui/                 # shadcn/ui
├── hooks/
│   └── useAuth.ts          # Hook authentification
├── lib/
│   └── supabase/           # Config Supabase
└── docs/                   # Documentation
```

---

## Supabase

### Tables principales

```sql
-- Utilisateurs (extension de auth.users)
users (id, email, full_name, role, phone, company_name, ...)

-- Immeubles
buildings (id, manager_id, address, city, postal_code, unit_count, ...)

-- Demandes de travaux
work_requests (id, manager_id, building_id, request_number, status, priority, ...)

-- Messages
messages (id, work_request_id, sender_id, sender_type, message, ...)

-- Photos
photos (id, work_request_id, file_name, file_path, file_size, ...)

-- Documents
documents (id, work_request_id, building_id, file_name, file_path, ...)
```

### RLS (Row Level Security)

Toutes les tables ont RLS activé. Points importants:

1. **Éviter la récursion infinie**: Ne jamais faire de subquery sur la même table dans une policy
2. **Gestionnaires**: Peuvent voir/modifier leurs propres données
3. **Admins**: Accès complet (mais policy doit utiliser `auth.jwt()` pas subquery sur users)

### Storage Buckets

- `photos` - PUBLIC - Pour les photos des demandes
- `documents` - PRIVATE - Pour les documents confidentiels

---

## Authentification

### Flow de connexion

1. User entre email/password sur `/login`
2. `supabase.auth.signInWithPassword()`
3. Si succès, récupère le profil user depuis table `users`
4. Redirige vers `/manager/dashboard` ou `/admin/dashboard` selon le rôle

### Hook useAuth

```typescript
const { user, isManager, isAdmin, isLoading, signOut } = useAuth()
```

- `user`: Profil complet de l'utilisateur
- `isManager`: true si role === 'manager'
- `isAdmin`: true si role === 'admin'

---

## Couleurs MrBrico

```css
--mrbrico-orange: #FF6B35
--mrbrico-gray: #2D3748
--mrbrico-light: #F7FAFC
```

Définies dans `tailwind.config.ts`:
```js
colors: {
  mrbrico: {
    orange: '#FF6B35',
    gray: '#2D3748',
    light: '#F7FAFC'
  }
}
```

---

## Statuts des demandes

| Statut | Label FR | Couleur |
|--------|----------|---------|
| nouveau | Nouveau | Bleu |
| en_evaluation | En évaluation | Jaune |
| soumission_envoyee | Soumission envoyée | Violet |
| approuve | Approuvé | Vert |
| en_cours | En cours | Orange |
| complete | Complété | Vert |
| facture | Facturé | Gris |

---

## Commandes utiles

```bash
# Développement
npm run dev

# Build
npm run build

# Linting
npm run lint

# Types Supabase (si configuré)
npx supabase gen types typescript --project-id xjrxjfqhnlvherzhvgcv > lib/supabase/database.types.ts
```

---

## Problèmes résolus

### 1. RLS Infinite Recursion (2026-01-31)

**Problème**: La policy "Admins can read all users" causait une récursion infinie car elle faisait une subquery sur la table users elle-même.

**Solution**: Supprimer cette policy. Utiliser `auth.uid() = id` pour que chaque user ne puisse lire que son propre profil.

```sql
DROP POLICY "Admins can read all users" ON users;
-- Garder seulement:
-- "Users can read own profile" avec USING (auth.uid() = id)
```

### 2. Backticks échappés dans le code

**Problème**: Les template literals étaient créés avec des backticks échappés (`\``) au lieu de backticks normaux.

**Solution**: Remplacer manuellement tous les `\`` par des backticks normaux.
