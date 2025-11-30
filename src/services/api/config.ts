// API configuration and constants
export const API_BASE_URL =
  import.meta.env.MODE === 'development' ? '/api' : 'http://localhost:8081/api';

// Token storage keys
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};
