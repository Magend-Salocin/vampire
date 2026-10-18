# CLAUDE.md — Vampire Remastered

Remake HTML5 de *Vampire* (Thomson MO5, 1986). Langue du projet : **français** pour la doc, les messages de commit et les textes affichés ; **anglais** pour les identifiants du code. Voir `README.md` pour la vue d'ensemble et `.claude/rules/` pour les règles détaillées.

## Stack

HTML5 Canvas, JavaScript ES6 modules, aucune dépendance ni étape de build. On teste en ouvrant le HTML ou avec `python3 -m http.server 8000`.

## Où est quoi

- `prototypes/03-remastered-single-file/index.html` : prototype le plus complet (~66 Ko, tout dans un seul fichier : jeu, sprites procéduraux, niveaux, éditeur intégré)
- `prototypes/02-canvas-modules/` : début d'architecture en classes (canvas 640×400, rectangles de couleur)
- `prototypes/01-dom-sprite/` : premier essai en DOM/CSS
- `tools/map-editor/index.html` : éditeur de cartes autonome
- `docs/` : `specification.md` et `cahier-des-charges.md` décrivent la cible
- `assets/` : planches de sprites, cartes, storyboard, captures du jeu original

## Incohérences connues à trancher avant d'écrire `src/`

Ne pas les résoudre en silence : demander à l'utilisateur.

1. **Deux architectures cibles** : la spec propose `engine/ entities/ world/ ui/ editor/ assets/ data/`, le cahier des charges propose `core/ entities/ world/ ui/ data/ assets/`.
2. **Deux tailles de tuiles** : le prototype 03 utilise des tuiles de 16 px (grille 20×13), l'éditeur utilise 8 px (grille 40×20, HUD de 40 px, zone de jeu 160 px de haut).
3. **Deux formats de niveau** :
   - prototype 03 : `{ id, name, tiles, enemies[], items[], portal, bgColor }`
   - éditeur : `{ id, name, bg, terrain, decor, meta{ spawnX, spawnY, nextRight, nextLeft } }`
4. **Résolution** : le prototype 02 utilise un canvas 640×400, la spec impose 320×200.

## Prochaines étapes suggérées

1. Trancher les points ci-dessus
2. Créer `src/` et y extraire le code du prototype 03 module par module (skill `extract-module`)
3. Remplacer les sprites procéduraux par les atlas (skill `sprite-atlas`)
4. Aligner l'éditeur et le jeu sur un seul format de niveau (skill `screen-data`)

## Règles de travail

- Déplacer avec `git mv` pour conserver l'historique ; ne pas renommer ni supprimer les fichiers de `assets/reference/`.
- Les prototypes sont figés : on les lit, on n'y ajoute pas de fonctionnalités.
- Ne jamais pousser ni changer de remote sans demande explicite.
- Avant de supprimer un fichier suspecté doublon, comparer les checksums (`md5sum`).

## Historique de la réorganisation

Doublons supprimés car identiques à un autre fichier (md5) : `vampire_map - Copie.png`, `Atlas_sprites_pnj.png` (= `atlas-sprites.png`), `picture/cover (1).jpg`, `picture/22973-ingame-Vampire (1).jpg`, `Prototype/vampire_remastered (1).html`, `vampire_remastered_asset.js` (c'était un fichier HTML, identique au prototype 03). Également supprimé : `vampire_doc.zip` (archive DjVu de la doc, le PDF est conservé dans `docs/`).
