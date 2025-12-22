import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'chefmate.auth.token';
const isNative = Capacitor.isNativePlatform();

// Web fallback (you can switch to localStorage if you prefer persistence)
const webStore = {
  get: (key: string) =>
    typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(key),
  set: (key: string, value: string) => {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(key, value);
  },
  remove: (key: string) => {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(key);
  },
};

export const saveToken = async (token: string) => {
  if (!token) return;

  if (isNative) {
    await Preferences.set({ key: TOKEN_KEY, value: token });
  } else {
    webStore.set(TOKEN_KEY, token);
  }
};

export const getSavedToken = async (): Promise<string | null> => {
  if (isNative) {
    const { value } = await Preferences.get({ key: TOKEN_KEY });
    return value ?? null;
  }
  return webStore.get(TOKEN_KEY);
};

export const clearToken = async () => {
  if (isNative) {
    await Preferences.remove({ key: TOKEN_KEY });
  } else {
    webStore.remove(TOKEN_KEY);
  }
};
