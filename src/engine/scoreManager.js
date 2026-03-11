import {
  SCORE_PER_TILE,
  SCORE_PER_GEM,
  SCORE_PER_TURN,
  SCORE_LEVEL_COMPLETE_BONUS,
} from '../utils/constants';

/**
 * Calculate score gained from advancing a tile.
 * @returns {number}
 */
export function scoreForTile() {
  return SCORE_PER_TILE;
}

/**
 * Calculate score gained from collecting a gem.
 * @returns {number}
 */
export function scoreForGem() {
  return SCORE_PER_GEM;
}

/**
 * Calculate score gained from a successful turn.
 * @returns {number}
 */
export function scoreForTurn() {
  return SCORE_PER_TURN;
}

/**
 * Calculate bonus for completing a level.
 * @returns {number}
 */
export function scoreForLevelComplete() {
  return SCORE_LEVEL_COMPLETE_BONUS;
}

/**
 * Determine the best score.
 * @param {number} current
 * @param {number|undefined} previous
 * @returns {number}
 */
export function getBestScore(current, previous) {
  if (previous === undefined || previous === null) return current;
  return Math.max(current, previous);
}
