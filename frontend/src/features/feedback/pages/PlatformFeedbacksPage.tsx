import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Bug, MessageSquare, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { feedbackService, type FeedbackItem } from '@/services/feedback.service';
import { Box, Footer, Loading, LoadError, PageHead, Pager, Pill } from '@/features/platform/components/pulse-ui';
import type { PillTone } from '@/features/platform/components/pulse-ui';
import { formatDate, formatDateTime } from '@/features/platform/components/pulse-format';
import { openScreenshot } from '../lib/open-screenshot';

const FEEDBACK_STATUS: Record<string, { label: string; tone: PillTone }> = {
  OPEN: { label: 'Chờ xử lý', tone: 'coral' },
  IN_PROGRESS: { label: 'Đang xử lý', tone: undefined },
  RESOLVED: { label: 'Đã giải quyết', tone: 'green' },
  CLOSED: { label: 'Đã đóng', tone: 'gray' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Mọi trạng thái' },
  { value: 'OPEN', label: 'Chờ xử lý' },
  { value: 'IN_PROGRESS', label: 'Đang xử lý' },
  { value: 'RESOLVED', label: 'Đã giải quyết' },
  { value: 'CLOSED', label: 'Đã đóng' },
];

// The modal is portaled out of the platform shell, where the enterprise color tokens are not defined.
const MODAL_STYLE = {
  fontFamily: 'inherit',
  fontSize: '14px',
  '--ent-bg': '#f7f9fd',
  '--ent-card': '#ffffff',
  '--ent-raised': '#f8faff',
  '--ent-line': '#dfe6f3',
  '--ent-fg': '#172442',
  '--ent-fg-2': '#4a5a7a',
  '--ent-accent': '#304bdf',
} as CSSProperties;

function Stars({ count }: { count: number }) {
  useUiLanguage();
  return (
    <span className="inline-flex gap-px">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} className={s <= count ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
      ))}
    </span>
  );
}

