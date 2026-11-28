import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react';
import { Download, Eye, HandMetal, Map as MapIcon, RefreshCw, ScanLine, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAssetCaptions } from '@/hooks/use-platform-catalog';
import { signVideoKeys, useSignLanguageVideo, useSignVideoAction, useSignVideoProgress } from '@/hooks/use-sign-language-video';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import type { PlatformAsset } from '@/services/platform-catalog.service';
import {
  signLanguageVideoService,
  type SignAnalyzeInput,
  type SignLanguageVideo,
  type SignRendererKind,
  type SignSegment,
} from '@/services/sign-language-video.service';
import { signDictionaryService, type SignGlossMotion } from '@/services/sign-dictionary.service';
import { signDictionaryKeys } from '@/hooks/use-sign-dictionary';
import {
  NO_CAPTIONS_MESSAGE,
  NO_SIGN_MEDIA_MESSAGE,
  RENDERER_LABELS,
  RENDER_MODE_LABELS,
  SIGN_REVIEW_WARNING,
  countBlocking,
  formatBytes,
  regionLabel,
  renderStageLabel,
  seconds,
  signVideoState,
  skipBlocking,
  toSegmentInput,
} from '@/lib/sign-video';
import { lessonMediaUrl } from '@/types/learning-content';
import { errorMessage } from '../components/pulse-format';
import { ProgressMeter } from '@/features/sign-language/ProgressMeter';
import { usePhaseStart } from '@/features/sign-language/use-phase-start';
import type { BatchProgressView } from '@/features/sign-language/batch-motion';
import { percentOf } from '@/lib/progress';
import { SignMapEditor } from './SignMapEditor';
import { TranscriptEditor } from './TranscriptEditor';
import { SignAvatarProgress, SignRenderProgress, SignWorkflowSteps, type AvatarRun } from './SignVideoProgress';
import { SignVideoSettingsDialog } from './SignVideoSettingsDialog';
import './sign-video.css';

/** Messages of the sign-video API errors, by machine code (403 has no code: the permission filter answers it). */
function signErrorMessage(err: unknown) {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 403) return 'Bạn không có quyền chỉnh sửa nội dung khóa học (SIGN_PERMISSION_DENIED).';
  return errorMessage(err);
}

/** Motions of the signs, read 100 at a time (the API takes at most 300 per call). */
async function loadMotions(ids: string[]): Promise<SignGlossMotion[]> {
  const result: SignGlossMotion[] = [];
  for (let i = 0; i < ids.length; i += 100) result.push(...await signDictionaryService.motions(ids.slice(i, i + 100), false));
  return result;
}

/** Distinct signs of the map that the 3D avatar cannot perform yet because they have no motion. */
const signsWithoutMotion = (segments: SignSegment[]) =>
  [...new Set(segments.filter((s) => s.reviewStatus !== 'SKIPPED')
    .flatMap((s) => s.items.filter((i) => !i.skipped && i.availability === 'NO_MOTION' && i.glossId).map((i) => i.glossId!)))];

/**
 * "Video ngôn ngữ ký hiệu" of a video block (docs/specs/2026-11-24-sign-language-video.md). Step 1 is the transcript of
 * the video (TranscriptEditor: what is said and when, written by the AI on demand and checked by the admin; learners
 * never see it). The transcript last saved is matched to the sign dictionary (sign map), the admin checks and edits
 * the map, then one character signs the whole video: the 3D avatar
 * (default; rendered frame by frame in this browser on the lesson's frame grid, each sign when its word is spoken, then
 * composed by the server) or the dictionary videos of one real signer (joined by the server). The admin previews it and
 * publishes it. Nothing reads "made" until a real video file exists.
 */
