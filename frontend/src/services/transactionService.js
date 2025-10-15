import { request } from './httpClient';
import { buildQueryString } from './serviceUtils';

export const listTransactions = ({ token, filters } = {}) => {
  const query = buildQueryString(filters);
  return request(`/transactions${query}`, { token });
};

export const createTransaction = ({ token, body }) =>
  request('/transactions', {
    method: 'POST',
    token,
    body
  });
