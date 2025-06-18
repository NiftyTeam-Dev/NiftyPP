// game.js

// Game variables
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

// Game assets
let images = {
    background: null,
    gameBg: null,
    characters: [],
    ghosts: [],
    coin: null,
    powerPellet: null,
    walls: []
};

// Initialize the game
function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Load images
    loadImages();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize game state
    resetGameState();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Resize canvas to fit window
function resizeCanvas() {
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
}

// Load game images
function loadImages() {
    images.background = new Image();
    images.background.src = 'images/menu-bg.png';
    
    images.gameBg = new Image();
    images.gameBg.src = 'images/game-bg.png';
    
    // Load characters
    for (let i = 0; i < 3; i++) {
        images.characters[i] = new Image();
        images.characters[i].src = `images/characters/char${i+1}.png`;
        
        images.ghosts[i] = new Image();
        images.ghosts[i].src = `images/ghosts/ghost${i+1}.png`;
    }
    
    // Load items
    images.coin = new Image();
    images.coin.src = 'images/items/coin.png';
    
    images.powerPellet = new Image();
    images.powerPellet.src = 'images/items/power-pellet.png';
    
    // Load wall textures
    images.walls[WALL_TYPES.SOLID] = new Image();
    images.walls[WALL_TYPES.SOLID].src = 'images/walls/solid.png';
    
    images.walls[WALL_TYPES.BREAKABLE] = new Image();
    images.walls[WALL_TYPES.BREAKABLE].src = 'images/walls/breakable.png';
    
    images.walls[WALL_TYPES.TELEPORT] = new Image();
    images.walls[WALL_TYPES.TELEPORT].src = 'images/walls/teleport.png';
}

// Set up keyboard and touch controls
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
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStart = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!touchStart) return;
        
        touchEnd = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
        };
        
        handleSwipe();
    }, { passive: false });
}

// Handle swipe gestures for mobile
function handleSwipe() {
    if (!touchStart || !touchEnd) return;
    
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0) {
            player.nextMove = 'right';
        } else {
            player.nextMove = 'left';
        }
    } else {
        // Vertical swipe
        if (dy > 0) {
            player.nextMove = 'down';
        } else {
            player.nextMove = 'up';
        }
    }
    
    touchStart = null;
    touchEnd = null;
}

// Проверка на существование gameData
function resetGameState() {
    if (!window.gameData) {
        console.error('gameData is not initialized');
        return;
    }
    
    currentLevel = gameData.gameState.currentLevel;
    lives = characterLives[selectedCharacter];
    score = 0;

// Reset game state for a new game
function resetGameState() {
    currentLevel = gameData.gameState.currentLevel;
    lives = characterLives[selectedCharacter];
    score = 0;
    
    // Generate level from level data
    generateLevel();
    
    // Update UI
    updateLevelDisplay();
    updateLivesDisplay();
    updateScoreDisplay();
}

// Generate level based on current level
function generateLevel() {
    const levelData = LEVELS[currentLevel - 1];
    
    // Set up walls
    walls = levelData.walls;
    teleports = levelData.teleports;
    
    // Set player position
    player.x = levelData.playerSpawn.x;
    player.y = levelData.playerSpawn.y;
    player.dx = 0;
    player.dy = 0;
    player.nextMove = null;
    player.poweredUp = false;
    
    // Set up coins
    coins = levelData.coins;
    
    // Set up ghosts
    ghosts = [];
    levelData.ghostSpawns.forEach((spawn, i) => {
        ghosts.push({
            x: spawn.x,
            y: spawn.y,
            dx: Math.random() > 0.5 ? 1 : -1,
            dy: Math.random() > 0.5 ? 1 : -1,
            speed: levelData.difficulty.ghostSpeed * (0.8 + Math.random() * 0.4),
            type: i % 3,
            behavior: Math.floor(Math.random() * 3),
            frightened: false,
            respawning: false
        });
    });
}

// Main game loop
function gameLoop(timestamp) {
    if (!gameStartTime) gameStartTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameRunning) {
        update(deltaTime);
        drawGame();
    }
    
    requestAnimationFrame(gameLoop);
}

