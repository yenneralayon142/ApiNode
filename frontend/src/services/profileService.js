import { request } from './httpClient';

export const getProfile = (token) =>
  request('/profile', {
    method: 'GET',
    token,
  });

export const updateProfile = ({ token, payload }) =>
  request('/profile', {
    method: 'PATCH',
    token,
    body: payload,
  });

export const changePassword = ({ token, payload }) =>
  request('/profile/password', {
    method: 'PUT',
    token,
    body: payload,
  });
