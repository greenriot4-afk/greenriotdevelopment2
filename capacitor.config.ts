import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a7104e3ffccc4d70b657fc631f8c2f41',
  appName: 'street-finds-swap',
  webDir: 'dist',
  server: {
    url: 'https://a7104e3f-fccc-4d70-b657-fc631f8c2f41.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    Geolocation: {
      permissions: ['location']
    }
  }
};

export default config;