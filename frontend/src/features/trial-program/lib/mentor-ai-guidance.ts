import type {
  PulseChoiceResult,
  PulseCriterion,
  PulseDecision,
  PulseFinalReviewItem,
} from '@/services/pulse.service';
import { detectPromptCopy } from '@/lib/pulse-prompt-guard';

export { detectPromptCopy };
export const ESSAY_PASS_SCORE_PERCENT = 70;

export interface EssayGuidanceSignal {
  tone: 'ok' | 'warn' | 'bad';
  label: string;
  detail: string;
}

export interface CriterionCheckItem {
  number: string;
  title: string;
  description: string;
  weightPercent?: number;
  isRequired?: boolean;
  met: boolean | null;
  aiNote?: string | null;
}

export interface EssayGuidanceReport {
  mode: 'GEMINI' | 'HEURISTIC';
  model: string | null;
  wordCount: number;
  charCount: number;
  paragraphCount: number;
  isPromptCopy: boolean;
  promptCopyNote: string | null;
  criteriaStatus: CriterionCheckItem[];
  signals: EssayGuidanceSignal[];
  summaryText: string;
  suggestedDecision: PulseDecision | null;
  verdictTitle: string;
  draftFeedback: string;
}

export type RubricStatus = 'PASS' | 'PARTIAL' | 'FAIL';

export interface RubricCriterionEvaluation {
  number: string;
  title: string;
  description: string;
  weightPercent?: number;
  isRequired?: boolean;
  status: RubricStatus | null;
  note: string;
}

export interface RubricSummaryStats {
  total: number;
  ratedCount: number;
  passCount: number;
  partialCount: number;
  failCount: number;
  scorePercent: number;
  hasWeights: boolean;
  hasRequiredCriterion: boolean;
  gateFailed: boolean;
  passThresholdPercent: number;
  allRated: boolean;
  recommendedDecision: PulseDecision | null;
}

export const RUBRIC_QUICK_NOTES: Record<RubricStatus, string[]> = {
  PASS: ['Nêu rõ nguồn và bước làm', 'Có số liệu đối chiếu cụ thể'],
  PARTIAL: ['Đúng hướng nhưng thiếu số liệu', 'Cần giải thích cách kiểm tra lại'],
  FAIL: ['Chưa vào đúng trọng tâm đề', 'Chỉ lặp lại câu hỏi đề bài'],
};

const DEFAULT_FALLBACK_CRITERIA: PulseCriterion[] = [
  {
    number: '01',
    title: 'Nguồn có thể truy vết',
    description: 'Xác định được nguồn hoặc bối cảnh của công việc.',
  },
  {
    number: '02',
    title: 'Hành động có thể kiểm tra',
    description: 'Người khác kiểm tra lại được thao tác hoặc phép tính.',
  },
  {
    number: '03',
    title: 'Kết luận có căn cứ',
    description: 'Kết luận và bước tiếp theo dựa trên minh chứng.',
  },
];

const STATUS_LABEL_VI: Record<RubricStatus, string> = {
  PASS: 'Đạt',
  PARTIAL: 'Đạt một phần',
  FAIL: 'Chưa đạt',
};

/** Rút gọn mã doanh nghiệp tự sinh dạng UUID để thẻ hiển thị gọn gàng, vẫn giữ nguyên mã gốc trong tooltip và tìm kiếm. */
export function formatShortOrgCode(code: string): string {
  const trialMatch = /^TRIAL-([a-f0-9]{12,})$/i.exec(code.trim());
  if (trialMatch) {
    return `TRIAL-${trialMatch[1]!.slice(0, 6).toUpperCase()}`;
  }
  return code;
}

export function countEssayStats(text: string): {
  wordCount: number;
  charCount: number;
  paragraphCount: number;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { wordCount: 0, charCount: 0, paragraphCount: 0 };
  }
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const paragraphCount = trimmed.split(/\n+/).filter((line) => line.trim().length > 0).length;
  return {
    wordCount,
    charCount: trimmed.length,
    paragraphCount,
  };
}

