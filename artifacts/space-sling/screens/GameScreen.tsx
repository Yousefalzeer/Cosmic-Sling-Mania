import React, { useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/context/GameContext';
import StarField from '@/components/game/StarField';
import PlanetView from '@/components/game/PlanetView';
import RocketView from '@/components/game/RocketView';
import TrajectoryPreview from '@/components/game/TrajectoryPreview';
import ParticleSystem from '@/components/game/ParticleSystem';
import SlingLine from '@/components/game/SlingLine';
import ScoreHUD from '@/components/game/ScoreHUD';
import ObstacleView from '@/components/game/ObstacleView';
import Colors from '@/constants/colors';
import { GAME_CONFIG } from '@/constants/game';

const { width: SW, height: SH } = Dimensions.get('window');

// Background nebula blobs for depth (static decorative elements)
const NEBULAE = [
  { x: -60,  y: 120,  w: 260, h: 160, color: 'rgba(124,58,237,0.06)' },
  { x: SW - 140, y: 380, w: 220, h: 140, color: 'rgba(6,182,212,0.05)' },
  { x: 20,   y: 620,  w: 200, h: 130, color: 'rgba(236,72,153,0.04)' },
];

export default function GameScreen() {
  const { state, onDragStart, onDragMove, onDragEnd } = useGame();
  const insets = useSafeAreaInsets();

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => state.rocket.attached && state.screen === 'game',
    onMoveShouldSetPanResponder: () => state.isDragging,
    onPanResponderGrant: (evt) => {
      const { pageX, pageY } = evt.nativeEvent;
      onDragStart({ x: pageX, y: pageY });
    },
    onPanResponderMove: (evt) => {
      const { pageX, pageY } = evt.nativeEvent;
      onDragMove({ x: pageX, y: pageY });
    },
    onPanResponderRelease: () => onDragEnd(),
    onPanResponderTerminate: () => onDragEnd(),
  });

  // Camera shake offset
  const shakeX = state.cameraShake > 0 ? (Math.random() - 0.5) * state.cameraShake : 0;
  const shakeY = state.cameraShake > 0 ? (Math.random() - 0.5) * state.cameraShake : 0;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Deep space gradient background */}
      <LinearGradient
        colors={[Colors.backgroundDeep, Colors.background, '#0D0022', Colors.backgroundDeep]}
        style={[StyleSheet.absoluteFill, { transform: [{ translateX: shakeX }, { translateY: shakeY }] }]}
      />

      {/* Nebula blobs — parallax layer 0 (very slow) */}
      {NEBULAE.map((n, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[
            styles.nebula,
            {
              left: n.x,
              top: n.y + state.cameraY * 0.03,
              width: n.w,
              height: n.h,
              backgroundColor: n.color,
              borderRadius: n.h * 0.5,
              transform: [{ translateX: shakeX * 0.3 }, { translateY: shakeY * 0.3 }],
            },
          ]}
        />
      ))}

      {/* Stars — parallax per layer (see StarField) */}
      <StarField stars={state.stars} cameraY={state.cameraY} />

      {/* Obstacles */}
      {state.obstacles.map(obs => (
        <ObstacleView
          key={obs.id}
          obstacle={obs}
          cameraY={state.cameraY + shakeY}
          rotation={state.obstacleRotations[obs.id] ?? obs.rotation}
        />
      ))}

      {/* Planets */}
      {state.planets.map(planet => {
        const effectiveX = planet.isMoving
          ? planet.x + Math.sin((state.movingPlanetOffsets[planet.id] ?? 0) + planet.moveOffset) * planet.moveRange
          : planet.x;
        return (
          <PlanetView
            key={planet.id}
            planet={planet}
            cameraY={state.cameraY + shakeY}
            isLanded={planet.id === state.lastLandedPlanetId}
            effectiveX={effectiveX}
          />
        );
      })}

      {/* Trajectory preview when dragging */}
      {state.isDragging && (
        <TrajectoryPreview points={state.trajectoryPoints} cameraY={state.cameraY} />
      )}

      {/* Sling rubber band */}
      {state.isDragging && (
        <SlingLine
          rocketX={state.rocket.x}
          rocketY={state.rocket.y}
          dragStart={state.dragStart}
          dragCurrent={state.dragCurrent}
          cameraY={state.cameraY}
        />
      )}

      {/* Rocket */}
      <RocketView
        rocket={state.rocket}
        cameraY={state.cameraY + shakeY}
        isDragging={state.isDragging}
      />

      {/* Particles */}
      <ParticleSystem particles={state.particles} cameraY={state.cameraY} />

      {/* HUD */}
      <ScoreHUD score={state.score} highScore={state.highScore} />

      {/* Aim hint on first launch */}
      {state.rocket.attached && state.score === 0 && !state.isDragging && (
        <View style={[styles.aimHint, { bottom: insets.bottom + 60 }]}>
          <Text style={styles.aimHintText}>Drag back to aim</Text>
          <View style={styles.aimHintArrow} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDeep,
    overflow: 'hidden',
  },
  nebula: {
    position: 'absolute',
  },
  aimHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  aimHintText: {
    color: 'rgba(167,139,250,0.55)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  aimHintArrow: {
    width: 2,
    height: 24,
    backgroundColor: 'rgba(167,139,250,0.35)',
    borderRadius: 1,
  },
});
