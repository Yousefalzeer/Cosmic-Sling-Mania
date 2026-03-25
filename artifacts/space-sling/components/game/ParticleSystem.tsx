import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Particle } from '@/types/game';

interface Props {
  particles: Particle[];
  cameraY: number;
}

export default function ParticleSystem({ particles, cameraY }: Props) {
  if (particles.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(particle => {
        const life = particle.life / particle.maxLife;
        const size = particle.size * (0.4 + life * 0.6);
        return (
          <View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x - size / 2,
                top: particle.y + cameraY - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: particle.color,
                opacity: life * 0.9,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});
