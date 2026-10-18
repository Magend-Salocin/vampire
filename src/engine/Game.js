import { PAL, GAME_W, GAME_H } from './constants.js';
import { drawSprite, SPRITES } from '../assets/Sprites.js';
import { TILE_SIZE, COLS, ROWS, TILE_IDS, TILE_PALETTE, makeEmptyMap, makeLevel1, makeLevel2, makeLevel3 } from '../data/levels.js';
import LEVELS from '../data/levels.json' with { type: 'json' };

"use strict";
// ============================================================
// VAMPIRE REMASTERED — Full HTML5 Engine
// ============================================================

// ─── CANVAS SETUP ──────────────────────────────────────────
const gameCanvas = document.getElementById('gameCanvas');
const crtCanvas  = document.getElementById('crtOverlay');
const gc = gameCanvas.getContext('2d');
const cc = crtCanvas.getContext('2d');

let scale = 1;
function resizeGame() {
  const maxW = window.innerWidth;
  const maxH = window.innerHeight - 50;
  scale = Math.min(Math.floor(maxW / GAME_W), Math.floor(maxH / GAME_H));
  if (scale < 1) scale = 1;
  gameCanvas.width  = GAME_W;
  gameCanvas.height = GAME_H;
  gameCanvas.style.width  = (GAME_W * scale) + 'px';
  gameCanvas.style.height = (GAME_H * scale) + 'px';
  crtCanvas.width  = GAME_W * scale;
  crtCanvas.height = GAME_H * scale;
  crtCanvas.style.width  = (GAME_W * scale) + 'px';
  crtCanvas.style.height = (GAME_H * scale) + 'px';
  gc.imageSmoothingEnabled = false;
  buildCRT();
}
window.addEventListener('resize', resizeGame);

// ─── GAME STATE ────────────────────────────────────────────
const ITEMS = {
  KEY:    { id:'key',    name:'Clé',      sprite:'item_key',    desc:'Ouvre les portes fermées.' },
  CROSS:  { id:'cross',  name:'Croix',    sprite:'item_cross',  desc:'Repousse les fantômes.' },
  GARLIC: { id:'garlic', name:'Ail',       sprite:'item_garlic', desc:'Affaiblit le vampire.' },
  POTION: { id:'potion', name:'Potion',   sprite:'item_potion', desc:'Restaure toute la vie.' },
  BOOK:   { id:'book',   name:'Livre',    sprite:'item_book',   desc:'Révèle les secrets.' },
  AMULET: { id:'amulet', name:'Amulette', sprite:'item_amulet', desc:'Protection magique.' },
};

let game = {
  state: 'title', // title | playing | gameover | win | editor
  level: 0,
  score: 0,
  tick: 0,
  moonPhase: 0,
  crtEnabled: true,
  soundEnabled: true,
  shake: 0,
  fadeAlpha: 0,
  fadingIn: false,
  fadingOut: false,
  showInventory: false,
  selectedItem: 0,
  message: '',
  messageTick: 0,
  maps: [],
  editorMode: 'place',
  editorTile: 0,
  editorEnemyType: 'bat',
  editorItemType: 'key',
};

// ─── PLAYER ────────────────────────────────────────────────
let player = {
  x:30, y:130, vx:0, vy:0,
  w:8, h:14,
  onGround:false, onLadder:false,
  facing:1, // 1=right, -1=left
  state:'idle', // idle walk jump attack death
  frame:0,
  frameTick:0,
  hp:5, maxHp:5,
  invincible:0,
  attackCooldown:0,
  attackHitbox:null,
  inventory: [],
  dead:false,
  deathTick:0,
};

// ─── ENEMIES ───────────────────────────────────────────────
let enemies = [];
let items_world = [];

function spawnEnemies(lvl) {
  enemies = [];
  for (const e of LEVELS[lvl].enemies) {
    enemies.push({
      type: e.type,
      x: e.x, y: e.y,
      vx: 0.5, vy: 0,
      w: e.type==='boss' ? 16 : (e.type==='bat'?16:e.type==='ghost'?12:10),
      h: e.type==='boss' ? 20 : (e.type==='bat'?8:e.type==='ghost'?14:16),
      frame: 0, frameTick: 0,
      facing: 1,
      patrolX: e.patrolX ? [...e.patrolX] : [e.x-50, e.x+50],
      hp: e.hp || 2,
      maxHp: e.maxHp || 2,
      alive: true,
      state: 'patrol',
      staggerTick: 0,
      alertTick: 0,
      teleportCooldown: 0,
      spawnCooldown: 0,
    });
  }
}

function spawnItems(lvl) {
  items_world = [];
  for (const it of LEVELS[lvl].items) {
    items_world.push({
      type: it.type,
      x: it.x, y: it.y,
      w:8, h:8,
      collected: false,
      bobOffset: Math.random()*Math.PI*2,
    });
  }
}

// ─── PARTICLES ─────────────────────────────────────────────
let particles = [];
function spawnParticles(x, y, color, count=6) {
  for (let i=0;i<count;i++) {
    particles.push({
      x, y,
      vx: (Math.random()-0.5)*3,
      vy: (Math.random()-2)*2,
      life: 20 + Math.random()*10,
      maxLife: 30,
      color,
      size: 1 + Math.random()*2,
    });
  }
}

// ─── INPUT ─────────────────────────────────────────────────
const keys = {};
const justPressed = {};
let mouseX=0, mouseY=0, mouseDown=false, justClick=false;

