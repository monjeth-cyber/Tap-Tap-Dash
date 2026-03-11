import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { getTheme } from '../utils/theme';
import { formatScore } from '../utils/helpers';
import { playButton } from '../services/audioService';

/**
 * Game Over Screen — animated score display, shake effect, retry and map options.
 */
export default function GameOverScreen({ score, bestScore, levelId, onRestart, onBackToMap, onBackToMain }) {
  const theme = getTheme('green');
  const isNewBest = score >= bestScore && score > 0;

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Title shake + scale in
    Animated.parallel([
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();

    // Content fade in
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Animated.Text
          style={[
            styles.gameOverText,
            {
              color: theme.obstacle,
              transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          GAME OVER
        </Animated.Text>

        <Animated.View style={[styles.scoreSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>SCORE</Text>
          <Text style={[styles.scoreValue, { color: theme.hud }]}>{formatScore(score)}</Text>
        </Animated.View>

        <Animated.View style={[styles.scoreSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>BEST</Text>
          <Text style={[styles.bestScoreValue, { color: theme.hudAccent }]}>
            {formatScore(bestScore)}
          </Text>
          {isNewBest && (
            <Text style={[styles.newBest, { color: theme.gem }]}>🏆 NEW BEST!</Text>
          )}
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Pressable
            style={({ pressed }) => [
              styles.restartButton,
              { backgroundColor: theme.button, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => { playButton(); onRestart(); }}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>🔄  RETRY</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.mapButton,
              { borderColor: theme.button, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => { playButton(); onBackToMap(); }}
          >
            <Text style={[styles.mapButtonText, { color: theme.button }]}>🗺  LEVELS</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.mapButton,
              { borderColor: theme.textSecondary, opacity: pressed ? 0.8 : 1, marginTop: 10 },
            ]}
            onPress={() => { playButton(); onBackToMain(); }}
          >
            <Text style={[styles.mapButtonText, { color: theme.textSecondary }]}>🏠  MAIN MENU</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  gameOverText: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 5,
    marginBottom: 40,
    textShadowColor: 'rgba(244,67,54,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  bestScoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  newBest: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
  },
  restartButton: {
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  mapButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    marginTop: 16,
    alignItems: 'center',
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
