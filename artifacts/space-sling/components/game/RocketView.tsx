import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Rocket } from '@/types/game';
import Colors from '@/constants/colors';

const ND = Platform.OS !== 'web';

interface Props {
  rocket: Rocket;
  cameraY: number;
  isDragging: boolean;
  isBroken?: boolean;
}

export default function RocketView({ rocket, cameraY, isDragging, isBroken }: Props) {
  const flameAnim = useRef(new Animated.Value(1)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!rocket.attached && !isBroken) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, { toValue: 0.5, duration: 80, useNativeDriver: ND }),
          Animated.timing(flameAnim, { toValue: 1, duration: 80, useNativeDriver: ND }),
        ])
      ).start();
    } else {
      flameAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleAnim, { toValue: 3, duration: 600, useNativeDriver: ND }),
          Animated.timing(wobbleAnim, { toValue: -3, duration: 600, useNativeDriver: ND }),
        ])
      ).start();
    }
    return () => {
      flameAnim.stopAnimation();
      wobbleAnim.stopAnimation();
    };
  }, [rocket.attached, isBroken]);

  const screenX = rocket.x;
  const screenY = rocket.y + cameraY;

  const rotation = isBroken
    ? wobbleAnim.interpolate({ inputRange: [-3, 3], outputRange: ['-30deg', '30deg'] })
    : `${rocket.angle}deg`;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: screenX - 14,
          top: screenY - 24,
          transform: [{ rotate: rotation as any }],
          opacity: isBroken ? 0.6 : 1,
        },
      ]}
      pointerEvents="none"
    >
      {/* Flame */}
      {!rocket.attached && !isBroken && (
        <Animated.View style={[styles.flameContainer, { opacity: flameAnim }]}>
          <View style={styles.flameOuter} />
          <View style={styles.flameInner} />
        </Animated.View>
      )}

      {/* Rocket body */}
      <View style={styles.body}>
        {/* Nose cone */}
        <View style={styles.nose} />
        {/* Windows */}
        <View style={styles.window} />
        {/* Body tube */}
        <View style={styles.tube} />
        {/* Fins */}
        <View style={styles.finLeft} />
        <View style={styles.finRight} />

        {isBroken && (
          <>
            <View style={[styles.breakLine, { top: 10, left: 5, rotate: '40deg' }]} />
            <View style={[styles.breakLine, { top: 14, left: 12, rotate: '-30deg' }]} />
          </>
        )}
      </View>

      {/* Drag indicator */}
      {isDragging && (
        <View style={styles.dragIndicator} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 28,
    height: 48,
    alignItems: 'center',
  },
  flameContainer: {
    position: 'absolute',
    bottom: -12,
    alignItems: 'center',
  },
  flameOuter: {
    width: 12,
    height: 18,
    backgroundColor: Colors.rocketFlame,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    opacity: 0.8,
  },
  flameInner: {
    position: 'absolute',
    bottom: 0,
    width: 6,
    height: 10,
    backgroundColor: '#FFF8E1',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  body: {
    width: 28,
    height: 48,
    alignItems: 'center',
    position: 'relative',
  },
  nose: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#A78BFA',
    position: 'absolute',
    top: 0,
  },
  window: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.secondaryLight,
    position: 'absolute',
    top: 18,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  tube: {
    width: 18,
    height: 20,
    backgroundColor: Colors.rocketBody,
    borderRadius: 3,
    position: 'absolute',
    top: 14,
  },
  finLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 0,
    borderBottomWidth: 12,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#7C3AED',
    position: 'absolute',
    bottom: 4,
    left: 1,
  },
  finRight: {
    width: 0,
    height: 0,
    borderTopWidth: 0,
    borderBottomWidth: 12,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#7C3AED',
    position: 'absolute',
    bottom: 4,
    right: 1,
  },
  breakLine: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: Colors.danger,
    borderRadius: 1,
  },
  dragIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryLight,
    opacity: 0.8,
  },
});
