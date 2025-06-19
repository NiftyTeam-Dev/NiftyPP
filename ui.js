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
        currentLevel: 1,
        unlockedLevels: Array(50).fill(false).map((_, i) => i < 5),
        levelScores: Array(50).fill(0),
        levelCompletion: Array(50).fill(false)
    }
};

function initSettings() {
    document.getElementById('music-toggle').checked = getSetting('musicEnabled');
    document.getElementById('sound-toggle').checked = getSetting('soundEnabled');
    document.getElementById('music-volume').value = getSetting('musicVolume');
    document.getElementById('sound-volume').value = getSetting('soundVolume');
    
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
    if (!progressBar || !gameData.gameState) return;

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
        if (!currentUser.maxLevel) {
            currentUser.maxLevel = 1;
            currentUser.levelProgress = Array(50).fill(false).map((_, i) => i < 1);
        }
    } else {
        promptForNickname();
    }
}

function setupButtonListeners() {
    document.getElementById('start-game').addEventListener('click', () => {
        showLevelSelectOrStart();
    });
    
    document.getElementById('level-select').addEventListener('click', () => {
        showScreen('level-select-menu');
        updateLevelSelectionUI();
    });
    
    document.getElementById('back-to-main-from-levels').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-main').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-main2').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-main3').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-main4').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-main5').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-main6').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-admin-main').addEventListener('click', () => showScreen('main-menu'));
    document.getElementById('back-to-game-menu').addEventListener('click', () => {
        if (typeof window.gameRunning !== 'undefined') {
            window.gameRunning = false;
        }
        showScreen('main-menu');
    });

    document.getElementById('admin-login').addEventListener('click', () => {
        showScreen('admin-login-menu');
    });
    
    document.getElementById('admin-login-submit').addEventListener('click', () => {
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        
        if (username === 'Admin' && password === '0852456NNiikk416') {
            showScreen('admin-panel');
        } else {
            showNotification('Invalid admin credentials');
        }
    });

    document.getElementById('close-notification').addEventListener('click', () => {
        document.getElementById('notification').style.display = 'none';
    });
    
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
	
		// Кнопки администратора setupButtonListeners:
	document.getElementById('start-timer').addEventListener('click', () => {
    const days = parseInt(document.getElementById('timer-days').value) || 7;
    gameData.gameState.countdownEnd = Date.now() + days * 24 * 60 * 60 * 1000;
    saveGameData();
    updateCountdown();
    showNotification(`Timer set for ${days} days`);
});

	document.getElementById('stop-game').addEventListener('click', () => {
    gameData.gameState.countdownEnd = null;
    saveGameData();
    updateCountdown();
    showNotification('Game timer stopped');
});

	document.getElementById('set-timer').addEventListener('click', () => {
    const days = parseInt(document.getElementById('timer-days').value) || 7;
    gameData.gameState.countdownEnd = Date.now() + days * 24 * 60 * 60 * 1000;
    saveGameData();
    updateCountdown();
    showNotification(`Timer set for ${days} days`);
});

}

function showLevelSelectOrStart() {
    if (gameData.gameState.unlockedLevels.filter(Boolean).length > 1) {
        showScreen('level-select-menu');
        updateLevelSelectionUI();
    } else {
        if (typeof window.startGame === 'function') {
            window.startGame();
        } else {
            console.error('startGame function not loaded yet');
            showNotification('Game is loading, please try again');
        }
    }
}

function updateLevelSelectionUI() {
    const container = document.getElementById('level-select-container');
    if (!container || !gameData.gameState) return;
    
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
                    if (typeof window.startGame === 'function') {
                        window.startGame();
                    }
                });
            } else {
                levelBtn.addEventListener('click', () => {
                    gameData.gameState.currentLevel = i+1;
                    saveGameData();
                    if (typeof window.startGame === 'function') {
                        window.startGame();
                    }
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

function savePlayerData() {
    if (currentUser) {
        currentUser.score = totalScore || 0;
        currentUser.unlockedCharacters = [...(unlockedCharacters || [true, false, false])];
        currentUser.lastPlayed = new Date();
        currentUser.maxLevel = Math.max(currentUser.maxLevel || 1, gameData.gameState.currentLevel);
        
        for (let i = 0; i < gameData.gameState.levelCompletion.length; i++) {
            if (gameData.gameState.levelCompletion[i]) {
                currentUser.levelProgress[i] = true;
            }
        }
        
        const userIndex = gameData.users.findIndex(u => u.telegramUsername === currentUser.telegramUsername);
        if (userIndex !== -1) {
            gameData.users[userIndex] = currentUser;
        } else {
            gameData.users.push(currentUser);
        }
        
        saveGameData();
        updateLevelProgressUI();
    }
}

function showCharacterSelection() {
    showScreen('character-menu');
    updateCharacterSelectionUI();
    
    const levelInfo = document.createElement('div');
    levelInfo.className = 'level-info';
    levelInfo.textContent = `Current Level: ${gameData.gameState.currentLevel}`;
    document.getElementById('character-menu').prepend(levelInfo);
}

function updateStatsUI() {
    const tableBody = document.querySelector('#stats-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const sortedUsers = [...(gameData.users || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    
    sortedUsers.forEach((user, index) => {
        const row = document.createElement('tr');
        
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        
        const nameCell = document.createElement('td');
        nameCell.textContent = user.gameNickname || 'Unknown';
        
        const scoreCell = document.createElement('td');
        scoreCell.textContent = user.score || 0;
        
        const levelCell = document.createElement('td');
        levelCell.textContent = user.maxLevel || 1;
        
        if (user.telegramUsername === (currentUser?.telegramUsername || '')) {
            row.style.backgroundColor = '#330';
        }
        
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        row.appendChild(levelCell);
        tableBody.appendChild(row);
    });
    
    const tableHead = document.querySelector('#stats-table thead');
    if (tableHead) {
        tableHead.innerHTML = `
            <tr>
                <th>Rank</th>
                <th>Nickname</th>
                <th>Score</th>
                <th>Max Level</th>
            </tr>
        `;
    }
}

function updateCharacterSelectionUI() {
    const container = document.getElementById('character-select');
    if (!container) return;
    
    container.innerHTML = '';
    
    const characters = [
        { name: "Nifty Panda", unlockScore: 0, speed: 5, lives: 3 },
        { name: "Nifty Panda 2", unlockScore: 500, speed: 6, lives: 4 },
        { name: "Nifty Panda 3", unlockScore: 1500, speed: 7, lives: 4 }
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
                if (typeof window.selectedCharacter !== 'undefined') {
                    window.selectedCharacter = index;
                }
                if (typeof window.savePlayerData === 'function') {
                    window.savePlayerData();
                }
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

function promptForNickname() {
    const nickname = prompt('Enter your game nickname:');
    if (nickname) {
        currentUser.gameNickname = nickname;
        gameData.users.push(currentUser);
        saveGameData();
    }
}

function updateCountdown() {
    if (gameData.gameState?.countdownEnd) {
        const diff = gameData.gameState.countdownEnd - Date.now();
        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const countdownElement = document.getElementById('global-countdown');
            if (countdownElement) {
                countdownElement.textContent = `Time left: ${days} days`;
            }
        }
    }
}

window.addEventListener('load', initUI);
