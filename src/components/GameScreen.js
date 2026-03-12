import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { getTheme } from '../utils/theme';
import { getLevelConfig } from '../engine/levelController';
import useGameEngine from '../hooks/useGameEngine';
import PathView from './PathView';
import HUD from './HUD';
import { lightHaptic, heavyHaptic, successHaptic } from '../services/hapticsService';
import { playComplete } from '../services/audioService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Game Screen — main gameplay with one full-screen Pressable for tap input.
 * Uses onPressIn (touch-down) instead of onPress (touch-up) for zero tap delay.
 */
export default function GameScreen({ levelId, onGameOver, onLevelComplete, difficulty, onQuit }) {
  const config = getLevelConfig(levelId);
  const theme = getTheme(config?.theme || 'green');

  const callbacks = {
    onGameOver: (score) => {
      heavyHaptic();
      // playFail() is already called inside the game engine tick on collision
      onGameOver(score);
    },
    onLevelComplete: (score) => {
      successHaptic();
      playComplete();
      onLevelComplete(score);
    },
  };

  const { gameState, startGame, handleTap, jump, pauseGame, resumeGame } = useGameEngine(levelId, callbacks, difficulty);

  const [showSettings, setShowSettings] = useState(false);

  // Refs to avoid stale closures — eliminates tap delay from useCallback re-creation
  const handleTapRef = useRef(handleTap);
  const gameStateRef = useRef(gameState);
  const showSettingsRef = useRef(false);
  const lastTapRef = useRef(0);
  const tapTimerRef = useRef(null);
  handleTapRef.current = handleTap;
  gameStateRef.current = gameState;
  showSettingsRef.current = showSettings;

  // Auto-start the game when this screen mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      startGame();
    }, 300);
    return () => clearTimeout(timer);
  }, [startGame]);

  // Settings handlers
  const onSettingsPress = useCallback(() => {
    pauseGame();
    setShowSettings(true);
  }, [pauseGame]);

  const onResume = useCallback(() => {
    setShowSettings(false);
    resumeGame();
  }, [resumeGame]);

  const onSettingsQuit = useCallback(() => {
    setShowSettings(false);
    if (onQuit) onQuit();
  }, [onQuit]);

  // Single vs double tap:
  //   - If on a turn window → fire turn INSTANTLY (no delay)
  //   - Double-tap within 300ms → jump
  //   - Single tap on non-turn tile → jump after brief delay allows double-tap
  const onTap = useCallback(() => {
    if (showSettingsRef.current) return;
    const state = gameStateRef.current;
    if (state.status !== 'playing') return;

    const now = Date.now();
    const delta = now - (lastTapRef.current || 0);

    // --- TURN: always instant, no double-tap window needed ---
    if (state.turnWindowActive) {
      // cancel any pending timer so it doesn't fire after the turn
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }
      lastTapRef.current = 0;
      lightHaptic();
      handleTapRef.current();
      return;
    }

    // --- DOUBLE-TAP on non-turn tile: jump ---
    if (delta > 0 && delta <= 250) {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }
      lastTapRef.current = 0;
      jump();
      return;
    }

    // --- SINGLE tap on non-turn tile: schedule jump after double-tap window ---
    lastTapRef.current = now;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      jump();
      lastTapRef.current = 0;
      tapTimerRef.current = null;
    }, 260);
  }, [jump]);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    };
  }, []);

  // Cancel any pending jump timer the instant a turn window opens
  useEffect(() => {
    if (gameState.turnWindowActive && tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
      lastTapRef.current = 0;
    }
  }, [gameState.turnWindowActive]);

  return (
    <Pressable style={[styles.container, { backgroundColor: theme.background }]} onPressIn={onTap}>
      <PathView
        gameState={gameState}
        theme={theme}
        screenWidth={SCREEN_WIDTH}
        screenHeight={SCREEN_HEIGHT}
      />
      <HUD
        level={levelId}
        levelName={config?.name || ''}
        score={gameState.score}
        gemCount={gameState.collectedGems.length}
        theme={theme}
        difficulty={difficulty}
        onSettingsPress={onSettingsPress}
      />

      {/* Pause / Settings overlay */}
      {showSettings && (
        <View style={styles.settingsOverlay}>
          <View style={[styles.settingsModal, { backgroundColor: theme.background }]}>
            <Text style={[styles.settingsTitle, { color: theme.hud }]}>⏸  PAUSED</Text>

            <Pressable
              style={({ pressed }) => [
                styles.settingsBtn,
                { backgroundColor: theme.button, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={onResume}
            >
              <Text style={[styles.settingsBtnText, { color: theme.buttonText }]}>▶  RESUME</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.settingsBtn,
                styles.quitBtn,
                { borderColor: theme.obstacle, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={onSettingsQuit}
            >
              <Text style={[styles.settingsBtnText, { color: theme.obstacle }]}>✕  QUIT</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 300,
  },
  settingsModal: {
    width: 260,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 30,
  },
  settingsBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 12,
  },
  settingsBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  quitBtn: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
});
