import { useState, type ReactNode } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Bug, ChevronLeft, ChevronRight, MessageSquare, MessageSquareReply, Plus, Star } from 'lucide-react';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { useUiLanguage } from '@/lib/i18n';
import { cn, formatDate } from '@/lib/utils';
import { feedbackService, type FeedbackItem } from '@/services/feedback.service';
import { openScreenshot } from '../lib/open-screenshot';
import { FeedbackDialog } from './FeedbackDialog';
import '../feedback.css';

export type FeedbackKind = 'FEEDBACK' | 'BUG';

export const FEEDBACK_PAGE_SIZE = 10;
const LONG_DESCRIPTION = 240;

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'OPEN', label: 'Chờ xử lý' },
  { value: 'IN_PROGRESS', label: 'Đang xử lý' },
  { value: 'RESOLVED', label: 'Đã giải quyết' },
  { value: 'CLOSED', label: 'Đã đóng' },
] as const;

const STATUS_TONES: Record<FeedbackItem['status'], string> = {
  OPEN: 'border-ent-warn/30 bg-ent-warn-soft text-ent-warn',
  IN_PROGRESS: 'border-ent-accent/30 bg-ent-accent-soft text-ent-accent',
  RESOLVED: 'border-ent-ok/30 bg-ent-ok-soft text-ent-ok',
  CLOSED: 'border-ent-line bg-ent-raised text-ent-fg-3',
};

const COPY: Record<FeedbackKind, {
  title: string; description: string; action: string; emptyTitle: string; emptyText: string; emptyFiltered: string; icon: ReactNode; tile: string;
}> = {
  FEEDBACK: {
    title: 'Góp ý',
    description: 'Ý kiến của bạn giúp DigiTalent làm sản phẩm tốt hơn. Phản hồi của đội ngũ sẽ hiện ngay dưới từng góp ý.',
    action: 'Gửi góp ý',
    emptyTitle: 'Bạn chưa gửi góp ý nào',
    emptyText: 'Gặp điều chưa tiện hay có ý tưởng hay? Gửi cho chúng tôi.',
    emptyFiltered: 'Không có góp ý nào ở trạng thái này.',
    icon: <MessageSquare className="size-4" aria-hidden="true" />,
    tile: 'bg-ent-accent-soft text-ent-accent',
  },
  BUG: {
    title: 'Báo lỗi',
    description: 'Gặp sự cố khi dùng? Báo lại kèm ảnh chụp màn hình để chúng tôi sửa nhanh hơn.',
    action: 'Báo lỗi mới',
    emptyTitle: 'Bạn chưa báo lỗi nào',
    emptyText: 'Khi có gì chạy không đúng, báo ở đây kèm ảnh chụp màn hình.',
    emptyFiltered: 'Không có báo lỗi nào ở trạng thái này.',
    icon: <Bug className="size-4" aria-hidden="true" />,
    tile: 'bg-ent-bad-soft text-ent-bad',
  },
};

/** Pages to show: the first, the last and the ones around the current page, with gaps between. */
export function pageNumbers(page: number, totalPages: number): (number | 'gap')[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= totalPages));
  const sorted = [...wanted].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1]! > 1 ? ['gap' as const, n] : [n]));
}

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Đánh giá ${count}/5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} aria-hidden="true" className={cn('size-3.5', s <= count ? 'fill-amber-400 text-amber-400' : 'text-ent-line')} />
      ))}
    </span>
  );
}

function StatusPill({ status }: { status: FeedbackItem['status'] }) {
  const label = STATUS_FILTERS.find((f) => f.value === status)?.label ?? status;
  return (
    <span className={cn('inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', STATUS_TONES[status])}>
      {label}
    </span>
  );
}

function pagePath(url: string) {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
}

