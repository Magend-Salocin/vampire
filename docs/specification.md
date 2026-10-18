# Vampire Remastered HTML5

## Vision

Remake fidèle du jeu Vampire (1986) sur Thomson MO5.

### Objectifs

- Rendu 320x200 pixel perfect
- HTML5 Canvas
- Javascript ES6 Modules
- Atlas de sprites
- Écrans fixes
- Inventaire
- Ennemis
- Boss Vampire
- Éditeur de cartes intégré

---

# Architecture

```text
src/
├── engine/
├── entities/
├── world/
├── ui/
├── editor/
├── assets/
└── data/
```

---

# Moteur

## Game.js

Responsable de la boucle principale.

## Renderer.js

Affichage pixel perfect.

## CollisionSystem.js

Gestion des collisions.

## AssetManager.js

Chargement des sprites et sons.

---

# Entités

## Player

Animations :
- Idle
- Walk
- Attack
- Use Item
- Death

## Ghost

Déplacement flottant.

## Bat

Déplacement aérien.

## RedMonster

Patrouille et attaque.

## VampireBoss

- Téléportation
- Invocation
- Transformation

---

# Inventaire

Objets :
- Clé
- Croix
- Ail
- Potion
- Livre
- Amulette

---

# Monde

Chaque écran est décrit par un JSON.

```json
{
  "id":"graveyard_01",
  "enemies":[],
  "items":[],
  "portals":[]
}
```

---

# HUD

- Barre de vie
- Inventaire
- Logo Vampire
- Lune
- Indicateur rouge

---

# Atlas

## atlas_player.png

- walk
- idle
- attack

## atlas_monsters.png

- bat
- ghost
- red monster
- vampire

## atlas_tiles.png

- arbres
- tombes
- buissons
- murs
- château

---

# Editeur de cartes

Fonctions :

- Placement de tuiles
- Placement d'ennemis
- Placement d'objets
- Export JSON

---

# Effets visuels

- Scanlines CRT
- Palette MO5
- Tremblements
- Fondu entre écrans

---

# Feuille de route

## V1

Gameplay original.

## V2

Remaster HD.

## V3

Mode Original / Remaster en temps réel.
