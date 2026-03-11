/**
 * Collision detection for gems and obstacles.
 */

const COLLECT_THRESHOLD = 0.3; // progress range where collection happens

/**
 * Check if the player collects a gem on the current tile.
 *
 * @param {import('../types/index').Tile} tile
 * @param {number} progress
 * @param {string[]} collectedGems - Already collected gem IDs
 * @returns {boolean}
 */
export function checkGemCollection(tile, progress, collectedGems) {
  if (!tile || !tile.hasGem) return false;
  if (collectedGems.includes(tile.id)) return false;
  return progress >= 0.3 && progress <= 0.3 + COLLECT_THRESHOLD;
}

/**
 * Check if the player hits an obstacle on the current tile.
 *
 * @param {import('../types/index').Tile} tile
 * @param {number} progress
 * @returns {boolean}
 */
export function checkObstacleHit(tile, progress) {
  if (!tile || !tile.hasObstacle) return false;
  return progress >= 0.4 && progress <= 0.7;
}
