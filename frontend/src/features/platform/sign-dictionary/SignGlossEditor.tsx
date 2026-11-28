import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Pause, Play, ScanLine, ShieldCheck, Timer, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useSignGloss, useSignGlossAction, useSignMotions } from '@/hooks/use-sign-dictionary';
import {
  SIGN_KIND_LABELS,
  signDictionaryService,
  type SignGloss,
  type SignGlossInput,
  type SignGlossKind,
} from '@/services/sign-dictionary.service';
import { formatCueTime, parseCueTime } from '@/lib/captions';
import {
  base64ToBytes,
  bytesToBase64,
  decodeMotion,
  encodeMotion,
  motionCoverage,
  MOTION_LAYOUT_V1,
  type MotionFrame,
} from '@/features/sign-language/motion-format';
import { buildClip } from '@/features/sign-language/sign-rig';
import { errorMessage } from '../components/pulse-format';
import { VIDEO_ACCEPT, fileProblem, useAssetUpload } from '../builder/use-asset-upload';
import { STATUS_LABELS, formatDuration, signMeta, signProgress } from './sign-labels';
import { ProgressMeter } from '@/features/sign-language/ProgressMeter';
import { usePhaseStart } from '@/features/sign-language/use-phase-start';
import { percentOf } from '@/lib/progress';
import { formatBytes } from '@/lib/sign-video';
import { REGION_LABELS } from '@/lib/sign-video';

const SignAvatarView = lazy(() => import('@/features/sign-language/SignAvatarView'));

const FPS_CHOICES = [15, 20, 30];
const MAX_SIGN_MS = 20_000;

interface Draft { frames: MotionFrame[]; fps: number; startMs: number; endMs: number }
/** Taking the motion: getting ready, the recognition model download (first use only, bytes), then the frames. */
interface Extracting { phase: 'prepare' | 'model' | 'frames'; done: number; total: number }
const EXTRACT_LABELS: Record<Extracting['phase'], string> = {
  prepare: 'Chuẩn bị phân tích',
  model: 'Tải mô hình nhận dạng (chỉ lần đầu)',
  frames: 'Phân tích từng khung hình',
};
/** The action running, for its button ("Đang lưu…"): these take under a second, so they show no percent. */
type Pending = 'create' | 'save' | 'video' | 'motion' | 'publish' | 'archive';
type Tab = 'sign' | 'info' | 'rights';

/** Keeps the typed time until the field loses focus (same format as the caption editor: "1:05.2"). */
function TimeInput({ label, valueMs, onChange }: { label: string; valueMs: number; onChange: (ms: number) => void }) {
  const [text, setText] = useState(formatCueTime(valueMs));
  useEffect(() => setText(formatCueTime(valueMs)), [valueMs]);
  return (
    <input
      className="pa-sd-time"
      aria-label={label}
      value={text}
      inputMode="decimal"
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        const ms = parseCueTime(text);
        if (ms == null) setText(formatCueTime(valueMs));
        else onChange(ms);
      }}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
    />
  );
}

const EMPTY_FORM: SignGlossInput = {
  gloss: '', kind: 'WORD', sourceName: '', sourceUrl: '', licenseNote: '', mirrored: false,
  region: 'VN', variant: '', isPreferred: false, priority: 0, synonyms: [], consentConfirmed: false, signerName: '',
};

const formOf = (gloss: SignGloss): SignGlossInput => ({
  gloss: gloss.gloss, kind: gloss.kind, videoAssetId: gloss.video?.assetId ?? null, sourceName: gloss.sourceName ?? '',
  sourceUrl: gloss.sourceUrl ?? '', licenseNote: gloss.licenseNote ?? '', mirrored: gloss.mirrored,
  region: gloss.region ?? 'VN', variant: gloss.variant ?? '', isPreferred: gloss.isPreferred ?? false, priority: gloss.priority ?? 0,
  synonyms: gloss.synonyms ?? [], consentConfirmed: gloss.consentConfirmed ?? false, signerName: gloss.signerName ?? '',
});

const splitSynonyms = (text: string) => text.split(/[,;\n]/).map((word) => word.trim()).filter(Boolean);

