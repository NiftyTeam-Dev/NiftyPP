// levels.js

const GRID_SIZE = window.GRID_SIZE;
const WALL_TYPES = window.WALL_TYPES;

class LevelGenerator {
    constructor() {
        this.patterns = this.createPatternLibrary();
    }

    createPatternLibrary() {
        return [
            // Basic pattern with guaranteed paths
            {
                weight: 30,
                grid: [
                    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                    [1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
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
                    [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0,1],
                    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
                ]
            }
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

        // 1. Generate basic walls from pattern
        const basePattern = this.choosePattern(levelNumber);
        level.walls = this.applyPattern(basePattern, levelNumber);

        // 2. Ensure all areas are connected
        this.ensureConnectivity(level);

        // 3. Place coins in accessible areas
        this.placeCoins(level, levelNumber);

        // 4. Place ghosts
        this.placeGhosts(level, levelNumber);

        // 5. Add teleports for higher levels
        if (levelNumber > 10) {
            this.addTeleports(level, levelNumber);
        }

        return level;
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

        return walls;
    }

    ensureConnectivity(level) {
        // Check connectivity from player spawn to several test points
        const testPoints = [
            {x: 5, y: 5},
            {x: 15, y: 5},
            {x: 5, y: 15},
            {x: 15, y: 15}
        ];

        testPoints.forEach(point => {
            if (!this.isReachable(point.x, point.y, 
                                 level.playerSpawn.x, level.playerSpawn.y, 
                                 level.walls)) {
                // Create a path if area is unreachable
                this.createPath(level, point.x, point.y);
            }
        });
    }

    createPath(level, targetX, targetY) {
        let x = targetX;
        let y = targetY;
        
        while (!this.isReachable(x, y, level.playerSpawn.x, level.playerSpawn.y, level.walls)) {
            // Remove wall in current position if it's a wall
            if (this.isWall(x, y, level.walls)) {
                level.walls[y][x] = 0;
            }
            
            // Move toward player spawn
            const dx = Math.sign(level.playerSpawn.x - x);
            const dy = Math.sign(level.playerSpawn.y - y);
            
            if (Math.abs(dx) > Math.abs(dy)) {
                x += dx;
            } else {
                y += dy;
            }
            
            // Prevent infinite loops
            if (x < 1 || x >= GRID_SIZE-1 || y < 1 || y >= GRID_SIZE-1) break;
        }
    }

    placeCoins(level, levelNumber) {
        for (let y = 1; y < GRID_SIZE-1; y++) {
            for (let x = 1; x < GRID_SIZE-1; x++) {
                if (!this.isWall(x, y, level.walls) && 
                    (x !== level.playerSpawn.x || y !== level.playerSpawn.y)) {
                    
                    if (this.isReachable(x, y, level.playerSpawn.x, level.playerSpawn.y, level.walls)) {
                        if (Math.random() < 0.7 - (levelNumber * 0.005)) {
                            level.coins.push({ 
                                x, 
                                y, 
                                type: Math.random() < 0.05 - (levelNumber * 0.0005) ? 'power' : 'normal' 
                            });
                        }
                    }
                }
            }
        }
    }

    placeGhosts(level, levelNumber) {
        const ghostCount = Math.min(3 + Math.floor(levelNumber / 2), 8);
        const placedPositions = [];

        for (let i = 0; i < ghostCount; i++) {
            let attempts = 0;
            let x, y;
            
            do {
                x = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
                y = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
                attempts++;
                
                if (attempts > 100) {
                    // Fallback positions if can't find valid spot
                    x = 5 + i * 2;
                    y = 5 + i * 2;
                    break;
                }
            } while (
                this.isWall(x, y, level.walls) || 
                (Math.abs(x - level.playerSpawn.x) < 5 && 
                 Math.abs(y - level.playerSpawn.y) < 5) ||
                placedPositions.some(pos => Math.abs(pos.x - x) < 3 && Math.abs(pos.y - y) < 3)
            );
            
            level.ghostSpawns.push({ x, y });
            placedPositions.push({x, y});
        }
    }

    addTeleports(level, levelNumber) {
        const teleportCount = Math.min(2 + Math.floor(levelNumber / 10), 4);
        const positions = [];
        
        for (let i = 0; i < teleportCount * 2; i++) {
            let x, y;
            let attempts = 0;
            
            do {
                x = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
                y = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
                attempts++;
                
                if (attempts > 50) {
                    // Fallback positions
                    x = 3 + i * 3;
                    y = 3 + i * 3;
                    break;
                }
            } while (
                this.isWall(x, y, level.walls) || 
                positions.some(pos => Math.abs(pos.x - x) < 3 && Math.abs(pos.y - y) < 3)
            );
            
            positions.push({ x, y });
        }
        
        for (let i = 0; i < teleportCount; i++) {
            level.teleports.push({
                entry: positions[i*2],
                exit: positions[i*2+1],
                cooldown: 2000
            });
            
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

    choosePattern(levelNumber) {
        return JSON.parse(JSON.stringify(this.patterns[0]));
    }
}

const levelGenerator = new LevelGenerator();
const LEVELS = Array.from({ length: 50 }, (_, i) => levelGenerator.generateLevel(i + 1));
window.LEVELS = LEVELS;