export function SignLanguageVideoEditor({ asset, videoRef }: { asset: PlatformAsset; videoRef: RefObject<HTMLVideoElement | null> }) {
  const headingId = useId();
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const query = useSignLanguageVideo(asset.assetId);
  const captions = useAssetCaptions(asset.assetId);
  const action = useSignVideoAction(asset.assetId);
  const data = query.data;
  const live = useSignVideoProgress(data);

  const [dialog, setDialog] = useState<'create' | 'settings' | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirm, setConfirm] = useState<'rerender' | 'discard' | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [avatarRun, setAvatarRun] = useState<AvatarRun | null>(null);
  const [motionRun, setMotionRun] = useState<BatchProgressView | null>(null);
  const motionRunStart = usePhaseStart(motionRun?.phase ?? null);
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => abortRef.current?.abort(), []);
  const [segments, setSegments] = useState<SignSegment[]>([]);
  const [dirtyItems, setDirtyItems] = useState<Set<number>>(new Set());
  const [dirtyReview, setDirtyReview] = useState<Set<number>>(new Set());
  const dirty = dirtyItems.size + dirtyReview.size > 0;
  const previousStatus = useRef<string | undefined>(undefined);

  // The server map replaces the local copy unless the admin has unsaved edits.
  useEffect(() => {
    if (data && !dirty) setSegments(data.segments);
  }, [data, dirty]);

  // A transcript saved in step 1 changes what can be made here.
  const captionsVersion = `${captions.data?.publishedAt ?? ''}|${captions.data?.updatedAt ?? ''}`;
  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: signVideoKeys.video(asset.assetId) });
  }, [captionsVersion, asset.assetId, queryClient]);

  // Tell the admin when a background render ends.
  useEffect(() => {
    const status = data?.status;
    if (previousStatus.current === 'RENDERING' && status === 'READY') {
      toast.success('Đã dựng xong video ký hiệu. Xem trước và nhờ người biết ngôn ngữ ký hiệu duyệt trước khi xuất bản.');
      setPreviewOpen(true);
    } else if (previousStatus.current === 'RENDERING' && status === 'FAILED') {
      toast.error(data?.errorMessage ?? 'Dựng video ký hiệu chưa thành công.');
    }
    previousStatus.current = status;
  }, [data?.status, data?.errorMessage]);

  const blocking = useMemo(() => countBlocking(segments), [segments]);
  const withoutMotion = useMemo(() => signsWithoutMotion(segments), [segments]);

  if (query.isLoading) return <p className="pa-hint">Đang tải video ngôn ngữ ký hiệu…</p>;
  if (query.isError || !data) return <p className="notice warning">Không tải được video ngôn ngữ ký hiệu của video này.</p>;

  const prerequisites = data.prerequisites;
  const trackId = data.trackId;
  const rendering = data.status === 'RENDERING' && !data.stale;
  const working = avatarRun != null || motionRun != null;
  const busy = action.isPending || rendering || working;
  const state = signVideoState(data, analyzing);
  const progress = live?.progress ?? data.progress;
  const failed = data.status === 'FAILED' || (data.status === 'RENDERING' && data.stale);
  const output = data.output;
  const settings = data.settings;
  const missingMedia = prerequisites.usableSigns === 0;
  const createBlockers = [
    !prerequisites.hasCaptions ? NO_CAPTIONS_MESSAGE : null,
    prerequisites.hasCaptions && missingMedia ? NO_SIGN_MEDIA_MESSAGE : null,
    !prerequisites.rendererAvailable ? prerequisites.rendererMessage ?? 'Máy chủ chưa cấu hình bộ dựng video ký hiệu.' : null,
    !canManage ? 'Bạn không có quyền chỉnh sửa nội dung khóa học.' : null,
    !prerequisites.isLessonVideo ? 'Video này chưa được dùng trong bài học.' : null,
  ].filter((message): message is string => Boolean(message));
  const canRender = canManage && !busy && !dirty && data.renderBlockers.length === 0 && trackId != null;
  const renderer: SignRendererKind = settings?.renderer ?? 'AVATAR';
  const canPublish = canManage && !busy && !dirty && data.status === 'READY' && data.publishBlockers.length === 0;

  const run = async (request: () => Promise<SignLanguageVideo>, done?: string) => {
    try {
      const result = await action.mutateAsync(request);
      setDirtyItems(new Set());
      setDirtyReview(new Set());
      setSegments(result.segments);
      if (done) toast.success(done);
      return result;
    } catch (err) {
      toast.error(signErrorMessage(err));
      return null;
    }
  };

  /**
   * 3D avatar: the browser renders the avatar track (the server checks the map first), uploads it, and the server
   * composes it with the lesson video. The tab must stay open until the upload is done (a "Dừng" button stops it).
   */
  const renderAvatar = async (id: string) => {
    const controller = new AbortController();
    abortRef.current = controller;
    const startedAt = new Date().toISOString();
    setAvatarRun({ step: 'prepare', percent: 0, detail: 'Kiểm tra bản đồ ký hiệu và đọc chuyển động', startedAt });
    try {
      const job = await signLanguageVideoService.avatarJob(id);
      const motions = await loadMotions(job.signs.map((sign) => sign.glossId));
      const { renderAvatarTrack } = await import('@/features/sign-language/avatar-track-render');
      const track = await renderAvatarTrack(job, motions, {
        signal: controller.signal,
        onProgress: (p) => setAvatarRun({
          step: p.phase, percent: percentOf(p.done, p.total), detail: p.detail, startedAt,
        }),
      });
      setAvatarRun({ step: 'upload', percent: 0, detail: `Tải track nhân vật lên máy chủ (${formatBytes(track.blob.size)})`, startedAt });
      const started = await run(() => signLanguageVideoService.uploadAvatarTrack(id, {
        file: track.blob, format: track.format, fingerprint: job.fingerprint, frameRate: job.frameRate, frameCount: track.frameCount,
        transparent: track.transparent,
        placements: track.placements.map(({ segmentIndex, itemIndex, startMs, endMs, speed, sourceMs }) => ({ segmentIndex, itemIndex, startMs, endMs, speed, sourceMs })),
      }, (percent) => setAvatarRun({ step: 'upload', percent, detail: `Tải track nhân vật lên máy chủ: ${percent}% của ${formatBytes(track.blob.size)}`, startedAt })),
      'Đã dựng xong nhân vật 3D. Máy chủ đang ghép nhân vật vào video bài giảng.');
      if (started && track.warnings.length > 0) toast.warning(track.warnings[0]);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') toast.info('Đã dừng dựng nhân vật 3D. Chưa có gì thay đổi.');
      else toast.error((err as { response?: unknown })?.response ? signErrorMessage(err) : (err as Error)?.message ?? 'Dựng nhân vật 3D chưa thành công.');
    } finally {
      abortRef.current = null;
      setAvatarRun(null);
    }
  };

  /** "Tạo video ký hiệu": the avatar is rendered here first; dictionary clips are joined by the server. */
  const startRender = (id: string, kind: SignRendererKind, force: boolean, done?: string) =>
    kind === 'AVATAR'
      ? renderAvatar(id)
      : run(() => signLanguageVideoService.render(id, force), done ?? 'Đã bắt đầu dựng video ký hiệu. Kết quả tự hiện ở đây.');

  /** Motions of the signs that have a video but no motion yet, taken here (MediaPipe) and saved in the dictionary. */
  const takeMissingMotions = async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    const reading = (done: number) => setMotionRun({
      phase: 'find', label: `Đọc ${withoutMotion.length} ký hiệu trong từ điển`, detail: `${done}/${withoutMotion.length}`, percent: percentOf(done, withoutMotion.length),
    });
    reading(0);
    try {
      let read = 0;
      const glosses = await Promise.all(withoutMotion.map((id) => signDictionaryService.get(id).then((gloss) => { read += 1; reading(read); return gloss; })));
      const { batchProgressView, takeMotions } = await import('@/features/sign-language/batch-motion');
      const result = await takeMotions(glosses, {
        signal: controller.signal,
        onProgress: (p) => setMotionRun(batchProgressView(p)),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: signVideoKeys.video(asset.assetId) }),
        queryClient.invalidateQueries({ queryKey: signDictionaryKeys.all }),
      ]);
      if (result.saved.length > 0) toast.success(`Đã lấy chuyển động cho ${result.saved.length} ký hiệu.`);
      if (result.failed.length > 0) {
        toast.warning(`Chưa lấy được ${result.failed.length} ký hiệu: ${result.failed.slice(0, 3).map((f) => `“${f.gloss}” (${f.reason})`).join(', ')}.`);
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') toast.info('Đã dừng lấy chuyển động.');
      else toast.error(signErrorMessage(err));
    } finally {
      abortRef.current = null;
      setMotionRun(null);
    }
  };

  const analyze = async (input: SignAnalyzeInput, renderNow: boolean) => {
    setAnalyzing(true);
    const result = await run(() => signLanguageVideoService.analyze(asset.assetId, input)).finally(() => setAnalyzing(false));
    if (!result) return;
    setDialog(null);
    setMapOpen(true);
    if (renderNow && result.trackId && result.renderBlockers.length === 0) {
      await startRender(result.trackId, input.renderer, false);
    } else if (result.missing.length > 0 || result.renderBlockers.length > 0) {
      const missing = countBlocking(result.segments);
      toast.warning(missing > 0
        ? `Còn ${missing} từ chưa có ký hiệu dùng được. Chọn ký hiệu trong bản đồ, thêm vào Từ điển ký hiệu, hoặc bấm “Bỏ qua ${missing} từ chưa có ký hiệu” để dựng video với các ký hiệu đã có.`
        : result.renderBlockers[0] ?? 'Chưa dựng được video ký hiệu.');
    }
  };

  const viewMap = async () => {
    if (trackId) {
      setMapOpen((open) => !open);
      return;
    }
    // First look at the map: analyse the saved transcript with the defaults, nothing rendered.
    setAnalyzing(true);
    const result = await run(() => signLanguageVideoService.analyze(asset.assetId, {
      captionSource: 'DRAFT', renderMode: 'OVERLAY', renderer: 'AVATAR', region: 'VN',
    })).finally(() => setAnalyzing(false));
    if (result) setMapOpen(true);
  };

  const save = () => {
    if (!trackId) return Promise.resolve(null);
    const indexes = [...new Set([...dirtyItems, ...dirtyReview])].sort((a, b) => a - b);
    const empty = segments.find((s) => indexes.includes(s.index) && s.items.some((item) => !item.sourceText.trim()));
    if (empty) {
      toast.error(`Câu ${empty.index + 1} có ký hiệu chưa có chữ. Nhập chữ hoặc xóa ký hiệu đó.`);
      return Promise.resolve(null);
    }
    const body = segments.filter((s) => indexes.includes(s.index)).map((s) => toSegmentInput(s, dirtyItems.has(s.index)));
    return run(() => signLanguageVideoService.saveSegments(trackId, body), 'Đã lưu bản đồ ký hiệu.');
  };

  // Skip every sign that stops the render (explicit choice of the admin), save, then render with the signs that exist.
  const skipAndRender = async () => {
    setConfirmSkip(false);
    if (!trackId) return;
    const skipped = skipBlocking(segments);
    if (skipped.count === 0) return;
    const indexes = new Set([...skipped.changed, ...dirtyItems, ...dirtyReview]);
    const body = skipped.segments
      .filter((s) => indexes.has(s.index))
      .map((s) => toSegmentInput(s, skipped.changed.includes(s.index) || dirtyItems.has(s.index)));
    const saved = await run(() => signLanguageVideoService.saveSegments(trackId, body));
    if (!saved) return;
    if (saved.renderBlockers.length > 0) {
      toast.error(saved.renderBlockers[0]);
      return;
    }
    toast.info(`Đã bỏ qua ${skipped.count} từ chưa có ký hiệu. Các từ đã bỏ qua vẫn hiện trong bản đồ, dùng lại được.`);
    await startRender(trackId, renderer, false, 'Đã bắt đầu dựng video với các ký hiệu đã có.');
  };

  const render = (force: boolean) => {
    setConfirm(null);
    return trackId ? startRender(trackId, renderer, force, 'Đã bắt đầu dựng video ký hiệu. Bạn cứ sửa các khối khác, kết quả tự hiện ở đây.') : null;
  };

  const playFrom = (ms: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = ms / 1000;
    void video.play?.()?.catch(() => undefined);
  };

  const summary = data.summary;
  const speechSegments = summary.segments - summary.nonSpeechSegments - summary.skippedSegments;

  return (
    <section className="pa-cap pa-sv" aria-labelledby={headingId}>
      <div className="pa-cap-head">
        <div className="pa-min0">
          <h4 id={headingId}>Video ngôn ngữ ký hiệu</h4>
          <p className="pa-hint">Cho người khiếm thính dùng ngôn ngữ ký hiệu: từ lời thoại của video, một nhân vật ra dấu suốt video, mỗi ký hiệu đúng lúc từ đó được nói.</p>
        </div>
        <span className={`pill ${state.tone}`} role="status">{state.label}</span>
      </div>

      <TranscriptEditor key={asset.assetId} asset={asset} videoRef={videoRef} collapsed={Boolean(trackId)} />

      {(trackId || analyzing) && <SignWorkflowSteps data={data} analyzing={analyzing} />}

      {trackId && <p className="notice pa-sv-warning">{SIGN_REVIEW_WARNING}</p>}

      {!trackId && createBlockers.length > 0 && (
        <div className="notice warning" role="alert">
          {createBlockers.map((message) => <p key={message}>{message}</p>)}
          {prerequisites.hasCaptions && missingMedia && (
            <a className="pa-sv-link" href="/platform/sign-dictionary" target="_blank" rel="noreferrer">Mở Từ điển ký hiệu</a>
          )}
        </div>
      )}

      {data.captionsChanged && !rendering && (
        <div className="notice warning pa-sv-inline" role="status">
          <span>Lời thoại đã thay đổi sau lần phân tích. Phân tích lại để video ký hiệu theo đúng lời thoại.</span>
          {canManage && settings && (
            <button type="button" className="btn btn-outline btn-small" disabled={busy || dirty}
              onClick={() => void analyze({ ...settings, captionSource: 'DRAFT' }, false)}>
              <RefreshCw size={14} aria-hidden="true" /> Phân tích lại
            </button>
          )}
        </div>
      )}

      {analyzing && (
        <p className="notice pa-sv-inline" role="status">Đang phân tích lời thoại: tách từng câu và tìm ký hiệu trong từ điển…</p>
      )}

      {avatarRun && (
        <SignAvatarProgress run={avatarRun} onStop={() => abortRef.current?.abort()} />
      )}

      {motionRun && (
        <ProgressMeter
          label={motionRun.label}
          percent={motionRun.percent}
          detail={motionRun.detail}
          startedAt={motionRunStart}
          onStop={() => abortRef.current?.abort()}
        />
      )}

      {rendering && (
        <SignRenderProgress
          renderer={renderer}
          stage={live?.progressStage ?? data.progressStage}
          detail={live?.progressDetail ?? data.progressDetail}
          progress={progress}
          startedAt={live?.renderStartedAt ?? data.renderStartedAt}
          failed={false}
        />
      )}

      {failed && (
        <div className="notice warning pa-sv-inline" role="alert">
          <span>
            {data.progressStage && <strong>Lỗi ở bước “{renderStageLabel(data.progressStage, renderer)}”. </strong>}
            {data.errorMessage ?? 'Dựng video ký hiệu chưa thành công.'}{data.errorCode ? ` (${data.errorCode})` : ''}
          </span>
          {canManage && trackId && (
            <button type="button" className="btn btn-primary btn-small" disabled={action.isPending || working}
              onClick={() => void (renderer === 'AVATAR'
                ? renderAvatar(trackId)
                : run(() => signLanguageVideoService.retry(trackId), 'Đã bắt đầu dựng lại video ký hiệu.'))}>
              Thử lại
            </button>
          )}
        </div>
      )}

      {trackId && settings && (
        <p className="pa-hint pa-sv-summary">
          <strong>{summary.readySegments}/{speechSegments}</strong> câu có lời đủ ký hiệu
          {summary.missingItems + summary.ambiguousItems + summary.unavailableItems > 0 && (
            <> · <strong className="pa-danger-text">{summary.missingItems + summary.ambiguousItems + summary.unavailableItems}</strong> ký hiệu còn thiếu</>
          )}
          {summary.unreviewedSegments > 0 && <> · {summary.unreviewedSegments} câu chờ duyệt</>}
          {' · '}{RENDERER_LABELS[settings.renderer]} · {RENDER_MODE_LABELS[settings.renderMode]} · {settings.signLanguage} {regionLabel(settings.region)}
        </p>
      )}

      {(canManage || trackId) && (
        <div className="pa-cap-actions">
          {confirm ? (
            <div className="pa-cap-confirm" role="group" aria-label={confirm === 'rerender' ? 'Xác nhận tạo lại video' : 'Xác nhận hủy bản nháp'}>
              <span>
                {confirm === 'rerender'
                  ? 'Dựng lại video ký hiệu từ bản đồ hiện tại. Người học vẫn xem bản đã xuất bản cho tới khi bạn xuất bản bản mới.'
                  : data.published
                    ? 'Bỏ mọi thay đổi chưa xuất bản và quay về bản người học đang xem.'
                    : 'Xóa bản đồ ký hiệu và video chưa xuất bản của video này.'}
              </span>
              <button type="button" className="btn btn-primary btn-small" disabled={busy}
                onClick={() => (confirm === 'rerender' ? void render(true) : trackId && void run(() => signLanguageVideoService.discardDraft(trackId), 'Đã hủy bản nháp video ký hiệu.').then(() => setConfirm(null)))}>
                {confirm === 'rerender' ? 'Tạo lại' : 'Hủy bản nháp'}
              </button>
              <button type="button" className="btn btn-outline btn-small" onClick={() => setConfirm(null)}>Thôi</button>
            </div>
          ) : (
            <>
              {!canManage ? null : !trackId ? (
                <button type="button" className="btn btn-primary btn-small" disabled={busy || createBlockers.length > 0}
                  title={createBlockers[0]} onClick={() => setDialog('create')}>
                  <HandMetal size={15} aria-hidden="true" /> Tạo video ký hiệu
                </button>
              ) : output && !data.outputOutdated ? (
                <button type="button" className="btn btn-outline btn-small" disabled={busy || dirty} onClick={() => setConfirm('rerender')}>
                  <RefreshCw size={15} aria-hidden="true" /> Tạo lại video
                </button>
              ) : (
                <button type="button" className="btn btn-primary btn-small" disabled={!canRender}
                  title={dirty ? 'Lưu bản nháp trước khi dựng video.' : data.renderBlockers[0]} onClick={() => void render(false)}>
                  <HandMetal size={15} aria-hidden="true" /> Tạo video ký hiệu
                </button>
              )}
              <button type="button" className="btn btn-outline btn-small" disabled={(busy && !trackId) || !prerequisites.hasCaptions || (!trackId && !canManage)}
                onClick={() => void viewMap()}
                aria-expanded={trackId ? mapOpen : undefined}>
                <MapIcon size={15} aria-hidden="true" /> {mapOpen && trackId ? 'Ẩn bản đồ ký hiệu' : 'Xem bản đồ ký hiệu'}
              </button>
              {canManage && trackId && (
                <button type="button" className="btn btn-outline btn-small" disabled={busy || dirty} onClick={() => setDialog('settings')}>
                  <Settings2 size={15} aria-hidden="true" /> Chỉnh sửa
                </button>
              )}
              {output && (
                <button type="button" className="btn btn-outline btn-small" aria-expanded={previewOpen} onClick={() => setPreviewOpen((open) => !open)}>
                  <Eye size={15} aria-hidden="true" /> {previewOpen ? 'Ẩn xem trước' : 'Xem trước'}
                </button>
              )}
              {output && (
                <a className="btn btn-light btn-small" href={lessonMediaUrl(output.url)} download={output.fileName}>
                  <Download size={15} aria-hidden="true" /> Tải video xuống
                </a>
              )}
              {canManage && trackId && data.status !== 'PUBLISHED' && (
                <button type="button" className="btn btn-ghost btn-small pa-danger-text" disabled={busy} onClick={() => setConfirm('discard')}>
                  Hủy bản nháp
                </button>
              )}
            </>
          )}
        </div>
      )}

      {trackId && !output && !rendering && data.renderBlockers.length > 0 && (
        <div className="notice warning" role="alert">
          {data.renderBlockers.slice(0, 3).map((message) => <p key={message}>{message}</p>)}
          {data.renderBlockers.length > 3 && <p>… và {data.renderBlockers.length - 3} vấn đề khác trong bản đồ ký hiệu.</p>}
        </div>
      )}

      {canManage && trackId && renderer === 'AVATAR' && withoutMotion.length > 0 && !rendering && !working && (
        <div className="pa-cap-actions">
          <button type="button" className="btn btn-primary btn-small" disabled={busy || dirty} onClick={() => void takeMissingMotions()}>
            <ScanLine size={15} aria-hidden="true" /> Lấy chuyển động cho {withoutMotion.length} ký hiệu
          </button>
          <span className="pa-hint">từ video trong Từ điển ký hiệu (chỉ video đã ghi nguồn, giấy phép và sự đồng ý), ngay trên trình duyệt này.</span>
        </div>
      )}

      {canManage && trackId && blocking > 0 && !rendering && (
        confirmSkip ? (
          <div className="pa-cap-confirm" role="group" aria-label="Xác nhận bỏ qua các từ chưa có ký hiệu">
            <span>
              {blocking} từ sẽ không được ra dấu (vẫn hiện gạch ngang trong bản đồ, bấm “Dùng lại từ này” bất cứ lúc nào).
              Video được dựng với các ký hiệu đã có; người duyệt vẫn phải duyệt từng câu trước khi xuất bản.
            </span>
            <button type="button" className="btn btn-primary btn-small" disabled={busy} onClick={() => void skipAndRender()}>
              Bỏ qua và dựng video
            </button>
            <button type="button" className="btn btn-outline btn-small" onClick={() => setConfirmSkip(false)}>Thôi</button>
          </div>
        ) : (
          <div className="pa-cap-actions">
            <button type="button" className="btn btn-outline btn-small" disabled={busy} onClick={() => setConfirmSkip(true)}>
              Bỏ qua {blocking} từ chưa có ký hiệu và dựng video
            </button>
            <span className="pa-hint">hoặc chọn ký hiệu cho từng từ trong bản đồ, hay thêm chúng vào Từ điển ký hiệu.</span>
          </div>
        )
      )}

      {data.missing.length > 0 && (
        <details className="pa-sv-missing" open={!mapOpen}>
          <summary>Ký hiệu còn thiếu ({data.missing.reduce((sum, word) => sum + word.count, 0)})</summary>
          <ul>
            {data.missing.slice(0, 30).map((word) => (
              <li key={`${word.text}-${word.reason}`}>
                <strong>“{word.text}”</strong> ×{word.count} · câu {word.segments.slice(0, 6).join(', ')}{word.segments.length > 6 ? '…' : ''} — {word.reason}
                {word.hint === 'FUNCTION_WORD' && <span className="pa-hint"> (hư từ, thường được lược)</span>}
              </li>
            ))}
          </ul>
        </details>
      )}

      {data.warnings.length > 0 && mapOpen && (
        <ul className="pa-sv-warnings">
          {data.warnings.slice(0, 5).map((warning) => <li key={warning}>{warning}</li>)}
        </ul>
      )}

      {previewOpen && output && (
        <figure className="pa-sv-preview">
          <video src={lessonMediaUrl(output.url)} controls preload="metadata" playsInline aria-label="Xem trước video ngôn ngữ ký hiệu" />
          <figcaption className="pa-hint">
            {RENDER_MODE_LABELS[output.renderMode]} · {seconds(output.durationMs)} · {output.width}×{output.height} · {formatBytes(output.sizeBytes)}
            {data.outputOutdated && <strong className="pa-danger-text"> · Bản đồ đã đổi sau lần dựng này, hãy dựng lại.</strong>}
          </figcaption>
        </figure>
      )}

      {mapOpen && trackId && settings && (
        <SignMapEditor
          segments={segments}
          context={{ renderer: settings.renderer, signLanguage: settings.signLanguage, region: settings.region, variant: settings.variant }}
          editable={canManage && !busy}
          onPlay={playFrom}
          onChange={(segment, itemsChanged) => {
            setSegments((list) => list.map((s) => (s.index === segment.index ? segment : s)));
            (itemsChanged ? setDirtyItems : setDirtyReview)((set) => new Set(set).add(segment.index));
          }}
        />
      )}

      {trackId && (
        <div className="pa-cap-foot">
          <span className="pa-hint">
            {data.published
              ? `Người học đang xem video ký hiệu xuất bản ${data.published.at ? new Date(data.published.at).toLocaleString('vi-VN') : ''}.`
              : 'Người học chưa có video ngôn ngữ ký hiệu.'}
            {dirty ? ' Có thay đổi chưa lưu.' : ''}
          </span>
          {canManage && (
            <div className="pa-cap-actions">
              <button type="button" className="btn btn-outline btn-small" onClick={() => void save()} disabled={busy || !dirty}>
                Lưu bản nháp
              </button>
              <button type="button" className="btn btn-primary btn-small" disabled={!canPublish}
                title={data.publishBlockers[0]}
                onClick={() => void run(() => signLanguageVideoService.publish(trackId), 'Đã xuất bản video ngôn ngữ ký hiệu. Người học thấy ngay.')}>
                Xuất bản video ký hiệu
              </button>
            </div>
          )}
        </div>
      )}
      {trackId && output && data.status !== 'PUBLISHED' && !rendering && data.publishBlockers.length > 0 && (
        <ul className="pa-sv-blockers" aria-label="Chưa xuất bản được vì">
          {data.publishBlockers.slice(0, 4).map((message) => <li key={message}>{message}</li>)}
        </ul>
      )}

      {dialog && (
        <SignVideoSettingsDialog
          data={data}
          mode={dialog}
          busy={action.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(input, renderNow) => void analyze(input, renderNow)}
        />
      )}
    </section>
  );
}
