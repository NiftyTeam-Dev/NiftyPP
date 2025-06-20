// game.js
let canvas, ctx;
let gameRunning = false;
let currentLevel = 1;
let lives = 3;
let score = 0;
let totalScore = 0;
let selectedCharacter = 0;
let unlockedCharacters = [true, false, false];
let characterSpeeds = [5, 6, 7];
let characterLives = [3, 4, 4];
let coins = [];
let ghosts = [];
let walls = [];
let teleports = [];
let player = { 
    x: 0, 
    y: 0, 
    dx: 0, 
    dy: 0, 
    nextMove: null,
    poweredUp: false,
    powerEndTime: 0
};
let lastTime = 0;
let gameStartTime = 0;
let keys = {};
let touchStart = null;
let touchEnd = null;

let images = {
    background: null,
    gameBg: null,
    characters: [],
    ghosts: [],
    coin: null,
    powerPellet: null,
    walls: []
};

function initGame() {
    canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    setupEventListeners();
    resetGameState();
    
    // Загружаем изображения перед началом игры
    loadImages().then(() => {
        requestAnimationFrame(gameLoop);
    }).catch(error => {
        console.error('Error loading images:', error);
    });
}

function resizeCanvas() {
    if (!canvas) return;
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
}

function loadImages() {
    return new Promise((resolve, reject) => {
        let loadedCount = 0;
        const totalImages = 11; // Общее количество изображений
        
        function imageLoaded() {
            loadedCount++;
            if (loadedCount === totalImages) {
                resolve();
            }
        }
        
        function handleImageError(error) {
            console.error('Error loading image:', error);
            reject(error);
        }
        
        // Фон меню
        images.background = new Image();
        images.background.onload = imageLoaded;
        images.background.onerror = handleImageError;
        images.background.src = 'images/menu-bg.png';
        
        // Фон игры
        images.gameBg = new Image();
        images.gameBg.onload = imageLoaded;
        images.gameBg.onerror = handleImageError;
        images.gameBg.src = 'images/game-bg.png';
        
        // Персонажи
        for (let i = 0; i < 3; i++) {
            images.characters[i] = new Image();
            images.characters[i].onload = imageLoaded;
            images.characters[i].onerror = handleImageError;
            images.characters[i].src = `images/characters/char${i+1}.png`;
            
            images.ghosts[i] = new Image();
            images.ghosts[i].onload = imageLoaded;
            images.ghosts[i].onerror = handleImageError;
            images.ghosts[i].src = `images/ghosts/ghost${i+1}.png`;
        }
        
        // Предметы
        images.coin = new Image();
        images.coin.onload = imageLoaded;
        images.coin.onerror = handleImageError;
        images.coin.src = 'images/items/coin.png';
        
        images.powerPellet = new Image();
        images.powerPellet.onload = imageLoaded;
        images.powerPellet.onerror = handleImageError;
        images.powerPellet.src = 'images/items/power-pellet.png';
        
        // Стены
        images.walls[WALL_TYPES.SOLID] = new Image();
        images.walls[WALL_TYPES.SOLID].onload = imageLoaded;
        images.walls[WALL_TYPES.SOLID].onerror = handleImageError;
        images.walls[WALL_TYPES.SOLID].src = 'images/walls/solid.png';
        
        images.walls[WALL_TYPES.BREAKABLE] = new Image();
        images.walls[WALL_TYPES.BREAKABLE].onload = imageLoaded;
        images.walls[WALL_TYPES.BREAKABLE].onerror = handleImageError;
        images.walls[WALL_TYPES.BREAKABLE].src = 'images/walls/breakable.png';
        
        images.walls[WALL_TYPES.TELEPORT] = new Image();
        images.walls[WALL_TYPES.TELEPORT].onload = imageLoaded;
        images.walls[WALL_TYPES.TELEPORT].onerror = handleImageError;
        images.walls[WALL_TYPES.TELEPORT].src = 'images/walls/teleport.png';
    });
}