window.addEventListener('keydown', e => {
  if (!keys[e.code]) justPressed[e.code] = true;
  keys[e.code] = true;
  e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

gameCanvas.addEventListener('mousemove', e => {
  const r = gameCanvas.getBoundingClientRect();
  mouseX = (e.clientX - r.left) / scale;
  mouseY = (e.clientY - r.top) / scale;
});
gameCanvas.addEventListener('mousedown', e => {
  mouseDown = true; justClick = true;
  const r = gameCanvas.getBoundingClientRect();
  mouseX = (e.clientX - r.left) / scale;
  mouseY = (e.clientY - r.top) / scale;
});
gameCanvas.addEventListener('mouseup', () => { mouseDown = false; });

// ─── COLLISION ─────────────────────────────────────────────
function getTile(tiles, col, row) {
  if (col<0||col>=COLS||row<0||row>=ROWS) return -1;
  return tiles[row][col];
}
function isSolid(tileId) {
  return tileId===1||tileId===2||tileId===3||tileId===4;
}
function isLadder(tileId) {
  return tileId===5;
}

function resolveCollision(entity, tiles) {
  const {x, y, w, h} = entity;
  let newX = entity.x + entity.vx;
  let newY = entity.y + entity.vy;
  entity.onGround = false;
  entity.onLadder = false;

  // Horizontal
  if (entity.vx !== 0) {
    const col = entity.vx > 0 ? Math.floor((newX+w)/TILE_SIZE) : Math.floor(newX/TILE_SIZE);
    const r1 = Math.floor(entity.y/TILE_SIZE);
    const r2 = Math.floor((entity.y+h-1)/TILE_SIZE);
    if (isSolid(getTile(tiles,col,r1)) || isSolid(getTile(tiles,col,r2))) {
      if (entity.vx>0) newX = col*TILE_SIZE - w;
      else newX = (col+1)*TILE_SIZE;
      entity.vx = 0;
    }
  }
  entity.x = newX;

  // Vertical
  if (entity.vy > 0) {
    const row = Math.floor((newY+h)/TILE_SIZE);
    const c1 = Math.floor(entity.x/TILE_SIZE);
    const c2 = Math.floor((entity.x+w-1)/TILE_SIZE);
    if (isSolid(getTile(tiles,c1,row)) || isSolid(getTile(tiles,c2,row))) {
      newY = row*TILE_SIZE - h;
      entity.vy = 0;
      entity.onGround = true;
    }
  } else if (entity.vy < 0) {
    const row = Math.floor(newY/TILE_SIZE);
    const c1 = Math.floor(entity.x/TILE_SIZE);
    const c2 = Math.floor((entity.x+w-1)/TILE_SIZE);
    if (isSolid(getTile(tiles,c1,row)) || isSolid(getTile(tiles,c2,row))) {
      newY = (row+1)*TILE_SIZE;
      entity.vy = 0;
    }
  }
  entity.y = newY;

  // Ladder check
  const midCol = Math.floor((entity.x+w/2)/TILE_SIZE);
  const midRow = Math.floor((entity.y+h/2)/TILE_SIZE);
  if (isLadder(getTile(tiles,midCol,midRow))) entity.onLadder = true;

  // World bounds
  if (entity.x < 0) { entity.x = 0; entity.vx = 0; }
  if (entity.x+w > GAME_W) { entity.x = GAME_W-w; entity.vx = 0; }
  if (entity.y > GAME_H) {
    // Fell off screen
    if (entity === player) damagePlayer(1);
    entity.y = GAME_H - h - 5;
    entity.vy = 0;
    entity.onGround = true;
  }
  if (entity.y < 0) { entity.y = 0; entity.vy = 0; }
}

function rectOverlap(ax,ay,aw,ah,bx,by,bw,bh) {
  return ax<bx+bw && ax+aw>bx && ay<by+bh && ay+ah>by;
}

// ─── PLAYER LOGIC ──────────────────────────────────────────
function damagePlayer(amount) {
  if (player.invincible > 0 || player.dead) return;
  player.hp = Math.max(0, player.hp - amount);
  player.invincible = 60;
  game.shake = 8;
  spawnParticles(player.x+player.w/2, player.y+player.h/2, PAL.RED, 8);
  if (player.hp <= 0) {
    player.dead = true;
    player.state = 'death';
    player.deathTick = 120;
  }
}

function healPlayer(amount) {
  player.hp = Math.min(player.maxHp, player.hp + amount);
  spawnParticles(player.x+4, player.y, PAL.GREEN, 8);
}

function useItem(idx) {
  if (idx >= player.inventory.length) return;
  const item = player.inventory[idx];
  if (item.type === 'potion') {
    healPlayer(player.maxHp);
    showMsg('Vie restaurée !');
    player.inventory.splice(idx, 1);
    return;
  }
  if (item.type === 'garlic') {
    // Damages all nearby enemies
    for (const e of enemies) {
      if (rectOverlap(player.x-30, player.y-30, 68, 68, e.x, e.y, e.w, e.h)) {
        damageEnemy(e, 1);
      }
    }
    showMsg('Ail utilisé !');
    player.inventory.splice(idx, 1);
    return;
  }
  if (item.type === 'cross') {
    // Pushes back ghosts
    for (const e of enemies) {
      if (e.type==='ghost' || e.type==='bat') {
        if (rectOverlap(player.x-40, player.y-40, 88, 88, e.x, e.y, e.w, e.h)) {
          damageEnemy(e, 2);
          e.vx = (e.x > player.x ? 2 : -2);
        }
      }
    }
    showMsg('Croix sainte !');
    player.inventory.splice(idx, 1);
    return;
  }
  showMsg(item.name + ' : ' + (ITEMS[item.type.toUpperCase()]?.desc || ''));
}

function updatePlayer(tiles) {
  if (player.dead) {
    player.deathTick--;
    if (player.deathTick <= 0) {
      showGameOver();
    }
    return;
  }
  if (player.invincible > 0) player.invincible--;
  if (player.attackCooldown > 0) player.attackCooldown--;

  const speed = 1.5;
  const gravity = 0.25;
  const jumpForce = -4;

  // Movement
  let moving = false;
  if (keys['ArrowLeft'] || keys['KeyA']) {
    player.vx = -speed;
    player.facing = -1;
    moving = true;
  } else if (keys['ArrowRight'] || keys['KeyD']) {
    player.vx = speed;
    player.facing = 1;
    moving = true;
  } else {
    player.vx *= 0.7;
    if (Math.abs(player.vx) < 0.1) player.vx = 0;
  }

  // Jump / ladder
  if (player.onLadder) {
    if (keys['ArrowUp'] || keys['KeyW']) player.vy = -speed;
    else if (keys['ArrowDown'] || keys['KeyS']) player.vy = speed;
    else player.vy *= 0.5;
    player.vy = Math.max(-speed, Math.min(speed, player.vy));
  } else {
    player.vy += gravity;
    if (player.vy > 5) player.vy = 5;
    if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && player.onGround) {
      player.vy = jumpForce;
      player.onGround = false;
    }
  }

  // Attack
  if ((justPressed['KeyX'] || justPressed['ControlLeft']) && player.attackCooldown <= 0) {
    player.state = 'attack';
    player.frame = 0;
    player.attackCooldown = 25;
    player.attackHitbox = {
      x: player.facing===1 ? player.x+player.w : player.x-14,
      y: player.y+2,
      w: 14, h: 10,
      life: 12,
    };
    playSound('attack');
  }

  // Use item
  if (justPressed['KeyE']) {
    game.showInventory = !game.showInventory;
  }
  if (justPressed['Enter'] && game.showInventory) {
    useItem(game.selectedItem);
  }
  if (justPressed['ArrowLeft'] && game.showInventory) {
    game.selectedItem = Math.max(0, game.selectedItem-1);
  }
  if (justPressed['ArrowRight'] && game.showInventory) {
    game.selectedItem = Math.min(player.inventory.length-1, game.selectedItem+1);
  }

  resolveCollision(player, tiles);

  // State machine
  if (player.state !== 'attack' || player.attackCooldown <= 0) {
    if (!player.onGround && !player.onLadder) player.state = 'jump';
    else if (moving) player.state = 'walk';
    else player.state = 'idle';
  }
  if (player.attackCooldown <= 0) player.attackHitbox = null;

  // Animation frame
  player.frameTick++;
  if (player.frameTick >= 8) {
    player.frameTick = 0;
    player.frame = (player.frame+1) % 2;
  }

  // Collect items
  for (const it of items_world) {
    if (!it.collected && rectOverlap(player.x, player.y, player.w, player.h, it.x, it.y+Math.sin(game.tick*0.05+it.bobOffset)*2, it.w, it.h)) {
      it.collected = true;
      player.inventory.push({ type: it.type });
      if (player.inventory.length > 6) player.inventory.shift();
      const itemDef = ITEMS[it.type.toUpperCase()];
      showMsg('Obtenu : ' + (itemDef ? itemDef.name : it.type));
      game.score += 50;
      spawnParticles(it.x+4, it.y, PAL.YELLOW, 10);
      playSound('collect');
    }
  }

  // Portal
  const portal = LEVELS[game.level].portal;
  if (portal) {
    if (rectOverlap(player.x, player.y, player.w, player.h, portal.x, portal.y, 16, 16)) {
      if (justPressed['ArrowUp'] || justPressed['KeyW'] || justPressed['Enter']) {
        goToLevel(portal.targetLevel);
      }
    }
  }

  // Enemy attack hitbox
  if (player.attackHitbox) {
    player.attackHitbox.life--;
    if (player.attackHitbox.life <= 0) player.attackHitbox = null;
    else {
      for (const e of enemies) {
        if (e.alive && rectOverlap(
          player.attackHitbox.x, player.attackHitbox.y,
          player.attackHitbox.w, player.attackHitbox.h,
          e.x, e.y, e.w, e.h
        )) {
          damageEnemy(e, 1);
        }
      }
    }
  }

  // Enemy contact damage
  for (const e of enemies) {
    if (e.alive && player.invincible <= 0) {
      if (rectOverlap(player.x+2, player.y+2, player.w-4, player.h-4, e.x, e.y, e.w, e.h)) {
        damagePlayer(1);
      }
    }
  }
}

// ─── ENEMY LOGIC ───────────────────────────────────────────
function damageEnemy(e, dmg) {
  if (!e.alive) return;
  e.hp -= dmg;
  e.staggerTick = 15;
  spawnParticles(e.x+e.w/2, e.y+e.h/2, e.type==='boss' ? PAL.MAGENTA : PAL.RED, 6);
  game.score += 10;
  if (e.hp <= 0) {
    e.alive = false;
    spawnParticles(e.x+e.w/2, e.y+e.h/2, PAL.YELLOW, 16);
    game.score += 100;
    playSound('defeat');
    if (e.type === 'boss') {
      setTimeout(() => showWin(), 1500);
    }
  }
}

function updateEnemies(tiles) {
  for (const e of enemies) {
    if (!e.alive) continue;
    e.frameTick++;
    if (e.frameTick >= 10) { e.frameTick=0; e.frame=(e.frame+1)%2; }
    if (e.staggerTick > 0) { e.staggerTick--; continue; }

    if (e.type === 'bat' || e.type === 'ghost') {
      // Floating movement — no gravity
      e.x += e.vx;
      if (e.x < e.patrolX[0]) { e.x = e.patrolX[0]; e.vx = Math.abs(e.vx); e.facing=1; }
      if (e.x > e.patrolX[1]) { e.x = e.patrolX[1]; e.vx = -Math.abs(e.vx); e.facing=-1; }
      // Slight vertical bob for bats
      if (e.type === 'bat') {
        e.y += Math.sin(game.tick*0.05 + e.x*0.1) * 0.5;
      } else {
        // Ghost: drift toward player
        const dy = player.y - e.y;
        if (Math.abs(dy) > 2) e.y += dy > 0 ? 0.3 : -0.3;
      }
    } else if (e.type === 'redmon' || e.type === 'serpent') {
      // Ground patrol
      e.vy += 0.3;
      if (e.vy > 5) e.vy = 5;
      e.x += e.vx;
      resolveCollision(e, tiles);
      if (e.x < e.patrolX[0]) { e.x = e.patrolX[0]; e.vx = Math.abs(e.vx); e.facing=1; }
      if (e.x > e.patrolX[1]) { e.x = e.patrolX[1]; e.vx = -Math.abs(e.vx); e.facing=-1; }
    } else if (e.type === 'boss') {
      // Boss: teleport + charge
      e.teleportCooldown--;
      if (e.teleportCooldown <= 0) {
        // Teleport near player
        e.x = player.x + (Math.random()>0.5 ? 40 : -40);
        e.x = Math.max(10, Math.min(GAME_W-e.w-10, e.x));
        e.y = player.y - 20;
        e.teleportCooldown = 120 + Math.random()*60;
        spawnParticles(e.x+e.w/2, e.y+e.h/2, PAL.MAGENTA, 20);
        // Spawn bat minion
        if (e.spawnCooldown <= 0) {
          enemies.push({
            type:'bat', x:e.x, y:e.y, vx:0.7, vy:0,
            w:16, h:8, frame:0, frameTick:0, facing:1,
            patrolX:[e.x-60, e.x+60], hp:1, maxHp:1,
            alive:true, state:'patrol', staggerTick:0,
          });
          e.spawnCooldown = 180;
        }
      }
      e.spawnCooldown--;
      // Move toward player
      const dx = player.x - e.x;
      if (Math.abs(dx) > 3) e.x += dx > 0 ? 1 : -1;
      e.vy += 0.1;
      e.y += e.vy;
      resolveCollision(e, tiles);
      e.facing = dx > 0 ? 1 : -1;
    }
  }
}

// ─── LEVEL TRANSITION ──────────────────────────────────────
function goToLevel(lvlIdx) {
  if (lvlIdx >= LEVELS.length) { showWin(); return; }
  game.fadingOut = true;
  game.fadeAlpha = 0;
  setTimeout(() => {
    game.level = lvlIdx;
    loadLevel(lvlIdx);
    game.fadingIn = true;
    game.fadingOut = false;
    game.fadeAlpha = 1;
    showMsg('Niveau ' + (lvlIdx+1) + ' : ' + LEVELS[lvlIdx].name);
  }, 500);
}

function loadLevel(lvlIdx) {
  const lvl = LEVELS[lvlIdx];
  if (!lvl.tiles) lvl.tiles = [makeLevel1, makeLevel2, makeLevel3][lvlIdx]();
  // Reset player position
  player.x = 20; player.y = 100;
  player.vx = 0; player.vy = 0;
  player.dead = false;
  player.invincible = 60;
  spawnEnemies(lvlIdx);
  spawnItems(lvlIdx);
  game.moonPhase = lvlIdx;
}

function showGameOver() {
  game.state = 'gameover';
  document.getElementById('gameOver').style.display = 'flex';
}
function showWin() {
  game.state = 'win';
  document.getElementById('finalScore').textContent = game.score;
  document.getElementById('winScreen').style.display = 'flex';
}

// ─── MESSAGE ───────────────────────────────────────────────
function showMsg(text) {
  const el = document.getElementById('messageBox');
  el.textContent = text;
  el.style.display = 'block';
  game.messageTick = 120;
}

// ─── SOUND (Web Audio API) ─────────────────────────────────
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, type, duration, vol=0.15) {
  if (!game.soundEnabled) return;
  try {
    const a = getAudio();
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.connect(gain);
    gain.connect(a.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, a.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq*0.5, a.currentTime+duration);
    gain.gain.setValueAtTime(vol, a.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime+duration);
    osc.start(); osc.stop(a.currentTime+duration);
  } catch(e){}
}
const SOUNDS = {
  jump:    () => { playTone(400,'square',0.1); playTone(600,'square',0.15,0.1); },
  attack:  () => { playTone(200,'sawtooth',0.08); playTone(150,'square',0.05,0.2); },
  collect: () => { playTone(600,'square',0.05); playTone(800,'square',0.05,0.1); playTone(1000,'square',0.1,0.1); },
  defeat:  () => { playTone(400,'sawtooth',0.1); playTone(200,'sawtooth',0.1,0.1); playTone(100,'square',0.15,0.1); },
  hurt:    () => { playTone(100,'sawtooth',0.2); },
  portal:  () => { for(let i=0;i<5;i++) setTimeout(()=>playTone(200+i*100,'square',0.1,0.08), i*60); },
};
function playSound(name) {
  if (SOUNDS[name]) SOUNDS[name]();
}

