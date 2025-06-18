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
    
    loadImages();
    setupEventListeners();
    resetGameState();
    
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    if (!canvas) return;
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
}

function loadImages() {
    images.background = new Image();
    images.background.src = 'images/menu-bg.png';
    
    images.gameBg = new Image();
    images.gameBg.src = 'images/game-bg.png';
    
    for (let i = 0; i < 3; i++) {
        images.characters[i] = new Image();
        images.characters[i].src = `images/characters/char${i+1}.png`;
        
        images.ghosts[i] = new Image();
        images.ghosts[i].src = `images/ghosts/ghost${i+1}.png`;
    }
    
    images.coin = new Image();
    images.coin.src = 'images/items/coin.png';
    
    images.powerPellet = new Image();
    images.powerPellet.src = 'images/items/power-pellet.png';
    
    images.walls[WALL_TYPES.SOLID] = new Image();
    images.walls[WALL_TYPES.SOLID].src = 'images/walls/solid.png';
    
    images.walls[WALL_TYPES.BREAKABLE] = new Image();
    images.walls[WALL_TYPES.BREAKABLE].src = 'images/walls/breakable.png';
    
    images.walls[WALL_TYPES.TELEPORT] = new Image();
    images.walls[WALL_TYPES.TELEPORT].src = 'images/walls/teleport.png';
}

function setupEventListeners() {
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
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

function handleSwipe() {
    if (!touchStart || !touchEnd || !player) return;
    
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
        player.nextMove = dx > 0 ? 'right' : 'left';
    } else {
        player.nextMove = dy > 0 ? 'down' : 'up';
    }
    
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
    const levelData = LEVELS[currentLevel - 1];
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

// Остальные функции game.js остаются без изменений, но должны включать аналогичные проверки
// на существование элементов и обработку неопределенных значений

window.addEventListener('load', initGame);
window.startGame = startGame;
