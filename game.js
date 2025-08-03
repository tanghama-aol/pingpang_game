class PingPongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startScreen = document.getElementById('startScreen');
        this.gameUI = document.getElementById('gameUI');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.leftScoreDisplay = document.getElementById('leftScore');
        this.rightScoreDisplay = document.getElementById('rightScore');
        this.gameTimeDisplay = document.getElementById('gameTime');
        this.winnerText = document.getElementById('winnerText');
        this.finalScore = document.getElementById('finalScore');

        // 游戏状态
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        
        // 球拍属性
        this.paddleWidth = 10;
        this.paddleHeight = 80;
        this.paddleSpeed = 5;
        
        // 左侧球拍
        this.leftPaddle = {
            x: 20,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: this.paddleSpeed
        };
        
        // 右侧球拍
        this.rightPaddle = {
            x: this.canvas.width - 30,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: this.paddleSpeed
        };
        
        // 球属性
        this.ballSize = 10;
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: 3,
            dy: 2,
            size: this.ballSize,
            baseSpeed: 3,
            trail: [] // 拖尾效果
        };
        
        // 出界动画
        this.outOfBoundsAnimation = {
            active: false,
            particles: [],
            duration: 60, // 帧数
            currentFrame: 0
        };
        
        // 分数
        this.leftScore = 0;
        this.rightScore = 0;
        this.winningScore = 10;
        
        // 按键状态
        this.keys = {};
        
        // 游戏时间
        this.gameStartTime = 0;
        this.currentGameTime = 0;
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (this.gameState === 'start') {
                this.startGame();
            } else if (this.gameState === 'gameOver') {
                if (e.key.toLowerCase() === 'r') {
                    this.resetGame();
                } else if (e.key === 'Escape') {
                    this.exitGame();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.startScreen.style.display = 'none';
        this.gameUI.style.display = 'block';
        this.gameStartTime = Date.now();
        this.updateScore();
        this.gameLoop();
    }
    
    resetGame() {
        this.leftScore = 0;
        this.rightScore = 0;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = this.ball.baseSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ball.baseSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.trail = [];
        
        this.leftPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.rightPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        
        this.gameOverScreen.style.display = 'none';
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.updateScore();
        this.gameLoop();
    }
    
    exitGame() {
        this.gameState = 'start';
        this.gameOverScreen.style.display = 'none';
        this.startScreen.style.display = 'block';
        this.gameUI.style.display = 'none';
    }
    
    updatePaddles() {
        // 左侧球拍控制 (A/Z)
        if (this.keys['a'] && this.leftPaddle.y > 0) {
            this.leftPaddle.y -= this.leftPaddle.speed;
        }
        if (this.keys['z'] && this.leftPaddle.y < this.canvas.height - this.leftPaddle.height) {
            this.leftPaddle.y += this.leftPaddle.speed;
        }
        
        // 右侧球拍控制 (上下箭头)
        if (this.keys['arrowup'] && this.rightPaddle.y > 0) {
            this.rightPaddle.y -= this.rightPaddle.speed;
        }
        if (this.keys['arrowdown'] && this.rightPaddle.y < this.canvas.height - this.rightPaddle.height) {
            this.rightPaddle.y += this.rightPaddle.speed;
        }
    }
    
    updateBall() {
        // 更新球的拖尾
        this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
        if (this.ball.trail.length > 15) {
            this.ball.trail.shift();
        }
        
        // 移动球
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // 上下边界碰撞
        if (this.ball.y <= this.ball.size || this.ball.y >= this.canvas.height - this.ball.size) {
            this.ball.dy = -this.ball.dy;
        }
        
        // 左侧球拍碰撞检测
        if (this.ball.x - this.ball.size <= this.leftPaddle.x + this.leftPaddle.width &&
            this.ball.x + this.ball.size >= this.leftPaddle.x &&
            this.ball.y >= this.leftPaddle.y &&
            this.ball.y <= this.leftPaddle.y + this.leftPaddle.height) {
            
            this.ball.dx = -this.ball.dx;
            this.increaseBallSpeed();
            
            // 根据击中位置调整角度
            let hitPos = (this.ball.y - this.leftPaddle.y) / this.leftPaddle.height;
            this.ball.dy = (hitPos - 0.5) * 8;
        }
        
        // 右侧球拍碰撞检测
        if (this.ball.x + this.ball.size >= this.rightPaddle.x &&
            this.ball.x - this.ball.size <= this.rightPaddle.x + this.rightPaddle.width &&
            this.ball.y >= this.rightPaddle.y &&
            this.ball.y <= this.rightPaddle.y + this.rightPaddle.height) {
            
            this.ball.dx = -this.ball.dx;
            this.increaseBallSpeed();
            
            // 根据击中位置调整角度
            let hitPos = (this.ball.y - this.rightPaddle.y) / this.rightPaddle.height;
            this.ball.dy = (hitPos - 0.5) * 8;
        }
        
        // 得分检测
        if (this.ball.x < 0) {
            this.triggerOutOfBoundsAnimation('left');
            this.rightScore++;
            this.resetBall();
        } else if (this.ball.x > this.canvas.width) {
            this.triggerOutOfBoundsAnimation('right');
            this.leftScore++;
            this.resetBall();
        }
        
        // 检查胜利条件
        if (this.leftScore >= this.winningScore || this.rightScore >= this.winningScore) {
            this.endGame();
        }
    }
    
    increaseBallSpeed() {
        // 每次碰撞后略微增加球速
        let speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
        if (speed < 8) { // 限制最大速度
            this.ball.dx *= 1.05;
            this.ball.dy *= 1.05;
        }
    }
    
    triggerOutOfBoundsAnimation(side) {
        this.outOfBoundsAnimation.active = true;
        this.outOfBoundsAnimation.currentFrame = 0;
        this.outOfBoundsAnimation.particles = [];
        
        // 创建粒子效果
        let x = side === 'left' ? 0 : this.canvas.width;
        let y = this.ball.y;
        
        for (let i = 0; i < 20; i++) {
            this.outOfBoundsAnimation.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                size: 3 + Math.random() * 4
            });
        }
    }
    
    updateOutOfBoundsAnimation() {
        if (!this.outOfBoundsAnimation.active) return;
        
        this.outOfBoundsAnimation.currentFrame++;
        
        // 更新粒子
        for (let particle of this.outOfBoundsAnimation.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98; // 阻力
            particle.vy *= 0.98;
            particle.life -= particle.decay;
        }
        
        // 移除生命值耗尽的粒子
        this.outOfBoundsAnimation.particles = this.outOfBoundsAnimation.particles.filter(p => p.life > 0);
        
        // 检查动画是否结束
        if (this.outOfBoundsAnimation.currentFrame >= this.outOfBoundsAnimation.duration) {
            this.outOfBoundsAnimation.active = false;
        }
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = this.ball.baseSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ball.baseSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.trail = [];
        this.updateScore();
    }
    
    updateScore() {
        this.leftScoreDisplay.textContent = this.leftScore;
        this.rightScoreDisplay.textContent = this.rightScore;
        
        // 更新游戏时间
        if (this.gameState === 'playing') {
            this.currentGameTime = Date.now() - this.gameStartTime;
            let minutes = Math.floor(this.currentGameTime / 60000);
            let seconds = Math.floor((this.currentGameTime % 60000) / 1000);
            this.gameTimeDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    endGame() {
        this.gameState = 'gameOver';
        this.gameUI.style.display = 'none';
        this.gameOverScreen.style.display = 'block';
        
        if (this.leftScore >= this.winningScore) {
            this.winnerText.textContent = '小朋友获胜！';
        } else {
            this.winnerText.textContent = '唐林获胜！';
        }
        
        this.finalScore.textContent = `最终比分：${this.leftScore} - ${this.rightScore}`;
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制中线
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 绘制球拍
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, this.leftPaddle.width, this.leftPaddle.height);
        this.ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, this.rightPaddle.width, this.rightPaddle.height);
        
        // 绘制球的拖尾效果
        for (let i = 0; i < this.ball.trail.length; i++) {
            let alpha = (i + 1) / this.ball.trail.length * 0.8;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            let size = this.ball.size * alpha;
            this.ctx.fillRect(
                this.ball.trail[i].x - size / 2,
                this.ball.trail[i].y - size / 2,
                size,
                size
            );
        }
        
        // 绘制球
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(
            this.ball.x - this.ball.size / 2,
            this.ball.y - this.ball.size / 2,
            this.ball.size,
            this.ball.size
        );
        
        // 添加球的光芒效果
        this.ctx.shadowColor = '#fff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(
            this.ball.x - this.ball.size / 2,
            this.ball.y - this.ball.size / 2,
            this.ball.size,
            this.ball.size
        );
        this.ctx.shadowBlur = 0;
        
        // 绘制出界动画
        this.drawOutOfBoundsAnimation();
    }
    
    drawOutOfBoundsAnimation() {
        if (!this.outOfBoundsAnimation.active) return;
        
        // 绘制粒子
        for (let particle of this.outOfBoundsAnimation.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = '#ff6666'; // 红色粒子表示出界
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // 绘制出界文字效果
        if (this.outOfBoundsAnimation.currentFrame < 30) {
            this.ctx.save();
            this.ctx.globalAlpha = 1 - (this.outOfBoundsAnimation.currentFrame / 30);
            this.ctx.fillStyle = '#ff4444';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('出界!', this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.ctx.restore();
        }
    }
    
    gameLoop() {
        if (this.gameState === 'playing') {
            this.updatePaddles();
            this.updateBall();
            this.updateOutOfBoundsAnimation();
            this.updateScore(); // 实时更新计分板和时间
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// 初始化游戏
const game = new PingPongGame();