// ─── RENDERER ──────────────────────────────────────────────
function drawTilemap(tiles, bgColor) {
  // Background
  gc.fillStyle = bgColor || '#000011';
  gc.fillRect(0, 0, GAME_W, GAME_H);

  for (let r=0; r<ROWS; r++) {
    for (let c=0; c<COLS; c++) {
      const tid = tiles[r][c];
      if (tid < 0) continue;
      const tdef = TILE_PALETTE[tid];
      if (!tdef) continue;
      const sp = SPRITES[tdef.sprite];
      if (!sp) continue;
      drawSprite(gc, sp, c*TILE_SIZE, r*TILE_SIZE);
    }
  }
}

function drawPortal(portal) {
  if (!portal) return;
  const t = game.tick;
  const glow = Math.sin(t*0.08)*0.5+0.5;
  gc.fillStyle = `rgba(0,255,255,${0.3+glow*0.4})`;
  gc.fillRect(portal.x, portal.y, 16, 16);
  gc.strokeStyle = '#00FFFF';
  gc.lineWidth = 1;
  gc.strokeRect(portal.x, portal.y, 16, 16);
  // Arrow up
  gc.fillStyle = '#FFFF00';
  gc.fillRect(portal.x+7, portal.y+2, 2, 10);
  gc.fillRect(portal.x+4, portal.y+5, 8, 2);
}

