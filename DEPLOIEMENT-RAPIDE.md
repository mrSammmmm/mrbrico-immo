# 🚀 Déploiement Rapide - MrBrico Immo

## En 10 minutes sur Vercel (Gratuit)

### 1️⃣ Préparer le code

```bash
# Assurez-vous que tout fonctionne localement
npm run build

# Commitez tout
git add .
git commit -m "Ready for production"
git push origin main
```

### 2️⃣ Créer un projet Supabase de PRODUCTION

1. Allez sur [supabase.com](https://supabase.com)
2. **New Project** → Nom : `mrbrico-immo-prod`
3. **Région** : Canada Central (ou proche de vos utilisateurs)
4. Attendez ~2 minutes que le projet soit créé

### 3️⃣ Copier le schéma de la base de données

Dans votre projet Supabase de production :
1. Allez dans **SQL Editor**
2. Copiez tout le contenu de votre fichier `supabase/schema.sql` local
3. Cliquez sur **Run** pour créer les tables

### 4️⃣ Configurer le Storage

1. Allez dans **Storage**
2. Créez un bucket : `photos`
3. Rendez-le **public**
4. Copiez les politiques depuis votre projet local (ou depuis `docs/PHOTOS-UPLOAD.md`)

### 5️⃣ Récupérer les clés Supabase

Dans votre projet Supabase de production, allez dans **Settings** → **API** :

```
URL du projet: https://xxxxxxxxxxx.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

**⚠️ GARDEZ LA `service_role key` SECRÈTE !**

### 6️⃣ Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. **Sign up** avec GitHub
3. **Add New Project**
4. Sélectionnez votre repo `bricoImmo`
5. **Avant de cliquer Deploy**, ajoutez ces variables d'environnement :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

6. Cliquez sur **Deploy**
7. Attendez 2-3 minutes ⏳

### 7️⃣ Configurer Supabase Auth

1. Dans Supabase → **Authentication** → **URL Configuration**
2. **Site URL** : Copiez l'URL Vercel (ex: `https://mrbrico-immo.vercel.app`)
3. **Redirect URLs** : Ajoutez :
   - `https://mrbrico-immo.vercel.app/auth/callback`
   - `https://mrbrico-immo.vercel.app/*`

### 8️⃣ Créer le premier utilisateur admin

Dans Supabase → **SQL Editor**, exécutez :

```sql
-- Créer l'utilisateur admin
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@mrbrico.ca',
  crypt('VotreMotDePasseSecurise123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin MrBrico"}',
  now(),
  now()
);

-- Créer le profil dans la table users
INSERT INTO public.users (id, email, full_name, role)
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name',
  'admin'
FROM auth.users
WHERE email = 'admin@mrbrico.ca';
```

### 9️⃣ Tester votre application

1. Ouvrez l'URL Vercel : `https://votre-app.vercel.app`
2. Connectez-vous avec `admin@mrbrico.ca`
3. Testez la création d'un gestionnaire
4. Testez l'upload de photos

### 🎉 C'est fait ! Votre app est en ligne !

---

## 🔄 Mises à jour futures

Chaque fois que vous faites un `git push`, Vercel redéploie automatiquement :

```bash
# Faire des modifications
git add .
git commit -m "Fix: correction bug"
git push origin main
# → Vercel déploie automatiquement en ~2min
```

---

## 🆘 Problèmes courants

### "Site can't be reached"
→ Attendez 2-3 minutes, Vercel est en train de builder

### "Supabase connection error"
→ Vérifiez que les variables d'environnement sont correctes dans Vercel

### "RLS policy violation"
→ Vérifiez que vous avez bien copié TOUTES les politiques RLS

### "Photos ne s'uploadent pas"
→ Vérifiez que le bucket `photos` est public et que les politiques Storage sont configurées

---

## 📚 Documentation complète

Pour plus de détails, voir [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 💡 Prochaines étapes

- [ ] Configurer un domaine personnalisé (ex: `mrbrico-immo.com`)
- [ ] Activer Vercel Analytics
- [ ] Configurer les backups Supabase
- [ ] Créer une politique de sauvegarde
- [ ] Documenter les procédures pour votre équipe

**Besoin d'aide ?** Consultez [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) pour le guide complet !
