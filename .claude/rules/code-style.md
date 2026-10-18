---
paths:
  - "src/**/*.js"
  - "tools/**/*.html"
  - "prototypes/**/*.js"
---

# Style de code

- JavaScript ES6 modules (`import` / `export default class`), pas de framework, pas de bundler.
- Identifiants en anglais (`Player`, `ScreenManager`), textes affichés au joueur en français.
- Une classe par fichier, nom de fichier = nom de la classe (`Player.js`).
- Les entités héritent de `Entity` (`x, y, width, height, update(delta), render(ctx), getBounds()`).
- Pas de `localStorage` ni de dépendance réseau pour le jeu lui-même.
- Les données (niveaux, monstres, objets) vivent dans des fichiers JSON, pas dans le code.
