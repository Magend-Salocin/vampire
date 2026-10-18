import { GAME_W, GAME_H } from '../engine/constants.js';

// ─── TILEMAP CONSTANTS ─────────────────────────────────────
const TILE_SIZE = 16;
const COLS = Math.ceil(GAME_W / TILE_SIZE); // 20
const ROWS = Math.ceil(GAME_H / TILE_SIZE); // 13

const TILE_IDS = {
  SKY: 0, GROUND: 1, GRASS: 2, WALL: 3,
  PLATFORM: 4, LADDER: 5, TREE: 6, BUSH: 7,
  TOMB1: 8, CROSS: 9, FENCE: 10, DOOR: 11,
  EMPTY: -1,
};

const TILE_PALETTE = [
  { id: 0, name: 'Ciel',     sprite: 'sky'      },
  { id: 1, name: 'Pierre',   sprite: 'ground'   },
  { id: 2, name: 'Herbe',    sprite: 'grass'    },
  { id: 3, name: 'Mur',      sprite: 'wall'     },
  { id: 4, name: 'Platef.',  sprite: 'platform' },
  { id: 5, name: 'Échelle',  sprite: 'ladder'   },
  { id: 6, name: 'Arbre',    sprite: 'tree'     },
  { id: 7, name: 'Buisson',  sprite: 'bush'     },
  { id: 8, name: 'Tombe',    sprite: 'tomb1'    },
  { id: 9, name: 'Croix',    sprite: 'cross'    },
  { id:10, name: 'Grille',   sprite: 'fence'    },
  { id:11, name: 'Porte',    sprite: 'door'     },
];

// ─── MAPS DATA ─────────────────────────────────────────────
// Map = 2D array of tile IDs (20x13), + metadata
function makeEmptyMap() {
  const tiles = [];
  for (let r=0;r<ROWS;r++) {
    tiles.push(new Array(COLS).fill(-1));
  }
  return tiles;
}

// Level 1: Graveyard exterior
function makeLevel1() {
  const t = makeEmptyMap();
  // Sky background
  for (let c=0;c<COLS;c++) {
    for (let r=0;r<9;r++) t[r][c] = 0; // sky
  }
  // Ground
  for (let c=0;c<COLS;c++) {
    t[10][c] = 2; // grass
    t[11][c] = 1; // ground
    t[12][c] = 1; // ground
  }
  // Platforms
  for (let c=3;c<7;c++) t[7][c] = 4;
  for (let c=12;c<16;c++) t[6][c] = 4;
  for (let c=8;c<11;c++) t[8][c] = 4;
  // Ladders
  t[9][4] = 5; t[10][4] = 5;
  t[8][13] = 5; t[9][13] = 5; t[10][13] = 5;
  // Trees
  t[8][1] = 6; t[8][17] = 6;
  // Bushes
  t[10][6] = 7; t[10][14] = 7;
  // Tombstones
  t[9][8] = 8; t[9][11] = 9;
  // Fence
  t[10][0] = 10; t[10][19] = 10;
  // Door
  t[9][18] = 11; t[10][18] = 11;
  return t;
}

// Level 2: Castle exterior
function makeLevel2() {
  const t = makeEmptyMap();
  for (let c=0;c<COLS;c++) for (let r=0;r<13;r++) t[r][c] = 0;
  // Walls (castle)
  for (let c=0;c<5;c++) { t[10][c]=3; t[11][c]=3; t[12][c]=3; }
  for (let c=15;c<COLS;c++) { t[10][c]=3; t[11][c]=3; t[12][c]=3; }
  // Ground
  for (let c=5;c<15;c++) { t[11][c]=2; t[12][c]=1; }
  // Battlements
  for (let c=0;c<5;c+=2) t[8][c]=3;
  for (let c=15;c<COLS;c+=2) t[8][c]=3;
  // Platforms
  for (let c=5;c<10;c++) t[7][c]=4;
  for (let c=11;c<16;c++) t[7][c]=4;
  for (let c=7;c<13;c++) t[5][c]=4;
  // Ladders
  t[8][7]=5; t[9][7]=5; t[10][7]=5; t[11][7]=5;
  t[6][10]=5; t[7][10]=5;
  // Door (castle gate)
  t[9][9]=11; t[10][9]=11;
  // Trees
  t[10][6]=6; t[10][13]=6;
  return t;
}

// Level 3: Inside castle
function makeLevel3() {
  const t = makeEmptyMap();
  for (let c=0;c<COLS;c++) for (let r=0;r<13;r++) t[r][c] = 3;
  // Interior floor areas
  for (let c=1;c<19;c++) { t[11][c]=-1; t[12][c]=-1; t[10][c]=1; }
  for (let c=1;c<8;c++) { t[6][c]=-1; t[7][c]=-1; t[5][c]=1; }
  for (let c=12;c<19;c++) { t[6][c]=-1; t[7][c]=-1; t[5][c]=1; }
  for (let c=4;c<16;c++) { t[3][c]=-1; t[2][c]=-1; t[1][c]=1; }
  // Ladders
  t[8][3]=5; t[9][3]=5; t[10][3]=5;
  t[8][16]=5; t[9][16]=5; t[10][16]=5;
  t[4][5]=5; t[4][14]=5;
  // Opening to outside
  t[10][0]=-1; t[11][0]=-1; t[12][0]=-1;
  t[10][19]=-1; t[11][19]=-1;
  return t;
}

export { TILE_SIZE, COLS, ROWS, TILE_IDS, TILE_PALETTE, makeEmptyMap, makeLevel1, makeLevel2, makeLevel3 };
