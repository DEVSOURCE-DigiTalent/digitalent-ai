/**
 * Sign-language video of a lesson video (docs/specs/2026-11-24-sign-language-video.md). Pure helpers of the course
 * builder (SignLanguageVideoEditor, SignMapEditor): the state shown to the admin, what each sign needs, and the edits
 * of the sign map (join, split, move) before they are saved. The server checks everything again on save.
 */
import type {
  SignAvailability,
  SignCandidate,
  SignItem,
  SignItemInput,
  SignLanguageVideo,
  SignMatch,
  SignRenderStage,
  SignRendererKind,
  SignSegment,
  SignSegmentInput,
} from '@/services/sign-language-video.service';
import type { SignGloss } from '@/services/sign-dictionary.service';
import { formatCueTime } from './captions';

export type SignTone = 'green' | 'coral' | 'gray' | 'pa-pill-gold' | '';

export const SIGN_REVIEW_WARNING =
  'Bản đồ ký hiệu được tạo tự động. Vui lòng nhờ người biết ngôn ngữ ký hiệu kiểm tra trước khi xuất bản.';
export const NO_CAPTIONS_MESSAGE = 'Hãy tạo lời thoại của video (bước 1) và lưu lại trước khi tạo video ngôn ngữ ký hiệu.';
export const NO_SIGN_MEDIA_MESSAGE =
  'Từ điển hiện chưa có video hoặc chuyển động cho các ký hiệu này. Vui lòng bổ sung dữ liệu trong Từ điển ký hiệu.';

export const RENDERER_LABELS = {
  AVATAR: 'Nhân vật 3D (một nhân vật cho cả video)',
  CLIP: 'Video của một người ra dấu',
} as const;

export const RENDER_MODE_LABELS = {
  OVERLAY: 'Góc trái dưới video gốc',
  FULLSCREEN: 'Video ký hiệu toàn màn hình',
  TRACK_ONLY: 'Chỉ track video ký hiệu',
} as const;

export const REGION_LABELS: Record<string, string> = {
  VN: 'Toàn quốc',
  'VN-BAC': 'Miền Bắc',
  'VN-TRUNG': 'Miền Trung',
  'VN-NAM': 'Miền Nam',
};

export const regionLabel = (region: string | null | undefined) => (region ? REGION_LABELS[region] ?? region : '');

/**
 * The state of the sign-language video in words. A video counts as made only when the server has a rendered
 * output: captions alone, or a map, never read "đã tạo".
 */
export function signVideoState(data: SignLanguageVideo | undefined, analyzing = false): { label: string; tone: SignTone } {
  if (analyzing) return { label: 'Đang phân tích', tone: '' };
  if (!data || data.status === 'NONE') return { label: 'Chưa tạo', tone: 'gray' };
  switch (data.status) {
    case 'ANALYZING':
      return { label: 'Đang phân tích', tone: '' };
    case 'MISSING_GLOSSES':
      return { label: 'Thiếu ký hiệu', tone: 'coral' };
    case 'READY_TO_RENDER':
      return { label: 'Chưa dựng video', tone: 'pa-pill-gold' };
    case 'RENDERING':
      return data.stale ? { label: 'Tạo thất bại', tone: 'coral' } : { label: 'Đang dựng video', tone: '' };
    case 'READY':
      return data.summary.unreviewedSegments > 0 ? { label: 'Chờ kiểm duyệt', tone: 'pa-pill-gold' } : { label: 'Đã sẵn sàng', tone: 'green' };
    case 'PUBLISHED':
      return { label: 'Đã xuất bản', tone: 'green' };
    case 'FAILED':
      return { label: 'Tạo thất bại', tone: 'coral' };
    default:
      return { label: 'Chưa tạo', tone: 'gray' };
  }
}

export const AVAILABILITY_LABELS: Record<SignAvailability, string> = {
  OK: 'Đã có',
  MISSING: 'Thiếu',
  AMBIGUOUS: 'Cần chọn',
  NO_VIDEO: 'Chưa có video',
  NO_MOTION: 'Chưa có chuyển động',
  NO_LICENSE: 'Thiếu giấy phép',
  ARCHIVED: 'Đã xóa khỏi từ điển',
  SKIPPED: 'Bỏ qua',
};

/** A sign that stops the render (skipped ones never do). */
export const isBlocking = (availability: SignAvailability) => availability !== 'OK' && availability !== 'SKIPPED';

