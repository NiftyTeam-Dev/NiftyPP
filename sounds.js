const SOUNDS = {
    coin: { volume: 0.7, file: 'coin.wav' },
    'wall-bump': { volume: 0.3, file: 'wall-bump.wav' },
    teleport: { volume: 0.5, file: 'teleport.wav' },
    'power-pellet': { volume: 0.6, file: 'power-pellet.wav' },
    'eat-ghost': { volume: 0.8, file: 'eat-ghost.wav' },
    ghost: { volume: 0.6, file: 'ghost.wav' },
    'lose-life': { volume: 0.8, file: 'lose-life.wav' },
    gameover: { volume: 0.8, file: 'gameover.wav' },
    win: { volume: 0.8, file: 'win.wav' }
};

function playSound(name) {
    if (!getSetting('soundEnabled')) return;
    
    const sound = SOUNDS[name];
    if (sound) {
        try {
            const audio = new Audio(`sounds/${sound.file}`);
            audio.volume = (getSetting('soundVolume') || 0.7) * sound.volume;
            audio.play().catch(e => console.log('Audio play error:', e));
        } catch (e) {
            console.error('Error playing sound:', e);
        }
    }
}
