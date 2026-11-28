import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AssetCaptions, PlatformAsset } from '@/services/platform-catalog.service';
import type { SignItem, SignLanguageVideo, SignSegment } from '@/services/sign-language-video.service';

const service = vi.hoisted(() => ({
  get: vi.fn(),
  analyze: vi.fn(),
  saveSegments: vi.fn(),
  render: vi.fn(),
  status: vi.fn(),
  preview: vi.fn(),
  publish: vi.fn(),
  retry: vi.fn(),
  discardDraft: vi.fn(),
  match: vi.fn(),
  avatarJob: vi.fn(),
  uploadAvatarTrack: vi.fn(),
}));
const avatar = vi.hoisted(() => ({ renderAvatarTrack: vi.fn() }));
const batch = vi.hoisted(() => ({ takeMotions: vi.fn(), batchProgressView: vi.fn(() => ({ phase: 'run', label: '', detail: '', percent: 0 })) }));
const catalog = vi.hoisted(() => ({ getCaptions: vi.fn() }));
const dictionary = vi.hoisted(() => ({ list: vi.fn(), motions: vi.fn(), get: vi.fn() }));
const permission = vi.hoisted(() => ({ allowed: true }));

vi.mock('@/services/sign-language-video.service', () => ({ signLanguageVideoService: service }));
vi.mock('@/services/platform-catalog.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/platform-catalog.service')>();
  return { ...actual, platformCatalogService: { ...actual.platformCatalogService, ...catalog } };
});
vi.mock('@/services/sign-dictionary.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/sign-dictionary.service')>();
  return { ...actual, signDictionaryService: { ...actual.signDictionaryService, ...dictionary } };
});
vi.mock('@/hooks/use-permission', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/use-permission')>();
  return { ...actual, usePermission: () => ({ can: () => permission.allowed }) };
});
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() } }));
vi.mock('@/features/sign-language/avatar-track-render', () => avatar);
vi.mock('@/features/sign-language/batch-motion', () => batch);

import { SignLanguageVideoEditor } from '../builder/SignLanguageVideoEditor';

const asset: PlatformAsset = { assetId: 'a1', kind: 'VIDEO', fileName: 'bai.mp4', contentType: 'video/mp4', sizeBytes: 10, url: 'platform/assets/a1/content' };

const captions = (patch: Partial<AssetCaptions> = {}): AssetCaptions => ({
  assetId: 'a1', language: 'vi', status: 'READY', source: 'MANUAL', model: null, errorCode: null, errorMessage: null,
  draftCues: [{ startMs: 0, endMs: 2000, text: 'Chào mừng' }], publishedCues: [{ startMs: 0, endMs: 2000, text: 'Chào mừng' }],
  publishedAt: '2026-11-24T08:00:00Z', hasUnpublishedChanges: false, aiConfigured: true, updatedAt: '2026-11-24T08:00:00Z', ...patch,
});

const prerequisites = {
  isLessonVideo: true, hasCaptions: true, hasPublishedCaptions: true, hasDraftCaptions: true, captionsProcessing: false,
  dictionarySigns: 10, usableSigns: 4, rendererAvailable: true, rendererMessage: null, avatarRendererAvailable: false,
  avatarRendererMessage: 'Chưa có bộ dựng video nhân vật 3D trên máy chủ.',
};

const item = (sourceText: string, patch: Partial<SignItem> = {}): SignItem => ({
  sourceText, normalizedText: sourceText.toLowerCase(), glossId: `g-${sourceText}`, gloss: sourceText.toLowerCase(), glossKind: 'WORD', glossStatus: 'DRAFT',
  region: 'VN', variant: null, matchedAssetId: 'v1', matchType: 'WORD', confidence: 0.9, isManualOverride: false, isMissing: false, skipped: false,
  durationMs: null, clipDurationMs: 1000, startMs: 0, endMs: 1000, timingMeasured: false, note: null, hint: null, availability: 'OK', problem: null,
  candidates: [], ...patch,
});

