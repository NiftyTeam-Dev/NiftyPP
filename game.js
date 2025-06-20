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
let touchId = null;
let touchStartX = 0;
let touchStartY = 0;

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
        const totalImages = 11;
        
        function imageLoaded() {
            loadedCount++;
            if (loadedCount === totalImages) resolve();
        }
        
        function handleImageError(error) {
            console.error('Error loading image:', error);
            reject(error);
        }
        
        images.background = new Image();
        images.background.onload = imageLoaded;
        images.background.onerror = handleImageError;
        images.background.src = 'images/menu-bg.png';
        
        images.gameBg = new Image();
        images.gameBg.onload = imageLoaded;
        images.gameBg.onerror = handleImageError;
        images.gameBg.src = 'images/game-bg.png';
        
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
        
        images.coin = new Image();
        images.coin.onload = imageLoaded;
        images.coin.onerror = handleImageError;
        images.coin.src = 'images/items/coin.png';
        
        images.powerPellet = new Image();
        images.powerPellet.onload = imageLoaded;
        images.powerPellet.onerror = handleImageError;
        images.powerPellet.src = 'images/items/power-pellet.png';
        
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
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Touch controls
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
    // D-pad controls for mobile
    if ('ontouchstart' in window) {
        const dPad = document.querySelector('.d-pad');
        if (dPad) {
            dPad.style.display = 'grid';
            
            document.querySelectorAll('.d-pad-btn').forEach(btn => {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    const dir = e.target.dataset.direction;
                    setDirectionFromDPad(dir);
                });
                
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    resetDPad();
                });
                
                btn.addEventListener('touchcancel', (e) => {
                    e.preventDefault();
                    resetDPad();
                });
            });
        }
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        touchId = e.touches[0].identifier;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!touchId) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            
            if (absDx > 10 || absDy > 10) {
                if (absDx > absDy) {
                    player.nextMove = dx > 0 ? 'right' : 'left';
                } else {
                    player.nextMove = dy > 0 ? 'down' : 'up';
                }
            }
            break;
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!touchId) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
            player.nextMove = null;
            touchId = null;
            break;
        }
    }
}

function setDirectionFromDPad(direction) {
    resetKeys();
    switch (direction) {
        case 'up': keys['ArrowUp'] = true; break;
        case 'down': keys['ArrowDown'] = true; break;
        case 'left': keys['ArrowLeft'] = true; break;
        case 'right': keys['ArrowRight'] = true; break;
    }
}

function resetDPad() {
    resetKeys();
}

function resetKeys() {
    keys['ArrowUp'] = false;
    keys['ArrowDown'] = false;
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    player.nextMove = null;
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
    const levelData = window.LEVELS[currentLevel - 1];
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

    // Determine direction from keyboard, D-pad or swipe
    let direction = null;
    if (keys['ArrowUp']) direction = 'up';
    else if (keys['ArrowDown']) direction = 'down';
    else if (keys['ArrowLeft']) direction = 'left';
    else if (keys['ArrowRight']) direction = 'right';
    else if (player.nextMove) direction = player.nextMove;

    // Apply movement
    switch (direction) {
        case 'up':
            player.dy = -characterSpeeds[selectedCharacter];
            player.dx = 0;
            break;
        case 'down':
            player.dy = characterSpeeds[selectedCharacter];
            player.dx = 0;
            break;
        case 'left':
            player.dx = -characterSpeeds[selectedCharacter];
            player.dy = 0;
            break;
        case 'right':
            player.dx = characterSpeeds[selectedCharacter];
            player.dy = 0;
            break;
        default:
            player.dx = 0;
            player.dy = 0;
    }

    // Try X movement
    player.x += player.dx * deltaTime / 1000;
    if (isWall(player.x, player.y)) {
        player.x = prevX;
        playSound('wall-bump');
    }

    // Try Y movement
    player.y += player.dy * deltaTime / 1000;
    if (isWall(player.x, player.y)) {
        player.y = prevY;
        playSound('wall-bump');
    }

    checkTeleports();
    
    if (player.poweredUp && Date.now() > player.powerEndTime) {
        player.poweredUp = false;
        document.getElementById('power-indicator').style.display = 'none';
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
            }, 1000);
        } else {
            gameRunning = false;
            showScreen('main-menu');
            showNotification('Congratulations! You completed all levels!');
        }
    }
}

function gameOver() {
    gameRunning = false;
    playSound('gameover');
    showScreen('main-menu');
    showNotification('Game Over! Try again?');
    savePlayerData();
}

function drawGame() {
    if (images.gameBg && images.gameBg.complete) {
        ctx.drawImage(images.gameBg, 0, 0, canvas.width, canvas.height);
    }
    
    for (let y = 0; y < walls.length; y++) {
        for (let x = 0; x < walls[y].length; x++) {
            if (walls[y][x] !== 0 && images.walls[walls[y][x]] && images.walls[walls[y][x]].complete) {
                const tileSize = canvas.width / GRID_SIZE;
                ctx.drawImage(images.walls[walls[y][x]], x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
    
    coins.forEach(coin => {
        const tileSize = canvas.width / GRID_SIZE;
        const img = coin.type === 'power' ? images.powerPellet : images.coin;
        if (img && img.complete) {
            ctx.drawImage(img, coin.x * tileSize, coin.y * tileSize, tileSize, tileSize);
        }
    });
    
    ghosts.forEach(ghost => {
        const tileSize = canvas.width / GRID_SIZE;
        if (images.ghosts[ghost.type] && images.ghosts[ghost.type].complete) {
            ctx.drawImage(images.ghosts[ghost.type], ghost.x * tileSize, ghost.y * tileSize, tileSize, tileSize);
        }
    });
    
    const tileSize = canvas.width / GRID_SIZE;
    if (images.characters[selectedCharacter] && images.characters[selectedCharacter].complete) {
        ctx.drawImage(images.characters[selectedCharacter], player.x * tileSize, player.y * tileSize, tileSize, tileSize);
    }
}

function isWall(x, y) {
    const checkPoints = [
        [x, y],
        [x + 0.9, y],
        [x, y + 0.9],
        [x + 0.9, y + 0.9]
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
