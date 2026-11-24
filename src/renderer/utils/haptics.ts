/**
 * Haptic feedback utility for mobile Android / touchscreens
 * Uses standard navigator.vibrate with safe fallbacks
 */
export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success';

export function triggerHaptic(type: HapticType = 'light'): void {
  try {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

    switch (type) {
      case 'light':
      case 'selection':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(28);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'success':
        navigator.vibrate([15, 35, 20]);
        break;
      default:
        navigator.vibrate(12);
    }
  } catch {
    // Vibration not permitted or unsupported
  }
}
