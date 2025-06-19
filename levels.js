// levels.js

const GRID_SIZE = window.GRID_SIZE;
const WALL_TYPES = window.WALL_TYPES;

class LevelGenerator {
    constructor() {
        this.patterns = this.createPatternLibrary();
    }

    createPatternLibrary() {
        return [
            // Basic patterns
            {
                weight: 30,
                grid: [
                    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                    [1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1],
                    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
                    [1,0,0,0,1,1,1,0,1,1,1,1,0,1,1,1,0,0,0,1],
                    [1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
                    [1,0,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
                    [1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1],
                    [1,0,1,0,1,0,1,0,1,1,1,1,0,1,0,0,0,1,0,1],
                    [1,0,1,0,1,0,1,0,1,0,0,0,0,1,0,1,0,1,0,1],
                    [1,0,1,0,0,0,1,0,0,0,0,1,0,1,0,1,0,1,0,1],
                    [1,0,1,0,1,0,1,0,1,1,1,1,0,1,0,0,0,1,0,1],
                    [1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1],
                    [1,0,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
                    [1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
                    [1,0,0,0,1,1,1,0,1,1,1,1,0,1,1,1,0,0,0,1],
                    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
                    [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1],
                    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
                ]
            },
            // Add more patterns here...
        ];
    }

    isReachable(startX, startY, targetX, targetY, walls) {
        const visited = new Set();
        const queue = [[startX, startY]];
    
        while (queue.length > 0) {
            const [x, y] = queue.shift();
            const key = `${x},${y}`;
        
            if (visited.has(key)) continue;
            visited.add(key);
        
            if (x === targetX && y === targetY) return true;
        
            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
            
                if (!this.isWall(nx, ny, walls) && !visited.has(`${nx},${ny}`)) {
                    queue.push([nx, ny]);
                }
            }
        }
    
        return false;
    }

    generateLevel(levelNumber) {
        const level = {
            walls: [],
            coins: [],
            ghostSpawns: [],
            playerSpawn: { x: 10, y: 10 },
            teleports: [],
            difficulty: this.calculateDifficulty(levelNumber)
        };

        // Choose and combine patterns based on level number
        const basePattern = this.choosePattern(levelNumber);
        level.walls = this.applyPattern(basePattern, levelNumber);

        // Generate coins in empty spaces
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (!this.isWall(x, y, level.walls) && 
                    (x !== level.playerSpawn.x || y !== level.playerSpawn.y)) {
                    if (this.isReachable(x, y, level.playerSpawn.x, level.playerSpawn.y, level.walls)) {
                        if (Math.random() < 0.7 - (levelNumber * 0.005)) {
                            level.coins.push({ x, y, type: 'normal' });
        
                            if (Math.random() < 0.05 - (levelNumber * 0.0005)) {
                                level.coins[level.coins.length - 1].type = 'power';
                            }
                        }
                    }
                }
            }
        }

        // Generate ghost spawn points
        const ghostCount = Math.min(3 + Math.floor(levelNumber / 2), 8);
        for (let i = 0; i < ghostCount; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
                y = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
            } while (this.isWall(x, y, level.walls) || 
                   (Math.abs(x - level.playerSpawn.x) < 5 && 
                    Math.abs(y - level.playerSpawn.y) < 5));
            
            level.ghostSpawns.push({ x, y });
        }

        // Add teleports for higher levels
        if (levelNumber > 10) {
            this.addTeleports(level, levelNumber);
        }

        return level;
    }

    choosePattern(levelNumber) {
        // Simple pattern selection - in a real game you'd have more complex logic
        const patternIndex = Math.min(Math.floor(levelNumber / 5), this.patterns.length - 1);
        return JSON.parse(JSON.stringify(this.patterns[patternIndex]));
    }

    applyPattern(pattern, levelNumber) {
        const walls = [];
        
        // Create empty grid
        for (let y = 0; y < GRID_SIZE; y++) {
            walls[y] = [];
            for (let x = 0; x < GRID_SIZE; x++) {
                walls[y][x] = 0;
            }
        }

        // Apply pattern
        for (let y = 0; y < pattern.grid.length; y++) {
            for (let x = 0; x < pattern.grid[y].length; x++) {
                if (pattern.grid[y][x] === 1) {
                    walls[y][x] = WALL_TYPES.SOLID;
                }
            }
        }

        // Add random walls for higher levels
        if (levelNumber > 5) {
            this.addRandomWalls(walls, levelNumber);
        }

        return walls;
    }

    addRandomWalls(walls, levelNumber) {
        const wallCount = Math.min(20 + levelNumber * 2, 100);
        
        for (let i = 0; i < wallCount; i++) {
            const x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
            const y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
            
            // Don't block the center or create 1x1 boxes
            if ((Math.abs(x - GRID_SIZE/2) > 3 || Math.abs(y - GRID_SIZE/2) > 3)) {
                walls[y][x] = WALL_TYPES.SOLID;
            }
        }
    }

    addTeleports(level, levelNumber) {
        const teleportCount = Math.min(2 + Math.floor(levelNumber / 10), 4);
        const positions = [];
        
        for (let i = 0; i < teleportCount * 2; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
                y = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
            } while (this.isWall(x, y, level.walls) || 
                   positions.some(pos => Math.abs(pos.x - x) < 3 && Math.abs(pos.y - y) < 3));
            
            positions.push({ x, y });
        }
        
        for (let i = 0; i < teleportCount; i++) {
            level.teleports.push({
                entry: positions[i*2],
                exit: positions[i*2+1],
                cooldown: 2000
            });
            
            // Mark these as teleport walls
            level.walls[positions[i*2].y][positions[i*2].x] = WALL_TYPES.TELEPORT;
            level.walls[positions[i*2+1].y][positions[i*2+1].x] = WALL_TYPES.TELEPORT;
        }
    }

    isWall(x, y, walls) {
        return y >= 0 && y < walls.length && 
               x >= 0 && x < walls[y].length && 
               walls[y][x] !== 0;
    }

    calculateDifficulty(levelNumber) {
        return {
            ghostSpeed: 1 + Math.min(levelNumber * 0.05, 2),
            ghostSpawnRate: Math.min(levelNumber * 0.1, 5),
            breakableWalls: levelNumber > 15,
            teleportCooldown: Math.max(3000 - levelNumber * 100, 1000)
        };
    }
}

const levelGenerator = new LevelGenerator();
const LEVELS = Array.from({ length: 50 }, (_, i) => levelGenerator.generateLevel(i + 1));