/** Chọn danh sách tiêu chí hiệu lực để vừa chấm chi tiết vừa khớp số tiêu chí AI phân tích. */
export function resolveEffectiveCriteria(
  item: PulseFinalReviewItem,
  queueCriteria: PulseCriterion[],
): PulseCriterion[] {
  if (item.rubric && item.rubric.length > 0) {
    return item.rubric.map((c, idx) => ({
      number: c.number || String(idx + 1).padStart(2, '0'),
      title: c.title,
      description: c.description,
      weightPercent: c.weightPercent,
      isRequired: c.isRequired,
    }));
  }

  const assignmentCriteria = (item.assignment?.criteria ?? [])
    .map((c) => c.trim())
    .filter(Boolean);
  const byTitle = new Map(queueCriteria.map((c) => [c.title.trim().toLowerCase(), c]));
  const checksLen = item.aiHint?.checks?.length ?? 0;

  if (assignmentCriteria.length > 0) {
    if (
      queueCriteria.length === 0 ||
      checksLen === 0 ||
      assignmentCriteria.length === checksLen ||
      assignmentCriteria.length === queueCriteria.length
    ) {
      return assignmentCriteria.map((title, idx) => {
        const matched = byTitle.get(title.toLowerCase()) ?? queueCriteria[idx];
        return {
          number: matched?.number || String(idx + 1).padStart(2, '0'),
          title,
          description: matched?.description || '',
          weightPercent: matched?.weightPercent,
          isRequired: matched?.isRequired,
        };
      });
    }
  }

  if (queueCriteria.length > 0) {
    return queueCriteria;
  }

  return DEFAULT_FALLBACK_CRITERIA;
}

export function computeRubricStats(
  rows: RubricCriterionEvaluation[],
  choicePassed: boolean | null,
): RubricSummaryStats {
  const total = rows.length;
  const rated = rows.filter((r) => r.status !== null);
  const passCount = rows.filter((r) => r.status === 'PASS').length;
  const partialCount = rows.filter((r) => r.status === 'PARTIAL').length;
  const failCount = rows.filter((r) => r.status === 'FAIL').length;
  const hasWeights = rows.some((r) => (r.weightPercent ?? 0) > 0);
  const hasRequiredCriterion = rows.some((r) => Boolean(r.isRequired));
  const gateFailed = rows.some((r) => Boolean(r.isRequired) && r.status === 'FAIL');

  let scorePercent = 0;
  if (hasWeights) {
    let totalWeight = 0;
    let earnedWeight = 0;
    for (const r of rows) {
      const w = Math.max(0, r.weightPercent ?? 0);
      if (w <= 0) continue;
      totalWeight += w;
      if (r.status === 'PASS') earnedWeight += w;
      else if (r.status === 'PARTIAL') earnedWeight += w * 0.5;
    }
    scorePercent = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  } else {
    const points = passCount * 1 + partialCount * 0.5;
    scorePercent = total > 0 ? Math.round((points / total) * 100) : 0;
  }

  const allRated = total > 0 && rated.length === total;

  let recommendedDecision: PulseDecision | null = null;
  if (choicePassed === false || gateFailed) {
    recommendedDecision = 'NOT_YET';
  } else if (allRated) {
    if (hasWeights || hasRequiredCriterion) {
      recommendedDecision =
        !gateFailed && scorePercent >= ESSAY_PASS_SCORE_PERCENT ? 'PASSED' : 'NOT_YET';
    } else {
      recommendedDecision =
        failCount === 0 && scorePercent >= ESSAY_PASS_SCORE_PERCENT ? 'PASSED' : 'NOT_YET';
    }
  }

  return {
    total,
    ratedCount: rated.length,
    passCount,
    partialCount,
    failCount,
    scorePercent,
    hasWeights,
    hasRequiredCriterion,
    gateFailed,
    passThresholdPercent: ESSAY_PASS_SCORE_PERCENT,
    allRated,
    recommendedDecision,
  };
}

