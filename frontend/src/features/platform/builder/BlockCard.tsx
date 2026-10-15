import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import {
  assetUrl,
  platformCatalogService,
  type BlockInput,
  type CatalogBlock,
  type CatalogCourseDetail,
  type PlatformAsset,
} from '@/services/platform-catalog.service';
import { errorMessage } from '../components/pulse-format';
import { RichTextEditor } from './RichTextEditor';
import { BLOCK_TYPES, type CourseEdit } from './builder-types';
import { IMAGE_ACCEPT, VIDEO_ACCEPT, fileProblem, formatSize, useAssetUpload } from './use-asset-upload';

interface BlockCardProps {
  block: CatalogBlock;
  count: number;
  linkedQuestions: number;
  editable: boolean;
  editing: boolean;
  onToggle: () => void;
  edit: CourseEdit;
}

/** One content block of a module: a preview card, opened in place to edit it. */
export function BlockCard({ block, count, linkedQuestions, editable, editing, onToggle, edit }: BlockCardProps) {
  const type = BLOCK_TYPES[block.type];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const save = (body: BlockInput) => edit((v, c) => platformCatalogService.updateBlock(v, c, block.blockId, body));
  const move = (delta: number) =>
    edit((v, c) => platformCatalogService.moveBlock(v, c, block.blockId, block.index + delta)).catch((err) => toast.error(errorMessage(err)));
  const remove = () =>
    edit((v, c) => platformCatalogService.removeBlock(v, c, block.blockId))
      .then(() => toast.success('Đã xóa khối nội dung.'))
      .catch((err) => toast.error(errorMessage(err)));

  return (
    <article className={`pa-block${editing ? ' editing' : ''}`} aria-label={`Khối ${block.index + 1}: ${type.label}`}>
      <header className="pa-block-head">
        <div className="left">
          <span className={`pa-type pa-type-${block.type.toLowerCase()}`} aria-hidden="true">{type.glyph}</span>
          <strong>{type.label}</strong>
          <small>Khối {block.index + 1}</small>
          {linkedQuestions > 0 && <span className="pill">{linkedQuestions} câu hỏi gắn với khối này</span>}
        </div>
        {editable && (
          <div className="button-row">
            <button type="button" className={`btn btn-small ${editing ? 'btn-primary' : 'btn-outline'}`} onClick={onToggle}>
              {editing ? 'Xong' : 'Sửa'}
            </button>
            <button type="button" className="btn btn-ghost btn-small" aria-label="Đưa khối lên" disabled={block.index === 0} onClick={() => move(-1)}>↑</button>
            <button type="button" className="btn btn-ghost btn-small" aria-label="Đưa khối xuống" disabled={block.index === count - 1} onClick={() => move(1)}>↓</button>
            {confirmDelete ? (
              <>
                <button type="button" className="btn btn-small pa-danger" onClick={remove}>Xóa khối</button>
                <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirmDelete(false)}>Giữ lại</button>
              </>
            ) : (
              <button type="button" className="btn btn-ghost btn-small pa-danger-text" aria-label="Xóa khối" onClick={() => setConfirmDelete(true)}>✕</button>
            )}
          </div>
        )}
      </header>
      {editing && editable ? (
        <div className="pa-block-body">
          {block.type === 'TEXT' && <TextEditor block={block} save={save} />}
          {block.type === 'SLIDE' && <SlideEditor block={block} save={save} />}
          {block.type === 'IMAGE' && <MediaEditor block={block} kind="IMAGE" save={save} />}
          {block.type === 'VIDEO' && <MediaEditor block={block} kind="VIDEO" save={save} />}
        </div>
      ) : (
        <div
          className={`pa-block-preview${editable ? ' clickable' : ''}`}
          onClick={editable ? onToggle : undefined}
          onKeyDown={editable ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle()) : undefined}
          role={editable ? 'button' : undefined}
          tabIndex={editable ? 0 : undefined}
          aria-label={editable ? `Sửa khối ${block.index + 1}` : undefined}
        >
          <BlockPreview block={block} />
        </div>
      )}
    </article>
  );
}

