# Muscu

Application web mobile (PWA) pour suivre mes séances de musculation : programme full body A/B guidé, animations des mouvements, schéma des muscles travaillés et progression automatique des charges.

**👉 [briangtn.github.io/muscu](https://briangtn.github.io/muscu/)**

> [!WARNING]
> **Projet 100 % vibe codé.** Toute l'application a été écrite par une IA ([Claude Code](https://claude.com/claude-code)) à partir de mes demandes, sans relecture ligne par ligne ni tests automatisés. Elle est faite pour mon usage perso : ça marche chez moi, aucune garantie ailleurs.
>
> Le programme et les consignes ne viennent pas d'un coach. En cas de douleur, on arrête et on demande à un pro.

## Fonctionnalités

- **Programme full body A/B** en alternance automatique, environ 1 h : footing sur tapis, mobilité, musculation, puis course.
- **Séance guidée** : un exercice par écran avec animation, consignes clés, erreurs à éviter et schéma des muscles travaillés.
- **Saisie rapide** des charges, reps, vitesse et pente du tapis avec des boutons − / +, pré-remplis depuis la séance précédente.
- **Double progression** : quand toutes les séries atteignent le haut de la fourchette de reps, la charge augmente d'un palier.
- **Minuteurs** de repos et d'exercices chronométrés, avec bip et flash à la fin. L'écran reste allumé pendant la séance.
- **Exercices bonus** proposés en fin de séance quand on a encore de l'énergie, choisis pour compléter la séance du jour.
- **Passer un exercice ou arrêter une séance** en cours de route : rien n'est perdu, les séries faites sont enregistrées.
- **Remplacer un exercice** quand la machine est prise, par une alternative qui travaille les mêmes muscles, avec son propre suivi des charges.
- **Historique** avec un compte rendu par exercice : fait, partiel, passé ou non fait si la séance a été écourtée.
- **Installable sur iPhone** (Safari → Partager → Sur l'écran d'accueil) et **utilisable hors ligne**.

Toutes les données restent dans le navigateur du téléphone (`localStorage`) : pas de compte, pas de serveur.

## Stack

- [Angular](https://angular.dev) 22 (composants standalone, signals, sans zone.js)
- Service worker Angular pour le mode hors ligne
- Images d'exercices : [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (domaine public)

## Développement

```bash
npm install
npm start          # http://localhost:4200
npm run build      # build de production dans dist/muscu/browser
```

Le programme se modifie dans [`src/app/data/program.ts`](src/app/data/program.ts), les exercices dans [`src/app/data/exercises.ts`](src/app/data/exercises.ts).

## Déploiement

Chaque push sur `main` construit l'app et la publie sur GitHub Pages ([workflow](.github/workflows/deploy.yml)).
