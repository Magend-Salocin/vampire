
class Inventory{
 constructor(){this.items=[];}
 add(item){this.items.push(item);}
}
class Player{
 constructor(){this.x=100;this.y=220;this.life=100;}
 draw(ctx){
   ctx.fillStyle='yellow';
   ctx.fillRect(this.x,this.y,16,24);
 }
}
class Monster{
 constructor(x,y){this.x=x;this.y=y;}
 draw(ctx){
   ctx.fillStyle='red';
   ctx.fillRect(this.x,this.y,16,16);
 }
}
class Screen{
 constructor(){
   this.monsters=[new Monster(300,220)];
 }
 draw(ctx){
   ctx.fillStyle='#00ff00';
   ctx.fillRect(0,260,640,20);
   this.monsters.forEach(m=>m.draw(ctx));
 }
}
const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
const player=new Player();
const screen=new Screen();

window.addEventListener('keydown',e=>{
 if(e.key==='ArrowLeft') player.x-=5;
 if(e.key==='ArrowRight') player.x+=5;
});

function loop(){
 ctx.fillStyle='black';
 ctx.fillRect(0,0,640,400);

 // HUD
 ctx.strokeStyle='white';
 ctx.strokeRect(20,10,260,8);
 ctx.fillStyle='red';
 ctx.fillRect(20,10,player.life*2.6,8);

 screen.draw(ctx);
 player.draw(ctx);

 requestAnimationFrame(loop);
}
loop();
