import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:8000',  // Use the service name 'backend' defined in docker-compose.yml
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