// Update game state
function update(deltaTime) {
    // Handle power-up timer
    if (player.poweredUp && Date.now() > player.powerEndTime) {
        player.poweredUp = false;
        ghosts.forEach(ghost => ghost.frightened = false);
    }
    
    handleInput();
    movePlayer(deltaTime);
    moveGhosts(deltaTime);
    checkCollisions();
    
    if (coins.length === 0) {
        levelComplete();
    }
}

// Handle player input
function handleInput() {
    if (player.nextMove) {
        switch (player.nextMove) {
            case 'up': player.dx = 0; player.dy = -1; break;
            case 'down': player.dx = 0; player.dy = 1; break;
            case 'left': player.dx = -1; player.dy = 0; break;
            case 'right': player.dx = 1; player.dy = 0; break;
        }
        player.nextMove = null;
    } else if (keys['ArrowUp'] || keys['w']) {
        player.dx = 0;
        player.dy = -1;
    } else if (keys['ArrowDown'] || keys['s']) {
        player.dx = 0;
        player.dy = 1;
    } else if (keys['ArrowLeft'] || keys['a']) {
        player.dx = -1;
        player.dy = 0;
    } else if (keys['ArrowRight'] || keys['d']) {
        player.dx = 1;
        player.dy = 0;
    }
}

// Move player with wall collision
function movePlayer(deltaTime) {
    const speed = characterSpeeds[selectedCharacter];
    const moveAmount = speed * deltaTime / 1000;
    
    // Check movement in X direction
    let newX = player.x + player.dx * moveAmount;
    if (!isWallCollision(newX, player.y)) {
        player.x = newX;
    } else {
        playSound('wall-bump');
    }
    
    // Check movement in Y direction
    let newY = player.y + player.dy * moveAmount;
    if (!isWallCollision(player.x, newY)) {
        player.y = newY;
    } else {
        playSound('wall-bump');
    }
    
    checkTeleports();
}

// Check if position collides with wall
function isWallCollision(x, y) {
    const gridX = Math.floor(x);
    const gridY = Math.floor(y);
    
    if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) {
        return true;
    }
    
    return walls[gridY] && walls[gridY][gridX] === WALL_TYPES.SOLID;
}

// Check teleport walls
function checkTeleports() {
    const gridX = Math.floor(player.x);
    const gridY = Math.floor(player.y);
    
    if (walls[gridY] && walls[gridY][gridX] === WALL_TYPES.TELEPORT) {
        const teleport = teleports.find(t => 
            (t.entry.x === gridX && t.entry.y === gridY) || 
            (t.exit.x === gridX && t.exit.y === gridY));
        
        if (teleport && (!teleport.lastUsed || Date.now() - teleport.lastUsed > teleport.cooldown)) {
            const target = teleport.entry.x === gridX && teleport.entry.y === gridY ? 
                teleport.exit : teleport.entry;
            
            player.x = target.x + 0.5;
            player.y = target.y + 0.5;
            teleport.lastUsed = Date.now();
            playSound('teleport');
        }
    }
}

// Move ghosts
function moveGhosts(deltaTime) {
    ghosts.forEach(ghost => {
        // Simple AI with different behaviors
        if (Math.random() < 0.02) {
            if (ghost.behavior === 0) { // Random
                if (Math.random() > 0.5) {
                    ghost.dx = Math.random() > 0.5 ? 1 : -1;
                    ghost.dy = 0;
                } else {
                    ghost.dy = Math.random() > 0.5 ? 1 : -1;
                    ghost.dx = 0;
                }
            } else if (ghost.behavior === 1) { // Chase player
                if (Math.abs(player.x - ghost.x) > Math.abs(player.y - ghost.y)) {
                    ghost.dx = player.x > ghost.x ? 1 : -1;
                    ghost.dy = 0;
                } else {
                    ghost.dy = player.y > ghost.y ? 1 : -1;
                    ghost.dx = 0;
                }
            } else { // Run from player when powered up
                if (player.poweredUp) {
                    if (Math.abs(player.x - ghost.x) > Math.abs(player.y - ghost.y)) {
                        ghost.dx = player.x > ghost.x ? -1 : 1;
                        ghost.dy = 0;
                    } else {
                        ghost.dy = player.y > ghost.y ? -1 : 1;
                        ghost.dx = 0;
                    }
                }
            }
        }
        
        // Move ghost
        ghost.x += ghost.dx * ghost.speed * deltaTime / 1000;
        ghost.y += ghost.dy * ghost.speed * deltaTime / 1000;
        
        // Bounce off walls
        if (ghost.x < 0 || ghost.x >= GRID_SIZE) {
            ghost.dx *= -1;
            ghost.x = Math.max(0, Math.min(GRID_SIZE - 1, ghost.x));
        }
        if (ghost.y < 0 || ghost.y >= GRID_SIZE) {
            ghost.dy *= -1;
            ghost.y = Math.max(0, Math.min(GRID_SIZE - 1, ghost.y));
        }
    });
}

