import React, { useRef } from 'react';
import { Text, StyleSheet, Pressable, Animated, ViewStyle, TextStyle, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

const ND = Platform.OS !== 'web';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'large' | 'medium' | 'small';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function GameButton({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  disabled,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: ND, friction: 8 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: ND, friction: 6 }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const bgColor =
    variant === 'primary' ? Colors.buttonPrimary :
    variant === 'secondary' ? Colors.buttonSecondary :
    variant === 'danger' ? Colors.danger :
    'transparent';

  const borderColor =
    variant === 'primary' ? 'transparent' :
    variant === 'ghost' ? Colors.buttonBorder :
    'transparent';

  const textColor = variant === 'ghost' ? Colors.primaryLight : Colors.white;
  const paddingV = size === 'large' ? 18 : size === 'small' ? 10 : 14;
  const fontSize = size === 'large' ? 18 : size === 'small' ? 14 : 16;
  const minWidth = size === 'large' ? 220 : size === 'small' ? 100 : 160;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: bgColor,
            borderColor,
            borderWidth: variant === 'ghost' ? 1.5 : 0,
            paddingVertical: paddingV,
            minWidth,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            {
              color: textColor,
              fontSize,
              fontFamily: size === 'large' ? 'Inter_700Bold' : 'Inter_600SemiBold',
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