function setupEventListeners() {
    // Клавиатура
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // Сенсорное управление (D-pad)
    if ('ontouchstart' in window) {
        const dPad = document.querySelector('.d-pad');
        if (dPad) dPad.style.display = 'flex';

        document.querySelectorAll('.d-pad-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const dir = e.target.dataset.direction;
                player.nextMove = dir; // Запоминаем направление
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                player.nextMove = null; // Сбрасываем направление
            });
        });
    }

    // Свайпы по всему экрану
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!touchStart) return;

        const touch = e.touches[0];
        const dx = touch.clientX - touchStart.x;
        const dy = touch.clientY - touchStart.y;

        // Определяем направление свайпа
        if (Math.abs(dx) > Math.abs(dy)) {
            player.nextMove = dx > 0 ? 'right' : 'left';
        } else {
            player.nextMove = dy > 0 ? 'down' : 'up';
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        player.nextMove = null; // Сбрасываем направление
        touchStart = null;
    }, { passive: false });
}

function handleSwipe() {
    if (!touchStart || !touchEnd || !player) return;
    
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    
    // Минимальная дистанция для распознавания свайпа
    const minDistance = 30;
    if (Math.abs(dx) < minDistance && Math.abs(dy) < minDistance) {
        touchStart = null;
        touchEnd = null;
        resetKeys(); // Сбрасываем управление при маленьком движении
        return;
    }
    
    if (Math.abs(dx) > Math.abs(dy)) {
        player.nextMove = dx > 0 ? 'right' : 'left';
    } else {
        player.nextMove = dy > 0 ? 'down' : 'up';
    }
    
    // Устанавливаем таймер для автоматического сброса движения через 200мс
    if (this.swipeTimeout) clearTimeout(this.swipeTimeout);
    this.swipeTimeout = setTimeout(() => {
        resetKeys();
        touchStart = null;
        touchEnd = null;
    }, 200);
    
    touchStart = null;
    touchEnd = null;
}

function resetGameState() {
    if (!window.gameData) {
        window.gameData = {
            users: [],
            settings: {
                musicEnabled: true,
                soundEnabled: true,
                musicVolume: 0.7,
                soundVolume: 0.7
            },
            gameState: {
                currentLevel: 1,
                unlockedLevels: Array(50).fill(false).map((_, i) => i < 5),
                levelScores: Array(50).fill(0),
                levelCompletion: Array(50).fill(false)
            }
        };
    }

    currentLevel = gameData.gameState?.currentLevel || 1;
    lives = characterLives[selectedCharacter] || 3;
    score = 0;
}

function generateLevel() {
    const levelData = window.LEVELS[currentLevel - 1]; // Используем window.LEVELS
    if (!levelData) return;
    
    walls = levelData.walls || [];
    teleports = levelData.teleports || [];
    
    player.x = levelData.playerSpawn?.x || 10;
    player.y = levelData.playerSpawn?.y || 10;
    player.dx = 0;
    player.dy = 0;
    player.nextMove = null;
    player.poweredUp = false;
    
    coins = levelData.coins || [];
    
    ghosts = [];
    (levelData.ghostSpawns || []).forEach((spawn, i) => {
        ghosts.push({
            x: spawn.x,
            y: spawn.y,
            dx: Math.random() > 0.5 ? 1 : -1,
            dy: Math.random() > 0.5 ? 1 : -1,
            speed: (levelData.difficulty?.ghostSpeed || 1) * (0.8 + Math.random() * 0.4),
            type: i % 3,
            behavior: Math.floor(Math.random() * 3),
            frightened: false,
            respawning: false
        });
    });
}

function startGame() {
    document.getElementById('game-ui').classList.add('active');
    gameRunning = true;
    resetGameState();
    generateLevel();
    
    document.getElementById('game-ui').style.display = 'block';
    document.getElementById('level-display').textContent = currentLevel;
    document.getElementById('lives-display').textContent = lives;
    document.getElementById('score-display').textContent = score;
    document.getElementById('total-score-display').textContent = totalScore;
    
    showScreen('game');
}

function gameLoop(timestamp) {
    if (!gameStartTime) gameStartTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (!ctx || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameRunning) {
        update(deltaTime);
        drawGame();
    }
    
    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    updatePlayer(deltaTime);
    updateGhosts(deltaTime);
    checkCollisions();
    checkWinCondition();
}

