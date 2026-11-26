import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import apiClient from '@/services/api-client';
import type { CatalogCourseDetail } from '@/services/platform-catalog.service';
import { ResearchCoursesPage } from './ResearchCoursesPage';
import type { ResearchCourseContent } from './research-api';

vi.mock('@/hooks/use-current-user', () => ({
  useCurrentUser: (selector: (state: { user: { id: string; roles: string[] } }) => unknown) =>
    selector({ user: { id: 'researcher', roles: ['RND'] } }),
}));

vi.mock('@/services/api-client', () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));

it('saves a draft separately and displays an applied version only after publication', async () => {
  vi.mocked(apiClient.get).mockImplementation(async (path) => ({
    data: {
      data: path.endsWith('/settings') ? true
        : path.endsWith('/preview') ? [{ id: 'module-1', title: 'Nguồn dữ liệu', lessons: [] }]
        : [{ courseId: 'basic-1', code: 'M1-F', tier: 1, title: 'Khai thác dữ liệu', modules: ['Nguồn dữ liệu'], draft: null, applied: null }],
    },
  }));
  vi.mocked(apiClient.put).mockImplementation(async (path, content: ResearchCourseContent) => ({
    data: { data: { draft: content, applied: path.endsWith('/applied') ? content : null } },
  }));

  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter><ResearchCoursesPage /></MemoryRouter>
    </QueryClientProvider>,
  );

  await screen.findByRole('heading', { name: 'Khai thác dữ liệu' });
  const content = { title: '', objective: 'Sử dụng dữ liệu mẫu', practice: 'Tạo báo cáo nội bộ' };
  fireEvent.change(screen.getByRole('textbox', { name: 'Mục tiêu học tập của doanh nghiệp' }), { target: { value: content.objective } });
  fireEvent.click(screen.getByRole('button', { name: /Nguồn dữ liệu/ }));
  await screen.findByText('Chưa có bài học trong mô đun này.');
  expect(apiClient.get).toHaveBeenCalledWith('/enterprise/rnd/courses/basic-1/preview');
  fireEvent.click(screen.getByRole('button', { name: 'Thực hành nội bộ' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Hướng dẫn thực hành nội bộ' }), { target: { value: content.practice } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu nháp' }));
  await screen.findByText('Bản nháp');
  expect(apiClient.put).toHaveBeenCalledWith('/enterprise/rnd/courses/basic-1/draft', content);
  expect(screen.queryByText('Xem nội dung đang áp dụng')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Áp dụng cho doanh nghiệp' }));
  await screen.findByText('Đang áp dụng');
  await waitFor(() => expect(apiClient.put).toHaveBeenLastCalledWith('/enterprise/rnd/courses/basic-1/applied', content));
  expect(screen.getByText('Xem nội dung đang áp dụng')).toBeTruthy();
});

it('uses the shared module editor for adding, renaming and removing a module in the enterprise draft', async () => {
  const course: CatalogCourseDetail = {
    versionNo: 1, versionStatus: 'CURRENT', editable: true, courseId: 'basic-1', code: 'M1-F', codeEditable: false,
    changeKind: 'UNCHANGED', frameworkId: 'framework', frameworkName: 'Khung năng lực số', domainId: 'domain',
    domainName: 'Khai thác dữ liệu', level: 1, levelName: 'Cơ bản', title: 'Khóa Basic', outcome: '', price: 0,
    salesStatus: 'OPEN', final: { title: 'Bài cuối khóa', promptHtml: '', criteria: [] }, modules: [],
  };
  let revision = 0;
  vi.mocked(apiClient.get).mockImplementation(async (path) => ({
    data: { data: path.endsWith('/settings') ? true
      : path.endsWith('/editor') ? { course, revision, hasDraft: revision > 0, hasApplied: false }
      : [{ courseId: course.courseId, code: course.code, tier: 1, title: course.title, modules: [], draft: null, applied: null }] },
  }));
  vi.mocked(apiClient.put).mockImplementation(async (path, input: Pick<CatalogCourseDetail, 'modules' | 'final'>) => {
    expect(path).toBe('/enterprise/rnd/courses/basic-1/editor');
    Object.assign(course, { modules: input.modules, final: input.final });
    return { data: { data: { course: structuredClone(course), revision: ++revision, hasDraft: true, hasApplied: false } } };
  });
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter><ResearchCoursesPage /></MemoryRouter>
    </QueryClientProvider>,
  );

  fireEvent.click(await screen.findByRole('button', { name: 'Thêm mô đun' }));
  const title = await screen.findByPlaceholderText('Nhập tên mô đun...');
  fireEvent.change(title, { target: { value: 'Quy trình nội bộ' } });
  fireEvent.blur(title);
  await screen.findByRole('button', { name: /Quy trình nội bộ/ });
  await waitFor(() => expect(course.modules[0]?.title).toBe('Quy trình nội bộ'));

  fireEvent.click(screen.getByRole('button', { name: 'Xóa mô đun', exact: true }));
  const confirmation = await screen.findByRole('dialog');
  fireEvent.click(within(confirmation).getByRole('button', { name: 'Xác nhận xóa', exact: true }));
  await waitFor(() => expect(course.modules).toHaveLength(0));
});
