import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // Vitest 1.x runs on its own Vite 5, where @vitejs/plugin-react 6 no longer configures the JSX
  // transform (it targets Vite 8's oxc). Without this, test files compile JSX to React.createElement
  // and fail with "React is not defined".
  esbuild: { jsx: 'automatic' },
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
