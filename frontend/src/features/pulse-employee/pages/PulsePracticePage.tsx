import { useState, useMemo, Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  GraduationCap,
  Info,
  Lock,
  Sparkles,
  Timer,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { usePulseOutcomes, usePulseOverview, usePulsePractice } from '@/hooks/use-pulse';
import type { PulseCriterion } from '@/services/pulse.service';
import { LoadError, PageSkeleton } from '../components/ui';
import { levelName, pulseErrorMessage, timeLeft } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

type FilterTab = 'all' | 'pre' | 'final' | 'pending' | 'completed';

interface AssessmentRowItem {
  courseId: string;
  code: string;
  title: string;
  domainName: string;
  domainNumber: number;
  tier: number;
  inPath: boolean;
  // Pre-assessment status
  canStartPreAssessment: boolean;
  preStatus: string;
  preSubmittedAt?: string | null;
  preReviewedAt?: string | null;
  preDecisionReason?: string | null;
  // Final assessment status
  canStartFinal: boolean;
  finalStatus: string;
  finalSubmittedAt?: string | null;
  finalReviewedAt?: string | null;
  finalDecisionReason?: string | null;
  retryDueAt?: string | null;
  retryOpensAt?: string | null;
  finalAttempts: number;
  // Module learning progress
  progressPercent: number;
  modulesPassed: number;
  moduleCount: number;
  // Flags
  approved: boolean;
  approvedVia?: string | null;
  actionRequired: boolean;
  isPending: boolean;
  isCompleted: boolean;
}

function formatTitle(title: string): string {
  if (!title) return '';
  const trimmed = title.trim();
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
    const lower = trimmed.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  return trimmed;
}

export function PulsePracticePage() {
  const practice = usePulsePractice();
  const overview = usePulseOverview();
  const outcomesQuery = usePulseOutcomes();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);

  const preAssessments = practice.data?.preAssessments ?? [];
  const finals = practice.data?.finals ?? [];
  const overviewCourses = overview.data?.courses ?? [];

  // Bản đồ courseId -> outcomeId (để nút "Xem kết quả" mở thẳng chứng chỉ môn đó)
  const outcomesByCourse = useMemo(() => {
    const map = new Map<string, string>();
    for (const outcome of outcomesQuery.data ?? []) {
      if (outcome.courseId) {
        map.set(outcome.courseId, outcome.id);
      }
    }
    return map;
  }, [outcomesQuery.data]);

  // Hợp nhất dữ liệu Khảo thí & Khóa học từ Overview + Practice API
  const assessmentItems: AssessmentRowItem[] = useMemo(() => {
    const map = new Map<string, AssessmentRowItem>();

    // 1. Khởi tạo từ Overview Courses (toàn bộ lộ trình chuẩn vị trí)
    for (const c of overviewCourses) {
      const isPreOpen = c.canStartPreAssessment || c.preStatus === 'REQUIRED';
      const isFinalOpen = c.finalStatus === 'READY' || c.finalStatus === 'RETRY_READY';
      const isPending = c.preStatus === 'PENDING' || c.finalStatus === 'PENDING';
      const isCompleted = c.approved || c.finalStatus === 'APPROVED' || c.preStatus === 'PASSED';

      map.set(c.courseId, {
        courseId: c.courseId,
        code: c.code,
        title: formatTitle(c.title),
        domainName: c.domainName || `Lĩnh vực ${c.domainNumber}`,
        domainNumber: c.domainNumber || 1,
        tier: c.tier || 1,
        inPath: c.inPath,
        canStartPreAssessment: c.canStartPreAssessment,
        preStatus: c.preStatus,
        preSubmittedAt: c.preAssessment?.submittedAt ?? null,
        preReviewedAt: c.preAssessment?.reviewedAt ?? null,
        preDecisionReason: c.preAssessment?.decisionReason ?? null,
        canStartFinal: c.canStartFinal,
        finalStatus: c.finalStatus,
        finalSubmittedAt: null,
        finalReviewedAt: null,
        finalDecisionReason: null,
        retryDueAt: null,
        retryOpensAt: null,
        finalAttempts: c.finalAttempts || 0,
        progressPercent: c.progressPercent || 0,
        modulesPassed: c.modulesPassed || 0,
        moduleCount: c.moduleCount || 5,
        approved: c.approved,
        approvedVia: c.approvedVia ?? null,
        actionRequired: isPreOpen || isFinalOpen,
        isPending,
        isCompleted,
      });
    }

    // 2. Bổ sung thông tin chi tiết bài nộp Final từ Practice API
    for (const item of finals) {
      const c = item.course;
      const existing = map.get(c.courseId);
      const isFinalOpen = c.finalStatus === 'READY' || c.finalStatus === 'RETRY_READY';
      const isPreOpen = c.preStatus === 'REQUIRED' || c.canStartPreAssessment;
      const isPending = c.finalStatus === 'PENDING' || c.preStatus === 'PENDING';
      const isCompleted = c.finalStatus === 'APPROVED' || c.preStatus === 'PASSED';

      if (existing) {
        existing.finalStatus = c.finalStatus;
        existing.finalSubmittedAt = item.lastSubmittedAt;
        existing.finalReviewedAt = item.lastReviewedAt;
        existing.finalDecisionReason = item.lastDecisionReason;
        existing.retryDueAt = item.retryDueAt;
        existing.retryOpensAt = item.retryOpensAt;
        existing.finalAttempts = c.finalAttempts;
        existing.progressPercent = c.progressPercent;
        existing.modulesPassed = c.modulesPassed;
        existing.moduleCount = c.moduleCount;
        existing.actionRequired = existing.actionRequired || isFinalOpen;
        existing.isPending = existing.isPending || isPending;
        existing.isCompleted = existing.isCompleted || isCompleted;
      } else {
        map.set(c.courseId, {
          courseId: c.courseId,
          code: c.code,
          title: formatTitle(c.title),
          domainName: c.domainName,
          domainNumber: 1,
          tier: c.tier,
          inPath: c.inPath,
          canStartPreAssessment: c.canStartPreAssessment,
          preStatus: c.preStatus,
          preSubmittedAt: null,
          preReviewedAt: null,
          preDecisionReason: null,
          canStartFinal: isFinalOpen,
          finalStatus: c.finalStatus,
          finalSubmittedAt: item.lastSubmittedAt,
          finalReviewedAt: item.lastReviewedAt,
          finalDecisionReason: item.lastDecisionReason,
          retryDueAt: item.retryDueAt,
          retryOpensAt: item.retryOpensAt,
          finalAttempts: c.finalAttempts,
          progressPercent: c.progressPercent,
          modulesPassed: c.modulesPassed,
          moduleCount: c.moduleCount,
          approved: isCompleted,
          approvedVia: null,
          actionRequired: isFinalOpen || isPreOpen,
          isPending,
          isCompleted,
        });
      }
    }

    // 3. Bổ sung thông tin chi tiết bài nộp Pre-assessment từ Practice API
    for (const item of preAssessments) {
      const c = item.course;
      const existing = map.get(c.courseId);
      if (existing) {
        existing.preSubmittedAt = item.lastSubmittedAt;
        existing.preReviewedAt = item.lastReviewedAt;
        existing.preDecisionReason = item.lastDecisionReason;
        if (c.preStatus === 'PENDING') existing.isPending = true;
        if (c.preStatus === 'PASSED') existing.isCompleted = true;
      }
    }

    return Array.from(map.values());
  }, [overviewCourses, finals, preAssessments]);

  // ── Tính toán số liệu Chiến dịch Khảo sát Đầu vào (Onboarding Baseline Campaign) ──
  // 1. Tiến độ theo Lộ trình Chức danh (các khóa bắt buộc trong vị trí việc làm)
  const pathEligibleCourses = useMemo(
    () => assessmentItems.filter((i) => i.inPath && i.preStatus !== 'NOT_NEEDED'),
    [assessmentItems]
  );
  const pathDoneCourses = useMemo(
    () => pathEligibleCourses.filter((i) => i.preStatus === 'PASSED' || (i.preStatus === 'NOT_YET' && i.preSubmittedAt)),
    [pathEligibleCourses]
  );
  const pathCampaignProgress = pathEligibleCourses.length > 0
    ? Math.round((pathDoneCourses.length / pathEligibleCourses.length) * 100)
    : 100;

  // 2. Tiến độ toàn diện (toàn bộ 16 khóa trong hệ sinh thái 6 lĩnh vực)
  const allEligibleCourses = useMemo(
    () => assessmentItems.filter((i) => i.preStatus !== 'NOT_NEEDED'),
    [assessmentItems]
  );
  const allDoneCourses = useMemo(
    () => allEligibleCourses.filter((i) => i.preStatus === 'PASSED' || (i.preStatus === 'NOT_YET' && i.preSubmittedAt)),
    [allEligibleCourses]
  );

  const exemptedCourses = useMemo(
    () => assessmentItems.filter((i) => i.preStatus === 'PASSED' || i.approvedVia === 'PRE_ASSESSMENT'),
    [assessmentItems]
  );

  // Bài kiểm tra đầu vào tiếp theo gợi ý cho nhân viên (ưu tiên môn theo chức danh trước)
  const nextPreCourse = useMemo(
    () =>
      pathEligibleCourses.find(
        (i) =>
          (i.canStartPreAssessment || i.preStatus === 'REQUIRED' || i.preStatus === 'NOT_YET') &&
          i.preStatus !== 'PASSED' &&
          i.preStatus !== 'PENDING'
      ) ||
      allEligibleCourses.find(
        (i) =>
          (i.canStartPreAssessment || i.preStatus === 'REQUIRED' || i.preStatus === 'NOT_YET') &&
          i.preStatus !== 'PASSED' &&
          i.preStatus !== 'PENDING'
      ),
    [pathEligibleCourses, allEligibleCourses]
  );

  // ── 3 Chỉ số KPI Thống kê Khảo thí ──
  const urgentCount = assessmentItems.filter((c) => c.actionRequired).length;
  const pendingCount = assessmentItems.filter((c) => c.isPending).length;
  const completedCount = assessmentItems.filter((c) => c.isCompleted).length;
  const savedHours = exemptedCourses.length * 4; // Trung bình mỗi môn được miễn học tiết kiệm 4 giờ lý thuyết

  // ── Lọc danh sách theo Tab ──
  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'pre':
        return assessmentItems.filter((c) => c.preStatus !== 'NOT_NEEDED');
      case 'final':
        return assessmentItems.filter((c) => c.finalStatus !== 'NOT_READY' || c.progressPercent > 0);
      case 'pending':
        return assessmentItems.filter((c) => c.isPending);
      case 'completed':
        return assessmentItems.filter((c) => c.isCompleted);
      default:
        return assessmentItems;
    }
  }, [assessmentItems, activeTab]);

  // ── Sắp xếp các khóa học lần lượt theo 6 Lĩnh vực chuẩn hóa ──
  const sortedFilteredItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (a.domainNumber !== b.domainNumber) {
        return a.domainNumber - b.domainNumber;
      }
      if (a.tier !== b.tier) {
        return a.tier - b.tier;
      }
      return a.code.localeCompare(b.code);
    });
  }, [filteredItems]);

  if (practice.isLoading || overview.isLoading) {
    return <PageSkeleton blocks={[90, 160, 110, 360]} />;
  }

  if ((practice.error && !practice.data) || (overview.error && !overview.data)) {
    return (
      <LoadError
        message={pulseErrorMessage(practice.error || overview.error, 'Không tải được dữ liệu khảo thí.')}
        onRetry={() => {
          practice.refetch();
          overview.refetch();
        }}
      />
    );
  }

  return (
    <div className="pu-workbench-wrap">
      {/* ── 1. Header Trang Khảo thí & Đánh giá (Dựa theo chuẩn pill + H1 + subtitle) ── */}
      <header className="pu-workbench-header">
        <div className="pu-path-title-block">
          <div className="pu-path-badge-pill">
            <Sparkles size={13} className="text-blue-800" />
            <span>Hệ thống Đánh giá Chuẩn hóa</span>
          </div>
          <h1 className="pu-path-main-title">Khảo thí & Đánh giá Năng lực</h1>
          <p className="pu-path-sub-title">Khảo sát năng lực đầu vào và thi đánh giá chuẩn hóa năng lực số theo chức danh.</p>
        </div>

        {/* Nút xem nhanh Tiêu chuẩn đánh giá (Modal tra cứu khi cần) */}
        <button
          type="button"
          onClick={() => setShowCriteriaModal(true)}
          className="pu-criteria-trigger-btn"
          title="Xem tiêu chuẩn đánh giá bài làm"
        >
          <Info size={15} />
          <span>Tiêu chuẩn đánh giá</span>
        </button>
      </header>

      {/* ── 2. HERO: CHIẾN DỊCH ĐÁNH GIÁ ĐẦU VÀO CHO NHÂN VIÊN MỚI ────────── */}
      <section className="pu-campaign-banner" aria-label="Chiến dịch khảo sát năng lực đầu vào">
        <div className="pu-campaign-left">
          <div className="pu-campaign-tag">
            <Sparkles size={12} />
            <span>Khảo sát đầu vào</span>
          </div>
          <h2 className="pu-campaign-h2">Đánh giá năng lực đầu vào</h2>
          <p className="pu-campaign-p">
            Hoàn thành bài test để được miễn học toàn bộ lý thuyết các môn bạn đã thành thạo.
          </p>

          {/* Thanh tiến độ hoàn thành đợt khảo sát */}
          <div className="pu-campaign-progress-box">
            <div className="pu-campaign-prog-meta">
              <span>
                Tiến độ theo chức danh: <strong>{pathDoneCourses.length} / {pathEligibleCourses.length || 8}</strong> bài đã làm
                <span style={{ fontWeight: 400, color: '#64748b', fontSize: '12px', marginLeft: '6px' }}>
                  ({allDoneCourses.length}/{allEligibleCourses.length} môn toàn 6 lĩnh vực)
                </span>
              </span>
              <strong>{pathCampaignProgress}%</strong>
            </div>
            <div className="pu-campaign-prog-track">
              <div
                className="pu-campaign-prog-fill"
                style={{ width: `${Math.max(4, pathCampaignProgress)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Khối hành động 1-Click: Bài test tiếp theo cần làm ngay */}
        <div className="pu-campaign-right">
          {nextPreCourse ? (
            <>
              <span className="pu-campaign-next-label">
                <Clock size={12} /> Bài tiếp theo
              </span>
              <div className="pu-campaign-next-course">
                <div className="pu-campaign-next-code-row">
                  <span className="pu-campaign-next-code">{nextPreCourse.code}</span>
                  <span className="pu-campaign-next-domain">{nextPreCourse.domainName}</span>
                </div>
                <h3 className="pu-campaign-next-title">{nextPreCourse.title}</h3>
              </div>
              <Link
                to={PULSE_PATHS.preAssessment(nextPreCourse.courseId)}
                className="pu-campaign-cta-btn"
              >
                <span>Làm bài ngay</span>
                <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <div className="pu-campaign-done-box">
              <Trophy size={32} className="text-emerald-400" />
              <h4>Đã hoàn thành đợt khảo sát!</h4>
              <p>
                Đã miễn học <strong>{exemptedCourses.length} môn</strong> và tiết kiệm <strong>~{savedHours} giờ</strong> học lý thuyết!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. Executive KPI Cards (3 Thẻ Chỉ số Khảo thí Thông minh) ─────── */}
      <section className="pu-kpi-grid" aria-label="Tóm tắt khảo thí">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`pu-kpi-card urgent${activeTab === 'all' && urgentCount > 0 ? ' active' : ''}`}
        >
          <div className="pu-kpi-icon-wrap urgent">
            <Zap size={22} />
          </div>
          <div className="pu-kpi-content">
            <div className="pu-kpi-num-row">
              <span className="pu-kpi-num">{urgentCount}</span>
            </div>
            <div className="pu-kpi-label">Bài thi cần làm ngay</div>
            <small className="pu-kpi-desc">
              Gồm bài test đầu vào & bài thi cuối khóa đang mở
            </small>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`pu-kpi-card pending${activeTab === 'pending' ? ' active' : ''}`}
        >
          <div className="pu-kpi-icon-wrap pending">
            <Timer size={22} />
          </div>
          <div className="pu-kpi-content">
            <div className="pu-kpi-num-row">
              <span className="pu-kpi-num">{pendingCount}</span>
            </div>
            <div className="pu-kpi-label">Đang chờ sếp duyệt</div>
            <small className="pu-kpi-desc">
              SLA phản hồi dự kiến: ~24-48 giờ
            </small>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`pu-kpi-card completed${activeTab === 'completed' ? ' active' : ''}`}
        >
          <div className="pu-kpi-icon-wrap completed">
            <Trophy size={22} />
          </div>
          <div className="pu-kpi-content">
            <div className="pu-kpi-num-row">
              <span className="pu-kpi-num">{completedCount}</span>
            </div>
            <div className="pu-kpi-label">Năng lực đã công nhận</div>
            <small className="pu-kpi-desc">
              Đã miễn học {exemptedCourses.length} môn · Tiết kiệm ~{savedHours}h học
            </small>
          </div>
        </button>
      </section>

      {/* ── 4. Thanh điều khiển & Bộ lọc Tinh gọn (Không Emoji) ─────────────── */}
      <div className="pu-control-toolbar">
        <div className="pu-filter-chips" role="tablist" aria-label="Bộ lọc khảo thí">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pu-f-chip${activeTab === 'all' ? ' active' : ''}`}
          >
            <span>Tất cả bài khảo thí</span>
            <span className="pu-f-badge">{assessmentItems.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pre')}
            className={`pu-f-chip${activeTab === 'pre' ? ' active' : ''}`}
          >
            <Zap size={13} />
            <span>Đánh giá đầu vào (Vượt cấp)</span>
            <span className="pu-f-badge">{allEligibleCourses.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('final')}
            className={`pu-f-chip${activeTab === 'final' ? ' active' : ''}`}
          >
            <GraduationCap size={13} />
            <span>Thi cuối khóa (AI Proctored)</span>
            <span className="pu-f-badge">{finals.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`pu-f-chip${activeTab === 'pending' ? ' active' : ''}`}
          >
            <span>Chờ sếp duyệt</span>
            <span className="pu-f-badge">{pendingCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`pu-f-chip${activeTab === 'completed' ? ' active' : ''}`}
          >
            <span>Đã hoàn thành</span>
            <span className="pu-f-badge">{completedCount}</span>
          </button>
        </div>
      </div>

      {/* ── 5. Bảng Sổ Khảo Thí Chuẩn Enterprise có phân chia 6 lĩnh vực ────── */}
      {practice.isLoading && overview.isLoading ? (
        <PageSkeleton blocks={[140, 360]} />
      ) : practice.error ? (
        <LoadError
          message={pulseErrorMessage(practice.error, 'Không tải được dữ liệu khảo thí.')}
          onRetry={() => {
            practice.refetch();
            overview.refetch();
          }}
        />
      ) : (
        <div className="pu-ledger-table-wrap">
          <table className="pu-ledger-table">
            <thead className="pu-ledger-thead">
              <tr>
                <th className="pu-ledger-th">Khóa học & Lĩnh vực</th>
                <th className="pu-ledger-th">Đánh giá Đầu vào (Vượt cấp)</th>
                <th className="pu-ledger-th">Tiến độ Mô đun</th>
                <th className="pu-ledger-th">Thi Cuối khóa (AI Proctored)</th>
                <th className="pu-ledger-th">Thẩm định & Quyết định</th>
                <th className="pu-ledger-th" style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sortedFilteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Không có bài khảo thí nào trong danh mục này.
                  </td>
                </tr>
              ) : (
                sortedFilteredItems.map((item, idx) => {
                  const isNewDomain = idx === 0 || item.domainNumber !== sortedFilteredItems[idx - 1].domainNumber;
                  return (
                    <Fragment key={item.courseId}>
                      {isNewDomain && (
                        <tr className="pu-domain-divider-row">
                          <td colSpan={6} className="pu-domain-divider-td">
                            <div className="pu-domain-divider-wrap">
                              <span className="pu-domain-divider-pill">
                                Lĩnh vực 0{item.domainNumber}
                              </span>
                              <span className="pu-domain-divider-name">
                                {item.domainName}
                              </span>
                              <span className="pu-domain-divider-line" />
                            </div>
                          </td>
                        </tr>
                      )}
                      <AssessmentTableRow
                        item={item}
                        outcomeId={outcomesByCourse.get(item.courseId)}
                      />
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 6. Modal xem Tiêu chuẩn Đánh giá (Không làm rác trang chính) ───── */}
      {showCriteriaModal && (
        <div className="pu-modal-portal" role="dialog" aria-modal="true" aria-labelledby="crit-modal-title">
          <div className="pu-modal-backdrop" onClick={() => setShowCriteriaModal(false)} />
          <div className="pu-modal-box">
            <div className="pu-modal-head">
              <div>
                <h3 id="crit-modal-title" className="pu-modal-title">
                  Tiêu chuẩn Đánh giá Năng lực
                </h3>
                <p className="pu-modal-desc">
                  Áp dụng cho các bài đánh giá đầu vào và bài thi đánh giá chuẩn hóa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCriteriaModal(false)}
                className="pu-modal-close"
                aria-label="Đóng modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="pu-criteria-grid">
              {(practice.data?.criteria && practice.data.criteria.length > 0
                ? practice.data.criteria
                : DEFAULT_CRITERIA
              ).map((c) => (
                <div key={c.number} className="pu-crit-card">
                  <span className="pu-crit-badge">Tiêu chí 0{c.number}</span>
                  <div className="pu-crit-body">
                    <strong>{c.title}</strong>
                    <p>{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT: Dòng bảng Sổ Khảo Thí (Assessment Table Row)
───────────────────────────────────────────────────────────────────────────── */
function AssessmentTableRow({ item, outcomeId }: { item: AssessmentRowItem; outcomeId?: string }) {
  const isPreOpen = item.canStartPreAssessment || item.preStatus === 'REQUIRED';
  const isPrePassed = item.preStatus === 'PASSED' || item.approvedVia === 'PRE_ASSESSMENT';
  const isPrePending = item.preStatus === 'PENDING';
  const isPreNotYet = item.preStatus === 'NOT_YET';

  const isFinalApproved = item.finalStatus === 'APPROVED' || item.approved;
  const isFinalPending = item.finalStatus === 'PENDING';
  const isFinalReady = item.finalStatus === 'READY' || item.finalStatus === 'RETRY_READY';
  const isFinalLearning = item.finalStatus === 'LEARNING';

  const targetOutcomePath = PULSE_PATHS.outcome(outcomeId ?? item.courseId);

  return (
    <tr className={`pu-ledger-row${item.actionRequired ? ' is-urgent-row' : ''}`}>
      {/* 1. Khóa học & Lĩnh vực */}
      <td className="pu-ledger-td">
        <div className="pu-course-identity">
          <span className="pu-ledger-code">{item.code}</span>
          <div className="pu-ledger-title-group">
            <span className="pu-ledger-title">{item.title}</span>
            <span className="pu-ledger-domain">
              {item.domainName} · {levelName(item.tier)}
            </span>
          </div>
        </div>
      </td>

      {/* 2. Đánh giá Đầu vào (Test Vượt Cấp) */}
      <td className="pu-ledger-td">
        {isPrePassed ? (
          <Link
            to={targetOutcomePath}
            className="pu-status-pill passed hover:opacity-90 transition-opacity inline-flex items-center gap-1 cursor-pointer"
            title="Nhấn để xem chứng nhận miễn học chi tiết"
          >
            <Check size={12} strokeWidth={3} /> Đạt · Miễn học 100%
          </Link>
        ) : isPrePending ? (
          <span className="pu-status-pill pending">
            <Timer size={12} /> Đã nộp · Chờ sếp duyệt
          </span>
        ) : isPreOpen ? (
          <span className="pu-status-pill open-pre">
            <Zap size={12} /> Mở làm bài test
          </span>
        ) : isPreNotYet ? (
          <span className="pu-status-pill not-yet">
            <AlertCircle size={12} /> Chưa đạt điểm miễn
          </span>
        ) : (
          <span className="pu-status-pill locked">Không áp dụng</span>
        )}
      </td>

      {/* 3. Tiến độ Mô đun */}
      <td className="pu-ledger-td">
        {isPrePassed ? (
          <span className="text-xs text-emerald-700 font-semibold">Miễn học toàn bộ</span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '110px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
              <span>{item.modulesPassed}/{item.moduleCount}</span>
              <b>{item.progressPercent}%</b>
            </div>
            <div style={{ height: '5px', width: '100%', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.max(4, item.progressPercent)}%`,
                  background: item.progressPercent === 100 ? '#10b981' : '#6366f1',
                  borderRadius: '999px',
                }}
              />
            </div>
          </div>
        )}
      </td>

      {/* 4. Thi Cuối khóa (AI Proctored) */}
      <td className="pu-ledger-td">
        {isFinalApproved ? (
          <Link
            to={targetOutcomePath}
            className="pu-status-pill passed hover:opacity-90 transition-opacity inline-flex items-center gap-1 cursor-pointer"
            title="Nhấn để xem chứng chỉ môn học chi tiết"
          >
            <CheckCircle2 size={12} /> Đã đỗ & Cấp chứng nhận
          </Link>
        ) : isFinalPending ? (
          <span className="pu-status-pill pending">
            <Timer size={12} /> Đã nộp · Chờ chấm
          </span>
        ) : isFinalReady ? (
          <span className="pu-status-pill open-final">
            <Zap size={12} /> Mở thi cuối khóa
          </span>
        ) : isFinalLearning ? (
          <span className="pu-status-pill learning">
            <BookOpen size={12} /> Đang học mô đun
          </span>
        ) : (
          <span className="pu-status-pill locked">
            <Lock size={12} /> Cần học xong mô đun
          </span>
        )}
      </td>

      {/* 5. Thẩm định & Quyết định */}
      <td className="pu-ledger-td" style={{ fontSize: '12px', color: '#475569' }}>
        {item.finalDecisionReason || item.preDecisionReason ? (
          <span className="text-slate-700 italic">
            "{item.finalDecisionReason || item.preDecisionReason}"
          </span>
        ) : isPrePassed ? (
          <span className="text-emerald-700 font-semibold">Được công nhận năng lực</span>
        ) : item.retryDueAt ? (
          <span className="text-red-600 font-semibold flex items-center gap-1">
            <Clock size={11} /> Hạn nộp lại: {timeLeft(item.retryDueAt)}
          </span>
        ) : isFinalPending || isPrePending ? (
          <span className="text-amber-700">Đang thẩm định...</span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* 6. Thao tác 1-Click */}
      <td className="pu-ledger-td" style={{ textAlign: 'right' }}>
        <div className="pu-action-cell">
          {/* Nút ưu tiên 1: Làm bài test đầu vào (dành cho Onboarding nhân viên mới) */}
          {isPreOpen ? (
            <Link
              to={PULSE_PATHS.preAssessment(item.courseId)}
              className="pu-table-btn pre-btn"
            >
              <span>Làm bài ngay</span>
              <ArrowRight size={13} />
            </Link>
          ) : isFinalReady ? (
            /* Nút ưu tiên 2: Làm bài thi cuối khóa */
            <Link
              to={PULSE_PATHS.final(item.courseId)}
              className="pu-table-btn final-btn"
            >
              <span>Vào thi ngay</span>
              <ArrowRight size={13} />
            </Link>
          ) : isFinalLearning && item.progressPercent < 100 ? (
            /* Nút học tiếp mô đun */
            <Link to={PULSE_PATHS.path} className="pu-table-btn ghost-btn">
              <span>Học tiếp</span>
              <ArrowRight size={13} />
            </Link>
          ) : isFinalApproved || isPrePassed ? (
            /* Xem chứng nhận chi tiết của khóa này */
            <Link
              to={targetOutcomePath}
              className="pu-table-btn ghost-btn text-emerald-700 hover:text-emerald-800"
              title="Xem chứng chỉ chi tiết của khóa học này"
            >
              <span>Xem kết quả</span>
              <ArrowRight size={13} />
            </Link>
          ) : (
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Chưa mở thi</span>
          )}
        </div>
      </td>
    </tr>
  );
}

const DEFAULT_CRITERIA: PulseCriterion[] = [
  {
    number: '1',
    title: 'Tính ứng dụng thực tế & giải quyết vấn đề',
    description: 'Nội dung bài làm giải quyết được tình huống chuyển đổi số thực tế của doanh nghiệp.',
  },
  {
    number: '2',
    title: 'Chuẩn hóa quy trình & tính liêm chính',
    description: 'Tuân thủ thỏa ước liêm chính, hoàn thành đầy đủ các bước có sự giám sát của hệ thống.',
  },
  {
    number: '3',
    title: 'Minh chứng số & dữ liệu thuyết phục',
    description: 'Có dữ liệu minh chứng xác thực, rõ ràng và có thể kiểm tra chéo với khung năng lực của tổ chức.',
  },
];
