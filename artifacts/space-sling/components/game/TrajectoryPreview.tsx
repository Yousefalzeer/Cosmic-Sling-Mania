import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Vec2 } from '@/types/game';
import Colors from '@/constants/colors';

interface Props {
  points: Vec2[];
  cameraY: number;
}

export default function TrajectoryPreview({ points, cameraY }: Props) {
  if (points.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {points.map((point, i) => {
        const opacity = 1 - (i / points.length) * 0.85;
        const size = Math.max(3, 7 - i * 0.35);
        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                left: point.x - size / 2,
                top: point.y + cameraY - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                opacity: opacity * 0.75,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    backgroundColor: Colors.primaryLight,
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
});
