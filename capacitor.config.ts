import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tune.music',
  appName: 'Tune',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
