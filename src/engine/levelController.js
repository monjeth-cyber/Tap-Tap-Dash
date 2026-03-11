import levels from '../data/levels';
import { MAX_LEVELS, DIFFICULTIES } from '../utils/constants';
import { clamp } from '../utils/helpers';

/**
 * Get the configuration for a specific level.
 * @param {number} levelId
 * @returns {import('../types/index').LevelConfig|null}
 */
export function getLevelConfig(levelId) {
  return levels.find((l) => l.id === levelId) || null;
}

/**
 * Get the level config adjusted for a difficulty preset.
 * @param {number} levelId
 * @param {'normal'|'medium'|'hard'} difficulty
 * @returns {import('../types/index').LevelConfig|null}
 */
export function getLevelConfigWithDifficulty(levelId, difficulty = 'normal') {
  const base = getLevelConfig(levelId);
  if (!base) return null;
  const preset = DIFFICULTIES[difficulty] || DIFFICULTIES.normal;
  return {
    ...base,
    speed: base.speed * preset.speedMultiplier,
    turnWindowStart: clamp(base.turnWindowStart + preset.turnWindowShrink / 2, 0.1, 0.5),
    turnWindowEnd: clamp(base.turnWindowEnd - preset.turnWindowShrink / 2, 0.5, 0.95),
    obstacleDensity: clamp(base.obstacleDensity + preset.obstacleDensityAdd, 0, 0.6),
  };
}

/**
 * Get all level configs.
 * @returns {import('../types/index').LevelConfig[]}
 */
export function getAllLevels() {
  return levels;
}

/**
 * Determine the next level ID after completing a level.
 * @param {number} currentLevelId
 * @returns {number|null} null if current level is the last one
 */
export function getNextLevelId(currentLevelId) {
  if (currentLevelId >= MAX_LEVELS) return null;
  return currentLevelId + 1;
}

/**
 * Check if a level is unlocked.
 * @param {number} levelId
 * @param {number} unlockedLevel - Highest unlocked level
 * @returns {boolean}
 */
export function isLevelUnlocked(levelId, unlockedLevel) {
  return levelId <= unlockedLevel;
}
