import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import GameButton from '@/components/ui/GameButton';

const ND = Platform.OS !== 'web';

export default function GameOverScreen() {
  const { state, restartGame, goToMenu } = useGame();
  const insets = useSafeAreaInsets();

  const overlayAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const rocketAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const isNewBest = state.score > 0 && state.score >= state.highScore;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: ND }),
      Animated.spring(cardAnim, { toValue: 1, useNativeDriver: ND, friction: 6, tension: 60 }),
    ]).start();

    Animated.timing(rocketAnim, { toValue: 1, duration: 600, useNativeDriver: ND }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 5, duration: 100, useNativeDriver: ND }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 100, useNativeDriver: ND }),
        Animated.timing(shakeAnim, { toValue: 3, duration: 100, useNativeDriver: ND }),
        Animated.timing(shakeAnim, { toValue: -3, duration: 100, useNativeDriver: ND }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 200, useNativeDriver: ND }),
        Animated.delay(1400),
      ])
    ).start();
  }, []);

  const topPad = insets.top > 0 ? insets.top : (Platform.OS === 'web' ? 67 : 44);
  const bottomPad = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'web' ? 34 : 24);

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
      <LinearGradient
        colors={['rgba(10,0,21,0.97)', 'rgba(109,40,217,0.15)', 'rgba(10,0,21,0.97)']}
        style={[styles.gradient, { paddingTop: topPad, paddingBottom: bottomPad }]}
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardAnim,
              transform: [
                { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
              ],
            },
          ]}
        >
          {/* Broken rocket illustration */}
          <Animated.View
            style={[
              styles.rocketContainer,
              {
                opacity: rocketAnim,
                transform: [
                  { translateX: shakeAnim },
                  {
                    rotate: rocketAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '25deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.brokenRocket}>
              <View style={[styles.rocketPiece, styles.piece1]} />
              <View style={[styles.rocketPiece, styles.piece2]} />
              <View style={[styles.rocketPiece, styles.piece3]} />
              <Ionicons name="warning" size={20} color={Colors.danger} style={styles.warningIcon} />
            </View>
            <View style={styles.smoke1} />
            <View style={styles.smoke2} />
          </Animated.View>

          <Text style={styles.gameOverTitle}>MISSION</Text>
          <Text style={styles.gameOverSubtitle}>FAILED</Text>

          {isNewBest && (
            <View style={styles.newBestBadge}>
              <Ionicons name="trophy" size={14} color={Colors.accent} />
              <Text style={styles.newBestText}>NEW BEST!</Text>
            </View>
          )}

          {/* Score display */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{state.score}</Text>
                <Text style={styles.scoreItemLabel}>SCORE</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreValue, styles.bestScoreValue]}>{state.highScore}</Text>
                <Text style={styles.scoreItemLabel}>BEST</Text>
              </View>
            </View>

            <View style={styles.progressOuter}>
              <View
                style={[
                  styles.progressInner,
                  {
                    width: `${Math.min(100, (state.score / Math.max(state.highScore, 1)) * 100)}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <GameButton label="PLAY AGAIN" onPress={restartGame} size="large" />
            <GameButton label="CONTINUE" onPress={restartGame} variant="ghost" size="medium" />
            <GameButton label="MENU" onPress={goToMenu} variant="ghost" size="small" />
          </View>

          <Text style={styles.continueNote}>
            Continue — Watch an ad to keep your score
          </Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.cardBg,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  rocketContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brokenRocket: {
    width: 48,
    height: 64,
    position: 'relative',
    alignItems: 'center',
  },
  rocketPiece: {
    position: 'absolute',
    borderRadius: 3,
    backgroundColor: Colors.rocketBody,
  },
  piece1: {
    width: 24,
    height: 28,
    top: 0,
    left: 6,
    opacity: 0.9,
    transform: [{ rotate: '-15deg' }],
    backgroundColor: Colors.primaryLight,
  },
  piece2: {
    width: 18,
    height: 18,
    top: 28,
    left: 2,
    opacity: 0.7,
    transform: [{ rotate: '25deg' }],
  },
  piece3: {
    width: 14,
    height: 12,
    top: 36,
    right: 4,
    opacity: 0.6,
    transform: [{ rotate: '-40deg' }],
    backgroundColor: Colors.primary,
  },
  warningIcon: {
    position: 'absolute',
    bottom: -8,
    right: -12,
  },
  smoke1: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(200,200,200,0.15)',
    top: 10,
    right: 0,
  },
  smoke2: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(200,200,200,0.1)',
    top: 0,
    left: 10,
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.white,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 6,
    lineHeight: 40,
  },
  gameOverSubtitle: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.danger,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 6,
    lineHeight: 40,
    marginTop: -4,
  },
  newBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
  },
  newBestText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentLight,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },
  scoreSection: {
    width: '100%',
    gap: 12,
    marginVertical: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
    padding: 16,
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1,
  },
  bestScoreValue: {
    color: Colors.primaryLight,
  },
  scoreItemLabel: {
    fontSize: 10,
    color: Colors.textDim,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
    marginTop: 2,
  },
  scoreDivider: {
    width: 1,
    height: 48,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 16,
  },
  progressOuter: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressInner: {
    height: '100%',
    backgroundColor: Colors.primaryLight,
    borderRadius: 3,
  },
  buttons: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  continueNote: {
    fontSize: 11,
    color: Colors.textDim,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.6,
  },
});
