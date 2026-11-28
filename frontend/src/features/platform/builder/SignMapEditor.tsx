import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Combine, ExternalLink, Play, Plus, Split, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  signLanguageVideoService,
  type SignCandidate,
  type SignItem,
  type SignRendererKind,
  type SignReviewStatus,
  type SignSegment,
} from '@/services/sign-language-video.service';
import {
  AVAILABILITY_LABELS,
  applyMatch,
  availabilityOf,
  blockingItems,
  canApprove,
  isBlocking,
  mergeWithNext,
  moveItem,
  needsAttention,
  seconds,
  setSkipped,
  splitWords,
  textItem,
  timeRange,
  variantLine,
  withSign,
} from '@/lib/sign-video';
import { errorMessage } from '../components/pulse-format';
import { SignGlossPicker } from './SignGlossPicker';

const PAGE = 40;

export interface SignMapContext {
  renderer: SignRendererKind;
  signLanguage: string;
  region: string;
  variant: string | null;
}

function segmentState(segment: SignSegment): { label: string; tone: string } {
  if (segment.reviewStatus === 'SKIPPED') return { label: 'Bỏ qua câu', tone: 'gray' };
  if (segment.items.length === 0) return { label: 'Chỉ có âm thanh', tone: 'gray' };
  const blocking = blockingItems(segment).length;
  if (blocking > 0) return { label: `Thiếu ${blocking}`, tone: 'coral' };
  return segment.reviewStatus === 'APPROVED' ? { label: 'Đã duyệt', tone: 'green' } : { label: 'Đủ ký hiệu', tone: 'pa-pill-gold' };
}

/**
 * "Bản đồ ký hiệu": every caption sentence with the signs that say it. The admin may pick another variant, search the
 * dictionary, join or split words, change the order (sign languages have their own grammar), give a sign a length,
 * skip a word or a sentence, and review each sentence. Edits stay local until "Lưu bản nháp".
 */
