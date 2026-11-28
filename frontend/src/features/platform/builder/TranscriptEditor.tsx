import { useEffect, useRef, useState, type RefObject } from 'react';
import { ChevronDown, ChevronUp, Play, Plus, Sparkles, Timer, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAssetCaptions, useCaptionAction } from '@/hooks/use-platform-catalog';
import { platformCatalogService, type AssetCaptions, type PlatformAsset } from '@/services/platform-catalog.service';
import { activeCueIndex, captionProblem, cleanCueText, formatCueTime, parseCueTime, type CaptionCue } from '@/lib/captions';
import { errorMessage } from '../components/pulse-format';

const NEW_CUE_MS = 2000;

type Tone = 'green' | 'coral' | 'gray' | 'pa-pill-gold' | '';

function statusOf(data: AssetCaptions, dirty: boolean, count: number): { label: string; tone: Tone } {
  if (data.status === 'PROCESSING') return { label: 'AI đang viết lời thoại', tone: '' };
  if (dirty) return { label: 'Chưa lưu', tone: 'pa-pill-gold' };
  if (data.status === 'FAILED') return { label: 'Lần tạo gần nhất bị lỗi', tone: 'coral' };
  if (data.status === 'NONE' || count === 0) return { label: 'Chưa có lời thoại', tone: 'gray' };
  return { label: `Đã lưu ${count} câu`, tone: 'green' };
}

