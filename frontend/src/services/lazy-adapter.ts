/**
 * Wraps a mock adapter that is loaded on first call. Every property of the returned object is an async
 * function that loads the adapter and forwards the call, so callers use it like the real service.
 *
 * `load` must test `import.meta.env.VITE_USE_MOCK` inline in front of its `import()`: that is what lets a
 * production build drop the mock code (see services/auth.service.ts).
 */
export function lazyAdapter<T extends object>(load: () => Promise<T>): T {
  return new Proxy({} as T, {
    get:
      (_target, property) =>
      (...args: unknown[]) =>
        load().then((adapter) => (adapter as Record<string | symbol, (...a: unknown[]) => unknown>)[property](...args)),
  });
}

/** Stand-in for a service whose backend does not exist yet: every call rejects with a clear message. */
export function unavailableAdapter<T extends object>(serviceName: string): T {
  return new Proxy({} as T, {
    get: () => () =>
      Promise.reject(new Error(`Dịch vụ "${serviceName}" chưa được kết nối với backend. Bật VITE_USE_MOCK=true để dùng dữ liệu giả lập.`)),
  });
}
