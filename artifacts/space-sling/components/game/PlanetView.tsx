import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Planet } from '@/types/game';

const ND = Platform.OS !== 'web';

interface Props {
  planet: Planet;
  cameraY: number;
  isLanded?: boolean;
}

export default function PlanetView({ planet, cameraY, isLanded }: Props) {
  const glowAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.15, duration: 1800, useNativeDriver: ND }),
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: ND }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isLanded) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 120, useNativeDriver: ND }),
        Animated.timing(pulseAnim, { toValue: 0.95, duration: 120, useNativeDriver: ND }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 120, useNativeDriver: ND }),
      ]).start();
    }
  }, [isLanded]);

  const screenX = planet.x - planet.radius;
  const screenY = planet.y + cameraY - planet.radius;
  const size = planet.radius * 2;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: screenX,
          top: screenY,
          width: size,
          height: size,
          transform: [{ scale: pulseAnim }],
        },
      ]}
      pointerEvents="none"
    >
      {/* Glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size * 0.75,
            backgroundColor: planet.color,
            left: -size * 0.25,
            top: -size * 0.25,
            transform: [{ scale: glowAnim }],
          },
        ]}
      />

      {/* Planet body */}
      <View
        style={[
          styles.planet,
          {
            width: size,
            height: size,
            borderRadius: planet.radius,
            backgroundColor: planet.color,
          },
        ]}
      >
        {/* Shading overlay */}
        <View
          style={[
            styles.shade,
            {
              width: size * 0.55,
              height: size * 0.55,
              borderRadius: size * 0.28,
              top: size * 0.08,
              left: size * 0.08,
            },
          ]}
        />
        {/* Highlight */}
        <View
          style={[
            styles.highlight,
            {
              width: size * 0.25,
              height: size * 0.12,
              borderRadius: size * 0.06,
              top: size * 0.15,
              left: size * 0.2,
            },
          ]}
        />
      </View>

      {/* Ring */}
      {planet.hasRing && (
        <View
          style={[
            styles.ring,
            {
              width: size * 1.65,
              height: size * 0.36,
              borderRadius: size * 0.9,
              borderColor: planet.ringColor || 'rgba(255,255,255,0.3)',
              left: -size * 0.325,
              top: size * 0.32,
            },
          ]}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
    opacity: 0.12,
  },
  planet: {
    position: 'absolute',
    overflow: 'hidden',
  },
  shade: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.18)',
    transform: [{ rotate: '-20deg' }],
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  ring: {
    position: 'absolute',
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
});
