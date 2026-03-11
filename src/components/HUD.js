import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { formatScore } from '../utils/helpers';
import { DIFFICULTIES } from '../utils/constants';

/**
 * Heads-Up Display showing level, score, gem count, and difficulty badge during gameplay.
 */
export default function HUD({ level, levelName, score, gemCount, theme, difficulty, onSettingsPress }) {
  const scoreAnim = useRef(new Animated.Value(1)).current;
  const prevScore = useRef(score);

  // Bounce animation when score changes
  useEffect(() => {
    if (score !== prevScore.current) {
      prevScore.current = score;
      Animated.sequence([
        Animated.timing(scoreAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
        Animated.timing(scoreAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [score]);

  const diffPreset = DIFFICULTIES[difficulty || 'normal'];

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={[styles.levelText, { color: theme.hudAccent }]}>
          LVL {level}
        </Text>
        <Text style={[styles.levelName, { color: theme.textSecondary }]}>
          {levelName}
        </Text>
        {difficulty && difficulty !== 'normal' && (
          <View style={[styles.diffBadge, { backgroundColor: diffPreset.color }]}>
            <Text style={styles.diffBadgeText}>{diffPreset.label.toUpperCase()}</Text>
          </View>
        )}
      </View>
      <View style={styles.center}>
        <Animated.Text
          style={[styles.scoreText, { color: theme.hud, transform: [{ scale: scoreAnim }] }]}
        >
          {formatScore(score)}
        </Animated.Text>
      </View>
      <View style={styles.right}>
        {onSettingsPress && (
          <Pressable style={styles.gearButton} onPress={onSettingsPress} hitSlop={8}>
            <Text style={styles.gearEmoji}>⚙️</Text>
          </Pressable>
        )}
        <Text style={[styles.gemText, { color: theme.gem }]}>
          💎 {gemCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  left: {
    alignItems: 'flex-start',
  },
  center: {
    alignItems: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelName: {
    fontSize: 11,
    marginTop: 2,
  },
  diffBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  diffBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  gearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  gearEmoji: {
    fontSize: 20,
  },
  gemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
