# Portfolio IW – Airtable

Projet full‑stack (frontend React + backend Node/Express) connecté à une base Airtable pour lister des projets, gérer l’authentification simple (JWT) et les likes.

## Installation et Lancement

1. Clner et installer

- `git clone <repo>` puis `cd portfolio-iw-airtable`
- Backend: `cd backend && npm install`
- Frontend: dans un autre terminal, `cd frontend && npm install`

2. Configuration des variables d’environnement

- Backend: créer le fichier `backend/.env` (voir exemple ci‑dessous)

3. Démarrer en local

- Terminal 1: `cd backend && npm run dev`
- Terminal 2: `cd frontend && npm start`
- Frontend: http://localhost:3000
- Backend: http://localhost:5002 (configurable via `PORT`)

4. Compte de test

- Email: `user1@test.com`
- Mot de passe : `user1@test.com`

## Accès en lecture à la base Airtable

https://airtable.com/appwMQLlgOQhCnfeu/shr8r4KQ5kDYocsfF

## Variables d’environnement – Exemples

Fichier `backend/.env`:

```
# Server
PORT=5002
NODE_ENV=development

# JWT
JWT_SECRET=

# Airtable
AIRTABLE_KEY=                       # PAT Airtable
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX  # ID de la base
AIRTABLE_USER_TABLE_ID=tblXXXXXXXXX # ID table Users
AIRTABLE_PROJECT_TABLE_ID=tblXXXXXX # ID table Projects
AIRTABLE_LIKE_TABLE_ID=tblXXXXXXXX  # ID table Likes
```

## Lancement rapide (résumé)

- `cd backend && npm install && npm run dev`
- `cd frontend && npm install && npm start`
- Ouvrir http://localhost:3000

## Technos utilisées

- Backend: Node.js, Express, JSON Web Token (JWT), bcryptjs, Airtable SDK
- Frontend: React (Create React App), TypeScript, Material UI, Tailwind CSS

## Membres du groupe

- Niruchan AA
- Arthur V
- Fatouma D

## Infos utiles

- Proxy configuré vers le backend: `frontend/package.json` → `"proxy": "http://localhost:5002"`