const missingItem = (sourceText: string, patch: Partial<SignItem> = {}) =>
  item(sourceText, { glossId: null, gloss: null, glossKind: null, glossStatus: null, region: null, matchType: 'MISSING', confidence: 0, isMissing: true, availability: 'MISSING', ...patch });

const sentence = (index: number, items: SignItem[], patch: Partial<SignSegment> = {}): SignSegment => ({
  index, startMs: index * 3000, endMs: index * 3000 + 2000, captionText: items.map((i) => i.sourceText).join(' '), reviewStatus: 'PENDING',
  reviewNote: null, reviewedAt: null, reviewedBy: null, confidence: 0.9, nonSpeech: false, items, problem: null, ...patch,
});

const summary = { segments: 2, readySegments: 1, skippedSegments: 0, nonSpeechSegments: 0, items: 3, signedItems: 2, missingItems: 0, ambiguousItems: 1, unavailableItems: 0, skippedItems: 0, unreviewedSegments: 2, confidence: 0.6 };

const video = (patch: Partial<SignLanguageVideo> = {}): SignLanguageVideo => ({
  assetId: 'a1', trackId: 't1', status: 'MISSING_GLOSSES', prerequisites,
  settings: { captionSource: 'PUBLISHED', renderMode: 'OVERLAY', renderer: 'CLIP', signLanguage: 'VSL', region: 'VN', variant: null },
  progress: 0, progressStage: null, progressDetail: null, renderStartedAt: null,
  errorCode: null, errorMessage: null, stale: false, captionsChanged: false, outputOutdated: false, hasUnpublishedChanges: true,
  summary,
  missing: [{ text: 'cảm ơn', count: 1, segments: [2], reason: 'Có nhiều ký hiệu ngang nhau, cần chọn một', hint: null }],
  warnings: [],
  segments: [
    sentence(0, [item('Chào mừng')]),
    sentence(1, [
      item('Học'),
      missingItem('cảm ơn', {
        matchType: 'AMBIGUOUS', availability: 'AMBIGUOUS', problem: 'Câu số 2: “cảm ơn” có 2 ký hiệu ngang nhau, hãy chọn một.',
        candidates: [
          { id: 'north', gloss: 'cảm ơn', kind: 'WORD', status: 'DRAFT', region: 'VN-BAC', variant: null, isPreferred: false, priority: 0, hasVideo: true, hasMotion: false, licensed: true },
          { id: 'south', gloss: 'cảm ơn', kind: 'WORD', status: 'DRAFT', region: 'VN-NAM', variant: null, isPreferred: false, priority: 0, hasVideo: false, hasMotion: false, licensed: false },
        ],
      }),
    ]),
  ],
  output: null, published: null,
  renderBlockers: ['Câu số 2: “cảm ơn” có 2 ký hiệu ngang nhau, hãy chọn một.'],
  publishBlockers: ['Chưa dựng video ký hiệu. Bấm “Tạo video ký hiệu” trước khi xuất bản.'],
  updatedAt: '2026-11-24T09:00:00Z',
  ...patch,
});

const none = (patch: Partial<SignLanguageVideo['prerequisites']> = {}): SignLanguageVideo => video({
  trackId: null, status: 'NONE', settings: null, segments: [], missing: [], renderBlockers: [], publishBlockers: [],
  summary: { ...summary, segments: 0, items: 0, readySegments: 0, signedItems: 0, ambiguousItems: 0, unreviewedSegments: 0 },
  prerequisites: { ...prerequisites, ...patch },
});

function renderEditor() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const videoRef = createRef<HTMLVideoElement>();
  return render(
    <QueryClientProvider client={client}>
      <video ref={videoRef} />
      <div className="pulse-ui"><SignLanguageVideoEditor asset={asset} videoRef={videoRef} /></div>
    </QueryClientProvider>,
  );
}