export function compileRubricFeedback(params: {
  rows: RubricCriterionEvaluation[];
  decision?: PulseDecision | '';
  choice?: PulseChoiceResult | null;
}): string {
  const { rows, decision = '', choice } = params;
  const stats = computeRubricStats(rows, choice ? choice.passed : null);
  if (stats.ratedCount === 0) return '';

  const lines: string[] = [
    `Đánh giá tự luận (${stats.scorePercent}% · ${stats.passCount}/${stats.total} tiêu chí đạt):`,
  ];

  for (const row of rows) {
    if (!row.status) continue;
    const statusLabel = STATUS_LABEL_VI[row.status];
    const trimmedNote = row.note.trim();
    lines.push(
      trimmedNote
        ? `- Tiêu chí ${row.number} (${row.title}): ${statusLabel}. ${trimmedNote}`
        : `- Tiêu chí ${row.number} (${row.title}): ${statusLabel}.`,
    );
  }

  if (choice && !choice.passed) {
    lines.push(
      `Phần trắc nghiệm đúng ${choice.score}/${choice.total} câu (cần từ ${choice.passMark} câu) nên chưa đủ điều kiện công nhận.`,
    );
  } else if (stats.gateFailed) {
    lines.push('Chưa đạt tiêu chí bắt buộc (Gate) nên chưa đủ điều kiện công nhận.');
  } else if (stats.hasWeights && stats.allRated && stats.scorePercent < ESSAY_PASS_SCORE_PERCENT) {
    lines.push(
      `Tổng điểm trọng số đạt ${stats.scorePercent}% (cần tối thiểu ${ESSAY_PASS_SCORE_PERCENT}%). Cần bổ sung dẫn chứng trước khi nộp lại.`,
    );
  } else if (decision === 'NOT_YET' || stats.recommendedDecision === 'NOT_YET') {
    lines.push('Cần bổ sung rõ dẫn chứng ở các tiêu chí chưa đạt trước khi nộp lại.');
  } else if (decision === 'PASSED' || stats.recommendedDecision === 'PASSED') {
    lines.push('Minh chứng thực hành và phần trắc nghiệm đáp ứng chuẩn cấp độ khóa học.');
  }

  return lines.join('\n');
}

