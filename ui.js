// ui.js
// UI Management
let currentScreen = 'main-menu';
let currentUser = null;
let gameData = {
    users: [],
    settings: {
        musicEnabled: true,
        soundEnabled: true,
        musicVolume: 0.7,
        soundVolume: 0.7
    },
    gameState: {
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
    }
};


//Инициализация getSettings
function initSettings() {
    document.getElementById('music-toggle').checked = getSetting('musicEnabled');
    document.getElementById('sound-toggle').checked = getSetting('soundEnabled');
    document.getElementById('music-volume').value = getSetting('musicVolume');
    document.getElementById('sound-volume').value = getSetting('soundVolume');
    
    // Обработчики для элементов настроек
    document.getElementById('music-toggle').addEventListener('change', (e) => {
        gameData.settings.musicEnabled = e.target.checked;
        saveGameData();
    });
    document.getElementById('sound-toggle').addEventListener('change', (e) => {
        gameData.settings.soundEnabled = e.target.checked;
        saveGameData();
    });
    document.getElementById('music-volume').addEventListener('input', (e) => {
        gameData.settings.musicVolume = parseFloat(e.target.value);
        saveGameData();
    });
    document.getElementById('sound-volume').addEventListener('input', (e) => {
        gameData.settings.soundVolume = parseFloat(e.target.value);
        saveGameData();
    });
}


function updateLevelProgressUI() {
    const progressBar = document.getElementById('level-progress');
    if (!progressBar) return;

    // Инициализация при первом запуске
    if (!gameData.gameState) {
        gameData.gameState = {
            currentLevel: 1,
            unlockedLevels: Array(50).fill(false).map((_, i) => i < 5),
            levelScores: Array(50).fill(0),
            levelCompletion: Array(50).fill(false)
        };
    }

    const completion = gameData.gameState.levelCompletion || [];
    const unlocked = gameData.gameState.unlockedLevels || [];
    
    const completed = completion.filter(x => x).length;
    const total = unlocked.filter(x => x).length;
    
    progressBar.innerHTML = `
        <div class="progress-label">Progress: ${completed}/${total} levels</div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${total > 0 ? (completed/total)*100 : 0}%"></div>
        </div>
    `;
}

// Initialize UI
function initUI() {
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
    loadGameData();
    checkTelegramUser();
    setupButtonListeners();
    initSettings();
    showScreen('main-menu');
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Проверка пользователя Telegram (обновлено для уровней)
function checkTelegramUser() {
    const tgUser = {
        username: '@testuser' + Math.floor(Math.random() * 1000),
        first_name: 'Test',
        last_name: 'User'
    };
    
    currentUser = {
        telegramUsername: tgUser.username,
        gameNickname: '',
        score: 0,
        unlockedCharacters: [true, false, false],
        lastPlayed: new Date(),
        maxLevel: 1,
        levelProgress: Array(50).fill(false).map((_, i) => i < 1)
    };
    
    const existingUser = gameData.users.find(u => u.telegramUsername === tgUser.username);
    if (existingUser) {
        currentUser = existingUser;
        // Миграция для старых пользователей
        if (!currentUser.maxLevel) {
            currentUser.maxLevel = 1;
            currentUser.levelProgress = Array(50).fill(false).map((_, i) => i < 1);
        }
    } else {
        promptForNickname();
    }
}

// Настройка кнопок (добавлены новые обработчики)
function setupButtonListeners() {
    // Существующие кнопки...
    
    // Новые кнопки для системы уровней
	document.getElementById('start-game').addEventListener('click', () => {
    if (typeof startGame === 'function') {
        if (gameData.gameState.gameActive) {
            startGame();
        } else {
            showLevelSelectOrStart();
        }
    } else {
        console.error('startGame function not found');
        showNotification('Game initialization error');
    }
});
    
    document.getElementById('level-select').addEventListener('click', () => {
        showScreen('level-select-menu');
        updateLevelSelectionUI();
    });
    
    // Новые обработчики для кнопок "Назад"
    document.getElementById('back-to-main-from-levels').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-main').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-main2').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-main3').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-main4').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-main5').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-main6').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-admin-main').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-game-menu').addEventListener('click', () => showScreen('main-menu'));

    // Обработчик для кнопки админа
    document.getElementById('admin-login').addEventListener('click', () => {
        showScreen('admin-login-menu');
    });
	
	// Подтверждение кнопки входа в интерфейс администратора
	document.getElementById('admin-login-submit').addEventListener('click', () => {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    // Простая проверка (в реальном приложении нужно использовать безопасную аутентификацию)
    if (username === 'admin' && password === 'admin123') {
        showScreen('admin-panel');
    } else {
        showNotification('Invalid admin credentials');
    }
});

    // Закрытие уведомления
    document.getElementById('close-notification').addEventListener('click', () => {
        document.getElementById('notification').style.display = 'none';
    });
    
    // Другие существующие обработчики...
	document.getElementById('characters').addEventListener('click', showCharacterSelection);
	document.getElementById('stats').addEventListener('click', () => {
    showScreen('stats-menu');
    updateStatsUI();
});
	document.getElementById('settings').addEventListener('click', () => showScreen('settings-menu'));
	document.getElementById('feedback').addEventListener('click', () => showScreen('feedback-menu'));
	document.getElementById('rules').addEventListener('click', () => showScreen('rules-menu'));
	document.getElementById('invite').addEventListener('click', () => {
    showNotification('Share this link with friends: ' + window.location.href);
});
}

