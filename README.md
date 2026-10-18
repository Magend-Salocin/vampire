# Vampire Remastered — remake HTML5

Remake fidèle du jeu **Vampire** (1986, Thomson MO5) en HTML5 Canvas et JavaScript ES6, avec un éditeur de cartes intégré et une version « remaster » à venir.

- Rendu pixel perfect en **320×200**
- Écrans fixes, déplacements latéraux, inventaire simple, ennemis scriptés
- Boss Vampire, HUD permanent, effets CRT (scanlines, fondu entre écrans)

## Lancer le projet

Aucune compilation : ouvrir directement un fichier HTML dans un navigateur.

| Quoi | Fichier |
|---|---|
| Version jouable la plus complète (jeu + éditeur intégré) | `prototypes/03-remastered-single-file/index.html` |
| Éditeur de cartes autonome | `tools/map-editor/index.html` |

Pour les modules ES6 (`prototypes/02-canvas-modules`), servir le dossier en HTTP :

```bash
python3 -m http.server 8000
# puis http://localhost:8000/prototypes/02-canvas-modules/
```

## Organisation du dépôt

```
.
├── README.md
├── CLAUDE.md              # consignes pour Claude Code
├── .claude/               # rules, skills et templates pour Claude
├── docs/                  # spécification, cahier des charges, doc du jeu original
├── assets/
│   ├── atlas/             # planches de sprites
│   ├── maps/              # cartes complètes du jeu original
│   ├── story/             # storyboard de l'intro
│   └── reference/         # captures et visuels du jeu original (référence)
├── tools/map-editor/      # éditeur de cartes
├── prototypes/            # trois prototypes successifs (01 → 03)
└── src/                   # à créer : le vrai code, voir CLAUDE.md
```

## Documentation

- [`docs/specification.md`](docs/specification.md) : vision, moteur, entités, inventaire, monde, feuille de route V1–V3
- [`docs/cahier-des-charges.md`](docs/cahier-des-charges.md) : architecture technique détaillée et squelettes de classes
- [`docs/vampire-doc.pdf`](docs/vampire-doc.pdf) : documentation du jeu original
- [`docs/liens.txt`](docs/liens.txt) : page du jeu original sur dcmoto

## État d'avancement

Il existe trois prototypes, mais pas encore de code dans `src/`. Le prototype 03 est le plus avancé (3 niveaux, ennemis, objets, éditeur). Les prochaines étapes sont listées dans `CLAUDE.md`.

## Feuille de route

1. **V1** : gameplay original
2. **V2** : remaster HD
3. **V3** : bascule Original / Remaster en temps réel
