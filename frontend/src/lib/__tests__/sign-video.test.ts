import { describe, expect, it } from 'vitest';
import type { SignItem, SignLanguageVideo, SignSegment } from '@/services/sign-language-video.service';
import {
  availabilityOf,
  blockingItems,
  canApprove,
  countBlocking,
  elapsedLabel,
  mergeWithNext,
  moveItem,
  needsAttention,
  renderStageStates,
  setSkipped,
  signVideoState,
  skipBlocking,
  splitWords,
  textItem,
  toSegmentInput,
  withSign,
  workflowSteps,
} from '../sign-video';

const item = (sourceText: string, patch: Partial<SignItem> = {}): SignItem => ({ ...textItem(sourceText), ...patch });
const ok = (sourceText: string, glossId = `g-${sourceText}`): SignItem =>
  item(sourceText, { glossId, gloss: sourceText, availability: 'OK', isMissing: false, matchType: 'WORD', confidence: 0.9 });
const segment = (items: SignItem[], patch: Partial<SignSegment> = {}): SignSegment => ({
  index: 0, startMs: 0, endMs: 2000, captionText: items.map((i) => i.sourceText).join(' '), reviewStatus: 'PENDING', reviewNote: null,
  reviewedAt: null, reviewedBy: null, confidence: 0.9, nonSpeech: items.length === 0, items, problem: null, ...patch,
});
const video = (patch: Partial<SignLanguageVideo>): SignLanguageVideo => ({
  assetId: 'a1', trackId: 't1', status: 'NONE', prerequisites: {} as SignLanguageVideo['prerequisites'], settings: null, progress: 0,
  progressStage: null, progressDetail: null, renderStartedAt: null,
  errorCode: null, errorMessage: null, stale: false, captionsChanged: false, outputOutdated: false, hasUnpublishedChanges: true,
  summary: { segments: 0, readySegments: 0, skippedSegments: 0, nonSpeechSegments: 0, items: 0, signedItems: 0, missingItems: 0, ambiguousItems: 0, unavailableItems: 0, skippedItems: 0, unreviewedSegments: 0, confidence: 1 },
  missing: [], warnings: [], segments: [], output: null, published: null, renderBlockers: [], publishBlockers: [], updatedAt: null, ...patch,
});

describe('Trạng thái video ngôn ngữ ký hiệu', () => {
  it('never reads as made before a real video exists', () => {
    expect(signVideoState(undefined).label).toBe('Chưa tạo');
    expect(signVideoState(video({ status: 'NONE' })).label).toBe('Chưa tạo');
    expect(signVideoState(video({ status: 'NONE' }), true).label).toBe('Đang phân tích');
    expect(signVideoState(video({ status: 'MISSING_GLOSSES' })).label).toBe('Thiếu ký hiệu');
    expect(signVideoState(video({ status: 'READY_TO_RENDER' })).label).toBe('Chưa dựng video');
    expect(signVideoState(video({ status: 'RENDERING' })).label).toBe('Đang dựng video');
    expect(signVideoState(video({ status: 'RENDERING', stale: true })).label).toBe('Tạo thất bại');
    expect(signVideoState(video({ status: 'FAILED' })).label).toBe('Tạo thất bại');
    const ready = video({ status: 'READY' });
    expect(signVideoState({ ...ready, summary: { ...ready.summary, unreviewedSegments: 2 } }).label).toBe('Chờ kiểm duyệt');
    expect(signVideoState(ready).label).toBe('Đã sẵn sàng');
    expect(signVideoState(video({ status: 'PUBLISHED' })).label).toBe('Đã xuất bản');
  });

  it('says what a sign can do for the renderer', () => {
    const sign = { hasVideo: true, hasMotion: false, licensed: true, status: 'DRAFT' };
    expect(availabilityOf(sign, 'CLIP')).toBe('OK');
    expect(availabilityOf({ ...sign, licensed: false }, 'CLIP')).toBe('NO_LICENSE');
    expect(availabilityOf({ ...sign, hasVideo: false }, 'CLIP')).toBe('NO_VIDEO');
    expect(availabilityOf(sign, 'AVATAR')).toBe('NO_MOTION');
    expect(availabilityOf({ ...sign, status: 'ARCHIVED' }, 'CLIP')).toBe('ARCHIVED');
  });
});

