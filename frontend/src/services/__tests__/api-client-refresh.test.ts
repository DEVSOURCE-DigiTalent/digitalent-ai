import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AxiosError, type AxiosAdapter, type AxiosResponse } from 'axios';
import apiClient from '../api-client';

const originalAdapter = apiClient.defaults.adapter;

function response(config: Parameters<AxiosAdapter>[0], status: number, data: unknown): AxiosResponse {
  return { config, status, statusText: String(status), data, headers: {} };
}

describe('API token refresh', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'expired-access');
    localStorage.setItem('refreshToken', 'old-refresh');
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    localStorage.clear();
  });

  it('rotates tokens once and retries concurrent 401 requests', async () => {
    let refreshCalls = 0;
    const adapter: AxiosAdapter = async (config) => {
      if (config.url === '/auth/refresh') {
        refreshCalls += 1;
        expect(config.data).toContain('old-refresh');
        return response(config, 200, { data: { accessToken: 'new-access', refreshToken: 'new-refresh' } });
      }
      if (config.headers.Authorization === 'Bearer new-access') {
        return response(config, 200, { data: config.url });
      }
      throw new AxiosError('Expired', 'ERR_BAD_REQUEST', config, undefined, response(config, 401, {}));
    };
    apiClient.defaults.adapter = adapter;

    const [first, second] = await Promise.all([apiClient.get('/first'), apiClient.get('/second')]);

    expect(first.data.data).toBe('/first');
    expect(second.data.data).toBe('/second');
    expect(refreshCalls).toBe(1);
    expect(localStorage.getItem('accessToken')).toBe('new-access');
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
  });

  it('does not refresh a rejected login request', async () => {
    let refreshCalls = 0;
    apiClient.defaults.adapter = async (config) => {
      if (config.url === '/auth/refresh') refreshCalls += 1;
      throw new AxiosError('Rejected', 'ERR_BAD_REQUEST', config, undefined, response(config, 401, {}));
    };

    await expect(apiClient.post('/auth/login', { email: 'user@example.com', password: 'wrong' }))
      .rejects.toBeInstanceOf(AxiosError);
    expect(refreshCalls).toBe(0);
    expect(localStorage.getItem('refreshToken')).toBe('old-refresh');
  });
});
