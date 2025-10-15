import { request } from './httpClient';
import { buildQueryString } from './serviceUtils';

export const listCategories = ({ token, filters } = {}) => {
  const query = buildQueryString(filters);
  return request(`/categories${query}`, { token });
};
