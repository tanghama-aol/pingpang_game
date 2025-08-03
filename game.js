class PingPongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startScreen = document.getElementById('startScreen');
        this.gameUI = document.getElementById('gameUI');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.leftScoreDisplay = document.getElementById('leftScore');
        this.rightScoreDisplay = document.getElementById('rightScore');
        this.leftBonusScoreDisplay = document.getElementById('leftBonusScore');
        this.rightBonusScoreDisplay = document.getElementById('rightBonusScore');
        this.gameTimeDisplay = document.getElementById('gameTime');
        this.winnerText = document.getElementById('winnerText');
        this.finalScore = document.getElementById('finalScore');
        this.leftPlayerDisplay = document.getElementById('leftPlayerDisplay');
        this.rightPlayerDisplay = document.getElementById('rightPlayerDisplay');
        this.leftPlayerInput = document.getElementById('leftPlayerName');
        this.rightPlayerInput = document.getElementById('rightPlayerName');
        this.tableSizeSelect = document.getElementById('tableSize');
        this.backgroundSelect = document.getElementById('background');
        this.detailedStats = document.getElementById('detailedStats');
        this.totalScores = document.getElementById('totalScores');
        this.regularScores = document.getElementById('regularScores');
        this.bonusScores = document.getElementById('bonusScores');
        this.gameDuration = document.getElementById('gameDuration');

        // 游戏状态
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.showDetailedStats = false; // 是否显示详细统计
        
        // 台球桌配置
        this.tableSizes = {
            standard: { width: 800, height: 400 },
            large: { width: 1000, height: 500 }
        };
        this.currentTableSize = 'standard';
        
        // 背景配置
        this.backgrounds = {
            classic: { base: '#0a4a1a', pattern: null },
            dark: { base: '#1a1a1a', pattern: 'dots' },
            blue: { base: '#1a3a5a', pattern: 'lines' },
            wood: { base: '#8B4513', pattern: 'wood' },
            neon: { base: '#0a0a2a', pattern: 'grid' }
        };
        this.currentBackground = 'classic';
        
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
        this.leftBonusScore = 0; // 奖励分数
        this.rightBonusScore = 0; // 奖励分数
        this.winningScore = 21;
        
        // 像素苹果
        this.apple = {
            active: false,
            x: 0,
            y: 0,
            size: 12,
            spawnTimer: 0,
            spawnInterval: 600 + Math.random() * 1200, // 10-30秒随机生成
            blinkTimer: 0,
            visible: true
        };
        
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
        
        // 像素小人（俯视角，位于桌子外面）
        this.leftCharacter = {
            x: -40, // 放到画布外面
            y: this.canvas.height / 2,
            width: 30,
            height: 40,
            animationFrame: 0,
            animationSpeed: 0.15
        };
        
        this.rightCharacter = {
            x: this.canvas.width + 10, // 放到画布外面
            y: this.canvas.height / 2,
            width: 30,
            height: 40,
            animationFrame: 0,
            animationSpeed: 0.15
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
        this.initializeTableSize();
    }
    
    initializeTableSize() {
        const tableSize = this.tableSizes[this.currentTableSize];
        this.canvas.width = tableSize.width;
        this.canvas.height = tableSize.height;
        
        // 重新计算游戏元素位置
        this.updateGameElementsPosition();
    }
    
    updateGameElementsPosition() {
        const tableSize = this.tableSizes[this.currentTableSize];
        
        // 更新球拍位置
        this.leftPaddle.y = tableSize.height / 2 - this.paddleHeight / 2;
        this.rightPaddle.x = tableSize.width - 30;
        this.rightPaddle.y = tableSize.height / 2 - this.paddleHeight / 2;
        
        // 更新球的位置
        this.ball.x = tableSize.width / 2;
        this.ball.y = tableSize.height / 2;
        
        // 更新小人位置
        this.rightCharacter.x = tableSize.width + 10;
        this.leftCharacter.y = tableSize.height / 2;
        this.rightCharacter.y = tableSize.height / 2;
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
    
    spawnApple() {
        if (!this.apple.active) {
            // 随机位置生成苹果，避免在球拍区域
            const tableSize = this.tableSizes[this.currentTableSize];
            this.apple.x = tableSize.width * 0.25 + Math.random() * (tableSize.width * 0.5); // 在中间区域生成
            this.apple.y = tableSize.height * 0.125 + Math.random() * (tableSize.height * 0.75); // 避免边界
            this.apple.active = true;
            this.apple.blinkTimer = 0;
            this.apple.visible = true;
            this.apple.spawnInterval = 600 + Math.random() * 1200; // 重置生成间隔
        }
    }
    
    updateApple() {
        if (this.apple.active) {
            // 闪烁效果
            this.apple.blinkTimer++;
            if (this.apple.blinkTimer % 20 === 0) {
                this.apple.visible = !this.apple.visible;
            }
            
            // 检查与球的碰撞
            const distance = Math.sqrt(
                Math.pow(this.ball.x - this.apple.x, 2) + 
                Math.pow(this.ball.y - this.apple.y, 2)
            );
            
            if (distance < (this.ball.size / 2 + this.apple.size / 2)) {
                // 被击中，判断球的方向来决定给哪一方奖励
                if (this.ball.dx > 0) {
                    // 球向右移动，右侧玩家获得奖励
                    this.rightBonusScore++;
                    this.triggerScoreAnimation(this.rightPlayerName + " 苹果奖励!", 'right');
                } else {
                    // 球向左移动，左侧玩家获得奖励
                    this.leftBonusScore++;
                    this.triggerScoreAnimation(this.leftPlayerName + " 苹果奖励!", 'left');
                }
                
                this.apple.active = false;
                this.apple.spawnTimer = 0;
                
                // 播放击球音效表示击中苹果
                this.pingSound.currentTime = 0;
                this.pingSound.play().catch(e => console.log('音效播放失败:', e));
            }
        } else {
            // 苹果未激活时，计时器递增
            this.apple.spawnTimer++;
            if (this.apple.spawnTimer >= this.apple.spawnInterval) {
                this.spawnApple();
            }
        }
    }
    
    drawApple() {
        if (!this.apple.active || !this.apple.visible) return;
        
        const ctx = this.ctx;
        const x = this.apple.x;
        const y = this.apple.y;
        
        // 绘制像素苹果（8x8像素风格）
        ctx.fillStyle = '#FF4444'; // 红色苹果
        
        // 苹果主体
        ctx.fillRect(x - 4, y - 2, 8, 6);
        ctx.fillRect(x - 2, y - 4, 4, 2);
        ctx.fillRect(x - 3, y + 4, 6, 2);
        
        // 苹果叶子
        ctx.fillStyle = '#44FF44'; // 绿色叶子
        ctx.fillRect(x + 1, y - 6, 2, 2);
        
        // 苹果梗
        ctx.fillStyle = '#8B4513'; // 棕色梗
        ctx.fillRect(x, y - 5, 1, 1);
    }

    drawPixelCharacter(character, isLeft) {
        const ctx = this.ctx;
        const x = character.x;
        const y = character.y;
        
        // 俯视角的乒乓球运动员（更大更详细）
        const bodyColor = isLeft ? '#FF6B6B' : '#4ECDC4'; // 左边红色，右边青色
        const skinColor = '#FFDBAC'; // 肤色
        const paddleColor = '#8B4513'; // 球拍颜色
        
        // 身体（椭圆形）
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 8, y - 5, 14, 20);
        ctx.fillRect(x + 10, y - 7, 10, 4);
        ctx.fillRect(x + 10, y + 15, 10, 4);
        
        // 头部（圆形）
        ctx.fillStyle = skinColor;
        ctx.fillRect(x + 11, y - 15, 8, 8);
        ctx.fillRect(x + 13, y - 17, 4, 4);
        
        // 眼睛
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 14, y - 13, 1, 1);
        ctx.fillRect(x + 16, y - 13, 1, 1);
        
        // 手臂和球拍（动态摆动）
        const swingOffset = Math.sin(character.animationFrame) * 3;
        ctx.fillStyle = skinColor;
        
        if (isLeft) {
            // 左侧选手右手持拍
            ctx.fillRect(x + 22, y - 2 + swingOffset, 3, 6);
            // 球拍
            ctx.fillStyle = paddleColor;
            ctx.fillRect(x + 25, y - 4 + swingOffset, 5, 2);
            ctx.fillRect(x + 25, y + 2 + swingOffset, 5, 2);
        } else {
            // 右侧选手左手持拍
            ctx.fillRect(x + 5, y - 2 + swingOffset, 3, 6);
            // 球拍
            ctx.fillStyle = paddleColor;
            ctx.fillRect(x, y - 4 + swingOffset, 5, 2);
            ctx.fillRect(x, y + 2 + swingOffset, 5, 2);
        }
        
        // 另一只手臂
        ctx.fillStyle = skinColor;
        if (isLeft) {
            ctx.fillRect(x + 5, y + 1 - swingOffset/2, 3, 5);
        } else {
            ctx.fillRect(x + 22, y + 1 - swingOffset/2, 3, 5);
        }
        
        // 腿部（动态）
        const legOffset = Math.sin(character.animationFrame + Math.PI) * 1;
        ctx.fillRect(x + 10, y + 19, 3, 8 + legOffset);
        ctx.fillRect(x + 17, y + 19, 3, 8 - legOffset);
        
        // 鞋子
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 9, y + 27 + legOffset, 5, 2);
        ctx.fillRect(x + 16, y + 27 - legOffset, 5, 2);
        
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
                } else if (e.key.toLowerCase() === 'd') {
                    this.toggleDetailedStats();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    startGame() {
        // 获取玩家名字和游戏设置
        this.leftPlayerName = this.leftPlayerInput.value.trim() || '小鹏友';
        this.rightPlayerName = this.rightPlayerInput.value.trim() || '唐林';
        this.currentTableSize = this.tableSizeSelect.value;
        this.currentBackground = this.backgroundSelect.value;
        
        // 应用台球桌大小
        this.initializeTableSize();
        
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
        this.leftBonusScore = 0;
        this.rightBonusScore = 0;
        this.apple.active = false;
        this.apple.spawnTimer = 0;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = this.ball.baseSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ball.baseSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.trail = [];
        this.ball.color = this.getRandomBrightColor(); // 重新游戏时也更换颜色
        
        this.leftPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.rightPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        
        this.gameOverScreen.style.display = 'none';
        this.detailedStats.style.display = 'none';
        this.showDetailedStats = false;
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.updateScore();
        this.gameLoop();
    }
    
    exitGame() {
        this.gameState = 'start';
        this.gameOverScreen.style.display = 'none';
        this.detailedStats.style.display = 'none';
        this.showDetailedStats = false;
        this.startScreen.style.display = 'block';
        this.gameUI.style.display = 'none';
        
        // 背景音乐继续播放，只重置位置
        this.backgroundMusic.currentTime = 0;
    }
    
    toggleDetailedStats() {
        this.showDetailedStats = !this.showDetailedStats;
        if (this.showDetailedStats) {
            this.updateDetailedStats();
            this.detailedStats.style.display = 'block';
        } else {
            this.detailedStats.style.display = 'none';
        }
    }
    
    updateDetailedStats() {
        const leftTotal = this.leftScore + this.leftBonusScore;
        const rightTotal = this.rightScore + this.rightBonusScore;
        
        // 总比分
        this.totalScores.textContent = `${this.leftPlayerName}: ${leftTotal} | ${this.rightPlayerName}: ${rightTotal}`;
        
        // 常规得分
        this.regularScores.textContent = `${this.leftPlayerName}: ${this.leftScore} | ${this.rightPlayerName}: ${this.rightScore}`;
        
        // 奖励得分
        this.bonusScores.textContent = `${this.leftPlayerName}: ${this.leftBonusScore} | ${this.rightPlayerName}: ${this.rightBonusScore}`;
        
        // 游戏时长
        const duration = this.currentGameTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        this.gameDuration.textContent = `${minutes}分${seconds}秒`;
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
        
        // 小人位置独立于球拍，可以有轻微的上下移动表示准备状态
        this.leftCharacter.y = this.canvas.height / 2 + Math.sin(Date.now() * 0.001) * 5;
        this.rightCharacter.y = this.canvas.height / 2 + Math.sin(Date.now() * 0.001 + Math.PI) * 5;
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
        
        // 检查胜利条件（包含奖励分数）
        if ((this.leftScore + this.leftBonusScore) >= this.winningScore || 
            (this.rightScore + this.rightBonusScore) >= this.winningScore) {
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
        this.leftScoreDisplay.textContent = this.leftScore + this.leftBonusScore;
        this.rightScoreDisplay.textContent = this.rightScore + this.rightBonusScore;
        this.leftBonusScoreDisplay.textContent = `奖励: ${this.leftBonusScore}`;
        this.rightBonusScoreDisplay.textContent = `奖励: ${this.rightBonusScore}`;
        
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
        
        // 保持背景音乐播放，不停止
        
        const leftTotal = this.leftScore + this.leftBonusScore;
        const rightTotal = this.rightScore + this.rightBonusScore;
        
        if (leftTotal >= this.winningScore) {
            this.winnerText.textContent = `${this.leftPlayerName}获胜！`;
        } else {
            this.winnerText.textContent = `${this.rightPlayerName}获胜！`;
        }
        
        this.finalScore.textContent = `最终比分：${leftTotal} - ${rightTotal}
        (${this.leftPlayerName}: ${this.leftScore}+${this.leftBonusScore} | ${this.rightPlayerName}: ${this.rightScore}+${this.rightBonusScore})`;
    }
    
    drawBackground() {
        const background = this.backgrounds[this.currentBackground];
        
        // 绘制基础背景色
        this.ctx.fillStyle = background.base;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制图案
        this.ctx.save();
        this.ctx.globalAlpha = 0.1; // 让图案很淡，不干扰球的可见性
        
        switch (background.pattern) {
            case 'dots':
                this.drawDotsPattern();
                break;
            case 'lines':
                this.drawLinesPattern();
                break;
            case 'wood':
                this.drawWoodPattern();
                break;
            case 'grid':
                this.drawGridPattern();
                break;
        }
        
        this.ctx.restore();
    }
    
    drawDotsPattern() {
        this.ctx.fillStyle = '#fff';
        for (let x = 20; x < this.canvas.width; x += 40) {
            for (let y = 20; y < this.canvas.height; y += 40) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    drawLinesPattern() {
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        for (let y = 0; y < this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawWoodPattern() {
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        for (let y = 10; y < this.canvas.height; y += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y + Math.sin(y * 0.02) * 5);
            this.ctx.lineTo(this.canvas.width, y + Math.sin(y * 0.02) * 5);
            this.ctx.stroke();
        }
    }
    
    drawGridPattern() {
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 1;
        
        // 垂直线
        for (let x = 0; x < this.canvas.width; x += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 水平线
        for (let y = 0; y < this.canvas.height; y += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    draw() {
        // 绘制背景
        this.drawBackground();
        
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
        
        // 绘制苹果
        this.drawApple();
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
            this.updateApple(); // 更新苹果
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