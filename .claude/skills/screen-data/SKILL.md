---
name: screen-data
description: Créer, modifier ou convertir les données d'écran (niveaux) de Vampire au format JSON. À utiliser quand on ajoute un tableau, qu'on importe un export de l'éditeur, ou qu'on veut unifier les deux formats existants.
---

# Données d'écran

Deux formats coexistent aujourd'hui. Identifier lequel est concerné avant de modifier quoi que ce soit.

## Format prototype 03 (tuiles 16 px, grille 20×13)

Modèle : `.claude/assets/templates/screen-prototype03.template.json`

- `tiles` : tableau 13 lignes × 20 colonnes d'identifiants (`-1` = vide). Ids : SKY 0, GROUND 1, GRASS 2, WALL 3, PLATFORM 4, LADDER 5, TREE 6, BUSH 7, TOMB1 8, CROSS 9, FENCE 10, DOOR 11.
- `enemies` : `type` parmi `bat`, `ghost`, `redmon`, `serpent`, `boss` ; `x`, `y`, `patrolX: [min, max]` ; le boss a aussi `hp`, `maxHp`.
- `items` : `type` parmi `key`, `cross`, `garlic`, `potion`, `book`, `amulet`.
- `portal` : `{ x, y, targetLevel }` ou `null`.

## Format éditeur (tuiles 8 px, grille 40×20)

Modèle : `.claude/assets/templates/screen-editor.template.json`

- `terrain` (tuiles solides) et `decor` (non solides) : deux calques 20 lignes × 40 colonnes, `0` = case vide.
- `meta` : `spawnX`, `spawnY` (en tuiles), `nextRight`, `nextLeft` (index du tableau voisin, `-1` si aucun).
- Export : bouton Exporter ou Ctrl+S dans `tools/map-editor/index.html`.

## Règles

- Ne pas convertir d'un format à l'autre sans accord de l'utilisateur : les tailles de tuiles diffèrent (voir « Incohérences connues » dans `CLAUDE.md`).
- Vérifier les dimensions de la grille après toute modification (13×20 ou 20×40).
- Un identifiant d'écran est unique et en minuscules avec underscore (`graveyard_01`).
