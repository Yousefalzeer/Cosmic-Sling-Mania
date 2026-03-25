import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import GameButton from '@/components/ui/GameButton';

const ND = Platform.OS !== 'web';

// Fixed star positions so they don't re-randomize on each render
const MENU_STARS = Array.from({ length: 50 }, (_, i) => ({
  left: ((i * 37 + 13) % 100),
  top: ((i * 61 + 7) % 100),
  width: 1 + (i % 3),
  opacity: 0.3 + (i % 5) * 0.12,
}));

export default function MenuScreen() {
  const { startGame, toggleSound, state } = useGame();
  const insets = useSafeAreaInsets();

  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(1)).current;

  const planet1Anim = useRef(new Animated.Value(0)).current;
  const planet2Anim = useRef(new Animated.Value(0)).current;
  const planet3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(titleAnim, { toValue: 1, duration: 700, useNativeDriver: ND }),
      Animated.timing(subtitleAnim, { toValue: 1, duration: 600, useNativeDriver: ND }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 600, useNativeDriver: ND }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -12, duration: 2200, useNativeDriver: ND }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2200, useNativeDriver: ND }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.2, duration: 2000, useNativeDriver: ND }),
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: ND }),
      ])
    ).start();

    const makeFloater = (anim: Animated.Value, dur: number, offset: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: offset, duration: dur, useNativeDriver: ND }),
          Animated.timing(anim, { toValue: -offset, duration: dur, useNativeDriver: ND }),
        ])
      );

    makeFloater(planet1Anim, 3200, 18).start();
    makeFloater(planet2Anim, 2600, -14).start();
    makeFloater(planet3Anim, 4000, 10).start();
  }, []);

  const topPad = insets.top > 0 ? insets.top : (Platform.OS === 'web' ? 67 : 44);
  const bottomPad = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'web' ? 34 : 20);

  return (
    <LinearGradient
      colors={[Colors.backgroundDeep, Colors.background, '#1A0035']}
      style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}
    >
      {/* Stars background */}
      {MENU_STARS.map((star, i) => (
        <View
          key={i}
          style={[
            styles.menuStar,
            {
              left: `${star.left}%` as any,
              top: `${star.top}%` as any,
              width: star.width,
              height: star.width,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      {/* Decorative planets */}
      <Animated.View
        style={[styles.decoPlanet, styles.deco1, { transform: [{ translateY: planet1Anim }] }]}
      />
      <Animated.View
        style={[styles.decoPlanet, styles.deco2, { transform: [{ translateY: planet2Anim }] }]}
      />
      <Animated.View
        style={[styles.decoPlanet, styles.deco3, { transform: [{ translateY: planet3Anim }] }]}
      />

      {/* Sound toggle */}
      <Animated.View style={[styles.soundBtn, { top: topPad + 8, opacity: buttonAnim }]}>
        <Pressable
          onPress={() => {
            toggleSound();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={styles.soundPressable}
        >
          <Ionicons
            name={state.soundEnabled ? 'volume-high' : 'volume-mute'}
            size={22}
            color={Colors.textSecondary}
          />
        </Pressable>
      </Animated.View>

      <View style={styles.content}>
        {/* Rocket hero */}
        <Animated.View
          style={[
            styles.heroRocket,
            {
              transform: [{ translateY: floatAnim }],
              opacity: titleAnim,
            },
          ]}
        >
          <Animated.View style={[styles.glowRing, { transform: [{ scale: glowAnim }] }]} />

          <View style={styles.rocketHero}>
            <View style={styles.rocketNoseHero} />
            <View style={styles.rocketWindowHero} />
            <View style={styles.rocketBodyHero} />
            <View style={styles.rocketFinLeftHero} />
            <View style={styles.rocketFinRightHero} />
            <View style={styles.rocketFlameHero} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.titleMain}>SPACE</Text>
          <Text style={styles.titleAccent}>SLING</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: subtitleAnim,
              transform: [
                {
                  translateY: subtitleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Sling through the cosmos
        </Animated.Text>

        {/* Buttons */}
        <Animated.View
          style={[
            styles.buttons,
            {
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <GameButton label="PLAY" onPress={startGame} size="large" />

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{state.highScore}</Text>
              <Text style={styles.statLabel}>BEST SCORE</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Tutorial hint */}
      <Animated.View style={[styles.hint, { opacity: subtitleAnim }]}>
        <Ionicons name="finger-print" size={16} color={Colors.textDim} />
        <Text style={styles.hintText}>Drag back to aim, release to launch</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuStar: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  decoPlanet: {
    position: 'absolute',
    borderRadius: 999,
  },
  deco1: {
    width: 90,
    height: 90,
    backgroundColor: Colors.planet1,
    opacity: 0.2,
    top: '12%',
    right: '-5%',
  },
  deco2: {
    width: 55,
    height: 55,
    backgroundColor: Colors.planet2,
    opacity: 0.18,
    top: '30%',
    left: '-8%',
  },
  deco3: {
    width: 35,
    height: 35,
    backgroundColor: Colors.planet5,
    opacity: 0.22,
    top: '75%',
    right: '10%',
  },
  soundBtn: {
    position: 'absolute',
    right: 20,
  },
  soundPressable: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  heroRocket: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  glowRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    opacity: 0.15,
  },
  rocketHero: {
    width: 44,
    height: 80,
    alignItems: 'center',
    position: 'relative',
  },
  rocketNoseHero: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.primaryLight,
    position: 'absolute',
    top: 0,
  },
  rocketWindowHero: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.secondaryLight,
    position: 'absolute',
    top: 28,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  rocketBodyHero: {
    width: 30,
    height: 32,
    backgroundColor: Colors.rocketBody,
    borderRadius: 4,
    position: 'absolute',
    top: 22,
  },
  rocketFinLeftHero: {
    width: 0,
    height: 0,
    borderTopWidth: 0,
    borderBottomWidth: 20,
    borderRightWidth: 14,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: Colors.primary,
    position: 'absolute',
    bottom: 6,
    left: 1,
  },
  rocketFinRightHero: {
    width: 0,
    height: 0,
    borderTopWidth: 0,
    borderBottomWidth: 20,
    borderLeftWidth: 14,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Colors.primary,
    position: 'absolute',
    bottom: 6,
    right: 1,
  },
  rocketFlameHero: {
    width: 20,
    height: 28,
    backgroundColor: Colors.rocketFlame,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    position: 'absolute',
    bottom: -16,
    opacity: 0.85,
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleMain: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.white,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 8,
    lineHeight: 56,
  },
  titleAccent: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.primaryLight,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 8,
    lineHeight: 56,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  buttons: {
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primaryLight,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textDim,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
    marginTop: 2,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginBottom: 16,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textDim,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
  },
});
