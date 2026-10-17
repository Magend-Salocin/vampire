https://dcmoto.pages-perso.free.fr/programmes/vampire/index.html



Livrable Technique — Vampire HTML5 Remake
Objectif

Reproduire Vampire (1986) en HTML5/Javascript moderne tout en conservant :

écrans fixes
déplacements latéraux
inventaire simple
ennemis scriptés
objets à récupérer
transitions entre écrans
HUD permanent
Architecture
src/

├── core/
│   ├── Game.js
│   ├── ScreenManager.js
│   ├── InputManager.js
│   ├── AssetManager.js
│   └── CollisionManager.js
│
├── entities/
│   ├── Entity.js
│   ├── Player.js
│   ├── Monster.js
│   ├── Ghost.js
│   ├── Bat.js
│   ├── VampireBoss.js
│   └── Item.js
│
├── world/
│   ├── Screen.js
│   ├── Tile.js
│   ├── TileMap.js
│   └── Portal.js
│
├── ui/
│   ├── Hud.js
│   ├── Inventory.js
│   ├── LifeBar.js
│   └── DialogBox.js
│
├── data/
│   ├── screens/
│   │     ├── screen001.json
│   │     ├── screen002.json
│   │     └── ...
│   │
│   ├── monsters.json
│   └── items.json
│
└── assets/
Classe mère
Entity
export default class Entity {

    constructor(x, y, width, height) {

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.visible = true;
    }

    update(delta) {}

    render(ctx) {}

    getBounds() {

        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
Joueur
Player
import Entity from "./Entity.js";

export default class Player extends Entity {

    constructor(x, y) {

        super(x, y, 16, 24);

        this.life = 100;

        this.speed = 2;

        this.inventory = null;

        this.direction = "right";

        this.currentAnimation = "idle";
    }

    moveLeft() {

        this.x -= this.speed;

        this.direction = "left";
    }

    moveRight() {

        this.x += this.speed;

        this.direction = "right";
    }

    attack() {

    }

    pickup(item) {

        this.inventory.add(item);
    }

    update(delta) {

    }

    render(ctx) {

    }
}
Monstre
Monster
import Entity from "./Entity.js";

export default class Monster extends Entity {

    constructor(x, y) {

        super(x, y, 16, 16);

        this.life = 10;

        this.damage = 1;
    }

    hit(damage) {

        this.life -= damage;
    }

    isDead() {

        return this.life <= 0;
    }
}
Fantôme
Ghost
import Monster from "./Monster.js";

export default class Ghost extends Monster {

    constructor(x, y) {

        super(x, y);

        this.speed = 1;
    }

    update(delta) {

        this.x += Math.sin(Date.now() / 500);
    }
}
Chauve-souris
Bat
import Monster from "./Monster.js";

export default class Bat extends Monster {

    constructor(x, y) {

        super(x, y);

        this.speed = 2;
    }

    update(delta) {

        this.y += Math.sin(Date.now() / 100) * 2;
    }
}
Boss Vampire
import Monster from "./Monster.js";

export default class VampireBoss extends Monster {

    constructor(x, y) {

        super(x, y);

        this.life = 100;
    }

    transformToBat() {

    }

    summonGhost() {

    }
}
Objet
Item
import Entity from "./Entity.js";

export default class Item extends Entity {

    constructor(x, y, itemId) {

        super(x, y, 16, 16);

        this.itemId = itemId;
    }
}
Inventaire
Inventory
export default class Inventory {

    constructor() {

        this.items = [];

        this.selectedSlot = 0;
    }

    add(item) {

        this.items.push(item);
    }

    remove(itemId) {

        this.items =
            this.items.filter(
                item => item.itemId !== itemId
            );
    }

    getSelected() {

        return this.items[this.selectedSlot];
    }
}
HUD
LifeBar
export default class LifeBar {

    constructor(player) {

        this.player = player;
    }

    render(ctx) {

        ctx.fillStyle = "white";
        ctx.fillRect(20,10,260,6);

        ctx.fillStyle = "red";
        ctx.fillRect(
            20,
            10,
            this.player.life * 2.6,
            6
        );
    }
}
HUD complet
export default class Hud {

    constructor(player) {

        this.player = player;
    }

    render(ctx) {

        // vie

        // inventaire

        // logo vampire

        // lune
    }
}
Ecran
Screen

Un écran correspond exactement à une capture du jeu.

export default class Screen {

    constructor(id) {

        this.id = id;

        this.tiles = [];

        this.monsters = [];

        this.items = [];

        this.portals = [];
    }

    update(delta) {

        this.monsters.forEach(
            monster => monster.update(delta)
        );
    }

    render(ctx) {

    }
}
Passage entre écrans
Portal
export default class Portal {

    constructor(
        x,
        y,
        width,
        height,
        destinationScreen
    ) {

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.destinationScreen =
            destinationScreen;
    }
}
Gestionnaire d'écrans
ScreenManager
export default class ScreenManager {

    constructor() {

        this.currentScreen = null;
    }

    load(screen) {

        this.currentScreen = screen;
    }

    update(delta) {

        this.currentScreen.update(delta);
    }

    render(ctx) {

        this.currentScreen.render(ctx);
    }
}
Tilemap

Chaque écran est décrit dans un JSON.

{
  "id":"graveyard01",

  "tiles":[

    {
      "type":"tree",
      "x":50,
      "y":100
    },

    {
      "type":"grave",
      "x":220,
      "y":140
    }
  ],

  "monsters":[

    {
      "type":"ghost",
      "x":180,
      "y":120
    }
  ],

  "items":[

    {
      "type":"bottle",
      "x":260,
      "y":110
    }
  ]
}
Boucle principale
class Game {

    start() {

        requestAnimationFrame(
            this.loop.bind(this)
        );
    }

    loop(timestamp) {

        this.update();

        this.render();

        requestAnimationFrame(
            this.loop.bind(this)
        );
    }
}
Atlas de sprites recommandé

Après analyse des captures :

hero_walk.png
hero_idle.png
hero_attack.png

bat_fly.png

ghost_float.png

red_monster_walk.png

tree.png
bush.png
grave.png
wall.png
castle.png

hud_life.png
hud_inventory.png
hud_logo.png
hud_moon.png
Évolution future

Une fois le remake de base terminé :

Phase 2
Sons Thomson simulés
Musique AY-3-8910
Effets CRT
Scanlines
Phase 3
Mode Minitel
Mode MO5
Mode VGA 320x200
Phase 4
Éditeur d'écrans
Créateur de cartes
Support JSON complet