import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGH_SCORE_KEY = 'space_sling_high_score';
const SOUND_KEY = 'space_sling_sound';

export async function getHighScore(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(HIGH_SCORE_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export async function saveHighScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
  } catch {}
}

export async function getSoundEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(SOUND_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export async function saveSoundEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(SOUND_KEY, enabled.toString());
  } catch {}
}