/** What a sign picked from the dictionary can do for this renderer. */
export function availabilityOf(sign: Pick<SignCandidate, 'hasVideo' | 'hasMotion' | 'licensed' | 'status'>, renderer: SignRendererKind): SignAvailability {
  if (sign.status === 'ARCHIVED') return 'ARCHIVED';
  // The motion comes from a person's video: the avatar uses it only within the rights of that video.
  if (renderer === 'AVATAR') return !sign.hasMotion ? 'NO_MOTION' : sign.licensed ? 'OK' : 'NO_LICENSE';
  if (!sign.hasVideo) return 'NO_VIDEO';
  return sign.licensed ? 'OK' : 'NO_LICENSE';
}

/** The item with a sign chosen by the admin. */
export function withSign(item: SignItem, sign: SignCandidate, renderer: SignRendererKind): SignItem {
  return {
    ...item,
    glossId: sign.id,
    gloss: sign.gloss,
    glossKind: sign.kind,
    glossStatus: sign.status,
    region: sign.region,
    variant: sign.variant,
    matchType: 'MANUAL',
    confidence: 1,
    isManualOverride: true,
    isMissing: false,
    skipped: false,
    availability: availabilityOf(sign, renderer),
    problem: null,
  };
}

/** A fresh item for a text not matched yet (joined, split or typed). */
export function textItem(sourceText: string): SignItem {
  return {
    sourceText,
    normalizedText: sourceText.toLowerCase(),
    glossId: null,
    gloss: null,
    glossKind: null,
    glossStatus: null,
    region: null,
    variant: null,
    matchedAssetId: null,
    matchType: 'MISSING',
    confidence: 0,
    isManualOverride: false,
    isMissing: true,
    skipped: false,
    durationMs: null,
    clipDurationMs: null,
    startMs: null,
    endMs: null,
    timingMeasured: false,
    note: null,
    hint: null,
    availability: 'MISSING',
    problem: null,
    candidates: [],
  };
}

export function setSkipped(item: SignItem, skipped: boolean): SignItem {
  if (skipped) return { ...item, skipped: true, availability: 'SKIPPED' };
  const availability: SignAvailability = item.glossId ? (item.availability === 'SKIPPED' ? 'OK' : item.availability) : item.matchType === 'AMBIGUOUS' ? 'AMBIGUOUS' : 'MISSING';
  return { ...item, skipped: false, availability };
}

/** Joins the sign at `index` with the next one: one sign for both texts (looked up again). */
export function mergeWithNext(items: SignItem[], index: number): SignItem[] {
  if (index < 0 || index >= items.length - 1) return items;
  const joined = textItem(`${items[index].sourceText} ${items[index + 1].sourceText}`.replace(/\s+/g, ' ').trim());
  return [...items.slice(0, index), joined, ...items.slice(index + 2)];
}

/** Splits a sign of several words into one sign per word (each looked up again). */
export function splitWords(items: SignItem[], index: number): SignItem[] {
  const words = items[index]?.sourceText.split(/\s+/).filter(Boolean) ?? [];
  if (words.length < 2) return items;
  return [...items.slice(0, index), ...words.map(textItem), ...items.slice(index + 1)];
}