// Check all collisions
function checkCollisions() {
    checkCoinCollisions();
    checkGhostCollisions();
}

// Check coin collisions
function checkCoinCollisions() {
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        if (Math.abs(player.x - coin.x) < 0.8 && Math.abs(player.y - coin.y) < 0.8) {
            coins.splice(i, 1);
            
            if (coin.type === 'power') {
                score += POWER_PELLET_SCORE * currentLevel;
                totalScore += POWER_PELLET_SCORE * currentLevel;
                player.poweredUp = true;
                player.powerEndTime = Date.now() + 10000; // 10 seconds
                ghosts.forEach(ghost => ghost.frightened = true);
                playSound('power-pellet');
            } else {
                score += COIN_SCORE * currentLevel;
                totalScore += COIN_SCORE * currentLevel;
                playSound('coin');
            }
            
            updateScoreDisplay();
            checkCharacterUnlocks();
        }
    }
}

// Check ghost collisions
function checkGhostCollisions() {
    for (let i = ghosts.length - 1; i >= 0; i--) {
        const ghost = ghosts[i];
        if (Math.abs(player.x - ghost.x) < 0.8 && Math.abs(player.y - ghost.y) < 0.8) {
            if (player.poweredUp && ghost.frightened) {
                // Eat ghost
                score += 200 * currentLevel;
                totalScore += 200 * currentLevel;
                ghosts.splice(i, 1);
                playSound('eat-ghost');
                updateScoreDisplay();
            } else if (!ghost.respawning) {
                // Lose life
                lives--;
                playSound('lose-life');
                updateLivesDisplay();
                
                // Reset positions
                player.x = Math.floor(GRID_SIZE / 2);
                player.y = Math.floor(GRID_SIZE / 2);
                player.dx = 0;
                player.dy = 0;
                
                if (lives <= 0) {
                    gameOver();
                }
                
                break;
            }
        }
    }
}

// Level complete
function levelComplete() {
    // Save level completion
    gameData.gameState.levelCompletion[currentLevel - 1] = true;
    gameData.gameState.levelScores[currentLevel - 1] = Math.max(
        gameData.gameState.levelScores[currentLevel - 1],
        score
    );
    
    // Unlock next level if not already unlocked
    if (currentLevel < LEVELS.length && !gameData.gameState.unlockedLevels[currentLevel]) {
        gameData.gameState.unlockedLevels[currentLevel] = true;
    }
    
    playSound('win');
    currentLevel++;
    gameData.gameState.currentLevel = currentLevel;
    saveGameData();
    
    // Show level complete message
    showNotification(`Level Complete! Unlocked Level ${currentLevel}`);
    
    // Generate new level after delay
    setTimeout(() => {
        if (currentLevel <= LEVELS.length) {
            resetGameState();
        } else {
            gameComplete();
        }
    }, 2000);
}

// Game over
function gameOver() {
    gameRunning = false;
    playSound('gameover');
    savePlayerData();
    showNotification(`Game Over! Final Score: ${score}`);
    setTimeout(() => showScreen('main-menu'), 3000);
}

// All levels completed
function gameComplete() {
    gameRunning = false;
    playSound('win');
    savePlayerData();
    showNotification(`Congratulations! You completed all levels!`);
    setTimeout(() => showScreen('main-menu'), 5000);
}

