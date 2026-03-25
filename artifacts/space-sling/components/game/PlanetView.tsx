import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Planet, PlanetStyle } from '@/types/game';

const ND = Platform.OS !== 'web';

interface Props {
  planet: Planet;
  cameraY: number;
  isLanded?: boolean;
  effectiveX?: number; // for moving planets
}

// Style-specific surface decorations inside the planet body
function PlanetSurface({ style, size }: { style: PlanetStyle; size: number }) {
  switch (style) {
    case 'lava':
      return (
        <>
          <View style={[styles.lavaGlow, { width: size * 0.6, height: size * 0.3, borderRadius: size * 0.15, top: size * 0.55, left: size * 0.2 }]} />
          <View style={[styles.lavaCrack, { width: size * 0.04, height: size * 0.5, top: size * 0.2, left: size * 0.35 }]} />
          <View style={[styles.lavaCrack, { width: size * 0.04, height: size * 0.35, top: size * 0.3, left: size * 0.55, transform: [{ rotate: '30deg' }] }]} />
        </>
      );
    case 'ice':
      return (
        <>
          <View style={[styles.iceSheen, { width: size * 0.55, height: size * 0.35, borderRadius: size * 0.18, top: size * 0.1, left: size * 0.3 }]} />
          <View style={[styles.iceCrystal, { width: size * 0.12, height: size * 0.12, borderRadius: size * 0.03, top: size * 0.42, left: size * 0.22 }]} />
          <View style={[styles.iceCrystal, { width: size * 0.08, height: size * 0.08, borderRadius: size * 0.02, top: size * 0.55, left: size * 0.5 }]} />
        </>
      );
    case 'ocean':
      return (
        <>
          <View style={[styles.oceanLand, { width: size * 0.35, height: size * 0.28, borderRadius: size * 0.1, top: size * 0.28, left: size * 0.38 }]} />
          <View style={[styles.oceanLand, { width: size * 0.2, height: size * 0.16, borderRadius: size * 0.08, top: size * 0.12, left: size * 0.18 }]} />
        </>
      );
    case 'gas':
      return (
        <>
          <View style={[styles.gasBand, { width: size, height: size * 0.14, top: size * 0.28, opacity: 0.35 }]} />
          <View style={[styles.gasBand, { width: size, height: size * 0.1, top: size * 0.48, opacity: 0.25 }]} />
          <View style={[styles.gasBand, { width: size, height: size * 0.08, top: size * 0.64, opacity: 0.2 }]} />
        </>
      );
    case 'crater':
      return (
        <>
          <View style={[styles.crater, { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14, top: size * 0.18, left: size * 0.42 }]} />
          <View style={[styles.crater, { width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09, top: size * 0.52, left: size * 0.2 }]} />
          <View style={[styles.crater, { width: size * 0.12, height: size * 0.12, borderRadius: size * 0.06, top: size * 0.55, left: size * 0.58 }]} />
        </>
      );
    case 'jungle':
      return (
        <>
          <View style={[styles.jungleSpot, { width: size * 0.3, height: size * 0.28, borderRadius: size * 0.14, top: size * 0.32, left: size * 0.15 }]} />
          <View style={[styles.jungleSpot, { width: size * 0.22, height: size * 0.2, borderRadius: size * 0.1, top: size * 0.18, left: size * 0.5 }]} />
        </>
      );
    case 'toxic':
      return (
        <>
          <View style={[styles.toxicBubble, { width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11, top: size * 0.25, left: size * 0.35 }]} />
          <View style={[styles.toxicBubble, { width: size * 0.14, height: size * 0.14, borderRadius: size * 0.07, top: size * 0.52, left: size * 0.2 }]} />
          <View style={[styles.toxicBubble, { width: size * 0.1, height: size * 0.1, borderRadius: size * 0.05, top: size * 0.48, left: size * 0.6 }]} />
        </>
      );
    case 'ringed':
    default:
      return (
        <>
          <View style={[styles.gasBand, { width: size, height: size * 0.12, top: size * 0.3, opacity: 0.3 }]} />
          <View style={[styles.gasBand, { width: size, height: size * 0.08, top: size * 0.5, opacity: 0.2 }]} />
        </>
      );
  }
}

function getGlowColor(style: PlanetStyle, color: string): string {
  switch (style) {
    case 'lava':   return 'rgba(220,60,0,0.28)';
    case 'ice':    return 'rgba(140,220,255,0.22)';
    case 'ocean':  return 'rgba(20,100,200,0.25)';
    case 'gas':    return 'rgba(130,50,200,0.22)';
    case 'jungle': return 'rgba(20,160,60,0.22)';
    case 'toxic':  return 'rgba(160,220,30,0.22)';
    case 'ringed': return 'rgba(210,180,0,0.22)';
    case 'crater': return 'rgba(160,130,0,0.18)';
    default:       return `${color}44`;
  }
}

