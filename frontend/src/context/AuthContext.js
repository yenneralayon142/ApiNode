import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as authService from '../services/authService';
import { saveSession, getSession, clearSession } from '../storage/authStorage';

const AuthContext = createContext(null);

const parseAuthResult = (result) => {
  if (result?.success && result?.data?.tokens) {
    return {
      success: true,
      user: result.data.user,
      tokens: result.data.tokens,
      message: result.message,
    };
  }
  return {
    success: Boolean(result?.success),
    message: result?.message || 'Acción no completada',
    data: result?.data,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const session = await getSession();
      if (session.refreshToken) {
        try {
          const result = await authService.refresh({ refreshToken: session.refreshToken });
          const parsed = parseAuthResult(result);
          if (parsed.success) {
            await persistSession(parsed);
            return;
          }
        } catch (error) {
          console.warn('No se pudo refrescar la sesión almacenada', error);
        }
      }

      if (session.accessToken && session.user) {
        setUser(session.user);
        setAccessToken(session.accessToken);
        setRefreshToken(session.refreshToken);
      } else {
        await clearSession();
      }
    } finally {
      setInitializing(false);
    }
  };

  const persistSession = async ({ user: nextUser, tokens }) => {
    setUser(nextUser);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    await saveSession({
      user: nextUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  };

  const updateStoredUser = useCallback(async (nextUser) => {
    if (!nextUser) {
      return;
    }
    setUser(nextUser);
    await saveSession({
      user: nextUser,
    });
  }, []);

  const signIn = async (credentials) => {
    setActionLoading(true);
    try {
      const result = await authService.login(credentials);
      const parsed = parseAuthResult(result);
      if (parsed.success) {
        await persistSession(parsed);
      }
      return parsed;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión',
      };
    } finally {
      setActionLoading(false);
    }
  };

  const signUp = async (payload) => {
    setActionLoading(true);
    try {
      const result = await authService.register(payload);
      const parsed = parseAuthResult(result);
      if (parsed.success) {
        await persistSession(parsed);
      }
      return parsed;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al registrar usuario',
      };
    } finally {
      setActionLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (refreshToken) {
        await authService.logout({ refreshToken }, accessToken);
      }
    } catch (error) {
      console.warn('Error al cerrar sesión en el backend', error);
    } finally {
      await clearSession();
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      initializing,
      actionLoading,
      signIn,
      signUp,
      signOut,
      restoreSession,
      updateStoredUser,
    }),
    [user, accessToken, refreshToken, initializing, actionLoading, updateStoredUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }
  return context;
};




