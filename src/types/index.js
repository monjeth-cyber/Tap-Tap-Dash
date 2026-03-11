/**
 * @typedef {Object} LevelConfig
 * @property {number} id
 * @property {string} name
 * @property {number} speed - Tiles per second
 * @property {number} pathLength - Number of tiles
 * @property {number} turnWindowStart - 0-1 progress on tile when window opens
 * @property {number} turnWindowEnd - 0-1 progress on tile when window closes
 * @property {number} gemDensity - 0-1 probability of gem per tile
 * @property {number} obstacleDensity - 0-1 probability of obstacle per tile
 * @property {'green'|'blue'|'gold'} theme
 * @property {number} [targetScore]
 */

/**
 * @typedef {Object} Tile
 * @property {string} id
 * @property {number} x
 * @property {number} y
 * @property {'up'|'down'|'left'|'right'} direction
 * @property {boolean} isTurn
 * @property {'left'|'right'|null} turnDirection - Which way the path turns
 * @property {boolean} hasGem
 * @property {boolean} hasObstacle
 */

/**
 * @typedef {Object} PlayerState
 * @property {number} tileIndex
 * @property {number} progress - 0-1 progress along current tile
 * @property {boolean} isAlive
 * @property {'up'|'down'|'left'|'right'} direction
 */

/**
 * @typedef {Object} GameState
 * @property {'idle'|'playing'|'gameOver'|'levelComplete'} status
 * @property {number} levelId
 * @property {number} score
 * @property {PlayerState} player
 * @property {Tile[]} tiles
 * @property {string[]} collectedGems
 * @property {boolean} turnWindowActive
 */

/**
 * @typedef {Object} SaveData
 * @property {number} unlockedLevel
 * @property {Object.<number, number>} bestScores
 * @property {boolean} soundEnabled
 * @property {boolean} hapticsEnabled
 */

export {};
