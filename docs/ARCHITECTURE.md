# Architecture - MrBrico Immo

## Vue d'ensemble

MrBrico Immo est un portail web permettant aux gestionnaires immobiliers de soumettre des demandes de travaux à l'entreprise MrBrico.

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    (Next.js 14 App)                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Manager    │  │    Admin     │  │    Auth      │      │
│  │   Portal     │  │   Portal     │  │   Pages      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                     SUPABASE BACKEND                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │   Database   │  │   Storage    │      │
│  │   (Users)    │  │  (Postgres)  │  │   (Files)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Flux utilisateur

### Gestionnaire (Manager)

```
Login → Dashboard → Mes immeubles → Nouvelle demande → Suivi demandes
                  ↓
            Documents
                  ↓
            Paramètres
```

### Admin

```
Login → Dashboard → Toutes les demandes → Détail → Assigner/Devis
                  ↓
            Gestionnaires
                  ↓
            Rapports
```

---

## Base de données

### Schéma relationnel

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │  buildings  │       │work_requests│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │──┐    │ id (PK)     │
│ email       │  │    │ manager_id  │←─┼────│ manager_id  │
│ role        │  │    │ address     │  │    │ building_id │←┐
│ full_name   │  └───→│ city        │  └───→│ status      │ │
│ ...         │       │ ...         │       │ priority    │ │
└─────────────┘       └─────────────┘       │ ...         │ │
                                            └─────────────┘ │
                                                   │        │
                      ┌─────────────┐               │        │
                      │  messages   │               │        │
                      ├─────────────┤               │        │
                      │ id (PK)     │               │        │
                      │ request_id  │←──────────────┘        │
                      │ sender_id   │                        │
                      │ message     │                        │
                      └─────────────┘                        │
                                                             │
                      ┌─────────────┐                        │
                      │   photos    │                        │
                      ├─────────────┤                        │
                      │ id (PK)     │                        │
                      │ request_id  │←───────────────────────┘
                      │ file_path   │
                      └─────────────┘
```

---

## Sécurité

### Row Level Security (RLS)

Chaque table a des policies RLS:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| users | Own profile | - | Own profile | - |
| buildings | Own buildings | Own | Own | Own |
| work_requests | Own requests | Own | Own | - |
| messages | Related requests | Own | - | - |
| photos | Related requests | Own | - | Own |

### Rôles

- **manager**: Gestionnaire immobilier (client)
- **admin**: Employé MrBrico

---

## Composants clés

### Layout

```
┌────────────────────────────────────────────────────────┐
│ Header (Logo, Notifications, User Menu)                │
├────────────┬───────────────────────────────────────────┤
│            │                                           │
│  Sidebar   │              Main Content                 │
│            │                                           │
│ - Dashboard│                                           │
│ - Demandes │                                           │
│ - Immeubles│                                           │
│ - Documents│                                           │
│            │                                           │
├────────────┴───────────────────────────────────────────┤
│ (Mobile: Sidebar devient menu hamburger)               │
└────────────────────────────────────────────────────────┘
```

### Formulaire nouvelle demande

```
Étape 1: Sélection immeuble
    ↓
Étape 2: Type de travaux (catégorie + type)
    ↓
Étape 3: Détails (description, unités, priorité, accès)
    ↓
Étape 4: Confirmation (résumé + préférences contact)
    ↓
Soumission → Création work_request + Redirection
```

---

## Intégrations futures

### Trello

```
work_request.created → Create Trello Card
work_request.updated → Update Trello Card
Trello webhook → Update work_request.status
```

### Email (SendGrid/Resend)

```
Nouveau statut → Email au manager
Nouveau message → Email notification
```

### SMS (Twilio)

```
Urgent request → SMS à l'admin
Statut "en_cours" → SMS au manager
```

---

## Environnements

| Env | URL | Supabase |
|-----|-----|----------|
| Dev | localhost:3000 | xjrxjfqhnlvherzhvgcv |
| Prod | mrbrico-immo.com | (à configurer) |

---

## Performance

### Optimisations prévues

- [ ] Image optimization avec Next.js Image
- [ ] Lazy loading des composants
- [ ] Pagination côté serveur
- [ ] Cache des requêtes Supabase
- [ ] Service Worker pour PWA
