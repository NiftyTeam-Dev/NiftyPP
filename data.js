// data.js
// Data management functions

// Save the current game state
function saveGameState() {
    // Archive current game if it's ending
    if (gameData.gameState.countdownEnd && Date.now() >= gameData.gameState.countdownEnd) {
        const sortedUsers = [...gameData.users].sort((a, b) => b.score - a.score);
        const topPlayers = sortedUsers.slice(0, 10).map(user => ({
            nickname: user.gameNickname,
            username: user.telegramUsername,
            score: user.score,
            maxLevel: user.maxLevel || 1
        }));
        
        gameData.gameState.archives.push({
            date: gameData.gameState.countdownEnd,
            topPlayers: topPlayers
        });
        
        // Reset countdown
        gameData.gameState.countdownEnd = null;
        gameData.gameState.gameActive = false;
    }
    
    // Save to localStorage
    localStorage.setItem('telegramPacmanData', JSON.stringify(gameData));
}

// Load the game state
function loadGameState() {
    const savedData = localStorage.getItem('telegramPacmanData');
    if (savedData) {
        gameData = JSON.parse(savedData);
        
        // Initialize default values if they don't exist
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
                // Новые поля для системы уровней
                currentLevel: 1,
                unlockedLevels: Array(50).fill(false).map((_, i) => i < 5), // Первые 5 уровней открыты
                levelScores: Array(50).fill(0),
                levelCompletion: Array(50).fill(false)
            };
        }
        
        if (!gameData.users) {
            gameData.users = [];
        } else {
            // Миграция для существующих пользователей
            gameData.users.forEach(user => {
                user.maxLevel = user.maxLevel || 1;
                user.levelProgress = user.levelProgress || Array(50).fill(false).map((_, i) => i < 1);
            });
        }
    }
}

// Функции для работы с настройками
function getSetting(name) {
    return gameData.settings[name];
}

function saveGameData() {
    localStorage.setItem('telegramPacmanData', JSON.stringify(gameData));
}

function loadGameData() {
    const savedData = localStorage.getItem('telegramPacmanData');
    if (savedData) gameData = JSON.parse(savedData);
}

// Функции для UI
function showScreen(screenId) {
    document.querySelectorAll('.menu').forEach(el => el.style.display = 'none');
    document.getElementById(screenId).style.display = 'flex';
    currentScreen = screenId;
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    document.getElementById('notification-text').textContent = message;
    notification.style.display = 'block';
}

document.getElementById('close-notification').addEventListener('click', () => {
    document.getElementById('notification').style.display = 'none';
});

// Initialize data
loadGameState();