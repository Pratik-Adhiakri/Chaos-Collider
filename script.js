//lets start the js 
//lets declare 99999 const and variable
const scoretext = document.getElementById('score-display');
const livestext = document.getElementById('lives-display');
const startscreen = document.getElementById('start-screen');
const gameoverscreen = document.getElementById('game-over');
const statuslabel = document.getElementById('status-text');
const finalscore = document.getElementById('final-score');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');//ctx is the GOAT
const SETTINGS ={
    padlew: 120,
    paddleh:15,
    ballsize:8,
    rows:7,
    cols:10,//cr7 and messi
    boxgap:10,
    boxtop:50,
    boxleft:35,
    boxw:65,//or bricks? idk
    boxh:25,
    palette: ['#ff00ff', '#00ffff', '#bc13fe', '#ff0055', '#00ff00']
};

//let stuffs
let score = 0;
let lives = 3;
let state = 'START';
let balls = [];
let boxs = [];
let particles = [];
let drops = [];
let screenshake = 0;
let paddle = {
    x: canvas.width/2 - SETTINGS.paddlew/2,
    y: canvas.height - 40,
    width: SETTINGS.paddlew,
    height: SETTINGS.paddleh,
    targetwidth: SETTINGS.paddlew,
    color: SETTINGS.palette[1],//thats the benefit of devlaring all stuffs up
    glow:15
};
//now lets do the real code aprt of declaring stuffs
class Ball{
    constructor(x, y, dx, dy){
        this.x = x ?? canvas.width/2;
        this.y = y ?? canvas.height- 60;
        this.dx = dx ?? (Math.random()-0.5)*8;
        this.dy = dy?? -6;
        this.radius = SETTINGS.ballsize;
        this.attached = true;
        this.color = '#fff';
    }
    update(){
        if(this.attached){
            this.x = paddle.x + paddle.width/2;
            this.y = paddle.y- this.radius;
            return;
        }
        this.x+= this.dx;
        this.y += this.dy;
        if(this.x < this.radius || this.x>canvas.width - this.radius){
            this.dx *= -1;
            spawnParticles(this.x, this.y, this.color, 5);
        }
        if(this.y< this.radius){
            this.dy *= -1;
        }
        if(
            this.y + this.radius> paddle.y &&
            this.x > paddle.x &&
            this.x, paddle.x = paddle.width &&
            this.dy>0//look how much formated the code is
        ){
            const offset = (this.x- (paddle.x+ paddle.width/2))/ (paddle.width/2);
            this.dx = offset *7;
            this.dy = -Math.abs(this.dy);
            screenshake = 6;
        }
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI *2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}
class Box{
    constructor(x,y,row){
        this.x = x;
        this.y = y;
        this.w = SETTINGS.boxw;
        this.h = SETTINGS.boxh;
        this.alive = true;
        this.color = SETTINGS.palette[row%SETTINGS.palette.length];
        this.points= (SETTINGS.rows- row)* 10;
    }
    draw(){
        if(!this.alive) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w ,this.h);
        ctx.strokeStyle = 'rgba(255,255,255,0.3';
        ctx.strokeRect(this.x+ 2, this.y+2, this.w -4, this.h-4);
    }
}
function buildboxes(){
    boxs = [];
    for(let r= 0; r<SETTINGS.rows; r++){
        boxs[r]= [];
        for(let c=0;c<SETTINGS.cols; c++){
            const x= c*(SETTINGS.boxw + SETTINGS.boxgap) + SETTINGS.boxleft;
            const y = r * (SETTINGS.boxh + SETTINGS.boxgap ) + SETTINGS.boxtop;
            boxs[r][c]= new brick(x, y,r);
        }
    }
}
function spawnparticles(x,y,color,amt){
    for(let i=0;i<amt;i++){
        particles.push({
                x,
                y,
                vx:(Math.random()-0.5)* 8,
                vy: (Math.random()-0.5) * 8,
                life:1,
                color
        });
    }
}
window.addEventListener('mousemove', e=>{
    const rect= canvas.getBoundingClientRect();
    paddle.x= e.clientX - rect.left- paddle.width/2;
    if(paddle.x< 0) paddle.x = 0;
    if(paddle.x + paddle.width> canvas.width){
        paddle.x = canvas.width - paddle.width;
    }
});

window.addEventListener('mousedown', ()=>{
    if(state !== 'PLAYING') return;
    balls.forEach(b=>{
        if(b.attached){
            b.attached = false;
            b.dy= -8;
        }
    });
});
function update(){
    if(state !=='PLAYING') return;
    balls.forEach((ball, i)=>{
        ball.update();
        if(ball.y- ball.radius > canvas.height){
            balls.splice(i, 1);
        }
    });
    if(balls.length ===0){
        lives--;
        if(lives<=0){
            state = 'OVER';
            status.Label.innerText = 'GAME OVER YoU ARE A LOSER';
            gameOverBox.classList.remove('hidden');
            finalscore.innerText = score;
        } else{
            balls.push(new Ball());
        }
    }
    
}
