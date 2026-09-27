import '@testing-library/jest-dom';

if (typeof window !== 'undefined') {
  // Fix Node.js 20+ undici and JSDOM AbortSignal / Request mismatch
  window.AbortController = globalThis.AbortController;
  window.AbortSignal = globalThis.AbortSignal;
  window.Request = globalThis.Request;
  window.Response = globalThis.Response;
}
