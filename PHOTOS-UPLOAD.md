# 📸 Guide d'Upload de Photos - MrBrico Immo

Ce guide explique comment configurer et utiliser le système d'upload de photos pour les demandes de travaux.

## 🔧 Configuration Supabase (Prérequis)

### 1. Créer le bucket de stockage

Dans votre projet Supabase, allez dans **SQL Editor** et exécutez le fichier :
```bash
supabase/setup-storage.sql
```

Ce script va :
- ✅ Créer le bucket `photos` avec accès public
- ✅ Configurer les politiques RLS pour sécuriser l'accès
- ✅ Permettre aux gestionnaires d'uploader des photos
- ✅ Permettre à tous de voir les photos (lecture publique)
- ✅ Permettre aux admins de tout gérer

### 2. Vérifier la configuration

Après avoir exécuté le script, vérifiez dans **Storage** que :
- Le bucket `photos` existe
- Le bucket est marqué comme **Public**
- Les politiques RLS sont activées

## 📤 Fonctionnement de l'Upload

### Côté Gestionnaire

1. **Création d'une demande**
   - Accéder à `/manager/requests/new`
   - Remplir le formulaire de demande
   - Ajouter jusqu'à **5 photos** (optionnel)
   - Les photos sont prévisualisées avant l'envoi

2. **Upload automatique**
   - Lors de la soumission, les photos sont uploadées dans Supabase Storage
   - Chemin : `photos/{request_id}/{timestamp}-{filename}`
   - Les métadonnées sont enregistrées dans la table `photos`

### Côté Admin

- Les admins peuvent voir toutes les photos des demandes
- Possibilité de gérer (supprimer, modifier) les photos via les politiques RLS

## 🔍 Architecture Technique

### Structure des fichiers uploadés

```
Supabase Storage (bucket: photos)
└── photos/
    └── {request_id}/
        ├── 1706745600000-photo1.jpg
        ├── 1706745601000-photo2.jpg
        └── ...
```

### Fonction utilitaire

**`lib/utils.ts`** - `getPhotoUrl(filePath: string)`

```typescript
// Génère l'URL publique d'une photo
const photoUrl = getPhotoUrl(photo.file_path)
// Résultat: https://[project].supabase.co/storage/v1/object/public/photos/[request-id]/[filename]
```

### Table `photos`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Identifiant unique |
| `work_request_id` | uuid | Référence à la demande |
| `uploaded_by` | uuid | Utilisateur qui a uploadé |
| `file_path` | text | Chemin dans le bucket |
| `file_name` | text | Nom original du fichier |
| `file_size` | integer | Taille en bytes |
| `photo_type` | text | Type (initial, progress, final) |
| `created_at` | timestamp | Date d'upload |

## 🎨 Affichage des Photos

### Page Manager (`/manager/requests/[id]`)
```tsx
{request.photos.map((photo) => (
  <img
    src={getPhotoUrl(photo.file_path)}
    alt={photo.file_name}
    className="w-full h-full object-cover"
  />
))}
```

### Page Admin (`/admin/requests/[id]`)
- Même affichage que pour les gestionnaires
- Les admins peuvent voir toutes les photos

## 🔒 Sécurité

### Politiques RLS configurées

1. **Upload** : Seulement les utilisateurs authentifiés peuvent uploader
2. **Lecture** : Tout le monde peut lire (bucket public)
3. **Suppression** : Seulement le propriétaire ou un admin
4. **Organisation** : Photos organisées par `request_id`

### Limitations

- Maximum **5 photos** par demande
- Formats acceptés : `image/*` (jpg, png, gif, webp, etc.)
- Taille maximale : Définie par Supabase (par défaut 50 MB)

## 🐛 Dépannage

### Les photos ne s'affichent pas

1. **Vérifier le bucket**
   ```sql
   SELECT id, name, public FROM storage.buckets WHERE id = 'photos';
   ```
   - Le bucket doit exister et `public = true`

2. **Vérifier les URLs**
   - Format correct : `https://[project].supabase.co/storage/v1/object/public/photos/[path]`
   - Vérifier que `NEXT_PUBLIC_SUPABASE_URL` est bien définie

3. **Vérifier les politiques**
   ```sql
   SELECT * FROM pg_policies
   WHERE schemaname = 'storage'
   AND tablename = 'objects';
   ```

### Erreur d'upload

1. **Vérifier les permissions**
   - L'utilisateur doit être authentifié
   - La demande doit exister avant l'upload des photos

2. **Vérifier la console**
   - Ouvrir les DevTools (F12)
   - Onglet Console pour voir les erreurs

## 📝 TODO Futures Améliorations

- [ ] Compression automatique des images
- [ ] Support des vidéos courtes
- [ ] Galerie avec zoom/lightbox
- [ ] Upload multiple en drag & drop
- [ ] Annotations sur les photos
- [ ] Export PDF avec photos
- [ ] Upload de photos après création (photos de progression, photos finales)

## 💡 Notes

- Les photos sont stockées de manière permanente
- La suppression d'une demande devrait aussi supprimer les photos (à implémenter via trigger SQL)
- Les URLs sont publiques mais difficiles à deviner (UUID dans le path)
