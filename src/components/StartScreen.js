import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';
import { getTheme } from '../utils/theme';
import { DIFFICULTIES } from '../utils/constants';
import { playButton } from '../services/audioService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DIFFICULTY_KEYS = ['normal', 'medium', 'hard'];

/**
 * Start Screen — animated title, difficulty selector, play button, map, tutorial.
 */
export default function StartScreen({ onStart, onOpenMap, onTutorial, soundEnabled, onToggleSound, difficulty, onChangeDifficulty }) {
  const theme = getTheme('green');
  const titleScale = useRef(new Animated.Value(0.6)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const buttonsSlide = useRef(new Animated.Value(40)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Entrance animation
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(titleScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(buttonsSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(buttonsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Play button pulse
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const currentDiff = DIFFICULTIES[difficulty || 'normal'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Decorative background particles */}
      <View style={styles.particlesContainer}>
        {[...Array(8)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${(i * 13 + 5) % 90}%`,
                top: `${(i * 17 + 10) % 85}%`,
                width: 4 + (i % 3) * 3,
                height: 4 + (i % 3) * 3,
                borderRadius: (4 + (i % 3) * 3) / 2,
                backgroundColor: theme.hudAccent,
                opacity: 0.1 + (i % 4) * 0.05,
              },
            ]}
          />
        ))}
      </View>

      {/* Sound toggle */}
      <Pressable
        style={({ pressed }) => [styles.soundButton, { opacity: pressed ? 0.7 : 1 }]}
        onPress={onToggleSound}
      >
        <Text style={[styles.soundButtonText, { color: theme.hud }]}>
          {soundEnabled ? '🔊' : '🔇'}
        </Text>
      </Pressable>

      {/* Animated title */}
      <Animated.View
        style={[
          styles.titleContainer,
          { transform: [{ scale: titleScale }], opacity: titleOpacity },
        ]}
      >
        <Text style={[styles.title, { color: theme.hud }]}>TAP TAP</Text>
        <Text style={[styles.titleAccent, { color: theme.hudAccent }]}>DASH</Text>
        <View style={[styles.titleUnderline, { backgroundColor: theme.hudAccent }]} />
      </Animated.View>

      {/* Difficulty selector */}
      <Animated.View
        style={[
          styles.difficultyContainer,
          { opacity: buttonsOpacity, transform: [{ translateY: buttonsSlide }] },
        ]}
      >
        <Text style={[styles.diffLabel, { color: theme.textSecondary }]}>DIFFICULTY</Text>
        <View style={styles.diffRow}>
          {DIFFICULTY_KEYS.map((key) => {
            const d = DIFFICULTIES[key];
            const isSelected = key === (difficulty || 'normal');
            return (
              <Pressable
                key={key}
                style={({ pressed }) => [
                  styles.diffButton,
                  {
                    backgroundColor: isSelected ? d.color : 'transparent',
                    borderColor: d.color,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => { playButton(); onChangeDifficulty(key); }}
              >
                <Text
                  style={[
                    styles.diffButtonText,
                    { color: isSelected ? '#FFF' : d.color },
                  ]}
                >
                  {d.label}
                </Text>
                {isSelected && (
                  <Text style={styles.multiplierText}>x{d.scoreMultiplier}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Play button */}
      <Animated.View
        style={[
          { opacity: buttonsOpacity, transform: [{ translateY: buttonsSlide }, { scale: pulseAnim }] },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: currentDiff.color,
              opacity: pressed ? 0.8 : 1,
              shadowColor: currentDiff.color,
            },
          ]}
          onPress={() => { playButton(); onStart(); }}
        >
          <Text style={[styles.buttonText, { color: '#FFF' }]}>▶  PLAY</Text>
        </Pressable>
      </Animated.View>

      {/* Secondary buttons */}
      <Animated.View
        style={[
          styles.secondaryRow,
          { opacity: buttonsOpacity, transform: [{ translateY: buttonsSlide }] },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.mapButton,
            { borderColor: theme.button, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => { playButton(); onOpenMap(); }}
        >
          <Text style={[styles.mapButtonText, { color: theme.button }]}>🗺  LEVELS</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tutorialButton,
            { borderColor: '#2196F3', opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => { playButton(); onTutorial(); }}
        >
          <Text style={[styles.tutorialButtonText, { color: '#2196F3' }]}>❓  HOW TO PLAY</Text>
        </Pressable>
      </Animated.View>

      <Text style={[styles.footer, { color: theme.textSecondary }]}>
        One button. One life. 20 levels.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4,
  },
  titleAccent: {
    fontSize: 58,
    fontWeight: '900',
    letterSpacing: 10,
    marginTop: -8,
  },
  titleUnderline: {
    width: 80,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    opacity: 0.6,
  },
  difficultyContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  diffLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 10,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 10,
  },
  diffButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    minWidth: 85,
  },
  diffButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  multiplierText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 56,
    paddingVertical: 18,
    borderRadius: 32,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  secondaryRow: {
    alignItems: 'center',
    gap: 12,
  },
  mapButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tutorialButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  tutorialButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    opacity: 0.6,
  },
  soundButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  soundButtonText: {
    fontSize: 28,
  },
});
