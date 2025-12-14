import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from '@capawesome/capacitor-secure-storage';

const TOKEN_KEY = 'chefmate.auth.token';
const isNative = Capacitor.isNativePlatform();

const webStore = {
  get: (key: string) => (typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(key)),
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
    await SecureStoragePlugin.set({ key: TOKEN_KEY, value: token });
  } else {
    webStore.set(TOKEN_KEY, token);
  }
};

export const getSavedToken = async (): Promise<string | null> => {
  if (isNative) {
    const result = await SecureStoragePlugin.get({ key: TOKEN_KEY }).catch(() => ({ value: null }));
    return result?.value ?? null;
  }
  return webStore.get(TOKEN_KEY);
};

export const clearToken = async () => {
  if (isNative) {
    await SecureStoragePlugin.remove({ key: TOKEN_KEY });
  } else {
    webStore.remove(TOKEN_KEY);
  }
};
