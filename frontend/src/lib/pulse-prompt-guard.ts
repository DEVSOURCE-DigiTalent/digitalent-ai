const CANONICAL_PROMPT_STEMS = [
  'mo ta mot nhiem vu thuc te',
  'nguoi khac kiem tra lai duoc',
  'neu nguon hanh dong hoac phep tinh',
  'neu ro nguon du lieu hanh dong hoac phep tinh',
  'trong vi tri cua ban co dung nang luc',
  'thuc hien bai danh gia de chung minh',
];

const CANONICAL_PROMPT_TOKENS = new Set(
  [
    'mo ta mot nhiem vu thuc te cua vi tri trong ban co dung nang luc thuoc linh vuc',
    'neu ro nguon du lieu hanh dong hoac phep tinh nguoi khac kiem tra lai duoc',
    'ket luan va buoc tiep theo o muc do co ban trung cap nang cao hien tai',
    'khai thac du lieu va thong tin giao tiep hop tac cong tac sang tao noi dung so',
    'an toan giai quyet van de ung dung tri tue nhan tao ai',
    'va la o voi theo trong cho tu nhung cac mot hai ba bon',
  ]
    .join(' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2),
);

function normalizeFold(input?: string | null): string {
  if (!input) return '';
  return input
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtmlTags(html?: string | null): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').trim();
}

function extractTokens(normalized: string): string[] {
  return normalized.match(/[a-z0-9]+/g)?.filter((t) => t.length >= 2) ?? [];
}

/** Kiểm tra xem bài tự luận có đang sao chép nguyên văn hoặc lặp lại câu hỏi đề bài hay không. */
export function detectPromptCopy(evidenceText?: string | null, promptHtml?: string | null): boolean {
  const normalizedEvidence = normalizeFold(evidenceText);
  if (!normalizedEvidence) return false;
  const evidenceTokens = extractTokens(normalizedEvidence);
  if (evidenceTokens.length === 0) return false;

  const promptTokens = new Set(extractTokens(normalizeFold(stripHtmlTags(promptHtml))));
  const promptMatches =
    promptTokens.size > 0 ? evidenceTokens.filter((t) => promptTokens.has(t)).length : 0;
  const canonicalMatches = evidenceTokens.filter(
    (t) => CANONICAL_PROMPT_TOKENS.has(t) || promptTokens.has(t),
  ).length;
  const distinctOriginal = new Set(
    evidenceTokens.filter((t) => !CANONICAL_PROMPT_TOKENS.has(t) && !promptTokens.has(t)),
  ).size;

  const promptOverlap = promptMatches / evidenceTokens.length;
  const canonicalOverlap = canonicalMatches / evidenceTokens.length;
  const hasCanonicalStem = CANONICAL_PROMPT_STEMS.some((stem) =>
    normalizedEvidence.includes(stem),
  );

  const matchesExplicitPrompt =
    promptTokens.size >= 8 && promptOverlap >= 0.68 && distinctOriginal < 6;
  const matchesCanonicalPrompt =
    hasCanonicalStem && (canonicalOverlap >= 0.62 || distinctOriginal < 8);
  const overwhelmedByBoilerplate = canonicalOverlap >= 0.78 && distinctOriginal < 6;

  return matchesExplicitPrompt || matchesCanonicalPrompt || overwhelmedByBoilerplate;
}
