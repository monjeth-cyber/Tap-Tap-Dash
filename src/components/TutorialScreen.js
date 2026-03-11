import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';
import { getTheme } from '../utils/theme';
import { playButton } from '../services/audioService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TUTORIAL_STEPS = [
  {
    title: '🎯 OBJECTIVE',
    text: 'Run along the path and reach the end of each level without falling off!',
    icon: '🏁',
    color: '#4CAF50',
  },
  {
    title: '👆 HOW TO PLAY',
    text: 'Your character moves automatically.\nTAP the screen when you reach a turn tile to change direction.',
    icon: '👆',
    color: '#2196F3',
  },
  {
    title: '⏱ TIMING IS KEY',
    text: 'Turn tiles glow yellow when it\'s time to tap.\nTap inside the window — too early or too late and nothing happens!',
    icon: '⏱',
    color: '#FF9800',
  },
  {
    title: '💎 COLLECT GEMS',
    text: 'Grab gems on the path for bonus points.\nThey appear as golden circles on tiles.',
    icon: '💎',
    color: '#FFD700',
  },
  {
    title: '⚠️ AVOID OBSTACLES',
    text: 'Red diamond shapes are obstacles.\nHit one and it\'s game over!',
    icon: '💀',
    color: '#F44336',
  },
  {
    title: '❌ DON\'T MISS TURNS',
    text: 'If you pass a turn tile without tapping,\nyou\'ll run off the path. Game over!',
    icon: '🚫',
    color: '#E91E63',
  },
  {
    title: '🏆 GOALS',
    text: 'Complete all 20 levels across 3 worlds.\nEarn high scores and beat your best!\nHigher difficulty = bigger score multiplier.',
    icon: '⭐',
    color: '#9C27B0',
  },
];

export default function TutorialScreen({ onComplete }) {
  const theme = getTheme('green');
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse the icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const animateToStep = (newStep) => {
    const direction = newStep > step ? 1 : -1;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -direction * 50, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(newStep);
      slideAnim.setValue(direction * 50);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  };

  const nextStep = () => {
    playButton();
    if (step < TUTORIAL_STEPS.length - 1) {
      animateToStep(step + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    playButton();
    if (step > 0) {
      animateToStep(step - 1);
    }
  };

  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        {TUTORIAL_STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === step ? current.color : 'rgba(255,255,255,0.2)',
                width: i === step ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Step content */}
      <Animated.View
        style={[
          styles.card,
          {
            borderColor: current.color,
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Animated.Text
          style={[styles.icon, { transform: [{ scale: pulseAnim }] }]}
        >
          {current.icon}
        </Animated.Text>

        <Text style={[styles.stepTitle, { color: current.color }]}>{current.title}</Text>
        <Text style={styles.stepText}>{current.text}</Text>
      </Animated.View>

      {/* Step counter */}
      <Text style={styles.stepCounter}>
        {step + 1} / {TUTORIAL_STEPS.length}
      </Text>

      {/* Navigation */}
      <View style={styles.navRow}>
        {step > 0 ? (
          <Pressable
            style={({ pressed }) => [styles.navButton, { opacity: pressed ? 0.7 : 1 }]}
            onPress={prevStep}
          >
            <Text style={styles.navButtonText}>← BACK</Text>
          </Pressable>
        ) : (
          <View style={styles.navButton} />
        )}

        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            { backgroundColor: current.color, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={nextStep}
        >
          <Text style={styles.nextButtonText}>
            {isLast ? 'LET\'S GO! 🚀' : 'NEXT →'}
          </Text>
        </Pressable>
      </View>

      {/* Skip */}
      <Pressable
        style={({ pressed }) => [styles.skipButton, { opacity: pressed ? 0.5 : 0.6 }]}
        onPress={() => { playButton(); onComplete(); }}
      >
        <Text style={styles.skipText}>Skip Tutorial</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'absolute',
    top: 60,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: 'center',
    width: SCREEN_WIDTH - 48,
    maxWidth: 380,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
  },
  stepCounter: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 24,
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 16,
  },
  navButton: {
    width: 90,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 'bold',
  },
  nextButton: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  skipButton: {
    position: 'absolute',
    bottom: 40,
  },
  skipText: {
    fontSize: 14,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
