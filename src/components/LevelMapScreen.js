import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Animated, StyleSheet } from 'react-native';
import { getTheme } from '../utils/theme';
import { getAllLevels } from '../engine/levelController';
import { formatScore } from '../utils/helpers';
import { playButton } from '../services/audioService';

/**
 * Level Map Screen — enhanced grid of 20 levels with visual theming and animations.
 */
export default function LevelMapScreen({ unlockedLevel, bestScores, onSelectLevel, onBack }) {
  const theme = getTheme('green');
  const levels = getAllLevels();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => { playButton(); onBack(); }}
        >
          <Text style={[styles.backText, { color: theme.hudAccent }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.hud }]}>SELECT LEVEL</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tier labels */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        {/* Tier groups */}
        {[
          { label: 'TUTORIAL', range: [1, 5], color: '#4CAF50' },
          { label: 'INTERMEDIATE', range: [6, 10], color: '#1B9AAA' },
          { label: 'HARD', range: [11, 15], color: '#D4A017' },
          { label: 'EXPERT', range: [16, 20], color: '#F44336' },
        ].map((tier) => (
          <View key={tier.label} style={styles.tierSection}>
            <View style={styles.tierHeader}>
              <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
              <Text style={[styles.tierLabel, { color: tier.color }]}>{tier.label}</Text>
              <View style={[styles.tierLine, { backgroundColor: tier.color }]} />
            </View>
            <View style={styles.grid}>
              {levels.filter((l) => l.id >= tier.range[0] && l.id <= tier.range[1]).map((level) => {
                const isUnlocked = level.id <= unlockedLevel;
                const best = bestScores[level.id];
                const isCompleted = best !== undefined && best > 0;
                const levelTheme = getTheme(level.theme);

                return (
                  <Pressable
                    key={level.id}
                    style={({ pressed }) => [
                      styles.levelCard,
                      {
                        backgroundColor: isUnlocked
                          ? isCompleted
                            ? levelTheme.completed
                            : levelTheme.unlocked
                          : theme.locked,
                        opacity: pressed && isUnlocked ? 0.8 : isUnlocked ? 1 : 0.4,
                        borderColor: isCompleted ? 'rgba(255,255,255,0.2)' : 'transparent',
                      },
                    ]}
                    onPress={() => isUnlocked && (() => { playButton(); onSelectLevel(level.id); })()}
                    disabled={!isUnlocked}
                  >
                    {isCompleted && <Text style={styles.checkMark}>✓</Text>}
                    <Text style={styles.levelNumber}>{level.id}</Text>
                    <Text style={styles.levelName} numberOfLines={1}>
                      {isUnlocked ? level.name : '🔒'}
                    </Text>
                    {isCompleted && (
                      <Text style={styles.bestScore}>{formatScore(best)}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  tierSection: {
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  tierLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginRight: 10,
  },
  tierLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  levelCard: {
    width: 82,
    height: 92,
    margin: 6,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  checkMark: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
    opacity: 0.8,
  },
  levelNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelName: {
    fontSize: 9,
    color: '#fff',
    marginTop: 3,
    opacity: 0.85,
  },
  bestScore: {
    fontSize: 10,
    color: '#fff',
    marginTop: 3,
    fontWeight: '600',
    opacity: 0.9,
  },
});
