import { Capacitor } from '@capacitor/core';

export const isElectron = (): boolean => {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.userAgent === 'string' &&
    navigator.userAgent.toLowerCase().includes('electron')
  );
};

export const isCapacitor = (): boolean => {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
};

export const isMobileScreen = (): boolean => {
  return typeof window !== 'undefined' && window.innerWidth < 768;
};

