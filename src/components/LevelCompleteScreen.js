import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { getTheme } from '../utils/theme';
import { formatScore } from '../utils/helpers';
import { getLevelConfig } from '../engine/levelController';
import { playButton } from '../services/audioService';

/**
 * Level Complete Screen — animated congratulations with score and navigation.
 */
export default function LevelCompleteScreen({ levelId, score, bestScore, onNextLevel, onBackToMap, onBackToMain }) {
  const config = getLevelConfig(levelId);
  const theme = getTheme(config?.theme || 'green');
  const hasNextLevel = levelId < 20;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const starSpinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stars spin in
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(starSpinAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    // Content fade in
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const starRotate = starSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Animated star/trophy */}
        <Animated.Text
          style={[
            styles.trophy,
            { transform: [{ scale: scaleAnim }, { rotate: starRotate }] },
          ]}
        >
          ⭐
        </Animated.Text>

        <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
          <Text style={[styles.completeText, { color: theme.hudAccent }]}>LEVEL</Text>
          <Text style={[styles.completeText, { color: theme.gem }]}>COMPLETE!</Text>
        </Animated.View>

        <Text style={[styles.levelName, { color: theme.textSecondary }]}>
          {config?.name || `Level ${levelId}`}
        </Text>

        <Animated.View style={[styles.scoreSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>SCORE</Text>
          <Text style={[styles.scoreValue, { color: theme.hud }]}>{formatScore(score)}</Text>
        </Animated.View>

        <Animated.View style={[styles.scoreSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>BEST</Text>
          <Text style={[styles.bestScoreValue, { color: theme.hudAccent }]}>
            {formatScore(bestScore)}
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {hasNextLevel && (
            <Pressable
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: theme.button, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => { playButton(); onNextLevel(); }}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                NEXT LEVEL ▶
              </Text>
            </Pressable>
          )}

          {!hasNextLevel && (
            <View style={styles.heroSection}>
              <Text style={[styles.heroText, { color: theme.gem }]}>
                🏆 YOU ARE A LEGEND! 🏆
              </Text>
            </View>
          )}

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
  trophy: {
    fontSize: 64,
    marginBottom: 8,
  },
  completeText: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  levelName: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 30,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 46,
    fontWeight: 'bold',
  },
  bestScoreValue: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  nextButton: {
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 24,
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
  heroSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  heroText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
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
