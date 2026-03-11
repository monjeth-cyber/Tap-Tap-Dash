import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';

import StartScreen from './src/components/StartScreen';
import LevelMapScreen from './src/components/LevelMapScreen';
import GameScreen from './src/components/GameScreen';
import GameOverScreen from './src/components/GameOverScreen';
import LevelCompleteScreen from './src/components/LevelCompleteScreen';
import TutorialScreen from './src/components/TutorialScreen';
import useSaveData from './src/hooks/useSaveData';
import { getNextLevelId } from './src/engine/levelController';
import { getBestScore } from './src/engine/scoreManager';
import { preloadSounds, unloadSounds } from './src/services/audioService';

/**
 * App — root component with conditional screen rendering.
 *
 * Screens: start | map | game | gameOver | levelComplete | tutorial
 */
export default function App() {
  const [screen, setScreen] = useState('start');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [lastScore, setLastScore] = useState(0);
  const [difficulty, setDifficulty] = useState('normal');

  const { unlockedLevel, bestScores, soundEnabled, loaded, unlockLevel, updateBestScore, toggleSound } = useSaveData();

  // Preload sounds on mount, unload on unmount
  useEffect(() => {
    preloadSounds().catch(() => { /* audio unavailable — silent mode */ });
    return () => { unloadSounds().catch(() => {}); };
  }, []);

  // ---------- Screen transitions ----------

  const goToStart = useCallback(() => setScreen('start'), []);
  const goToMap = useCallback(() => setScreen('map'), []);
  const goToTutorial = useCallback(() => setScreen('tutorial'), []);

  const startLevel = useCallback((levelId) => {
    setSelectedLevel(levelId);
    setScreen('game');
  }, []);

  const quickPlay = useCallback(() => {
    // Start the highest unlocked level
    setSelectedLevel(unlockedLevel);
    setScreen('game');
  }, [unlockedLevel]);

  const handleGameOver = useCallback(async (score) => {
    setLastScore(score);
    await updateBestScore(selectedLevel, score);
    setScreen('gameOver');
  }, [selectedLevel, updateBestScore]);

  const handleLevelComplete = useCallback(async (score) => {
    setLastScore(score);
    await updateBestScore(selectedLevel, score);
    const nextId = getNextLevelId(selectedLevel);
    if (nextId) {
      await unlockLevel(nextId);
    }
    setScreen('levelComplete');
  }, [selectedLevel, updateBestScore, unlockLevel]);

  const restartLevel = useCallback(() => {
    setScreen('game');
  }, []);

  const goToNextLevel = useCallback(() => {
    const nextId = getNextLevelId(selectedLevel);
    if (nextId) {
      setSelectedLevel(nextId);
      setScreen('game');
    } else {
      setScreen('map');
    }
  }, [selectedLevel]);

  const handleChangeDifficulty = useCallback((diff) => {
    setDifficulty(diff);
  }, []);

  // ---------- Loading state ----------

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  // ---------- Conditional rendering ----------

  const currentBest = getBestScore(lastScore, bestScores[selectedLevel]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {screen === 'start' && (
        <StartScreen
          onStart={quickPlay}
          onOpenMap={goToMap}
          onTutorial={goToTutorial}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          difficulty={difficulty}
          onChangeDifficulty={handleChangeDifficulty}
        />
      )}

      {screen === 'tutorial' && (
        <TutorialScreen onComplete={goToStart} />
      )}

      {screen === 'map' && (
        <LevelMapScreen
          unlockedLevel={unlockedLevel}
          bestScores={bestScores}
          onSelectLevel={startLevel}
          onBack={goToStart}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          key={`game-${selectedLevel}-${Date.now()}`}
          levelId={selectedLevel}
          onGameOver={handleGameOver}
          onLevelComplete={handleLevelComplete}
          difficulty={difficulty}
          onQuit={goToStart}
        />
      )}

      {screen === 'gameOver' && (
        <GameOverScreen
          score={lastScore}
          bestScore={currentBest}
          levelId={selectedLevel}
          onRestart={restartLevel}
          onBackToMap={goToMap}
          onBackToMain={goToStart}
        />
      )}

      {screen === 'levelComplete' && (
        <LevelCompleteScreen
          levelId={selectedLevel}
          score={lastScore}
          bestScore={currentBest}
          onNextLevel={goToNextLevel}
          onBackToMap={goToMap}
          onBackToMain={goToStart}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2e1a',
  },
  loading: {
    flex: 1,
    backgroundColor: '#1a2e1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
});
