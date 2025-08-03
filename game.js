class PingPongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startScreen = document.getElementById('startScreen');
        this.gameUI = document.getElementById('gameUI');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.leaderboard = document.getElementById('leaderboard');
        this.scoreList = document.getElementById('scoreList');
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
        this.leftPlayerDisplayDiv = document.getElementById('leftPlayerDisplay');
        this.rightPlayerDisplayDiv = document.getElementById('rightPlayerDisplay');
        
        // IndexedDB相关
        this.db = null;
        this.initDatabase();
        
        // 记录是否已经设置名字
        this.leftNameSet = false;
        this.rightNameSet = false;
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
        
        // 台球桌配置（扩大canvas以容纳小人）
        this.tableSizes = {
            standard: { width: 1840, height: 800, tableWidth: 1600, tableHeight: 800 },
            large: { width: 2240, height: 1000, tableWidth: 2000, tableHeight: 1000 }
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
        this.paddleWidth = 20;
        this.paddleHeight = 160;
        this.paddleSpeed = 10;
        
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
        this.ballSize = 30; // 增大球的尺寸
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: 6,
            dy: 4,
            size: this.ballSize,
            baseSpeed: 6,
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
            size: 48, // 增大一倍
            spawnTimer: 0,
            spawnInterval: 600 + Math.random() * 1200, // 10-30秒随机生成
            blinkTimer: 0,
            visible: true
        };
        
        // 按键状态
        this.keys = {};
        
        // 记录最后一次击球的玩家
        this.lastHitPlayer = null; // 'left' 或 'right'
        
        // 游戏时间
        this.gameStartTime = 0;
        this.currentGameTime = 0;
        
        // 音效
        this.hitSound = new Audio('sound/hit.mp3');
        this.hitSound.volume = 0.8; // 设置音量较大
        this.backgroundMusic = new Audio('sound/比赛的一天.mp3');
        this.backgroundMusic.volume = 0.6;
        this.backgroundMusic.loop = true; // 循环播放
        this.leftLostSound = new Audio('sound/left_lost_mp3.mp3');
        this.leftLostSound.volume = 0.7;
        this.rightLostSound = new Audio('sound/right_lost.mp3');
        this.rightLostSound.volume = 0.7;
        this.gameEndSound = new Audio('sound/vector.mp3');
        this.gameEndSound.volume = 0.8;
        
        // 像素小人（俯视角，位于桌子外面但在canvas内）
        this.leftCharacter = {
            x: 10, // 在canvas内，距离桌子边缘60px
            y: this.canvas.height / 2,
            width: 80,  // 增大size
            height: 100, // 增大size
            animationFrame: 0,
            animationSpeed: 0.15,
            size: 2.0, // 大小比例
            isEnhanced: false, // 是否被增强（击中苹果）
            enhancedTimer: 0, // 增强状态倒计时
            paddleSpeedMultiplier: 1.0 // 球拍速度倍数
        };
        
        this.rightCharacter = {
            x: 870, // 在canvas内，距离桌子边缘60px
            y: this.canvas.height / 2,
            width: 80,  // 增大size
            height: 100, // 增大size
            animationFrame: 0,
            animationSpeed: 0.15,
            size: 2.0, // 大小比例  
            isEnhanced: false, // 是否被增强（击中苹果）
            enhancedTimer: 0, // 增强状态倒计时
            paddleSpeedMultiplier: 1.0 // 球拍速度倍数
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
        this.updateStartHint(); // 初始化开始提示
    }
    
    async initDatabase() {
        try {
            const request = window.indexedDB.open('PingPongScores', 1);
            
            request.onerror = () => {
                console.error('数据库打开失败');
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('数据库打开成功');
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('scores')) {
                    const objectStore = db.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
                    objectStore.createIndex('totalScore', 'totalScore', { unique: false });
                    objectStore.createIndex('date', 'date', { unique: false });
                }
            };
        } catch (error) {
            console.error('IndexedDB初始化失败:', error);
        }
    }
    
    async saveScore(leftPlayer, rightPlayer, leftScore, leftBonus, rightScore, rightBonus, duration) {
        if (!this.db) return;
        
        const transaction = this.db.transaction(['scores'], 'readwrite');
        const objectStore = transaction.objectStore('scores');
        
        const scoreRecord = {
            leftPlayer,
            rightPlayer,
            leftScore,
            leftBonus,
            rightScore,
            rightBonus,
            leftTotal: leftScore + leftBonus,
            rightTotal: rightScore + rightBonus,
            totalScore: leftScore + leftBonus + rightScore + rightBonus,
            winner: (leftScore + leftBonus) > (rightScore + rightBonus) ? leftPlayer : rightPlayer,
            date: new Date(),
            duration
        };
        
        objectStore.add(scoreRecord);
    }
    
    async getScores() {
        if (!this.db) return [];
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['scores'], 'readonly');
            const objectStore = transaction.objectStore('scores');
            const request = objectStore.getAll();
            
            request.onsuccess = () => {
                const scores = request.result;
                // 按总分排序
                scores.sort((a, b) => b.totalScore - a.totalScore);
                resolve(scores.slice(0, 10)); // 只返回前10名
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
    
    showLeaderboard() {
        this.startScreen.style.display = 'none';
        this.leaderboard.style.display = 'flex';
        this.loadScores();
    }
    
    hideLeaderboard() {
        this.leaderboard.style.display = 'none';
        this.startScreen.style.display = 'block';
    }
    
    async loadScores() {
        try {
            const scores = await this.getScores();
            this.renderScores(scores);
        } catch (error) {
            console.error('加载分数失败:', error);
        }
    }
    
    renderScores(scores) {
        if (scores.length === 0) {
            this.scoreList.innerHTML = '<div style="color: #ccc; font-size: 24px; text-align: center; padding: 40px;">暂无分数记录</div>';
            return;
        }
        
        this.scoreList.innerHTML = scores.map((score, index) => {
            const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : '';
            const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
            
            return `
                <div class="score-item ${rankClass}">
                    <div class="score-rank">${rankEmoji}</div>
                    <div class="score-names">${score.leftPlayer} vs ${score.rightPlayer}</div>
                    <div class="score-points">${score.totalScore}</div>
                </div>
            `;
        }).join('');
    }
    
    initializeTableSize() {
        const tableSize = this.tableSizes[this.currentTableSize];
        this.canvas.width = tableSize.width;
        this.canvas.height = tableSize.height;
        
        console.log(`Canvas大小: ${this.canvas.width}x${this.canvas.height}`);
        console.log(`桌子大小: ${tableSize.tableWidth}x${tableSize.tableHeight}`);
        
        // 重新计算游戏元素位置
        this.updateGameElementsPosition();
    }
    
    updateGameElementsPosition() {
        const tableSize = this.tableSizes[this.currentTableSize];
        const tableWidth = tableSize.tableWidth || tableSize.width;
        const tableHeight = tableSize.tableHeight || tableSize.height;
        
        // 桌子在canvas中居中
        const tableOffsetX = (this.canvas.width - tableWidth) / 2;
        const tableOffsetY = (this.canvas.height - tableHeight) / 2;
        
        // 更新球拍位置（相对于桌子）
        this.leftPaddle.x = tableOffsetX + 20;
        this.leftPaddle.y = tableOffsetY + tableHeight / 2 - this.paddleHeight / 2;
        this.rightPaddle.x = tableOffsetX + tableWidth - 30;
        this.rightPaddle.y = tableOffsetY + tableHeight / 2 - this.paddleHeight / 2;
        
        // 更新球的位置（桌子中心）
        this.ball.x = tableOffsetX + tableWidth / 2;
        this.ball.y = tableOffsetY + tableHeight / 2;
        
        // 更新小人位置（在canvas内，距离桌子边缘60px）
        this.leftCharacter.x = tableOffsetX - 60;
        this.rightCharacter.x = tableOffsetX + tableWidth + 20;
        this.leftCharacter.y = tableOffsetY + tableHeight / 2;
        this.rightCharacter.y = tableOffsetY + tableHeight / 2;
        
        console.log(`桌子偏移: x=${tableOffsetX}, y=${tableOffsetY}`);
        console.log(`左侧小人位置: x=${this.leftCharacter.x}, y=${this.leftCharacter.y}`);
        console.log(`右侧小人位置: x=${this.rightCharacter.x}, y=${this.rightCharacter.y}`);
        console.log(`左侧球拍位置: x=${this.leftPaddle.x}, y=${this.leftPaddle.y}`);
        console.log(`右侧球拍位置: x=${this.rightPaddle.x}, y=${this.rightPaddle.y}`);
        console.log(`小人是否在可视区域: 左侧=${this.leftCharacter.x >= 0 && this.leftCharacter.x < this.canvas.width}, 右侧=${this.rightCharacter.x >= 0 && this.rightCharacter.x < this.canvas.width}`);
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
            const tableWidth = tableSize.tableWidth || tableSize.width;
            const tableHeight = tableSize.tableHeight || tableSize.height;
            const tableOffsetX = (this.canvas.width - tableWidth) / 2;
            const tableOffsetY = (this.canvas.height - tableHeight) / 2;
            
            this.apple.x = tableOffsetX + tableWidth * 0.25 + Math.random() * (tableWidth * 0.5); // 在中间区域生成
            this.apple.y = tableOffsetY + tableHeight * 0.125 + Math.random() * (tableHeight * 0.75); // 避免边界
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
                // 苹果被击中，奖励最后一次击球的玩家
                if (this.lastHitPlayer === 'left') {
                    this.leftBonusScore++;
                    this.triggerScoreAnimation(this.leftPlayerName + " 苹果奖励!", 'left');
                    // 增强左侧小人
                    this.enhanceCharacter('left');
                } else if (this.lastHitPlayer === 'right') {
                    this.rightBonusScore++;
                    this.triggerScoreAnimation(this.rightPlayerName + " 苹果奖励!", 'right');
                    // 增强右侧小人
                    this.enhanceCharacter('right');
                } else {
                    // 如果没有记录击球玩家（游戏开始时），根据球的方向判断
                    if (this.ball.dx > 0) {
                        this.rightBonusScore++;
                        this.triggerScoreAnimation(this.rightPlayerName + " 苹果奖励!", 'right');
                        this.enhanceCharacter('right');
                    } else {
                        this.leftBonusScore++;
                        this.triggerScoreAnimation(this.leftPlayerName + " 苹果奖励!", 'left');
                        this.enhanceCharacter('left');
                    }
                }
                
                this.apple.active = false;
                this.apple.spawnTimer = 0;
                
                // 播放击球音效表示击中苹果
                this.hitSound.currentTime = 0;
                this.hitSound.play().catch(e => console.log('音效播放失败:', e));
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
        const size = this.apple.size / 12; // 缩放比例
        
        // 绘制像素苹果（大一倍的版本）
        ctx.fillStyle = '#FF4444'; // 红色苹果
        
        // 苹果主体
        ctx.fillRect(x - 4*size, y - 2*size, 8*size, 6*size);
        ctx.fillRect(x - 2*size, y - 4*size, 4*size, 2*size);
        ctx.fillRect(x - 3*size, y + 4*size, 6*size, 2*size);
        
        // 苹果叶子
        ctx.fillStyle = '#44FF44'; // 绿色叶子
        ctx.fillRect(x + 1*size, y - 6*size, 2*size, 2*size);
        
        // 苹果梗
        ctx.fillStyle = '#8B4513'; // 棕色梗
        ctx.fillRect(x, y - 5*size, 1*size, 1*size);
    }

    drawPixelCharacter(character, isLeft) {
        const ctx = this.ctx;
        const x = character.x;
        const y = character.y;
        const scale = character.size; // 使用动态大小
        
        // 俯视角的乒乓球运动员（更大更详细，不同颜色）
        const bodyColor = isLeft ? '#FF4444' : '#44AAFF'; // 左边亮红色，右边亮蓝色
        const skinColor = '#FFDBAC'; // 肤色
        const paddleColor = '#8B4513'; // 球拍颜色
        const glowColor = character.isEnhanced ? '#FFD700' : null; // 增强时发光
        
        ctx.save();
        
        // 如果被增强，添加发光效果
        if (character.isEnhanced) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 15;
        }
        
        // 身体（椭圆形）- 缩放版本
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 8*scale, y - 5*scale, 14*scale, 20*scale);
        ctx.fillRect(x + 10*scale, y - 7*scale, 10*scale, 4*scale);
        ctx.fillRect(x + 10*scale, y + 15*scale, 10*scale, 4*scale);
        
        // 头部（圆形）
        ctx.fillStyle = skinColor;
        ctx.fillRect(x + 11*scale, y - 15*scale, 8*scale, 8*scale);
        ctx.fillRect(x + 13*scale, y - 17*scale, 4*scale, 4*scale);
        
        // 眼睛
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 14*scale, y - 13*scale, 1*scale, 1*scale);
        ctx.fillRect(x + 16*scale, y - 13*scale, 1*scale, 1*scale);
        
        // 手臂和球拍（动态摆动）
        const swingOffset = Math.sin(character.animationFrame) * 3 * scale;
        ctx.fillStyle = skinColor;
        
        if (isLeft) {
            // 左侧选手右手持拍
            ctx.fillRect(x + 22*scale, y - 2*scale + swingOffset, 3*scale, 6*scale);
            // 球拍
            ctx.fillStyle = paddleColor;
            ctx.fillRect(x + 25*scale, y - 4*scale + swingOffset, 5*scale, 2*scale);
            ctx.fillRect(x + 25*scale, y + 2*scale + swingOffset, 5*scale, 2*scale);
        } else {
            // 右侧选手左手持拍
            ctx.fillRect(x + 5*scale, y - 2*scale + swingOffset, 3*scale, 6*scale);
            // 球拍
            ctx.fillStyle = paddleColor;
            ctx.fillRect(x, y - 4*scale + swingOffset, 5*scale, 2*scale);
            ctx.fillRect(x, y + 2*scale + swingOffset, 5*scale, 2*scale);
        }
        
        // 另一只手臂
        ctx.fillStyle = skinColor;
        if (isLeft) {
            ctx.fillRect(x + 5*scale, y + 1*scale - swingOffset/2, 3*scale, 5*scale);
        } else {
            ctx.fillRect(x + 22*scale, y + 1*scale - swingOffset/2, 3*scale, 5*scale);
        }
        
        // 腿部（动态）
        const legOffset = Math.sin(character.animationFrame + Math.PI) * 1 * scale;
        ctx.fillRect(x + 10*scale, y + 19*scale, 3*scale, 8*scale + legOffset);
        ctx.fillRect(x + 17*scale, y + 19*scale, 3*scale, 8*scale - legOffset);
        
        // 鞋子
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 9*scale, y + 27*scale + legOffset, 5*scale, 2*scale);
        ctx.fillRect(x + 16*scale, y + 27*scale - legOffset, 5*scale, 2*scale);
        
        // 更新动画帧
        character.animationFrame += character.animationSpeed;
        
        ctx.restore();
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
            
            if (this.gameState === 'start') {
                if (e.key === ' ') {
                    // 空格键可以直接开始游戏，不需要检查名字设置状态
                    this.startGame();
                } else if (e.key === 'Enter') {
                    this.handleEnterKey();
                }
            } else if (this.gameState === 'gameOver') {
                if (e.key.toLowerCase() === 'r') {
                    this.resetGame();
                } else if (e.key === 'Escape') {
                    this.exitGame();
                } else if (e.key.toLowerCase() === 'd') {
                    this.toggleDetailedStats();
                }
            }
            
            // 全局ESC键处理
            if (e.key === 'Escape') {
                if (this.leaderboard.style.display === 'flex') {
                    this.hideLeaderboard();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // 添加输入框事件监听
        this.leftPlayerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.setPlayerName('left');
            }
        });
        
        this.rightPlayerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.setPlayerName('right');
            }
        });
    }
    
    startGame() {
        // 先完全隐藏开始界面
        this.startScreen.style.display = 'none';
        
        // 获取玩家名字和游戏设置
        this.leftPlayerName = this.leftPlayerInput.value.trim() || '小朋友';
        this.rightPlayerName = this.rightPlayerInput.value.trim() || '唐林';
        this.currentTableSize = this.tableSizeSelect.value;
        this.currentBackground = this.backgroundSelect.value;
        
        // 应用台球桌大小
        this.initializeTableSize();
        
        // 更新显示
        this.leftPlayerDisplay.textContent = this.leftPlayerName;
        this.rightPlayerDisplay.textContent = this.rightPlayerName;
        
        // 确保游戏界面完全显示，包括计分板
        this.gameUI.style.display = 'block';
        document.querySelector('.scoreboard').style.display = 'flex'; // 显示计分板
        this.canvas.style.display = 'block';
        this.gameOverScreen.style.display = 'none';
        
        this.gameState = 'playing';
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
    
    handleEnterKey() {
        // 检查哪个输入框获得了焦点
        if (document.activeElement === this.leftPlayerInput) {
            this.setPlayerName('left');
        } else if (document.activeElement === this.rightPlayerInput) {
            this.setPlayerName('right');
        }
    }
    
    setPlayerName(side) {
        if (side === 'left' && !this.leftNameSet) {
            const name = this.leftPlayerInput.value.trim() || '小鹏友';
            this.leftPlayerName = name;
            this.leftPlayerDisplayDiv.textContent = name;
            this.leftPlayerDisplayDiv.style.display = 'block';
            this.leftPlayerInput.style.display = 'none';
            this.leftNameSet = true;
            console.log(`左侧玩家名字设置为: ${name}`);
        } else if (side === 'right' && !this.rightNameSet) {
            const name = this.rightPlayerInput.value.trim() || '唐林';
            this.rightPlayerName = name;
            this.rightPlayerDisplayDiv.textContent = name;
            this.rightPlayerDisplayDiv.style.display = 'block';
            this.rightPlayerInput.style.display = 'none';
            this.rightNameSet = true;
            console.log(`右侧玩家名字设置为: ${name}`);
        }
        
        // 检查是否可以开始游戏
        this.updateStartHint();
    }
    
    updateStartHint() {
        const startHint = document.querySelector('.start-hint');
        // 始终显示可以开始游戏的提示
        startHint.textContent = '按 SPACE 开始游戏';
        startHint.style.color = '#00FF00';
    }
    
    exitGame() {
        // 完全隐藏游戏相关界面
        this.gameOverScreen.style.display = 'none';
        this.detailedStats.style.display = 'none';
        this.gameUI.style.display = 'none';
        this.canvas.style.display = 'none';
        document.querySelector('.scoreboard').style.display = 'none'; // 隐藏计分板
        
        // 重置游戏状态
        this.gameState = 'start';
        this.showDetailedStats = false;
        
        // 显示开始界面
        this.startScreen.style.display = 'block';
        
        // 重置名字设置状态
        this.resetNameInputs();
        
        // 背景音乐继续播放，只重置位置
        this.backgroundMusic.currentTime = 0;
    }
    
    resetNameInputs() {
        this.leftNameSet = false;
        this.rightNameSet = false;
        this.leftPlayerInput.style.display = 'block';
        this.rightPlayerInput.style.display = 'block';
        this.leftPlayerDisplayDiv.style.display = 'none';
        this.rightPlayerDisplayDiv.style.display = 'none';
        this.updateStartHint();
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
        // 计算增强后的速度
        const leftSpeed = this.leftPaddle.speed * this.leftCharacter.paddleSpeedMultiplier;
        const rightSpeed = this.rightPaddle.speed * this.rightCharacter.paddleSpeedMultiplier;
        
        // 左侧球拍控制 (A/Z)
        if (this.keys['a'] && this.leftPaddle.y > 0) {
            this.leftPaddle.y -= leftSpeed;
        }
        if (this.keys['z'] && this.leftPaddle.y < this.canvas.height - this.leftPaddle.height) {
            this.leftPaddle.y += leftSpeed;
        }
        
        // 右侧球拍控制 (上下箭头)
        if (this.keys['arrowup'] && this.rightPaddle.y > 0) {
            this.rightPaddle.y -= rightSpeed;
        }
        if (this.keys['arrowdown'] && this.rightPaddle.y < this.canvas.height - this.rightPaddle.height) {
            this.rightPaddle.y += rightSpeed;
        }
        
        // 更新小人增强状态
        this.updateCharacterEnhancement(this.leftCharacter);
        this.updateCharacterEnhancement(this.rightCharacter);
        
        // 小人跟随球拍移动，保持在球拍的中心高度
        const tableSize = this.tableSizes[this.currentTableSize];
        const tableHeight = tableSize.tableHeight || tableSize.height;
        const tableOffsetY = (this.canvas.height - tableHeight) / 2;
        
        // 左侧小人跟随左侧球拍
        this.leftCharacter.y = this.leftPaddle.y + this.leftPaddle.height / 2;
        
        // 右侧小人跟随右侧球拍
        this.rightCharacter.y = this.rightPaddle.y + this.rightPaddle.height / 2;
    }
    
    updateBall() {
        // 计算球的当前速度
        const currentSpeed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
        
        // 根据速度计算拖尾长度，速度越快拖尾越长
        const baseTrailLength = 5; // 基础拖尾长度
        const maxTrailLength = 25; // 最大拖尾长度
        const speedFactor = (currentSpeed - this.ball.baseSpeed) / (8 - this.ball.baseSpeed); // 归一化速度因子
        const dynamicTrailLength = Math.min(maxTrailLength, baseTrailLength + speedFactor * (maxTrailLength - baseTrailLength));
        
        // 更新球的拖尾
        this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
        if (this.ball.trail.length > Math.max(1, Math.round(dynamicTrailLength))) {
            this.ball.trail.shift();
        }
        
        // 移动球
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // 获取桌子区域
        const tableSize = this.tableSizes[this.currentTableSize];
        const tableWidth = tableSize.tableWidth || tableSize.width;
        const tableHeight = tableSize.tableHeight || tableSize.height;
        const tableOffsetX = (this.canvas.width - tableWidth) / 2;
        const tableOffsetY = (this.canvas.height - tableHeight) / 2;
        
        // 上下边界碰撞（相对于桌子区域）
        if (this.ball.y <= tableOffsetY + this.ball.size || this.ball.y >= tableOffsetY + tableHeight - this.ball.size) {
            this.ball.dy = -this.ball.dy;
        }
        
        // 左侧球拍碰撞检测
        if (this.ball.x - this.ball.size <= this.leftPaddle.x + this.leftPaddle.width &&
            this.ball.x + this.ball.size >= this.leftPaddle.x &&
            this.ball.y >= this.leftPaddle.y &&
            this.ball.y <= this.leftPaddle.y + this.leftPaddle.height) {
            
            this.ball.dx = -this.ball.dx;
            this.increaseBallSpeed();
            this.lastHitPlayer = 'left'; // 记录左侧玩家击球
            
            // 播放击球音效
            this.hitSound.currentTime = 0; // 重置播放位置以便快速连续播放
            this.hitSound.play().catch(e => console.log('音效播放失败:', e));
            
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
            this.lastHitPlayer = 'right'; // 记录右侧玩家击球
            
            // 播放击球音效
            this.hitSound.currentTime = 0; // 重置播放位置以便快速连续播放
            this.hitSound.play().catch(e => console.log('音效播放失败:', e));
            
            // 根据击中位置调整角度
            let hitPos = (this.ball.y - this.rightPaddle.y) / this.rightPaddle.height;
            this.ball.dy = (hitPos - 0.5) * 8;
        }
        
        // 得分检测（相对于桌子区域）
        if (this.ball.x < tableOffsetX) {
            this.triggerOutOfBoundsAnimation('left');
            this.rightScore++;
            this.triggerScoreAnimation(this.rightPlayerName, 'right');
            // 左侧失分，重置左侧小人增强状态
            this.resetCharacterEnhancement('left');
            // 播放左侧失球音效
            this.leftLostSound.currentTime = 0;
            this.leftLostSound.play().catch(e => console.log('音效播放失败:', e));
            this.resetBall();
        } else if (this.ball.x > tableOffsetX + tableWidth) {
            this.triggerOutOfBoundsAnimation('right');
            this.leftScore++;
            this.triggerScoreAnimation(this.leftPlayerName, 'left');
            // 右侧失分，重置右侧小人增强状态
            this.resetCharacterEnhancement('right');
            // 播放右侧失球音效
            this.rightLostSound.currentTime = 0;
            this.rightLostSound.play().catch(e => console.log('音效播放失败:', e));
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
        const tableSize = this.tableSizes[this.currentTableSize];
        const tableWidth = tableSize.tableWidth || tableSize.width;
        const tableHeight = tableSize.tableHeight || tableSize.height;
        const tableOffsetX = (this.canvas.width - tableWidth) / 2;
        const tableOffsetY = (this.canvas.height - tableHeight) / 2;
        
        this.ball.x = tableOffsetX + tableWidth / 2;
        this.ball.y = tableOffsetY + tableHeight / 2;
        this.ball.dx = this.ball.baseSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ball.baseSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.trail = [];
        this.ball.color = this.getRandomBrightColor(); // 每次重置都更换颜色
        this.lastHitPlayer = null; // 重置最后击球玩家
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
        
        // 播放结束一局的音效
        this.gameEndSound.currentTime = 0;
        this.gameEndSound.play().catch(e => console.log('音效播放失败:', e));
        
        // 保持背景音乐播放，不停止
        
        const leftTotal = this.leftScore + this.leftBonusScore;
        const rightTotal = this.rightScore + this.rightBonusScore;
        
        // 保存分数到IndexedDB
        this.saveScore(
            this.leftPlayerName, 
            this.rightPlayerName, 
            this.leftScore, 
            this.leftBonusScore, 
            this.rightScore, 
            this.rightBonusScore, 
            this.currentGameTime
        );
        
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
        const tableSize = this.tableSizes[this.currentTableSize];
        const tableWidth = tableSize.tableWidth || tableSize.width;
        const tableHeight = tableSize.tableHeight || tableSize.height;
        const tableOffsetX = (this.canvas.width - tableWidth) / 2;
        const tableOffsetY = (this.canvas.height - tableHeight) / 2;
        
        // 绘制canvas背景色（深色）
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制桌子背景
        this.ctx.fillStyle = background.base;
        this.ctx.fillRect(tableOffsetX, tableOffsetY, tableWidth, tableHeight);
        
        // 绘制桌子边框
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(tableOffsetX, tableOffsetY, tableWidth, tableHeight);
        
        // 绘制图案（仅在桌子区域）
        this.ctx.save();
        this.ctx.globalAlpha = 0.1; // 让图案很淡，不干扰球的可见性
        this.ctx.beginPath();
        this.ctx.rect(tableOffsetX, tableOffsetY, tableWidth, tableHeight);
        this.ctx.clip();
        
        switch (background.pattern) {
            case 'dots':
                this.drawDotsPattern(tableOffsetX, tableOffsetY, tableWidth, tableHeight);
                break;
            case 'lines':
                this.drawLinesPattern(tableOffsetX, tableOffsetY, tableWidth, tableHeight);
                break;
            case 'wood':
                this.drawWoodPattern(tableOffsetX, tableOffsetY, tableWidth, tableHeight);
                break;
            case 'grid':
                this.drawGridPattern(tableOffsetX, tableOffsetY, tableWidth, tableHeight);
                break;
        }
        
        this.ctx.restore();
    }
    
    drawDotsPattern(offsetX, offsetY, width, height) {
        this.ctx.fillStyle = '#fff';
        for (let x = offsetX + 20; x < offsetX + width; x += 40) {
            for (let y = offsetY + 20; y < offsetY + height; y += 40) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    drawLinesPattern(offsetX, offsetY, width, height) {
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        for (let y = offsetY; y < offsetY + height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, y);
            this.ctx.lineTo(offsetX + width, y);
            this.ctx.stroke();
        }
    }
    
    drawWoodPattern(offsetX, offsetY, width, height) {
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        for (let y = offsetY + 10; y < offsetY + height; y += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, y + Math.sin(y * 0.02) * 5);
            this.ctx.lineTo(offsetX + width, y + Math.sin(y * 0.02) * 5);
            this.ctx.stroke();
        }
    }
    
    drawGridPattern(offsetX, offsetY, width, height) {
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 1;
        
        // 垂直线
        for (let x = offsetX; x < offsetX + width; x += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, offsetY);
            this.ctx.lineTo(x, offsetY + height);
            this.ctx.stroke();
        }
        
        // 水平线
        for (let y = offsetY; y < offsetY + height; y += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, y);
            this.ctx.lineTo(offsetX + width, y);
            this.ctx.stroke();
        }
    }

    draw() {
        // 绘制背景
        this.drawBackground();
        
        // 获取桌子信息
        const tableSize = this.tableSizes[this.currentTableSize];
        const tableWidth = tableSize.tableWidth || tableSize.width;
        const tableHeight = tableSize.tableHeight || tableSize.height;
        const tableOffsetX = (this.canvas.width - tableWidth) / 2;
        const tableOffsetY = (this.canvas.height - tableHeight) / 2;
        
        // 绘制中线（仅在桌子区域）
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(tableOffsetX + tableWidth / 2, tableOffsetY);
        this.ctx.lineTo(tableOffsetX + tableWidth / 2, tableOffsetY + tableHeight);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 绘制球拍
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, this.leftPaddle.width, this.leftPaddle.height);
        this.ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, this.rightPaddle.width, this.rightPaddle.height);
        
        // 绘制像素小人（在桌子外但在canvas内）
        console.log(`正在绘制左侧小人在: x=${this.leftCharacter.x}, y=${this.leftCharacter.y}`);
        console.log(`正在绘制右侧小人在: x=${this.rightCharacter.x}, y=${this.rightCharacter.y}`);
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
    
    enhanceCharacter(side) {
        const character = side === 'left' ? this.leftCharacter : this.rightCharacter;
        character.isEnhanced = true;
        character.size = 2.0; // 变大一倍
        character.paddleSpeedMultiplier = 1.2; // 击球速度增加20%
        character.enhancedTimer = 0;
    }
    
    updateCharacterEnhancement(character) {
        if (character.isEnhanced) {
            character.enhancedTimer++;
            // 增强状态持续一段时间（比如600帧，约10秒）
            if (character.enhancedTimer > 600) {
                this.resetCharacterEnhancement(character === this.leftCharacter ? 'left' : 'right');
            }
        }
    }
    
    resetCharacterEnhancement(side) {
        const character = side === 'left' ? this.leftCharacter : this.rightCharacter;
        character.isEnhanced = false;
        character.size = 1.0; // 恢复正常大小
        character.paddleSpeedMultiplier = 1.0; // 恢复正常速度
        character.enhancedTimer = 0;
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