import * as Haptics from 'expo-haptics';

/**
 * Light haptic feedback (successful turn, gem collect).
 */
export async function lightHaptic() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (e) {
    // Haptics not available on this device
  }
}

/**
 * Medium haptic feedback (level complete).
 */
export async function mediumHaptic() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (e) {
    // Haptics not available
  }
}

/**
 * Heavy haptic feedback (failure/game over).
 */
export async function heavyHaptic() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (e) {
    // Haptics not available
  }
}

/**
 * Success notification haptic.
 */
export async function successHaptic() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (e) {
    // Haptics not available
  }
}

/**
 * Error notification haptic.
 */
export async function errorHaptic() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (e) {
    // Haptics not available
  }
}
