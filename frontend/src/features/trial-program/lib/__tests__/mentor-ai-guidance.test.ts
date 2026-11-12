import { describe, expect, it } from 'vitest';
import type { PulseCriterion, PulseFinalReviewItem } from '@/services/pulse.service';
import {
  buildEssayGuidance,
  computeRubricStats,
  detectPromptCopy,
  ESSAY_PASS_SCORE_PERCENT,
  resolveEffectiveCriteria,
  type RubricCriterionEvaluation,
} from '../mentor-ai-guidance';

const WEIGHTED_RUBRIC: PulseCriterion[] = [
  {
    number: '01',
    title: 'Nguồn & bối cảnh công việc thực tế',
    description: 'Nêu rõ hệ thống, tệp hoặc tài liệu nguồn gắn với công việc.',
    weightPercent: 20,
    isRequired: false,
  },
  {
    number: '02',
    title: 'Quy trình thực hiện & kiểm chứng',
    description: 'Mô tả thao tác hoặc phép tính người khác kiểm tra lại được.',
    weightPercent: 20,
    isRequired: false,
  },
  {
    number: '03',
    title: 'Kết luận & bước tiếp theo',
    description: 'Nêu kết luận từ số liệu kiểm chứng và hành động bàn giao.',
    weightPercent: 20,
    isRequired: false,
  },
  {
    number: '04',
    title: 'Truy xuất nguồn chéo & chuẩn hóa dữ liệu nhiều nguồn',
    description: 'Đối chiếu ít nhất 2 nguồn dữ liệu và xử lý bản ghi lệch hoặc trùng.',
    weightPercent: 40,
    isRequired: true,
  },
];

function makeWeightedRows(
  statuses: [RubricCriterionEvaluation['status'], RubricCriterionEvaluation['status'], RubricCriterionEvaluation['status'], RubricCriterionEvaluation['status']],
): RubricCriterionEvaluation[] {
  return WEIGHTED_RUBRIC.map((c, idx) => ({
    number: c.number,
    title: c.title,
    description: c.description,
    weightPercent: c.weightPercent,
    isRequired: c.isRequired,
    status: statuses[idx],
    note: '',
  }));
}

function makeReviewItem(evidenceText: string, overrides: Partial<PulseFinalReviewItem> = {}): PulseFinalReviewItem {
  return {
    kind: 'FINAL',
    submissionId: 'sub-1',
    status: 'PENDING',
    employeeId: 'emp-1',
    employeeName: 'Lê Hoàng Long',
    organizationId: 'org-1',
    organizationName: 'DigiTalent Demo Company',
    departmentName: 'Sale',
    positionName: 'Sales / CRM',
    courseId: 'course-1',
    courseCode: 'M1-A',
    courseTitle: 'Phân tích thông tin và quản trị dữ liệu',
    domainName: 'Khai thác dữ liệu và thông tin',
    tier: 3,
    attemptNo: 1,
    maxAttempts: 2,
    rubric: WEIGHTED_RUBRIC,
    assignment: {
      title: 'Chuẩn hóa dữ liệu CRM',
      promptHtml:
        '<p>Mô tả một nhiệm vụ thực tế của vị trí Sales / CRM thuộc lĩnh vực khai thác dữ liệu và thông tin: nêu nguồn, hành động hoặc phép tính người khác kiểm tra lại được, kết luận và bước tiếp theo.</p>',
      criteria: WEIGHTED_RUBRIC.map((c) => c.title),
    },
    aiHint: {
      source: 'GEMINI',
      model: 'gemini-2.5-flash',
      checks: [true, true, true, true],
      summary: 'Bài viết đủ cấu trúc.',
      detail: {
        plagiarismScore: 10,
        plagiarismNote: 'Không sao chép.',
        aiGeneratedScore: 15,
        aiGeneratedNote: 'Tự nhiên.',
        relevanceScore: 85,
        relevanceNote: 'Đúng trọng tâm.',
        depthScore: 80,
        depthNote: 'Có dẫn chứng.',
        clarityScore: 85,
        clarityNote: 'Mạch lạc.',
        verdict: 'Đạt chuẩn.',
      },
      fraud: null,
    },
    attempts: [
      {
        submissionId: 'sub-1',
        attemptNo: 1,
        evidenceText,
        submittedAt: '2026-11-05T13:08:00Z',
        choice: { score: 8, total: 10, passMark: 7, passed: true },
      },
    ],
    ...overrides,
  };
}

