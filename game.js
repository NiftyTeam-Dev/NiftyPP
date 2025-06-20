// game.js (исправленная версия)
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
let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};
let touchStart = null;
let touchEnd = null;

// ... (остальные переменные и функции остаются без изменений до setupEventListeners)

function setupEventListeners() {
    // Клавиатура - упрощенная и надежная версия
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            keys[e.key] = true;
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            keys[e.key] = false;
            e.preventDefault();
        }
    });

    // Надежная обработка сенсорного D-pad
    const dPad = document.querySelector('.d-pad');
    if (dPad) {
        dPad.style.display = 'flex';
        
        const handleDPadTouch = (e) => {
            const dir = e.target.dataset.direction;
            if (dir) {
                player.nextMove = dir;
                e.preventDefault();
            }
        };

        const handleDPadRelease = (e) => {
            const dir = e.target.dataset.direction;
            if (dir && player.nextMove === dir) {
                player.nextMove = null;
                e.preventDefault();
            }
        };

        document.querySelectorAll('.d-pad-btn').forEach(btn => {
            btn.addEventListener('touchstart', handleDPadTouch, {passive: false});
            btn.addEventListener('touchend', handleDPadRelease, {passive: false});
            btn.addEventListener('touchcancel', handleDPadRelease, {passive: false});
        });
    }

    // Надежная обработка свайпов
    const handleTouchStart = (e) => {
        if (e.touches.length > 0) {
            touchStart = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            touchEnd = null;
            e.preventDefault();
        }
    };

    const handleTouchMove = (e) => {
        if (touchStart && e.touches.length > 0) {
            touchEnd = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            e.preventDefault();
        }
    };

    const handleTouchEnd = (e) => {
        if (touchStart && touchEnd) {
            handleSwipe();
        }
        touchStart = null;
        touchEnd = null;
        e.preventDefault();
    };

    canvas.addEventListener('touchstart', handleTouchStart, {passive: false});
    canvas.addEventListener('touchmove', handleTouchMove, {passive: false});
    canvas.addEventListener('touchend', handleTouchEnd, {passive: false});
    canvas.addEventListener('touchcancel', handleTouchEnd, {passive: false});
}

function handleSwipe() {
    if (!touchStart || !touchEnd) return;
    
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    const minDistance = 30;
    
    if (Math.abs(dx) < minDistance && Math.abs(dy) < minDistance) return;
    
    // Сбрасываем все предыдущие направления
    resetKeys();
    
    if (Math.abs(dx) > Math.abs(dy)) {
        // Горизонтальный свайп
        keys[dx > 0 ? 'ArrowRight' : 'ArrowLeft'] = true;
    } else {
        // Вертикальный свайп
        keys[dy > 0 ? 'ArrowDown' : 'ArrowUp'] = true;
    }
    
    // Автоматический сброс через 200 мс
    if (this.swipeTimeout) clearTimeout(this.swipeTimeout);
    this.swipeTimeout = setTimeout(resetKeys, 200);
}

function resetKeys() {
    keys.ArrowUp = false;
    keys.ArrowDown = false;
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    player.nextMove = null;
}

function updatePlayer(deltaTime) {
    const prevX = player.x;
    const prevY = player.y;
    const speed = characterSpeeds[selectedCharacter] * deltaTime / 1000;

    // Сбрасываем движение перед вычислением нового
    player.dx = 0;
    player.dy = 0;

    // Приоритет у D-pad (если есть активное направление)
    if (player.nextMove) {
        switch (player.nextMove) {
            case 'up': player.dy = -speed; break;
            case 'down': player.dy = speed; break;
            case 'left': player.dx = -speed; break;
            case 'right': player.dx = speed; break;
        }
    } 
    // Затем проверяем клавиши и свайпы
    else {
        if (keys.ArrowUp) player.dy = -speed;
        if (keys.ArrowDown) player.dy = speed;
        if (keys.ArrowLeft) player.dx = -speed;
        if (keys.ArrowRight) player.dx = speed;
    }

    // Проверка столкновений с стенами
    const newX = player.x + player.dx;
    const newY = player.y + player.dy;
    
    if (!isWall(newX, player.y)) {
        player.x = newX;
    } else {
        player.dx = 0;
    }
    
    if (!isWall(player.x, newY)) {
        player.y = newY;
    } else {
        player.dy = 0;
    }

    // Привязка к центру клетки при приближении
    const snapThreshold = 0.1;
    if (Math.abs(player.x - Math.round(player.x)) < snapThreshold) {
        player.x = Math.round(player.x);
    }
    if (Math.abs(player.y - Math.round(player.y)) < snapThreshold) {
        player.y = Math.round(player.y);
    }

    checkTeleports();
    
    // Проверка времени действия power-up
    if (player.poweredUp && Date.now() > player.powerEndTime) {
        player.poweredUp = false;
        document.getElementById('power-indicator').style.display = 'none';
    }
}

// ... (остальной код остается без изменений)

window.addEventListener('load', initGame);
window.startGame = startGame;
window.showScreen = showScreen;
window.showNotification = showNotification;
window.savePlayerData = savePlayerData;
