import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Star } from '@/types/game';
import Colors from '@/constants/colors';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

// Parallax multipliers per layer: far stars move slowest, near stars move most
const PARALLAX_FACTORS = [0.05, 0.15, 0.3] as const;

interface Props {
  stars: Star[];
  cameraY: number;
}

export default function StarField({ stars, cameraY }: Props) {
  const twinkleAnims = useRef(
    stars.map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    const animations = twinkleAnims.map((anim, i) => {
      const star = stars[i];
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.2 + Math.random() * 0.5,
            duration: (1000 / star.twinkleSpeed) * (0.6 + Math.random() * 0.8),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(anim, {
            toValue: star.opacity,
            duration: (1000 / star.twinkleSpeed) * (0.6 + Math.random() * 0.8),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      );
    });
    Animated.parallel(animations).start();
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((star, i) => {
        // Parallax: each layer scrolls at different speed relative to camera
        const parallaxY = star.y + cameraY * PARALLAX_FACTORS[star.layer];
        return (
          <Animated.View
            key={i}
            style={[
              styles.star,
              {
                left: star.x,
                top: parallaxY,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity: twinkleAnims[i],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: Colors.star,
  },
});
