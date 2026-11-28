import { useEffect, useRef, useState, type DragEvent } from 'react';
import { CheckCircle2, CircleAlert, ShieldCheck, Upload, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { signDictionaryKeys } from '@/hooks/use-sign-dictionary';
import { platformCatalogService } from '@/services/platform-catalog.service';
import { SIGN_KIND_LABELS, signDictionaryService, type SignGlossKind } from '@/services/sign-dictionary.service';
import { errorMessage } from '../components/pulse-format';
import { VIDEO_ACCEPT, fileProblem } from '../builder/use-asset-upload';
import { glossFromFileName } from './sign-labels';
import { REGION_LABELS, formatBytes } from '@/lib/sign-video';
import { percentOf } from '@/lib/progress';
import { ProgressMeter } from '@/features/sign-language/ProgressMeter';

interface Row {
  file: File;
  gloss: string;
  state: 'waiting' | 'working' | 'done' | 'failed';
  message?: string;
  /** Upload percent while working (100 = uploaded, the sign is being saved). */
  percent?: number;
  /** Part of the running import (its bytes count in the overall progress). */
  queued?: boolean;
}

const STATE_LABELS: Record<Row['state'], string> = { waiting: 'Chờ nhập', working: 'Đang nhập…', done: 'Đã nhập', failed: 'Lỗi' };

/**
 * "Nhập video ký hiệu": several videos at once (picked or dropped), one sign each, named after the file
 * ("xin_chao.mp4" → "xin chao" — the name can be fixed before importing). The source and licence apply to the whole
 * batch, and the import starts only once the admin confirms the owner allowed it. Signs arrive as drafts without motion.
 */
export function SignImportDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [kind, setKind] = useState<SignGlossKind>('WORD');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [licenseNote, setLicenseNote] = useState('');
  const [mirrored, setMirrored] = useState(false);
  const [region, setRegion] = useState('VN');
  const [allowed, setAllowed] = useState(false);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !running) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, running]);

  const pick = (files: FileList | null) => {
    if (!files) return;
    setRows((current) => [
      ...current,
      ...Array.from(files).map((file): Row => {
        const problem = fileProblem(file, 'VIDEO');
        return { file, gloss: glossFromFileName(file.name), state: problem ? 'failed' : 'waiting', message: problem ?? undefined };
      }),
    ]);
  };

  const setRow = (index: number, patch: Partial<Row>) => setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const removeRow = (index: number) => setRows((current) => current.filter((_, i) => i !== index));

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (!running) pick(event.dataTransfer.files);
  };

  const start = async () => {
    setRunning(true);
    setStartedAt(Date.now());
    setRows((current) => current.map((row) => (row.state === 'waiting' ? { ...row, queued: true, percent: 0 } : { ...row, queued: false })));
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (row.state !== 'waiting') continue;
      setRow(i, { state: 'working', percent: 0 });
      try {
        const asset = await platformCatalogService.uploadAsset(row.file, (percent) => setRow(i, { percent }));
        await signDictionaryService.create({
          gloss: row.gloss, kind, videoAssetId: asset.assetId, sourceName: sourceName.trim(), sourceUrl: sourceUrl.trim() || null,
          licenseNote: licenseNote.trim(), mirrored, consentConfirmed: allowed, region,
        });
        setRow(i, { state: 'done', message: undefined });
      } catch (err) {
        setRow(i, { state: 'failed', message: errorMessage(err) });
      }
    }
    setRunning(false);
    setStartedAt(null);
    await queryClient.invalidateQueries({ queryKey: signDictionaryKeys.all });
  };

  const waiting = rows.filter((row) => row.state === 'waiting');
  const done = rows.filter((row) => row.state === 'done').length;
  const missing = [
    waiting.length === 0 ? 'video' : null,
    waiting.some((row) => !row.gloss.trim()) ? 'chữ của ký hiệu' : null,
    !sourceName.trim() ? 'nguồn' : null,
    !licenseNote.trim() ? 'giấy phép' : null,
    !allowed ? 'xác nhận được phép' : null,
  ].filter(Boolean);
  const canStart = !running && missing.length === 0;
  const finished = !running && waiting.length === 0 && done > 0;
  // Overall progress of a running import, by bytes: finished files count whole, the current one by its upload.
  const queued = rows.filter((row) => row.queued);
  const totalBytes = queued.reduce((sum, row) => sum + row.file.size, 0);
  const sentBytes = queued.reduce((sum, row) => sum + (row.state === 'working' ? (row.file.size * (row.percent ?? 0)) / 100 : row.state === 'waiting' ? 0 : row.file.size), 0);
  const current = queued.findIndex((row) => row.state === 'working');

  return (
    <div className="pa-overlay" onClick={() => { if (!running) onClose(); }}>
      <div className="pa-dialog pa-sd-import" role="dialog" aria-modal="true" aria-labelledby="sign-import-title" onClick={(e) => e.stopPropagation()}>
        <header className="pa-sd-import-head">
          <div>
            <h2 id="sign-import-title">Nhập video ký hiệu</h2>
            <p>Mỗi video là một ký hiệu, tên tệp thành chữ của ký hiệu. Ký hiệu vào từ điển ở dạng nháp.</p>
          </div>
          <button type="button" className="pa-sd-icon" onClick={onClose} disabled={running} aria-label="Đóng"><X size={16} aria-hidden="true" /></button>
        </header>

        <div className="pa-sd-import-body">
          <button
            type="button"
            className={`pa-sd-dropzone${dragging ? ' is-over' : ''}`}
            onClick={() => input.current?.click()}
            onDragOver={(e) => { e.preventDefault(); if (!running) setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            disabled={running}
          >
            <span className="pa-sd-dropzone-icon"><Upload size={20} aria-hidden="true" /></span>
            <strong>Kéo thả video vào đây hoặc chọn video…</strong>
            <span>MP4, WebM, MOV · mỗi tệp tối đa 500 MB · chọn được nhiều tệp</span>
          </button>
          <input ref={input} type="file" accept={VIDEO_ACCEPT} multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />

          {rows.length > 0 && (
            <ol className="pa-sd-import-list">
              {rows.map((row, index) => (
                <li key={`${row.file.name}-${index}`} className={`is-${row.state}`}>
                  <input
                    value={row.gloss}
                    aria-label={`Chữ của ký hiệu từ tệp ${row.file.name}`}
                    placeholder="Chữ của ký hiệu"
                    onChange={(e) => setRow(index, { gloss: e.target.value })}
                    disabled={running || row.state !== 'waiting'}
                  />
                  <span className="pa-sd-import-file" title={row.file.name}>{row.file.name}</span>
                  <span className="pa-sd-import-state">
                    {row.state === 'done' && <CheckCircle2 size={14} aria-hidden="true" />}
                    {row.state === 'failed' && <CircleAlert size={14} aria-hidden="true" />}
                    {row.state === 'working'
                      ? (row.percent ?? 0) < 100 ? `Đang tải ${row.percent ?? 0}%` : 'Đang lưu…'
                      : STATE_LABELS[row.state]}
                  </span>
                  {!running && row.state !== 'done' ? (
                    <button type="button" className="pa-sd-icon" onClick={() => removeRow(index)} aria-label={`Bỏ tệp ${row.file.name}`}>
                      <X size={14} aria-hidden="true" />
                    </button>
                  ) : <span aria-hidden="true" />}
                  {row.state === 'failed' && row.message && <p className="pa-sd-import-error">{row.message}</p>}
                </li>
              ))}
            </ol>
          )}

          <section className="pa-sd-import-section" aria-labelledby="sign-import-common">
            <h3 id="sign-import-common">Áp dụng cho mọi video</h3>
            <div className="pa-sd-form">
              <label className="pa-sd-f">
                <span>Loại</span>
                <select value={kind} onChange={(e) => setKind(e.target.value as SignGlossKind)} disabled={running}>
                  {(Object.keys(SIGN_KIND_LABELS) as SignGlossKind[]).map((value) => <option key={value} value={value}>{SIGN_KIND_LABELS[value]}</option>)}
                </select>
              </label>
              <label className="pa-sd-f">
                <span>Vùng miền</span>
                <select value={region} onChange={(e) => setRegion(e.target.value)} disabled={running}>
                  {Object.entries(REGION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="pa-sd-check pa-sd-wide">
                <input type="checkbox" checked={mirrored} onChange={(e) => setMirrored(e.target.checked)} disabled={running} />
                <span>Video quay kiểu soi gương <small>(tay phải người ra dấu nằm bên phải hình)</small></span>
              </label>
            </div>
          </section>

          <section className="pa-sd-import-section" aria-labelledby="sign-import-rights">
            <h3 id="sign-import-rights">Nguồn & quyền sử dụng</h3>
            <div className="pa-sd-form">
              <label className="pa-sd-f">
                <span>Nguồn <em className="pa-sd-required" aria-hidden="true">*</em></span>
                <input value={sourceName} maxLength={200} onChange={(e) => setSourceName(e.target.value)} disabled={running} placeholder="Tên từ điển" required />
              </label>
              <label className="pa-sd-f">
                <span>Đường dẫn nguồn</span>
                <input value={sourceUrl} maxLength={500} onChange={(e) => setSourceUrl(e.target.value)} disabled={running} placeholder="https://…" />
              </label>
              <label className="pa-sd-f pa-sd-wide">
                <span>Giấy phép, sự cho phép <em className="pa-sd-required" aria-hidden="true">*</em></span>
                <input value={licenseNote} maxLength={500} onChange={(e) => setLicenseNote(e.target.value)} disabled={running} placeholder="Ví dụ: Văn bản cho phép số…, ngày…" required />
              </label>
              <label className={`pa-sd-check pa-sd-consent pa-sd-wide${allowed ? ' is-ok' : ''}`}>
                <input type="checkbox" checked={allowed} onChange={(e) => setAllowed(e.target.checked)} disabled={running} />
                <span>
                  <ShieldCheck size={15} aria-hidden="true" /> Tôi xác nhận bên sở hữu và người ra dấu đã cho phép dùng các video này trong DigiTalent.
                </span>
              </label>
            </div>
          </section>
        </div>

        <footer className="pa-sd-import-foot">
          {running ? (
            <ProgressMeter
              className="pa-sd-import-meter"
              label={`Đang nhập video ${Math.max(1, current + 1)}/${queued.length} · giữ hộp thoại này mở`}
              percent={percentOf(sentBytes, totalBytes)}
              detail={`${formatBytes(sentBytes)} / ${formatBytes(totalBytes)}`}
              startedAt={startedAt}
            />
          ) : (
            <span className="pa-sd-note" role="status">
              {done > 0 ? `Đã nhập ${done}/${rows.length} video.` : missing.length > 0 ? `Còn thiếu: ${missing.join(', ')}.` : ''}
            </span>
          )}
          <button type="button" className="btn btn-ghost btn-small" onClick={onClose} disabled={running}>Đóng</button>
          {finished ? (
            <button type="button" className="btn btn-primary btn-small" onClick={onClose}>Xong</button>
          ) : (
            <button type="button" className="btn btn-primary btn-small" onClick={start} disabled={!canStart}>
              <Upload size={15} aria-hidden="true" /> {running ? 'Đang nhập…' : `Nhập ${waiting.length} video`}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