function drawItems() {
  for (const it of items_world) {
    if (it.collected) continue;
    const bob = Math.sin(game.tick*0.05+it.bobOffset)*2;
    const sp = SPRITES['item_'+it.type] || SPRITES.item_key;
    drawSprite(gc, sp, it.x, it.y+bob);
    // Glow effect
    gc.fillStyle = 'rgba(255,255,0,0.2)';
    gc.fillRect(it.x-1, it.y+bob-1, sp.w+2, sp.h+2);
  }
}

function drawPlayer() {
  if (player.invincible > 0 && Math.floor(player.invincible/4)%2===1) return; // blink
  const s = player.state;
  let sp;
  if (s==='death') sp = SPRITES.player_death;
  else if (s==='attack') sp = SPRITES.player_attack;
  else if (s==='jump') sp = SPRITES.player_jump;
  else if (s==='walk') sp = player.frame===0 ? SPRITES.player_walk1 : SPRITES.player_walk2;
  else sp = SPRITES.player_idle;
  drawSprite(gc, sp, player.x, player.y, player.facing===-1);
  // Attack hitbox visual
  if (player.attackHitbox) {
    gc.fillStyle = 'rgba(255,255,0,0.3)';
    gc.fillRect(player.attackHitbox.x, player.attackHitbox.y, player.attackHitbox.w, player.attackHitbox.h);
  }
}

