import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AxiosAdapter, AxiosResponse } from 'axios';
import apiClient from '../api-client';
import { signDictionaryService } from '../sign-dictionary.service';

const originalAdapter = apiClient.defaults.adapter;

describe('Signed asset links', () => {
  let seen: { url?: string; authorization: unknown }[];

  beforeEach(() => {
    localStorage.setItem('accessToken', 'access');
    seen = [];
    const adapter: AxiosAdapter = async (config) => {
      seen.push({ url: config.url, authorization: config.headers.Authorization });
      return { config, status: 200, statusText: 'OK', data: new Blob(['video']), headers: {} } as AxiosResponse;
    };
    apiClient.defaults.adapter = adapter;
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    localStorage.clear();
  });

  // MinIO refuses a presigned request that also carries a bearer token (400 "multiple authentication types").
  it('downloads a sign video without the bearer token, while other calls keep it', async () => {
    const blob = await signDictionaryService.videoBlob('/platform/assets/a1/content?exp=1&sig=abc');
    await apiClient.get('/platform/sign-glosses');

    expect(blob).toBeInstanceOf(Blob);
    expect(seen).toEqual([
      { url: 'platform/assets/a1/content?exp=1&sig=abc', authorization: undefined },
      { url: '/platform/sign-glosses', authorization: 'Bearer access' },
    ]);
  });
});
