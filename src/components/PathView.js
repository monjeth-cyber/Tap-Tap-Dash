import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { TILE_SIZE, VISIBLE_TILE_RANGE, DIRECTIONS } from '../utils/constants';
import Player, { CHARACTER_BOX } from './Player';

/**
 * Renders the 3D-styled path tiles, gems, obstacles, turn indicators, and the player.
 * Uses absolute positioning with perspective and depth effects.
 */
export default function PathView({ gameState, theme, screenWidth, screenHeight }) {
  const { tiles, player, collectedGems, turnWindowActive, config, isJumping } = gameState;
  const gemPulse = useRef(new Animated.Value(0.8)).current;
  const turnGlow = useRef(new Animated.Value(0.6)).current;

  // Gem pulse animation
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(gemPulse, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(gemPulse, { toValue: 0.8, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // Turn glow animation
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(turnGlow, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(turnGlow, { toValue: 0.6, duration: 400, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  if (!tiles || tiles.length === 0 || !config) return null;

  const currentTile = tiles[player.tileIndex];
  const playerPixelPos = getPixelPosition(player.tileIndex, player.progress, tiles);

  const cameraX = screenWidth / 2 - playerPixelPos.x;
  const cameraY = screenHeight / 2 - playerPixelPos.y;

  const minIdx = Math.max(0, player.tileIndex - 3);
  const maxIdx = Math.min(tiles.length - 1, player.tileIndex + VISIBLE_TILE_RANGE);
  const visibleTiles = tiles.slice(minIdx, maxIdx + 1);

  return (
    <View style={styles.container}>
      {/* Scrolling world container */}
      <View style={[styles.world, { transform: [{ translateX: cameraX }, { translateY: cameraY }] }]}>
        {/* Tile shadows (rendered first for depth) */}
        {visibleTiles.map((tile) => {
          const px = tile.x * TILE_SIZE;
          const py = tile.y * TILE_SIZE;
          return (
            <View
              key={`shadow-${tile.id}`}
              style={[
                styles.tileShadow,
                {
                  left: px - TILE_SIZE / 2 + 3,
                  top: py - TILE_SIZE / 2 + 4,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                },
              ]}
            />
          );
        })}

        {/* Render tiles with 3D styling */}
        {visibleTiles.map((tile) => {
          const px = tile.x * TILE_SIZE;
          const py = tile.y * TILE_SIZE;
          const isCurrent = tile.id === currentTile?.id;
          const showTurnIndicator = isCurrent && turnWindowActive && tile.isTurn;

          return (
            <View
              key={tile.id}
              style={[
                styles.tile,
                {
                  left: px - TILE_SIZE / 2,
                  top: py - TILE_SIZE / 2,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: showTurnIndicator ? theme.turnIndicator : theme.path,
                  borderColor: theme.pathEdge,
                },
              ]}
            >
              {/* 3D top highlight */}
              <View style={[styles.tileHighlight, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
              {/* 3D bottom edge */}
              <View style={[styles.tileBevel, { backgroundColor: theme.pathEdge }]} />

              {/* Gem with pulse animation */}
              {tile.hasGem && !collectedGems.includes(tile.id) && (
                <Animated.View
                  style={[
                    styles.gemOuter,
                    { transform: [{ scale: gemPulse }] },
                  ]}
                >
                  <View style={[styles.gem, { backgroundColor: theme.gem, shadowColor: theme.gemGlow }]} />
                  <View style={styles.gemShine} />
                </Animated.View>
              )}

              {/* Obstacle with 3D effect */}
              {tile.hasObstacle && (
                <View style={styles.obstacleWrapper}>
                  <View style={[styles.obstacle, { backgroundColor: theme.obstacle, borderColor: theme.obstacleEdge }]} />
                  <View style={styles.obstacleSkull}>
                    <View style={styles.obstacleX} />
                  </View>
                </View>
              )}

              {/* Turn arrow indicator with glow */}
              {tile.isTurn && (
                <View style={styles.turnArrow}>
                  {showTurnIndicator && (
                    <Animated.View
                      style={[
                        styles.turnGlowRing,
                        {
                          borderColor: theme.turnIndicator,
                          opacity: turnGlow,
                        },
                      ]}
                    />
                  )}
                  <View
                    style={[
                      styles.arrow,
                      {
                        borderBottomColor: showTurnIndicator ? '#FFF' : theme.pathEdge,
                        transform: [{ rotate: getArrowRotation(tile.direction, tile.turnDirection) }],
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          );
        })}

        {/* Render player */}
        <View
          style={[
            styles.playerContainer,
            {
            left: playerPixelPos.x - CHARACTER_BOX / 2,
            top: playerPixelPos.y - CHARACTER_BOX / 2,
            },
          ]}
        >
          <Player
            theme={theme}
            direction={player.direction}
            isPlaying={gameState.status === 'playing' && player.isAlive}
            isJumping={isJumping}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * Convert tile index + progress to pixel position.
 */
function getPixelPosition(tileIndex, progress, tiles) {
  if (!tiles || tiles.length === 0) return { x: 0, y: 0 };

  const idx = Math.min(tileIndex, tiles.length - 1);
  const tile = tiles[idx];
  const nextIdx = Math.min(idx + 1, tiles.length - 1);
  const nextTile = tiles[nextIdx];

  const baseX = tile.x * TILE_SIZE;
  const baseY = tile.y * TILE_SIZE;

  if (idx === nextIdx) {
    return { x: baseX, y: baseY };
  }

  // Interpolate between current and next tile
  const nextX = nextTile.x * TILE_SIZE;
  const nextY = nextTile.y * TILE_SIZE;

  return {
    x: baseX + (nextX - baseX) * progress,
    y: baseY + (nextY - baseY) * progress,
  };
}

/**
 * Get rotation for the turn arrow indicator.
 */
function getArrowRotation(direction, turnDirection) {
  const rotations = {
    up: { left: '-90deg', right: '90deg' },
    down: { left: '90deg', right: '-90deg' },
    left: { left: '180deg', right: '0deg' },
    right: { left: '0deg', right: '180deg' },
  };
  return rotations[direction]?.[turnDirection] || '0deg';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  world: {
    position: 'absolute',
    width: 5000,
    height: 5000,
  },
  tileShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 5,
  },
  tile: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tileHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tileBevel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    opacity: 0.5,
  },
  gemOuter: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  gem: {
    width: 20,
    height: 20,
    borderRadius: 10,
    elevation: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  gemShine: {
    position: 'absolute',
    top: 3,
    left: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  obstacleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  obstacle: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    transform: [{ rotate: '45deg' }],
    elevation: 4,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  obstacleSkull: {
    position: 'absolute',
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  obstacleX: {
    width: 8,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 1,
  },
  turnArrow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  turnGlowRing: {
    position: 'absolute',
    width: TILE_SIZE - 6,
    height: TILE_SIZE - 6,
    borderRadius: (TILE_SIZE - 6) / 2,
    borderWidth: 3,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  playerContainer: {
    position: 'absolute',
    zIndex: 10,
  },
});
