const DEFAULT_DEV_API = 'http://127.0.0.1:8080';

export const API_BASE_URL = (() => {
  const fromEnv = import.meta.env.VITE_API_URL?.toString().trim();
  if (fromEnv) {
    return fromEnv;
  }

  if (import.meta.env.DEV) {
    const devUrl = import.meta.env.VITE_DEV_API_URL?.toString().trim();
    return devUrl || DEFAULT_DEV_API;
  }

  throw new Error('API base URL is not configured. Set VITE_API_URL for production builds.');
})();