/** Moves a sign one place left (-1) or right (+1): sign languages have their own word order. */
export function moveItem(items: SignItem[], index: number, delta: -1 | 1): SignItem[] {
  const target = index + delta;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const toItemInput = (item: SignItem): SignItemInput => ({
  sourceText: item.sourceText.trim(),
  glossId: item.glossId,
  skipped: item.skipped,
  durationMs: item.durationMs,
  note: item.note,
});

export const toSegmentInput = (segment: SignSegment, sendItems: boolean): SignSegmentInput => ({
  index: segment.index,
  ...(sendItems ? { items: segment.items.map(toItemInput) } : {}),
  reviewStatus: segment.reviewStatus,
  reviewNote: segment.reviewNote ?? '',
});

/** Signs of the sentence that still stop the render (a skipped sentence has none). */
export function blockingItems(segment: SignSegment): SignItem[] {
  if (segment.reviewStatus === 'SKIPPED') return [];
  return segment.items.filter((item) => isBlocking(item.availability));
}

/** Signs that still stop the render, over the whole map. */
export const countBlocking = (segments: SignSegment[]) => segments.reduce((sum, segment) => sum + blockingItems(segment).length, 0);

/**
 * "Bỏ qua N từ chưa có ký hiệu": the admin chooses, explicitly, to render with the signs that exist. Every sign that
 * stops the render is skipped — it stays in the map (struck out) and can be used again. A sentence that was approved
 * goes back to review, since its signs changed.
 */
export function skipBlocking(segments: SignSegment[]): { segments: SignSegment[]; changed: number[]; count: number } {
  let count = 0;
  const changed: number[] = [];
  const next = segments.map((segment): SignSegment => {
    const blocking = blockingItems(segment);
    if (blocking.length === 0) return segment;
    count += blocking.length;
    changed.push(segment.index);
    return {
      ...segment,
      reviewStatus: segment.reviewStatus === 'APPROVED' ? 'PENDING' : segment.reviewStatus,
      items: segment.items.map((item) => (isBlocking(item.availability) ? setSkipped(item, true) : item)),
    };
  });
  return { segments: next, changed, count };
}

/** A sentence that may be approved: every sign has been chosen (or skipped). */
export const canApprove = (segment: SignSegment) => segment.items.every((item) => item.skipped || item.glossId != null);

/** Sentences that still need attention: a sign missing or not reviewed yet. */
export const needsAttention = (segment: SignSegment) =>
  blockingItems(segment).length > 0 || (segment.reviewStatus === 'PENDING' && segment.items.some((item) => !item.skipped));

export const timeRange = (startMs: number, endMs: number) => `${formatCueTime(startMs, false)}–${formatCueTime(endMs, false)}`;

/** "1,2 giây" */
export const seconds = (ms: number | null | undefined) =>
  ms == null ? '' : `${(ms / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} giây`;

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} MB`;
  return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('vi-VN')} KB`;
}

/** A dictionary sign as a candidate of the sign map. */
export const glossToCandidate = (gloss: SignGloss): SignCandidate => ({
  id: gloss.id,
  gloss: gloss.gloss,
  kind: gloss.kind,
  status: gloss.status,
  region: gloss.region,
  variant: gloss.variant,
  isPreferred: gloss.isPreferred,
  priority: gloss.priority,
  hasVideo: gloss.video != null,
  hasMotion: gloss.hasMotion,
  licensed: gloss.usableForVideo,
});

/** "Miền Bắc · người ra dấu B · mặc định" */
export function variantLine(sign: Pick<SignCandidate, 'region' | 'variant' | 'isPreferred'>) {
  return [regionLabel(sign.region), sign.variant, sign.isPreferred ? 'mặc định' : null].filter(Boolean).join(' · ');
}

/** The item after a lookup of its text: the sign found (with what it can do) or still missing / to choose. */
export function applyMatch(item: SignItem, match: SignMatch, renderer: SignRendererKind): SignItem {
  const base = { ...item, candidates: match.candidates, hint: match.hint, normalizedText: match.normalizedText };
  const chosen = match.glossId ? match.candidates.find((c) => c.id === match.glossId) : undefined;
  if (chosen) {
    return { ...withSign(base, chosen, renderer), matchType: match.matchType, confidence: match.confidence, isManualOverride: false };
  }
  return {
    ...base, glossId: null, gloss: null, glossKind: null, glossStatus: null, region: null, variant: null,
    matchType: match.matchType, confidence: 0, isManualOverride: false, isMissing: true,
    availability: item.skipped ? 'SKIPPED' : match.matchType === 'AMBIGUOUS' ? 'AMBIGUOUS' : 'MISSING',
  };
}

// ----- Progress ---------------------------------------------------------------------------------

export type StepState = 'done' | 'current' | 'todo' | 'error';

/** The steps of a render as the server reports them (platform_sign_language_tracks.progress_stage), in order. */
export const RENDER_STAGES: { key: SignRenderStage; label: string }[] = [
  { key: 'QUEUED', label: 'Chờ đến lượt' },
  { key: 'DOWNLOADING', label: 'Đọc video bài giảng' },
  { key: 'PREPARING_CLIPS', label: 'Chuẩn hóa video ký hiệu' },
  { key: 'JOINING', label: 'Xếp và ghép theo giờ lời thoại' },
  { key: 'COMPOSING', label: 'Dựng video đầu ra' },
  { key: 'CHECKING', label: 'Kiểm tra video' },
  { key: 'SAVING', label: 'Lưu vào kho' },
];