export function buildEssayGuidance(
  item: PulseFinalReviewItem,
  criteriaList: PulseCriterion[],
): EssayGuidanceReport {
  const latest = item.attempts?.[item.attempts.length - 1];
  const rawText = latest?.evidenceText ?? '';
  const { wordCount, charCount, paragraphCount } = countEssayStats(rawText);
  const isPromptCopy = detectPromptCopy(rawText, item.assignment?.promptHtml);
  const promptCopyNote = isPromptCopy
    ? 'Nội dung tự luận đang lặp lại câu chữ của đề bài, chưa có tình huống công việc thực tế và dẫn chứng kiểm chứng.'
    : null;

  const checks = item.aiHint?.checks ?? [];
  const criterionNotes = item.aiHint?.criterionNotes ?? [];
  const detail = item.aiHint?.detail ?? null;
  const mode: 'GEMINI' | 'HEURISTIC' =
    item.aiHint?.source === 'GEMINI' || Boolean(detail) ? 'GEMINI' : 'HEURISTIC';
  const model = mode === 'GEMINI' ? (item.aiHint?.model ?? null) : null;

  const effectiveCriteria = resolveEffectiveCriteria(item, criteriaList);
  const criteriaStatus: CriterionCheckItem[] = effectiveCriteria.map((c, idx) => ({
    number: c.number || String(idx + 1).padStart(2, '0'),
    title: c.title,
    description: c.description,
    weightPercent: c.weightPercent,
    isRequired: c.isRequired,
    met: isPromptCopy ? false : typeof checks[idx] === 'boolean' ? checks[idx]! : null,
    aiNote: isPromptCopy
      ? 'Bài nộp lặp lại đề bài nên chưa tính đạt tiêu chí này.'
      : criterionNotes[idx]?.trim()
        ? criterionNotes[idx]!.trim()
        : null,
  }));

  const missingCriteria = criteriaStatus.filter((c) => c.met === false);
  const gateFailedInAi = criteriaStatus.some((c) => Boolean(c.isRequired) && c.met === false);
  const choice = latest?.choice ?? null;
  const choiceFails = Boolean(choice && !choice.passed);
  const risk = item.recording?.risk ?? null;
  const flaggedEvents = item.recording?.flaggedCount ?? 0;

  const signals: EssayGuidanceSignal[] = [];

  if (wordCount === 0) {
    signals.push({
      tone: 'bad',
      label: 'Chưa có nội dung tự luận',
      detail: 'Nhân viên chưa nhập phần minh chứng thực hành cho đề bài.',
    });
  } else if (isPromptCopy) {
    signals.push({
      tone: 'bad',
      label: 'Lặp lại nội dung đề bài',
      detail: 'Bài làm chép lại đề bài thay vì nêu tình huống thực tế và kết quả kiểm chứng.',
    });
  } else if (wordCount < 20) {
    signals.push({
      tone: 'warn',
      label: `Bài viết còn ngắn (${wordCount} từ)`,
      detail: 'Kiểm tra kỹ xem nhân viên đã giải thích đủ thao tác và dẫn chứng chưa.',
    });
  } else {
    signals.push({
      tone: 'ok',
      label: `Dung lượng ${wordCount} từ (${paragraphCount} đoạn)`,
      detail: 'Đối chiếu từng đoạn bài làm với đề bài và bảng tiêu chí bên dưới.',
    });
  }

  if (mode === 'GEMINI' && checks.length > 0 && criteriaStatus.length > 0 && !isPromptCopy) {
    if (missingCriteria.length === 0) {
      signals.push({
        tone: 'ok',
        label: `Gợi ý sơ bộ: đạt ${criteriaStatus.length}/${criteriaStatus.length} tiêu chí`,
        detail: 'Xem giải thích cụ thể ở từng tiêu chí trong bảng chấm chi tiết.',
      });
    } else {
      signals.push({
        tone: 'warn',
        label: `Gợi ý sơ bộ: thiếu ${missingCriteria.length} tiêu chí`,
        detail: `Cần xem kỹ: ${missingCriteria.map((c) => c.title).join(', ')}.`,
      });
    }
  } else if (mode === 'HEURISTIC') {
    signals.push({
      tone: 'warn',
      label: 'Chế độ đối chiếu từ khóa',
      detail: 'Hệ thống đang đối chiếu theo từ khóa cơ bản, mentor cần đọc kỹ minh chứng thực tế.',
    });
  }

  if (choice) {
    if (choiceFails) {
      signals.push({
        tone: 'bad',
        label: `Trắc nghiệm chưa đạt (${choice.score}/${choice.total} câu)`,
        detail: `Cần đúng tối thiểu ${choice.passMark} câu. Theo quy chế chỉ có thể ghi Chưa đạt.`,
      });
    } else {
      signals.push({
        tone: 'ok',
        label: `Trắc nghiệm đạt (${choice.score}/${choice.total} câu)`,
        detail: `Đạt ngưỡng tối thiểu ${choice.passMark} câu của khóa học.`,
      });
    }
  }

  if (risk && risk.level !== 'LOW') {
    signals.push({
      tone: 'warn',
      label: `Giám sát cần lưu ý (${risk.score}/100)`,
      detail: `Có ${risk.moments.length} mốc đáng chú ý trong tab Video giám sát.`,
    });
  } else if (flaggedEvents > 0) {
    signals.push({
      tone: 'warn',
      label: `${flaggedEvents} sự kiện giám sát`,
      detail: 'Mở tab Video giám sát để kiểm tra nhanh các mốc đã đánh dấu.',
    });
  } else if (item.recording) {
    signals.push({
      tone: 'ok',
      label: risk ? `Giám sát ổn định (${risk.score}/100)` : 'Có đủ bản ghi giám sát',
      detail: 'Không ghi nhận dấu hiệu bất thường đáng kể trong phiên làm bài.',
    });
  }

  let suggestedDecision: PulseDecision | null = null;
  let verdictTitle = 'Đối chiếu trực tiếp đề bài và từng tiêu chí';
  let draftFeedback = '';

  if (choiceFails) {
    suggestedDecision = 'NOT_YET';
    verdictTitle = 'Cảnh báo: Chưa đạt ngưỡng trắc nghiệm';
    const essayGap =
      isPromptCopy
        ? ' Phần tự luận đang lặp lại câu chữ đề bài, chưa có tình huống thực tế.'
        : missingCriteria.length > 0
          ? ` Về phần tự luận, cần bổ sung rõ ${missingCriteria.map((c) => c.title.toLowerCase()).join(', ')}.`
          : '';
    draftFeedback = `Phần trắc nghiệm đúng ${choice!.score}/${choice!.total} câu, chưa đạt mức tối thiểu ${choice!.passMark} câu nên chưa đủ điều kiện công nhận.${essayGap} Cần ôn lại kiến thức mô đun trước khi làm lần tiếp theo.`;
  } else if (wordCount === 0) {
    suggestedDecision = 'NOT_YET';
    verdictTitle = 'Cảnh báo: Thiếu phần tự luận';
    draftFeedback =
      'Bài nộp chưa có phần minh chứng tự luận theo yêu cầu đề bài. Cần trình bày rõ nguồn dữ liệu, bước kiểm tra và kết luận hành động.';
  } else if (isPromptCopy) {
    suggestedDecision = 'NOT_YET';
    verdictTitle = 'Cảnh báo: Bài nộp lặp lại nội dung đề bài';
    draftFeedback =
      'Bài làm đang lặp lại câu chữ của đề bài, chưa nêu tình huống công việc thực tế, nguồn dữ liệu và kết quả bạn đã kiểm chứng. Hãy mô tả chi tiết công việc thực tế trước khi nộp lại.';
  } else if (mode === 'GEMINI' && detail) {
    const geminiLooksStrong =
      !gateFailedInAi &&
      detail.relevanceScore >= 65 &&
      detail.depthScore >= 60 &&
      detail.clarityScore >= 60 &&
      detail.plagiarismScore < 50;
    suggestedDecision = geminiLooksStrong ? 'PASSED' : 'NOT_YET';
    verdictTitle = geminiLooksStrong
      ? 'Đánh giá tự động: Bám sát các tiêu chí chính'
      : 'Đánh giá tự động: Cần xem kỹ độ sâu minh chứng';
    const baseVerdict = detail.verdict?.trim();
    if (baseVerdict) {
      draftFeedback = baseVerdict;
    } else if (geminiLooksStrong) {
      draftFeedback =
        'Bài làm bám sát yêu cầu đề bài, có minh chứng cụ thể, lập luận mạch lạc và đáp ứng chuẩn cấp độ khóa học.';
    } else {
      draftFeedback =
        'Bài làm cần bổ sung thêm số liệu kiểm chứng cụ thể và giải thích rõ bước xử lý thực tế để đạt chuẩn.';
    }
  } else if (mode === 'GEMINI') {
    const allMet = checks.length > 0 && missingCriteria.length === 0 && !gateFailedInAi;
    suggestedDecision = allMet ? 'PASSED' : 'NOT_YET';
    verdictTitle = allMet
      ? 'Đánh giá tự động: Đủ các tiêu chí chính'
      : 'Đánh giá tự động: Thiếu minh chứng ở một số tiêu chí';
    draftFeedback =
      item.aiHint?.summary ||
      'Kiểm tra từng tiêu chí bên dưới và bổ sung nhận xét cụ thể gửi nhân viên.';
  } else {
    const keywordMatchedAll =
      checks.length > 0 && missingCriteria.length === 0 && !gateFailedInAi && wordCount >= 20;
    suggestedDecision = keywordMatchedAll ? 'PASSED' : 'NOT_YET';
    verdictTitle = 'Đang phân tích theo từ khóa chuẩn';
    draftFeedback = keywordMatchedAll
      ? 'Bộ lọc từ khóa thấy bài viết có từ gợi ý về nguồn, thao tác kiểm tra và bước tiếp theo. Mentor kiểm tra lại bài thực tế để xác nhận.'
      : 'Bộ lọc từ khóa chưa thấy đủ dẫn chứng theo tiêu chí. Mentor đọc bài đối chiếu đề và chấm chi tiết từng tiêu chí bên dưới.';
  }

  const summaryText = isPromptCopy
    ? 'Bài nộp lặp lại nội dung đề bài, chưa có minh chứng công việc thực tế.'
    : mode === 'GEMINI'
      ? item.aiHint?.summary || 'Hệ thống đã đối chiếu bài nộp với đề bài và từng tiêu chí.'
      : 'Hệ thống hiện dùng bộ lọc từ khóa chuẩn để đối chiếu. Mentor đối chiếu đề bài và chấm từng tiêu chí ở bảng dưới.';

  return {
    mode,
    model,
    wordCount,
    charCount,
    paragraphCount,
    isPromptCopy,
    promptCopyNote,
    criteriaStatus,
    signals,
    summaryText,
    suggestedDecision,
    verdictTitle,
    draftFeedback,
  };
}
