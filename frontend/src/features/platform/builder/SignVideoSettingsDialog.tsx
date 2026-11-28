import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, Clapperboard, HandMetal, PersonStanding, ScanSearch, X } from 'lucide-react';
import type { SignAnalyzeInput, SignLanguageVideo, SignRenderMode, SignRendererKind } from '@/services/sign-language-video.service';
import { REGION_LABELS } from '@/lib/sign-video';

interface ModeOption {
  value: SignRenderMode;
  title: string;
  description: string;
  recommended?: boolean;
}

const MODES: ModeOption[] = [
  { value: 'OVERLAY', title: 'Góc trái video', description: 'Bài giảng kèm người ra dấu ở góc trái dưới, trong cùng một video.', recommended: true },
  { value: 'FULLSCREEN', title: 'Toàn khung hình', description: 'Chỉ người ra dấu, đủ khung hình, giữ tiếng bài giảng.' },
  { value: 'TRACK_ONLY', title: 'Lớp ra dấu riêng', description: 'Video ra dấu không tiếng, trình phát đặt chồng lên góc bài giảng.' },
];

/** A small picture of where the signer appears for the learner. */
function ModeThumb({ mode }: { mode: SignRenderMode }) {
  const signer = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="pa-svd-signer">
      <circle cx="20" cy="11" r="8" />
      <path d="M2 46c0-11 8-19 18-19s18 8 18 19z" />
    </g>
  );
  const slide = (
    <g className="pa-svd-slide">
      <rect x="70" y="16" width="64" height="7" rx="3.5" />
      <rect x="70" y="30" width="52" height="5" rx="2.5" />
      <rect x="70" y="40" width="58" height="5" rx="2.5" />
    </g>
  );
  return (
    <svg className="pa-svd-thumb" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
      <rect className={mode === 'FULLSCREEN' ? 'pa-svd-frame is-plain' : 'pa-svd-frame'} x="1" y="1" width="158" height="88" rx="8" />
      {mode === 'OVERLAY' && <>{slide}{signer(10, 41, 1.05)}</>}
      {mode === 'FULLSCREEN' && signer(46, 14, 1.75)}
      {mode === 'TRACK_ONLY' && (
        <>
          {slide}
          <rect className="pa-svd-layer" x="8" y="34" width="52" height="48" rx="6" />
          {signer(14, 37, 0.98)}
        </>
      )}
    </svg>
  );
}

function OptionCard({ name, checked, disabled, onSelect, children, className }: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  children: ReactNode;
  className: string;
}) {
  return (
    <label className={`${className}${checked ? ' is-selected' : ''}${disabled ? ' is-disabled' : ''}`}>
      <input className="pa-svd-radio" type="radio" name={name} checked={checked} disabled={disabled} onChange={onSelect} />
      {children}
      <span className="pa-svd-tick" aria-hidden="true"><Check size={12} strokeWidth={3} /></span>
    </label>
  );
}

/**
 * "Tạo video ký hiệu": how the learner sees the signing, who signs it and which regional signs to prefer. Confirming
 * analyses the transcript last saved in step 1 (sign map); the video itself is rendered only when every sign is usable
 * (optionally right away).
 */
