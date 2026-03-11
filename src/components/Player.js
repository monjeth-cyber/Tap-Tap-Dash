import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { PLAYER_SIZE, TILE_SIZE } from '../utils/constants';

export const CHARACTER_BOX = TILE_SIZE;

const BODY_HEIGHT = PLAYER_SIZE * 1.1;
const HEAD_SIZE = PLAYER_SIZE * 0.45;
const LEG_HEIGHT = PLAYER_SIZE * 0.4;

/**
 * Animated character with head, body, arms, and running legs.
 * Rotates based on direction and animates a running cycle while playing.
 */
export default function Player({ theme, direction = 'right', isPlaying = false, isJumping = false }) {
  const legAnim = useRef(new Animated.Value(0)).current;
  const armAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const jumpAnim = useRef(new Animated.Value(0)).current;

  // Running animation loop
  useEffect(() => {
    if (isPlaying) {
      const runCycle = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(legAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
            Animated.timing(legAnim, { toValue: -1, duration: 180, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(armAnim, { toValue: -1, duration: 180, useNativeDriver: true }),
            Animated.timing(armAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(bounceAnim, { toValue: -2, duration: 180, useNativeDriver: true }),
            Animated.timing(bounceAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
          ]),
        ])
      );
      runCycle.start();
      return () => runCycle.stop();
    } else {
      legAnim.setValue(0);
      armAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [isPlaying]);

  // Jump animation
  useEffect(() => {
    if (isJumping) {
      Animated.sequence([
        Animated.timing(jumpAnim, { toValue: -14, duration: 150, useNativeDriver: true }),
        Animated.timing(jumpAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [isJumping]);

  // Keep the character upright regardless of path direction
  const rotation = '0deg';

  const leftLegRotate = legAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-30deg', '30deg'],
  });
  const rightLegRotate = legAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['30deg', '-30deg'],
  });
  const leftArmRotate = armAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-25deg', '25deg'],
  });
  const rightArmRotate = armAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['25deg', '-25deg'],
  });

  return (
    <View style={[styles.wrapper, { transform: [{ rotate: rotation }] }]}>
      <Animated.View style={[styles.character, { transform: [{ translateY: Animated.add(bounceAnim, jumpAnim) }] }]}>
        {/* Shadow */}
        <View style={[styles.shadow, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />

        {/* Legs */}
        <View style={styles.legsContainer}>
          <Animated.View
            style={[
              styles.leg,
              { backgroundColor: theme.player, left: 3, transform: [{ rotate: leftLegRotate }] },
            ]}
          />
          <Animated.View
            style={[
              styles.leg,
              { backgroundColor: theme.player, right: 3, transform: [{ rotate: rightLegRotate }] },
            ]}
          />
        </View>

        {/* Body */}
        <View style={[styles.body, { backgroundColor: theme.player }]}>
          {/* Body highlight */}
          <View style={styles.bodyHighlight} />
        </View>

        {/* Arms */}
        <Animated.View
          style={[
            styles.arm,
            styles.leftArm,
            { backgroundColor: theme.player, transform: [{ rotate: leftArmRotate }] },
          ]}
        />
        <Animated.View
          style={[
            styles.arm,
            styles.rightArm,
            { backgroundColor: theme.player, transform: [{ rotate: rightArmRotate }] },
          ]}
        />

        {/* Head */}
        <View style={[styles.head, { backgroundColor: '#FFD4A8' }]}>
          {/* Eyes */}
          <View style={styles.eyeRow}>
            <View style={styles.eye} />
            <View style={styles.eye} />
          </View>
          {/* Hair/cap */}
          <View style={[styles.cap, { backgroundColor: theme.player }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CHARACTER_BOX,
    height: CHARACTER_BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  character: {
    alignItems: 'center',
  },
  shadow: {
    position: 'absolute',
    bottom: -4,
    width: PLAYER_SIZE * 0.7,
    height: 6,
    borderRadius: 3,
    opacity: 0.5,
  },
  head: {
    width: HEAD_SIZE,
    height: HEAD_SIZE,
    borderRadius: HEAD_SIZE / 2,
    position: 'absolute',
    top: 0,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cap: {
    position: 'absolute',
    top: -1,
    width: HEAD_SIZE + 4,
    height: HEAD_SIZE * 0.45,
    borderTopLeftRadius: HEAD_SIZE / 2,
    borderTopRightRadius: HEAD_SIZE / 2,
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  eye: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#333',
  },
  body: {
    width: PLAYER_SIZE * 0.55,
    height: BODY_HEIGHT * 0.5,
    borderRadius: 6,
    marginTop: HEAD_SIZE * 0.75,
    zIndex: 2,
    overflow: 'hidden',
  },
  bodyHighlight: {
    position: 'absolute',
    left: 2,
    top: 2,
    width: '40%',
    height: '80%',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  legsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    width: PLAYER_SIZE * 0.55,
    height: LEG_HEIGHT,
    zIndex: 1,
  },
  leg: {
    position: 'absolute',
    width: 5,
    height: LEG_HEIGHT,
    borderRadius: 2.5,
    bottom: 0,
    transformOrigin: 'top',
  },
  arm: {
    position: 'absolute',
    width: 4,
    height: BODY_HEIGHT * 0.35,
    borderRadius: 2,
    zIndex: 1,
    transformOrigin: 'top',
  },
  leftArm: {
    left: -2,
    top: HEAD_SIZE * 0.75 + 2,
  },
  rightArm: {
    right: -2,
    top: HEAD_SIZE * 0.75 + 2,
  },
});
