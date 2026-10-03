import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { vi } from 'vitest';

// Pages and the mock server load lazily; a full parallel run can take longer than the 1s default.
configure({ asyncUtilTimeout: 10000 });

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

if (typeof HTMLCanvasElement !== 'undefined') {
  // jsdom has no 2D canvas and logs "Not implemented" on getContext; the landing page's background
  // scene treats a null context as "no canvas".
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
}

if (typeof HTMLMediaElement !== 'undefined') {
  // jsdom has no media playback either ("Not implemented" logs); the landing background videos call these.
  HTMLMediaElement.prototype.play = () => Promise.resolve();
  HTMLMediaElement.prototype.pause = () => {};
}

if (typeof window !== 'undefined') {
  // Fix Node.js 20+ undici and JSDOM AbortSignal / Request mismatch
  window.AbortController = globalThis.AbortController;
  window.AbortSignal = globalThis.AbortSignal;
  window.Request = globalThis.Request;
  window.Response = globalThis.Response;
}