describe('Sửa bản đồ ký hiệu', () => {
  it('joins, splits and reorders signs, each changed text being looked up again', () => {
    const items = [ok('kiến trúc'), ok('dữ liệu'), item('về')];

    const joined = mergeWithNext(items, 0);
    expect(joined.map((i) => i.sourceText)).toEqual(['kiến trúc dữ liệu', 'về']);
    expect(joined[0].glossId).toBeNull();
    expect(joined[0].availability).toBe('MISSING');

    const split = splitWords(joined, 0);
    expect(split.map((i) => i.sourceText)).toEqual(['kiến', 'trúc', 'dữ', 'liệu', 'về']);
    expect(splitWords(items, 2)).toBe(items);

    expect(moveItem(items, 1, -1).map((i) => i.sourceText)).toEqual(['dữ liệu', 'kiến trúc', 'về']);
    expect(moveItem(items, 0, -1)).toBe(items);
  });

  it('keeps a skipped word visible and blocks only signs that cannot be rendered', () => {
    const missing = item('marketing');
    const s = segment([ok('học'), missing]);
    expect(blockingItems(s).map((i) => i.sourceText)).toEqual(['marketing']);
    expect(canApprove(s)).toBe(false);
    expect(needsAttention(s)).toBe(true);

    const skipped = segment([ok('học'), setSkipped(missing, true)]);
    expect(skipped.items[1].availability).toBe('SKIPPED');
    expect(skipped.items).toHaveLength(2);
    expect(blockingItems(skipped)).toEqual([]);
    expect(canApprove(skipped)).toBe(true);
    expect(setSkipped(skipped.items[1], false).availability).toBe('MISSING');
    expect(blockingItems(segment([missing], { reviewStatus: 'SKIPPED' }))).toEqual([]);
    expect(needsAttention(segment([ok('học')], { reviewStatus: 'APPROVED' }))).toBe(false);
  });

  it('marks a sign picked by hand as a manual choice and sends only what changed', () => {
    const picked = withSign(item('dữ liệu'), {
      id: 'g9', gloss: 'dữ liệu (tin học)', kind: 'WORD', status: 'PUBLISHED', region: 'VN-NAM', variant: null, isPreferred: false, priority: 0,
      hasVideo: true, hasMotion: true, licensed: true,
    }, 'CLIP');
    expect(picked).toMatchObject({ glossId: 'g9', isManualOverride: true, matchType: 'MANUAL', availability: 'OK', region: 'VN-NAM' });

    const s = segment([{ ...picked, durationMs: 1500 }], { index: 3, reviewStatus: 'APPROVED', reviewNote: 'Đã kiểm tra' });
    expect(toSegmentInput(s, true)).toEqual({
      index: 3,
      items: [{ sourceText: 'dữ liệu', glossId: 'g9', skipped: false, durationMs: 1500, note: null }],
      reviewStatus: 'APPROVED',
      reviewNote: 'Đã kiểm tra',
    });
    expect(toSegmentInput(s, false)).not.toHaveProperty('items');
  });
});

describe('Tiến trình tạo video ký hiệu', () => {
  it('marks the steps of a render, and the step that failed', () => {
    expect(renderStageStates('JOINING')).toEqual(['done', 'done', 'done', 'current', 'todo', 'todo', 'todo']);
    expect(renderStageStates('COMPOSING', true)).toEqual(['done', 'done', 'done', 'done', 'error', 'todo', 'todo']);
    expect(renderStageStates(null)).toEqual(Array(7).fill('todo'));
    expect(elapsedLabel(new Date(0).toISOString(), 42_000)).toBe('42 giây');
    expect(elapsedLabel(new Date(0).toISOString(), 185_000)).toBe('3 phút 05 giây');
  });

  it('shows where the whole way stands, a video counting only once rendered', () => {
    const states = (patch: Partial<SignLanguageVideo>) => workflowSteps(video(patch)).map((s) => s.state);
    expect(states({ trackId: null, status: 'NONE' })).toEqual(['current', 'todo', 'todo', 'todo', 'todo']);
    expect(states({ status: 'MISSING_GLOSSES', renderBlockers: ['Câu số 2…'] })).toEqual(['done', 'current', 'todo', 'todo', 'todo']);
    expect(states({ status: 'RENDERING' })).toEqual(['done', 'done', 'current', 'todo', 'todo']);
    expect(states({ status: 'FAILED' })).toEqual(['done', 'done', 'error', 'todo', 'todo']);
    const output = { assetId: 'o', url: 'u', fileName: 'f', contentType: 'video/mp4', sizeBytes: 1, durationMs: 1, width: 1, height: 1, renderMode: 'OVERLAY' as const, at: null };
    const ready = video({ status: 'READY', output });
    expect(workflowSteps({ ...ready, summary: { ...ready.summary, unreviewedSegments: 2 } }).map((s) => s.state)).toEqual(['done', 'done', 'done', 'current', 'todo']);
    expect(states({ status: 'READY', output })).toEqual(['done', 'done', 'done', 'done', 'current']);
    expect(states({ status: 'PUBLISHED', output })).toEqual(['done', 'done', 'done', 'done', 'done']);
  });

  it('skips every sign that stops the render, and sends an approved sentence back to review', () => {
    const missing = item('marketing');
    const noVideo = item('dữ liệu', { glossId: 'g1', gloss: 'dữ liệu', availability: 'NO_VIDEO' });
    const result = skipBlocking([
      segment([ok('học'), missing], { index: 0 }),
      segment([ok('Chào mừng')], { index: 1, reviewStatus: 'APPROVED' }),
      segment([noVideo], { index: 2, reviewStatus: 'APPROVED' }),
    ]);

    expect(result.count).toBe(2);
    expect(result.changed).toEqual([0, 2]);
    expect(result.segments[0].items.map((i) => i.availability)).toEqual(['OK', 'SKIPPED']);
    expect(result.segments[0].items).toHaveLength(2);
    expect(result.segments[1].reviewStatus).toBe('APPROVED');
    expect(result.segments[2].reviewStatus).toBe('PENDING');
    expect(countBlocking(result.segments)).toBe(0);
  });
});
