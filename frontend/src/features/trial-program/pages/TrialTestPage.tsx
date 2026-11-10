import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, BookOpen, Camera, CheckCircle2, ChevronDown, Mic, Monitor } from 'lucide-react';
import { useMyTrialAssessment } from '@/hooks/use-trial-program';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { TrialEmployeeDomainDetail } from '@/services/trial-program.service';
import { btn } from '@/features/pulse-employee/lib/button';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import { apiErrorMessage } from '@/lib/utils';
import { LevelBadge } from '../components/TrialUi';
import { TIER_LABELS, formatWhen } from '../lib/trial-format';
import { TrialExam } from '../components/TrialExam';
import { TrialDisclosure } from '../components/TrialDisclosure';
import '../trial-program.css';

const passedTier = (correct = 0, total = 0) => total > 0 && correct >= Math.ceil(total * .7);

function DomainAccordionItem({
  domain,
  level,
  detail,
  open,
  onToggle,
  resultsOnly = false,
}: {
  domain: { categoryId: string; number: number; name: string };
  level: number;
  detail?: TrialEmployeeDomainDetail | null;
  open: boolean;
  onToggle: () => void;
  resultsOnly?: boolean;
}) {
  useUiLanguage();
  const isPassed = level > 0;

  return (
    <div
      className={`tp-survey-domain ${open ? 'is-open' : ''}`}
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        marginBottom: 10,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: open ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: open ? '#f8fafc' : '#fff',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: 12,
        }}
        aria-expanded={open}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: isPassed ? '#ecfdf5' : '#f1f5f9',
              color: isPassed ? '#059669' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {domain.number}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
              {translateUi(domain.name)}
            </div>
            {detail?.statusText && (
              <div style={{ fontSize: 12, color: isPassed ? '#166534' : '#64748b', marginTop: 2 }}>
                {detail.statusText}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <LevelBadge level={level} />
          <ChevronDown
            size={18}
            style={{
              color: '#94a3b8',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>
      </button>

      <TrialDisclosure open={open}>
        <div
          style={{
            padding: '16px 18px',
            borderTop: '1px solid #f1f5f9',
            background: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* Chi tiết điểm chỉ hiển thị khi có dữ liệu gốc. */}
          {detail && <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, letterSpacing: '0.04em' }}>{translateUi("Kết quả theo cấp · đạt từ 70%, liên tiếp từ Cơ bản")}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                {
                  tier: 'Cấp 1 · Cơ bản',
                  correct: detail?.basicCorrect ?? 0,
                  total: detail?.basicTotal ?? 1,
                  passed: passedTier(detail?.basicCorrect, detail?.basicTotal),
                },
                {
                  tier: 'Cấp 2 · Trung cấp',
                  correct: detail?.intermediateCorrect ?? 0,
                  total: detail?.intermediateTotal ?? 1,
                  passed: passedTier(detail?.intermediateCorrect, detail?.intermediateTotal) && passedTier(detail?.basicCorrect, detail?.basicTotal),
                },
                {
                  tier: 'Cấp 3 · Nâng cao',
                  correct: detail?.advancedCorrect ?? 0,
                  total: detail?.advancedTotal ?? 1,
                  passed: passedTier(detail?.advancedCorrect, detail?.advancedTotal) && passedTier(detail?.intermediateCorrect, detail?.intermediateTotal) && passedTier(detail?.basicCorrect, detail?.basicTotal),
                },
              ].map((tierItem, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${tierItem.passed ? '#86efac' : '#e2e8f0'}`,
                    borderRadius: 8,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{tierItem.tier}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: tierItem.passed ? '#15803d' : '#334155' }}>
                      {tierItem.correct}/{tierItem.total} <small style={{ fontSize: 11, fontWeight: 400 }}>{translateUi("câu")}</small>
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: tierItem.passed ? '#dcfce7' : '#f1f5f9',
                        color: tierItem.passed ? '#166534' : '#64748b',
                      }}
                    >
                      {tierItem.passed ? 'Đạt' : translateUi('Chưa đạt')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          }
          {/* Lý do chi tiết & Đánh giá */}
          <div
            style={{
              background: isPassed ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${isPassed ? '#bbf7d0' : '#fef08a'}`,
              borderRadius: 8,
              padding: '12px 14px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            {isPassed ? (
              <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: 2 }} />
            ) : (
              <AlertCircle size={18} style={{ color: '#ca8a04', flexShrink: 0, marginTop: 2 }} />
            )}
            <div style={{ fontSize: 13, color: isPassed ? '#166534' : '#854d0e', lineHeight: 1.5 }}>
              <strong>{isPassed ? 'Đánh giá năng lực: ' : 'Lý do chưa đạt: '}</strong>
              {detail?.gapText ||
                (isPassed
                  ? translateUi(`Đã đạt mức ${detail?.levelLabel ?? TIER_LABELS[level]}. Kết quả được chấm tự động từ bài khảo sát.`)
                  : `Chưa đạt số câu đúng tối thiểu ở cấp Cơ bản. Cần củng cố thêm nền tảng ở lĩnh vực này.`)}
            </div>
          </div>

          {/* Khóa học đề xuất trên lộ trình */}
          {!resultsOnly && detail?.recommendedCourse && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#1e40af' }}>
                  <strong>{translateUi("Khóa học đề xuất:")}</strong> {detail.recommendedCourse}
                </span>
              </div>
              <Link
                to={PULSE_PATHS.path}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#2563eb',
                  textDecoration: 'none',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Xem trên lộ trình →
              </Link>
            </div>
          )}
        </div>
      </TrialDisclosure>
    </div>
  );
}

