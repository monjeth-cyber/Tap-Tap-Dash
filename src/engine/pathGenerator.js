import { generateId, seededRandom } from '../utils/helpers';
import { DIRECTIONS, TURN_MAP } from '../utils/constants';

/**
 * Generate a path of tiles for a given level configuration.
 *
 * @param {import('../types/index').LevelConfig} levelConfig
 * @returns {import('../types/index').Tile[]}
 */
export function generatePath(levelConfig) {
  const {
    id,
    pathLength,
    gemDensity,
    obstacleDensity,
  } = levelConfig;

  const rand = seededRandom(id * 7919); // deterministic per level
  const tiles = [];

  let x = 0;
  let y = 0;
  let direction = 'right'; // always start going right

  for (let i = 0; i < pathLength; i++) {
    const isTurn = i > 1 && i < pathLength - 1 && shouldPlaceTurn(i, pathLength, rand);
    let turnDirection = null;

    if (isTurn) {
      turnDirection = rand() > 0.5 ? 'right' : 'left';
    }

    const isFirstOrLast = i === 0 || i === pathLength - 1;
    const hasGem = !isFirstOrLast && !isTurn && rand() < gemDensity;
    const hasObstacle = !isFirstOrLast && !isTurn && !hasGem && rand() < obstacleDensity;

    tiles.push({
      id: generateId(),
      x,
      y,
      direction,
      isTurn,
      turnDirection,
      hasGem,
      hasObstacle,
    });

    // Compute next position
    if (isTurn && turnDirection) {
      direction = TURN_MAP[direction][turnDirection];
    }
    const delta = DIRECTIONS[direction];
    x += delta.dx;
    y += delta.dy;
  }

  return tiles;
}

/**
 * Decide whether to place a turn at this index.
 * Ensures turns are spaced out: at least 2 straight tiles between turns.
 */
function shouldPlaceTurn(index, pathLength, rand) {
  // More turns in later parts of the path
  const progress = index / pathLength;
  const baseProbability = 0.2 + progress * 0.15;
  return rand() < baseProbability;
}