export function SignVideoSettingsDialog({ data, mode, busy, onClose, onSubmit }: {
  data: SignLanguageVideo;
  mode: 'create' | 'settings';
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: SignAnalyzeInput, renderNow: boolean) => void;
}) {
  const ids = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const prerequisites = data.prerequisites;
  const settings = data.settings;
  const [input, setInput] = useState<SignAnalyzeInput>({
    captionSource: 'DRAFT',
    renderMode: settings?.renderMode ?? 'OVERLAY',
    renderer: settings?.renderer ?? 'AVATAR',
    region: settings?.region ?? 'VN',
    variant: settings?.variant ?? null,
  });
  const [renderNow, setRenderNow] = useState(mode === 'create');

  useEffect(() => {
    // The dialog itself takes the focus (no ring on a card before the user moves): Tab reaches the choices.
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const hasTranscript = prerequisites.hasDraftCaptions;
  const set = (patch: Partial<SignAnalyzeInput>) => setInput((current) => ({ ...current, ...patch }));

  const renderers: { value: SignRendererKind; title: string; description: string; icon: ReactNode; recommended?: boolean; available: boolean; meta: ReactNode }[] = [
    {
      value: 'AVATAR', title: 'Nhân vật 3D', recommended: true, icon: <PersonStanding size={20} aria-hidden="true" />,
      description: 'Một nhân vật ra dấu suốt video, mỗi ký hiệu đúng lúc từ đó được nói.',
      available: prerequisites.avatarRendererAvailable,
      meta: prerequisites.avatarRendererAvailable
        ? <><strong>{prerequisites.usableMotionSigns ?? 0}</strong> ký hiệu đã có chuyển động</>
        : prerequisites.avatarRendererMessage,
    },
    {
      value: 'CLIP', title: 'Ghép video người thật', icon: <Clapperboard size={20} aria-hidden="true" />,
      description: 'Nối video của một người ra dấu. Mọi ký hiệu phải do cùng một người ra dấu.',
      available: prerequisites.rendererAvailable,
      meta: prerequisites.rendererAvailable
        ? <><strong>{prerequisites.usableSigns}</strong> ký hiệu có video và giấy phép</>
        : prerequisites.rendererMessage,
    },
  ];

  return (
    <div className="pa-overlay" onClick={() => { if (!busy) onClose(); }}>
      <div
        ref={dialog}
        tabIndex={-1}
        className="pa-dialog pa-svd"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${ids}-title`}
        aria-describedby={`${ids}-intro`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="pa-svd-head">
          <span className="pa-svd-head-icon" aria-hidden="true"><HandMetal size={18} /></span>
          <div className="pa-svd-head-text">
            <h2 id={`${ids}-title`}>{mode === 'create' ? 'Tạo video ký hiệu' : 'Chỉnh sửa video ký hiệu'}</h2>
            <p id={`${ids}-intro`}>Chọn cách người học xem ký hiệu. Hệ thống đọc lời thoại đã lưu và tìm ký hiệu cho từng câu.</p>
          </div>
          <button type="button" className="pa-svd-close" onClick={onClose} disabled={busy} aria-label="Đóng"><X size={18} aria-hidden="true" /></button>
        </header>

        <div className="pa-svd-body">
          <fieldset className="pa-svd-group">
            <legend>Cách hiển thị</legend>
            <div className="pa-svd-modes">
              {MODES.map((option) => (
                <OptionCard
                  key={option.value}
                  className="pa-svd-card pa-svd-mode"
                  name={`${ids}-mode`}
                  checked={input.renderMode === option.value}
                  onSelect={() => set({ renderMode: option.value })}
                >
                  <span className="pa-svd-thumb-wrap">
                    <ModeThumb mode={option.value} />
                    {option.recommended && <span className="pa-svd-badge is-float">Khuyên dùng</span>}
                  </span>
                  <span className="pa-svd-card-text">
                    <span className="pa-svd-card-title">{option.title}</span>
                    <span className="pa-svd-card-desc">{option.description}</span>
                  </span>
                </OptionCard>
              ))}
            </div>
          </fieldset>

          <fieldset className="pa-svd-group">
            <legend>Người ra dấu</legend>
            <div className="pa-svd-renderers">
              {renderers.map((option) => (
                <OptionCard
                  key={option.value}
                  className="pa-svd-card pa-svd-renderer"
                  name={`${ids}-renderer`}
                  checked={input.renderer === option.value}
                  disabled={option.value === 'AVATAR' && !option.available}
                  onSelect={() => set({ renderer: option.value })}
                >
                  <span className="pa-svd-renderer-icon">{option.icon}</span>
                  <span className="pa-svd-card-text">
                    <span className="pa-svd-card-title">
                      {option.title}
                      {option.recommended && <span className="pa-svd-badge">Khuyên dùng</span>}
                    </span>
                    <span className="pa-svd-card-desc">{option.description}</span>
                    {option.meta && <span className={option.available ? 'pa-svd-meta' : 'pa-svd-meta is-warning'}>{option.meta}</span>}
                  </span>
                </OptionCard>
              ))}
            </div>
          </fieldset>

          <div className="pa-svd-group pa-svd-region">
            <div className="pa-svd-region-text">
              <label htmlFor={`${ids}-region`}>Ký hiệu theo vùng</label>
              <p>Ngôn ngữ ký hiệu Việt Nam (VSL). Từ có nhiều ký hiệu ngang nhau sẽ chờ bạn chọn trong bản đồ ký hiệu.</p>
            </div>
            <select id={`${ids}-region`} className="pa-svd-select" value={input.region} onChange={(e) => set({ region: e.target.value })}>
              {Object.entries(REGION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {!hasTranscript && (
            <p className="pa-svd-alert" role="status">
              <AlertTriangle size={16} aria-hidden="true" />
              Chưa có lời thoại. Tạo hoặc nhập lời thoại ở bước 1 rồi lưu.
            </p>
          )}
        </div>

        <footer className="pa-svd-foot">
          {mode === 'create' && (
            <label className="pa-svd-switch">
              <input type="checkbox" role="switch" checked={renderNow} onChange={(e) => setRenderNow(e.target.checked)} />
              <span className="pa-svd-switch-track" aria-hidden="true" />
              Dựng video ngay khi đủ ký hiệu
            </label>
          )}
          <div className="pa-svd-actions">
            <button type="button" className="btn btn-outline btn-small" onClick={onClose} disabled={busy}>Hủy</button>
            <button type="button" className="btn btn-primary btn-small pa-svd-submit" disabled={busy || !hasTranscript} onClick={() => onSubmit(input, renderNow)}>
              <ScanSearch size={16} aria-hidden="true" />
              {busy ? 'Đang phân tích…' : 'Phân tích lời thoại'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