/** A time field ("1:05.2") that keeps what is typed until it loses focus, then reads it. */
function TimeField({ value, label, onCommit, invalid }: { value: number; label: string; onCommit: (ms: number) => void; invalid: boolean }) {
  const [text, setText] = useState(formatCueTime(value));
  useEffect(() => setText(formatCueTime(value)), [value]);
  const commit = () => {
    const ms = parseCueTime(text);
    if (ms == null) {
      setText(formatCueTime(value));
      toast.error('Giờ chưa đúng dạng phút:giây, ví dụ 1:05.2');
      return;
    }
    if (ms !== value) onCommit(ms);
    else setText(formatCueTime(value));
  };
  return (
    <input
      className="pa-cap-time"
      value={text}
      inputMode="decimal"
      aria-label={label}
      aria-invalid={invalid || undefined}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

/**
 * Step 1 of the sign-language video of a video block: its transcript — what is said and when (docs/specs/
 * 2026-11-24-ai-video-captions.md, table platform_asset_captions). The AI writes it only when asked, the Platform Admin
 * checks each line against the video above and saves it; the sign map is made from the lines last saved. Learners never
 * see it (no text captions). `collapsed`: folded to one line once a sign-language video exists, opened on demand.
 */
export function TranscriptEditor({ asset, videoRef, collapsed = false }: {
  asset: PlatformAsset;
  videoRef: RefObject<HTMLVideoElement | null>;
  collapsed?: boolean;
}) {
  const { data, isLoading, isError } = useAssetCaptions(asset.assetId);
  const action = useCaptionAction(asset.assetId);
  const [cues, setCues] = useState<CaptionCue[]>([]);
  const [dirty, setDirty] = useState(false);
  const [editingManually, setEditingManually] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [open, setOpen] = useState(!collapsed);
  const [playing, setPlaying] = useState(-1);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const previousStatus = useRef<string | undefined>(undefined);

  // The saved transcript replaces the local copy unless the admin has unsaved edits. Copied while
  // rendering, not in an effect: an effect left one screen with the data but no lines (the
  // "Tạo lời thoại bằng AI" button on a transcript that has lines).
  const [syncedFrom, setSyncedFrom] = useState<AssetCaptions | undefined>(undefined);
  if (data && !dirty && data !== syncedFrom) {
    setSyncedFrom(data);
    setCues(data.draftCues);
  }

  // Tell the admin when a background AI job ends.
  useEffect(() => {
    const status = data?.status;
    if (previousStatus.current === 'PROCESSING' && status === 'READY') {
      toast.success(`AI đã viết xong ${data?.draftCues.length ?? 0} câu lời thoại. Nghe lại, sửa nếu cần, rồi phân tích ký hiệu.`);
      setOpen(true);
    } else if (previousStatus.current === 'PROCESSING' && status === 'FAILED') {
      toast.error(data?.errorMessage ?? 'Tạo lời thoại bằng AI chưa thành công.');
    }
    previousStatus.current = status;
  }, [data?.status, data?.draftCues.length, data?.errorMessage]);

  // Highlight the line being played in the video above.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => setPlaying(activeCueIndex(cues, video.currentTime * 1000));
    video.addEventListener('timeupdate', onTime);
    return () => video.removeEventListener('timeupdate', onTime);
  }, [videoRef, cues]);

  // Focus the text of a line just added.
  useEffect(() => {
    if (focusIndex == null) return;
    listRef.current?.querySelectorAll<HTMLTextAreaElement>('textarea')[focusIndex]?.focus();
    setFocusIndex(null);
  }, [focusIndex, cues]);

  if (isLoading) return <p className="pa-hint">Đang tải lời thoại…</p>;
  if (isError || !data) return <p className="notice warning">Không tải được lời thoại của video này.</p>;

  const processing = data.status === 'PROCESSING';
  const busy = action.isPending || processing;
  const problem = captionProblem(cues);
  const status = statusOf(data, dirty, cues.length);
  const showList = (cues.length > 0 || editingManually) && (open || dirty);
  const nowMs = () => Math.round((videoRef.current?.currentTime ?? 0) * 1000);

  const run = async (request: () => Promise<AssetCaptions>, done?: string) => {
    try {
      const result = await action.mutateAsync(request);
      setDirty(false);
      setCues(result.draftCues);
      if (done) toast.success(done);
      return result;
    } catch (err) {
      toast.error(errorMessage(err));
      return null;
    }
  };

  const update = (index: number, patch: Partial<CaptionCue>) => {
    setCues((list) => list.map((cue, i) => (i === index ? { ...cue, ...patch } : cue)));
    setDirty(true);
  };

  const remove = (index: number) => {
    setCues((list) => list.filter((_, i) => i !== index));
    setDirty(true);
  };

  const add = () => {
    const at = nowMs();
    let index = cues.findIndex((cue) => cue.startMs > at);
    if (index < 0) index = cues.length;
    const previousEnd = index > 0 ? cues[index - 1].endMs : 0;
    const nextStart = index < cues.length ? cues[index].startMs : Number.POSITIVE_INFINITY;
    let startMs = Math.max(at, previousEnd);
    let endMs = Math.min(startMs + NEW_CUE_MS, nextStart);
    if (endMs - startMs < 300) {
      // No room at the playing time: add it after the last line.
      index = cues.length;
      startMs = cues.length > 0 ? cues[cues.length - 1].endMs : 0;
      endMs = startMs + NEW_CUE_MS;
    }
    setCues((list) => [...list.slice(0, index), { startMs, endMs, text: '' }, ...list.slice(index)]);
    setDirty(true);
    setEditingManually(true);
    setOpen(true);
    setFocusIndex(index);
  };

  const playFrom = (cue: CaptionCue) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = cue.startMs / 1000;
    void video.play?.()?.catch(() => undefined);
  };

  const save = () => run(
    () => platformCatalogService.saveCaptions(asset.assetId, cues.map((cue) => ({ ...cue, text: cleanCueText(cue.text) }))),
    'Đã lưu lời thoại. Phân tích lại để video ký hiệu theo đúng lời thoại.',
  );
  const generate = () => {
    setConfirmRegenerate(false);
    setEditingManually(false);
    return run(() => platformCatalogService.generateCaptions(asset.assetId));
  };

  return (
    <section className="pa-cap pa-tr" aria-label="Bước 1: lời thoại của video">
      <div className="pa-cap-head">
        <div className="pa-min0">
          <h5><span className="pa-tr-step" aria-hidden="true">1</span> Lời thoại</h5>
          <p className="pa-hint">Lời nói trong video kèm mốc thời gian: video ký hiệu ra dấu theo đúng lời và lúc này. Người học không thấy phần này.</p>
        </div>
        <span className={`pill ${status.tone}`} role="status">{status.label}</span>
      </div>

      {processing && (
        <p className="notice" role="status">
          AI đang nghe video và viết lời thoại. Video dài có thể mất vài phút; bạn cứ sửa các khối khác, kết quả tự hiện ở đây.
        </p>
      )}
      {data.status === 'FAILED' && !dirty && data.errorMessage && (
        <p className="notice warning" role="alert">
          {data.errorMessage}
          {data.draftCues.length > 0 ? ' Lời thoại trước đó vẫn được giữ.' : ''}
        </p>
      )}
      {!data.aiConfigured && !processing && (
        <p className="pa-hint">Máy chủ chưa cấu hình khóa Gemini nên chưa tạo lời thoại bằng AI được; bạn vẫn tự nhập được.</p>
      )}

      {!processing && (
        <div className="pa-cap-actions">
          {confirmRegenerate ? (
            <div className="pa-cap-confirm" role="group" aria-label="Xác nhận tạo lại lời thoại">
              <span>Lời thoại hiện tại sẽ được thay bằng bản AI mới.</span>
              <button type="button" className="btn btn-primary btn-small" onClick={generate} disabled={busy}>Tạo lại</button>
              <button type="button" className="btn btn-outline btn-small" onClick={() => setConfirmRegenerate(false)}>Thôi</button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className={`btn btn-small ${cues.length > 0 || editingManually ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => (cues.length > 0 || dirty ? setConfirmRegenerate(true) : void generate())}
                disabled={busy || !data.aiConfigured}
              >
                <Sparkles size={15} aria-hidden="true" />
                {cues.length > 0 ? 'Tạo lại bằng AI' : 'Tạo lời thoại bằng AI'}
              </button>
              {cues.length === 0 && !editingManually && (
                <button type="button" className="btn btn-outline btn-small" onClick={add} disabled={busy}>
                  Tự nhập lời thoại
                </button>
              )}
              {cues.length > 0 && !dirty && (
                <button type="button" className="btn btn-ghost btn-small" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
                  {open ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
                  {open ? 'Thu gọn' : `Xem, sửa ${cues.length} câu`}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {showList && !processing && (
        <>
          <p className="pa-hint">
            AI có thể nghe sai thuật ngữ hoặc lệch mốc thời gian khoảng 1 giây. Bấm <Play size={11} aria-hidden="true" /> để nghe lại từng câu,
            dùng <Timer size={11} aria-hidden="true" /> để lấy giờ đang phát của video phía trên.
          </p>
          <ol className="pa-cap-list" ref={listRef}>
            {cues.map((cue, index) => {
              const n = index + 1;
              const invalid = problem?.index === index;
              return (
                <li key={index} className={[index === playing ? 'is-playing' : '', invalid ? 'has-error' : ''].filter(Boolean).join(' ') || undefined}>
                  <span className="pa-cap-no" aria-hidden="true">{n}</span>
                  <div className="pa-cap-times">
                    <TimeField value={cue.startMs} label={`Câu ${n}: bắt đầu`} invalid={invalid} onCommit={(ms) => update(index, { startMs: ms })} />
                    <button type="button" className="pa-cap-icon" onClick={() => update(index, { startMs: nowMs() })} aria-label={`Câu ${n}: lấy giờ đang phát làm giờ bắt đầu`} title="Lấy giờ đang phát">
                      <Timer size={14} aria-hidden="true" />
                    </button>
                    <span aria-hidden="true">–</span>
                    <TimeField value={cue.endMs} label={`Câu ${n}: kết thúc`} invalid={invalid} onCommit={(ms) => update(index, { endMs: ms })} />
                    <button type="button" className="pa-cap-icon" onClick={() => update(index, { endMs: nowMs() })} aria-label={`Câu ${n}: lấy giờ đang phát làm giờ kết thúc`} title="Lấy giờ đang phát">
                      <Timer size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <textarea
                    className="pa-cap-text"
                    rows={2}
                    value={cue.text}
                    aria-label={`Câu ${n}: nội dung`}
                    aria-invalid={invalid || undefined}
                    onChange={(e) => update(index, { text: e.target.value })}
                  />
                  <div className="pa-cap-row-actions">
                    <button type="button" className="pa-cap-icon" onClick={() => playFrom(cue)} aria-label={`Phát video từ câu ${n}`} title="Phát từ câu này">
                      <Play size={14} aria-hidden="true" />
                    </button>
                    <button type="button" className="pa-cap-icon pa-danger-text" onClick={() => remove(index)} aria-label={`Xóa câu ${n}`} title="Xóa câu">
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="pa-cap-actions">
            <button type="button" className="btn btn-light btn-small" onClick={add} disabled={busy}>
              <Plus size={15} aria-hidden="true" />
              Thêm câu ở giờ đang phát
            </button>
          </div>
          {problem && <p className="notice warning" role="alert">{problem.message}</p>}
          <div className="pa-cap-foot">
            <span className="pa-hint">{dirty ? 'Có thay đổi chưa lưu.' : `${cues.length} câu đã lưu.`}</span>
            <div className="pa-cap-actions">
              <button type="button" className="btn btn-primary btn-small" onClick={save} disabled={busy || !dirty || Boolean(problem)}>
                {action.isPending ? 'Đang lưu…' : 'Lưu lời thoại'}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
