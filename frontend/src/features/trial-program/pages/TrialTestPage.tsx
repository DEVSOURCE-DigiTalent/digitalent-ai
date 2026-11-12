import { useState, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  Hourglass,
  Lightbulb,
  Mic,
  Monitor,
  RefreshCw,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useMyTrialAssessment } from '@/hooks/use-trial-program';
import type {
  MyTrialAssessment,
  TrialEmployeeDomainDetail,
} from '@/services/trial-program.service';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import { apiErrorMessage } from '@/lib/utils';
import { TIER_LABELS, formatWhen } from '../lib/trial-format';
import { TrialExam } from '../components/TrialExam';
import '../trial-program.css';
import '../trial-test.css';

const TT02_DOMAINS_SUMMARY = [
  { num: 1, name: 'Khai thác dữ liệu và thông tin', desc: 'Tìm kiếm, đánh giá và quản lý dữ liệu số an toàn' },
  { num: 2, name: 'Giao tiếp và hợp tác số', desc: 'Tương tác, chia sẻ và làm việc nhóm qua công cụ số' },
  { num: 3, name: 'Sáng tạo nội dung số', desc: 'Xây dựng, biên tập tài liệu, media và tuân thủ bản quyền' },
  { num: 4, name: 'An toàn & Bảo mật', desc: 'Bảo vệ thiết bị, dữ liệu cá nhân và an toàn trên không gian mạng' },
  { num: 5, name: 'Giải quyết vấn đề', desc: 'Ứng dụng công nghệ xử lý sự cố kỹ thuật và tối ưu công việc' },
  { num: 6, name: 'Ứng dụng Trí tuệ nhân tạo (AI)', desc: 'Sử dụng AI tạo sinh, prompt engineering và tuân thủ đạo đức AI' },
];

