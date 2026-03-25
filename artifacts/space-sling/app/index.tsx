import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGame } from '@/context/GameContext';
import MenuScreen from '@/screens/MenuScreen';
import GameScreen from '@/screens/GameScreen';
import GameOverScreen from '@/screens/GameOverScreen';
import Colors from '@/constants/colors';

export default function App() {
  const { state } = useGame();

  return (
    <View style={styles.root}>
      {state.screen === 'menu' && <MenuScreen />}
      {(state.screen === 'game' || state.screen === 'gameover') && <GameScreen />}
      {state.screen === 'gameover' && <GameOverScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.backgroundDeep,
  },
});
