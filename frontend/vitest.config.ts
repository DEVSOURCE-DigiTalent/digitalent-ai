import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    // Tests must not depend on a developer's local .env: always exercise the real-API code path.
    env: { VITE_USE_MOCK: 'false', VITE_MOCK_LATENCY_MS: '0' },
    // Journey tests lazy-load the mock server; under a full parallel run that can exceed the 5s default.
    testTimeout: 20000,
  },
});