function FeedbackCard({ item, kind }: { item: FeedbackItem; kind: FeedbackKind }) {
  const [expanded, setExpanded] = useState(false);
  const long = item.description.length > LONG_DESCRIPTION;
  return (
    <article className="rounded-2xl border border-ent-line bg-ent-card p-5 sm:p-6">
      <header className="flex items-start gap-3">
        <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl', COPY[kind].tile)}>{COPY[kind].icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
            <h3 className="min-w-0 break-words text-[15px] font-semibold leading-snug text-ent-fg">{item.title}</h3>
            <StatusPill status={item.status} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ent-fg-3">
            <time dateTime={item.createdAt}>Gửi ngày {formatDate(item.createdAt)}</time>
            {item.rating != null && item.rating > 0 && <Stars count={item.rating} />}
            {kind === 'BUG' && item.pageUrl && (
              <span className="min-w-0 max-w-full truncate font-mono" title={item.pageUrl}>Trang: {pagePath(item.pageUrl)}</span>
            )}
          </p>
        </div>
      </header>

      <p className={cn('mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ent-fg-2', long && !expanded && 'line-clamp-3')}>
        {item.description}
      </p>
      {long && (
        <button type="button" className="mt-1 text-xs font-medium text-ent-accent hover:underline" aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}

      {item.screenshots && item.screenshots.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Ảnh chụp màn hình">
          {item.screenshots.map((src, i) => (
            <li key={i}>
              <button type="button" onClick={() => openScreenshot(src)}
                className="block overflow-hidden rounded-lg border border-ent-line transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-ent-accent">
                <img src={src} alt={`Ảnh ${i + 1}, bấm để xem lớn`} className="h-16 w-24 object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {item.adminNote && (
        <div className="mt-4 rounded-xl border border-ent-line border-l-4 border-l-ent-accent bg-ent-raised px-4 py-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ent-fg">
            <MessageSquareReply className="size-3.5 text-ent-accent" aria-hidden="true" />
            Phản hồi từ DigiTalent
            {item.resolvedAt && <span className="font-normal text-ent-fg-3">· {formatDate(item.resolvedAt)}</span>}
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-ent-fg-2">{item.adminNote}</p>
        </div>
      )}
    </article>
  );
}

function Pager({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (page: number) => void }) {
  const button = 'grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center justify-between gap-3 pt-1">
      <p className="text-xs text-ent-fg-3">Trang {page}/{totalPages} · {total} mục</p>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPage(page - 1)}
          className={cn(button, 'border-ent-line bg-ent-card text-ent-fg-2 hover:bg-ent-raised')}>
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        {pageNumbers(page, totalPages).map((n, i) => n === 'gap'
          ? <span key={`gap-${i}`} className="px-1 text-sm text-ent-fg-3" aria-hidden="true">…</span>
          : (
            <button key={n} type="button" aria-label={`Trang ${n}`} aria-current={n === page ? 'page' : undefined} onClick={() => onPage(n)}
              className={cn(button, n === page
                ? 'border-ent-accent bg-ent-accent text-white'
                : 'border-ent-line bg-ent-card text-ent-fg-2 hover:bg-ent-raised')}>
              {n}
            </button>
          ))}
        <button type="button" aria-label="Trang sau" disabled={page >= totalPages} onClick={() => onPage(page + 1)}
          className={cn(button, 'border-ent-line bg-ent-card text-ent-fg-2 hover:bg-ent-raised')}>
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

/**
 * SHR-04 / SHR-05 and EM-13 / EM-14: what the user sent (feedback or bug reports), filtered by status and paged on the
 * server, newest first, with DigiTalent's reply under each item.
 */
export function FeedbackList({ kind }: { kind: FeedbackKind }) {
  useUiLanguage();
  const copy = COPY[kind];
  const [showDialog, setShowDialog] = useState(false);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['my-feedbacks', kind, status, page],
    queryFn: () => feedbackService.getMine({ type: kind, status: status || undefined, pageIndex: page, pageSize: FEEDBACK_PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });
  const list = query.data?.data;
  const items = list?.items ?? [];
  const totalPages = Math.max(1, list?.totalPages ?? 1);
  const goTo = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0 });
  };
  const newButton = (
    <button type="button" onClick={() => setShowDialog(true)}
      className="inline-flex items-center gap-2 rounded-xl bg-ent-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90">
      <Plus className="size-4" aria-hidden="true" />
      {copy.action}
    </button>
  );

  return (
    <PageContainer width="narrow" className="fb-scope space-y-5">
      <PageHeader title={copy.title} description={copy.description} actions={newButton} />

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo trạng thái">
        {STATUS_FILTERS.map((filter) => (
          <button key={filter.value} type="button" aria-pressed={status === filter.value}
            onClick={() => { setStatus(filter.value); setPage(1); }}
            className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              status === filter.value
                ? 'border-ent-accent bg-ent-accent-soft text-ent-accent'
                : 'border-ent-line bg-ent-card text-ent-fg-2 hover:bg-ent-raised')}>
            {filter.label}
          </button>
        ))}
      </div>

      {query.isPending ? (
        <div className="space-y-3" aria-busy="true" aria-label="Đang tải">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl border border-ent-line bg-ent-card motion-safe:animate-pulse" />
          ))}
        </div>
      ) : query.isError ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ent-bad/30 bg-ent-bad-soft px-4 py-3 text-sm text-ent-bad">
          Không tải được danh sách.
          <button type="button" onClick={() => void query.refetch()} className="rounded-lg border border-ent-bad/30 bg-ent-card px-3 py-1.5 text-xs font-medium">
            Thử lại
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ent-line bg-ent-card px-6 py-14 text-center">
          <span className={cn('mb-3 grid size-12 place-items-center rounded-2xl', copy.tile)}>{copy.icon}</span>
          <p className="font-semibold text-ent-fg">{status ? copy.emptyFiltered : copy.emptyTitle}</p>
          {!status && <p className="mt-1 max-w-sm text-sm text-ent-fg-2">{copy.emptyText}</p>}
          {!status && <div className="mt-4">{newButton}</div>}
        </div>
      ) : (
        <>
          <div className={cn('space-y-3 transition-opacity', query.isPlaceholderData && 'opacity-60')}>
            {items.map((item) => <FeedbackCard key={item.id} item={item} kind={kind} />)}
          </div>
          {(list?.totalItems ?? 0) > FEEDBACK_PAGE_SIZE && (
            <Pager page={page} totalPages={totalPages} total={list?.totalItems ?? 0} onPage={goTo} />
          )}
        </>
      )}

      {showDialog && <FeedbackDialog type={kind} onClose={() => setShowDialog(false)} />}
    </PageContainer>
  );
}
