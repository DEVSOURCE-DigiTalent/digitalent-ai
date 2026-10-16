import { Link, useParams } from 'react-router-dom';
import { Award, Printer } from 'lucide-react';
import architectureArt from '@/assets/pulse/competency-architecture.webp';
import { usePulseOutcome, usePulseOutcomes } from '@/hooks/use-pulse';
import type { PulseOutcomeKind } from '@/services/pulse.service';
import { formatDate } from '@/lib/utils';
import { Empty, LoadError, Mini, PageHead, PageSkeleton, PuLink } from '../components/ui';
import { btn } from '../lib/button';
import { pulseErrorMessage } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

const KIND_LABELS: Record<PulseOutcomeKind, string> = {
  COURSE: 'Digital AI / Khóa học đã duyệt',
  PRE_ASSESSMENT: 'Digital AI / Đạt đánh giá trước khi học',
  CERTIFICATE: 'Digital AI / Chứng chỉ khóa học',
  PRACTICAL_TASK: 'Digital AI / Minh chứng thực tế',
};

/**
 * Kết quả đã xác nhận (§12.5): mỗi bản ghi gắn với bài đánh giá trước khi học, bài cuối khóa hoặc minh chứng thực tế
 * được người chấm duyệt.
 */
export function PulseOutcomesPage() {
  const { data, isLoading, error, refetch } = usePulseOutcomes();
  return (
    <>
      <PageHead
        eyebrow="Kết quả đã xác nhận"
        title="Chứng nhận có nguồn có thể truy vết."
        description="Mỗi kết quả gắn với bài đánh giá trước khi học, bài cuối khóa hoặc minh chứng thực tế được người chấm duyệt."
      />
      {isLoading ? (
        <PageSkeleton blocks={[180]} />
      ) : error || !data ? (
        <LoadError message={pulseErrorMessage(error, 'Không tải được kết quả đã xác nhận.')} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <Empty icon={<Award size={24} />} title="Chưa có kết quả được xác nhận" action={<PuLink to={PULSE_PATHS.path}>Xem lộ trình của tôi →</PuLink>}>
          Khi quản lý duyệt bài cuối khóa hoặc minh chứng thực tế của bạn, bản ghi sẽ xuất hiện ở đây.
        </Empty>
      ) : (
        <section className="pu-surface pu-pad">
          <div className="pu-cert-grid">
            {data.map((outcome) => (
              <Link key={outcome.id} to={PULSE_PATHS.outcome(outcome.id)} className="pu-cert">
                <Mini>{KIND_LABELS[outcome.kind]}</Mini>
                <strong>{outcome.subtitle ?? outcome.title}</strong>
                <small>{outcome.subtitle ? `${outcome.title} · ` : ''}{formatDate(outcome.issuedAt)}</small>
                <em>Mở bản ghi ↗</em>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export function PulseOutcomeDetailPage() {
  const { outcomeId } = useParams<{ outcomeId: string }>();
  const { data, isLoading, error } = usePulseOutcome(outcomeId);
  if (isLoading) return <PageSkeleton blocks={[120, 480]} />;
  if (error || !data) {
    return (
      <Empty icon={<Award size={24} />} title="Không tìm thấy bản ghi" action={<PuLink to={PULSE_PATHS.outcomes} kind="outline">Tất cả kết quả</PuLink>}>
        {pulseErrorMessage(error, 'Bản ghi không tồn tại hoặc không thuộc về bạn.')}
      </Empty>
    );
  }

  return (
    <>
      <PageHead
        eyebrow="Kết quả đã xác nhận"
        title="Một kết quả với nguồn rõ ràng."
        description="Bản ghi nội bộ của doanh nghiệp, chưa có chữ ký số hay trang tra cứu công khai."
        actions={<PuLink to={PULSE_PATHS.outcomes} kind="outline" className="pu-no-print">Tất cả kết quả</PuLink>}
      />
      <section className="pu-certificate">
        <div>
          <Mini>Digital AI · Pulse</Mini>
          <h2>Chứng nhận năng lực đã xác nhận</h2>
          <p style={{ margin: 0 }}>Trao cho</p>
          <span className="pu-holder">{data.holderName}</span>
          <h3>{data.subtitle ?? data.title}</h3>
          {data.subtitle && <p style={{ marginTop: -12 }}>{data.title}</p>}
          <div className="pu-cert-meta">
            <span>Tổ chức<b>{data.organizationName ?? '—'}</b></span>
            <span>Ngày xác nhận<b>{formatDate(data.issuedAt)}</b></span>
            <span>Mã tham chiếu<b>{data.reference}</b></span>
          </div>
          <p style={{ marginTop: 16, fontSize: 13 }}>
            Nguồn: {data.source}{data.reviewerName ? ` · người duyệt ${data.reviewerName}` : ''}.
            {data.reviewNote ? ` Nhận xét: “${data.reviewNote}”` : ''}
          </p>
        </div>
        <img src={architectureArt} alt="" />
      </section>
      <div className="pu-row pu-no-print" style={{ marginTop: 16 }}>
        <button type="button" className={btn('outline')} onClick={() => window.print()}>
          <Printer size={16} /> In bản ghi này
        </button>
        {data.courseId && <PuLink to={PULSE_PATHS.course(data.courseId)} kind="ghost">Xem khóa học</PuLink>}
      </div>
    </>
  );
}
