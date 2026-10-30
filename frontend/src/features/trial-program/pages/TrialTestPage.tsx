import { useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, BookOpen, Camera, CheckCircle2, ChevronDown, FileText, Lightbulb, Mic, Monitor, PenLine, Sparkles } from 'lucide-react';
import { useMyTrialAssessment } from '@/hooks/use-trial-program';
import type { MyTrialEssayResult, TrialEmployeeDomainDetail } from '@/services/trial-program.service';
import { btn } from '@/features/pulse-employee/lib/button';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import { apiErrorMessage } from '@/lib/utils';
import { LevelBadge } from '../components/TrialUi';
import { TIER_LABELS, formatWhen } from '../lib/trial-format';
import { TrialExam } from '../components/TrialExam';
import '../trial-program.css';

function DomainAccordionItem({
  domain,
  level,
  detail,
  open,
  onToggle,
}: {
  domain: { categoryId: string; number: number; name: string };
  level: number;
  detail?: TrialEmployeeDomainDetail | null;
  open: boolean;
  onToggle: () => void;
}) {
  const isPassed = level > 0;

  return (
    <div
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
              {domain.name}
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

      {open && (
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
          {/* Kết quả trắc nghiệm theo từng cấp độ */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, letterSpacing: '0.04em' }}>
              Kết quả trắc nghiệm theo từng cấp độ (Đạt từ 2/3 câu)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                {
                  tier: 'Cấp 1 · Cơ bản',
                  correct: detail?.basicCorrect ?? 0,
                  total: detail?.basicTotal ?? 3,
                  passed: (detail?.basicCorrect ?? 0) >= 2,
                },
                {
                  tier: 'Cấp 2 · Trung cấp',
                  correct: detail?.intermediateCorrect ?? 0,
                  total: detail?.intermediateTotal ?? 3,
                  passed: (detail?.intermediateCorrect ?? 0) >= 2 && (detail?.basicCorrect ?? 0) >= 2,
                },
                {
                  tier: 'Cấp 3 · Nâng cao',
                  correct: detail?.advancedCorrect ?? 0,
                  total: detail?.advancedTotal ?? 3,
                  passed: (detail?.advancedCorrect ?? 0) >= 2 && (detail?.intermediateCorrect ?? 0) >= 2 && (detail?.basicCorrect ?? 0) >= 2,
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
                      {tierItem.correct}/{tierItem.total} <small style={{ fontSize: 11, fontWeight: 400 }}>câu</small>
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
                      {tierItem.passed ? 'Đạt' : 'Chưa đạt'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                  ? `Đã đạt mức ${detail?.levelLabel ?? 'Cơ bản'}. Các khóa học tương ứng đã được tự động công nhận.`
                  : `Chưa đạt số câu đúng tối thiểu ở cấp Cơ bản. Bạn cần hoàn thành khóa học để củng cố nền tảng.`)}
            </div>
          </div>

          {/* Khóa học đề xuất trên lộ trình */}
          {detail?.recommendedCourse && (
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
                  <strong>Khóa học đề xuất:</strong> {detail.recommendedCourse}
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
      )}
    </div>
  );
}

function EssayAccordionItem({
  essay,
  open,
  onToggle,
}: {
  essay: MyTrialEssayResult;
  open: boolean;
  onToggle: () => void;
}) {
  const passed = essay.passed ?? (essay.score != null && essay.score >= 5);
  const wordCount = essay.answer ? essay.answer.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = essay.answer ? essay.answer.length : 0;

  const tierMeta = {
    1: { label: 'Cấp 1 · Cơ bản', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    2: { label: 'Cấp 2 · Trung cấp', bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca' },
    3: { label: 'Cấp 3 · Nâng cao', bg: '#faf5ff', border: '#e9d5ff', text: '#7e22ce' },
  }[essay.tier] ?? { label: `Cấp ${essay.tier}`, bg: '#f1f5f9', border: '#cbd5e1', text: '#334155' };

  return (
    <div
      style={{
        border: open ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: open
          ? '0 10px 25px -5px rgba(99, 102, 241, 0.08), 0 8px 10px -6px rgba(99, 102, 241, 0.04)'
          : '0 1px 3px rgba(0,0,0,0.02)',
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
          padding: '16px 20px',
          background: open ? '#f8faff' : '#fff',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: 16,
        }}
        aria-expanded={open}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              background: tierMeta.bg,
              border: `1px solid ${tierMeta.border}`,
              color: tierMeta.text,
              flexShrink: 0,
              letterSpacing: '0.02em',
            }}
          >
            {tierMeta.label}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{essay.title}</div>
            <div
              style={{
                fontSize: 13,
                color: '#64748b',
                marginTop: 3,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
              }}
            >
              {essay.prompt}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {essay.score != null ? (
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: 9999,
                background: passed ? '#ecfdf5' : '#fff1f2',
                border: `1px solid ${passed ? '#a7f3d0' : '#fecdd3'}`,
                color: passed ? '#065f46' : '#9f1239',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {passed ? (
                <CheckCircle2 size={15} style={{ color: '#059669' }} />
              ) : (
                <AlertCircle size={15} style={{ color: '#e11d48' }} />
              )}
              {essay.score}/10 điểm {passed ? '(Đạt)' : '(Chưa đạt)'}
            </span>
          ) : (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 9999,
                background: '#f1f5f9',
                color: '#64748b',
              }}
            >
              Đang chấm điểm
            </span>
          )}
          <ChevronDown
            size={18}
            style={{
              color: open ? '#6366f1' : '#94a3b8',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>
      </button>

      {open && (
        <div
          style={{
            padding: '20px 22px',
            borderTop: '1px solid #eef2f6',
            background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {/* 1. Yêu cầu đề bài */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #6366f1',
              borderRadius: '0 10px 10px 0',
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#4f46e5',
                letterSpacing: '0.04em',
                marginBottom: 6,
              }}
            >
              <FileText size={14} /> Yêu cầu đề bài thực hành
            </div>
            <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>{essay.prompt}</div>
          </div>

          {/* 2. Bài làm của nhân viên */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#0369a1',
                  letterSpacing: '0.04em',
                }}
              >
                <PenLine size={14} /> Bài làm của bạn
              </div>
              {charCount > 0 && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                  {wordCount} từ ({charCount} ký tự)
                </span>
              )}
            </div>
            <div
              style={{
                background: '#fff',
                border: '1.5px solid #cbd5e1',
                borderRadius: 10,
                padding: '16px 18px',
                fontSize: 13.5,
                color: essay.answer ? '#0f172a' : '#94a3b8',
                fontStyle: essay.answer ? 'normal' : 'italic',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
              }}
            >
              {essay.answer || '(Chưa nhập nội dung bài làm)'}
            </div>
          </div>

          {/* 3. Nhận xét & Đánh giá chi tiết */}
          {(essay.feedback || essay.score != null) && (
            <div
              style={{
                background: passed ? '#f0fdf4' : '#fffbeb',
                border: `1.5px solid ${passed ? '#bbf7d0' : '#fde68a'}`,
                borderRadius: 12,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: passed ? '#15803d' : '#b45309',
                    letterSpacing: '0.04em',
                  }}
                >
                  <Sparkles size={16} /> Đánh giá & Nhận xét từ Mentor / AI
                </div>
                {essay.score != null && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: passed ? '#166534' : '#9a3412',
                    }}
                  >
                    Điểm đánh giá: {essay.score}/10
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {essay.score != null && (
                <div
                  style={{
                    width: '100%',
                    height: 6,
                    background: passed ? '#dcfce7' : '#fed7aa',
                    borderRadius: 9999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(0, essay.score * 10))}%`,
                      height: '100%',
                      background: passed ? '#16a34a' : '#ea580c',
                      borderRadius: 9999,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  fontSize: 13.5,
                  color: passed ? '#14532d' : '#78350f',
                  lineHeight: 1.6,
                }}
              >
                {essay.feedback}
              </div>

              {!passed && (
                <div
                  style={{
                    marginTop: 4,
                    paddingTop: 10,
                    borderTop: `1px dashed ${passed ? '#bbf7d0' : '#fde68a'}`,
                    fontSize: 12.5,
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                    lineHeight: 1.5,
                  }}
                >
                  <Lightbulb size={15} style={{ flexShrink: 0, marginTop: 2, color: '#d97706' }} />
                  <span>
                    <strong>Gợi ý cải thiện:</strong> Bài tự luận cần nêu ví dụ thực tiễn tại doanh nghiệp, quy trình cụ thể và công cụ số áp dụng thay vì chỉ viết lý thuyết hoặc sao chép đề bài.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** EM-T1 · Bài đánh giá năng lực của nhân viên doanh nghiệp dùng thử: hạn, đề, trạng thái và kết quả. */
export function TrialTestPage() {
  const { data, isLoading, error } = useMyTrialAssessment();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openEssayTier, setOpenEssayTier] = useState<number | null>(null);

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
          {/* Phần 1: 6 Lĩnh vực Năng lực Trắc nghiệm */}
          <section className="tp-card">
            <div className="tp-card-head" style={{ marginBottom: 16 }}>
              <div>
                <h2>1. Đánh giá 6 lĩnh vực năng lực (Trắc nghiệm 3 cấp)</h2>
                <p className="tp-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                  Khảo sát trắc nghiệm 3 cấp độ (Cơ bản, Trung cấp, Nâng cao) trên 6 lĩnh vực số TT02/2025. Bấm vào từng lĩnh vực để xem chi tiết.
                </p>
              </div>
              {data.mentorName && <span className="tp-muted">Chấm bởi {data.mentorName}</span>}
            </div>

            <div className="tp-accordion-list">
              {data.domains.map((d, i) => {
                const detail = data.domainDetails?.find((x) => x.categoryId === d.categoryId) ?? null;
                const level = data.levels![i] ?? 0;
                return (
                  <DomainAccordionItem
                    key={d.categoryId}
                    domain={d}
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

          {/* Phần 2: 3 Bài tự luận & Đánh giá năng lực thực hành */}
          {data.essayResults && data.essayResults.length > 0 && (
            <section className="tp-card" style={{ marginTop: 20 }}>
              <div className="tp-card-head" style={{ marginBottom: 16 }}>
                <div>
                  <h2>2. Kết quả 3 bài viết tự luận (Thực hành 3 cấp)</h2>
                  <p className="tp-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                    Đánh giá khả năng phân tích, diễn đạt và ứng dụng công cụ số vào thực tiễn theo 3 cấp độ. Bấm vào từng bài để xem chi tiết đề bài, bài làm và nhận xét.
                  </p>
                </div>
                <span
                  style={{
                    background: '#e0e7ff',
                    color: '#4338ca',
                    fontWeight: 700,
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 6,
                  }}
                >
                  {data.essayResults.length}/3 bài tự luận
                </span>
              </div>

              {/* AI & Mentor Summary Hero Banner */}
              {data.essaySummary && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 50%, #f5f3ff 100%)',
                    border: '1.5px solid #c7d2fe',
                    borderRadius: 12,
                    padding: '16px 18px',
                    marginBottom: 18,
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.05)',
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)',
                    }}
                  >
                    <Sparkles size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#3730a3',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: 4,
                      }}
                    >
                      Nhận xét tổng quan bài viết tự luận từ Trợ lý AI & Mentor
                    </div>
                    <div style={{ fontSize: 13.5, color: '#1e293b', lineHeight: 1.6 }}>
                      {data.essaySummary}
                    </div>
                  </div>
                </div>
              )}

              {/* Danh sách 3 bài tự luận dạng Accordion */}
              <div className="tp-accordion-list">
                {data.essayResults.map((essay) => (
                  <EssayAccordionItem
                    key={essay.tier}
                    essay={essay}
                    open={openEssayTier === essay.tier}
                    onToggle={() => setOpenEssayTier(openEssayTier === essay.tier ? null : essay.tier)}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="tp-card tp-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>Lộ trình học tập của bạn đã sẵn sàng</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                Các lĩnh vực chưa đạt đã được xếp khóa học tương ứng trên lộ trình của bạn.
              </div>
            </div>
            <Link to={PULSE_PATHS.path} className={btn()}>
              Xem lộ trình học tập <ArrowRight size={15} aria-hidden />
            </Link>
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
