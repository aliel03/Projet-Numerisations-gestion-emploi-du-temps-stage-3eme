# Une semaine à l'UM !

Cette application a pour objectif de numeriser la gestion des stages de 3e effectues au sein de l'Universite de Montpellier.

Elle permet de centraliser les informations des eleves, tuteurs, encadrants et administrateurs, ainsi que de faciliter la generation et le suivi des emplois du temps.

## Les utilisateurs

Les utilisateurs sont classes selon leur role. L'application distingue 4 roles principaux :

| Role | Description |
| :--- | :--- |
| Encadrant | Encadre une ou plusieurs activites |
| Tuteur | Suit un ou plusieurs eleves, reste a leur disposition et remplit la fiche d'evaluation finale |
| Eleve | Effectue son stage de 3e au sein de l'universite |
| Admin | Gere l'application, les utilisateurs, les questionnaires et la generation des emplois du temps |

> Un utilisateur peut etre a la fois encadrant et tuteur.

## Les fonctionnalites

Les fonctionnalites de l'application varient selon le role de l'utilisateur.

### Encadrant

- Renseigner ses informations personnelles pour s'inscrire
- Ajouter une activite qu'il pourra encadrer
- Se connecter a son compte
- Acceder aux activites qu'il encadre
- Acceder a son emploi du temps et le telecharger en PDF
- Acceder a la liste des eleves associes a ses activites et la telecharger en PDF
- Repondre au questionnaire encadrant pour chaque activite et modifier ses reponses

### Tuteur

- Renseigner ses informations personnelles pour s'inscrire
- Indiquer le nombre d'eleves qu'il souhaite suivre
- Acceder aux informations des eleves dont il est tuteur
- Acceder a l'emploi du temps de ses eleves
- Repondre au questionnaire tuteur

### Eleve

- Renseigner ses informations personnelles pour s'inscrire
- Acceder a ses informations personnelles
- Acceder a son groupe (eleves ayant le meme emploi du temps)
- Acceder a son emploi du temps et le generer en PDF
- Acceder aux informations utiles concernant son stage
- Acceder aux informations de son tuteur
- Repondre au questionnaire de satisfaction eleve

### Administrateur

- Generer des emplois du temps en choisissant le nombre de parcours a produire et le nombre maximum d'eleves par activite
- Ajouter des activites a la main ou via un fichier CSV
- Ajouter des encadrants ou des tuteurs a la main ou via un fichier CSV
- Ajouter des eleves a la main ou via un fichier CSV
- Afficher l'ensemble des emplois du temps eleves et tuteurs
- Acceder a la liste de tous les eleves, tuteurs et encadrants
- Supprimer des eleves, des tuteurs et des encadrants
- Valider un eleve et lui attribuer un tuteur
- Assigner un emploi du temps a un eleve
- Consulter les reponses aux questionnaires des eleves, tuteurs et encadrants
- Ajouter des questions a n'importe quel questionnaire
- Afficher, modifier et supprimer les questions deja existantes

## Technologies utilisees

- Frontend : React
- Backend : Node.js / Express
- Base de donnees : MySQL
- ORM : Sequelize

## Structure du projet

- `frontend/stage1` : application frontend React
- `backend` : API REST et logique metier
- `database/bd.sql` : script SQL de base
- `backend/Api.md` : documentation de l'API

## Lancer l'application en local

### Prerequis

- Node.js et npm
- MySQL

### 1. Cloner le projet

```bash
git clone https://github.com/Amel2306/Projet-Numerisations-gestion-emploi-du-temps-stage-3eme.git
cd Projet-Numerisations-gestion-emploi-du-temps-stage-3eme
```

### 2. Preparer la base de donnees

Creer une base de donnees MySQL, par exemple `projet_stage`, puis importer le script SQL present dans :

```bash
database/bd.sql
```

Le backend utilise par defaut la connexion suivante si aucune variable d'environnement n'est definie :

```txt
mysql://amel:mdp@localhost:3306/projet_stage
```

Vous pouvez aussi definir la variable d'environnement `DATABASE_URL` pour utiliser une autre configuration.

### 3. Installer et lancer le backend

```bash
cd backend
npm install
node server.js
```

Le serveur backend demarre par defaut sur le port `4000`.

### 4. Installer et lancer le frontend

Dans un nouveau terminal :

```bash
cd frontend/stage1
npm install
npm start
```

Le frontend demarre par defaut sur le port `3000`.

## Acces a l'application

- Frontend : `http://localhost:3000`
- API backend : `http://localhost:4000/api`

## Documentation complementaire

- La documentation des routes API est disponible dans [`backend/Api.md`](backend/Api.md).