function DetailModal({ item, onClose }: { item: FeedbackItem; onClose: () => void }) {
  useUiLanguage();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState(item.adminNote ?? '');
  const isBug = item.type === 'BUG';

  const mutation = useMutation({
    mutationFn: () => feedbackService.update(item.id, { status, adminNote: note || undefined }),
    onSuccess: () => {
      toast.success('Cập nhật thành công!');
      queryClient.invalidateQueries({ queryKey: ['platform-feedbacks'] });
      onClose();
    },
    onError: () => toast.error('Cập nhật thất bại.'),
  });

  const st = FEEDBACK_STATUS[item.status];

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={MODAL_STYLE} onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl border shadow-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col" style={{ background: 'var(--ent-card, #fff)', borderColor: 'var(--ent-line, #e5e7eb)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ent-line shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`rounded-lg p-1.5 shrink-0 ${isBug ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
              {isBug ? <Bug size={16} /> : <MessageSquare size={16} />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ent-fg truncate">{translateUi(item.title)}</p>
              <p className="text-[11px] text-ent-fg-2 mt-0.5">{isBug ? translateUi('Báo lỗi') : translateUi('Góp ý')} · {formatDateTime(item.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-ent-raised flex items-center justify-center text-sm font-semibold text-ent-fg">
              {(item.userName ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-ent-fg">{item.userName}</p>
              <p className="text-[11px] text-ent-fg-2">{item.userEmail}{item.organizationName ? ` · ${item.organizationName}` : ''}</p>
            </div>
            <span className={`ml-auto inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${st?.tone === 'coral' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                st?.tone === 'green' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  st?.tone === 'gray' ? 'bg-gray-50 text-gray-500 border-gray-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
              }`}>{translateUi(st?.label) ?? item.status}</span>
          </div>

          {item.rating != null && item.rating > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ent-fg-2">Đánh giá:</span>
              <Stars count={item.rating} />
            </div>
          )}

          <div className="rounded-xl bg-ent-raised/50 border border-ent-line px-4 py-3">
            <p className="text-sm text-ent-fg leading-relaxed whitespace-pre-wrap">{translateUi(item.description)}</p>
          </div>

          {item.pageUrl && (
            <p className="text-[11px] text-ent-fg-2">Gặp lỗi ở: <span className="text-ent-fg">{item.pageUrl}</span></p>
          )}

          {item.screenshots && item.screenshots.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-ent-fg">Ảnh đính kèm</p>
              <div className="flex gap-2 flex-wrap">
                {item.screenshots.map((src, i) => (
                  <img key={i} src={src} alt={translateUi(`Ảnh ${i + 1}`)} className="h-20 w-28 rounded-lg object-cover border border-ent-line cursor-pointer hover:opacity-80" onClick={() => openScreenshot(src)} />
                ))}
              </div>
            </div>
          )}

          <hr className="border-ent-line" />

          <div>
            <p className="text-sm font-medium text-ent-fg mb-1.5">Cập nhật trạng thái</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full rounded-xl border border-ent-line bg-ent-bg px-4 py-2.5 text-sm text-ent-fg focus:border-ent-accent focus:outline-none"
            >
              {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>{translateUi(o.label)}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-ent-fg mb-1.5">Phản hồi cho người dùng</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nội dung phản hồi sẽ hiển thị cho người gửi..."
              maxLength={2000}
              rows={3}
              className="w-full rounded-xl border border-ent-line bg-ent-bg px-4 py-2.5 text-sm text-ent-fg placeholder:text-ent-fg-2/40 focus:border-ent-accent focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-ent-line shrink-0">
          <button type="button" onClick={onClose} className="rounded-xl border border-ent-line px-5 py-2.5 text-sm font-medium text-ent-fg-2 hover:bg-ent-raised">{translateUi("Hủy")}</button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-xl bg-ent-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
          >
            {mutation.isPending ? translateUi('Đang lưu...') : translateUi('Lưu thay đổi')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function FeedbacksTable({ type }: { type: 'FEEDBACK' | 'BUG' }) {
  useUiLanguage();
  const isBug = type === 'BUG';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [viewingItem, setViewingItem] = useState<FeedbackItem | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['platform-feedbacks', pageIndex, statusFilter, type, search],
    queryFn: () =>
      feedbackService.getAll({
        pageIndex,
        pageSize: 20,
        status: statusFilter || undefined,
        type,
        search: search || undefined,
      }),
  });

  const items = data?.data?.items ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const totalItems = data?.data?.totalItems ?? 0;

  return (
    <>
      <PageHead
        eyebrow={`Quản trị nền tảng / ${isBug ? translateUi('Báo lỗi kỹ thuật') : translateUi('Ý kiến phản hồi')}`}
        title={translateUi(isBug ? 'Quản lý sự cố kỹ thuật từ người dùng' : 'Ý kiến phản hồi & Đóng góp từ người dùng')}
        description={translateUi(isBug
          ? 'Xem và xử lý các lỗi kỹ thuật được người dùng báo cáo. Phản hồi sẽ hiển thị trực tiếp cho người gửi.'
          : 'Xem và phản hồi ý kiến đóng góp từ người dùng. Phản hồi sẽ hiển thị trực tiếp cho người gửi.')}
      />
      <Box>
        <div className="pa-filters">
          <input
            type="search"
            placeholder="Tìm theo tiêu đề, email hoặc tổ chức"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPageIndex(1); }}
            aria-label={translateUi("Tìm kiếm")}
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(1); }}
            aria-label={translateUi("Trạng thái")}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{translateUi(o.label)}</option>
            ))}
          </select>
        </div>
        {isLoading && <Loading />}
        {error && <LoadError error={error} />}
        {!isLoading && !error && items.length === 0 && (
          <p className="pa-empty">{translateUi("Không có ")}{isBug ? translateUi('báo lỗi') : translateUi('góp ý')} nào khớp bộ lọc.</p>
        )}
        {items.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Người gửi</th>
                    <th>Tiêu đề</th>
                    <th>{translateUi("Tổ chức")}</th>
                    {!isBug && <th>{translateUi("Đánh giá")}</th>}
                    <th>Ngày gửi</th>
                    <th>{translateUi("Trạng thái")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const st = FEEDBACK_STATUS[item.status];
                    return (
                      <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => setViewingItem(item)}>
                        <td>
                          <strong className="pa-cell-title">{item.userName}</strong>
                          <small className="pa-cell-sub">{item.userEmail}</small>
                        </td>
                        <td>{translateUi(item.title)}</td>
                        <td>{item.organizationName ?? '—'}</td>
                        {!isBug && (
                          <td>
                            {item.rating != null && item.rating > 0 ? <Stars count={item.rating} /> : '—'}
                          </td>
                        )}
                        <td>{formatDate(item.createdAt)}</td>
                        <td><Pill tone={st?.tone}>{translateUi(st?.label) ?? item.status}</Pill></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pager pageIndex={pageIndex} totalPages={totalPages} totalItems={totalItems} onChange={setPageIndex} />
          </>
        )}
      </Box>
      <Footer />
      {viewingItem && <DetailModal item={viewingItem} onClose={() => setViewingItem(null)} />}
    </>
  );
}

export function PlatformFeedbacksPage() {
  useUiLanguage();
  return <FeedbacksTable type="FEEDBACK" />;
}

export function PlatformBugReportsPage() {
  useUiLanguage();
  return <FeedbacksTable type="BUG" />;
}
