import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const ND = Platform.OS !== 'web';

interface Props {
  score: number;
  highScore: number;
}

export default function ScoreHUD({ score, highScore }: Props) {
  const insets = useSafeAreaInsets();
  const scoreAnim = useRef(new Animated.Value(1)).current;
  const prevScore = useRef(score);

  useEffect(() => {
    if (score !== prevScore.current) {
      prevScore.current = score;
      Animated.sequence([
        Animated.timing(scoreAnim, { toValue: 1.4, duration: 100, useNativeDriver: ND }),
        Animated.spring(scoreAnim, { toValue: 1, useNativeDriver: ND, friction: 4 }),
      ]).start();
    }
  }, [score]);

  const topPad = insets.top > 0 ? insets.top : (Platform.OS === 'web' ? 67 : 44);

  return (
    <View style={[styles.container, { top: topPad + 8 }]} pointerEvents="none">
      <View style={styles.scoreCard}>
        <Animated.Text style={[styles.score, { transform: [{ scale: scoreAnim }] }]}>
          {score}
        </Animated.Text>
        <Text style={styles.scoreLabel}>SCORE</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.scoreCard}>
        <Text style={styles.bestScore}>{highScore}</Text>
        <Text style={styles.scoreLabel}>BEST</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  scoreCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.uiOverlay,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minWidth: 80,
  },
  score: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  bestScore: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primaryLight,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textDim,
    letterSpacing: 2,
    fontFamily: 'Inter_600SemiBold',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 2,
  },
});