/**
 * One sign, in three tabs: "Ra dấu" (the video, the motion taken from it in the browser with MediaPipe, the avatar
 * playing it), "Thông tin" (text, kind, region, variant) and "Nguồn & quyền" (source, licence, consent). A stepper
 * says what is next: video → motion → publish. `glossId` null = a new sign (only its text until it is saved).
 */
export function SignGlossEditor({ glossId, canManage, onCreated, onArchived, onCancel, initialGloss }: {
  glossId: string | null;
  canManage: boolean;
  /** Text of a new sign (from "Thêm vào Từ điển ký hiệu" in the sign map). */
  initialGloss?: string;
  onCreated: (gloss: SignGloss) => void;
  onArchived: () => void;
  onCancel?: () => void;
}) {
  const detail = useSignGloss(glossId ?? undefined);
  const gloss = detail.data;
  const action = useSignGlossAction();
  const { upload, progress: uploadProgress } = useAssetUpload();
  const fileInput = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [tab, setTab] = useState<Tab>('sign');
  const [form, setForm] = useState<SignGlossInput>({ ...EMPTY_FORM, gloss: initialGloss ?? '' });
  const [synonymText, setSynonymText] = useState('');
  const [fps, setFps] = useState(20);
  const [range, setRange] = useState<{ startMs: number; endMs: number } | null>(null);
  const [extracting, setExtracting] = useState<Extracting | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [videoLoad, setVideoLoad] = useState<{ loaded: number; total: number } | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [playing, setPlaying] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState(false);

  useEffect(() => {
    if (!gloss) return;
    setForm(formOf(gloss));
    setSynonymText((gloss.synonyms ?? []).join(', '));
    if (gloss.motionFps) setFps(gloss.motionFps);
    if (gloss.motionStartMs != null && gloss.motionEndMs != null) setRange({ startMs: gloss.motionStartMs, endMs: gloss.motionEndMs });
  }, [gloss]);

  // The video as a local blob: MediaPipe must read its pixels.
  const videoBlob = useQuery({
    queryKey: ['sign-video', gloss?.video?.assetId],
    queryFn: () => signDictionaryService.videoBlob(gloss!.video!.url, (loaded, total) => setVideoLoad({ loaded, total })),
    enabled: Boolean(gloss?.video),
    staleTime: Infinity,
  });
  const videoUrl = useMemo(() => (videoBlob.data ? URL.createObjectURL(videoBlob.data) : null), [videoBlob.data]);
  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl); }, [videoUrl]);

  const saved = useSignMotions(gloss?.hasMotion ? [gloss.id] : [], false, Boolean(gloss?.hasMotion));
  const savedMotion = saved.data?.[0];
  const mirrored = Boolean(form.mirrored);
  const clip = useMemo(() => {
    if (draft) return buildClip(draft.frames, draft.fps, mirrored);
    if (savedMotion) return buildClip(decodeMotion(base64ToBytes(savedMotion.data), savedMotion.frames), savedMotion.fps, mirrored);
    return null;
  }, [draft, savedMotion, mirrored]);
  const coverage = useMemo(() => (draft ? motionCoverage(draft.frames) : null), [draft]);
  const videoLoadStart = usePhaseStart(videoBlob.isFetching ? 'video' : null);
  const uploadStart = usePhaseStart(uploadProgress !== null ? 'upload' : null);
  const extractStart = usePhaseStart(extracting?.phase ?? null);

  if (glossId && detail.isLoading) return <p className="pa-sd-loading">Đang tải ký hiệu…</p>;
  if (glossId && !gloss) return <p className="notice warning">Không tải được ký hiệu.</p>;

  const busy = action.isPending || extracting !== null || uploadProgress !== null;
  const archived = gloss?.status === 'ARCHIVED';
  const editable = canManage && !archived;
  const run = async (request: () => Promise<SignGloss>, done: string | undefined, key: Pending) => {
    setPending(key);
    try {
      const result = await action.mutateAsync(request);
      if (done) toast.success(done);
      return result;
    } catch (err) {
      toast.error(errorMessage(err));
      return null;
    } finally {
      setPending(null);
    }
  };

  const body = (): SignGlossInput => ({
    ...form,
    sourceName: form.sourceName || null, sourceUrl: form.sourceUrl || null, licenseNote: form.licenseNote || null,
    variant: form.variant || null, signerName: form.signerName || null,
    synonyms: splitSynonyms(synonymText),
  });
  // A video of a person signing enters the dictionary only with its source, licence and the owner's consent.
  const rightsRecorded = Boolean(form.sourceName?.trim() && form.licenseNote?.trim() && form.consentConfirmed);
  const dirty = gloss != null
    && JSON.stringify({ ...formOf(gloss), synonyms: gloss.synonyms ?? [] }) !== JSON.stringify({ ...form, synonyms: splitSynonyms(synonymText) });
  const saveInfo = async () => {
    if (!gloss) {
      const created = await run(() => signDictionaryService.create(body()), 'Đã thêm ký hiệu.', 'create');
      if (created) onCreated(created);
      return;
    }
    await run(() => signDictionaryService.update(gloss.id, body()), 'Đã lưu.', 'save');
  };

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !gloss) return;
    const problem = fileProblem(file, 'VIDEO');
    if (problem) {
      toast.error(problem);
      return;
    }
    setUploadFile(file);
    try {
      const asset = await upload(file);
      setDraft(null);
      setRange(null);
      await run(() => signDictionaryService.update(gloss.id, { ...body(), videoAssetId: asset.assetId }), 'Đã đổi video. Lấy lại chuyển động trước khi xuất bản.', 'video');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploadFile(null);
    }
  };

  const videoDurationMs = () => Math.round((videoRef.current?.duration || 0) * 1000);
  const currentRange = () => range ?? { startMs: 0, endMs: Math.min(videoDurationMs(), MAX_SIGN_MS) };
  const nowMs = () => Math.round((videoRef.current?.currentTime ?? 0) * 1000);

  const extract = async () => {
    const video = videoRef.current;
    if (!video) return;
    const { startMs, endMs } = currentRange();
    if (endMs <= startMs) {
      toast.error('Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }
    if (endMs - startMs > MAX_SIGN_MS) {
      toast.error('Một ký hiệu dài tối đa 20 giây. Chọn đoạn ngắn hơn.');
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setExtracting({ phase: 'prepare', done: 0, total: 1 });
    try {
      const { extractMotion } = await import('@/features/sign-language/extract-motion');
      const frames = await extractMotion(video, {
        fps, startMs, endMs, signal: controller.signal,
        onLoad: (loaded, total) => { if (loaded < total) setExtracting({ phase: 'model', done: loaded, total }); },
        onProgress: (done, total) => setExtracting({ phase: 'frames', done, total }),
      });
      setDraft({ frames, fps, startMs, endMs });
      setPlaying(true);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') toast.error(`Không lấy được chuyển động: ${errorMessage(err)}`);
    } finally {
      setExtracting(null);
      abortRef.current = null;
    }
  };

  const saveMotion = async () => {
    if (!gloss || !draft) return;
    const result = await run(() => signDictionaryService.saveMotion(gloss.id, {
      layout: MOTION_LAYOUT_V1, fps: draft.fps, frames: draft.frames.length, startMs: draft.startMs, endMs: draft.endMs,
      data: bytesToBase64(encodeMotion(draft.frames)),
    }), 'Đã lưu chuyển động.', 'motion');
    if (result) setDraft(null);
  };

  const weak = coverage && (coverage.pose < 0.8 || Math.max(coverage.leftHand, coverage.rightHand) < 0.5);
  const progress = gloss ? signProgress(gloss) : null;
  const meta = gloss ? [signMeta(gloss), gloss.hasMotion ? formatDuration(gloss.durationMs) : ''].filter(Boolean).join(' · ') : '';

  const infoFields = (
    <div className="pa-sd-form">
      <label className="pa-sd-f">
        <span>Chữ của ký hiệu</span>
        <input value={form.gloss} maxLength={100} onChange={(e) => setForm({ ...form, gloss: e.target.value })} placeholder="Ví dụ: Xin chào, Dữ liệu, A" autoFocus={!gloss} />
      </label>
      <label className="pa-sd-f">
        <span>Loại</span>
        <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as SignGlossKind })}>
          {(Object.keys(SIGN_KIND_LABELS) as SignGlossKind[]).map((kind) => <option key={kind} value={kind}>{SIGN_KIND_LABELS[kind]}</option>)}
        </select>
      </label>
      <label className="pa-sd-f">
        <span>Vùng miền</span>
        <select value={form.region ?? 'VN'} onChange={(e) => setForm({ ...form, region: e.target.value })}>
          {Object.entries(REGION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="pa-sd-f">
        <span>Biến thể</span>
        <input value={form.variant ?? ''} maxLength={50} onChange={(e) => setForm({ ...form, variant: e.target.value })} placeholder="Ví dụ: ngữ cảnh tin học" />
      </label>
      {gloss && (
        <>
          <label className="pa-sd-f pa-sd-wide">
            <span>Từ đồng nghĩa</span>
            <input value={synonymText} onChange={(e) => setSynonymText(e.target.value)} placeholder="Cách nhau bằng dấu phẩy, ví dụ: cám ơn, cảm tạ" />
          </label>
          <label className="pa-sd-f">
            <span>Ưu tiên</span>
            <input type="number" min={-1000} max={1000} value={form.priority ?? 0} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) || 0 })} />
          </label>
          <label className="pa-sd-check pa-sd-check--inline">
            <input type="checkbox" checked={Boolean(form.isPreferred)} onChange={(e) => setForm({ ...form, isPreferred: e.target.checked })} />
            Ký hiệu mặc định của từ này
          </label>
          <p className="pa-sd-note pa-sd-wide">Một từ có nhiều ký hiệu thì ký hiệu mặc định được dùng trước, rồi đến số ưu tiên cao hơn.</p>
        </>
      )}
    </div>
  );

  // ── New sign: just its text, the rest comes once it exists ─────────────────────────────────────────────
  if (!gloss) {
    return (
      <div className="pa-sd-editor">
        <header className="pa-sd-ed-head">
          <div>
            <h2>Ký hiệu mới</h2>
            <p className="pa-sd-ed-meta">Sau khi thêm: ghi nguồn và quyền, tải video, lấy chuyển động.</p>
          </div>
        </header>
        <fieldset className="pa-sd-fieldset" disabled={!editable || busy}>{infoFields}</fieldset>
        {editable && (
          <footer className="pa-sd-ed-foot">
            {onCancel && <button type="button" className="btn btn-ghost btn-small" onClick={onCancel}>Hủy</button>}
            <button type="button" className="btn btn-primary btn-small" onClick={saveInfo} disabled={busy || !form.gloss.trim()}>{pending === 'create' ? 'Đang thêm…' : 'Thêm ký hiệu'}</button>
          </footer>
        )}
      </div>
    );
  }

  const hint = progress?.next === 'VIDEO'
    ? (rightsRecorded ? 'Tải lên video một người ra dấu từ này.' : 'Ghi nguồn và quyền sử dụng, rồi tải lên video một người ra dấu từ này.')
    : progress?.next === 'MOTION'
      ? 'Chọn đoạn ra dấu trong video rồi lấy chuyển động. Chạy ngay trên trình duyệt, video không gửi đi đâu.'
      : progress?.next === 'PUBLISH'
        ? 'Xem nhân vật ra dấu thử. Đúng rồi thì xuất bản.'
        : gloss.usableForVideo ? 'Ký hiệu đang được dùng cho video ngôn ngữ ký hiệu.' : 'Đã xuất bản nhưng còn thiếu nguồn hoặc quyền sử dụng video.';
  const steps: { id: 'VIDEO' | 'MOTION' | 'PUBLISH'; label: string; done: boolean }[] = [
    { id: 'VIDEO', label: 'Video', done: progress!.video },
    { id: 'MOTION', label: 'Chuyển động', done: progress!.motion },
    { id: 'PUBLISH', label: 'Xuất bản', done: progress!.published },
  ];

  return (
    <div className="pa-sd-editor">
      <header className="pa-sd-ed-head">
        <div className="pa-min0">
          <h2>{gloss.gloss}</h2>
          {meta && <p className="pa-sd-ed-meta">{meta}</p>}
        </div>
        <div className="pa-sd-ed-actions">
          {gloss.status !== 'DRAFT' && <span className={`pill ${STATUS_LABELS[gloss.status].tone}`}>{STATUS_LABELS[gloss.status].label}</span>}
          {editable && progress?.next === 'PUBLISH' && !draft && (
            <button type="button" className="btn btn-primary btn-small" disabled={busy}
              onClick={() => run(() => signDictionaryService.publish(gloss.id), 'Đã xuất bản ký hiệu.', 'publish')}>
              <Check size={15} aria-hidden="true" /> {pending === 'publish' ? 'Đang xuất bản…' : 'Xuất bản'}
            </button>
          )}
          {editable && (
            <button type="button" className="pa-sd-icon pa-sd-icon--danger" onClick={() => setConfirmArchive(true)} aria-label="Xóa khỏi từ điển" title="Xóa khỏi từ điển">
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {confirmArchive && (
        <div className="pa-sd-confirm" role="group" aria-label="Xác nhận xóa ký hiệu">
          <span>Xóa “{gloss.gloss}” khỏi từ điển? Nhân vật sẽ không dùng ký hiệu này nữa.</span>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirmArchive(false)}>Thôi</button>
          <button type="button" className="btn btn-small pa-sd-danger" disabled={busy}
            onClick={async () => { if (await run(() => signDictionaryService.archive(gloss.id), 'Đã xóa ký hiệu.', 'archive')) onArchived(); }}>
            {pending === 'archive' ? 'Đang xóa…' : 'Xóa'}
          </button>
        </div>
      )}

      {archived ? (
        <p className="notice warning">Ký hiệu đã bị xóa khỏi từ điển; nhân vật không dùng nữa.</p>
      ) : (
        <div className="pa-sd-progress">
          <ol>
            {steps.map((step, index) => (
              <li key={step.id} className={step.done ? 'is-done' : progress?.next === step.id ? 'is-current' : ''}>
                <span className="pa-sd-dot">{step.done ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : index + 1}</span>
                <span className="pa-sd-step-label">{step.label}</span>
              </li>
            ))}
          </ol>
          <p>{hint}</p>
        </div>
      )}

      <div className="pa-sd-subtabs" role="group" aria-label="Phần của ký hiệu">
        {([['sign', 'Ra dấu'], ['info', 'Thông tin'], ['rights', 'Nguồn & quyền']] as [Tab, string][]).map(([id, label]) => (
          <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>
            {label}
            {id === 'rights' && !rightsRecorded && <span className="pa-sd-flag" aria-label="chưa đủ" />}
          </button>
        ))}
      </div>

      {/* Every tab stays mounted (hidden when not shown): leaving "Ra dấu" must not unmount the video MediaPipe is
          reading nor restart the 3D avatar. */}
      <div className="pa-sd-pane" hidden={tab !== 'sign'}>
          <div className="pa-sd-studio">
            <figure className="pa-sd-card">
              <figcaption>
                Video mẫu
                {gloss.video && editable && (
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => fileInput.current?.click()} disabled={busy || !rightsRecorded}>
                    <Upload size={14} aria-hidden="true" /> Đổi video
                  </button>
                )}
              </figcaption>
              <div className="pa-sd-media pa-sd-media--video">
                {gloss.video ? (
                  videoUrl
                    ? <video ref={videoRef} src={videoUrl} controls muted playsInline preload="auto" />
                    : videoBlob.isError
                      ? <p className="pa-sd-media-note">Không tải được video.</p>
                      : (
                        <ProgressMeter
                          className="pa-sd-media-meter"
                          label="Đang tải video"
                          percent={percentOf(videoLoad?.loaded ?? 0, videoLoad?.total || gloss.video.sizeBytes)}
                          detail={`${formatBytes(videoLoad?.loaded ?? 0)} / ${formatBytes(videoLoad?.total || gloss.video.sizeBytes)}`}
                          startedAt={videoLoadStart}
                        />
                      )
                ) : editable && rightsRecorded ? (
                  <button type="button" className="pa-sd-drop" onClick={() => fileInput.current?.click()} disabled={busy}>
                    <Upload size={22} aria-hidden="true" />
                    <strong>Tải video lên</strong>
                    <span>Một người ra dấu từ này · MP4, WebM</span>
                  </button>
                ) : (
                  <div className="pa-sd-drop is-locked">
                    <ShieldCheck size={22} aria-hidden="true" />
                    <strong>Chưa có video</strong>
                    {editable && (
                      <>
                        <span>Ghi nguồn và quyền sử dụng trước khi tải video.</span>
                        <button type="button" className="btn btn-outline btn-small" onClick={() => setTab('rights')}>Ghi nguồn & quyền</button>
                      </>
                    )}
                  </div>
                )}
                {uploadProgress !== null && (
                  <ProgressMeter
                    className="pa-sd-media-meter"
                    label="Đang tải video lên"
                    percent={uploadProgress}
                    detail={uploadFile ? `${formatBytes((uploadFile.size * uploadProgress) / 100)} / ${formatBytes(uploadFile.size)}` : null}
                    startedAt={uploadStart}
                  />
                )}
              </div>
            </figure>

            <figure className="pa-sd-card">
              <figcaption>
                Nhân vật
                {draft && <span className="pa-sd-badge">Chưa lưu</span>}
              </figcaption>
              <div className="pa-sd-media pa-sd-media--avatar">
                <Suspense fallback={<p className="pa-sd-media-note">Đang tải nhân vật…</p>}>
                  <SignAvatarView clip={clip} playing={playing} label={`Nhân vật ra dấu "${gloss.gloss}"`} />
                </Suspense>
                {clip ? (
                  <button type="button" className="pa-sd-play" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Tạm dừng' : 'Phát'}>
                    {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                  </button>
                ) : (
                  <span className="pa-sd-media-note pa-sd-media-note--top">{gloss.hasMotion ? 'Đang tải chuyển động…' : 'Chưa có chuyển động'}</span>
                )}
              </div>
            </figure>
          </div>

          {gloss.video && videoUrl && editable && (
            <div className="pa-sd-capture">
              <div className="pa-sd-range">
                <span className="pa-sd-label">Đoạn ra dấu</span>
                <span className="pa-sd-time-pair">
                  <TimeInput label="Bắt đầu" valueMs={currentRange().startMs} onChange={(ms) => setRange({ ...currentRange(), startMs: ms })} />
                  <button type="button" className="pa-sd-icon" title="Bắt đầu từ giờ đang phát" aria-label="Bắt đầu từ giờ đang phát"
                    onClick={() => setRange({ ...currentRange(), startMs: nowMs() })}>
                    <Timer size={15} aria-hidden="true" />
                  </button>
                </span>
                <span aria-hidden="true">→</span>
                <span className="pa-sd-time-pair">
                  <TimeInput label="Kết thúc" valueMs={currentRange().endMs} onChange={(ms) => setRange({ ...currentRange(), endMs: ms })} />
                  <button type="button" className="pa-sd-icon" title="Kết thúc ở giờ đang phát" aria-label="Kết thúc ở giờ đang phát"
                    onClick={() => setRange({ ...currentRange(), endMs: nowMs() })}>
                    <Timer size={15} aria-hidden="true" />
                  </button>
                </span>
              </div>
              <label className="pa-sd-fps">
                <select value={fps} onChange={(e) => setFps(Number(e.target.value))} disabled={busy} aria-label="Khung hình mỗi giây">
                  {FPS_CHOICES.map((value) => <option key={value} value={value}>{value} khung/giây</option>)}
                </select>
              </label>
              {extracting ? (
                <ProgressMeter
                  className="pa-sd-capture-meter"
                  label={EXTRACT_LABELS[extracting.phase]}
                  percent={extracting.phase === 'prepare' ? 0 : percentOf(extracting.done, extracting.total)}
                  detail={extracting.phase === 'model'
                    ? `${formatBytes(extracting.done)} / ${formatBytes(extracting.total)}`
                    : extracting.phase === 'frames' ? `Khung ${extracting.done}/${extracting.total}` : 'Tải thư viện nhận dạng'}
                  startedAt={extractStart}
                  onStop={() => abortRef.current?.abort()}
                />
              ) : (
                <button type="button" className={`btn btn-small ${gloss.hasMotion || draft ? 'btn-outline' : 'btn-primary'}`} onClick={extract} disabled={busy}>
                  <ScanLine size={15} aria-hidden="true" /> {gloss.hasMotion || draft ? 'Lấy lại' : 'Lấy chuyển động'}
                </button>
              )}
            </div>
          )}

          {coverage && draft && (
            <div className={`pa-sd-result${weak ? ' is-weak' : ''}`} role="status">
              <div className="pa-sd-meters">
                {([['Thân', coverage.pose], ['Tay trái', coverage.leftHand], ['Tay phải', coverage.rightHand]] as [string, number][]).map(([label, value]) => (
                  <span key={label} className={value < (label === 'Thân' ? 0.8 : 0.5) ? 'is-low' : ''}>
                    {label} <b>{Math.round(value * 100)}%</b>
                  </span>
                ))}
              </div>
              <p>{weak ? 'Video chưa rõ người hoặc tay: nhân vật có thể ra dấu sai. Thử đoạn khác hoặc video khác.' : 'Xem nhân vật ra dấu, đúng thì lưu.'}</p>
              <div className="pa-sd-result-actions">
                <button type="button" className="btn btn-ghost btn-small" onClick={() => setDraft(null)} disabled={busy}>Bỏ</button>
                <button type="button" className="btn btn-primary btn-small" onClick={saveMotion} disabled={busy}>{pending === 'motion' ? 'Đang lưu…' : 'Lưu chuyển động'}</button>
              </div>
            </div>
          )}
          <input ref={fileInput} type="file" accept={VIDEO_ACCEPT} hidden onChange={onFile} />
        </div>

      <fieldset className="pa-sd-fieldset pa-sd-pane" hidden={tab !== 'info'} disabled={!editable || busy}>{infoFields}</fieldset>

      <fieldset className="pa-sd-fieldset pa-sd-pane" hidden={tab !== 'rights'} disabled={!editable || busy}>
          <p className={`pa-sd-rights${rightsRecorded ? ' is-ok' : ''}`}>
            <ShieldCheck size={16} aria-hidden="true" />
            {rightsRecorded
              ? 'Đủ nguồn, giấy phép và sự đồng ý: video dùng được cho video ngôn ngữ ký hiệu.'
              : 'Chỉ dùng video bên sở hữu đã cho phép. Cần đủ nguồn, giấy phép và xác nhận trước khi tải video.'}
          </p>
          <div className="pa-sd-form">
            <label className="pa-sd-f">
              <span>Nguồn</span>
              <input value={form.sourceName ?? ''} maxLength={200} onChange={(e) => setForm({ ...form, sourceName: e.target.value })} placeholder="Tên từ điển hoặc người quay" />
            </label>
            <label className="pa-sd-f">
              <span>Đường dẫn nguồn</span>
              <input value={form.sourceUrl ?? ''} maxLength={500} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://…" />
            </label>
            <label className="pa-sd-f pa-sd-wide">
              <span>Giấy phép, sự cho phép</span>
              <input value={form.licenseNote ?? ''} maxLength={500} onChange={(e) => setForm({ ...form, licenseNote: e.target.value })} placeholder="Ví dụ: Được bên sở hữu cho phép theo văn bản số…" />
            </label>
            <label className="pa-sd-f">
              <span>Người ra dấu</span>
              <input value={form.signerName ?? ''} maxLength={200} onChange={(e) => setForm({ ...form, signerName: e.target.value })} placeholder="Chỉ ghi khi người đó đồng ý" />
            </label>
            <span aria-hidden="true" />
            <label className="pa-sd-check pa-sd-wide">
              <input type="checkbox" checked={Boolean(form.consentConfirmed)} onChange={(e) => setForm({ ...form, consentConfirmed: e.target.checked })} />
              <span>Bên sở hữu video và người ra dấu đã cho phép dùng video này trong DigiTalent</span>
            </label>
            <label className="pa-sd-check pa-sd-wide">
              <input type="checkbox" checked={mirrored} onChange={(e) => setForm({ ...form, mirrored: e.target.checked })} />
              <span>Video quay kiểu soi gương <small>(tay phải người ra dấu nằm bên phải hình)</small></span>
            </label>
          </div>
        </fieldset>

      {tab !== 'sign' && editable && (
        <footer className="pa-sd-ed-foot">
          {dirty && <span className="pa-sd-note">Có thay đổi chưa lưu</span>}
          <button type="button" className="btn btn-primary btn-small" onClick={saveInfo} disabled={busy || !dirty || !form.gloss.trim()}>{pending === 'save' ? 'Đang lưu…' : 'Lưu'}</button>
        </footer>
      )}
    </div>
  );
}