/* ── DOMAIN ACCORDION ITEM ───────────────────────────────────────────────── */
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
  const isPassed = (detail?.skillGap ?? 0) === 0;
  const levelName = TIER_LABELS[level as 1 | 2 | 3] || 'Chưa đạt';
  const targetLevel = detail?.targetLevel ?? 1;
  const targetName = TIER_LABELS[targetLevel as 1 | 2 | 3] || `Cấp ${targetLevel}`;

  return (
    <div className={`tt-domain-item${open ? ' tt-domain-item--open' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        className="tt-domain-btn"
        aria-expanded={open}
      >
        <div className="tt-domain-btn-left">
          <div
            className={`tt-domain-num-badge ${
              isPassed ? 'tt-domain-num--passed' : 'tt-domain-num--pending'
            }`}
          >
            {domain.number}
          </div>
          <div>
            <div className="tt-domain-name">{domain.name}</div>
            <div className="tt-domain-subline">
              <span>Đạt: <strong className="tt-domain-highlight">Cấp {level} ({levelName})</strong></span>
              <span className="tt-domain-sep">•</span>
              <span>Chuẩn vị trí: <strong>Cấp {targetLevel} ({targetName})</strong></span>
            </div>
          </div>
        </div>

        <div className="tt-domain-btn-right">
          {isPassed ? (
            <span className="tt-badge tt-badge--subtle-ok" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
              <span>Đạt chuẩn</span>
              <span className="tt-pill-exempt">Miễn học</span>
            </span>
          ) : (
            <span className="tt-badge tt-badge--amber" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <AlertCircle size={13} /> Cần bồi dưỡng (Thiếu {detail?.skillGap ?? 1} cấp)
            </span>
          )}
          <ChevronDown
            size={18}
            style={{
              color: open ? '#2563eb' : '#94a3b8',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              marginLeft: 4,
            }}
          />
        </div>
      </button>

      {open && (
        <div className="tt-domain-body">
          {/* Kết quả trắc nghiệm theo 3 cấp độ */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#64748b',
                marginBottom: 8,
                letterSpacing: '0.04em',
              }}
            >
              Kết quả trắc nghiệm theo từng cấp độ (Đạt từ 2/3 câu)
            </div>
            <div className="tt-tier-results-grid">
              {[
                {
                  tier: 'Cấp 1: Cơ bản',
                  correct: detail?.basicCorrect ?? 0,
                  total: detail?.basicTotal ?? 3,
                  passed: (detail?.basicCorrect ?? 0) >= 2,
                },
                {
                  tier: 'Cấp 2: Trung cấp',
                  correct: detail?.intermediateCorrect ?? 0,
                  total: detail?.intermediateTotal ?? 3,
                  passed:
                    (detail?.intermediateCorrect ?? 0) >= 2 &&
                    (detail?.basicCorrect ?? 0) >= 2,
                },
                {
                  tier: 'Cấp 3: Nâng cao',
                  correct: detail?.advancedCorrect ?? 0,
                  total: detail?.advancedTotal ?? 3,
                  passed:
                    (detail?.advancedCorrect ?? 0) >= 2 &&
                    (detail?.intermediateCorrect ?? 0) >= 2 &&
                    (detail?.basicCorrect ?? 0) >= 2,
                },
              ].map((tierItem, idx) => (
                <div
                  key={idx}
                  className={`tt-tier-result-card${
                    tierItem.passed ? ' tt-tier-result-card--passed' : ''
                  }`}
                >
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>
                    {tierItem.tier}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 750,
                        color: '#0f172a',
                      }}
                    >
                      {tierItem.correct}/{tierItem.total}{' '}
                      <small style={{ fontSize: 11, fontWeight: 400, color: '#64748b' }}>câu</small>
                    </span>
                    <span
                      className={`tt-badge ${
                        tierItem.passed ? 'tt-badge--blue' : 'tt-badge--amber'
                      }`}
                      style={{ fontSize: 11, padding: '2px 8px' }}
                    >
                      {tierItem.passed ? 'Đạt' : 'Chưa đạt'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Khoảng cách năng lực & Chính sách đào tạo */}
          <div
            className={`tt-gap-box ${
              isPassed ? 'tt-gap-box--ok' : 'tt-gap-box--gap'
            }`}
          >
            {isPassed ? (
              <CheckCircle2 size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: 2 }} />
            ) : (
              <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
            )}
            <div>
              <strong>
                {isPassed
                  ? 'Chính sách đào tạo: '
                  : 'Khoảng cách năng lực: '}
              </strong>
              {isPassed ? (
                <>
                  Đạt trần năng lực yêu cầu của chức danh. Học phần tương ứng của lĩnh vực này được tự động công nhận hoàn thành <span className="tt-pill-exempt" style={{ marginLeft: 3 }}>Miễn học</span>.
                </>
              ) : (
                'Chưa đạt trần năng lực yêu cầu của chức danh. Bạn cần hoàn thành khóa học bồi dưỡng để nâng chuẩn năng lực cho vị trí này.'
              )}
            </div>
          </div>

          {/* Khóa học đề xuất */}
          {detail?.recommendedCourse && (
            <div className="tt-rec-course-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
                <span>
                  Khóa học bồi dưỡng: <strong>{detail.recommendedCourse}</strong>
                </span>
              </div>
              <Link to={PULSE_PATHS.path} className="tt-btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
                Vào học ngay <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   BÀN LÀM VIỆC CHỜ KẾT QUẢ (WAITING WORKBENCH)
   Trạng thái chờ chủ doanh nghiệp xác nhận đợt khảo thí
   ══════════════════════════════════════════════════════════════════════════ */
function WaitingWorkbench({ data }: { data: MyTrialAssessment }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 450);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Hero Card: Trạng thái tiếp nhận & Quy trình 3 bước */}
      <section className="tt-waiting-hero">
        <div className="tt-waiting-header-row">
          <div className="tt-waiting-status-lead">
            <div className="tt-waiting-icon-pulse">
              <Hourglass size={22} />
            </div>
            <div>
              <h2 className="tt-waiting-title">Đã nộp bài đánh giá năng lực số</h2>
              <p className="tt-waiting-meta">
                Tiếp nhận lúc <strong>{formatWhen(data.submittedAt)}</strong>. Dữ liệu bài làm đã được lưu trữ an toàn.
              </p>
            </div>
          </div>
          <span className="tt-badge tt-badge--amber" style={{ padding: '6px 14px', fontSize: 12.5, fontWeight: 700 }}>
            <Clock size={14} /> Chờ duyệt
          </span>
        </div>

        {/* Quy trình tiến độ 3 chặng chuẩn hóa */}
        <div className="tt-workflow-tracker">
          <div className="tt-workflow-step tt-step--done">
            <div className="tt-step-num">✓</div>
            <div className="tt-step-text">
              <span className="tt-step-title">1. Nộp bài trắc nghiệm</span>
              <span className="tt-step-sub">{data.submittedAt ? formatWhen(data.submittedAt) : '54/54 câu hoàn thành'}</span>
            </div>
          </div>

          <div className="tt-workflow-step tt-step--done">
            <div className="tt-step-num">✓</div>
            <div className="tt-step-text">
              <span className="tt-step-title">2. Bản ghi giám sát</span>
              <span className="tt-step-sub">Camera, mic & màn hình hợp lệ</span>
            </div>
          </div>

          <div className="tt-workflow-step tt-step--active">
            <div className="tt-step-num">
              <Clock size={13} />
            </div>
            <div className="tt-step-text">
              <span className="tt-step-title">3. Phê duyệt & Mở khóa</span>
              <span className="tt-step-sub">Áp trần chuẩn & mở lộ trình</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bento Grid 2 Khối cân đối: 6 Lĩnh vực & Tóm tắt các bước tiếp theo */}
      <section className="tt-bento-grid">
        {/* Khối 1: 6 Lĩnh vực khảo sát */}
        <div className="tt-bento-card">
          <div className="tt-bento-card-top">
            <div className="tt-bento-card-icon tt-bento-card-icon--teal">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="tt-bento-card-title">6 Lĩnh vực năng lực số đã làm</h3>
              <p className="tt-bento-card-desc">Khung đánh giá năng lực số chuẩn hóa</p>
            </div>
          </div>

          <div className="tt-domains-preview-grid">
            {TT02_DOMAINS_SUMMARY.map((dom) => (
              <div key={dom.num} className="tt-domain-chip" title={dom.desc}>
                <span className="tt-domain-chip-num">{dom.num}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {dom.name}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 'auto', background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <Zap size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>Chính sách miễn học:</strong> Bạn được tự động miễn học các môn thuộc lĩnh vực đã đạt chuẩn theo yêu cầu vị trí.
            </span>
          </div>
        </div>

        {/* Khối 2: Tóm tắt các bước tiếp theo */}
        <div className="tt-bento-card">
          <div className="tt-bento-card-top">
            <div className="tt-bento-card-icon tt-bento-card-icon--purple">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="tt-bento-card-title">Các bước tiếp theo</h3>
              <p className="tt-bento-card-desc">Tóm tắt tiến trình sau khi nộp</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: '#334155', lineHeight: 1.55 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', marginTop: 8, flexShrink: 0 }} />
              <div>
                <strong>Đối soát chuẩn năng lực:</strong> Ban quản lý rà soát điểm thi và áp trần yêu cầu theo từng vị trí việc làm.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: '#334155', lineHeight: 1.55 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', marginTop: 8, flexShrink: 0 }} />
              <div>
                <strong>Kích hoạt đào tạo:</strong> Hệ thống tự động mở khóa các khóa học cần bổ sung và cập nhật lên Bàn làm việc.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto', paddingTop: 10 }}>
            <button
              type="button"
              onClick={handleRefresh}
              className="tt-btn-primary"
              disabled={isRefreshing}
              style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Đang làm mới...' : 'Làm mới trạng thái'}
            </button>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b', textAlign: 'center' }}>
              Bạn có thể an tâm rời trang. Kết quả sẽ tự động hiển thị khi hoàn tất phê duyệt.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TRẠNG THÁI CHƯA LÀM BÀI (NOT STARTED)
   ══════════════════════════════════════════════════════════════════════════ */
function NotStartedIntro({ data }: { data: MyTrialAssessment }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section className="tt-intro-hero">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="pu-path-badge-pill">
            <GraduationCap size={13} className="text-blue-700" />
            <span>Khảo sát năng lực số đầu vào</span>
          </div>
          <h2 className="tt-intro-card-title">
            Đánh giá 6 lĩnh vực năng lực số đầu vào
          </h2>
          <p className="tt-intro-card-desc">
            Khảo sát định vị năng lực, tự động công nhận miễn học các khóa đã nắm vững và tối ưu lộ trình đào tạo.
          </p>
        </div>

        {/* 3 Cấp độ bài thi */}
        <div className="tt-tier-grid">
          {[1, 2, 3].map((tier) => (
            <div key={tier} className="tt-tier-card">
              <span className="tt-tier-tag">Phần {tier}</span>
              <span className="tt-tier-name">{TIER_LABELS[tier]}</span>
              <span className="tt-tier-meta">
                {data.choiceCount / 3 || 18} câu trắc nghiệm
              </span>
            </div>
          ))}
        </div>

        {/* Pre-flight checklist */}
        <div className="tt-preflight-box">
          <div className="tt-preflight-items">
            <div className="tt-preflight-item">
              <Monitor size={16} style={{ color: '#3448cf' }} /> Toàn màn hình
            </div>
            <div className="tt-preflight-item">
              <Camera size={16} style={{ color: '#3448cf' }} /> Camera
            </div>
            <div className="tt-preflight-item">
              <Mic size={16} style={{ color: '#3448cf' }} /> Micro
            </div>
            <div className="tt-preflight-item">
              <Clock size={16} style={{ color: '#3448cf' }} /> Thực hiện 1 lần
            </div>
          </div>

          {data.canStart ? (
            <Link to={PULSE_PATHS.trialExam} className="tt-btn-primary">
              Vào phòng thi có giám sát <ArrowRight size={15} />
            </Link>
          ) : (
            <span className="tt-badge tt-badge--amber">{data.closedMessage || 'Chưa mở phòng thi'}</span>
          )}
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TRẠNG THÁI ĐÃ CÔNG BỐ KẾT QUẢ (REVIEWED)
   ══════════════════════════════════════════════════════════════════════════ */
function ReviewedDashboard({
  data,
  openCategory,
  setOpenCategory,
}: {
  data: MyTrialAssessment;
  openCategory: string | null;
  setOpenCategory: (val: string | null) => void;
}) {
  const passedCount = data.domainDetails?.filter((d) => (d.skillGap ?? 0) === 0).length ?? 0;
  const totalDomains = data.domains.length || 6;
  const exemptCount = passedCount;
  const gapCount = totalDomains - passedCount;

  // Tổng số câu trắc nghiệm đúng thực tế của nhân viên
  const totalCorrect = data.domainDetails?.reduce(
    (sum, d) => sum + (d.basicCorrect ?? 0) + (d.intermediateCorrect ?? 0) + (d.advancedCorrect ?? 0),
    0
  ) ?? 0;

  const totalChoiceQuestions = data.domainDetails?.reduce(
    (sum, d) => sum + (d.basicTotal ?? 3) + (d.intermediateTotal ?? 3) + (d.advancedTotal ?? 3),
    0
  ) || data.choiceCount || 54;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Scorecard Hero: Nền sáng cao cấp, 3 chỉ số cốt lõi */}
      <section className="tt-score-hero">
        <div className="tt-score-hero-lead">
          <span className="tt-score-hero-badge">
            <CheckCircle2 size={13} /> Kết quả khảo thí đã phê duyệt
          </span>
          <h2 className="tt-score-hero-title">
            Báo cáo năng lực số chức danh
          </h2>
          <p className="tt-score-hero-desc">
            Kết quả đối soát theo khung chuẩn năng lực số tại {data.organizationName}.
          </p>
        </div>

        <div className="tt-score-metrics-cluster">
          <div className="tt-score-metric-box">
            <span className="tt-score-metric-val blue">
              {passedCount}/{totalDomains}
            </span>
            <span className="tt-score-metric-lbl">Lĩnh vực đạt chuẩn</span>
          </div>
          <div className="tt-score-metric-box tt-score-metric-box--exempt">
            <span className="tt-score-metric-val green">
              {exemptCount} môn
            </span>
            <span className="tt-score-metric-lbl">Được miễn học</span>
          </div>
          <div className="tt-score-metric-box">
            <span className="tt-score-metric-val">
              {totalCorrect}/{totalChoiceQuestions}
            </span>
            <span className="tt-score-metric-lbl">Câu trắc nghiệm đúng</span>
          </div>
        </div>
      </section>

      {/* 2. Khối Hành động Lộ trình cá nhân hóa (Action Center) */}
      <section className={`tt-action-callout ${gapCount === 0 ? 'tt-action-callout--success' : 'tt-action-callout--gap'}`}>
        <div className="tt-action-callout-left">
          <div className="tt-action-callout-icon">
            {gapCount === 0 ? <Award size={22} /> : <Target size={22} />}
          </div>
          <div>
            <h3 className="tt-action-callout-title">
              {gapCount === 0
                ? 'Đã đạt 100% chuẩn trần năng lực của vị trí việc làm'
                : `Lộ trình đào tạo cá nhân hóa: Cần bồi dưỡng ${gapCount} môn`}
            </h3>
            <p className="tt-action-callout-desc">
              {gapCount === 0
                ? 'Bạn được tự động miễn tất cả các học phần cơ bản. Bấm xem chứng nhận để kiểm tra và lưu chứng nhận số của bạn.'
                : `Bạn được miễn học ${exemptCount} môn và cần hoàn thành ${gapCount} môn còn lại để đạt chuẩn trần năng lực vị trí.`}
            </p>
          </div>
        </div>

        <Link
          to={gapCount === 0 ? PULSE_PATHS.outcomes : PULSE_PATHS.path}
          className="tt-btn-primary tt-action-callout-btn"
        >
          {gapCount === 0 ? 'Xem chứng nhận' : 'Vào học các môn cần bổ sung'} <ArrowRight size={15} />
        </Link>
      </section>

      {/* 3. Chi tiết 6 Lĩnh vực Năng lực Trắc nghiệm */}
      <section className="tt-card">
        <div className="tt-card-head">
          <div>
            <h3 className="tt-card-title">Kết quả chi tiết 6 lĩnh vực năng lực số</h3>
            <p className="tt-card-desc">
              Bấm vào từng lĩnh vực để xem chi tiết kết quả trắc nghiệm và môn học tương ứng.
            </p>
          </div>
          <span className={`tt-badge ${passedCount === totalDomains ? 'tt-badge--blue' : 'tt-badge--amber'}`}>
            {passedCount === totalDomains ? 'Đạt chuẩn 6/6 lĩnh vực' : `Cần hoàn thiện ${gapCount} lĩnh vực`}
          </span>
        </div>

        <div className="tt-accordion-list">
          {data.domains.map((d, i) => {
            const detail = data.domainDetails?.find((x) => x.categoryId === d.categoryId) ?? null;
            const level = data.levels?.[i] ?? 0;
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

        {data.reviewNote && (
          <div className="tt-gap-box tt-gap-box--ok" style={{ marginTop: 8 }}>
            <Lightbulb size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Ghi chú từ Doanh nghiệp:</strong> {data.reviewNote}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TRANG CHÍNH: EM-T1 · BÀI ĐÁNH GIÁ NĂNG LỰC DÙNG THỬ
   ══════════════════════════════════════════════════════════════════════════ */
export function TrialTestPage() {
  const { data, isLoading, error } = useMyTrialAssessment();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  if (isLoading) return <p className="pu-muted">Đang tải…</p>;
  if (error || !data) {
    return <p className="pu-notice warning">{apiErrorMessage(error, 'Không tải được bài đánh giá.')}</p>;
  }

  return (
    <div className="tt-container">
      {/* Header đầu trang */}
      <header className="tt-head">
        <div className="pu-path-title-block">
          <div className="pu-path-badge-pill">
            <Sparkles size={13} className="text-blue-700" />
            <span>{data.organizationName} · Chương trình dùng thử</span>
          </div>
          <h1 className="pu-path-main-title">
            {data.status === 'REVIEWED' && data.reportPublished
              ? 'Báo cáo Đánh giá Năng lực Đầu vào'
              : 'Khảo sát Năng lực Số Đầu vào'}
          </h1>
          <p className="pu-path-sub-title">
            {data.status === 'REVIEWED' && data.reportPublished
              ? 'Kết quả khảo sát năng lực số đầu vào và xếp hạng chuẩn hóa theo vị trí việc làm.'
              : 'Hệ thống chuẩn hóa và phát triển khung năng lực số chuyên môn doanh nghiệp.'}
          </p>
        </div>

        {data.testDeadline && data.status === 'NOT_STARTED' && (
          <span className="tt-badge tt-badge--amber" style={{ padding: '6px 14px', fontSize: 13 }}>
            <Clock size={14} /> Hạn chót: {formatWhen(data.testDeadline)}
          </span>
        )}
      </header>

      {/* Điều phối theo 3 trạng thái */}
      {data.status === 'NOT_STARTED' && <NotStartedIntro data={data} />}

      {(data.status === 'SUBMITTED' || (data.submittedAt && !data.reportPublished)) && (
        <WaitingWorkbench data={data} />
      )}

      {data.status === 'REVIEWED' && data.reportPublished && data.levels && (
        <ReviewedDashboard
          data={data}
          openCategory={openCategory}
          setOpenCategory={setOpenCategory}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   EM-T2 · KHÔNG GIAN THI CÓ GIÁM SÁT
   ══════════════════════════════════════════════════════════════════════════ */
export function TrialExamPage() {
  const { data, isLoading } = useMyTrialAssessment();
  const entered = useRef<boolean | null>(null);
  if (isLoading) return null;
  entered.current ??= Boolean(data?.canStart);
  if (!entered.current || !data) return <Navigate to={PULSE_PATHS.trialTest} replace />;
  return <TrialExam organizationName={data.organizationName} deadline={data.testDeadline} />;
}
