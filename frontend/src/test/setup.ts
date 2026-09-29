import '@testing-library/jest-dom';
import { vi } from 'vitest';

// MainLayout mở kết nối SignalR (useNotificationHub). Trong test không có server → dùng kết nối "câm"
// để không gọi mạng / in lỗi negotiation. Test của hook tự ghi đè HubConnectionBuilder.
vi.mock('@microsoft/signalr', () => {
  const connection = {
    on: vi.fn(),
    off: vi.fn(),
    start: vi.fn(() => Promise.resolve()),
    stop: vi.fn(() => Promise.resolve()),
  };
  const builder = {
    withUrl: () => builder,
    withAutomaticReconnect: () => builder,
    configureLogging: () => builder,
    build: () => connection,
  };
  return { HubConnectionBuilder: vi.fn(() => builder), LogLevel: { Warning: 3 } };
});

if (typeof window !== 'undefined') {
  // Fix Node.js 20+ undici and JSDOM AbortSignal / Request mismatch
  window.AbortController = globalThis.AbortController;
  window.AbortSignal = globalThis.AbortSignal;
  window.Request = globalThis.Request;
  window.Response = globalThis.Response;
}