function drawEnemy(e) {
  if (!e.alive) return;
  let sp;
  const f = e.frame;
  if (e.type==='bat')     sp = f===0 ? SPRITES.bat1     : SPRITES.bat2;
  else if (e.type==='ghost')  sp = f===0 ? SPRITES.ghost1   : SPRITES.ghost2;
  else if (e.type==='redmon' || e.type==='serpent') sp = f===0 ? SPRITES.redmon1   : SPRITES.redmon2;
  else if (e.type==='boss')   sp = f===0 ? SPRITES.vampboss1 : SPRITES.vampboss2;
  else sp = SPRITES.bat1;
  const flip = e.facing === -1;
  // Stagger flash
  if (e.staggerTick > 0 && Math.floor(e.staggerTick/3)%2===1) {
    drawSprite(gc, sp, e.x, e.y, flip, PAL.WHITE);
  } else {
    drawSprite(gc, sp, e.x, e.y, flip);
  }
  // HP bar for boss / redmon
  if (e.type==='boss' || e.type==='redmon') {
    const bw = e.w;
    gc.fillStyle = '#500';
    gc.fillRect(e.x, e.y-4, bw, 2);
    gc.fillStyle = '#F00';
    gc.fillRect(e.x, e.y-4, Math.floor(bw * e.hp/e.maxHp), 2);
  }
}

function drawParticles() {
  for (const p of particles) {
    const a = p.life / p.maxLife;
    gc.globalAlpha = a;
    gc.fillStyle = p.color;
    gc.fillRect(p.x, p.y, p.size, p.size);
  }
  gc.globalAlpha = 1;
}

