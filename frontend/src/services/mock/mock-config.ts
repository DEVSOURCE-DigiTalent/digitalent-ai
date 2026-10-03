/**
 * Frontend-first development: when `VITE_USE_MOCK=true`, services answer from `services/mock/`
 * instead of the backend. Page code does not change when the real API is connected.
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