export default function PlanetView({ planet, cameraY, isLanded, effectiveX }: Props) {
  const glowAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.18)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowAnim, { toValue: 1.18, duration: 2000, useNativeDriver: ND }),
          Animated.timing(glowOpacity, { toValue: 0.28, duration: 2000, useNativeDriver: ND }),
        ]),
        Animated.parallel([
          Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: ND }),
          Animated.timing(glowOpacity, { toValue: 0.18, duration: 2000, useNativeDriver: ND }),
        ]),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isLanded) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 100, useNativeDriver: ND }),
        Animated.timing(pulseAnim, { toValue: 0.93, duration: 100, useNativeDriver: ND }),
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 80, useNativeDriver: ND }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 80, useNativeDriver: ND }),
      ]).start();
    }
  }, [isLanded]);

  const displayX = effectiveX ?? planet.x;
  const screenX = displayX - planet.radius;
  const screenY = planet.y + cameraY - planet.radius;
  const size = planet.radius * 2;
  const glowColor = getGlowColor(planet.style, planet.color);

  // Don't render planets far off screen (performance)
  if (screenY > 1000 + size || screenY < -size * 3) return null;

  return (
    <Animated.View
      style={[styles.container, { left: screenX, top: screenY, width: size, height: size, transform: [{ scale: pulseAnim }] }]}
      pointerEvents="none"
    >
      {/* Outer atmosphere glow */}
      <Animated.View
        style={[styles.glow, {
          width: size * 1.6,
          height: size * 1.6,
          borderRadius: size * 0.8,
          backgroundColor: glowColor,
          left: -size * 0.3,
          top: -size * 0.3,
          transform: [{ scale: glowAnim }],
          opacity: glowOpacity,
        }]}
      />

      {/* Secondary softer glow */}
      <View style={[styles.glow, {
        width: size * 1.25,
        height: size * 1.25,
        borderRadius: size * 0.625,
        backgroundColor: glowColor,
        left: -size * 0.125,
        top: -size * 0.125,
        opacity: 0.15,
      }]} />

      {/* Planet body */}
      <View style={[styles.planet, { width: size, height: size, borderRadius: planet.radius, backgroundColor: planet.color }]}>
        {/* Dark shadow overlay (bottom-right) */}
        <View style={[styles.shadow, { width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35, bottom: -size * 0.1, right: -size * 0.1 }]} />

        {/* Style-specific surface details */}
        <PlanetSurface style={planet.style} size={size} />

        {/* Primary highlight (top-left shine) */}
        <View style={[styles.highlight, { width: size * 0.28, height: size * 0.14, borderRadius: size * 0.07, top: size * 0.14, left: size * 0.18 }]} />
        {/* Secondary smaller highlight */}
        <View style={[styles.highlightSmall, { width: size * 0.12, height: size * 0.06, borderRadius: size * 0.03, top: size * 0.1, left: size * 0.5 }]} />
      </View>

      {/* Moving planet indicator */}
      {planet.isMoving && (
        <View style={[styles.movingIndicator, { borderRadius: size * 0.12, bottom: -size * 0.22, left: size * 0.3, width: size * 0.4, height: 3 }]} />
      )}

      {/* Ring (behind planet visually is hard without zIndex tricks, so we approximate) */}
      {planet.hasRing && (
        <View style={[styles.ring, {
          width: size * 1.75,
          height: size * 0.38,
          borderRadius: size * 1.0,
          borderColor: planet.ringColor || 'rgba(255,255,255,0.3)',
          left: -size * 0.375,
          top: size * 0.31,
        }]} />
      )}

      {/* Landed pulse ring */}
      {isLanded && (
        <View style={[styles.landedRing, {
          width: size * 1.25,
          height: size * 1.25,
          borderRadius: size * 0.625,
          left: -size * 0.125,
          top: -size * 0.125,
        }]} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute' },
  glow: { position: 'absolute' },
  planet: { position: 'absolute', overflow: 'hidden' },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  highlightSmall: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  ring: {
    position: 'absolute',
    borderWidth: 4,
    backgroundColor: 'transparent',
  },
  landedRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  movingIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(255,200,50,0.6)',
  },
  // Lava
  lavaGlow: { position: 'absolute', backgroundColor: 'rgba(255,100,0,0.55)' },
  lavaCrack: { position: 'absolute', backgroundColor: 'rgba(255,60,0,0.7)', width: 3 },
  // Ice
  iceSheen: { position: 'absolute', backgroundColor: 'rgba(220,245,255,0.35)' },
  iceCrystal: { position: 'absolute', backgroundColor: 'rgba(180,235,255,0.5)' },
  // Ocean
  oceanLand: { position: 'absolute', backgroundColor: 'rgba(30,160,80,0.7)' },
  // Gas/Ringed
  gasBand: { position: 'absolute', left: 0, backgroundColor: 'rgba(255,255,255,0.15)' },
  // Crater
  crater: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.28)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' },
  // Jungle
  jungleSpot: { position: 'absolute', backgroundColor: 'rgba(10,120,40,0.55)' },
  // Toxic
  toxicBubble: { position: 'absolute', backgroundColor: 'rgba(80,255,50,0.3)', borderWidth: 1, borderColor: 'rgba(120,255,80,0.4)' },
});
