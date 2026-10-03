import type { ApiResponse } from '../../types/api';

/** Fake network delay so loading states are visible in the browser; tests set VITE_MOCK_LATENCY_MS=0. */
const MOCK_LATENCY_MS = Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 150);

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Resolves like an axios call to an ApiResponse<T> endpoint, after a short fake latency. */
export async function mockOk<T>(data: T, message = 'OK'): Promise<{ data: ApiResponse<T> }> {
  await wait(MOCK_LATENCY_MS);
  return { data: { success: true, message, data, errors: [] } };
}

/** Rejects with the same shape the pages read from an axios error (`err.response.data.message`). */
export async function mockFail(status: number, message: string): Promise<never> {
  await wait(MOCK_LATENCY_MS);
  throw { response: { status, data: { success: false, message, data: null, errors: [{ message }] } } };
}
