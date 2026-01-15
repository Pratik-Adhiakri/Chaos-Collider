//lets start the js now 
//lets declare 99999 const and variable 
const scoretext = document.getElementById('score-display');
const livestext = document.getElementById('lives-display');
const startscreen = document.getElementById('start-screen');
const gameoverscreen = document.getElementById('game-over');
const statuslabel = document.getElementById('status-text');
const finalscore = document.getElementById('final-score');
const canvas = document.getElementById('game-canvas');
const historylist = document.getElementById('history-list');
const ctx = canvas.getContext('2d');
const SETTINGS ={
    paddlew: 120,
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
    color: SETTINGS.palette[1],
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
            spawnparticles(this.x, this.y, this.color, 5);
        }
        if(this.y< this.radius){
            this.dy *= -1;
        }
        if(
            this.y + this.radius> paddle.y &&
            this.x > paddle.x &&
            this.x < paddle.x + paddle.width &&
            this.dy>0
        ){
            const offset = (this.x- (paddle.x+ paddle.width/2))/ (paddle.width/2);
            this.dx = offset *7;
            this.dy = -Math.abs(this.dy);
            screenshake = 6;
        }
    }
    //jst tired
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
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
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
            boxs[r][c]= new Box(x, y,r);
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
            gameoverscreen.classList.remove('hidden');
            finalscore.innerText = score;
            saveToHistory(score);
        } else{
            balls.push(new Ball());
        }
    }
    boxs.flat().forEach(box =>{
        if(!box.alive) return;
        balls.forEach(ball=>{
            //such a drag
            if(ball.x> box.x &&
                ball.x< box.x + box.w &&
                ball.y > box.y &&
                ball.y < box.y + box.h
            ){
                box.alive = false;
                ball.dy *= -1;
                score += box.points;
                spawnparticles(box.x + box.w/2, box.y + box.h/2, box.color, 12);
            }
        });
    });
    scoretext.innerText = `SCORE: ${score.toString().padStart(5, '0')}`;
    livestext.innerText = `LIVES: ${lives}`;
    if(screenshake > 0) screenshake--;
}
//aalmost done last functions left
function draw(){
    ctx.save();
    if(screenshake > 0){
        ctx.translate(Math.random()* 8 -4, Math.random()* 8 - 4);
    }
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    ctx.fillStyle = paddle.color;
    ctx.shadowBlur = paddle.glow;
    ctx.shadowColor = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
    balls.forEach(b => b.draw());

    boxs.flat().forEach(b=>b.draw());
    particles.forEach((p, i)=>{
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        if(p.life<=0) particles.splice(i,1);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x,p.y,3,3);
        ctx.globalAlpha = 1;
    });
    ctx.restore();
    update();
    requestAnimationFrame(draw);
}
function saveToHistory(newScore){
    let history = JSON.parse(localStorage.getItem('colliderHistory'))||[];
    const entry ={
        score: newScore,
        date: new Date().toLocaleDateString()
    };
    history.push(entry);
    history.sort((a,b)=>b.score - a.score);
    history= history.slice(0, 5);
    localStorage.setItem('colliderHistory', JSON.stringify(history));
    displayHistory();
}
function displayHistory(){
    const history = JSON.parse(localStorage.getItem('colliderHistory'))||[];
    historylist.innerHTML= history.map(item => `<li><span>${item.date}</span> <span>${item.score}</span></li>`).join('');
}
function startgame(){
    score = 0;
    lives = 3;
    state ='PLAYING';
    balls = [new Ball()];
    buildboxes();
    startscreen.classList.add('hidden');
    gameoverscreen.classList.add('hidden');
}
document.getElementById('start-button').addEventListener('click', startgame);
document.getElementById('restart-btn').addEventListener('click', startgame);
console.log('Begin the Game lets see if you can beat the whole game.');
draw();
//finally done YAY 
