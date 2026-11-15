import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../../api-client';
import { mockAdapter } from '../mock-adapter';
import type {
  CatalogVersionDetail,
  CatalogVersionsOutput,
  CatalogCourseDetail,
} from '../../../platform-catalog.service';

beforeAll(() => {
  apiClient.defaults.adapter = mockAdapter;
});

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('accessToken', 'mock-token:mock-platform');
  vi.stubGlobal('location', { pathname: '/platform/versions', search: '', href: '' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function call<T = any>(method: 'get' | 'post' | 'put' | 'delete', url: string, payload?: unknown): Promise<T> {
  const response = await apiClient.request({
    method,
    url,
    ...(method === 'get' ? { params: payload } : { data: payload }),
  });
  return response.data.data as T;
}

describe('Mock API: Platform Catalog Versions & Course Builder', () => {
  it('GET /platform/catalog/versions returns version list including v5 and historical versions', async () => {
    const data = await call<CatalogVersionsOutput>('get', '/platform/catalog/versions');
    expect(data.currentVersionNo).toBe(5);
    expect(data.items.length).toBeGreaterThanOrEqual(2);
    expect(data.items.some((v) => v.versionNo === 5 && v.status === 'CURRENT')).toBe(true);
  });

  it('GET /platform/catalog/versions/1/courses/crs-A1-F returns course detail for version 1', async () => {
    const course = await call<CatalogCourseDetail>('get', '/platform/catalog/versions/1/courses/crs-A1-F');
    expect(course.versionNo).toBe(1);
    expect(course.courseId).toBe('crs-A1-F');
    expect(course.code).toBe('A1-F');
    expect(course.editable).toBe(false);
    expect(course.modules.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /platform/catalog/versions creates a draft version v6', async () => {
    const draft = await call<CatalogVersionDetail>('post', '/platform/catalog/versions');
    expect(draft.version.versionNo).toBe(6);
    expect(draft.version.status).toBe('DRAFT');
    expect(draft.editable).toBe(true);
    expect(draft.courses.length).toBe(18);

    const versions = await call<CatalogVersionsOutput>('get', '/platform/catalog/versions');
    expect(versions.draftVersionNo).toBe(6);
    expect(versions.items.some((v) => v.versionNo === 6 && v.status === 'DRAFT')).toBe(true);
  });

  it('GET /platform/catalog/versions/6/courses/crs-A1-F returns editable course detail in draft', async () => {
    const course = await call<CatalogCourseDetail>('get', '/platform/catalog/versions/6/courses/crs-A1-F');
    expect(course.versionNo).toBe(6);
    expect(course.courseId).toBe('crs-A1-F');
    expect(course.editable).toBe(true);
    expect(course.versionStatus).toBe('DRAFT');
  });

  it('PUT /platform/catalog/versions/6/courses/crs-A1-F updates course info in draft', async () => {
    const updated = await call<CatalogCourseDetail>('put', '/platform/catalog/versions/6/courses/crs-A1-F', {
      title: 'Học phần số căn bản đã chỉnh sửa',
      outcome: 'Đạt chuẩn kỹ năng số cập nhật',
    });
    expect(updated.title).toBe('Học phần số căn bản đã chỉnh sửa');
    expect(updated.outcome).toBe('Đạt chuẩn kỹ năng số cập nhật');
    expect(updated.changeKind).toBe('EDITED');
  });

  it('POST /platform/catalog/versions/6/courses/crs-A1-F/modules adds a new module', async () => {
    const course = await call<CatalogCourseDetail>('post', '/platform/catalog/versions/6/courses/crs-A1-F/modules', {
      title: 'Mô đun thực hành thực tế',
    });
    expect(course.modules.some((m) => m.title === 'Mô đun thực hành thực tế')).toBe(true);
  });

  it('POST /platform/catalog/versions/6/publish publishes the draft and updates current version to v6', async () => {
    const published = await call<CatalogVersionDetail>('post', '/platform/catalog/versions/6/publish', {
      releaseNote: 'Công bố chính thức danh mục v6.',
    });
    expect(published.version.versionNo).toBe(6);
    expect(published.version.status).toBe('CURRENT');
    expect(published.editable).toBe(false);

    const versions = await call<CatalogVersionsOutput>('get', '/platform/catalog/versions');
    expect(versions.currentVersionNo).toBe(6);
    expect(versions.draftVersionNo).toBeNull();
  });
});
