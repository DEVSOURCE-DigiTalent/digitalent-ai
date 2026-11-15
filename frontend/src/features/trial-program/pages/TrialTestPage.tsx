import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, BookOpen, Camera, CheckCircle2, ChevronDown, Mic, Monitor } from 'lucide-react';
import { useMyTrialAssessment } from '@/hooks/use-trial-program';
import { usePulseOverview } from '@/hooks/use-pulse';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { TrialEmployeeDomainDetail } from '@/services/trial-program.service';
import { btn } from '@/features/pulse-employee/lib/button';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import { apiErrorMessage } from '@/lib/utils';
import { LevelBadge } from '../components/TrialUi';
import { TIER_LABELS, domainTotals, formatWhen } from '../lib/trial-format';
import { TrialExam } from '../components/TrialExam';
import { TrialDisclosure } from '../components/TrialDisclosure';
import { TrialScoreScale } from '../components/TrialScoreScale';
import { TrialEmployeeSurvey } from '../components/TrialEmployeeSurvey';
import '../trial-program.css';

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
          {/* Chi tiết điểm chỉ hiển thị khi có dữ liệu gốc. Mức tính theo tỷ lệ đúng của cả lĩnh vực; số câu từng cấp để tham khảo. */}
          {detail && (() => {
            const totals = domainTotals(detail);
            return (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, letterSpacing: '0.04em' }}>
                  {translateUi('Trắc nghiệm')} · {translateUi('đúng')} {totals.correct}/{totals.total} {translateUi('câu')} ({totals.percent}%)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { tier: 'Câu Cơ bản', correct: detail.basicCorrect ?? 0, total: detail.basicTotal ?? 0 },
                    { tier: 'Câu Trung cấp', correct: detail.intermediateCorrect ?? 0, total: detail.intermediateTotal ?? 0 },
                    { tier: 'Câu Nâng cao', correct: detail.advancedCorrect ?? 0, total: detail.advancedTotal ?? 0 },
                  ].map((tierItem) => (
                    <div
                      key={tierItem.tier}
                      style={{
                        background: '#fff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 8,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{translateUi(tierItem.tier)}</div>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>
                        {tierItem.correct}/{tierItem.total} <small style={{ fontSize: 11, fontWeight: 400 }}>{translateUi('câu')}</small>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
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
                  : translateUi('Đúng dưới 40% số câu của lĩnh vực. Cần củng cố thêm nền tảng ở lĩnh vực này.'))}
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
  const { data, isLoading, error, refetch, isFetching } = useMyTrialAssessment();
  const { data: overview } = usePulseOverview(!owner && data?.status === 'REVIEWED');
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  if (isLoading) return <p className="pu-muted">{translateUi("Đang tải…")}</p>;
  if (error || !data) return <p className="pu-notice warning">{apiErrorMessage(error, 'Không tải được bài đánh giá.')}</p>;

  if (!owner) {
    return <TrialEmployeeSurvey data={data} overview={overview} refresh={() => void refetch()} refreshing={isFetching} />;
  }

  return (
    <div className="tp tp-survey-page tp-survey-page--owner">
      <Link to="/enterprise/trial" className="tp-survey-back">← Đánh giá đội ngũ</Link>
      <header className="tp-head">
        <div>
          <span className="tp-eyebrow">{data.organizationName}</span>
          <h1>{data.status === 'REVIEWED' ? 'Kết quả khảo sát của tôi' : 'Bài khảo sát của tôi'}</h1>
        </div>
        {data.testDeadline && data.status === 'NOT_STARTED' && <span className="tp-badge warn">{translateUi("Hạn ")}{formatWhen(data.testDeadline)}</span>}
      </header>

      {data.status === 'NOT_STARTED' && (
        <section className="tp-card">
          {/* The survey does not tell employees which level a question tests: only domains and question counts. */}
          <div className="tp-grid-2">
            <div className="tp-stat">
              <span>{translateUi('Trắc nghiệm')}</span>
              <strong style={{ fontSize: 16 }}>{data.choiceCount} {translateUi('câu')}</strong>
              <span>
                {data.domains.length || 6} {translateUi('lĩnh vực')} · {Math.round(data.choiceCount / Math.max(1, data.domains.length || 6))} {translateUi('câu mỗi lĩnh vực')}
              </span>
            </div>
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
          <p className="tp-muted">{translateUi("Bài làm đang được tổng hợp tự động. Kết quả sẽ cập nhật tại đây.")}</p>
        </section>
      )}


      {data.status === 'REVIEWED' && data.levels && (
        <>
          {/* Phần 1: 6 Lĩnh vực Năng lực Trắc nghiệm */}
          <section className="tp-card">
            <div className="tp-card-head" style={{ marginBottom: 16 }}>
              <div>
                <h2>{translateUi("Kết quả theo lĩnh vực")}</h2>
                <p className="tp-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>{translateUi('Chọn một lĩnh vực để xem số câu đúng.')}</p>
              </div>

            </div>

            <TrialScoreScale />
            <div className="tp-accordion-list mt-3">
              {data.domains.map((d, i) => {
                const detail = data.domainDetails?.find((x) => x.categoryId === d.categoryId) ?? null;
                const level = data.levels![i] ?? 0;
                return (
                  <DomainAccordionItem
                    key={d.categoryId}
                    domain={d}
                    resultsOnly
                    level={level}
                    detail={detail}
                    open={openCategory === d.categoryId}
                    onToggle={() => setOpenCategory(openCategory === d.categoryId ? null : d.categoryId)}
                  />
                );
              })}
            </div>

            {data.reviewNote && <p className="tp-notice" style={{ marginTop: 14 }}>{data.reviewNote}</p>}
          </section>

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
  return (
    <TrialExam
      organizationName={data.organizationName}
      deadline={data.testDeadline}
      choiceCount={data.choiceCount}
      domainCount={data.domains.length || 6}
    />
  );
}
