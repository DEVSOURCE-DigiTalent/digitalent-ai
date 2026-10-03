import { describe, it, expect } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import { shouldRetryQuery } from '../query-retry';

const httpError = (status: number) =>
  new AxiosError('failed', 'ERR', undefined, undefined, { status } as AxiosResponse);

describe('shouldRetryQuery', () => {
  it.each([400, 401, 403, 404, 409])('does not retry a %i response', (status) => {
    expect(shouldRetryQuery(0, httpError(status))).toBe(false);
  });

  it('retries a server error once', () => {
    expect(shouldRetryQuery(0, httpError(500))).toBe(true);
    expect(shouldRetryQuery(1, httpError(500))).toBe(false);
  });

  it('retries a network failure once', () => {
    expect(shouldRetryQuery(0, new AxiosError('Network Error'))).toBe(true);
    expect(shouldRetryQuery(1, new Error('boom'))).toBe(false);
  });
});
