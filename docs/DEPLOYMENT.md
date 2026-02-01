# Guide de Déploiement - MrBrico Immo

## 📋 Prérequis

Avant de déployer, assurez-vous d'avoir :
- ✅ Un compte GitHub avec le code de votre projet
- ✅ Un projet Supabase en production (pas en mode pause)
- ✅ Toutes les variables d'environnement configurées
- ✅ Le build local fonctionne sans erreur (`npm run build`)

---

## 🚀 Option 1 : Vercel (Recommandé)

**Pourquoi Vercel ?**
- Créé par l'équipe Next.js
- Déploiement automatique à chaque push Git
- SSL gratuit (HTTPS)
- CDN global intégré
- Gratuit pour les petits projets

### Étapes de déploiement

#### 1. Préparer le projet

Assurez-vous que votre code est sur GitHub :
```bash
git add .
git commit -m "Prêt pour déploiement production"
git push origin main
```

#### 2. Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "Sign Up"
3. Connectez-vous avec votre compte GitHub

#### 3. Importer le projet

1. Cliquez sur "Add New Project"
2. Sélectionnez votre repository GitHub `bricoImmo`
3. Vercel détectera automatiquement que c'est un projet Next.js

#### 4. Configurer les variables d'environnement

Dans les paramètres du projet Vercel, ajoutez ces variables :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next.js
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
```

**⚠️ IMPORTANT** :
- N'utilisez JAMAIS les clés de votre projet Supabase local/dev en production
- Utilisez les clés de votre projet Supabase en production

#### 5. Configurer le build

Vercel utilisera automatiquement :
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

Ces paramètres sont déjà corrects par défaut.

#### 6. Déployer

1. Cliquez sur "Deploy"
2. Attendez 2-3 minutes
3. Votre site sera disponible sur `https://votre-app.vercel.app`

#### 7. Configurer un domaine personnalisé (optionnel)

1. Dans les settings Vercel, allez dans "Domains"
2. Ajoutez votre domaine (ex: `mrbrico-immo.com`)
3. Suivez les instructions pour configurer les DNS

---

## 🌐 Option 2 : Netlify

**Pourquoi Netlify ?**
- Interface simple et intuitive
- Déploiement automatique
- Gratuit pour les petits projets

### Étapes de déploiement

