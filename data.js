// data.js
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

function getSetting(name) {
    if (!gameData || !gameData.settings) {
        console.warn('gameData.settings not initialized, returning default');
        return name === 'musicEnabled' || name === 'soundEnabled' ? true : 0.7;
    }
    return gameData.settings[name];
}

function saveGameState() {
    if (gameData.gameState?.countdownEnd && Date.now() >= gameData.gameState.countdownEnd) {
        const sortedUsers = [...(gameData.users || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
        const topPlayers = sortedUsers.slice(0, 10).map(user => ({
            nickname: user.gameNickname || 'Unknown',
            username: user.telegramUsername || '',
            score: user.score || 0,
            maxLevel: user.maxLevel || 1
        }));
        
        gameData.gameState.archives = gameData.gameState.archives || [];
        gameData.gameState.archives.push({
            date: gameData.gameState.countdownEnd,
            topPlayers: topPlayers
        });
        
        gameData.gameState.countdownEnd = null;
        gameData.gameState.gameActive = false;
    }
    
    localStorage.setItem('telegramPacmanData', JSON.stringify(gameData));
}

function loadGameState() {
    const savedData = localStorage.getItem('telegramPacmanData');
    if (savedData) {
        gameData = JSON.parse(savedData);
        
        if (!gameData.settings) {
            gameData.settings = {
                musicEnabled: true,
                soundEnabled: true,
                musicVolume: 0.7,
                soundVolume: 0.7
            };
        }
        
        if (!gameData.gameState) {
            gameData.gameState = {
                countdownEnd: null,
                gameActive: false,
                topPlayers: [],
                archives: [],
                feedback: [],
                admins: ['@admin1'],
                characterUnlocks: [0, 500, 1500],
                characterSpeeds: [5, 6, 7],
                characterLives: [3, 4, 4],
                coinValue: 10,
                currentLevel: 1,
                unlockedLevels: Array(50).fill(false).map((_, i) => i < 5),
                levelScores: Array(50).fill(0),
                levelCompletion: Array(50).fill(false)
            };
        }
        
        if (!gameData.users) {
            gameData.users = [];
        } else {
            gameData.users.forEach(user => {
                user.maxLevel = user.maxLevel || 1;
                user.levelProgress = user.levelProgress || Array(50).fill(false).map((_, i) => i < 1);
            });
        }
    }
}

function saveGameData() {
    localStorage.setItem('telegramPacmanData', JSON.stringify(gameData));
}

function loadGameData() {
    const savedData = localStorage.getItem('telegramPacmanData');
    if (savedData) gameData = JSON.parse(savedData);
}

function showScreen(screenId) {
    const menus = document.querySelectorAll('.menu');
    if (menus) {
        menus.forEach(el => el.style.display = 'none');
    }
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.style.display = 'flex';
    }
    currentScreen = screenId;
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    if (notification && notificationText) {
        notificationText.textContent = message;
        notification.style.display = 'block';
    }
}

document.getElementById('close-notification')?.addEventListener('click', () => {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.style.display = 'none';
    }
});

loadGameState();
