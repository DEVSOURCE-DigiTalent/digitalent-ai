import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { MessageSquare, Plus, Star } from 'lucide-react';
import '../feedback.css';
import { feedbackService, type FeedbackItem } from '@/services/feedback.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { FeedbackDialog } from '../components/FeedbackDialog';
import { openScreenshot } from '../lib/open-screenshot';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  IN_PROGRESS: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  RESOLVED: { label: 'Đã giải quyết', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  CLOSED: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-500 border-gray-200' },
};

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3 w-3 ${s <= count ? 'fill-amber-400 text-amber-400' : 'text-ent-line'}`} />
      ))}
    </div>
  );
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
  const status = STATUS_LABELS[item.status];
  return (
    <div className="rounded-xl border border-ent-line bg-ent-card p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg p-1.5 bg-blue-50 text-blue-500">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-medium text-ent-fg text-sm">{item.title}</h3>
          </div>
          {item.rating != null && item.rating > 0 && <div className="mb-2"><Stars count={item.rating} /></div>}
          <p className="text-sm text-ent-fg-2 leading-relaxed line-clamp-2">{item.description}</p>
          {item.screenshots && item.screenshots.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {item.screenshots.map((src, i) => (
                <img key={i} src={src} alt={`Ảnh ${i + 1}`} className="h-14 w-20 rounded-lg object-cover border border-ent-line cursor-pointer hover:opacity-80" onClick={() => openScreenshot(src)} />
              ))}
            </div>
          )}
          {item.adminNote && (
            <div className="mt-3 rounded-lg bg-ent-raised px-3 py-2.5 text-sm border border-ent-line">
              <span className="font-medium text-ent-fg text-xs">Phản hồi từ quản trị</span>
              <p className="text-ent-fg-2 mt-0.5 text-xs">{item.adminNote}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${status?.color ?? ''}`}>
            {status?.label ?? item.status}
          </span>
          <span className="text-[11px] text-ent-fg-2">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
}

export function MyFeedbacksPage() {
  const [showDialog, setShowDialog] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-feedbacks'],
    queryFn: () => feedbackService.getMine({ pageIndex: 1, pageSize: 50 }),
  });

  const items = (data?.data?.items ?? []).filter((item) => item.type === 'FEEDBACK');

  return (
    <div className="fb-scope space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Góp ý" description="Chia sẻ ý kiến để chúng tôi cải thiện sản phẩm" />
        <button onClick={() => setShowDialog(true)} className="flex items-center gap-2 rounded-xl bg-ent-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90">
          <Plus className="h-4 w-4" />
          Gửi góp ý
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-ent-fg-2">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-ent-raised p-4 mb-4"><MessageSquare className="h-8 w-8 text-ent-fg-2" /></div>
          <p className="text-sm text-ent-fg-2">Chưa có góp ý nào.</p>
          <button onClick={() => setShowDialog(true)} className="mt-3 text-sm text-ent-accent hover:underline">Gửi góp ý đầu tiên</button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => <FeedbackCard key={item.id} item={item} />)}
        </div>
      )}

      {showDialog && <FeedbackDialog type="FEEDBACK" onClose={() => setShowDialog(false)} />}
    </div>
  );
}