export function SignMapEditor({ segments, context, editable, onChange, onPlay }: {
  segments: SignSegment[];
  context: SignMapContext;
  editable: boolean;
  /** itemsChanged = the signs changed (not only the review). */
  onChange: (segment: SignSegment, itemsChanged: boolean) => void;
  onPlay: (ms: number) => void;
}) {
  const attention = useMemo(() => segments.filter(needsAttention).length, [segments]);
  const [onlyAttention, setOnlyAttention] = useState(attention > 0);
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<{ segment: number; item: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const shown = onlyAttention ? segments.filter(needsAttention) : segments;
  const approvable = segments.filter((s) => s.reviewStatus === 'PENDING' && s.items.some((i) => !i.skipped) && canApprove(s) && blockingItems(s).length === 0);
  const functionWords = segments.flatMap((s) => s.items.map((item, index) => ({ s, item, index })))
    .filter(({ item }) => item.hint === 'FUNCTION_WORD' && !item.glossId && !item.skipped);

  const lookup = async (item: SignItem): Promise<SignItem> => {
    const text = item.sourceText.trim();
    if (!text) return textItem('');
    const match = await signLanguageVideoService.match(text, context.signLanguage, context.region, context.variant);
    return applyMatch({ ...textItem(text), skipped: item.skipped, durationMs: item.durationMs, note: item.note }, match, context.renderer);
  };

  const updateItems = async (segment: SignSegment, next: SignItem[], refresh: number[] = []) => {
    if (refresh.length === 0) {
      onChange({ ...segment, items: next }, true);
      return;
    }
    setBusy(true);
    try {
      const looked = [...next];
      await Promise.all(refresh.map(async (i) => { looked[i] = await lookup(next[i]); }));
      onChange({ ...segment, items: looked }, true);
    } catch (err) {
      onChange({ ...segment, items: next }, true);
      toast.error(`Chưa tìm được ký hiệu: ${errorMessage(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const review = (segment: SignSegment, status: SignReviewStatus) => onChange({ ...segment, reviewStatus: status }, false);

  return (
    <div className="pa-sv-map">
      <div className="pa-sv-map-tools">
        <label className="pa-check">
          <input type="checkbox" checked={onlyAttention} onChange={(e) => { setOnlyAttention(e.target.checked); setLimit(PAGE); }} />
          Chỉ câu cần xử lý ({attention})
        </label>
        {editable && approvable.length > 0 && (
          <button type="button" className="btn btn-light btn-small" onClick={() => approvable.forEach((s) => review(s, 'APPROVED'))}>
            Duyệt {approvable.length} câu đủ ký hiệu
          </button>
        )}
        {editable && functionWords.length > 0 && (
          <button
            type="button"
            className="btn btn-light btn-small"
            title="Hư từ (là, của, về, các, đã…) thường được lược trong ngôn ngữ ký hiệu. Chỉ bỏ qua khi người duyệt đồng ý."
            onClick={() => {
              const bySegment = new Map<number, SignSegment>();
              functionWords.forEach(({ s, index }) => {
                const current = bySegment.get(s.index) ?? s;
                bySegment.set(s.index, { ...current, items: current.items.map((item, i) => (i === index ? setSkipped(item, true) : item)) });
              });
              bySegment.forEach((segment) => onChange(segment, true));
            }}
          >
            Bỏ qua {functionWords.length} hư từ còn thiếu
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="pa-hint">Không còn câu nào cần xử lý.</p>
      ) : (
        <div className="pa-sv-table" role="table" aria-label="Bản đồ ký hiệu">
          <div className="pa-sv-thead" role="row">
            <span role="columnheader">Thời gian</span>
            <span role="columnheader">Nội dung</span>
            <span role="columnheader">Ký hiệu được chọn</span>
            <span role="columnheader">Trạng thái</span>
          </div>
          {shown.slice(0, limit).map((segment) => {
            const n = segment.index + 1;
            const state = segmentState(segment);
            const open = selected?.segment === segment.index ? selected.item : null;
            const item = open != null ? segment.items[open] : undefined;
            return (
              <div key={segment.index} className={`pa-sv-tr${blockingItems(segment).length ? ' has-problem' : ''}`} role="row">
                <div className="pa-sv-cell pa-sv-when" role="cell">
                  <button type="button" className="pa-cap-icon" onClick={() => onPlay(segment.startMs)} aria-label={`Phát video từ câu ${n}`} title="Phát từ câu này">
                    <Play size={14} aria-hidden="true" />
                  </button>
                  <span>{timeRange(segment.startMs, segment.endMs)}</span>
                </div>
                <div className="pa-sv-cell pa-sv-text" role="cell">
                  <span className="pa-sv-no">Câu {n}</span> {segment.captionText}
                </div>
                <div className="pa-sv-cell" role="cell">
                  {segment.items.length === 0 ? (
                    <span className="pa-hint">Không có lời nói, nhân vật nghỉ.</span>
                  ) : (
                    <div className="pa-sv-chips">
                      {segment.items.map((sign, index) => (
                        <button
                          key={`${index}-${sign.sourceText}`}
                          type="button"
                          className={`pa-sv-chip is-${sign.availability.toLowerCase()}${open === index ? ' is-open' : ''}`}
                          aria-expanded={open === index}
                          aria-label={`Câu ${n}, ký hiệu ${index + 1}: ${sign.sourceText} — ${sign.gloss ? `${sign.gloss}, ` : ''}${AVAILABILITY_LABELS[sign.availability]}`}
                          onClick={() => setSelected(open === index ? null : { segment: segment.index, item: index })}
                        >
                          <span className="pa-sv-chip-src">{sign.sourceText || '…'}</span>
                          <span className="pa-sv-chip-gloss">{sign.skipped ? 'Bỏ qua' : sign.gloss ?? AVAILABILITY_LABELS[sign.availability]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {editable && segment.reviewStatus !== 'SKIPPED' && (
                    <button
                      type="button"
                      className="pa-sv-add"
                      onClick={() => {
                        onChange({ ...segment, items: [...segment.items, textItem('')] }, true);
                        setSelected({ segment: segment.index, item: segment.items.length });
                      }}
                    >
                      <Plus size={13} aria-hidden="true" /> Thêm ký hiệu
                    </button>
                  )}
                </div>
                <div className="pa-sv-cell pa-sv-status" role="cell">
                  <span className={`pill ${state.tone}`}>{state.label}</span>
                  {segment.items.length > 0 && (
                    <select
                      className="pa-input pa-sv-review"
                      value={segment.reviewStatus}
                      disabled={!editable}
                      aria-label={`Kiểm duyệt câu ${n}`}
                      onChange={(e) => {
                        const status = e.target.value as SignReviewStatus;
                        if (status === 'APPROVED' && !canApprove(segment)) {
                          toast.error(`Câu ${n} còn từ chưa có ký hiệu nên chưa duyệt được. Chọn ký hiệu hoặc bỏ qua từ đó.`);
                          return;
                        }
                        review(segment, status);
                      }}
                    >
                      <option value="PENDING">Chờ duyệt</option>
                      <option value="APPROVED">Đã duyệt</option>
                      <option value="SKIPPED">Bỏ qua câu này</option>
                    </select>
                  )}
                  {segment.reviewedAt && segment.reviewStatus !== 'PENDING' && (
                    <span className="pa-hint">{segment.reviewedBy ? `${segment.reviewedBy} · ` : ''}{new Date(segment.reviewedAt).toLocaleDateString('vi-VN')}</span>
                  )}
                </div>
                {segment.items.length > 0 && (editable || segment.reviewNote) && (
                  <div className="pa-sv-note" role="cell">
                    <input
                      className="pa-input"
                      value={segment.reviewNote ?? ''}
                      maxLength={500}
                      disabled={!editable}
                      placeholder="Ghi chú kiểm duyệt (ví dụ: đã đổi trật tự theo ngữ pháp ký hiệu)"
                      aria-label={`Ghi chú kiểm duyệt câu ${n}`}
                      onChange={(e) => onChange({ ...segment, reviewNote: e.target.value }, false)}
                    />
                  </div>
                )}
                {item && open != null && (
                  <ItemPanel
                    key={`${segment.index}-${open}`}
                    label={`Câu ${n}, ký hiệu ${open + 1}`}
                    item={item}
                    index={open}
                    count={segment.items.length}
                    context={context}
                    editable={editable && !busy}
                    onPick={(sign) => void updateItems(segment, segment.items.map((it, i) => (i === open ? withSign(it, sign, context.renderer) : it)))}
                    onText={(text) => void updateItems(segment, segment.items.map((it, i) => (i === open ? { ...it, sourceText: text } : it)), [open])}
                    onMove={(delta) => {
                      void updateItems(segment, moveItem(segment.items, open, delta));
                      setSelected({ segment: segment.index, item: open + delta });
                    }}
                    onMerge={() => {
                      void updateItems(segment, mergeWithNext(segment.items, open), [open]);
                    }}
                    onSplit={() => {
                      const words = item.sourceText.split(/\s+/).filter(Boolean).length;
                      void updateItems(segment, splitWords(segment.items, open), Array.from({ length: words }, (_, k) => open + k));
                    }}
                    onSkip={(skipped) => void updateItems(segment, segment.items.map((it, i) => (i === open ? setSkipped(it, skipped) : it)))}
                    onDuration={(ms) => void updateItems(segment, segment.items.map((it, i) => (i === open ? { ...it, durationMs: ms } : it)))}
                    onNote={(note) => void updateItems(segment, segment.items.map((it, i) => (i === open ? { ...it, note } : it)))}
                    onRemove={() => {
                      void updateItems(segment, segment.items.filter((_, i) => i !== open));
                      setSelected(null);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      {shown.length > limit && (
        <button type="button" className="btn btn-outline btn-small" onClick={() => setLimit((value) => value + PAGE)}>
          Hiện thêm {Math.min(PAGE, shown.length - limit)} câu
        </button>
      )}
    </div>
  );
}

function ItemPanel({ label, item, index, count, context, editable, onPick, onText, onMove, onMerge, onSplit, onSkip, onDuration, onNote, onRemove }: {
  label: string;
  item: SignItem;
  index: number;
  count: number;
  context: SignMapContext;
  editable: boolean;
  onPick: (sign: SignCandidate) => void;
  onText: (text: string) => void;
  onMove: (delta: -1 | 1) => void;
  onMerge: () => void;
  onSplit: () => void;
  onSkip: (skipped: boolean) => void;
  onDuration: (ms: number | null) => void;
  onNote: (note: string | null) => void;
  onRemove: () => void;
}) {
  const [text, setText] = useState(item.sourceText);
  const [duration, setDuration] = useState(item.durationMs == null ? '' : String(item.durationMs / 1000));
  const words = item.sourceText.split(/\s+/).filter(Boolean).length;
  const problem = item.problem ?? (isBlocking(item.availability) ? AVAILABILITY_LABELS[item.availability] : null);

  const commitDuration = () => {
    const value = duration.trim().replace(',', '.');
    if (!value) {
      if (item.durationMs != null) onDuration(null);
      return;
    }
    const ms = Math.round(Number(value) * 1000);
    if (!Number.isFinite(ms) || ms < 200 || ms > 20_000) {
      toast.error('Thời lượng từ 0,2 đến 20 giây; để trống để theo video ký hiệu.');
      setDuration(item.durationMs == null ? '' : String(item.durationMs / 1000));
      return;
    }
    if (ms !== item.durationMs) onDuration(ms);
  };

  return (
    <div className="pa-sv-panel" role="group" aria-label={`Sửa ${label}`}>
      <div className="pa-sv-panel-grid">
        <label className="field">
          Từ / cụm từ trong lời thoại
          <input
            value={text}
            maxLength={200}
            disabled={!editable}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => { if (text.trim() !== item.sourceText) onText(text.trim()); }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          />
        </label>
        <div className="pa-sv-panel-state">
          <span className={`pa-sv-state is-${item.availability.toLowerCase()}`}>{AVAILABILITY_LABELS[item.availability]}</span>
          {item.gloss && <span>Ký hiệu: <strong>{item.gloss}</strong>{item.region ? ` · ${variantLine({ region: item.region, variant: item.variant, isPreferred: false })}` : ''}</span>}
          {item.isManualOverride && <span className="pa-hint">Chọn tay</span>}
          {!item.isManualOverride && item.glossId && <span className="pa-hint">Tự khớp ({Math.round(item.confidence * 100)}%)</span>}
          {item.hint === 'FUNCTION_WORD' && !item.glossId && <span className="pa-hint">Hư từ: thường được lược trong ngôn ngữ ký hiệu — người duyệt quyết định.</span>}
          {item.hint === 'SENSE_CHECK' && !item.glossId && <span className="pa-hint">Ký hiệu tìm được dành cho một nghĩa riêng: chỉ chọn khi đúng nghĩa trong câu này.</span>}
          {problem && item.availability !== 'OK' && <span className="pa-sv-problem">{problem}</span>}
          {item.startMs != null && item.endMs != null && (
            <span className="pa-hint">Hiện {timeRange(item.startMs, item.endMs)}{item.timingMeasured ? '' : ' (ước tính)'}{item.clipDurationMs ? ` · video ký hiệu ${seconds(item.clipDurationMs)}` : ''}</span>
          )}
        </div>
      </div>

      {(item.candidates.length > 1 || (!item.glossId && item.candidates.length > 0)) && (
        <fieldset className="pa-sv-candidates" disabled={!editable}>
          <legend>Các ký hiệu phù hợp</legend>
          {item.candidates.map((candidate) => {
            const availability = availabilityOf(candidate, context.renderer);
            return (
              <label key={candidate.id} className="pa-check">
                <input type="radio" name={`${label}-candidate`} checked={item.glossId === candidate.id} onChange={() => onPick(candidate)} />
                <span><strong>{candidate.gloss}</strong> <span className="pa-hint">{variantLine(candidate)}</span></span>
                <span className={`pa-sv-state is-${availability.toLowerCase()}`}>{AVAILABILITY_LABELS[availability]}</span>
              </label>
            );
          })}
        </fieldset>
      )}

      {editable && <SignGlossPicker initialText={item.sourceText} renderer={context.renderer} onPick={onPick} />}

      {editable && (
        <div className="pa-sv-panel-actions">
          <button type="button" className="btn btn-light btn-small" disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowLeft size={14} aria-hidden="true" /> Đổi chỗ
          </button>
          <button type="button" className="btn btn-light btn-small" disabled={index >= count - 1} onClick={() => onMove(1)}>
            Đổi chỗ <ArrowRight size={14} aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-light btn-small" disabled={index >= count - 1} onClick={onMerge}>
            <Combine size={14} aria-hidden="true" /> Gộp với ký hiệu sau
          </button>
          <button type="button" className="btn btn-light btn-small" disabled={words < 2} onClick={onSplit}>
            <Split size={14} aria-hidden="true" /> Tách thành từng từ
          </button>
          <button type="button" className="btn btn-outline btn-small" onClick={() => onSkip(!item.skipped)}>
            {item.skipped ? 'Dùng lại từ này' : 'Bỏ qua từ này'}
          </button>
          <button type="button" className="btn btn-ghost btn-small pa-danger-text" onClick={onRemove}>
            <Trash2 size={14} aria-hidden="true" /> Xóa ký hiệu này
          </button>
        </div>
      )}

      <div className="pa-sv-panel-grid">
        <label className="field">
          Thời lượng (giây)
          <input
            value={duration}
            inputMode="decimal"
            disabled={!editable}
            placeholder="Theo video ký hiệu"
            onChange={(e) => setDuration(e.target.value)}
            onBlur={commitDuration}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          />
        </label>
        <label className="field">
          Ghi chú
          <input
            defaultValue={item.note ?? ''}
            maxLength={500}
            disabled={!editable}
            onBlur={(e) => { const note = e.target.value.trim() || null; if (note !== item.note) onNote(note); }}
          />
        </label>
      </div>
      {item.sourceText.trim() && (
        <a className="pa-sv-link" href={`/platform/sign-dictionary?new=${encodeURIComponent(item.sourceText.trim())}`} target="_blank" rel="noreferrer">
          <ExternalLink size={13} aria-hidden="true" /> Thêm “{item.sourceText.trim()}” vào Từ điển ký hiệu
        </a>
      )}
    </div>
  );
}