// Draw the game
function drawGame() {
    const tileSize = canvas.width / GRID_SIZE;
    
    // Draw background
    if (images.gameBg.complete) {
        const pattern = ctx.createPattern(images.gameBg, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#000033';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw walls
    for (let y = 0; y < walls.length; y++) {
        for (let x = 0; x < walls[y].length; x++) {
            if (walls[y][x] !== 0) {
                if (images.walls[walls[y][x]] && images.walls[walls[y][x]].complete) {
                    ctx.drawImage(
                        images.walls[walls[y][x]],
                        x * tileSize,
                        y * tileSize,
                        tileSize,
                        tileSize
                    );
                } else {
                    // Fallback colors
                    const colors = {
                        [WALL_TYPES.SOLID]: '#0000AA',
                        [WALL_TYPES.BREAKABLE]: '#AA0000',
                        [WALL_TYPES.TELEPORT]: '#00AA00'
                    };
                    ctx.fillStyle = colors[walls[y][x]] || '#0000AA';
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }
    }
    
    // Draw coins
    coins.forEach(coin => {
        if (coin.type === 'power' && images.powerPellet.complete) {
            ctx.drawImage(
                images.powerPellet,
                coin.x * tileSize,
                coin.y * tileSize,
                tileSize,
                tileSize
            );
        } else if (images.coin.complete) {
            ctx.drawImage(
                images.coin,
                coin.x * tileSize,
                coin.y * tileSize,
                tileSize,
                tileSize
            );
        } else {
            ctx.fillStyle = coin.type === 'power' ? '#FFFFFF' : '#FFD700';
            ctx.beginPath();
            ctx.arc(
                (coin.x + 0.5) * tileSize,
                (coin.y + 0.5) * tileSize,
                tileSize * (coin.type === 'power' ? 0.4 : 0.3),
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    });
    
    // Draw ghosts
    ghosts.forEach(ghost => {
        if (player.poweredUp && ghost.frightened) {
            ctx.fillStyle = '#0000FF'; // Blue when frightened
        } else if (images.ghosts[ghost.type].complete) {
            ctx.drawImage(
                images.ghosts[ghost.type],
                ghost.x * tileSize,
                ghost.y * tileSize,
                tileSize,
                tileSize
            );
            return;
        } else {
            ctx.fillStyle = ['#FF0000', '#00FF00', '#0000FF'][ghost.type];
        }
        
        // Draw ghost shape
        ctx.beginPath();
        ctx.arc(
            (ghost.x + 0.5) * tileSize,
            (ghost.y + 0.3) * tileSize,
            tileSize * 0.4,
            Math.PI,
            0,
            false
        );
        ctx.lineTo(
            (ghost.x + 0.8) * tileSize,
            (ghost.y + 0.7) * tileSize
        );
        ctx.lineTo(
            (ghost.x + 0.5) * tileSize,
            (ghost.y + 0.5) * tileSize
        );
        ctx.lineTo(
            (ghost.x + 0.2) * tileSize,
            (ghost.y + 0.7) * tileSize
        );
        ctx.closePath();
        ctx.fill();
    });
    
    // Draw player
    if (images.characters[selectedCharacter].complete) {
        ctx.drawImage(
            images.characters[selectedCharacter],
            player.x * tileSize,
            player.y * tileSize,
            tileSize,
            tileSize
        );
    } else {
        ctx.fillStyle = player.poweredUp ? '#FFA500' : '#FFFF00';
        ctx.beginPath();
        ctx.arc(
            (player.x + 0.5) * tileSize,
            (player.y + 0.5) * tileSize,
            tileSize * 0.4,
            0.2 * Math.PI,
            1.8 * Math.PI
        );
        ctx.lineTo(
            (player.x + 0.5) * tileSize,
            (player.y + 0.5) * tileSize
        );
        ctx.fill();
    }
}

// Start the game
function startGame() {
    gameRunning = true;
    resetGameState();
    showScreen('game-ui');
    
    // Start music
    const bgMusic = document.getElementById('bg-music');
    if (getSetting('musicEnabled')) {
        bgMusic.volume = getSetting('musicVolume') || 0.5;
        bgMusic.currentTime = 0;
        bgMusic.play();
    }
    
    // Load player data
    loadPlayerData();
}

// Update UI displays
function updateLevelDisplay() {
    document.getElementById('level-display').textContent = currentLevel;
}

function updateLivesDisplay() {
    const livesDisplay = document.getElementById('lives-display');
    livesDisplay.textContent = lives;
    
    if (lives === 1) {
        livesDisplay.classList.add('blink');
    } else {
        livesDisplay.classList.remove('blink');
    }
}

function updateScoreDisplay() {
    document.getElementById('score-display').textContent = score;
    document.getElementById('total-score-display').textContent = totalScore;
}

// Initialize the game when the window loads
window.addEventListener('load', initGame);
window.startGame = startGame;
