import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Vec2 } from '@/types/game';
import Colors from '@/constants/colors';
import { GAME_CONFIG } from '@/constants/game';

interface Props {
  rocketX: number;
  rocketY: number;
  dragStart: Vec2 | null;
  dragCurrent: Vec2 | null;
  cameraY: number;
}

export default function SlingLine({ rocketX, rocketY, dragStart, dragCurrent, cameraY }: Props) {
  if (!dragStart || !dragCurrent) return null;

  const screenRocketY = rocketY + cameraY;

  const dx = dragCurrent.x - dragStart.x;
  const dy = dragCurrent.y - dragStart.y;
  const mag = Math.sqrt(dx * dx + dy * dy);
  const clamped = Math.min(mag, GAME_CONFIG.SLING_MAX_DISTANCE);
  const ratio = clamped / GAME_CONFIG.SLING_MAX_DISTANCE;

  const endX = dragStart.x + (dx / Math.max(mag, 1)) * clamped;
  const endY = dragStart.y + (dy / Math.max(mag, 1)) * clamped;

  const lineLength = Math.sqrt(
    (endX - rocketX) ** 2 + (endY - screenRocketY) ** 2
  );
  const angle = Math.atan2(endY - screenRocketY, endX - rocketX) * (180 / Math.PI);

  const midX = (rocketX + endX) / 2;
  const midY = (screenRocketY + endY) / 2;

  const powerColor = ratio < 0.4
    ? Colors.primaryLight
    : ratio < 0.75
    ? Colors.accent
    : Colors.danger;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Sling line */}
      <View
        style={[
          styles.line,
          {
            left: rocketX,
            top: screenRocketY,
            width: lineLength,
            backgroundColor: powerColor,
            opacity: 0.6,
            transform: [{ rotate: `${angle}deg` }],
          },
        ]}
      />

      {/* Drag handle */}
      <View
        style={[
          styles.handle,
          {
            left: endX - 8,
            top: endY - 8,
            borderColor: powerColor,
          },
        ]}
      />

      {/* Power indicator */}
      <View
        style={[
          styles.powerBar,
          {
            left: dragStart.x - 20,
            top: dragStart.y + 20,
            width: 40 * ratio,
            backgroundColor: powerColor,
          },
        ]}
      />
      <View
        style={[
          styles.powerBarBg,
          {
            left: dragStart.x - 20,
            top: dragStart.y + 20,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
    borderRadius: 1,
  },
  handle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  powerBarBg: {
    position: 'absolute',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  powerBar: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    zIndex: 1,
  },
});