/** How a block looks (also used by the learner preview). HTML comes from the server, which sanitizes it on save. */
export function BlockPreview({ block, learner = false }: { block: CatalogBlock; learner?: boolean }) {
  if (block.type === 'TEXT') {
    return block.bodyHtml
      ? <div className="pa-rich" dangerouslySetInnerHTML={{ __html: block.bodyHtml }} />
      : <p className="pa-empty">Chưa có nội dung chữ.</p>;
  }
  if (block.type === 'SLIDE') {
    if (block.items.length === 0) return <p className="pa-empty">Chưa có ảnh hoặc video.</p>;
    return learner ? <SlideCarousel block={block} /> : (
      <div className="pa-strip">
        {block.items.map((item) => (
          <figure key={item.itemId} className="pa-tile">
            <Thumb asset={item.asset} />
            {item.caption && <figcaption>{item.caption}</figcaption>}
          </figure>
        ))}
      </div>
    );
  }
  if (!block.asset) return <p className="pa-empty">{block.type === 'IMAGE' ? 'Chưa tải ảnh.' : 'Chưa tải video.'}</p>;
  return (
    <figure className="pa-media">
      {block.type === 'IMAGE'
        ? <img src={assetUrl(block.asset)} alt={block.altText ?? ''} />
        : learner
          ? <video src={assetUrl(block.asset)} controls preload="metadata" />
          : <div className="pa-video-chip"><span aria-hidden="true">▶</span><b>{block.asset.fileName}</b><small>{formatSize(block.asset.sizeBytes)}</small></div>}
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}

function Thumb({ asset }: { asset: PlatformAsset }) {
  return (
    <div className="pa-thumb">
      {asset.kind === 'IMAGE' ? <img src={assetUrl(asset)} alt="" /> : <video src={assetUrl(asset)} muted preload="metadata" />}
      <span className="kind">{asset.kind === 'IMAGE' ? 'Ảnh' : 'Video'}</span>
      {asset.kind === 'VIDEO' && <span className="play" aria-hidden="true">▶</span>}
    </div>
  );
}

function SlideCarousel({ block }: { block: CatalogBlock }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => track.current?.scrollBy?.({ left: dir * track.current.clientWidth, behavior: 'smooth' });
  return (
    <div className="pa-carousel">
      <div className="track" ref={track}>
        {block.items.map((item) => (
          <figure key={item.itemId} className="slide">
            {item.asset.kind === 'IMAGE' ? <img src={assetUrl(item.asset)} alt={item.caption ?? ''} /> : <video src={assetUrl(item.asset)} controls preload="metadata" />}
            {item.caption && <figcaption>{item.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {block.items.length > 1 && (
        <div className="arrows">
          <button type="button" aria-label="Trước" onClick={() => scroll(-1)}>‹</button>
          <button type="button" aria-label="Sau" onClick={() => scroll(1)}>›</button>
        </div>
      )}
    </div>
  );
}

/** Rich text, saved by itself one second after typing stops (and when leaving the editor). */
function TextEditor({ block, save }: { block: CatalogBlock; save: (body: BlockInput) => Promise<CatalogCourseDetail> }) {
  const [html, setHtml] = useState(block.bodyHtml ?? '');
  const [state, setState] = useState<'saved' | 'dirty' | 'saving'>('saved');
  const latest = useRef(html);
  const saved = useRef(block.bodyHtml ?? '');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flush = () => {
    clearTimeout(timer.current);
    if (latest.current === saved.current) return;
    const value = latest.current;
    setState('saving');
    save({ bodyHtml: value })
      .then(() => {
        saved.current = value;
        setState(latest.current === value ? 'saved' : 'dirty');
      })
      .catch((err) => {
        setState('dirty');
        toast.error(errorMessage(err));
      });
  };

  useEffect(() => () => flush(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="stack">
      <RichTextEditor
        label={`Nội dung khối ${block.index + 1}`}
        value={html}
        autoFocus={!block.bodyHtml}
        onChange={(value) => {
          setHtml(value);
          latest.current = value;
          setState('dirty');
          clearTimeout(timer.current);
          timer.current = setTimeout(flush, 1000);
        }}
        onBlur={flush}
      />
      <small className="pa-save-state" aria-live="polite">
        {state === 'saving' ? 'Đang lưu…' : state === 'dirty' ? 'Chưa lưu — tự lưu sau khi dừng gõ' : 'Đã lưu'}
      </small>
    </div>
  );
}

function SlideEditor({ block, save }: { block: CatalogBlock; save: (body: BlockInput) => Promise<CatalogCourseDetail> }) {
  const { upload, progress, fileName } = useAssetUpload();
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const items = block.items.map((i) => ({ assetId: i.asset.assetId, caption: i.caption }));
  const persist = (next: { assetId: string; caption: string | null }[]) =>
    save({ items: next }).catch((err) => toast.error(errorMessage(err)));

  const onFile = (kind: 'IMAGE' | 'VIDEO') => async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    const added: { assetId: string; caption: string | null }[] = [];
    for (const file of files) {
      const problem = fileProblem(file, kind);
      if (problem) {
        toast.error(`${file.name}: ${problem}`);
        continue;
      }
      try {
        const asset = await upload(file);
        added.push({ assetId: asset.assetId, caption: null });
      } catch (err) {
        toast.error(errorMessage(err));
      }
    }
    if (added.length) await persist([...items, ...added]);
  };

  const shift = (index: number, delta: number) => {
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(index + delta, 0, moved!);
    return persist(next);
  };

  return (
    <div className="stack">
      <small className="pa-hint">Nhân viên vuốt ngang qua từng mục. Chen video vào giữa các ảnh được. Dùng ← → để đổi thứ tự.</small>
      <div className="pa-strip">
        {block.items.map((item, index) => (
          <figure key={item.itemId} className="pa-tile">
            <Thumb asset={item.asset} />
            <input
              aria-label={`Chú thích mục ${index + 1}`}
              defaultValue={item.caption ?? ''}
              placeholder="Chú thích"
              maxLength={500}
              onBlur={(e) => {
                if ((e.target.value || null) === item.caption) return;
                const next = items.map((x, i) => (i === index ? { ...x, caption: e.target.value || null } : x));
                void persist(next);
              }}
            />
            <div className="tools">
              <button type="button" className="btn btn-ghost btn-small" aria-label="Đưa sang trái" disabled={index === 0} onClick={() => shift(index, -1)}>←</button>
              <button type="button" className="btn btn-ghost btn-small pa-danger-text" onClick={() => persist(items.filter((_, i) => i !== index))}>Xóa</button>
              <button type="button" className="btn btn-ghost btn-small" aria-label="Đưa sang phải" disabled={index === block.items.length - 1} onClick={() => shift(index, 1)}>→</button>
            </div>
          </figure>
        ))}
        <button type="button" className="pa-tile-add" onClick={() => imageInput.current?.click()} disabled={progress !== null}>＋<span>Ảnh</span></button>
        <button type="button" className="pa-tile-add" onClick={() => videoInput.current?.click()} disabled={progress !== null}>＋<span>Video</span></button>
      </div>
      {progress !== null && <UploadProgress name={fileName} value={progress} />}
      <input ref={imageInput} type="file" accept={IMAGE_ACCEPT} multiple hidden onChange={onFile('IMAGE')} />
      <input ref={videoInput} type="file" accept={VIDEO_ACCEPT} hidden onChange={onFile('VIDEO')} />
    </div>
  );
}

function MediaEditor({ block, kind, save }: { block: CatalogBlock; kind: 'IMAGE' | 'VIDEO'; save: (body: BlockInput) => Promise<CatalogCourseDetail> }) {
  const { upload, progress, fileName } = useAssetUpload();
  const input = useRef<HTMLInputElement>(null);
  const isImage = kind === 'IMAGE';

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const problem = fileProblem(file, kind);
    if (problem) {
      toast.error(problem);
      return;
    }
    try {
      const asset = await upload(file);
      await save({ assetId: asset.assetId });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const text = (field: 'caption' | 'altText', current: string | null) => (e: React.FocusEvent<HTMLInputElement>) => {
    if ((e.target.value || null) === current) return;
    save({ [field]: e.target.value }).catch((err) => toast.error(errorMessage(err)));
  };

  return (
    <div className="stack">
      {block.asset ? (
        <figure className="pa-media">
          {isImage ? <img src={assetUrl(block.asset)} alt={block.altText ?? ''} /> : <video src={assetUrl(block.asset)} controls preload="metadata" />}
          <figcaption className="pa-hint">{block.asset.fileName} · {formatSize(block.asset.sizeBytes)}</figcaption>
        </figure>
      ) : (
        <button type="button" className="pa-drop" onClick={() => input.current?.click()} disabled={progress !== null}>
          <strong>{isImage ? 'Chọn ảnh từ máy' : 'Chọn video từ máy'}</strong>
          <span>{isImage ? 'JPG, PNG, WebP, GIF · tối đa 10 MB' : 'MP4, WebM, MOV · tối đa 500 MB · nhân viên tua được khi xem'}</span>
        </button>
      )}
      {progress !== null && <UploadProgress name={fileName} value={progress} />}
      {block.asset && (
        <div>
          <button type="button" className="btn btn-outline btn-small" onClick={() => input.current?.click()} disabled={progress !== null}>
            {isImage ? 'Đổi ảnh' : 'Đổi video'}
          </button>
        </div>
      )}
      <div className="inline-fields">
        <label className="field">
          Chú thích
          <input defaultValue={block.caption ?? ''} maxLength={500} onBlur={text('caption', block.caption)} />
        </label>
        {isImage && (
          <label className="field">
            Mô tả cho người khiếm thị
            <input defaultValue={block.altText ?? ''} maxLength={500} onBlur={text('altText', block.altText)} />
          </label>
        )}
      </div>
      <input ref={input} type="file" accept={isImage ? IMAGE_ACCEPT : VIDEO_ACCEPT} hidden onChange={onFile} />
    </div>
  );
}

function UploadProgress({ name, value }: { name: string | null; value: number }) {
  return (
    <div className="pa-upload" role="status" aria-live="polite">
      <span>Đang tải {name ?? 'tệp'} · {value}%</span>
      <div className="pa-progress"><i style={{ width: `${value}%` }} /></div>
    </div>
  );
}
