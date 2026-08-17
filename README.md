# InkWave 📖 — Lisez. Écrivez. Partagez.

Une plateforme de lecture/écriture collaborative façon Wattpad : backend Node.js,
site web React, et application mobile React Native (Expo) — tous connectés à la même API.

## Architecture

```
inkwave/
├── backend/   → API REST Node.js + Express + TypeScript + Prisma (SQLite)
├── web/       → Site web React + Vite + TypeScript + Tailwind CSS
└── mobile/    → App mobile React Native + Expo, navigation par onglets
```

## 1. Backend — API

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init   # crée la base SQLite (dev.db)
npm run seed                          # (optionnel) données de démo
npm run dev                           # démarre sur http://localhost:4000
```

Comptes de démo créés par `npm run seed` :
- `alice_writes` / `password123`
- `bob_stories` / `password123`

Endpoints principaux : `/api/auth`, `/api/users`, `/api/stories`, `/api/chapters`,
`/api/comments`, `/api/library`, `/api/search`.

Pour passer en production avec PostgreSQL : changez `provider = "sqlite"` en
`provider = "postgresql"` dans `backend/prisma/schema.prisma`, et pointez
`DATABASE_URL` vers votre base Postgres.

## 2. Web

```bash
cd web
npm install
cp .env.example .env   # VITE_API_URL doit pointer vers votre backend
npm run dev             # démarre sur http://localhost:5173
```

Le backend doit tourner en parallèle (voir étape 1).

## 3. Mobile (React Native / Expo)

```bash
cd mobile
npm install
npx expo start
```

Scannez le QR code avec l'app **Expo Go** (iOS/Android), ou lancez un simulateur
(`npm run ios` / `npm run android`). Pensez à modifier `API_BASE_URL` dans
`mobile/src/api/client.ts` pour qu'elle pointe vers l'IP locale de votre machine
(pas `localhost`, qui ne fonctionne pas depuis un téléphone physique) — ex :
`http://192.168.1.XX:4000/api`.

L'app comporte 4 onglets : **Accueil** (dernières histoires), **Découvrir** (recherche +
filtre par genre), **Bibliothèque** (histoires sauvegardées + mes histoires en écriture),
et **Profil** (connexion, infos du compte, déconnexion). L'écriture (créer une histoire,
ajouter/éditer des chapitres, publier) est accessible depuis l'onglet Bibliothèque.

## Fonctionnalités

- Inscription / connexion (JWT)
- Créer, éditer, publier des histoires en chapitres
- Lire des histoires publiées par la communauté
- Aimer une histoire, l'ajouter à sa bibliothèque personnelle
- Commenter une histoire ou un chapitre
- Suivre des auteurs, consulter leur profil public
- Rechercher des histoires et des auteurs
- Filtrer par genre, trier par popularité / récence

## Stack technique

| Couche | Techno |
|---|---|
| Backend | Node.js, Express, TypeScript, Prisma, SQLite (→ Postgres en prod), JWT, Zod |
| Web | React 18, Vite, TypeScript, React Router, Tailwind CSS, Axios |
| Mobile | React Native, Expo, React Navigation, Axios |

## Prochaines pistes d'amélioration

- Upload réel d'images (couvertures, avatars) via un service de stockage (S3, Cloudinary)
- Notifications (nouveau chapitre d'un auteur suivi, nouveau commentaire)
- Modération de contenu
- Pagination infinie sur les listes d'histoires
- Mode sombre