/** The same steps for the 3D avatar: the browser already rendered the avatar, the server reads it and composes. */
export const AVATAR_RENDER_STAGES: { key: SignRenderStage; label: string }[] = RENDER_STAGES.map((stage) => ({
  ...stage,
  label: stage.key === 'PREPARING_CLIPS' ? 'Đọc track nhân vật 3D' : stage.key === 'JOINING' ? 'Khớp nhân vật với video bài giảng' : stage.label,
}));

export const renderStagesFor = (renderer: SignRendererKind | null | undefined) => (renderer === 'AVATAR' ? AVATAR_RENDER_STAGES : RENDER_STAGES);

export const renderStageLabel = (stage: SignRenderStage | null | undefined, renderer?: SignRendererKind | null) =>
  renderStagesFor(renderer).find((s) => s.key === stage)?.label ?? null;

/** State of each render step: those before the current one are done; a failed render marks its step as the error. */
export function renderStageStates(stage: SignRenderStage | null | undefined, failed = false): StepState[] {
  const current = RENDER_STAGES.findIndex((s) => s.key === stage);
  return RENDER_STAGES.map((_, i) => {
    if (current < 0) return 'todo';
    if (i < current) return 'done';
    if (i === current) return failed ? 'error' : 'current';
    return 'todo';
  });
}

/** "42 giây", "3 phút 05 giây" since the render started. */
export function elapsedLabel(fromIso: string | null | undefined, now: number): string | null {
  if (!fromIso) return null;
  const seconds = Math.max(0, Math.floor((now - new Date(fromIso).getTime()) / 1000));
  if (seconds < 60) return `${seconds} giây`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} phút ${String(seconds % 60).padStart(2, '0')} giây`;
}

export interface WorkflowStep {
  key: 'analyze' | 'map' | 'render' | 'review' | 'publish';
  label: string;
  state: StepState;
  hint: string;
}

/**
 * The whole way to a published sign-language video: analyse the captions → every sign usable → render → review →
 * publish. A step is done only when its result really exists (a video counts once a file was rendered).
 */
export function workflowSteps(data: SignLanguageVideo, analyzing = false): WorkflowStep[] {
  const hasTrack = data.trackId != null;
  const status = data.status;
  const blocking = data.renderBlockers.length;
  const rendered = data.output != null && !data.outputOutdated && (status === 'READY' || status === 'PUBLISHED');
  const reviewed = data.summary.unreviewedSegments === 0;
  const failed = status === 'FAILED' || (status === 'RENDERING' && data.stale);
  const rendering = status === 'RENDERING' && !data.stale;

  const analyze: StepState = analyzing ? 'current' : hasTrack ? 'done' : 'current';
  const map: StepState = !hasTrack ? 'todo' : blocking === 0 || rendering || rendered ? 'done' : 'current';
  const render: StepState = rendered ? 'done' : failed ? 'error' : map === 'done' ? 'current' : 'todo';
  const review: StepState = !rendered ? 'todo' : reviewed ? 'done' : 'current';
  const publish: StepState = status === 'PUBLISHED' ? 'done' : rendered && reviewed ? 'current' : 'todo';

  return [
    { key: 'analyze', label: 'Phân tích lời thoại', state: analyze, hint: analyzing ? 'Đang tìm ký hiệu cho từng câu…' : hasTrack ? `${data.summary.segments} câu` : 'Chưa phân tích' },
    {
      key: 'map', label: 'Đủ ký hiệu', state: map,
      hint: !hasTrack ? '' : blocking === 0 ? `${data.summary.signedItems} ký hiệu` : `Còn ${data.summary.missingItems + data.summary.ambiguousItems + data.summary.unavailableItems} từ thiếu`,
    },
    {
      key: 'render', label: 'Dựng video', state: render,
      hint: rendering ? `${data.progress}%` : failed ? 'Lỗi, bấm Thử lại' : rendered ? 'Có video' : data.outputOutdated ? 'Cần dựng lại' : '',
    },
    { key: 'review', label: 'Duyệt từng câu', state: review, hint: rendered ? (reviewed ? 'Đã duyệt' : `${data.summary.unreviewedSegments} câu chờ duyệt`) : '' },
    { key: 'publish', label: 'Xuất bản', state: publish, hint: status === 'PUBLISHED' ? 'Người học đã thấy' : '' },
  ];
}
