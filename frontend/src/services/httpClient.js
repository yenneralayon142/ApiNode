import { API_BASE_URL } from '../config/env';

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const buildUrl = (path) => {
  if (path.startsWith('http')) {
    return path;
  }
  const sanitizedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${sanitizedBase}${sanitizedPath}`;
};

export const request = async (path, options = {}) => {
  const { method = 'GET', body, token, headers, ...rest } = options;
  const url = buildUrl(path);

  const finalHeaders = { ...defaultHeaders, ...headers };
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson ? data?.message : response.statusText;
    const error = new Error(message || 'Error en la petición');
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
};
