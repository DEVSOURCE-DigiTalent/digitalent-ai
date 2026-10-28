import { useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Camera, Mic, Monitor } from 'lucide-react';
import { useMyTrialAssessment } from '@/hooks/use-trial-program';
import { btn } from '@/features/pulse-employee/lib/button';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import { apiErrorMessage } from '@/lib/utils';
import { LevelBadge } from '../components/TrialUi';
import { TIER_LABELS, formatWhen } from '../lib/trial-format';
import { TrialExam } from '../components/TrialExam';
import '../trial-program.css';

/** EM-T1 · Bài đánh giá năng lực của nhân viên doanh nghiệp dùng thử: hạn, đề, trạng thái và kết quả. */
export function TrialTestPage() {
  const { data, isLoading, error } = useMyTrialAssessment();
  if (isLoading) return <p className="pu-muted">Đang tải…</p>;
  if (error || !data) return <p className="pu-notice warning">{apiErrorMessage(error, 'Không tải được bài đánh giá.')}</p>;

  return (
    <div className="tp" style={{ maxWidth: 760, margin: '0 auto' }}>
      <header className="tp-head">
        <div>
          <span className="tp-eyebrow">{data.organizationName} · Dùng thử</span>
          <h1>Bài đánh giá năng lực</h1>
        </div>
        {data.testDeadline && data.status === 'NOT_STARTED' && <span className="tp-badge warn">Hạn {formatWhen(data.testDeadline)}</span>}
      </header>

      {data.status === 'NOT_STARTED' && (
        <section className="tp-card">
          <div className="tp-grid-2">
            {[1, 2, 3].map((tier) => (
              <div key={tier} className="tp-stat">
                <span>Phần {tier}</span>
                <strong style={{ fontSize: 16 }}>{TIER_LABELS[tier]}</strong>
                <span>{data.choiceCount / 3} trắc nghiệm + 1 tự luận</span>
              </div>
            ))}
          </div>
          <p className="tp-muted tp-row">
            Cần: <Monitor size={14} aria-hidden /> chia sẻ màn hình · <Camera size={14} aria-hidden /> camera · <Mic size={14} aria-hidden /> micro · làm một lần.
          </p>
          {data.canStart ? (
            <div>
              <Link to={PULSE_PATHS.trialExam} className={btn()}>Vào phòng thi <ArrowRight size={15} aria-hidden /></Link>
            </div>
          ) : (
            <p className="tp-notice">{data.closedMessage}</p>
          )}
        </section>
      )}

      {data.status === 'SUBMITTED' && (
        <section className="tp-card">
          <h2>Đã nộp lúc {formatWhen(data.submittedAt)}</h2>
          <p className="tp-muted">{data.mentorName ? `${data.mentorName} đang chấm.` : 'Đang chờ DigiTalent phân công mentor chấm.'} Kết quả hiện tại đây.</p>
        </section>
      )}

      {data.status === 'REVIEWED' && data.levels && (
        <>
          <section className="tp-card">
            <div className="tp-card-head">
              <h2>Mức năng lực của bạn</h2>
              {data.mentorName && <span className="tp-muted">Chấm bởi {data.mentorName}</span>}
            </div>
            <div className="tp-table-wrap">
              <table className="tp-table">
                <tbody>
                  {data.domains.map((d, i) => (
                    <tr key={d.categoryId}>
                      <td>{d.number}. {d.name}</td>
                      <td className="num"><LevelBadge level={data.levels![i] ?? 0} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.reviewNote && <p className="tp-notice">{data.reviewNote}</p>}
          </section>
          <section className="tp-card tp-row" style={{ justifyContent: 'space-between' }}>
            <span>Đã mở học thử các khóa <strong>Cơ bản</strong>.</span>
            <Link to={PULSE_PATHS.path} className={btn()}>Học thử <ArrowRight size={15} aria-hidden /></Link>
          </section>
        </>
      )}
    </div>
  );
}

/** EM-T2 · Phòng thi có giám sát của bài đánh giá tổng hợp. */
export function TrialExamPage() {
  const { data, isLoading } = useMyTrialAssessment();
  // Chỉ xét lúc vào trang: sau khi nộp, dữ liệu làm mới (không còn làm được) nhưng vẫn ở lại màn "Đã nộp".
  const entered = useRef<boolean | null>(null);
  if (isLoading) return null;
  entered.current ??= Boolean(data?.canStart);
  if (!entered.current || !data) return <Navigate to={PULSE_PATHS.trialTest} replace />;
  return <TrialExam organizationName={data.organizationName} deadline={data.testDeadline} />;
}
