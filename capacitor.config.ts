import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chefmate.app',
  appName: 'ChefMate',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'https'
  }
};

export default config;
