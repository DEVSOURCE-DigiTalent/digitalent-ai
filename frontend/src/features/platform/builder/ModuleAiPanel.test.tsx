import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { contentAiService, type ModuleContentCheck } from '@/services/content-ai.service';
import type { CatalogCourseDetail, CatalogModule } from '@/services/platform-catalog.service';
import { CourseBuilderServiceContext, type CourseBuilderService } from './course-builder-service';
import { BlockAiNote, ModuleAiPanel, QuestionAiFlag, moduleAiInput, useModuleAi } from './ModuleAiPanel';

const module = {
  moduleId: 'm2', index: 1, title: 'Xác định nhu cầu',
  blocks: [
    { blockId: 'b1', index: 0, type: 'TEXT', bodyHtml: '<p>Bài 1</p>', asset: null, caption: null, altText: null, items: [] },
    { blockId: 'b2', index: 1, type: 'IMAGE', bodyHtml: null, asset: null, caption: null, altText: null, items: [] },
  ],
  questions: [{ questionId: 'q1', text: 'Câu có sẵn?', options: [{ optionId: 'o1', text: 'A', isCorrect: true }, { optionId: 'o2', text: 'B', isCorrect: false }] }],
} as unknown as CatalogModule;
const course = { code: 'M5-I', modules: [module] } as unknown as CatalogCourseDetail;
const competency = {
  code: '5.2', name: 'Xác định nhu cầu và giải pháp công nghệ', levelName: 'Trung cấp', bac: '3–4',
  outcomes: [{ id: '5.2-b3-1', bac: 3, text: 'Lựa chọn công cụ số' }, { id: '5.2-b3-2', bac: 3, text: 'Tùy chỉnh môi trường số' }],
};
const checkResult: ModuleContentCheck = {
  competencies: [competency], verdict: 'CAN_SUA', summary: 'Thiếu ví dụ thực tế.',
  outcomes: [
    { id: '5.2-b3-1', competencyCode: '5.2', bac: 3, text: 'Lựa chọn công cụ số', status: 'MET', evidence: 'có so sánh hai công cụ' },
    { id: '5.2-b3-2', competencyCode: '5.2', bac: 3, text: 'Tùy chỉnh môi trường số', status: 'MISSING', evidence: null },
  ],
  pages: [{ number: 1, status: 'PROBLEM', covers: ['5.2-b3-1'], notes: ['Chưa có ví dụ chọn phần mềm.'] }],
  issues: [{ kind: 'THIEU_VI_DU', detail: 'Không có ví dụ nơi làm việc.' }],
  questionProblems: [{ number: 1, problem: 'Hai đáp án cùng đúng.' }],
  suggestions: ['Thêm ví dụ chọn phần mềm bán hàng.'],
};

function Harness() {
  const edit = (fn: (v: number, c: string) => Promise<CatalogCourseDetail>) => fn(1, 'c1');
  const ai = useModuleAi(course, module, edit);
  return (
    <>
      <ModuleAiPanel ai={ai} editable moduleId={module.moduleId} />
      {module.blocks.map((b) => <BlockAiNote key={b.blockId} ai={ai} block={b} editable />)}
      {module.questions.map((q) => ai.questionFlags.get(q.questionId) && <QuestionAiFlag key={q.questionId} problem={ai.questionFlags.get(q.questionId)!} />)}
    </>
  );
}

function renderPanel(service: Partial<CourseBuilderService> = {}) {
  render(
    <CourseBuilderServiceContext.Provider value={service as CourseBuilderService}>
      <Harness />
    </CourseBuilderServiceContext.Provider>,
  );
}

