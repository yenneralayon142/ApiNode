import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/env';

export const saveSession = async ({ accessToken, refreshToken, user }) => {
  const ops = [];
  if (accessToken) {
    ops.push(AsyncStorage.setItem(STORAGE_KEYS.accessToken, accessToken));
  }
  if (refreshToken) {
    ops.push(AsyncStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken));
  }
  if (user) {
    ops.push(AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user)));
  }
  await Promise.all(ops);
};

export const getSession = async () => {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.accessToken),
    AsyncStorage.getItem(STORAGE_KEYS.refreshToken),
    AsyncStorage.getItem(STORAGE_KEYS.user),
  ]);
  return {
    accessToken,
    refreshToken,
    user: userRaw ? JSON.parse(userRaw) : null,
  };
};

export const clearSession = async () => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.refreshToken,
    STORAGE_KEYS.user,
  ]);
};
