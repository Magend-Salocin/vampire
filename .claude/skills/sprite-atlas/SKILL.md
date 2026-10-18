---
name: sprite-atlas
description: Inspecter, découper ou documenter les planches de sprites du projet Vampire (assets/atlas/). À utiliser quand on doit repérer des sprites dans un atlas, produire un JSON de frames, ou remplacer les sprites procéduraux du prototype 03 par des images.
---

# Atlas de sprites

## Contexte

- Planches dans `assets/atlas/` : `atlas-sprites.png` et `atlas-sprites2.png` (1536×1024), `atlas-prototype-512.png` (512×512).
- Le prototype 03 dessine aujourd'hui ses sprites à partir de tableaux de pixels (voir `// ALL sprites drawn procedurally` dans `prototypes/03-remastered-single-file/index.html`), il n'utilise aucun atlas.
- La spec prévoit `atlas_player.png`, `atlas_monsters.png`, `atlas_tiles.png` : ces fichiers n'existent pas encore.

## Procédure

1. Ouvrir l'image avec l'outil `view` pour repérer visuellement les sprites.
2. Mesurer avec Pillow (`from PIL import Image`) : taille, couleur de fond, bornes de chaque sprite.
3. Écrire le résultat dans un JSON à côté de l'image, par exemple `assets/atlas/atlas-sprites.json` :

```json
{ "image": "atlas-sprites.png",
  "frames": { "player_walk_1": { "x": 0, "y": 0, "w": 16, "h": 24 } } }
```

4. Ne jamais modifier la planche d'origine : produire des copies découpées dans un nouveau fichier.

## À vérifier avec l'utilisateur

Les planches font 1536×1024, loin du 320×200 du jeu. Demander s'il faut les réduire (et à quelle taille de sprite) avant de découper, car la fidélité pixel perfect dépend de ce choix.