describe('ModuleAiPanel', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sends the text pages and the questions of the module with its course code and position', () => {
    expect(moduleAiInput(course, module)).toEqual({
      courseCode: 'M5-I', moduleIndex: 1, moduleTitle: 'Xác định nhu cầu',
      lessons: [{ html: '<p>Bài 1</p>' }],
      questions: [{ text: 'Câu có sẵn?', options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }] }],
    });
  });

  it('marks the page and the question the AI found wrong, right under them', async () => {
    vi.spyOn(contentAiService, 'check').mockResolvedValue(checkResult);
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra theo Thông tư' }));
    const note = await screen.findByLabelText('AI nhận xét trang 1');
    expect(note).toHaveTextContent('AI · Trang 1: Cần sửa');
    expect(note).toHaveTextContent('Chưa có ví dụ chọn phần mềm.');
    expect(note).toHaveTextContent('Đáp ứng: Bậc 3 · Lựa chọn công cụ số');
    expect(screen.getByText('Hai đáp án cùng đúng.')).toBeInTheDocument();
    const result = screen.getByLabelText('Kết quả kiểm tra');
    expect(result).toHaveTextContent('Cần sửa');
    expect(result).toHaveTextContent('1 trang cần xem lại, 1 câu hỏi cần sửa');
    expect(screen.getByRole('button', { name: 'Kiểm tra lại' })).toBeInTheDocument();
  });

  it('rewrites one page and replaces it only when the author keeps the new version', async () => {
    vi.spyOn(contentAiService, 'check').mockResolvedValue(checkResult);
    const rewrite = vi.spyOn(contentAiService, 'rewritePage').mockResolvedValue({
      pageNumber: 1, title: 'Trang 1: Chọn phần mềm', html: '<p>Bản mới có ví dụ</p>', covers: [], note: 'Đã thêm ví dụ.',
    });
    const updateBlock = vi.fn().mockResolvedValue(course);
    renderPanel({ updateBlock });
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra theo Thông tư' }));
    const note = await screen.findByLabelText('AI nhận xét trang 1');
    fireEvent.click(within(note).getByRole('button', { name: 'Viết lại bằng AI' }));
    await within(note).findByText('Bản mới có ví dụ');
    expect(rewrite).toHaveBeenCalledWith(expect.objectContaining({ pageNumber: 1, notes: ['Chưa có ví dụ chọn phần mềm.'] }));
    expect(within(note).getByText(/Bản AI viết lại: Chọn phần mềm/)).toBeInTheDocument();
    expect(updateBlock).not.toHaveBeenCalled();
    fireEvent.click(within(note).getByRole('button', { name: 'Thay trang này bằng bản AI' }));
    await waitFor(() => expect(updateBlock).toHaveBeenCalledWith(1, 'c1', 'b1', { bodyHtml: '<p>Bản mới có ví dụ</p>' }));
    expect(await screen.findByText(/Đã thay trang bằng bản AI/)).toBeInTheDocument();
  });

  it('adds a suggested question to the module only when the author asks', async () => {
    vi.spyOn(contentAiService, 'suggest').mockResolvedValue({
      competencies: [competency], lessons: [],
      questions: [{ text: 'Câu gợi ý?', options: [{ text: 'Đúng', isCorrect: true }, { text: 'Sai', isCorrect: false }], explanation: 'Vì…' }],
    });
    const addQuestion = vi.fn().mockResolvedValue(course);
    renderPanel({ addQuestion });
    fireEvent.click(screen.getByRole('button', { name: 'Gợi ý bằng AI' }));
    const result = await screen.findByLabelText('Gợi ý của AI');
    expect(addQuestion).not.toHaveBeenCalled();
    fireEvent.click(within(result).getByRole('button', { name: 'Thêm vào câu hỏi ôn tập' }));
    await waitFor(() => expect(addQuestion).toHaveBeenCalledWith(1, 'c1', 'm2', {
      text: 'Câu gợi ý?', explanation: 'Vì…', options: [{ text: 'Đúng', isCorrect: true }, { text: 'Sai', isCorrect: false }],
    }));
    expect(await within(result).findByRole('button', { name: 'Đã thêm' })).toBeDisabled();
  });
});