// Показывает выбор уровня или сразу начинает игру
function showLevelSelectOrStart() {
    if (gameData.gameState.unlockedLevels.filter(Boolean).length > 1) {
        showScreen('level-select-menu');
        updateLevelSelectionUI();
    } else {
        startGame();
    }
}

// Обновляет UI выбора уровня
function updateLevelSelectionUI() {
    const container = document.getElementById('level-select-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const unlockedLevels = gameData.gameState.unlockedLevels || [];
    const completedLevels = gameData.gameState.levelCompletion || [];
    
    for (let i = 0; i < unlockedLevels.length; i++) {
        const levelBtn = document.createElement('div');
        levelBtn.className = 'level-button';
        
        if (unlockedLevels[i]) {
            levelBtn.textContent = i+1;
            
            if (completedLevels[i]) {
                levelBtn.classList.add('completed');
                levelBtn.innerHTML = `<span>${i+1}</span><span class="level-score">★ ${gameData.gameState.levelScores[i] || 0}</span>`;
            
                if (i+1 === gameData.gameState.currentLevel) {
                    levelBtn.classList.add('current');
                }
                
                levelBtn.addEventListener('click', () => {
                    gameData.gameState.currentLevel = i+1;
                    saveGameData();
                    startGame();
                });
            }
        } else {
            levelBtn.textContent = i+1;
            levelBtn.classList.add('locked');
            levelBtn.style.cursor = 'not-allowed';
        }
        
        container.appendChild(levelBtn);
    }
}

// Обновляет прогресс уровней на главном экране
function updateLevelProgressUI() {
    const progressBar = document.getElementById('level-progress');
    if (!progressBar) return;
    
    const completed = gameData.gameState.levelCompletion.filter(Boolean).length;
    const total = gameData.gameState.unlockedLevels.filter(Boolean).length;
    
    progressBar.innerHTML = `
        <div class="progress-label">Progress: ${completed}/${total} levels</div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${(completed/total)*100}%"></div>
        </div>
    `;
}

// Обновленная функция сохранения данных игрока
function savePlayerData() {
    if (currentUser) {
        currentUser.score = totalScore || 0;  // Добавлена защита от undefined
        currentUser.unlockedCharacters = [...unlockedCharacters];
        currentUser.lastPlayed = new Date();
        currentUser.maxLevel = Math.max(currentUser.maxLevel, gameData.gameState.currentLevel);
        
        // Обновляем прогресс уровней
        for (let i = 0; i < gameData.gameState.levelCompletion.length; i++) {
            if (gameData.gameState.levelCompletion[i]) {
                currentUser.levelProgress[i] = true;
            }
        }
        
        const userIndex = gameData.users.findIndex(u => u.telegramUsername === currentUser.telegramUsername);
        if (userIndex !== -1) {
            gameData.users[userIndex] = currentUser;
        }
        
        saveGameData();
        updateLevelProgressUI();
    }
}

// Показывает экран выбора персонажа (обновлено)
function showCharacterSelection() {
    showScreen('character-menu');
    updateCharacterSelectionUI();
    
    // Добавляем информацию о текущем уровне
    const levelInfo = document.createElement('div');
    levelInfo.className = 'level-info';
    levelInfo.textContent = `Current Level: ${gameData.gameState.currentLevel}`;
    document.getElementById('character-menu').prepend(levelInfo);
}

// Обновляет статистику (добавлена информация об уровнях)
function updateStatsUI() {
    const tableBody = document.querySelector('#stats-table tbody');
    tableBody.innerHTML = '';
    
    const sortedUsers = [...gameData.users].sort((a, b) => b.score - a.score);
    
    sortedUsers.forEach((user, index) => {
        const row = document.createElement('tr');
        
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        
        const nameCell = document.createElement('td');
        nameCell.textContent = user.gameNickname;
        
        const scoreCell = document.createElement('td');
        scoreCell.textContent = user.score;
        
        const levelCell = document.createElement('td');
        levelCell.textContent = user.maxLevel || 1;
        
        if (user.telegramUsername === currentUser.telegramUsername) {
            row.style.backgroundColor = '#330';
        }
        
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        row.appendChild(levelCell);
        tableBody.appendChild(row);
    });
    
    // Обновляем заголовки таблицы
    const tableHead = document.querySelector('#stats-table thead');
    tableHead.innerHTML = `
        <tr>
            <th>Rank</th>
            <th>Nickname</th>
            <th>Score</th>
            <th>Max Level</th>
        </tr>
    `;
}

// Новое изменение
function updateCharacterSelectionUI() {
    const container = document.getElementById('character-select');
    if (!container) return;
    
    container.innerHTML = '';
    
    const characters = [
        { name: "Pacman", unlockScore: 0, speed: 5, lives: 3 },
        { name: "Ms. Pacman", unlockScore: 500, speed: 6, lives: 4 },
        { name: "Baby Pacman", unlockScore: 1500, speed: 7, lives: 4 }
    ];
    
    characters.forEach((char, index) => {
        const charDiv = document.createElement('div');
        charDiv.className = 'character';
        
        if ((currentUser?.score || 0) >= char.unlockScore) {
            charDiv.innerHTML = `
                <img src="images/characters/char${index+1}.png" alt="${char.name}">
                <div>${char.name}</div>
                <div>Speed: ${char.speed}</div>
                <div>Lives: ${char.lives}</div>
            `;
            
            charDiv.addEventListener('click', () => {
                selectedCharacter = index;
                savePlayerData();
                updateCharacterSelectionUI();
            });
        } else {
            charDiv.className += ' locked';
            charDiv.innerHTML = `
                <img src="images/characters/char${index+1}.png" alt="${char.name}">
                <div>Locked</div>
                <div>Unlock at ${char.unlockScore} points</div>
            `;
        }
        
        container.appendChild(charDiv);
    });
}

// Инициализация при загрузке
window.addEventListener('load', () => {
    initUI();
});

function promptForNickname() {
    const nickname = prompt('Enter your game nickname:');
    if (nickname) {
        currentUser.gameNickname = nickname;
        gameData.users.push(currentUser);
        saveGameData();
    }
}


function updateCountdown() {
    if (gameData.gameState.countdownEnd) {
        const diff = gameData.gameState.countdownEnd - Date.now();
        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            document.getElementById('global-countdown').textContent = `Time left: ${days} days`;
        }
    }
}

window.showScreen = showScreen;
window.showNotification = showNotification;
window.updateCharacterSelectionUI = updateCharacterSelectionUI;

// Проверка инициализации gameData
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
