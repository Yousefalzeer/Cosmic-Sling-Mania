import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Obstacle } from '@/types/game';
import Colors from '@/constants/colors';

const ND = Platform.OS !== 'web';

interface Props {
  obstacle: Obstacle;
  cameraY: number;
  rotation: number;
}

function AsteroidShape({ size, rotation }: { size: number; rotation: number }) {
  // Irregular polygon effect using overlapping rects
  return (
    <View style={[styles.asteroidContainer, { width: size, height: size, transform: [{ rotate: `${rotation}deg` }] }]}>
      <View style={[styles.asteroidBody, {
        width: size,
        height: size * 0.85,
        borderRadius: size * 0.3,
        backgroundColor: '#5D4037',
      }]} />
      <View style={[styles.asteroidChunk, {
        width: size * 0.7,
        height: size * 0.7,
        borderRadius: size * 0.22,
        backgroundColor: '#6D4C41',
        top: size * 0.1,
        left: size * 0.15,
      }]} />
      {/* Crater details */}
      <View style={[styles.crater, { width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11, top: size * 0.18, left: size * 0.22 }]} />
      <View style={[styles.crater, { width: size * 0.14, height: size * 0.14, borderRadius: size * 0.07, top: size * 0.42, left: size * 0.5 }]} />
      {/* Highlight */}
      <View style={[styles.asteroidHighlight, { width: size * 0.2, height: size * 0.1, borderRadius: size * 0.05, top: size * 0.12, left: size * 0.55 }]} />
    </View>
  );
}

function BlackHoleShape({ size }: { size: number }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: ND }),
        Animated.timing(pulseAnim, { toValue: 0.92, duration: 700, useNativeDriver: ND }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(rotAnim, { toValue: 1, duration: 2200, useNativeDriver: ND })
    ).start();
  }, []);

  return (
    <View style={[styles.blackHoleContainer, { width: size * 2.4, height: size * 2.4 }]}>
      {/* Outer glow rings */}
      <Animated.View style={[styles.ring, {
        width: size * 2.2,
        height: size * 2.2,
        borderRadius: size * 1.1,
        borderColor: 'rgba(120,0,180,0.25)',
        borderWidth: 3,
        transform: [{ scale: pulseAnim }],
      }]} />
      <View style={[styles.ring, {
        width: size * 1.7,
        height: size * 1.7,
        borderRadius: size * 0.85,
        borderColor: 'rgba(160,0,220,0.4)',
        borderWidth: 4,
        top: (size * 2.4 - size * 1.7) / 2,
        left: (size * 2.4 - size * 1.7) / 2,
      }]} />
      {/* Accretion disk */}
      <View style={[styles.accretionDisk, {
        width: size * 1.4,
        height: size * 0.4,
        borderRadius: size * 0.2,
        backgroundColor: 'rgba(200,80,255,0.35)',
        top: size * 1,
        left: (size * 2.4 - size * 1.4) / 2,
      }]} />
      {/* Core */}
      <View style={[styles.blackHoleCore, {
        width: size,
        height: size,
        borderRadius: size / 2,
        top: (size * 2.4 - size) / 2,
        left: (size * 2.4 - size) / 2,
      }]} />
      {/* Inner glow */}
      <View style={[styles.coreGlow, {
        width: size * 0.55,
        height: size * 0.55,
        borderRadius: size * 0.275,
        top: (size * 2.4 - size * 0.55) / 2,
        left: (size * 2.4 - size * 0.55) / 2,
      }]} />
    </View>
  );
}

export default function ObstacleView({ obstacle, cameraY, rotation }: Props) {
  const warningAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(warningAnim, { toValue: 0.5, duration: 500, useNativeDriver: ND }),
        Animated.timing(warningAnim, { toValue: 1, duration: 500, useNativeDriver: ND }),
      ])
    ).start();
  }, []);

  const screenX = obstacle.x;
  const screenY = obstacle.y + cameraY;
  const size = obstacle.radius * 2;

  // Don't render if far off screen
  if (screenY < -size * 3 || screenY > 1000 + size) return null;

  const halfSize = obstacle.type === 'blackhole' ? obstacle.radius * 2.4 : size;

  return (
    <View
      style={[
        styles.container,
        {
          left: screenX - halfSize / 2,
          top: screenY - halfSize / 2,
        },
      ]}
      pointerEvents="none"
    >
      {obstacle.type === 'asteroid' ? (
        <AsteroidShape size={size} rotation={rotation} />
      ) : (
        <BlackHoleShape size={obstacle.radius} />
      )}

      {/* Danger glow */}
      {obstacle.type === 'asteroid' && (
        <Animated.View
          style={[
            styles.dangerGlow,
            {
              width: size * 1.8,
              height: size * 1.8,
              borderRadius: size * 0.9,
              top: -size * 0.4,
              left: -size * 0.4,
              opacity: warningAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.05, 0.15] }),
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  asteroidContainer: {
    position: 'relative',
  },
  asteroidBody: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  asteroidChunk: {
    position: 'absolute',
  },
  crater: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  asteroidHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  blackHoleContainer: {
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'transparent',
  },
  accretionDisk: {
    position: 'absolute',
  },
  blackHoleCore: {
    position: 'absolute',
    backgroundColor: '#0A0008',
  },
  coreGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(120,0,200,0.3)',
  },
  dangerGlow: {
    position: 'absolute',
    backgroundColor: Colors.danger,
  },
});