function drawHUD() {
  // Background strip
  gc.fillStyle = 'rgba(0,0,0,0.85)';
  gc.fillRect(0, 0, GAME_W, 16);
  gc.fillRect(0, GAME_H-16, GAME_W, 16);

  // HP bar
  gc.fillStyle = '#500';
  gc.fillRect(2, 2, 60, 6);
  gc.fillStyle = '#F00';
  gc.fillRect(2, 2, Math.floor(60 * player.hp / player.maxHp), 6);
  gc.strokeStyle = '#FFF';
  gc.lineWidth = 1;
  gc.strokeRect(2, 2, 60, 6);

  // HP hearts
  for (let i=0;i<player.maxHp;i++) {
    gc.fillStyle = i < player.hp ? '#F00' : '#500';
    gc.fillRect(2+i*12, 9, 10, 4);
  }

  // Score
  gc.fillStyle = '#FFFF00';
  gc.font = '6px "Press Start 2P", monospace';
  gc.fillText('SCORE:'+game.score, 80, 8);
  gc.fillText('LVL:'+(game.level+1), 200, 8);

  // Moon indicator
  const moonSprites = [SPRITES.moon0, SPRITES.moon1, SPRITES.moon2, SPRITES.moon3];
  const ms = moonSprites[game.moonPhase % 4];
  drawSprite(gc, ms, GAME_W-16, 2);

  // Level name
  gc.fillStyle = '#00FFFF';
  gc.font = '5px "Press Start 2P", monospace';
  gc.fillText(LEVELS[game.level]?.name || '', GAME_W/2-20, 8);

  // Inventory bar at bottom
  const invX = GAME_W/2 - (6*18)/2;
  for (let i=0;i<6;i++) {
    const x = invX + i*18;
    // Slot background
    gc.fillStyle = i===game.selectedItem && game.showInventory ? '#222200' : '#111';
    gc.fillRect(x, GAME_H-14, 16, 12);
    gc.strokeStyle = i===game.selectedItem && game.showInventory ? '#FFFF00' : '#444';
    gc.lineWidth = 1;
    gc.strokeRect(x, GAME_H-14, 16, 12);
    // Item icon
    if (i < player.inventory.length) {
      const it = player.inventory[i];
      const sp = SPRITES['item_'+it.type] || SPRITES.item_key;
      gc.save();
      gc.scale(1,1);
      drawSprite(gc, sp, x+4, GAME_H-12);
      gc.restore();
    }
  }

  // Portal hint
  const portal = LEVELS[game.level]?.portal;
  if (portal && rectOverlap(player.x, player.y, player.w, player.h, portal.x, portal.y, 16, 16)) {
    gc.fillStyle = '#00FFFF';
    gc.font = '5px "Press Start 2P", monospace';
    gc.fillText('▲ SUIVANT', portal.x-10, portal.y-4);
  }

  // Inventory expanded
  if (game.showInventory) {
    gc.fillStyle = 'rgba(0,0,0,0.9)';
    gc.fillRect(GAME_W/2-60, GAME_H/2-30, 120, 60);
    gc.strokeStyle = '#FF0000';
    gc.strokeRect(GAME_W/2-60, GAME_H/2-30, 120, 60);
    gc.fillStyle = '#FFFF00';
    gc.font = '5px "Press Start 2P", monospace';
    gc.fillText('INVENTAIRE', GAME_W/2-28, GAME_H/2-20);
    for (let i=0;i<player.inventory.length;i++) {
      const it = player.inventory[i];
      const sp = SPRITES['item_'+it.type] || SPRITES.item_key;
      const ix = GAME_W/2-50 + i*18;
      gc.fillStyle = i===game.selectedItem ? '#333300' : '#111';
      gc.fillRect(ix, GAME_H/2-10, 16, 16);
      gc.strokeStyle = i===game.selectedItem ? '#FFFF00' : '#444';
      gc.strokeRect(ix, GAME_H/2-10, 16, 16);
      drawSprite(gc, sp, ix+4, GAME_H/2-6);
    }
    if (player.inventory.length > 0) {
      const it = player.inventory[game.selectedItem];
      const def = ITEMS[it?.type?.toUpperCase()];
      gc.fillStyle = '#00FFFF';
      gc.font = '4px "Press Start 2P", monospace';
      gc.fillText(def ? def.desc : '', GAME_W/2-50, GAME_H/2+14);
      gc.fillStyle = '#888';
      gc.fillText('ENTRÉE: utiliser', GAME_W/2-38, GAME_H/2+22);
    }
  }

  // Boss indicator
  const boss = enemies.find(e=>e.type==='boss'&&e.alive);
  if (boss) {
    gc.fillStyle = '#FF00FF';
    gc.font = '5px "Press Start 2P", monospace';
    gc.fillText('★ VAMPIRE ★', GAME_W/2-30, GAME_H-20);
    gc.fillStyle = '#500';
    gc.fillRect(GAME_W/2-50, GAME_H-18, 100, 4);
    gc.fillStyle = '#FF00FF';
    gc.fillRect(GAME_W/2-50, GAME_H-18, Math.floor(100*boss.hp/boss.maxHp), 4);
  }
}

// ─── CRT EFFECT ────────────────────────────────────────────
let crtImageData = null;
function buildCRT() {
  const w = crtCanvas.width, h = crtCanvas.height;
  cc.clearRect(0,0,w,h);
  // Scanlines
  for (let y=0;y<h;y+=2*scale) {
    cc.fillStyle = 'rgba(0,0,0,0.3)';
    cc.fillRect(0, y, w, scale);
  }
  // Vignette
  const grad = cc.createRadialGradient(w/2,h/2,h*0.3,w/2,h/2,h*0.8);
  grad.addColorStop(0,'rgba(0,0,0,0)');
  grad.addColorStop(1,'rgba(0,0,0,0.5)');
  cc.fillStyle = grad;
  cc.fillRect(0,0,w,h);
  crtImageData = cc.getImageData(0,0,w,h);
}

function applyCRT() {
  if (!game.crtEnabled || !crtImageData) return;
  cc.putImageData(crtImageData, 0, 0);
}

