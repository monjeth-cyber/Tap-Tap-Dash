import { useState, useCallback, useRef, useEffect } from 'react';
import { generatePath } from '../engine/pathGenerator';
import { processTap, missedTurn } from '../engine/turnDetector';
import { checkGemCollection, checkObstacleHit } from '../engine/collisionDetector';
import { scoreForTile, scoreForGem, scoreForTurn, scoreForLevelComplete } from '../engine/scoreManager';
import { getLevelConfigWithDifficulty } from '../engine/levelController';
import { TURN_MAP, DIFFICULTIES } from '../utils/constants';
import useGameLoop from './useGameLoop';
import { playTap, playGem, playFail } from '../services/audioService';

const JUMP_DURATION = 0.4; // seconds — airborne, immune to obstacles

/**
 * Core game engine hook.
 * Manages all runtime state: player movement, turn detection, scoring, etc.
 *
 * @param {number} levelId - Selected level
 * @param {object} callbacks - { onGameOver, onLevelComplete }
 * @param {'normal'|'medium'|'hard'} difficulty
 */
export default function useGameEngine(levelId, callbacks, difficulty = 'normal') {
  const [gameState, setGameState] = useState(createInitialState(levelId, difficulty));
  const stateRef = useRef(gameState);
  const turnHandledRef = useRef(false);
  const lastTileScored = useRef(-1);
  const scoreMultiplier = (DIFFICULTIES[difficulty] || DIFFICULTIES.normal).scoreMultiplier;

  // Keep stateRef in sync
  stateRef.current = gameState;

  /**
   * Create an initial game state for a level with difficulty applied.
   */
  function createInitialState(lvlId, diff) {
    const config = getLevelConfigWithDifficulty(lvlId, diff);
    if (!config) {
      return {
        status: 'idle',
        levelId: lvlId,
        score: 0,
        player: { tileIndex: 0, progress: 0, isAlive: true, direction: 'right' },
        tiles: [],
        collectedGems: [],
        turnWindowActive: false,
        isJumping: false,
        jumpTimeRemaining: 0,
        config: null,
      };
    }
    const tiles = generatePath(config);
    return {
      status: 'idle',
      levelId: lvlId,
      score: 0,
      player: {
        tileIndex: 0,
        progress: 0,
        isAlive: true,
        direction: tiles.length > 0 ? tiles[0].direction : 'right',
      },
      tiles,
      collectedGems: [],
      turnWindowActive: false,
      isJumping: false,
      jumpTimeRemaining: 0,
      config,
    };
  }

  /**
   * Start the game.
   */
  const startGame = useCallback(() => {
    const initial = createInitialState(levelId, difficulty);
    initial.status = 'playing';
    turnHandledRef.current = false;
    lastTileScored.current = -1;
    setGameState(initial);
  }, [levelId, difficulty]);

  /**
   * Restart the current level.
   */
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  /**
   * Pause the game.
   */
  const pauseGame = useCallback(() => {
    setGameState((prev) => {
      if (prev.status !== 'playing') return prev;
      return { ...prev, status: 'paused' };
    });
  }, []);

  /**
   * Resume from pause.
   */
  const resumeGame = useCallback(() => {
    setGameState((prev) => {
      if (prev.status !== 'paused') return prev;
      return { ...prev, status: 'playing' };
    });
  }, []);

  /**
   * Game tick — called every frame by the game loop.
   */
  const tick = useCallback((dt) => {
    setGameState((prev) => {
      if (prev.status !== 'playing') return prev;

      const { player, tiles, config, collectedGems } = prev;
      if (!config || tiles.length === 0) return prev;

      // Handle jump timer
      let newIsJumping = prev.isJumping;
      let newJumpTimeRemaining = prev.jumpTimeRemaining;
      if (newIsJumping) {
        newJumpTimeRemaining -= dt;
        if (newJumpTimeRemaining <= 0) {
          newIsJumping = false;
          newJumpTimeRemaining = 0;
        }
      }

      // Advance player
      let newProgress = player.progress + config.speed * dt;
      let newTileIndex = player.tileIndex;
      let newScore = prev.score;
      let newCollectedGems = [...collectedGems];
      let newDirection = player.direction;
      let newTurnWindowActive = false;

      // Score for passing tiles; also catch obstacles/turns skipped entirely in a single frame
      while (newProgress >= 1 && newTileIndex < tiles.length - 1) {
        // Check the tile we are about to leave for events that must not be skipped
        const leavingTile = tiles[newTileIndex];
        if (leavingTile) {
          // Completely crossed a turn tile without tapping → immediate game over
          if (leavingTile.isTurn && !turnHandledRef.current) {
            playFail();
            return {
              ...prev,
              status: 'gameOver',
              score: newScore,
              player: { ...player, tileIndex: newTileIndex, progress: 1.0, isAlive: false, direction: newDirection },
              turnWindowActive: false,
              isJumping: false,
              jumpTimeRemaining: 0,
            };
          }
          // Completely crossed an obstacle tile without jumping → immediate game over
          if (!newIsJumping && leavingTile.hasObstacle) {
            playFail();
            return {
              ...prev,
              status: 'gameOver',
              score: newScore,
              player: { ...player, tileIndex: newTileIndex, progress: 0.55, isAlive: false, direction: newDirection },
              turnWindowActive: false,
              isJumping: false,
              jumpTimeRemaining: 0,
            };
          }
        }

        newProgress -= 1;
        newTileIndex += 1;

        // Score for advancing a tile (multiplied by difficulty)
        if (newTileIndex > lastTileScored.current) {
          newScore += Math.round(scoreForTile() * scoreMultiplier);
          lastTileScored.current = newTileIndex;
        }

        // Reset turn handled flag for the new tile
        turnHandledRef.current = false;

        // Update direction to match the new tile's direction (after any previous turn)
        const newTile = tiles[newTileIndex];
        if (newTile) {
          newDirection = newTile.direction;
        }
      }

      const currentTile = tiles[newTileIndex];

      // Check if level is complete (reached last tile)
      if (newTileIndex >= tiles.length - 1 && newProgress >= 0.9) {
        newScore += Math.round(scoreForLevelComplete() * scoreMultiplier);
        return {
          ...prev,
          status: 'levelComplete',
          score: newScore,
          collectedGems: newCollectedGems,
          isJumping: false,
          jumpTimeRemaining: 0,
          player: { ...player, tileIndex: newTileIndex, progress: newProgress, direction: newDirection },
        };
      }

      // Check turn window
      if (currentTile && currentTile.isTurn) {
        newTurnWindowActive =
          newProgress >= config.turnWindowStart &&
          newProgress <= config.turnWindowEnd &&
          !turnHandledRef.current;
      }

      // Check missed turn
      if (missedTurn(currentTile, newProgress, config.turnWindowEnd, turnHandledRef.current)) {
        playFail();
        return {
          ...prev,
          status: 'gameOver',
          score: newScore,
          player: { ...player, tileIndex: newTileIndex, progress: newProgress, isAlive: false, direction: newDirection },
          turnWindowActive: false,
          isJumping: false,
          jumpTimeRemaining: 0,
        };
      }

      // Check gem collection
      if (checkGemCollection(currentTile, newProgress, newCollectedGems)) {
        newCollectedGems.push(currentTile.id);
        newScore += Math.round(scoreForGem() * scoreMultiplier);
        playGem();
      }

      // Check obstacle hit (skip during jump)
      if (!newIsJumping && checkObstacleHit(currentTile, newProgress)) {
        playFail();
        return {
          ...prev,
          status: 'gameOver',
          score: newScore,
          player: { ...player, tileIndex: newTileIndex, progress: newProgress, isAlive: false, direction: newDirection },
          turnWindowActive: false,
          isJumping: false,
          jumpTimeRemaining: 0,
        };
      }

      return {
        ...prev,
        score: newScore,
        collectedGems: newCollectedGems,
        turnWindowActive: newTurnWindowActive,
        isJumping: newIsJumping,
        jumpTimeRemaining: newJumpTimeRemaining,
        player: {
          ...player,
          tileIndex: newTileIndex,
          progress: newProgress,
          direction: newDirection,
        },
      };
    });
  }, []);

  /**
   * Handle a player tap.
   */
  const handleTap = useCallback(() => {
    setGameState((prev) => {
      if (prev.status !== 'playing') return prev;

      const { player, tiles, config } = prev;
      const currentTile = tiles[player.tileIndex];

      const result = processTap(currentTile, player.progress, config.turnWindowStart, config.turnWindowEnd);

      if (result === 'success') {
        turnHandledRef.current = true;
        playTap();
        const newDirection = TURN_MAP[player.direction][currentTile.turnDirection];
        return {
          ...prev,
          score: prev.score + Math.round(scoreForTurn() * scoreMultiplier),
          turnWindowActive: false,
          player: {
            ...player,
            direction: newDirection,
          },
        };
      }

      // 'miss' and 'ignore' — ignore doesn't penalize; single-tap behavior handled by caller
      return prev;
    });
  }, []);

  // Explicit jump command (double-tap)
  const jump = useCallback(() => {
    setGameState((prev) => {
      if (prev.status !== 'playing' || prev.isJumping) return prev;
      playTap();
      return {
        ...prev,
        isJumping: true,
        jumpTimeRemaining: JUMP_DURATION,
      };
    });
  }, []);

  // Run the game loop
  useGameLoop(tick, gameState.status === 'playing');

  // Fire callbacks on status change (after render)
  const prevStatusRef = useRef(gameState.status);
  useEffect(() => {
    if (gameState.status === prevStatusRef.current) return;
    prevStatusRef.current = gameState.status;
    if (gameState.status === 'gameOver' && callbacks?.onGameOver) {
      // call after render
      callbacks.onGameOver(gameState.score);
    }
    if (gameState.status === 'levelComplete' && callbacks?.onLevelComplete) {
      callbacks.onLevelComplete(gameState.score);
    }
  }, [gameState.status]);

  return {
    gameState,
    startGame,
    restartGame,
    handleTap,
    jump,
    pauseGame,
    resumeGame,
  };
}
