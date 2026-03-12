// Game constants
export const TILE_SIZE = 60;
export const PLAYER_SIZE = 30;
export const GEM_SIZE = 20;
export const OBSTACLE_SIZE = 25;

// Default turn window
export const DEFAULT_TURN_WINDOW_START = 0.3;
export const DEFAULT_TURN_WINDOW_END = 0.85;

// Scoring
export const SCORE_PER_TILE = 10;
export const SCORE_PER_GEM = 50;
export const SCORE_PER_TURN = 25;
export const SCORE_LEVEL_COMPLETE_BONUS = 500;

// Tick rate (kept for reference; game loop now uses requestAnimationFrame)
export const TICK_RATE = 16; // ~60fps

// Global gameplay speed multiplier applied to all levels and modes.
// Set to 0.99 for slightly reduced, more controllable pacing across the game.
export const GLOBAL_SPEED_MULTIPLIER = 0.99;

// Directions
export const DIRECTIONS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

// Turn mappings: when going direction X, turning left/right gives new direction
export const TURN_MAP = {
  up: { left: 'left', right: 'right' },
  down: { left: 'right', right: 'left' },
  left: { left: 'down', right: 'up' },
  right: { left: 'up', right: 'down' },
};

// Storage keys
export const STORAGE_KEYS = {
  SAVE_DATA: '@tap_tap_dash_save',
};

// Max levels
export const MAX_LEVELS = 20;

// Visible tile range (tiles rendered around the player)
export const VISIBLE_TILE_RANGE = 12;

// Difficulty presets
export const DIFFICULTIES = {
  normal: {
    label: 'Normal',
    speedMultiplier: 1.0,
    turnWindowShrink: 0,        // no change
    obstacleDensityAdd: 0,      // no change
    scoreMultiplier: 1.0,
    color: '#4CAF50',
  },
  medium: {
    label: 'Medium',
    speedMultiplier: 1.25,
    turnWindowShrink: 0.06,     // window shrinks by 6%
    obstacleDensityAdd: 0.05,   // +5% more obstacles
    scoreMultiplier: 1.5,
    color: '#FF9800',
  },
  hard: {
    label: 'Hard',
    speedMultiplier: 1.3,
    turnWindowShrink: 0.12,     // window shrinks by 12%
    obstacleDensityAdd: 0.1,    // +10% more obstacles
    scoreMultiplier: 2.0,
    color: '#F44336',
  },
};
