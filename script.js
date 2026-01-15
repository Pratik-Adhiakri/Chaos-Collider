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
//new and cool features is coking
const POWERUPS= {
    MULTIBALL: {color: '#fff', label:'+++', chance:0.3},
    BIGPADDLE: {color: '#00ffff', label:'<-->', chance: 0.4},
    SCORE_X2: { color: '#ff00ff', label: '$$$', chance: 0.3}
};

//let stuffs
let score = 0;
let lives = 3;
let state = 'START';
let balls = [];
let boxs = [];
let particles = [];
let drops = [];
let dropTimer = 0;
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
class Drop{
    constructor(x, y, type){
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 30;
        this.height = 20;
        this.speed = 7;
    }
    update(){
        this.y += this.speed;
        if(this.y + this.height > paddle.y && this.x>paddle.x && this.x<paddle.x + paddle.width){
            this.applyEffect();
            return true;
        }
        return this.y>canvas.height;
    }
    draw(){
        ctx.save();
        this.speed = 4.5;
        ctx.strokeStyle = this.type.color;
        ctx.lineWidth = 2;
        //making the style better because it sucked before
        ctx.strokeRect(this.x - 20, this.y - 10,40,20);
        ctx.fillStyle = "rgba(0,0,0,0.8";
        ctx.fillRect(this.x-20, this.y -10,40,20);
        ctx.fillStyle = this.type.color;
        ctx.font = "bold 14px 'Courier New'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.type.label, this.x, this.y);
    
    ctx.restore()
    }
    applyEffect(){
        //tongyu told me add cool features to the game so here i am putting it
        if(this.type === POWERUPS.MULTIBALL){
            balls.push(new Ball(paddle.x + paddle.width/2, paddle.y -10,-4,-6));
            balls.push(new Ball(paddle.x + paddle.width/2, paddle.y - 10,4,-6));
            balls.forEach(b=> b.attached = false);
        }else if(this.type ===POWERUPS.BIGPADDLE){
            paddle.width = 250;
            setTimeout(()=> paddle.width = SETTINGS.paddlew, 8000);
        } else if(this.type === POWERUPS.SCORE_X2){
            score += 500;
            screenshake = 20;
        }
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
function update() {//had to renovate this function totally for the fing powerups to work nicely :heavysob
    if (state !== 'PLAYING') return;

    dropTimer++;
    if (dropTimer > 60) { 
        dropTimer = 0;
        const aliveBoxes = boxs.flat().filter(b => b.alive);
        if (aliveBoxes.length > 0) {
            const randomBox = aliveBoxes[Math.floor(Math.random() * aliveBoxes.length)];
            const types = Object.values(POWERUPS);
            const randomType = types[Math.floor(Math.random() * types.length)];
            drops.push(new Drop(randomBox.x + randomBox.w / 2, randomBox.y, randomType));
        }
    }

    drops = drops.filter(drop => !drop.update());

    balls.forEach((ball, i) => {
        ball.update();
        if (ball.y - ball.radius > canvas.height) {
            balls.splice(i, 1);
        }
    });

    if (balls.length === 0) {
        lives--;
        if (lives <= 0) {
            state = 'OVER';
            gameoverscreen.classList.remove('hidden');
            finalscore.innerText = score;
            saveToHistory(score);
        } else {
            paddle.targetwidth = SETTINGS.paddlew; 
            balls.push(new Ball());
        }
    }

    boxs.flat().forEach(box => {
        if (!box.alive) return;
        balls.forEach(ball => {
            //such a drag
            if (ball.x > box.x &&
                ball.x < box.x + box.w &&
                ball.y > box.y &&
                ball.y < box.y + box.h
            ) {
                box.alive = false;
                ball.dy *= -1;
                score += box.points;
                spawnparticles(box.x + box.w / 2, box.y + box.h / 2, box.color, 12);
                screenshake = 4;
            }
        });
    });

    scoretext.innerText = `SCORE: ${score.toString().padStart(5, '0')}`;
    livestext.innerText = `LIVES: ${lives}`;

    paddle.width += (paddle.targetwidth - paddle.width) * 0.1;
    
    if (screenshake > 0) screenshake--;
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
    drops.forEach(d=>d.draw());
    requestAnimationFrame(draw);
}
function saveToHistory(newScore){
    let history = JSON.parse(localStorage.getItem('colliderHistory'))||[];
    history.push({score: newScore, date: new Date().toLocaleTimeString()});
    history.sort((a,b)=> b.score - a.score);
    history = history.slice(0,5);
    localStorage.setItem('colliderHistory', JSON.stringify(history));

    historylist.innerHTML = history.map(h=> `<li><span>${h.date}</span> <span>${h.score}</span></li>`).join('');
}

function startgame(){
    score = 0;
    lives = 3;
    state ='PLAYING';
    balls = [new Ball()];
    buildboxes();
    startscreen.classList.add('hidden');
    gameoverscreen.classList.add('hidden');
    drops = [];
}
document.getElementById('start-button').addEventListener('click', startgame);
document.getElementById('restart-btn').addEventListener('click', startgame);
console.log('Begin the Game lets see if you can beat the whole game.');
draw();
//finally done YAY 
