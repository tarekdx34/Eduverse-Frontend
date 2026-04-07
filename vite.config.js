import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      // Backend attendance API lives under /attendance/*. Do not proxy the SPA route /attendance exactly.
      '/attendance': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass(req) {
          const path = (req.url || '').split('?')[0];
          if (path === '/attendance' || path === '/attendance/') {
            return '/index.html';
          }
        },
      },
      // Local Python face service (npm run attendance in EduVerse-Backend). POST /ai-attendance/attendance
      '/ai-attendance': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-attendance/, ''),
      },
      // Local Python quiz service (run quiz-generator FastAPI on :8001).
      '/ai-quiz': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-quiz/, ''),
      },
    },
  },
});