1. Allez sur [netlify.com](https://netlify.com)
2. Connectez-vous avec GitHub
3. "Add new site" → "Import an existing project"
4. Sélectionnez votre repository
5. Build settings :
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Ajoutez les variables d'environnement (mêmes que Vercel)
7. Cliquez sur "Deploy site"

---

## 🖥️ Option 3 : VPS (DigitalOcean, AWS, etc.)

**Pour qui ?**
- Si vous voulez un contrôle total
- Si vous avez besoin de services custom
- Si vous avez de l'expérience en administration serveur

### Prérequis serveur

- Ubuntu 22.04 ou supérieur
- Node.js 18+ installé
- Nginx configuré
- PM2 pour gérer le processus

### Étapes de déploiement

#### 1. Préparer le serveur

```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2
sudo npm install -g pm2

# Installer Nginx
sudo apt install nginx
```

#### 2. Cloner le projet

```bash
cd /var/www
sudo git clone https://github.com/votre-username/bricoImmo.git
cd bricoImmo
sudo npm install
```

#### 3. Configurer les variables d'environnement

```bash
sudo nano .env.local
```

Ajoutez vos variables d'environnement (mêmes que Vercel).

#### 4. Builder le projet

```bash
sudo npm run build
```

#### 5. Démarrer avec PM2

```bash
sudo pm2 start npm --name "mrbrico-immo" -- start
sudo pm2 startup
sudo pm2 save
```

#### 6. Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/mrbrico-immo
```

Ajoutez cette configuration :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activez le site :

```bash
sudo ln -s /etc/nginx/sites-available/mrbrico-immo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Installer SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

---

## 📊 Configuration Supabase pour Production

### 1. Créer un projet Supabase de production

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet pour la production
3. **IMPORTANT** : Choisissez une région proche de vos utilisateurs (ex: Canada Central)

### 2. Migrer le schéma de base de données

Si vous avez un projet de dev, exportez le schéma :

```bash
# Depuis votre projet local
npx supabase db dump --schema public > schema.sql
```

Puis importez-le dans votre projet de production via l'interface Supabase (SQL Editor).

### 3. Configurer les politiques RLS

Assurez-vous que toutes vos politiques RLS sont actives en production :

```sql
-- Vérifier que RLS est activé sur toutes les tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### 4. Configurer le Storage

Dans Supabase → Storage → Policies, assurez-vous que :
- Le bucket `photos` existe
- Les politiques d'upload/lecture sont configurées

### 5. Configurer l'authentification

Dans Supabase → Authentication → Settings :
- **Site URL** : `https://votre-app.vercel.app`
- **Redirect URLs** : Ajoutez toutes les URLs de redirection autorisées

---

## 🔐 Checklist de Sécurité

Avant de lancer en production :

- [ ] ✅ Les clés Supabase de production sont utilisées (pas celles de dev)
- [ ] ✅ La `SUPABASE_SERVICE_ROLE_KEY` n'est JAMAIS exposée côté client
- [ ] ✅ RLS est activé sur toutes les tables sensibles
- [ ] ✅ Les politiques RLS sont testées
- [ ] ✅ HTTPS est activé (SSL)
- [ ] ✅ Les CORS sont configurés correctement dans Supabase
- [ ] ✅ Les variables d'environnement sensibles ne sont pas dans Git
- [ ] ✅ Le fichier `.env.local` est dans `.gitignore`

---

## 🧪 Tester le Déploiement

Après le déploiement, testez :

1. **Authentification** : Connexion/déconnexion fonctionne
2. **Upload de photos** : Les photos s'uploadent correctement
3. **Création de données** : Les formulaires fonctionnent
4. **Permissions** : Les rôles admin/manager sont respectés
5. **Performance** : Le site charge rapidement
6. **Mobile** : Le site fonctionne sur mobile

---

## 🔄 Déploiements continus (CI/CD)

Avec Vercel ou Netlify, chaque `git push` sur la branche `main` déclenchera automatiquement :
1. Un nouveau build
2. Des tests (si configurés)
3. Un déploiement automatique

### Workflow Git recommandé

```bash
# Branche de développement
git checkout -b feature/nouvelle-fonctionnalite
# ... faire vos modifications ...
git add .
git commit -m "Ajout: nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# Créer une Pull Request sur GitHub
# Après review et merge dans main → Déploiement automatique
```

---

## 📱 Monitoring et Analytics

### Vercel Analytics (recommandé)

1. Dans Vercel, allez dans "Analytics"
2. Activez "Web Analytics" (gratuit)
3. Vous aurez des stats sur :
   - Nombre de visiteurs
   - Pages les plus visitées
   - Performance du site

### Sentry pour les erreurs (optionnel)

Pour tracker les erreurs en production :

```bash
npm install @sentry/nextjs
```

Configuration dans `sentry.config.js`.

---

## 💰 Coûts estimés

### Option Vercel (Gratuite au début)
- **Hobby Plan** : Gratuit
  - 100 GB bandwidth/mois
  - Déploiements illimités
  - SSL gratuit
- **Pro Plan** : 20$/mois
  - 1 TB bandwidth/mois
  - Analytics avancés
  - Support prioritaire

### Option VPS
- **DigitalOcean Droplet** : 6-12$/mois
- **AWS EC2** : ~10-20$/mois
- **Domaine** : ~15$/an

### Supabase
- **Free Plan** : Gratuit
  - 500 MB database
  - 1 GB file storage
  - 50k monthly active users
- **Pro Plan** : 25$/mois
  - 8 GB database
  - 100 GB file storage
  - 100k monthly active users

**Total estimé pour démarrer** : 0-25$/mois (Vercel gratuit + Supabase gratuit)

---

## 🆘 Dépannage

### Erreur : "Module not found"

```bash
# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erreur : "Supabase connection failed"

Vérifiez que :
1. Les variables d'environnement sont correctes
2. Les URLs Supabase n'ont pas d'espaces ou caractères spéciaux
3. Le projet Supabase n'est pas en pause

### Erreur : "RLS policy violation"

Vérifiez que :
1. Vous utilisez `createServiceClient()` pour les opérations admin
2. Les politiques RLS sont correctement configurées
3. L'utilisateur a les bonnes permissions

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Documentation Vercel** : [vercel.com/docs](https://vercel.com/docs)
2. **Documentation Supabase** : [supabase.com/docs](https://supabase.com/docs)
3. **Discord Next.js** : [nextjs.org/discord](https://nextjs.org/discord)
4. **Discord Supabase** : [discord.supabase.com](https://discord.supabase.com)

---

## ✅ Checklist finale avant production

- [ ] Code testé localement (`npm run build` sans erreur)
- [ ] Variables d'environnement configurées sur Vercel/Netlify
- [ ] Projet Supabase de production créé et configuré
- [ ] Politiques RLS vérifiées et testées
- [ ] SSL/HTTPS activé
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Analytics configuré (optionnel)
- [ ] Monitoring d'erreurs configuré (optionnel)
- [ ] Tests de bout en bout effectués
- [ ] Documentation utilisateur créée (optionnel)

---

**Bonne chance avec votre déploiement ! 🚀**
