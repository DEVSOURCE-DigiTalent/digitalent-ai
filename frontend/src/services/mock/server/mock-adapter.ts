import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import './handlers';
import { dispatch } from './router';

const LATENCY_MS = Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 150);
const TOKEN_PREFIX = 'mock-token:';

function parseBody(data: unknown): Record<string, unknown> {
  if (typeof data === 'string' && data.length > 0) {
    try {
      return JSON.parse(data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
}

function toQuery(params: unknown): Record<string, string> {
  const query: Record<string, string> = {};
  if (params && typeof params === 'object') {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') query[key] = String(value);
    }
  }
  return query;
}

function userIdFrom(config: InternalAxiosRequestConfig): string | undefined {
  const header = config.headers?.Authorization;
  const token = typeof header === 'string' ? header.replace(/^Bearer\s+/i, '') : '';
  return token.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : undefined;
}

/**
 * Axios adapter that answers from the mock server instead of the network. Installed on `apiClient` when
 * VITE_USE_MOCK=true, so every service and page that already calls the REST API works unchanged.
 */
export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  if (LATENCY_MS > 0) await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

  const path = (config.url ?? '').split('?')[0];
  const result = await dispatch({
    method: (config.method ?? 'get').toUpperCase(),
    path,
    query: toQuery(config.params),
    body: parseBody(config.data),
    userId: userIdFrom(config),
  });

  const response: AxiosResponse = {
    data: result.body,
    status: result.status,
    statusText: result.status < 400 ? 'OK' : 'Error',
    headers: {},
    config,
    request: {},
  };
  if (result.status >= 400) {
    const code = result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST;
    const safeConfig = {
      url: config.url,
      method: config.method,
      params: config.params,
      headers: config.headers,
    } as InternalAxiosRequestConfig;
    const safeResponse = {
      ...response,
      config: safeConfig,
    };
    throw new AxiosError(`Request failed with status code ${result.status}`, code, safeConfig, {}, safeResponse);
  }
  return response;
}
