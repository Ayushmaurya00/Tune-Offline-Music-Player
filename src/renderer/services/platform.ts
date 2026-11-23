import { Capacitor } from '@capacitor/core';

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && typeof window.tuneAPI !== 'undefined';
};

export const isCapacitor = (): boolean => {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
};

export const isMobileScreen = (): boolean => {
  return typeof window !== 'undefined' && window.innerWidth < 768;
};
