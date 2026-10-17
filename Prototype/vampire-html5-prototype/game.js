
const hero = document.getElementById('hero');

let x = 50;
let frame = 0;
const frames = ['frame1','frame2','frame3','frame4'];

function render(){
    hero.className = frames[frame];
    frame = (frame + 1) % frames.length;
}
setInterval(render,150);
render();

window.addEventListener('keydown',(e)=>{
    if(e.key==='ArrowRight') x+=8;
    if(e.key==='ArrowLeft') x-=8;
    hero.style.left=x+'px';
});
