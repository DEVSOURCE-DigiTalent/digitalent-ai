import { isAxiosError } from 'axios';

const MAX_QUERY_RETRIES = 1;

/**
 * Retry policy for React Query reads: one retry for network or server errors, none for 4xx —
 * a 403/404 will not change on a second attempt and only delays the message shown to the user.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status !== undefined && status >= 400 && status < 500) return false;
  return failureCount < MAX_QUERY_RETRIES;
}
