import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 3000, // 或你希望使用的其他端口
  },
});
