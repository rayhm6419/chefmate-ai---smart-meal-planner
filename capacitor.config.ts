import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chefmate.app',
  appName: 'ChefMate',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'https',
    url: "http://127.0.0.1:3000", // 或你的 dev 端口
    cleartext: true
  }
};

export default config;