describe('detectPromptCopy', () => {
  it('flags exact prompt copy and canonical task prompt stems', () => {
    const demoCopiedPrompt =
      'Mô tả một nhiệm vụ thực tế của vị trí Sales / CRM thuộc lĩnh vực khai thác dữ liệu và thông tin: nêu nguồn, hành động hoặc phép tính người khác kiểm tra lại được, kết luận và bước tiếp theo.';
    expect(detectPromptCopy(demoCopiedPrompt)).toBe(true);
    expect(detectPromptCopy(demoCopiedPrompt, `<p>${demoCopiedPrompt}</p>`)).toBe(true);
  });

  it('flags verbatim copy of an explicit custom assignment prompt', () => {
    const promptHtml =
      '<p>Đối chiếu bảng chấm công tháng 10 trên hệ thống HRIS với file duyệt tăng ca của quản lý bộ phận và báo cáo chênh lệch.</p>';
    const copied =
      'Đối chiếu bảng chấm công tháng 10 trên hệ thống HRIS với file duyệt tăng ca của quản lý bộ phận và báo cáo chênh lệch.';
    expect(detectPromptCopy(copied, promptHtml)).toBe(true);
  });

  it('allows authentic workplace essay responses with real sources and checks', () => {
    const authenticEssay =
      'Từ file xuất HubSpot CRM quý 3 (2.450 khách hàng) đối chiếu với bảng doanh thu kế toán ERP MISA, tôi lọc 42 mã số thuế bị trùng bằng hàm COUNTIFS và Pivot Table, xác định lệch 18,5 triệu đồng do đơn hủy chưa đồng bộ, đồng thời chuẩn hóa khóa MST để bàn giao tổ vận hành.';
    expect(detectPromptCopy(authenticEssay)).toBe(false);
  });
});

describe('computeRubricStats (Option 1 weighted rubric & gate)', () => {
  it('passes at 80% when non-gate criterion 03 fails while gate passes (>= 70%)', () => {
    const stats = computeRubricStats(makeWeightedRows(['PASS', 'PASS', 'FAIL', 'PASS']), true);
    expect(stats.scorePercent).toBe(80);
    expect(stats.gateFailed).toBe(false);
    expect(stats.passThresholdPercent).toBe(ESSAY_PASS_SCORE_PERCENT);
    expect(stats.recommendedDecision).toBe('PASSED');
  });

  it('passes at exact 70% threshold (all 3 non-gate partial = 30%, gate pass = 40%)', () => {
    const stats = computeRubricStats(
      makeWeightedRows(['PARTIAL', 'PARTIAL', 'PARTIAL', 'PASS']),
      true,
    );
    expect(stats.scorePercent).toBe(70);
    expect(stats.gateFailed).toBe(false);
    expect(stats.recommendedDecision).toBe('PASSED');
  });

  it('recommends NOT_YET below 70% even when gate passes (60%)', () => {
    const stats = computeRubricStats(makeWeightedRows(['PASS', 'FAIL', 'FAIL', 'PASS']), true);
    expect(stats.scorePercent).toBe(60);
    expect(stats.gateFailed).toBe(false);
    expect(stats.recommendedDecision).toBe('NOT_YET');
  });

  it('blocks PASSED via gateFailed even when 3 other criteria pass (60%) or equal weights >= 70%', () => {
    const blockedGateStats = computeRubricStats(
      makeWeightedRows(['PASS', 'PASS', 'PASS', 'FAIL']),
      true,
    );
    expect(blockedGateStats.scorePercent).toBe(60);
    expect(blockedGateStats.gateFailed).toBe(true);
    expect(blockedGateStats.recommendedDecision).toBe('NOT_YET');

    const heavyPassWithFailedGate: RubricCriterionEvaluation[] = [
      { number: '01', title: 'C1', description: '', weightPercent: 40, isRequired: false, status: 'PASS', note: '' },
      { number: '02', title: 'C2', description: '', weightPercent: 40, isRequired: false, status: 'PASS', note: '' },
      { number: '03', title: 'Gate', description: '', weightPercent: 20, isRequired: true, status: 'FAIL', note: '' },
    ];
    const stats = computeRubricStats(heavyPassWithFailedGate, true);
    expect(stats.scorePercent).toBe(80);
    expect(stats.gateFailed).toBe(true);
    expect(stats.recommendedDecision).toBe('NOT_YET');
  });
});

describe('buildEssayGuidance & resolveEffectiveCriteria', () => {
  it('prefers item.rubric with weights and gate over queue fallback criteria', () => {
    const item = makeReviewItem('Nội dung đủ chi tiết.');
    const resolved = resolveEffectiveCriteria(item, []);
    expect(resolved).toHaveLength(4);
    expect(resolved[3]?.weightPercent).toBe(40);
    expect(resolved[3]?.isRequired).toBe(true);
  });

  it('overrides checks and suggests NOT_YET when essay copies the prompt', () => {
    const copiedItem = makeReviewItem(
      'Mô tả một nhiệm vụ thực tế của vị trí Sales / CRM thuộc lĩnh vực khai thác dữ liệu và thông tin: nêu nguồn, hành động hoặc phép tính người khác kiểm tra lại được, kết luận và bước tiếp theo.',
    );
    const report = buildEssayGuidance(copiedItem, []);
    expect(report.isPromptCopy).toBe(true);
    expect(report.suggestedDecision).toBe('NOT_YET');
    expect(report.verdictTitle).toContain('lặp lại nội dung đề bài');
    expect(report.criteriaStatus.every((c) => c.met === false)).toBe(true);
  });
});