function updatePlayer(deltaTime) {
    const prevX = player.x;
    const prevY = player.y;
    const speed = characterSpeeds[selectedCharacter] * deltaTime / 1000;

    // Управление
    if (player.nextMove) {
        switch (player.nextMove) {
            case 'up':
                if (!isWall(player.x, player.y - 0.1)) player.dy = -speed;
                player.dx = 0;
                break;
            case 'down':
                if (!isWall(player.x, player.y + 0.1)) player.dy = speed;
                player.dx = 0;
                break;
            case 'left':
                if (!isWall(player.x - 0.1, player.y)) player.dx = -speed;
                player.dy = 0;
                break;
            case 'right':
                if (!isWall(player.x + 0.1, player.y)) player.dx = speed;
                player.dy = 0;
                break;
        }
    } else if (keys['ArrowUp']) {
        if (!isWall(player.x, player.y - 0.1)) player.dy = -speed;
        player.dx = 0;
    } else if (keys['ArrowDown']) {
        if (!isWall(player.x, player.y + 0.1)) player.dy = speed;
        player.dx = 0;
    } else if (keys['ArrowLeft']) {
        if (!isWall(player.x - 0.1, player.y)) player.dx = -speed;
        player.dy = 0;
    } else if (keys['ArrowRight']) {
        if (!isWall(player.x + 0.1, player.y)) player.dx = speed;
        player.dy = 0;
    }

    // Движение по X
    player.x += player.dx;
    if (isWall(player.x, player.y)) {
        player.x = prevX;
        player.dx = 0;
    }

    // Движение по Y
    player.y += player.dy;
    if (isWall(player.x, player.y)) {
        player.y = prevY;
        player.dy = 0;
    }

    // Притягивание к центру клетки при движении вдоль стен
    if (player.dx !== 0 && Math.abs(player.y - Math.round(player.y)) > 0.1) {
        player.y += (Math.round(player.y) - player.y) * 0.2;
    }
    if (player.dy !== 0 && Math.abs(player.x - Math.round(player.x)) > 0.1) {
        player.x += (Math.round(player.x) - player.x) * 0.2;
    }

    checkTeleports();
    
    if (player.poweredUp && Date.now() > player.powerEndTime) {
        player.poweredUp = false;
        document.getElementById('power-indicator').style.display = 'none';
    }
	
	    // Прилипание к центру клетки при приближении
    const snapThreshold = 0.1;
    if (Math.abs(player.x - Math.round(player.x)) < snapThreshold) {
        player.x = Math.round(player.x);
    }
    if (Math.abs(player.y - Math.round(player.y)) < snapThreshold) {
        player.y = Math.round(player.y);
    }
}

function updateGhosts(deltaTime) {
    ghosts.forEach(ghost => {
        if (Math.random() < 0.01) {
            ghost.dx = Math.random() > 0.5 ? 1 : -1;
            ghost.dy = Math.random() > 0.5 ? 1 : -1;
        }
        
        const newX = ghost.x + ghost.dx * ghost.speed * deltaTime / 1000;
        const newY = ghost.y + ghost.dy * ghost.speed * deltaTime / 1000;
        
        if (!isWall(newX, newY)) {
            ghost.x = newX;
            ghost.y = newY;
        } else {
            ghost.dx = Math.random() > 0.5 ? 1 : -1;
            ghost.dy = Math.random() > 0.5 ? 1 : -1;
        }
    });
}

function checkCollisions() {
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        if (Math.abs(player.x - coin.x) < 0.5 && Math.abs(player.y - coin.y) < 0.5) {
            if (coin.type === 'power') {
                score += POWER_PELLET_SCORE;
                player.poweredUp = true;
                player.powerEndTime = Date.now() + 10000;
                document.getElementById('power-indicator').style.display = 'block';
                playSound('power-pellet');
            } else {
                score += COIN_SCORE;
                playSound('coin');
            }
            coins.splice(i, 1);
            document.getElementById('score-display').textContent = score;
        }
    }
    
    ghosts.forEach(ghost => {
        if (Math.abs(player.x - ghost.x) < 0.5 && Math.abs(player.y - ghost.y) < 0.5) {
            if (player.poweredUp) {
                score += 200;
                playSound('eat-ghost');
                const spawn = window.LEVELS[currentLevel - 1].ghostSpawns[ghosts.indexOf(ghost) % window.LEVELS[currentLevel - 1].ghostSpawns.length];
                ghost.x = spawn.x;
                ghost.y = spawn.y;
                document.getElementById('score-display').textContent = score;
            } else {
                lives--;
                document.getElementById('lives-display').textContent = lives;
                playSound('lose-life');
                if (lives <= 0) {
                    gameOver();
                } else {
                    player.x = window.LEVELS[currentLevel - 1].playerSpawn.x;
                    player.y = window.LEVELS[currentLevel - 1].playerSpawn.y;
                }
            }
        }
    });
}

