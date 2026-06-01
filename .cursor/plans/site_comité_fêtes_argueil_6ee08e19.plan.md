---
name: Site Comité Fêtes Argueil
overview: Créer un site React complet pour le Comité des Fêtes d'Argueil avec 5 pages publiques, un espace admin protégé par Auth0, une base de données Supabase et un stockage de photos Supabase Storage.
todos:
  - id: init-projet
    content: Initialiser le projet Vite + React + Tailwind CSS + installer toutes les dépendances (react-router-dom, @supabase/supabase-js, @auth0/auth0-react)
    status: completed
  - id: supabase-setup
    content: Créer les 5 tables Supabase via MCP (execute_sql) + créer les 2 buckets Storage (gallery, events-posters) + configurer les policies RLS
    status: completed
  - id: composants-partages
    content: "Créer les composants partagés : Hero, Navbar, Footer, EventCard, AdminRoute + configurer React Router"
    status: completed
  - id: page-accueil
    content: "Construire la page Accueil : Hero + présentation + 4 cartes cliquables avec images fournies + bouton admin discret"
    status: completed
  - id: pages-publiques
    content: "Construire les 4 autres pages publiques : Événements (liste + formulaire), Suggestions (formulaire), Galerie (groupée par événement), Contact (formulaire)"
    status: completed
  - id: auth0-integration
    content: "Intégrer Auth0 : AuthProvider dans main.jsx, garde de route AdminRoute, redirection /admin"
    status: completed
  - id: admin-dashboard
    content: "Construire le dashboard admin et les 4 sous-pages : Utilisateurs, Galerie (upload multi-photos), Événements, Messages (2 sections séparées avec suppression)"
    status: completed
  - id: env-fichier
    content: Créer le fichier .env avec les variables d'environnement + .gitignore
    status: completed
  - id: responsive-final
    content: Vérifier et ajuster la responsivité sur mobile/tablette + corrections finales
    status: completed
isProject: false
---

# Site Comité des Fêtes d'Argueil

## Stack technique
- React + Vite + React Router v6
- Tailwind CSS (palette Vert & Beige)
- Supabase (PostgreSQL + Storage)
- Auth0 (`@auth0/auth0-react`)
- Déploiement : Vercel

## Architecture des pages

```mermaid
flowchart TD
    A[Visiteur] --> B[/ Accueil]
    A --> C[/evenements]
    A --> D[/suggestions]
    A --> E[/galerie]
    A --> F[/contact]
    B -->|bouton discret| G[Auth0 Login]
    G --> H[/admin]
    H --> I[/admin/utilisateurs]
    H --> J[/admin/galerie]
    H --> K[/admin/evenements]
    H --> L[/admin/messages]
```

## Structure des fichiers

```
src/
  components/
    Hero.jsx           -- section hero (photo aérienne + titre)
    Navbar.jsx         -- navigation entre les pages
    Footer.jsx         -- pied de page simple
    EventCard.jsx      -- carte événement (affiche, nom, date, lieu)
    AdminRoute.jsx     -- garde de route Auth0
  pages/
    public/
      Home.jsx         -- accueil : présentation + 4 cartes menu
      Events.jsx       -- événements à venir + formulaire demande
      Suggestions.jsx  -- formulaire suggestion
      Gallery.jsx      -- photos groupées par événement
      Contact.jsx      -- formulaire contact
    admin/
      AdminDashboard.jsx   -- menu admin principal
      AdminUsers.jsx       -- gestion comptes
      AdminGallery.jsx     -- upload multi-photos
      AdminEvents.jsx      -- gestion événements
      AdminMessages.jsx    -- messages contact + suggestions
  lib/
    supabase.js        -- client Supabase
  App.jsx
  main.jsx
.env                   -- clés Auth0 + Supabase (non commité)
```

## Base de données Supabase (5 tables)

- `events` — id, nom, date, lieu, affiche_url, created_at
- `gallery_photos` — id, url, nom_evenement, created_at
- `event_requests` — id, nom, prenom, email, telephone, nom_evenement, description, date_souhaitee, lieu_souhaite, created_at
- `suggestions` — id, nom, prenom, email, telephone, suggestion, lu, created_at
- `contacts` — id, nom, prenom, email, telephone, sujet, message, lu, created_at

Buckets Storage :
- `gallery` — photos de la galerie
- `events-posters` — affiches des événements

## Pages publiques

**Accueil (`/`)**
- Hero : photo aérienne d'Argueil + titre "Comité des Fêtes d'Argueil"
- Texte de présentation généré (paragraphe cohérent sur le comité)
- 4 cartes cliquables avec image de fond : Événements / Suggestions / Galerie / Contact
- Bouton "Administrateur" très discret (petit texte gris) en haut à gauche

**Événements (`/evenements`)**
- Hero
- Grille de cartes des événements à venir (filtrés automatiquement : date >= aujourd'hui)
- Formulaire de demande : Nom, Prénom, Email, Téléphone, Nom de l'événement, Description, Date souhaitée, Lieu souhaité

**Suggestions (`/suggestions`)**
- Hero
- Formulaire : Nom, Prénom, Email, Téléphone, Suggestion

**Galerie (`/galerie`)**
- Hero
- Photos groupées par nom d'événement (sections avec titre)
- Vide au démarrage

**Contact (`/contact`)**
- Hero
- Formulaire : Nom, Prénom, Email, Téléphone, Sujet, Message

## Espace Admin (protégé Auth0)

**Dashboard (`/admin`)**
- Menu avec 4 sections : Utilisateurs, Galerie, Événements, Messages

**Utilisateurs (`/admin/utilisateurs`)**
- Liste des comptes Auth0
- Création de nouveaux comptes admin

**Galerie (`/admin/galerie`)**
- Upload multi-photos en un clic (drag & drop ou sélection multiple)
- Champ "Nom de l'événement" commun à l'upload
- Aperçu des photos avant envoi
- Liste des photos existantes avec suppression

**Événements (`/admin/evenements`)**
- Formulaire ajout : Nom, Date, Lieu, Affiche (upload image)
- Liste des événements avec suppression

**Messages (`/admin/messages`)**
- Deux sections bien séparées : "Demandes d'événement + Suggestions" / "Messages de contact"
- Indicateur lu/non-lu
- Bouton de suppression pour chaque message

## Palette de couleurs
- Vert foncé : `#2D5016` (titres, header)
- Vert moyen : `#4A7C2F` (boutons, accents)
- Beige clair : `#F5F0E8` (fond général)
- Beige foncé : `#D4C4A0` (séparateurs, cartes)
- Blanc : fond des formulaires

## Variables d'environnement (`.env`)
```
VITE_SUPABASE_URL=https://kfnhmcyoxiirohpduyrs.supabase.co
VITE_SUPABASE_ANON_KEY=...  (récupéré via MCP)
VITE_AUTH0_DOMAIN=dev-vnz8e7fkhtcukbvc.eu.auth0.com
VITE_AUTH0_CLIENT_ID=hQFxGAKGEcni0BqDeY7CLjlzEHch1Nga
```

## Ordre de construction
1. Init projet Vite + Tailwind + dépendances
2. Création tables Supabase via MCP + buckets Storage
3. Composants partagés (Hero, Navbar, Footer)
4. Pages publiques (Accueil → Événements → Suggestions → Galerie → Contact)
5. Intégration Auth0 + garde de route admin
6. Pages admin (Dashboard → Galerie → Événements → Messages → Utilisateurs)
7. Tests responsivité + ajustements finaux
