import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  Clock,
  CheckCircle2,
  Users,
  Search,
  ArrowRight,
  Calendar,
  FileCheck2,
  ArrowUpDown,
  RefreshCw,
  X,
} from 'lucide-react';
import { useMentorTrials } from '@/hooks/use-trial-program';
import { LoadError, Loading } from '@/features/platform/components/pulse-ui';
import { StageBadge } from '../components/TrialUi';
import { formatWhen } from '../lib/trial-format';
import '../trial-program.css';
import '../mentor-workspace.css';

type StageFilter = 'ALL' | 'ASSIGNED' | 'REPORTED';

/**
 * MT-01 · Hàng chờ chấm bài dùng thử dành cho Mentor.
 * Chuẩn UI doanh nghiệp cao cấp: KPI Metrics, Tìm kiếm, Lọc trạng thái, Thanh tiến độ trực quan,
 * hoàn toàn không sử dụng emoji, hiệu ứng hover mượt mà và bảng màu Indigo chủ đạo.
 */
type SortOption = 'DEADLINE_ASC' | 'PENDING_DESC' | 'NAME_ASC' | 'SUBMITTED_DESC';

export function MentorTrialsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch, isFetching } = useMentorTrials();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('DEADLINE_ASC');

  // KPI Calculations
  const metrics = useMemo(() => {
    if (!data) return { totalOrgs: 0, pendingReviews: 0, completedOrgs: 0, totalParticipants: 0 };
    const totalOrgs = data.length;
    const pendingReviews = data.reduce((sum, item) => sum + Math.max(0, item.submitted - item.reviewed), 0);
    const completedOrgs = data.filter((item) => item.stage === 'REPORTED').length;
    const totalParticipants = data.reduce((sum, item) => sum + item.participants, 0);
    return { totalOrgs, pendingReviews, completedOrgs, totalParticipants };
  }, [data]);

  // Filtered List
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((trial) => {
      const matchSearch =
        trial.organizationName.toLowerCase().includes(search.toLowerCase().trim()) ||
        (trial.requestNote && trial.requestNote.toLowerCase().includes(search.toLowerCase().trim()));
      const matchStage =
        stageFilter === 'ALL'
          ? true
          : stageFilter === 'ASSIGNED'
            ? trial.stage === 'ASSIGNED' || trial.stage === 'REQUESTED'
            : trial.stage === 'REPORTED';
      return matchSearch && matchStage;
    });
  }, [data, search, stageFilter]);

  // Sort Filtered Data
  const sortedData = useMemo(() => {
    const list = [...filteredData];
    list.sort((a, b) => {
      if (sortBy === 'DEADLINE_ASC') {
        const da = a.testDeadline ? new Date(a.testDeadline).getTime() : Infinity;
        const db = b.testDeadline ? new Date(b.testDeadline).getTime() : Infinity;
        return da - db;
      }
      if (sortBy === 'PENDING_DESC') {
        const pa = Math.max(0, a.submitted - a.reviewed);
        const pb = Math.max(0, b.submitted - b.reviewed);
        return pb - pa;
      }
      if (sortBy === 'NAME_ASC') {
        return a.organizationName.localeCompare(b.organizationName);
      }
      if (sortBy === 'SUBMITTED_DESC') {
        const ra = a.participants > 0 ? a.submitted / a.participants : 0;
        const rb = b.participants > 0 ? b.submitted / b.participants : 0;
        return rb - ra;
      }
      return 0;
    });
    return list;
  }, [filteredData, sortBy]);

  return (
    <div className="pulse-ui">
      {/* Page Header */}
      <div className="mw-header">
        <div className="mw-breadcrumbs">
          <span>Không gian làm việc</span>
          <span>/</span>
          <span className="current">Đánh giá doanh nghiệp</span>
        </div>
        <div className="mw-header-main">
          <div className="mw-title-block">
            <div className="mw-title-icon">
              <GraduationCap className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h1>Đánh giá doanh nghiệp</h1>
              <p>Danh sách doanh nghiệp được phân công đánh giá năng lực số.</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading && <Loading />}
      {error && <LoadError error={error} />}

      {data && (
        <>
          {/* KPI Summary Strip */}
          <div className="mw-kpi-grid">
            <div className="mw-kpi-card">
              <div className="mw-kpi-icon indigo">
                <Building2 className="size-5" aria-hidden="true" />
              </div>
              <div className="mw-kpi-info">
                <span className="mw-kpi-label">Doanh nghiệp</span>
                <span className="mw-kpi-value">{metrics.totalOrgs}</span>
                <span className="mw-kpi-sub">Đang phụ trách</span>
              </div>
            </div>

            <div className="mw-kpi-card">
              <div className="mw-kpi-icon amber">
                <Clock className="size-5" aria-hidden="true" />
              </div>
              <div className="mw-kpi-info">
                <span className="mw-kpi-label">Cần chấm</span>
                <span className="mw-kpi-value">{metrics.pendingReviews}</span>
                <span className="mw-kpi-sub">Đã nộp bài</span>
              </div>
            </div>

            <div className="mw-kpi-card">
              <div className="mw-kpi-icon emerald">
                <CheckCircle2 className="size-5" aria-hidden="true" />
              </div>
              <div className="mw-kpi-info">
                <span className="mw-kpi-label">Đã công bố</span>
                <span className="mw-kpi-value">{metrics.completedOrgs}</span>
                <span className="mw-kpi-sub">Hoàn tất đánh giá</span>
              </div>
            </div>

            <div className="mw-kpi-card">
              <div className="mw-kpi-icon violet">
                <Users className="size-5" aria-hidden="true" />
              </div>
              <div className="mw-kpi-info">
                <span className="mw-kpi-label">Nhân sự</span>
                <span className="mw-kpi-value">{metrics.totalParticipants}</span>
                <span className="mw-kpi-sub">Tham gia khảo sát</span>
              </div>
            </div>
          </div>

          {/* Toolbar: Segmented Filters, Sort Dropdown, SLA Tag, Search & Refresh */}
          <div className="mw-toolbar">
            <div className="mw-toolbar-left">
              {/* Segmented Filter Pills */}
              <div className="mw-filter-pills" role="tablist" aria-label="Lọc theo trạng thái">
                <button
                  type="button"
                  role="tab"
                  aria-selected={stageFilter === 'ALL'}
                  className={`mw-filter-btn ${stageFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setStageFilter('ALL')}
                >
                  <span>Tất cả</span>
                  <span className="mw-filter-count">{data.length}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={stageFilter === 'ASSIGNED'}
                  className={`mw-filter-btn ${stageFilter === 'ASSIGNED' ? 'active' : ''}`}
                  onClick={() => setStageFilter('ASSIGNED')}
                >
                  <span>Cần chấm</span>
                  <span className="mw-filter-count">
                    {data.filter((t) => t.stage === 'ASSIGNED' || t.stage === 'REQUESTED').length}
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={stageFilter === 'REPORTED'}
                  className={`mw-filter-btn ${stageFilter === 'REPORTED' ? 'active' : ''}`}
                  onClick={() => setStageFilter('REPORTED')}
                >
                  <span>Đã công bố</span>
                  <span className="mw-filter-count">
                    {data.filter((t) => t.stage === 'REPORTED').length}
                  </span>
                </button>
              </div>

              {/* SLA / Pending alert badge */}
              {metrics.pendingReviews > 0 && (
                <div className="mw-toolbar-sla-chip" title="Số bài thí sinh đã nộp đang chờ bạn chấm">
                  <span className="mw-sla-dot" aria-hidden="true" />
                  <span>{metrics.pendingReviews} bài chờ chấm</span>
                </div>
              )}
            </div>

            <div className="mw-toolbar-right">
              {/* Sort Control */}
              <div className="mw-sort-box">
                <ArrowUpDown size={13} className="mw-sort-icon" aria-hidden="true" />
                <select
                  className="mw-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Sắp xếp danh sách doanh nghiệp"
                >
                  <option value="DEADLINE_ASC">Hạn nộp gần nhất</option>
                  <option value="PENDING_DESC">Cần chấm nhiều nhất</option>
                  <option value="NAME_ASC">Tên doanh nghiệp: A - Z</option>
                  <option value="SUBMITTED_DESC">Tiến độ nộp cao nhất</option>
                </select>
              </div>

              {/* Search Box with Clear Button */}
              <div className="mw-search-box">
                <Search size={14} className="mw-search-icon" aria-hidden="true" />
                <input
                  type="search"
                  className="mw-search-input"
                  placeholder="Tìm doanh nghiệp..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Tìm kiếm doanh nghiệp"
                />
                {search && (
                  <button
                    type="button"
                    className="mw-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Xóa tìm kiếm"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                className="mw-refresh-btn"
                onClick={() => refetch()}
                title="Tải lại danh sách"
                aria-label="Tải lại danh sách"
              >
                <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Data Table */}
          {sortedData.length === 0 ? (
            <div className="mw-workspace-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--mw-slate-100)',
                  color: 'var(--mw-slate-400)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <FileCheck2 size={28} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 600, color: 'var(--mw-slate-800)' }}>
                Không tìm thấy doanh nghiệp nào
              </h3>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--mw-slate-500)' }}>
                {search ? 'Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc.' : 'Hiện tại chưa có doanh nghiệp nào được phân công.'}
              </p>
            </div>
          ) : (
            <div className="mw-table-card">
              <div style={{ overflowX: 'auto' }}>
                <table className="mw-table">
                  <thead>
                    <tr>
                      <th style={{ width: '32%' }}>Doanh nghiệp</th>
                      <th style={{ width: '16%' }}>Nộp bài</th>
                      <th style={{ width: '14%' }}>Tiến độ chấm</th>
                      <th style={{ width: '15%' }}>Hạn nộp</th>
                      <th style={{ width: '13%' }}>Trạng thái</th>
                      <th style={{ width: '10%' }} className="right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((t) => {
                      const submitPercent = t.participants > 0 ? Math.round((t.submitted / t.participants) * 100) : 0;
                      const reviewPercent = t.submitted > 0 ? Math.round((t.reviewed / t.submitted) * 100) : 0;
                      const isComplete = t.stage === 'REPORTED';

                      return (
                        <tr
                          key={t.organizationId}
                          onClick={() => navigate(`/platform/reviews/${t.organizationId}`)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(`/platform/reviews/${t.organizationId}`);
                            }
                          }}
                        >
                          <td>
                            <strong className="mw-org-title">{t.organizationName}</strong>
                            {t.requestNote ? (
                              <span className="mw-org-note" title={t.requestNote}>
                                “{t.requestNote}”
                              </span>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--mw-slate-400)' }}>Chưa có ghi chú đặc biệt</span>
                            )}
                          </td>

                          <td>
                            <div className="mw-progress-cell">
                              <div className="mw-progress-meta">
                                <span>Đã nộp</span>
                                <strong>
                                  {t.submitted}/{t.participants}
                                </strong>
                              </div>
                              <div className="mw-progress-bar">
                                <div
                                  className={`mw-progress-fill ${submitPercent === 100 ? 'success' : ''}`}
                                  style={{ width: `${submitPercent}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="mw-progress-cell">
                              <div className="mw-progress-meta">
                                <span>Đã chấm</span>
                                <strong style={{ color: t.reviewed === t.submitted && t.submitted > 0 ? 'var(--mw-success)' : undefined }}>
                                  {t.reviewed}/{t.submitted}
                                </strong>
                              </div>
                              <div className="mw-progress-bar">
                                <div
                                  className={`mw-progress-fill ${reviewPercent === 100 ? 'success' : ''}`}
                                  style={{ width: `${reviewPercent}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="mw-deadline-cell">
                              <div className="mw-deadline-row primary" title="Hạn chót làm bài của nhân viên doanh nghiệp">
                                <Calendar size={13} className="mw-deadline-icon" aria-hidden="true" />
                                <span>Hạn nộp: {formatWhen(t.testDeadline)}</span>
                              </div>
                              {t.preferredReviewAt && (
                                <div className="mw-deadline-row target" title="Mốc thời gian doanh nghiệp mong muốn nhận báo cáo đánh giá hoàn chỉnh">
                                  <Clock size={12} className="mw-deadline-icon" aria-hidden="true" />
                                  <span>Hạn trả KQ: {formatWhen(t.preferredReviewAt)}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td>
                            <span className="tp-vars">
                              <StageBadge stage={t.stage} />
                            </span>
                          </td>

                          <td className="right">
                            <button
                              type="button"
                              className={`mw-action-btn ${isComplete ? 'view' : 'grade'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/platform/reviews/${t.organizationId}`);
                              }}
                            >
                              <span>{isComplete ? 'Xem lại' : 'Chấm bài'}</span>
                              <ArrowRight size={13} className="mw-action-arrow" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
