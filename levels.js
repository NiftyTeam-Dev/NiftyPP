// levels.js

const GRID_SIZE = 10; // Уменьшил размер сетки в 2 раза (было 20)
const WALL_TYPES = window.WALL_TYPES;

class LevelGenerator {
    constructor() {
        this.patterns = this.createPatternLibrary();
    }

    createPatternLibrary() {
        return [
            // Basic pattern 1 (more open)
            {
                weight: 20,
                grid: [
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,1,1,0,1,0,1,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,0,0,1,1,0,0,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,1,1,0,1,0,1,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,1,0,1,1,0,1,0,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]
            },
            // Basic pattern 2 (spiral)
            {
                weight: 15,
                grid: [
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,1,1,1,1,1,1,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,1,0,1,1,0,1,0,1],
                    [1,0,1,0,1,0,0,1,0,1],
                    [1,0,1,0,1,1,1,1,0,1],
                    [1,0,1,0,0,0,0,0,0,1],
                    [1,0,1,1,1,1,1,1,1,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]
            },
            // Basic pattern 3 (open center)
            {
                weight: 20,
                grid: [
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,1,1,0,0,1,1,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,1,1,0,0,1,1,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]
            },
            // Basic pattern 4 (maze-like)
            {
                weight: 15,
                grid: [
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,1,0,0,0,0,1],
                    [1,1,1,0,1,0,1,1,0,1],
                    [1,0,0,0,0,0,1,0,0,1],
                    [1,0,1,1,1,1,1,0,1,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,1,1,0,1,1,1,1,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,1,1,1,1,1,1,1,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]
            },
            // Basic pattern 5 (cross)
            {
                weight: 15,
                grid: [
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,1,1,0,0,1,1,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,1,1,0,0,1,1,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]
            },
            // Добавлено еще 5 различных паттернов для разнообразия
            {
                weight: 10,
                grid: [
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,1,1,0,0,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,1,0,1,1,0,1,0,1],
                    [1,0,1,0,1,1,0,1,0,1],
                    [1,0,1,0,1,1,0,1,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,1,1,1,1,1,1,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]
            },
            {
                weight: 10,
                grid: [
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,1,1,1,1,1,1,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,1,0,1,1,0,1,0,1],
                    [1,0,1,0,1,1,0,1,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,1,1,1,1,1,1,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]
            },
            {
                weight: 10,
                grid: [
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,1,1,0,0,1,1,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,0,0,1,1,0,0,0,1],
                    [1,0,0,0,1,1,0,0,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,1,1,0,0,1,1,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]
            },
            {
                weight: 10,
                grid: [
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,1,1,1,1,1,1,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,1,0,1,1,0,1,0,1],
                    [1,0,1,0,1,1,0,1,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,1,1,1,1,1,1,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]
            },
            {
                weight: 10,
                grid: [
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,0,1,1,0,0,1,1,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,0,0,1,1,0,0,0,1],
                    [1,0,0,0,1,1,0,0,0,1],
                    [1,0,1,0,0,0,0,1,0,1],
                    [1,0,1,1,0,0,1,1,0,1],
                    [1,0,0,0,0,0,0,0,0,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]
            }
        ];
    }