function checkTeleports() {
    teleports.forEach(teleport => {
        if (Math.abs(player.x - teleport.entry.x) < 0.5 && Math.abs(player.y - teleport.entry.y) < 0.5) {
            player.x = teleport.exit.x;
            player.y = teleport.exit.y;
            playSound('teleport');
        }
    });
}

function checkWinCondition() {
    if (coins.length === 0) {
        totalScore += score * currentLevel * LEVEL_SCORE_MULTIPLIER;
        gameData.gameState.levelScores[currentLevel - 1] = score;
        gameData.gameState.levelCompletion[currentLevel - 1] = true;
        
        if (currentLevel < window.LEVELS.length) {
            gameData.gameState.unlockedLevels[currentLevel] = true;
        }
        
        saveGameData();
        playSound('win');
        
        if (currentLevel < window.LEVELS.length) {
            gameData.gameState.currentLevel++;
            saveGameData();
            setTimeout(() => {
                startGame();
            }, 1000); // Даем небольшую задержку перед началом нового уровня
        } else {
            gameRunning = false;
            showScreen('main-menu');
            showNotification('Congratulations! You completed all levels!');
        }
    }
}

function gameOver() {
    document.getElementById('game-ui').classList.remove('active');
    gameRunning = false;
    playSound('gameover');
    showScreen('main-menu');
    showNotification('Game Over! Try again?');
    savePlayerData();
}

function drawGame() {
    // Рисуем только если изображения загружены
    if (images.gameBg && images.gameBg.complete) {
        ctx.drawImage(images.gameBg, 0, 0, canvas.width, canvas.height);
    }
    
    // Рисуем стены
    for (let y = 0; y < walls.length; y++) {
        for (let x = 0; x < walls[y].length; x++) {
            if (walls[y][x] !== 0 && images.walls[walls[y][x]] && images.walls[walls[y][x]].complete) {
                const tileSize = canvas.width / GRID_SIZE;
                ctx.drawImage(images.walls[walls[y][x]], x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
    
    // Рисуем монеты
    coins.forEach(coin => {
        const tileSize = canvas.width / GRID_SIZE;
        const img = coin.type === 'power' ? images.powerPellet : images.coin;
        if (img && img.complete) {
            ctx.drawImage(img, coin.x * tileSize, coin.y * tileSize, tileSize, tileSize);
        }
    });
    
    // Рисуем призраков
    ghosts.forEach(ghost => {
        const tileSize = canvas.width / GRID_SIZE;
        if (images.ghosts[ghost.type] && images.ghosts[ghost.type].complete) {
            ctx.drawImage(images.ghosts[ghost.type], ghost.x * tileSize, ghost.y * tileSize, tileSize, tileSize);
        }
    });
    
    // Рисуем игрока
    const tileSize = canvas.width / GRID_SIZE;
    if (images.characters[selectedCharacter] && images.characters[selectedCharacter].complete) {
        ctx.drawImage(images.characters[selectedCharacter], player.x * tileSize, player.y * tileSize, tileSize, tileSize);
    }
}

function isWall(x, y) {
    // Проверяем все четыре угла спрайта плюс центр
    const checkPoints = [
        [x + 0.2, y + 0.2],       // верхний левый (с отступом)
        [x + 0.8, y + 0.2],       // верхний правый
        [x + 0.2, y + 0.8],       // нижний левый
        [x + 0.8, y + 0.8],       // нижний правый
        [x + 0.5, y + 0.5]        // центр
    ];

    return checkPoints.some(point => {
        const gridX = Math.floor(point[0]);
        const gridY = Math.floor(point[1]);
        
        return gridY >= 0 && gridY < walls.length && 
               gridX >= 0 && gridX < walls[gridY].length && 
               walls[gridY][gridX] !== 0;
    });
}

window.addEventListener('load', initGame);
window.startGame = startGame;
window.showScreen = showScreen;
window.showNotification = showNotification;
window.savePlayerData = savePlayerData;
