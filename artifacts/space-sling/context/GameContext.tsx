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
  const flameScaleAnim = useRef(new Animated.Value(1)).current;
  const flameOpacityAnim = useRef(new Animated.Value(1)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const burnoutWobble = useRef(new Animated.Value(0)).current;

  // Normal flight flame flicker
  useEffect(() => {
    if (!rocket.attached && !isBroken && !rocket.burnoutMode) {
      flameOpacityAnim.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameScaleAnim, { toValue: 0.5, duration: 75, useNativeDriver: ND }),
          Animated.timing(flameScaleAnim, { toValue: 1, duration: 75, useNativeDriver: ND }),
        ])
      ).start();
    } else if (rocket.burnoutMode) {
      // Flame sputters and fades when burning out
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameScaleAnim, { toValue: 0.2, duration: 150, useNativeDriver: ND }),
          Animated.timing(flameScaleAnim, { toValue: 0.6, duration: 200, useNativeDriver: ND }),
          Animated.timing(flameScaleAnim, { toValue: 0.1, duration: 180, useNativeDriver: ND }),
        ])
      ).start();
      // Fade out the flame opacity as burnout progresses
      Animated.timing(flameOpacityAnim, {
        toValue: 0,
        duration: GAME_CONFIG_BURNOUT_MS,
        useNativeDriver: ND,
      }).start();
    } else {
      flameScaleAnim.stopAnimation();
      flameScaleAnim.setValue(0);
    }
    return () => { flameScaleAnim.stopAnimation(); };
  }, [rocket.attached, isBroken, rocket.burnoutMode]);

  // Broken tumble animation
  useEffect(() => {
    if (isBroken) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleAnim, { toValue: 3, duration: 600, useNativeDriver: ND }),
          Animated.timing(wobbleAnim, { toValue: -3, duration: 600, useNativeDriver: ND }),
        ])
      ).start();
    } else {
      wobbleAnim.stopAnimation();
    }
    return () => { wobbleAnim.stopAnimation(); };
  }, [isBroken]);

  // Burnout tumble animation (rockets spins during freefall)
  useEffect(() => {
    if (rocket.burnoutMode) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(burnoutWobble, { toValue: 12, duration: 300, useNativeDriver: ND }),
          Animated.timing(burnoutWobble, { toValue: -12, duration: 300, useNativeDriver: ND }),
        ])
      ).start();
    } else {
      burnoutWobble.stopAnimation();
      burnoutWobble.setValue(0);
    }
    return () => { burnoutWobble.stopAnimation(); };
  }, [rocket.burnoutMode]);

  const screenX = rocket.x;
  const screenY = rocket.y + cameraY;

  const rotation = isBroken
    ? wobbleAnim.interpolate({ inputRange: [-3, 3], outputRange: ['-30deg', '30deg'] })
    : rocket.burnoutMode
    ? burnoutWobble.interpolate({ inputRange: [-12, 12], outputRange: [`${rocket.angle - 12}deg`, `${rocket.angle + 12}deg`] })
    : `${rocket.angle}deg`;

  const isFlying = !rocket.attached && !isBroken;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: screenX - 14,
          top: screenY - 24,
          transform: [{ rotate: rotation as any }],
          opacity: isBroken ? 0.55 : 1,
        },
      ]}
      pointerEvents="none"
    >
      {/* Flame — visible when flying (normal or burnout) */}
      {isFlying && (
        <Animated.View
          style={[
            styles.flameContainer,
            {
              opacity: rocket.burnoutMode
                ? flameOpacityAnim
                : flameScaleAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.6, 1] }),
            },
          ]}
        >
          <Animated.View style={[
            styles.flameOuter,
            { transform: [{ scaleY: flameScaleAnim }] },
            rocket.burnoutMode && styles.flameBurnout,
          ]} />
          <Animated.View style={[
            styles.flameInner,
            { transform: [{ scaleY: flameScaleAnim }] },
          ]} />
        </Animated.View>
      )}

      {/* Rocket body */}
      <View style={styles.body}>
        <View style={styles.nose} />
        <View style={styles.window} />
        <View style={[styles.tube, rocket.burnoutMode && styles.tubeBurnout]} />
        <View style={styles.finLeft} />
        <View style={styles.finRight} />

        {(isBroken || rocket.burnoutMode) && (
          <>
            <View style={[styles.breakLine, { top: 10, left: 5 }]} />
            <View style={[styles.breakLine, { top: 14, left: 12 }]} />
          </>
        )}
      </View>

      {isDragging && <View style={styles.dragIndicator} />}
    </Animated.View>
  );
}

// The burnout duration for flame fade (in ms) — matches GAME_CONFIG.BURNOUT_FALL_TIMEOUT
const GAME_CONFIG_BURNOUT_MS = 2200;

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
    opacity: 0.85,
  },
  flameBurnout: {
    backgroundColor: '#888',
    opacity: 0.5,
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
    width: 0, height: 0,
    borderLeftWidth: 9, borderRightWidth: 9, borderBottomWidth: 16,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#A78BFA',
    position: 'absolute', top: 0,
  },
  window: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: Colors.secondaryLight,
    position: 'absolute', top: 18,
    borderWidth: 1.5, borderColor: Colors.white,
  },
  tube: {
    width: 18, height: 20,
    backgroundColor: Colors.rocketBody,
    borderRadius: 3,
    position: 'absolute', top: 14,
  },
  tubeBurnout: {
    backgroundColor: '#9E9E9E',
  },
  finLeft: {
    width: 0, height: 0,
    borderTopWidth: 0, borderBottomWidth: 12, borderRightWidth: 8,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderRightColor: '#7C3AED',
    position: 'absolute', bottom: 4, left: 1,
  },
  finRight: {
    width: 0, height: 0,
    borderTopWidth: 0, borderBottomWidth: 12, borderLeftWidth: 8,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderLeftColor: '#7C3AED',
    position: 'absolute', bottom: 4, right: 1,
  },
  breakLine: {
    position: 'absolute',
    width: 12, height: 2,
    backgroundColor: Colors.danger,
    borderRadius: 1,
  },
  dragIndicator: {
    position: 'absolute', bottom: -6,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.primaryLight, opacity: 0.8,
  },
});
