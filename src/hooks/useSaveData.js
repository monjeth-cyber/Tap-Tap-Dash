import { useState, useEffect } from 'react';
import { loadSaveData, saveUnlockedLevel, saveBestScore, saveSettings } from '../services/storageService';
import { setSoundEnabled } from '../services/audioService';

/**
 * Hook to manage persistent save data (unlocked levels, best scores, settings).
 */
export default function useSaveData() {
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [bestScores, setBestScores] = useState({});
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // Load on mount
  useEffect(() => {
    let mounted = true;
    loadSaveData().then((data) => {
      if (mounted) {
        setUnlockedLevel(data.unlockedLevel);
        setBestScores(data.bestScores);
        setSoundEnabledState(data.soundEnabled);
        setSoundEnabled(data.soundEnabled);
        setLoaded(true);
      }
    });
    return () => { mounted = false; };
  }, []);

  /**
   * Unlock a new level and persist.
   */
  const unlockLevel = async (level) => {
    if (level > unlockedLevel) {
      setUnlockedLevel(level);
      await saveUnlockedLevel(level);
    }
  };

  /**
   * Save a score for a level (persists only if it's a new best).
   */
  const updateBestScore = async (levelId, score) => {
    const prev = bestScores[levelId] || 0;
    if (score > prev) {
      setBestScores((old) => ({ ...old, [levelId]: score }));
      await saveBestScore(levelId, score);
    }
  };

  /**
   * Toggle sound and persist the setting.
   */
  const toggleSound = async () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setSoundEnabled(next);
    await saveSettings({ soundEnabled: next });
  };

  return {
    unlockedLevel,
    bestScores,
    soundEnabled,
    loaded,
    unlockLevel,
    updateBestScore,
    toggleSound,
  };
}