    generateLevel(levelNumber) {
        const level = {
            walls: [],
            coins: [],
            ghostSpawns: [],
            playerSpawn: { x: Math.floor(GRID_SIZE/2), y: Math.floor(GRID_SIZE/2) },
            teleports: [],
            difficulty: this.calculateDifficulty(levelNumber)
        };

        // Choose and combine patterns based on level number
        const basePattern = this.choosePattern(levelNumber);
        level.walls = this.applyPattern(basePattern, levelNumber);

        // Ensure there are openings in the walls
        this.ensureOpenings(level.walls);

        // Generate coins in empty spaces
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (!this.isWall(x, y, level.walls) && 
                    (x !== level.playerSpawn.x || y !== level.playerSpawn.y)) {
                    if (Math.random() < 0.7 - (levelNumber * 0.01)) {
                        level.coins.push({ x, y, type: 'normal' });
                        
                        // Add power pellets occasionally
                        if (Math.random() < 0.05 - (levelNumber * 0.001)) {
                            level.coins[level.coins.length - 1].type = 'power';
                        }
                    }
                }
            }
        }

        // Generate ghost spawn points
        const ghostCount = Math.min(2 + Math.floor(levelNumber / 3), 5);
        for (let i = 0; i < ghostCount; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
                y = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
            } while (this.isWall(x, y, level.walls) || 
                   (Math.abs(x - level.playerSpawn.x) < 3 && 
                    Math.abs(y - level.playerSpawn.y) < 3));
            
            level.ghostSpawns.push({ x, y });
        }

        // Add teleports for higher levels
        if (levelNumber > 5) {
            this.addTeleports(level, levelNumber);
        }

        return level;
    }

    choosePattern(levelNumber) {
        // Weighted random selection
        const totalWeight = this.patterns.reduce((sum, pattern) => sum + pattern.weight, 0);
        let random = Math.random() * totalWeight;
        let weightSum = 0;
        
        for (const pattern of this.patterns) {
            weightSum += pattern.weight;
            if (random <= weightSum) {
                return JSON.parse(JSON.stringify(pattern));
            }
        }
        
        return JSON.parse(JSON.stringify(this.patterns[0]));
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
        if (levelNumber > 3) {
            this.addRandomWalls(walls, levelNumber);
        }

        return walls;
    }

    ensureOpenings(walls) {
        // Ensure at least 2 openings in the outer walls
        const openings = [];
        const sides = [
            {x: 0, y: 1, dx: 0, dy: 1}, // left
            {x: GRID_SIZE-1, y: 1, dx: 0, dy: 1}, // right
            {x: 1, y: 0, dx: 1, dy: 0}, // top
            {x: 1, y: GRID_SIZE-1, dx: 1, dy: 0} // bottom
        ];
        
        // Create at least 2 openings
        for (let i = 0; i < 2; i++) {
            const side = sides[Math.floor(Math.random() * sides.length)];
            const pos = Math.floor(Math.random() * (GRID_SIZE-2)) + 1;
            
            const x = side.x === 0 || side.x === GRID_SIZE-1 ? side.x : pos;
            const y = side.y === 0 || side.y === GRID_SIZE-1 ? side.y : pos;
            
            if (!openings.some(o => o.x === x && o.y === y)) {
                walls[y][x] = 0;
                openings.push({x, y});
            }
        }
    }

    addRandomWalls(walls, levelNumber) {
        const wallCount = Math.min(10 + levelNumber, 30);
        
        for (let i = 0; i < wallCount; i++) {
            const x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
            const y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
            
            // Don't block the center or create 1x1 boxes
            if ((Math.abs(x - GRID_SIZE/2) > 2 || Math.abs(y - GRID_SIZE/2) > 2)) {
                walls[y][x] = WALL_TYPES.SOLID;
            }
        }
    }

    addTeleports(level, levelNumber) {
        const teleportCount = Math.min(1 + Math.floor(levelNumber / 5), 3);
        const positions = [];
        
        for (let i = 0; i < teleportCount * 2; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
                y = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
            } while (this.isWall(x, y, level.walls) || 
                   positions.some(pos => Math.abs(pos.x - x) < 2 && Math.abs(pos.y - y) < 2));
            
            positions.push({ x, y });
        }
        
        for (let i = 0; i < teleportCount; i++) {
            level.teleports.push({
                entry: positions[i*2],
                exit: positions[i*2+1],
                cooldown: Math.max(2500 - levelNumber * 50, 1500)
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
            ghostSpeed: 0.8 + Math.min(levelNumber * 0.06, 2.5),
            ghostSpawnRate: Math.min(levelNumber * 0.15, 6),
            breakableWalls: levelNumber > 10,
            teleportCooldown: Math.max(2500 - levelNumber * 50, 1000)
        };
    }
}

const levelGenerator = new LevelGenerator();
const LEVELS = Array.from({ length: 50 }, (_, i) => levelGenerator.generateLevel(i + 1));
