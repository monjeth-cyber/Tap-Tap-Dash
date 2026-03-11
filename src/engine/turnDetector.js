/**
 * Turn detection logic.
 * Determines whether a tap happened within the valid turn window.
 */

/**
 * Check if the player is currently in a turn window.
 *
 * @param {import('../types/index').Tile} currentTile
 * @param {number} progress - Player's 0-1 progress on current tile
 * @param {number} windowStart - Turn window start threshold
 * @param {number} windowEnd - Turn window end threshold
 * @returns {boolean}
 */
export function isInTurnWindow(currentTile, progress, windowStart, windowEnd) {
  if (!currentTile || !currentTile.isTurn) return false;
  return progress >= windowStart && progress <= windowEnd;
}

/**
 * Process a tap event during gameplay.
 *
 * @param {import('../types/index').Tile} currentTile
 * @param {number} progress
 * @param {number} windowStart
 * @param {number} windowEnd
 * @returns {'success'|'miss'|'ignore'}
 */
export function processTap(currentTile, progress, windowStart, windowEnd) {
  if (!currentTile) return 'ignore';

  // Player is on a turn tile
  if (currentTile.isTurn) {
    if (isInTurnWindow(currentTile, progress, windowStart, windowEnd)) {
      return 'success';
    }
    // Tapping on a turn tile but outside the window
    return 'miss';
  }

  // Tapping on a non-turn tile — ignore (no penalty for tapping on straight tiles)
  return 'ignore';
}

/**
 * Check if the player missed a turn (passed through a turn tile without tapping).
 *
 * @param {import('../types/index').Tile} currentTile
 * @param {number} progress
 * @param {number} windowEnd
 * @param {boolean} turnHandled - Whether the turn was already handled by a successful tap
 * @returns {boolean}
 */
export function missedTurn(currentTile, progress, windowEnd, turnHandled) {
  if (!currentTile || !currentTile.isTurn) return false;
  if (turnHandled) return false;
  return progress > windowEnd;
}