/** EM-T1 · Bài đánh giá năng lực của nhân viên doanh nghiệp dùng thử: hạn, đề, trạng thái và kết quả. */
export function TrialTestPage() {
  useUiLanguage();
  const owner = useCurrentUser((state) => state.user?.roles.includes('OWNER'));
  const { data, isLoading, error } = useMyTrialAssessment();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  if (isLoading) return <p className="pu-muted">{translateUi("Đang tải…")}</p>;
  if (error || !data) return <p className="pu-notice warning">{apiErrorMessage(error, 'Không tải được bài đánh giá.')}</p>;

  return (
    <div className={`tp tp-survey-page ${owner ? 'tp-survey-page--owner' : ''}`}>
      {owner && <Link to="/enterprise/trial" className="tp-survey-back">← Đánh giá đội ngũ</Link>}
      <header className="tp-head">
        <div>
          <span className="tp-eyebrow">{data.organizationName}</span>
          <h1>{data.status === 'REPORTED' ? 'Kết quả khảo sát của tôi' : 'Bài khảo sát của tôi'}</h1>
        </div>
        {data.testDeadline && data.status === 'NOT_STARTED' && <span className="tp-badge warn">{translateUi("Hạn ")}{formatWhen(data.testDeadline)}</span>}
      </header>

      {data.status === 'NOT_STARTED' && (
        <section className="tp-card">
          <div className="tp-grid-2">
            {[1, 2, 3].map((tier) => (
              <div key={tier} className="tp-stat">
                <span>{translateUi("Phần ")}{tier}</span>
                <strong style={{ fontSize: 16 }}>{translateUi(TIER_LABELS[tier])}</strong>
                <span>{data.choiceCount / 3} câu trắc nghiệm</span>
              </div>
            ))}
          </div>
          <p className="tp-muted tp-row">{translateUi("Cần: ")}<Monitor size={14} aria-hidden /> chia sẻ màn hình · <Camera size={14} aria-hidden /> camera · <Mic size={14} aria-hidden /> micro · làm một lần.
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
          <p className="tp-muted">Bài đã được chấm. Kết quả hiện tại đây khi bài test đóng{data.testDeadline ? ` (chậm nhất ${formatWhen(data.testDeadline)})` : ''}.</p>
        </section>
      )}

      {data.status === 'REPORTED' && data.levels && (
        <>
          {/* Phần 1: 6 Lĩnh vực Năng lực Trắc nghiệm */}
          <section className="tp-card">
            <div className="tp-card-head" style={{ marginBottom: 16 }}>
              <div>
                <h2>Kết quả 6 lĩnh vực</h2>
                <p className="tp-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                  Trắc nghiệm 3 cấp (Cơ bản, Trung cấp, Nâng cao), chấm tự động. Bấm một lĩnh vực để xem chi tiết.
                </p>
              </div>
            </div>

            <div className="tp-accordion-list">
              {data.domains.map((d, i) => {
                const detail = data.domainDetails?.find((x) => x.categoryId === d.categoryId) ?? null;
                const level = data.levels![i] ?? 0;
                return (
                  <DomainAccordionItem
                    key={d.categoryId}
                    domain={d}
                    resultsOnly={Boolean(owner)}
                    level={level}
                    detail={detail}
                    open={openCategory === d.categoryId}
                    onToggle={() => setOpenCategory(openCategory === d.categoryId ? null : d.categoryId)}
                  />
                );
              })}
            </div>

          </section>

          {!owner && <section className="tp-card tp-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{translateUi("Lộ trình học tập của bạn đã sẵn sàng")}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{translateUi("Các lĩnh vực chưa đạt đã được xếp khóa học tương ứng trên lộ trình của bạn.")}</div>
            </div>
            <Link to={PULSE_PATHS.path} className={btn()}>
              Xem lộ trình học tập <ArrowRight size={15} aria-hidden />
            </Link>
          </section>}
        </>
      )}
    </div>
  );
}

/** EM-T2 · Phòng thi có giám sát của bài đánh giá tổng hợp. */
export function TrialExamPage() {
  useUiLanguage();
  const { data, isLoading } = useMyTrialAssessment();
  // Chỉ xét lúc vào trang: sau khi nộp, dữ liệu làm mới (không còn làm được) nhưng vẫn ở lại màn "Đã nộp".
  const entered = useRef<boolean | null>(null);
  if (isLoading) return null;
  entered.current ??= Boolean(data?.canStart);
  if (!entered.current || !data) return <Navigate to={PULSE_PATHS.trialTest} replace />;
  return <TrialExam organizationName={data.organizationName} deadline={data.testDeadline} />;
}
