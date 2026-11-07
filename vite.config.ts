import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 走子路径，本地 dev 保持根路径。
const base = process.env.GITHUB_PAGES ? '/vigil/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