// ─── FADE ──────────────────────────────────────────────────
function updateFade() {
  if (game.fadingIn) {
    game.fadeAlpha -= 0.04;
    if (game.fadeAlpha <= 0) { game.fadeAlpha=0; game.fadingIn=false; }
  }
  if (game.fadingOut) {
    game.fadeAlpha += 0.04;
    if (game.fadeAlpha >= 1) { game.fadeAlpha=1; }
  }
  if (game.fadeAlpha > 0) {
    gc.fillStyle = `rgba(0,0,0,${game.fadeAlpha})`;
    gc.fillRect(0,0,GAME_W,GAME_H);
  }
}

// ─── SHAKE ─────────────────────────────────────────────────
function applyShake() {
  if (game.shake > 0) {
    const dx = (Math.random()-0.5)*game.shake;
    const dy = (Math.random()-0.5)*game.shake;
    gc.save();
    gc.translate(dx, dy);
    game.shake *= 0.85;
    if (game.shake < 0.5) game.shake = 0;
    return true;
  }
  return false;
}

// ─── PARTICLES UPDATE ──────────────────────────────────────
function updateParticles() {
  for (let i=particles.length-1; i>=0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// ─── EDITOR MODE ───────────────────────────────────────────
function updateEditor() {
  const lvl = LEVELS[game.level];
  if (!lvl.tiles) lvl.tiles = [makeLevel1, makeLevel2, makeLevel3][game.level]();
  // Draw
  drawTilemap(lvl.tiles, lvl.bgColor);
  // Grid overlay
  gc.strokeStyle = 'rgba(255,255,0,0.15)';
  gc.lineWidth = 0.5;
  for (let c=0;c<COLS;c++) {
    gc.beginPath(); gc.moveTo(c*TILE_SIZE,0); gc.lineTo(c*TILE_SIZE,GAME_H); gc.stroke();
  }
  for (let r=0;r<ROWS;r++) {
    gc.beginPath(); gc.moveTo(0,r*TILE_SIZE); gc.lineTo(GAME_W,r*TILE_SIZE); gc.stroke();
  }
  // Cursor
  const mc = Math.floor(mouseX/TILE_SIZE);
  const mr = Math.floor(mouseY/TILE_SIZE);
  gc.strokeStyle = '#FFFF00';
  gc.lineWidth = 1;
  gc.strokeRect(mc*TILE_SIZE, mr*TILE_SIZE, TILE_SIZE, TILE_SIZE);
  // Preview tile
  const selTile = TILE_PALETTE[game.editorTile];
  if (selTile && game.editorMode==='place') {
    gc.globalAlpha = 0.5;
    drawSprite(gc, SPRITES[selTile.sprite], mc*TILE_SIZE, mr*TILE_SIZE);
    gc.globalAlpha = 1;
  }
  // Place on click
  if (mouseDown) {
    if (mc>=0&&mc<COLS&&mr>=0&&mr<ROWS) {
      if (game.editorMode==='place') {
        lvl.tiles[mr][mc] = game.editorTile;
      } else if (game.editorMode==='erase') {
        lvl.tiles[mr][mc] = -1;
      }
    }
  }
  // HUD hint
  gc.fillStyle = 'rgba(0,0,0,0.6)';
  gc.fillRect(0,0,GAME_W,10);
  gc.fillStyle = '#FF0000';
  gc.font = '5px "Press Start 2P", monospace';
  gc.fillText('ÉDITEUR — TUILE:'+selTile?.name+' ['+game.editorMode.toUpperCase()+']', 4, 7);
  // Map info
  document.getElementById('mapInfo').textContent = `Carte: ${LEVELS[game.level].id}\nCurseur: ${mc},${mr}`;
}

// ─── BUILD EDITOR PANEL ────────────────────────────────────
function buildEditorPalette() {
  const el = document.getElementById('tilePalette');
  el.innerHTML = '';
  const paletteCanvas = document.createElement('div');
  paletteCanvas.style.display = 'flex';
  paletteCanvas.style.flexWrap = 'wrap';
  for (const t of TILE_PALETTE) {
    const cv = document.createElement('canvas');
    cv.width = 16; cv.height = 16;
    cv.style.width = '32px'; cv.style.height = '32px';
    cv.style.margin = '2px';
    cv.style.cursor = 'pointer';
    cv.style.border = t.id===game.editorTile ? '2px solid #FFFF00' : '2px solid #333';
    cv.style.imageRendering = 'pixelated';
    cv.title = t.name;
    const sp = SPRITES[t.sprite];
    if (sp) {
      const ctx2 = cv.getContext('2d');
      ctx2.imageSmoothingEnabled = false;
      drawSprite(ctx2, sp, 0, 0);
    }
    cv.addEventListener('click', () => {
      game.editorTile = t.id;
      document.querySelectorAll('#tilePalette canvas').forEach((c2,i) => {
        c2.style.border = i===t.id ? '2px solid #FFFF00' : '2px solid #333';
      });
    });
    paletteCanvas.appendChild(cv);
  }
  el.appendChild(paletteCanvas);
}

// ─── MAIN GAME LOOP ────────────────────────────────────────
let lastTime = 0;
let fps = 60;
let fpsTick = 0;
let fpsFrames = 0;

function mainLoop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  game.tick++;
  fpsFrames++;
  fpsTick += dt;
  if (fpsTick >= 500) {
    fps = Math.round(fpsFrames*1000/fpsTick);
    fpsFrames = 0; fpsTick = 0;
    document.getElementById('fpsCounter').textContent = 'FPS:'+fps;
  }

  // Clear message
  if (game.messageTick > 0) {
    game.messageTick--;
    if (game.messageTick <= 0) {
      document.getElementById('messageBox').style.display = 'none';
    }
  }

  if (game.state === 'playing') {
    const lvl = LEVELS[game.level];
    const tiles = lvl.tiles;

    const shaking = applyShake();

    // Clear
    gc.fillStyle = lvl.bgColor;
    gc.fillRect(0,0,GAME_W,GAME_H);

    // Draw world
    drawTilemap(tiles, lvl.bgColor);
    drawPortal(lvl.portal);
    drawItems();
    drawParticles();
    for (const e of enemies) drawEnemy(e);
    drawPlayer();

    if (shaking) gc.restore();

    drawHUD();
    updateFade();

    // Update
    updatePlayer(tiles);
    updateEnemies(tiles);
    updateParticles();

    // Moon change
    if (game.tick % 600 === 0) game.moonPhase = (game.moonPhase+1)%4;

  } else if (game.state === 'editor') {
    updateEditor();
  }

  // Clear justPressed
  for (const k in justPressed) delete justPressed[k];
  justClick = false;

  applyCRT();
  requestAnimationFrame(mainLoop);
}

// ─── INIT ──────────────────────────────────────────────────
function startGame() {
  document.getElementById('titleScreen').style.display = 'none';
  document.getElementById('gameOver').style.display = 'none';
  document.getElementById('winScreen').style.display = 'none';
  game.state = 'playing';
  game.level = 0;
  game.score = 0;
  game.tick = 0;
  player.hp = player.maxHp;
  player.inventory = [];
  player.dead = false;
  player.invincible = 0;
  player.x = 20; player.y = 100;
  // Init all levels
  LEVELS[0].tiles = makeLevel1();
  LEVELS[1].tiles = makeLevel2();
  LEVELS[2].tiles = makeLevel3();
  loadLevel(0);
  game.fadingIn = true;
  game.fadeAlpha = 1;
  showMsg('Bienvenue dans le cimetière !');
}

// ─── UI BUTTONS ────────────────────────────────────────────
document.getElementById('btnPlay').addEventListener('click', startGame);
document.getElementById('titleScreen').addEventListener('click', startGame);
document.getElementById('titleScreen').addEventListener('keydown', ()=>{});
window.addEventListener('keydown', e => {
  if (e.code==='Enter') {
    if (game.state==='title') startGame();
    if (game.state==='gameover') {
      document.getElementById('gameOver').style.display = 'none';
      startGame();
    }
  }
});

document.getElementById('btnEditor').addEventListener('click', () => {
  if (game.state !== 'editor') {
    game.state = 'editor';
    document.getElementById('editorPanel').style.display = 'block';
    document.getElementById('btnEditor').classList.add('active');
    if (!LEVELS[game.level].tiles) LEVELS[game.level].tiles = [makeLevel1, makeLevel2, makeLevel3][game.level]();
    buildEditorPalette();
  } else {
    game.state = 'playing';
    document.getElementById('editorPanel').style.display = 'none';
    document.getElementById('btnEditor').classList.remove('active');
  }
});

document.getElementById('btnCRT').addEventListener('click', () => {
  game.crtEnabled = !game.crtEnabled;
  document.getElementById('btnCRT').classList.toggle('active', game.crtEnabled);
  if (!game.crtEnabled) cc.clearRect(0,0,crtCanvas.width,crtCanvas.height);
});
document.getElementById('btnSound').addEventListener('click', () => {
  game.soundEnabled = !game.soundEnabled;
  document.getElementById('btnSound').classList.toggle('active', game.soundEnabled);
});
document.getElementById('btnHelp').addEventListener('click', () => {
  showMsg('← → BOUGER | Z/SPACE SAUTER | X ATTAQUER | E INVENTAIRE | ENTER UTILISER');
  game.messageTick = 240;
});
document.getElementById('btnPlayAgain').addEventListener('click', startGame);

// Editor mode buttons
['modePlace','modeEnemy','modeItem','modeErase'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    game.editorMode = id.replace('mode','').toLowerCase();
    ['modePlace','modeEnemy','modeItem','modeErase'].forEach(i => {
      document.getElementById(i).classList.toggle('active', i===id);
    });
  });
});

