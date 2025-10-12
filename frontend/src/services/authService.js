import { request } from './httpClient';

export const register = (payload) =>
  request('/auth/register', {
    method: 'POST',
    body: payload,
  });

export const login = (payload) =>
  request('/auth/login', {
    method: 'POST',
    body: payload,
  });

export const refresh = (payload) =>
  request('/auth/refresh', {
    method: 'POST',
    body: payload,
  });

export const logout = (payload, token) =>
  request('/auth/logout', {
    method: 'POST',
    body: payload,
    token,
  });

export const requestPasswordReset = (payload) =>
  request('/auth/password/request-reset', {
    method: 'POST',
    body: payload,
  });

export const resetPassword = (payload) =>
  request('/auth/password/reset', {
    method: 'POST',
    body: payload,
  });
