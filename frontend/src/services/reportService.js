import { request } from './httpClient';
import { buildQueryString } from './serviceUtils';

export const getSummary = ({ token, filters } = {}) => {
  const query = buildQueryString(filters);
  return request(`/reports/summary${query}`, { token });
};

export const getMonthlySummary = ({ token, filters } = {}) => {
  const query = buildQueryString(filters);
  return request(`/reports/monthly${query}`, { token });
};

export const getCategorySummary = ({ token, filters } = {}) => {
  const query = buildQueryString(filters);
  return request(`/reports/categories${query}`, { token });
};
