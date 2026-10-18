---
name: extract-module
description: Extraire une partie du prototype 03 (fichier HTML unique) vers un module ES6 dans src/. À utiliser pour migrer progressivement le jeu vers l'architecture décrite dans docs/.
---

# Extraire un module du prototype 03

Prérequis : l'architecture cible de `src/` a été tranchée avec l'utilisateur (spec ou cahier des charges, voir `CLAUDE.md`).

## Procédure

1. Repérer dans `prototypes/03-remastered-single-file/index.html` le bloc à extraire (les sections sont séparées par des commentaires `// ─── NOM ───`).
2. Créer le module dans `src/` avec `export default class` (modèle : `.claude/assets/templates/module.template.js`).
3. Remplacer les variables globales par des paramètres de constructeur ou des imports explicites.
4. Ne pas modifier le prototype : il reste la référence de comportement.
5. Vérifier en servant le dossier (`python3 -m http.server`) puis en ouvrant la page de test du module.
6. Un module extrait = un commit.

## Ordre conseillé

`AssetManager` et constantes (`GAME_W`, `GAME_H`, palette) → `InputManager` → `Entity`, `Player`, monstres → `TileMap` et `Screen` → `Hud` et `Inventory` → `Game` (boucle principale) → éditeur.