describe('Video ngôn ngữ ký hiệu trong trình soạn khóa học', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    permission.allowed = true;
    catalog.getCaptions.mockResolvedValue(captions());
    dictionary.list.mockResolvedValue({ items: [], pageIndex: 1, pageSize: 8, totalItems: 0, totalPages: 0 });
    URL.createObjectURL = vi.fn(() => 'blob:vtt');
    URL.revokeObjectURL = vi.fn();
  });

  it('shows NONE and locks creation until the captions exist', async () => {
    service.get.mockResolvedValue(none({ hasCaptions: false, hasPublishedCaptions: false, hasDraftCaptions: false }));
    renderEditor();

    expect(await screen.findByText('Chưa tạo')).toBeTruthy();
    expect(screen.getByText('Hãy tạo lời thoại của video (bước 1) và lưu lại trước khi tạo video ngôn ngữ ký hiệu.')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Tạo video ký hiệu/ }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: /Xem bản đồ ký hiệu/ }).hasAttribute('disabled')).toBe(true);
    expect(service.analyze).not.toHaveBeenCalled();
  });

  it('locks creation without sign videos in the dictionary, yet lets the admin see the sign map', async () => {
    service.get.mockResolvedValue(none({ usableSigns: 0 }));
    service.analyze.mockResolvedValue(video());
    renderEditor();

    expect(await screen.findByText(/Từ điển hiện chưa có video hoặc chuyển động cho các ký hiệu này/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Tạo video ký hiệu/ }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /Xem bản đồ ký hiệu/ }));

    await waitFor(() => expect(service.analyze).toHaveBeenCalledWith('a1', {
      captionSource: 'DRAFT', renderMode: 'OVERLAY', renderer: 'AVATAR', region: 'VN',
    }));
    expect(await screen.findByRole('table', { name: 'Bản đồ ký hiệu' })).toBeTruthy();
    expect(screen.getByText('Thiếu ký hiệu')).toBeTruthy();
    expect(screen.getByText(/Ký hiệu còn thiếu/)).toBeTruthy();
    expect(screen.getByText(/Bản đồ ký hiệu được tạo tự động/)).toBeTruthy();
    expect(screen.getAllByText(/Câu số 2: “cảm ơn” có 2 ký hiệu ngang nhau/).length).toBeGreaterThan(0);
  });

  it('lets the admin choose another sign and review a sentence, then saves only what changed', async () => {
    service.get.mockResolvedValue(video());
    service.saveSegments.mockResolvedValue(video({ status: 'READY_TO_RENDER', renderBlockers: [] }));
    renderEditor();

    fireEvent.click(await screen.findByRole('button', { name: /Xem bản đồ ký hiệu/ }));
    fireEvent.click(screen.getByRole('button', { name: /Câu 2, ký hiệu 2: cảm ơn — Cần chọn/ }));
    const panel = screen.getByRole('group', { name: 'Sửa Câu 2, ký hiệu 2' });
    const choices = within(panel).getAllByRole('radio');
    expect(within(panel).getByText('Chưa có video')).toBeTruthy();
    fireEvent.click(choices[0]);
    expect(screen.getByRole('button', { name: /Câu 2, ký hiệu 2: cảm ơn — cảm ơn, Đã có/ })).toBeTruthy();

    fireEvent.change(screen.getByRole('combobox', { name: 'Kiểm duyệt câu 1' }), { target: { value: 'APPROVED' } });
    expect(screen.getByText(/Có thay đổi chưa lưu/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Tạo video ký hiệu/ }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu bản nháp' }));

    await waitFor(() => expect(service.saveSegments).toHaveBeenCalledTimes(1));
    const [trackId, body] = service.saveSegments.mock.calls[0];
    expect(trackId).toBe('t1');
    expect(body).toEqual([
      { index: 0, reviewStatus: 'APPROVED', reviewNote: '' },
      {
        index: 1,
        items: [
          { sourceText: 'Học', glossId: 'g-Học', skipped: false, durationMs: null, note: null },
          { sourceText: 'cảm ơn', glossId: 'north', skipped: false, durationMs: null, note: null },
        ],
        reviewStatus: 'PENDING',
        reviewNote: '',
      },
    ]);
  });

  it('refuses to approve a sentence that still has a word without a sign', async () => {
    service.get.mockResolvedValue(video());
    renderEditor();

    fireEvent.click(await screen.findByRole('button', { name: /Xem bản đồ ký hiệu/ }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Kiểm duyệt câu 2' }), { target: { value: 'APPROVED' } });

    expect((screen.getByRole('combobox', { name: 'Kiểm duyệt câu 2' }) as HTMLSelectElement).value).toBe('PENDING');
    expect(screen.queryByText(/Có thay đổi chưa lưu/)).toBeNull();
  });

  it('shows the progress of a render and never a fake success', async () => {
    service.get.mockResolvedValue(video({ status: 'RENDERING', progress: 10, renderBlockers: [] }));
    service.status.mockResolvedValue({
      trackId: 't1', status: 'RENDERING', progress: 45, progressStage: 'PREPARING_CLIPS', progressDetail: 'Chuẩn hóa video ký hiệu 2/3: “bạn”',
      renderStartedAt: new Date(Date.now() - 65_000).toISOString(), errorCode: null, errorMessage: null, stale: false, updatedAt: '',
    });
    renderEditor();

    expect(await screen.findByText('Đang dựng video')).toBeTruthy();
    expect(await screen.findByText(/Đang dựng video ký hiệu… 45%/)).toBeTruthy();
    expect(screen.getByText('Chuẩn hóa video ký hiệu 2/3: “bạn”')).toBeTruthy();
    expect(screen.getByText(/đã chạy 1 phút 0[5-9] giây/)).toBeTruthy();
    const stages = screen.getByRole('list', { name: 'Các bước dựng video' });
    expect(within(stages).getByText('Chuẩn hóa video ký hiệu').closest('li')?.getAttribute('aria-current')).toBe('step');
    expect(within(stages).getByText('Đọc video bài giảng').closest('li')?.className).toContain('is-done');
    expect(within(stages).getByText('Dựng video đầu ra').closest('li')?.className).toContain('is-todo');
    const steps = screen.getByRole('list', { name: 'Các bước tạo video ngôn ngữ ký hiệu' });
    expect(within(steps).getByText('Dựng video').closest('li')?.getAttribute('aria-current')).toBe('step');
    expect(screen.queryByText('Đã sẵn sàng')).toBeNull();
    expect(screen.queryByText('Đã xuất bản')).toBeNull();
    expect(screen.queryByRole('button', { name: /Xem trước/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Xuất bản video ký hiệu' }).hasAttribute('disabled')).toBe(true);
  });

  it('explains a failed render and retries it', async () => {
    service.get.mockResolvedValue(video({
      status: 'FAILED', errorCode: 'SIGN_VIDEO_UNREADABLE', errorMessage: 'Không đọc được video của ký hiệu “học”.', renderBlockers: [],
      progressStage: 'PREPARING_CLIPS',
    }));
    service.retry.mockResolvedValue(video({ status: 'RENDERING', renderBlockers: [] }));
    renderEditor();

    expect(await screen.findByText('Tạo thất bại')).toBeTruthy();
    expect(screen.getByText(/Không đọc được video của ký hiệu “học”. \(SIGN_VIDEO_UNREADABLE\)/)).toBeTruthy();
    expect(screen.getByText(/Lỗi ở bước “Chuẩn hóa video ký hiệu”/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    await waitFor(() => expect(service.retry).toHaveBeenCalledWith('t1'));
  });

  it('shows the rendered video, waits for the review, then publishes it', async () => {
    const output = {
      assetId: 'o1', url: 'platform/assets/o1/content?exp=1&sig=x', fileName: 'bai-ngon-ngu-ky-hieu.mp4', contentType: 'video/mp4',
      sizeBytes: 2_500_000, durationMs: 12_000, width: 1280, height: 720, renderMode: 'OVERLAY' as const, at: '2026-11-24T10:00:00Z',
    };
    const reviewed = video({
      status: 'READY', output, renderBlockers: [], publishBlockers: [], missing: [],
      summary: { ...summary, unreviewedSegments: 0, ambiguousItems: 0, readySegments: 2 },
      segments: [sentence(0, [item('Chào mừng')], { reviewStatus: 'APPROVED' })],
    });
    service.get.mockResolvedValue(video({
      status: 'READY', output, renderBlockers: [], missing: [],
      publishBlockers: ['Còn 2 câu chưa được duyệt. Nhờ người biết ngôn ngữ ký hiệu duyệt từng câu (hoặc bỏ qua câu) trước khi xuất bản.'],
    }));
    service.publish.mockResolvedValue({ ...reviewed, status: 'PUBLISHED', published: output, hasUnpublishedChanges: false });
    const { container, rerender } = renderEditor();

    expect(await screen.findByText('Chờ kiểm duyệt')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Xuất bản video ký hiệu' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByText(/Còn 2 câu chưa được duyệt/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /Tải video xuống/ }).getAttribute('href')).toContain('platform/assets/o1/content');
    fireEvent.click(screen.getByRole('button', { name: /Xem trước/ }));
    const preview = container.querySelector('video[aria-label="Xem trước video ngôn ngữ ký hiệu"]')!;
    expect(preview.getAttribute('src')).toContain('platform/assets/o1/content');
    expect(preview.querySelector('track')).toBeNull();
    rerender(<></>);

    service.get.mockResolvedValue(reviewed);
    renderEditor();
    expect(await screen.findByText('Đã sẵn sàng')).toBeTruthy();
    const publish = screen.getByRole('button', { name: 'Xuất bản video ký hiệu' });
    expect(publish.hasAttribute('disabled')).toBe(false);
    fireEvent.click(publish);
    await waitFor(() => expect(service.publish).toHaveBeenCalledWith('t1'));
    expect(await screen.findByText('Đã xuất bản')).toBeTruthy();
  });

  it('is read-only without the right to edit course content', async () => {
    permission.allowed = false;
    service.get.mockResolvedValue(video());
    renderEditor();

    expect(await screen.findByText('Thiếu ký hiệu')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Lưu bản nháp' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Tạo video ký hiệu/ })).toBeNull();
  });

  it('skips every word without a usable sign only when asked, saves, then renders with the signs that exist', async () => {
    service.get.mockResolvedValue(video());
    service.saveSegments.mockResolvedValue(video({ status: 'READY_TO_RENDER', renderBlockers: [], missing: [] }));
    service.render.mockResolvedValue(video({ status: 'RENDERING', renderBlockers: [], missing: [] }));
    service.status.mockResolvedValue({
      trackId: 't1', status: 'RENDERING', progress: 1, progressStage: 'QUEUED', progressDetail: null, renderStartedAt: null,
      errorCode: null, errorMessage: null, stale: false, updatedAt: '',
    });
    renderEditor();

    fireEvent.click(await screen.findByRole('button', { name: 'Bỏ qua 1 từ chưa có ký hiệu và dựng video' }));
    expect(service.saveSegments).not.toHaveBeenCalled();
    expect(screen.getByRole('group', { name: 'Xác nhận bỏ qua các từ chưa có ký hiệu' }).textContent).toContain('vẫn hiện gạch ngang');
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua và dựng video' }));

    await waitFor(() => expect(service.render).toHaveBeenCalledWith('t1', false));
    expect(service.saveSegments).toHaveBeenCalledWith('t1', [{
      index: 1,
      items: [
        { sourceText: 'Học', glossId: 'g-Học', skipped: false, durationMs: null, note: null },
        { sourceText: 'cảm ơn', glossId: null, skipped: true, durationMs: null, note: null },
      ],
      reviewStatus: 'PENDING',
      reviewNote: '',
    }]);
  });

  it('renders the 3D avatar in the browser on the lesson frame grid, uploads it, and the server composes it', async () => {
    const avatarVideo = (patch: Partial<SignLanguageVideo> = {}) => video({
      status: 'READY_TO_RENDER', renderBlockers: [], missing: [],
      settings: { captionSource: 'PUBLISHED', renderMode: 'OVERLAY', renderer: 'AVATAR', signLanguage: 'VSL', region: 'VN', variant: null },
      segments: [sentence(0, [item('Chào mừng')])],
      summary: { ...summary, missingItems: 0 },
      ...patch,
    });
    service.get.mockResolvedValue(avatarVideo());
    service.avatarJob.mockResolvedValue({
      trackId: 't1', fingerprint: 'fp-1', frameRate: '25', fps: 25, frameCount: 250, durationMs: 10_000, width: 480, height: 540,
      background: '#E9EEF5', maxSpeedup: 1.5, segments: [], signs: [{ glossId: 'g-Chào mừng', gloss: 'chào mừng', mirrored: false }],
    });
    dictionary.motions.mockResolvedValue([{ id: 'g-Chào mừng', gloss: 'chào mừng', kind: 'WORD', layout: 1, fps: 20, frames: 1, mirrored: false, data: '' }]);
    avatar.renderAvatarTrack.mockImplementation(async (_job, _motions, options) => {
      options.onProgress?.({ phase: 'render', done: 125, total: 250, detail: 'Khung 125/250 · 0:05/0:10 của video' });
      return {
        blob: new Blob([new Uint8Array([0, 0, 0, 1])]), format: 'H264', codec: 'avc1.42E01F', frameCount: 250, warnings: [],
        placements: [{ segmentIndex: 0, itemIndex: 0, glossId: 'g-Chào mừng', startMs: 0, endMs: 1500, speed: 1, sourceMs: 1500 }],
      };
    });
    service.uploadAvatarTrack.mockResolvedValue(avatarVideo({ status: 'RENDERING', progressStage: 'QUEUED' }));
    service.status.mockResolvedValue({
      trackId: 't1', status: 'RENDERING', progress: 40, progressStage: 'PREPARING_CLIPS', progressDetail: 'Đọc track nhân vật 3D: 250 khung hình',
      renderStartedAt: null, errorCode: null, errorMessage: null, stale: false, updatedAt: '',
    });
    renderEditor();

    fireEvent.click(await screen.findByRole('button', { name: /Tạo video ký hiệu/ }));

    await waitFor(() => expect(service.uploadAvatarTrack).toHaveBeenCalled());
    expect(service.render).not.toHaveBeenCalled();
    expect(dictionary.motions).toHaveBeenCalledWith(['g-Chào mừng'], false);
    const [trackId, upload] = service.uploadAvatarTrack.mock.calls[0];
    expect(trackId).toBe('t1');
    expect(upload).toMatchObject({
      format: 'H264', fingerprint: 'fp-1', frameRate: '25', frameCount: 250,
      placements: [{ segmentIndex: 0, itemIndex: 0, startMs: 0, endMs: 1500, speed: 1, sourceMs: 1500 }],
    });
    const stages = await screen.findByRole('list', { name: 'Các bước dựng video' });
    expect(within(stages).getByText('Đọc track nhân vật 3D').closest('li')?.getAttribute('aria-current')).toBe('step');
  });

  it('takes the missing motions from the dictionary videos for the 3D avatar', async () => {
    service.get.mockResolvedValue(video({
      settings: { captionSource: 'PUBLISHED', renderMode: 'OVERLAY', renderer: 'AVATAR', signLanguage: 'VSL', region: 'VN', variant: null },
      segments: [sentence(0, [item('Chào mừng', { availability: 'NO_MOTION' }), item('bạn', { availability: 'NO_MOTION' })])],
    }));
    dictionary.get.mockImplementation(async (id: string) => ({ id, gloss: id, video: { url: 'v' }, usableForVideo: true, status: 'DRAFT' }));
    batch.takeMotions.mockResolvedValue({ saved: [{ id: 'g-Chào mừng' }, { id: 'g-bạn' }], failed: [] });
    renderEditor();

    fireEvent.click(await screen.findByRole('button', { name: 'Lấy chuyển động cho 2 ký hiệu' }));

    await waitFor(() => expect(batch.takeMotions).toHaveBeenCalled());
    expect(batch.takeMotions.mock.calls[0][0].map((g: { id: string }) => g.id)).toEqual(['g-Chào mừng', 'g-bạn']);
  });
});