document.getElementById('btnExport').addEventListener('click', () => {
  const lvl = LEVELS[game.level];
  const data = {
    id: lvl.id,
    name: lvl.name,
    tiles: lvl.tiles,
    enemies: enemies.map(e=>({type:e.type,x:Math.round(e.x),y:Math.round(e.y),patrolX:e.patrolX,hp:e.hp})),
    items: items_world.map(i=>({type:i.type,x:Math.round(i.x),y:Math.round(i.y)})),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = lvl.id+'.json'; a.click();
  URL.revokeObjectURL(url);
  showMsg('Carte exportée !');
});

document.getElementById('btnNewMap').addEventListener('click', () => {
  if (confirm('Créer une nouvelle carte vide ?')) {
    LEVELS[game.level].tiles = makeEmptyMap();
    showMsg('Nouvelle carte vide créée.');
  }
});

document.getElementById('btnImport').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.tiles) LEVELS[game.level].tiles = data.tiles;
        if (data.enemies) spawnEnemies(game.level); // reload
        showMsg('Carte importée !');
      } catch(err) { showMsg('Erreur JSON !'); }
    };
    reader.readAsText(file);
  };
  input.click();
});

// ─── LAUNCH ────────────────────────────────────────────────
resizeGame();
buildCRT();
requestAnimationFrame(mainLoop);
