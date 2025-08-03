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
        this.leftPlayerDisplay = document.getElementById('leftPlayerDisplay');
        this.rightPlayerDisplay = document.getElementById('rightPlayerDisplay');
        this.leftPlayerInput = document.getElementById('leftPlayerName');
        this.rightPlayerInput = document.getElementById('rightPlayerName');

        // 游戏状态
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        
        // 玩家名字
        this.leftPlayerName = '小鹏友';
        this.rightPlayerName = '唐林';
        
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
        this.ballSize = 15; // 增大球的尺寸
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: 3,
            dy: 2,
            size: this.ballSize,
            baseSpeed: 3,
            trail: [], // 拖尾效果
            color: this.getRandomBrightColor() // 随机鲜艳颜色
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
        
        // 音效
        this.pingSound = new Audio('sound/ping.wav');
        this.pingSound.volume = 0.8; // 设置音量较大
        this.backgroundMusic = new Audio('sound/Combat02.mp3');
        this.backgroundMusic.volume = 0.6;
        this.backgroundMusic.loop = true; // 循环播放
        
        // 像素小人
        this.leftCharacter = {
            x: 10,
            y: this.canvas.height / 2,
            width: 20,
            height: 30,
            animationFrame: 0,
            animationSpeed: 0.2
        };
        
        this.rightCharacter = {
            x: this.canvas.width - 30,
            y: this.canvas.height / 2,
            width: 20,
            height: 30,
            animationFrame: 0,
            animationSpeed: 0.2
        };
        
        // 得分动画
        this.scoreAnimation = {
            active: false,
            text: '',
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 120, // 帧数
            currentFrame: 0
        };
        
        this.initEventListeners();
    }
    
    getRandomBrightColor() {
        const colors = [
            '#FF6B6B', // 亮红色
            '#4ECDC4', // 青绿色
            '#45B7D1', // 天蓝色
            '#96CEB4', // 薄荷绿
            '#FFEAA7', // 柠檬黄
            '#DDA0DD', // 紫色
            '#FFB74D', // 橙色
            '#F06292', // 粉红色
            '#81C784', // 浅绿色
            '#FFD54F'  // 金黄色
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    drawPixelCharacter(character, isLeft) {
        const ctx = this.ctx;
        const x = character.x;
        const y = character.y;
        
        // 简单的像素小人（8x8像素风格）
        ctx.fillStyle = isLeft ? '#FF6B6B' : '#4ECDC4'; // 左边红色，右边青色
        
        // 头部 (2x2)
        ctx.fillRect(x + 4, y - 15, 2, 2);
        ctx.fillRect(x + 6, y - 15, 2, 2);
        ctx.fillRect(x + 4, y - 13, 2, 2);
        ctx.fillRect(x + 6, y - 13, 2, 2);
        
        // 身体 (2x4)
        ctx.fillRect(x + 5, y - 11, 2, 8);
        
        // 手臂 (动态)
        const armOffset = Math.sin(character.animationFrame) * 2;
        ctx.fillRect(x + 2, y - 8 + armOffset, 2, 2); // 左手
        ctx.fillRect(x + 8, y - 8 - armOffset, 2, 2); // 右手
        
        // 腿部 (动态)
        const legOffset = Math.sin(character.animationFrame + Math.PI) * 1;
        ctx.fillRect(x + 3, y + 3 + legOffset, 2, 4); // 左腿
        ctx.fillRect(x + 7, y + 3 - legOffset, 2, 4); // 右腿
        
        // 更新动画帧
        character.animationFrame += character.animationSpeed;
    }
    
    triggerScoreAnimation(playerName, side) {
        this.scoreAnimation.active = true;
        this.scoreAnimation.currentFrame = 0;
        this.scoreAnimation.text = `${playerName} 得分!`;
        this.scoreAnimation.x = side === 'left' ? this.canvas.width / 4 : this.canvas.width * 3 / 4;
        this.scoreAnimation.y = this.canvas.height / 2;
        this.scoreAnimation.opacity = 1;
        this.scoreAnimation.scale = 1;
    }
    
    updateScoreAnimation() {
        if (!this.scoreAnimation.active) return;
        
        this.scoreAnimation.currentFrame++;
        
        // 动画效果：放大然后淡出
        if (this.scoreAnimation.currentFrame < 30) {
            // 前30帧放大
            this.scoreAnimation.scale = 1 + (this.scoreAnimation.currentFrame / 30) * 0.5;
        } else {
            // 后90帧淡出
            this.scoreAnimation.opacity = 1 - ((this.scoreAnimation.currentFrame - 30) / 90);
            this.scoreAnimation.y -= 1; // 向上飘移
        }
        
        // 检查动画是否结束
        if (this.scoreAnimation.currentFrame >= this.scoreAnimation.duration) {
            this.scoreAnimation.active = false;
        }
    }
    
    drawScoreAnimation() {
        if (!this.scoreAnimation.active) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = this.scoreAnimation.opacity;
        this.ctx.fillStyle = '#FFD700'; // 金色
        this.ctx.font = `bold ${24 * this.scoreAnimation.scale}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        
        // 描边文字
        this.ctx.strokeText(this.scoreAnimation.text, this.scoreAnimation.x, this.scoreAnimation.y);
        this.ctx.fillText(this.scoreAnimation.text, this.scoreAnimation.x, this.scoreAnimation.y);
        
        this.ctx.restore();
    }
    
    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (this.gameState === 'start' && e.key === ' ') {
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
        // 获取玩家名字
        this.leftPlayerName = this.leftPlayerInput.value.trim() || '小鹏友';
        this.rightPlayerName = this.rightPlayerInput.value.trim() || '唐林';
        
        // 更新显示
        this.leftPlayerDisplay.textContent = this.leftPlayerName;
        this.rightPlayerDisplay.textContent = this.rightPlayerName;
        
        this.gameState = 'playing';
        this.startScreen.style.display = 'none';
        this.gameUI.style.display = 'block';
        this.gameStartTime = Date.now();
        
        // 播放背景音乐
        this.backgroundMusic.play().catch(e => console.log('音乐播放失败:', e));
        
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
        this.ball.color = this.getRandomBrightColor(); // 重新游戏时也更换颜色
        
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
        
        // 停止背景音乐
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
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
        
        // 更新小人位置跟随球拍
        this.leftCharacter.y = this.leftPaddle.y + this.leftPaddle.height / 2;
        this.rightCharacter.y = this.rightPaddle.y + this.rightPaddle.height / 2;
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
            
            // 播放击球音效
            this.pingSound.currentTime = 0; // 重置播放位置以便快速连续播放
            this.pingSound.play().catch(e => console.log('音效播放失败:', e));
            
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
            
            // 播放击球音效
            this.pingSound.currentTime = 0; // 重置播放位置以便快速连续播放
            this.pingSound.play().catch(e => console.log('音效播放失败:', e));
            
            // 根据击中位置调整角度
            let hitPos = (this.ball.y - this.rightPaddle.y) / this.rightPaddle.height;
            this.ball.dy = (hitPos - 0.5) * 8;
        }
        
        // 得分检测
        if (this.ball.x < 0) {
            this.triggerOutOfBoundsAnimation('left');
            this.rightScore++;
            this.triggerScoreAnimation(this.rightPlayerName, 'right');
            this.resetBall();
        } else if (this.ball.x > this.canvas.width) {
            this.triggerOutOfBoundsAnimation('right');
            this.leftScore++;
            this.triggerScoreAnimation(this.leftPlayerName, 'left');
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
        this.ball.color = this.getRandomBrightColor(); // 每次重置都更换颜色
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
        
        // 停止背景音乐
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
        
        if (this.leftScore >= this.winningScore) {
            this.winnerText.textContent = `${this.leftPlayerName}获胜！`;
        } else {
            this.winnerText.textContent = `${this.rightPlayerName}获胜！`;
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
        
        // 绘制像素小人
        this.drawPixelCharacter(this.leftCharacter, true);
        this.drawPixelCharacter(this.rightCharacter, false);
        
        // 绘制球的拖尾效果
        for (let i = 0; i < this.ball.trail.length; i++) {
            let alpha = (i + 1) / this.ball.trail.length * 0.8;
            this.ctx.fillStyle = this.ball.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            let size = this.ball.size * alpha;
            this.ctx.arc(this.ball.trail[i].x, this.ball.trail[i].y, size / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 绘制球（圆形）
        this.ctx.fillStyle = this.ball.color;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 添加球的光芒效果
        this.ctx.save();
        this.ctx.shadowColor = this.ball.color;
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // 绘制出界动画
        this.drawOutOfBoundsAnimation();
        
        // 绘制得分动画
        this.drawScoreAnimation();
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
            this.updateScoreAnimation(); // 更新得分动画
            this.updateScore(); // 实时更新计分板和时间
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// 初始化游戏
const game = new PingPongGame();