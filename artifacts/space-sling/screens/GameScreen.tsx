import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  Platform,
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
import Colors from '@/constants/colors';

const { width: SW, height: SH } = Dimensions.get('window');

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
    onPanResponderRelease: () => {
      onDragEnd();
    },
    onPanResponderTerminate: () => {
      onDragEnd();
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <LinearGradient
        colors={[Colors.backgroundDeep, Colors.background, '#100025']}
        style={StyleSheet.absoluteFill}
      />

      {/* Background stars */}
      <StarField stars={state.stars} cameraY={state.cameraY} />

      {/* Planets */}
      {state.planets.map(planet => (
        <PlanetView
          key={planet.id}
          planet={planet}
          cameraY={state.cameraY}
          isLanded={planet.id === state.lastLandedPlanetId}
        />
      ))}

      {/* Trajectory preview when dragging */}
      {state.isDragging && (
        <TrajectoryPreview
          points={state.trajectoryPoints}
          cameraY={state.cameraY}
        />
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
        cameraY={state.cameraY}
        isDragging={state.isDragging}
      />

      {/* Particles */}
      <ParticleSystem particles={state.particles} cameraY={state.cameraY} />

      {/* HUD */}
      <ScoreHUD score={state.score} highScore={state.highScore} />

      {/* Aim hint on first launch */}
      {state.rocket.attached && state.score === 0 && (
        <View style={[styles.aimHint, { bottom: insets.bottom + 40 }]}>
          <View style={styles.aimHintDot} />
          <View style={styles.aimHintText}>
            <View style={styles.aimHintLine} />
          </View>
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
  aimHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.4,
  },
  aimHintDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
    marginBottom: 4,
  },
  aimHintText: {
    alignItems: 'center',
  },
  aimHintLine: {
    width: 60,
    height: 1,
    backgroundColor: Colors.primaryLight,
    opacity: 0.5,
  },
});
