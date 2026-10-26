import { useState, useId, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, FileText, Image as ImageIcon, ZoomIn, ZoomOut } from 'lucide-react';
import { useDialogFocus } from '@/hooks/use-dialog-focus';

interface EvidencePreviewModalProps {
  open: boolean;
  onClose: () => void;
  url: string | null;
  title?: string;
}

export function EvidencePreviewModal({ open, onClose, url, title }: EvidencePreviewModalProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useDialogFocus(open, ref, onClose);

  useEffect(() => {
    if (open) {
      setZoom(1);
    }
  }, [open, url]);

  if (!open || !url) return null;

  const isImage = /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(url) || url.startsWith('data:image/');
  const isPdf = /\.pdf(\?.*)?$/i.test(url);
  const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
  const isAudio = /\.(mp3|wav|m4a)(\?.*)?$/i.test(url);

  const displayTitle = title || url.split('/').pop()?.split('?')[0] || 'Minh chứng nộp bài';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl outline-none text-slate-900 overflow-hidden"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            {isImage ? (
              <ImageIcon className="size-4 text-blue-600 shrink-0" />
            ) : (
              <FileText className="size-4 text-amber-600 shrink-0" />
            )}
            <h2 id={titleId} className="text-sm font-bold text-slate-900 truncate">
              {displayTitle}
            </h2>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
              {isImage ? 'Ảnh minh chứng' : isPdf ? 'Tài liệu PDF' : isVideo ? 'Video' : 'Liên kết'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isImage && (
              <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden mr-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Thu nhỏ"
                  aria-label="Thu nhỏ"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <span className="text-[10px] font-mono px-2 text-slate-600">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Phóng to"
                  aria-label="Phóng to"
                >
                  <ZoomIn className="size-3.5" />
                </button>
              </div>
            )}

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              title="Mở trong tab mới"
            >
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">Mở tab mới</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              title="Đóng (Esc)"
              aria-label="Đóng"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto bg-slate-100 p-4 min-h-[400px] flex items-center justify-center">
          {isImage ? (
            <div className="overflow-auto max-h-[75vh] w-full flex items-center justify-center p-2">
              <img
                src={url}
                alt={displayTitle}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-md transition-transform duration-150"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={url}
              title={displayTitle}
              className="h-[75vh] w-full rounded-lg border border-slate-300 bg-white shadow-sm"
            />
          ) : isVideo ? (
            <video
              src={url}
              controls
              className="max-h-[70vh] max-w-full rounded-lg shadow-md"
            />
          ) : isAudio ? (
            <audio src={url} controls className="w-full max-w-md shadow-md" />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm max-w-md">
              <FileText className="size-12 text-slate-400 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">{displayTitle}</h3>
              <p className="mt-1 text-xs text-slate-500">
                Tài liệu liên kết bên ngoài (Google Docs, Figma, hoặc tệp đính kèm).
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Mở liên kết xem trực tiếp
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-slate-200 px-6 py-3 bg-white text-xs text-slate-500">
          <span>Phím tắt: <b>Esc</b> để đóng bảng xem trước</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Đóng lại
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
