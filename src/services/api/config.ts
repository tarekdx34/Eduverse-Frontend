// API configuration and constants
export const API_BASE_URL =
  import.meta.env.MODE === 'development' ? '/api' : 'http://localhost:8081/api';

/** Local face-recognition service. Dev: Vite proxies `/ai-attendance` → http://127.0.0.1:8000 */
export const AI_ATTENDANCE_BASE_URL =
  (import.meta.env.VITE_AI_ATTENDANCE_URL as string | undefined)?.replace(/\/$/, '') ||
  (import.meta.env.DEV ? '/ai-attendance' : 'http://127.0.0.1:8000');

// Token storage keys
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};
