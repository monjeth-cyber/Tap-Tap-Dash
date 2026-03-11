import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

const DEFAULT_SAVE_DATA = {
  unlockedLevel: 1,
  bestScores: {},
  soundEnabled: true,
  hapticsEnabled: true,
};

/**
 * Load save data from AsyncStorage.
 * @returns {Promise<import('../types/index').SaveData>}
 */
export async function loadSaveData() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SAVE_DATA);
    if (raw) {
      return { ...DEFAULT_SAVE_DATA, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load save data:', e);
  }
  return { ...DEFAULT_SAVE_DATA };
}

/**
 * Save the full save data object.
 * @param {import('../types/index').SaveData} data
 */
async function persist(data) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SAVE_DATA, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to persist save data:', e);
  }
}

/**
 * Unlock a level (only if higher than current).
 * @param {number} level
 */
export async function saveUnlockedLevel(level) {
  const data = await loadSaveData();
  if (level > data.unlockedLevel) {
    data.unlockedLevel = level;
    await persist(data);
  }
}

/**
 * Save a best score for a level (only if higher than current).
 * @param {number} levelId
 * @param {number} score
 */
export async function saveBestScore(levelId, score) {
  const data = await loadSaveData();
  const prev = data.bestScores[levelId] || 0;
  if (score > prev) {
    data.bestScores[levelId] = score;
    await persist(data);
  }
}

/**
 * Load best score for a specific level.
 * @param {number} levelId
 * @returns {Promise<number>}
 */
export async function loadBestScore(levelId) {
  const data = await loadSaveData();
  return data.bestScores[levelId] || 0;
}

/**
 * Save settings.
 * @param {{ soundEnabled?: boolean, hapticsEnabled?: boolean }} settings
 */
export async function saveSettings(settings) {
  const data = await loadSaveData();
  if (settings.soundEnabled !== undefined) data.soundEnabled = settings.soundEnabled;
  if (settings.hapticsEnabled !== undefined) data.hapticsEnabled = settings.hapticsEnabled;
  await persist(data);
}
