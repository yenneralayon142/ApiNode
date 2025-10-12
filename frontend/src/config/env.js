export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
console.log('API_BASE_URL', API_BASE_URL);
export const STORAGE_KEYS = {
  accessToken: 'yenandgestion.accessToken',
  refreshToken: 'yenandgestion.refreshToken',
  user: 'yenandgestion.user',
};

