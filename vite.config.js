import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:8081';

  return {
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          configure(proxy) {
            proxy.on('error', (err, req) => {
              console.error(
                `[vite proxy /api] Cannot reach backend at ${apiUrl} —`,
                req?.url,
                err?.message || err
              );
            });
          },
        },
        // Backend attendance API lives under /attendance/*. Do not proxy the SPA route /attendance exactly.
        '/attendance': {
          target: apiUrl,
          changeOrigin: true,
          bypass(req) {
            const path = (req.url || '').split('?')[0];
            if (path === '/attendance' || path === '/attendance/') {
              return '/index.html';
            }
          },
        },
      // Local Python face service — MUST run: cd EduVerse-Backend && npm run attendance (port 8000)
      '/ai-attendance': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-attendance/, ''),
        configure(proxy) {
          proxy.on('error', (err) => {
            if (err.code === 'ECONNREFUSED') {
              console.error(
                '\n[vite] AI attendance: nothing on :8000. Start Python: cd EduVerse-Backend && npm run attendance\n',
              );
            }
          });
        },
      },
      // Local Python quiz service (run quiz-generator FastAPI on :8001).
      '/ai-quiz': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-quiz/, ''),
      },
    },
  },
  };
});
