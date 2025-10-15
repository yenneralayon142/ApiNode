export const buildQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '');
  if (!entries.length) {
    return '';
  }
  const query = entries
    .map(([key, value]) => {
      const normalized = value instanceof Date ? value.toISOString() : value;
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(normalized))}`;
    })
    .join('&');
  return `?${query}`;
};
