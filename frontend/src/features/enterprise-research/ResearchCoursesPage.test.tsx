import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import apiClient from '@/services/api-client';
import type { CatalogCourseDetail } from '@/services/platform-catalog.service';
import { ResearchCoursesPage } from './ResearchCoursesPage';
import type { ResearchCourseContent } from './research-api';

vi.mock('@/hooks/use-current-user', () => ({
  useCurrentUser: (selector: (state: { user: { id: string; roles: string[] } }) => unknown) =>
    selector({ user: { id: 'researcher', roles: ['RND'] } }),
}));

vi.mock('@/services/api-client', () => ({
  default: { get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

// The course update strip has its own tests; here nothing waits for R&D.
vi.mock('@/hooks/use-course-updates', () => ({
  useCourseUpdates: () => ({ data: undefined }),
}));

afterEach(() => vi.clearAllMocks());

// R&D in charge of the company's courses and allowed to edit them.
const ACCESS = { enabled: true, purchased: true, inCharge: 'RND', researchers: 1, canView: true, canEdit: true, reason: null };

const detail = (): CatalogCourseDetail => ({
  versionNo: 1, versionStatus: 'CURRENT', editable: true, courseId: 'basic-1', code: 'M1-F', codeEditable: false,
  changeKind: 'UNCHANGED', frameworkId: 'framework', frameworkName: 'Khung năng lực số', domainId: 'domain',
  domainName: 'Khai thác dữ liệu', level: 1, levelName: 'Cơ bản', title: 'Khai thác dữ liệu', outcome: '', price: 0,
  salesStatus: 'OPEN', final: { title: 'Bài cuối khóa', promptHtml: '<p>Lập báo cáo</p>', criteria: ['Đúng số liệu'] },
  modules: [{ moduleId: 'module-1', index: 0, title: 'Nguồn dữ liệu', quizTitle: 'Câu hỏi ôn tập', blocks: [], questions: [] }],
});

function renderPage() {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter><ResearchCoursesPage /></MemoryRouter>
    </QueryClientProvider>,
  );
}

function serve(problems: string[], access: Partial<typeof ACCESS> = {}) {
  const list = [{ courseId: 'basic-1', code: 'M1-F', tier: 1, title: 'Khai thác dữ liệu', modules: ['Nguồn dữ liệu'], draft: null, applied: null }];
  vi.mocked(apiClient.get).mockImplementation(async (path) => ({
    data: {
      data: path.endsWith('/access') ? { ...ACCESS, ...access }
        : path.endsWith('/editor') ? { course: detail(), revision: 3, hasDraft: false, hasApplied: false, problems }
        : list,
    },
  }));
}

it('saves the information as a draft and applies the company version with one button', async () => {
  serve([]);
  vi.mocked(apiClient.put).mockImplementation(async (_path, content: ResearchCourseContent) => ({
    data: { data: { draft: content, applied: null } },
  }));
  vi.mocked(apiClient.post).mockResolvedValue({
    data: { data: { course: detail(), revision: 4, hasDraft: false, hasApplied: true, problems: [] } },
  });
  renderPage();

  await screen.findByRole('heading', { name: 'Khai thác dữ liệu' });
  await screen.findByText('Đang dùng bản chuẩn');
  // Only the information is typed here; practice and objective are optional.
  const content = { title: '', objective: 'Sử dụng dữ liệu mẫu của công ty', practice: '' };
  fireEvent.change(screen.getByRole('textbox', { name: 'Mục tiêu học tập của doanh nghiệp' }), { target: { value: content.objective } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu nháp' }));
  await screen.findByText('Bản nháp chưa áp dụng');
  expect(apiClient.put).toHaveBeenCalledWith('/enterprise/rnd/courses/basic-1/draft', content);
  expect(screen.getAllByRole('button', { name: /Áp dụng cho doanh nghiệp/ })).toHaveLength(1);

  fireEvent.click(screen.getByRole('button', { name: /Áp dụng cho doanh nghiệp/ }));
  const dialog = await screen.findByRole('dialog');
  expect(dialog).toHaveTextContent('học lại từ đầu');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Áp dụng' }));
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/enterprise/rnd/courses/basic-1/apply', { revision: 3, info: content }));
  await screen.findByText('Đang dùng bản doanh nghiệp');
  expect(screen.getByRole('button', { name: 'Gỡ bản doanh nghiệp' })).toBeInTheDocument();
});

it('lists what must be fixed before applying and opens the module to fix', async () => {
  serve(['Mô đun 1: cần ít nhất 2 câu hỏi ôn tập (đang có 0).']);
  renderPage();

  // The outline marks the module to fix once the editor is loaded.
  await screen.findByText(/0 khối · 0 câu hỏi · cần sửa/);
  fireEvent.click(screen.getByRole('button', { name: /Áp dụng cho doanh nghiệp/ }));
  const dialog = await screen.findByRole('dialog', { name: 'Chưa áp dụng được' });
  expect(within(dialog).queryByRole('button', { name: 'Áp dụng' })).toBeNull();
  fireEvent.click(within(dialog).getByRole('button', { name: /Mô đun 1: cần ít nhất 2 câu hỏi/ }));
  expect(await screen.findByRole('heading', { name: 'Trợ lý soạn nội dung theo Thông tư 02' })).toBeInTheDocument();
  expect(apiClient.post).not.toHaveBeenCalled();
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
    data: { data: path.endsWith('/access') ? ACCESS
      : path.endsWith('/editor') ? { course, revision, hasDraft: revision > 0, hasApplied: false, problems: [] }
      : [{ courseId: course.courseId, code: course.code, tier: 1, title: course.title, modules: [], draft: null, applied: null }] },
  }));
  vi.mocked(apiClient.put).mockImplementation(async (path, input: Pick<CatalogCourseDetail, 'modules' | 'final'>) => {
    expect(path).toBe('/enterprise/rnd/courses/basic-1/editor');
    Object.assign(course, { modules: input.modules, final: input.final });
    return { data: { data: { course: structuredClone(course), revision: ++revision, hasDraft: true, hasApplied: false, problems: [] } } };
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
  // R&D gets the same AI help as the admin builder on its company draft.
  expect(screen.getByRole('heading', { name: 'Trợ lý soạn nội dung theo Thông tư 02' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Kiểm tra theo Thông tư' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Xóa mô đun', exact: true }));
  const confirmation = await screen.findByRole('dialog');
  fireEvent.click(within(confirmation).getByRole('button', { name: 'Xác nhận xóa', exact: true }));
  await waitFor(() => expect(course.modules).toHaveLength(0));
});

it('stays locked until the company has bought a course; R&D asks the owner to buy one', async () => {
  serve([], {
    purchased: false, canView: false, canEdit: false,
    reason: 'Tùy chỉnh khóa học mở khi công ty đã mua ít nhất 1 khóa học. Các khóa Cơ bản miễn phí vẫn học bình thường.',
  });
  renderPage();

  expect(await screen.findByText(/mua ít nhất 1 khóa học/)).toBeInTheDocument();
  expect(screen.getByText('Nhờ chủ doanh nghiệp mua khóa học để mở phần này.')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Mua khóa học/ })).toBeNull();
  expect(screen.queryByText('Không tải được dữ liệu R&D.')).toBeNull();
});

it('lets the owner of a company with R&D only view what R&D did', async () => {
  serve([], { inCharge: 'RND', researchers: 2, canEdit: false });
  renderPage();

  expect(await screen.findByText(/Công ty đã có R&D \(2 tài khoản\)/)).toBeInTheDocument();
  await screen.findByText('Đang dùng bản chuẩn');
  expect(screen.queryByRole('button', { name: /Áp dụng cho doanh nghiệp/ })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Lưu nháp' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Thêm mô đun' })).toBeNull();
  expect(screen.getByRole('textbox', { name: 'Mục tiêu học tập của doanh nghiệp' })).toBeDisabled();
});
