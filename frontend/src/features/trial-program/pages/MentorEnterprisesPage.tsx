import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  GraduationCap,
  LayoutGrid,
  List,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useMentorEnterprises, usePulseFinalReviews } from '@/hooks/use-pulse';
import type { MentorEnterpriseItem, PulseFinalReviewItem } from '@/services/pulse.service';
import { getAvatarColor, initials } from '@/features/platform/components/pulse-format';
import { levelName } from '@/features/pulse-employee/lib/labels';
import { PaginationBar } from '@/features/trial-program/components/PaginationBar';
import { formatShortOrgCode } from '@/features/trial-program/lib/mentor-ai-guidance';
import { formatDateTime } from '@/lib/utils';
import '@/features/trial-program/mentor-workspace.css';

type EnterpriseStatusFilter = 'ALL' | 'PENDING' | 'ATTENTION' | 'DONE';
type EnterpriseStageFilter = 'ALL' | 'OFFICIAL' | 'TRIAL';
type EnterpriseSortKey = 'PRIORITY' | 'PENDING_DESC' | 'LATEST_DESC' | 'NAME_ASC';
type EnterpriseViewMode = 'cards' | 'table';

function toTimestamp(raw?: string | null): number {
  if (!raw) return 0;
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isEnterpriseAttention(item: MentorEnterpriseItem): boolean {
  return item.flaggedCount > 0 || item.retryCount > 0;
}

function isEnterpriseDone(item: MentorEnterpriseItem): boolean {
  return item.pendingCount === 0 && item.flaggedCount === 0 && item.totalSubmissions > 0;
}

function submissionHref(item: PulseFinalReviewItem): string {
  return item.organizationId
    ? `/mentor/enterprises/${item.organizationId}/submissions/${item.submissionId}`
    : `/mentor/course-reviews/${item.submissionId}`;
}

export function MentorEnterprisesPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch, isFetching } = useMentorEnterprises();
  const { data: queueData } = usePulseFinalReviews({ includeReviewed: false });

  const [statusFilter, setStatusFilter] = useState<EnterpriseStatusFilter>('ALL');
  const [stageFilter, setStageFilter] = useState<EnterpriseStageFilter>('ALL');
  const [sortBy, setSortBy] = useState<EnterpriseSortKey>('PRIORITY');
  const [viewMode, setViewMode] = useState<EnterpriseViewMode>('table');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const allItems = useMemo(() => data?.items ?? [], [data]);

  const urgentSubmissions = useMemo(() => {
    const items = (queueData?.items ?? []).filter(
      (i) =>
        i.kind === 'FINAL' &&
        (i.status === 'PENDING' || i.status === 'FLAGGED' || i.status === 'DEADLINE_MISSED'),
    );
    return [...items].sort((a, b) => {
      const rank = (s: PulseFinalReviewItem['status']) => (s === 'PENDING' ? 0 : s === 'FLAGGED' ? 1 : 2);
      const diff = rank(a.status) - rank(b.status);
      if (diff !== 0) return diff;
      const aTs = toTimestamp(a.attempts?.[a.attempts.length - 1]?.submittedAt);
      const bTs = toTimestamp(b.attempts?.[b.attempts.length - 1]?.submittedAt);
      return aTs - bTs;
    });
  }, [queueData]);

  const contextMatched = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allItems.filter((item) => {
      if (stageFilter !== 'ALL' && item.stage !== stageFilter) return false;
      if (!query) return true;
      return (
        item.organizationName.toLowerCase().includes(query) ||
        item.organizationCode.toLowerCase().includes(query) ||
        (item.ownerName?.toLowerCase().includes(query) ?? false) ||
        (item.ownerEmail?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [allItems, stageFilter, search]);

  const tabCounts = useMemo(() => {
    return {
      ALL: contextMatched.length,
      PENDING: contextMatched.filter((i) => i.pendingCount > 0).length,
      ATTENTION: contextMatched.filter(isEnterpriseAttention).length,
      DONE: contextMatched.filter(isEnterpriseDone).length,
    };
  }, [contextMatched]);

  const sortedFiltered = useMemo(() => {
    const filtered = contextMatched.filter((item) => {
      if (statusFilter === 'PENDING') return item.pendingCount > 0;
      if (statusFilter === 'ATTENTION') return isEnterpriseAttention(item);
      if (statusFilter === 'DONE') return isEnterpriseDone(item);
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'NAME_ASC') {
        return a.organizationName.localeCompare(b.organizationName, 'vi');
      }
      if (sortBy === 'LATEST_DESC') {
        return toTimestamp(b.latestSubmittedAt) - toTimestamp(a.latestSubmittedAt);
      }
      if (sortBy === 'PENDING_DESC') {
        if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
        return toTimestamp(b.latestSubmittedAt) - toTimestamp(a.latestSubmittedAt);
      }
      const aHot = a.pendingCount > 0 || a.flaggedCount > 0 ? 1 : 0;
      const bHot = b.pendingCount > 0 || b.flaggedCount > 0 ? 1 : 0;
      if (bHot !== aHot) return bHot - aHot;
      if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
      const aAtt = a.flaggedCount + a.retryCount;
      const bAtt = b.flaggedCount + b.retryCount;
      if (bAtt !== aAtt) return bAtt - aAtt;
      return toTimestamp(b.latestSubmittedAt) - toTimestamp(a.latestSubmittedAt);
    });
  }, [contextMatched, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedFiltered.slice(start, start + pageSize);
  }, [sortedFiltered, currentPage, pageSize]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    statusFilter !== 'ALL' ||
    stageFilter !== 'ALL' ||
    sortBy !== 'PRIORITY';

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setStageFilter('ALL');
    setSortBy('PRIORITY');
    setPage(1);
  };

  const pendingTotal = data?.pendingCount ?? 0;
  const attentionTotal = data?.attentionCount ?? 0;
  const reviewedTotal = data?.reviewedCount ?? 0;
  const enterpriseCount = data?.totalEnterprises ?? allItems.length;

  return (
    <div className="mw-workbench">
      {/* Borderless Operational Header + Right Submission Summary Tabs */}
      <header className="mw-hub-hero" aria-label="Tổng quan chấm bài">
        <div className="mw-hub-hero-copy">
          <div className="mw-badge-pill">
            <GraduationCap size={13} aria-hidden="true" />
            <span>Không gian Mentor</span>
          </div>
          <h1 className="mw-main-title">Tổng quan chấm bài</h1>
          <p className="mw-sub-title">
            {enterpriseCount > 0
              ? pendingTotal > 0 || attentionTotal > 0
                ? `Hiện có ${pendingTotal} bài chờ chấm và ${attentionTotal} bài cần hỗ trợ trên ${enterpriseCount} doanh nghiệp phụ trách.`
                : `Tất cả bài nộp thuộc ${enterpriseCount} doanh nghiệp phụ trách đã được xử lý xong.`
              : 'Theo dõi bài nộp cuối cấp sau mỗi cấp độ theo từng doanh nghiệp được phân công.'}
          </p>
        </div>

        <nav className="mw-hub-stat-tabs" aria-label="Phân loại nhanh bài nộp">
          <button
            type="button"
            className={`mw-hub-stat-tab tone-amber${pendingTotal > 0 ? ' has-items' : ''}`}
            onClick={() => navigate('/mentor/course-reviews', { state: { mentorFilter: { statusFilter: 'PENDING' } } })}
          >
            <div className="mw-hub-stat-head">
              <div className="mw-hub-stat-metric">
                <span className="mw-hub-stat-icon" aria-hidden="true">
                  <Clock size={13} />
                </span>
                <strong className="mw-hub-stat-value">{pendingTotal}</strong>
              </div>
              <ArrowRight size={13} className="mw-hub-stat-arrow" aria-hidden="true" />
            </div>
            <span className="mw-hub-stat-label">Bài chờ chấm</span>
          </button>

          <button
            type="button"
            className={`mw-hub-stat-tab tone-rose${attentionTotal > 0 ? ' has-items' : ''}`}
            onClick={() => navigate('/mentor/course-reviews', { state: { mentorFilter: { statusFilter: 'ATTENTION' } } })}
          >
            <div className="mw-hub-stat-head">
              <div className="mw-hub-stat-metric">
                <span className="mw-hub-stat-icon" aria-hidden="true">
                  <AlertCircle size={13} />
                </span>
                <strong className="mw-hub-stat-value">{attentionTotal}</strong>
              </div>
              <ArrowRight size={13} className="mw-hub-stat-arrow" aria-hidden="true" />
            </div>
            <span className="mw-hub-stat-label">Cần hỗ trợ / nộp lại</span>
          </button>

          <button
            type="button"
            className="mw-hub-stat-tab tone-emerald"
            onClick={() => navigate('/mentor/course-reviews', { state: { mentorFilter: { statusFilter: 'REVIEWED' } } })}
          >
            <div className="mw-hub-stat-head">
              <div className="mw-hub-stat-metric">
                <span className="mw-hub-stat-icon" aria-hidden="true">
                  <CheckCircle2 size={13} />
                </span>
                <strong className="mw-hub-stat-value">{reviewedTotal}</strong>
              </div>
              <ArrowRight size={13} className="mw-hub-stat-arrow" aria-hidden="true" />
            </div>
            <span className="mw-hub-stat-label">Bài đã xử lý</span>
          </button>
        </nav>
      </header>

      {/* Urgent Action Queue Strip */}
      {urgentSubmissions.length > 0 && (
        <section className="mw-urgent-section" aria-label="Việc cần xử lý ngay">
          <div className="mw-section-head-row">
            <div className="mw-section-title-group">
              <h2>Việc cần xử lý ngay</h2>
              <span className="mw-f-badge">{urgentSubmissions.length}</span>
            </div>
            <Link to="/mentor/course-reviews" className="mw-section-link">
              <span>Mở bàn chấm toàn hàng chờ</span>
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>

          <div className="mw-urgent-grid">
            {urgentSubmissions.slice(0, 3).map((item) => {
              const latest = item.attempts?.[item.attempts.length - 1];
              const tone = getAvatarColor(item.employeeName);
              const isFlagged = item.status === 'FLAGGED' || item.status === 'DEADLINE_MISSED';
              return (
                <button
                  key={`${item.kind}-${item.submissionId}`}
                  type="button"
                  className={`mw-urgent-card${isFlagged ? ' flagged' : ''}`}
                  onClick={() => navigate(submissionHref(item))}
                >
                  <div className="mw-urgent-card-top">
                    <div className="mw-urgent-user">
                      <span
                        className="mw-rail-avatar"
                        style={{ background: tone.bg, color: tone.text, border: `1px solid ${tone.border}` }}
                        aria-hidden="true"
                      >
                        {initials(item.employeeName)}
                      </span>
                      <div className="mw-urgent-user-meta">
                        <strong>{item.employeeName}</strong>
                        <span>{item.organizationName || 'Doanh nghiệp được giao'}</span>
                      </div>
                    </div>
                    <span className={`mw-mini-stat-pill ${isFlagged ? 'flagged' : 'retry'}`}>
                      {isFlagged ? 'Cần hỗ trợ' : 'Chờ chấm'}
                    </span>
                  </div>

                  <div className="mw-urgent-course">
                    {item.courseCode} · {item.courseTitle} ({levelName(item.tier)})
                  </div>

                  <div className="mw-urgent-card-foot">
                    <span>
                      {latest?.choice
                        ? `Trắc nghiệm ${latest.choice.score}/${latest.choice.total}`
                        : `Lần nộp ${item.attemptNo}/${item.maxAttempts}`}
                      {item.recording?.risk ? ` · Rủi ro ${item.recording.risk.score}/100` : ''}
                    </span>
                    <span className="mw-urgent-cta">
                      <span>{isFlagged ? 'Hỗ trợ' : 'Chấm ngay'}</span>
                      <ArrowRight size={12} aria-hidden="true" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Enterprise Directory Filter & View Switcher */}
      <div className="mw-filter-panel">
        <div className="mw-primary-toolbar">
          <div className="mw-filter-chips" role="tablist" aria-label="Lọc doanh nghiệp theo tình trạng chấm">
            {(
              [
                { id: 'ALL', label: 'Tất cả', count: tabCounts.ALL },
                { id: 'PENDING', label: 'Cần chấm bài', count: tabCounts.PENDING },
                { id: 'ATTENTION', label: 'Cần hỗ trợ', count: tabCounts.ATTENTION },
                { id: 'DONE', label: 'Đã hoàn tất', count: tabCounts.DONE },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={statusFilter === tab.id}
                className={`mw-f-chip${statusFilter === tab.id ? ' active' : ''}`}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
              >
                <span>{tab.label}</span>
                <span className="mw-f-badge">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="mw-search-wrap-v2">
            <Search size={15} className="mw-search-icon-v2" aria-hidden="true" />
            <input
              type="text"
              className="mw-search-input-v2"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm tên, mã, phụ trách..."
              aria-label="Tìm doanh nghiệp"
            />
            {search.trim() && (
              <button
                type="button"
                className="mw-search-clear-v2"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="mw-filter-divider" />

        <div className="mw-filter-row-bottom">
          <div className="mw-filter-selects">
            <select
              className="mw-select-v3"
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value as EnterpriseStageFilter);
                setPage(1);
              }}
              aria-label="Lọc theo giai đoạn doanh nghiệp"
            >
              <option value="ALL">Tất cả giai đoạn</option>
              <option value="OFFICIAL">Doanh nghiệp chính thức</option>
              <option value="TRIAL">Doanh nghiệp dùng thử</option>
            </select>

            <select
              className="mw-select-v3"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as EnterpriseSortKey);
                setPage(1);
              }}
              aria-label="Sắp xếp doanh nghiệp"
            >
              <option value="PRIORITY">Ưu tiên cần chấm</option>
              <option value="PENDING_DESC">Nhiều bài chờ nhất</option>
              <option value="LATEST_DESC">Nộp gần đây nhất</option>
              <option value="NAME_ASC">Tên A đến Z</option>
            </select>
          </div>

          <div className="mw-results-meta">
            <span>Tổng {sortedFiltered.length} doanh nghiệp</span>
            {hasActiveFilters && (
              <button type="button" className="mw-reset-link-btn" onClick={resetFilters}>
                <RotateCcw size={12} />
                <span>Đặt lại bộ lọc</span>
              </button>
            )}
            <div className="mw-view-toggle" role="group" aria-label="Chế độ hiển thị doanh nghiệp">
              <button
                type="button"
                className="mw-view-btn"
                aria-pressed={viewMode === 'table'}
                onClick={() => setViewMode('table')}
              >
                <List size={13} aria-hidden="true" />
                <span>Bảng</span>
              </button>
              <button
                type="button"
                className="mw-view-btn"
                aria-pressed={viewMode === 'cards'}
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid size={13} aria-hidden="true" />
                <span>Thẻ</span>
              </button>
            </div>
            <button
              type="button"
              className="mw-header-outline-btn mw-compact-refresh-btn"
              onClick={() => void refetch()}
              disabled={isFetching}
              aria-label="Làm mới danh sách doanh nghiệp"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
              <span>{isFetching ? 'Đang tải' : 'Làm mới'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enterprise Directory Body */}
      <div className="mw-ent-grid-wrap">
        {isLoading ? (
          <div className="mw-ledger-wrap">
            <div className="mw-empty-state">
              <div className="spinner" />
              <p>Đang tải danh sách doanh nghiệp được giao...</p>
            </div>
          </div>
        ) : error ? (
          <div className="mw-ledger-wrap">
            <div className="mw-empty-state">
              <div className="mw-empty-icon" style={{ background: '#fff1f2', color: '#e11d48' }}>
                <AlertCircle size={22} />
              </div>
              <h3>Không tải được danh sách doanh nghiệp</h3>
              <p>Kiểm tra kết nối máy chủ rồi bấm Thử tải lại.</p>
              <button type="button" className="mw-header-outline-btn" onClick={() => void refetch()}>
                Thử tải lại
              </button>
            </div>
          </div>
        ) : allItems.length === 0 ? (
          <div className="mw-ledger-wrap">
            <div className="mw-empty-state">
              <div className="mw-empty-icon">
                <Building2 size={22} />
              </div>
              <h3>Chưa có doanh nghiệp được phân công</h3>
              <p>Liên hệ quản trị viên để gán doanh nghiệp phụ trách hoặc bấm Làm mới.</p>
            </div>
          </div>
        ) : sortedFiltered.length === 0 ? (
          <div className="mw-ledger-wrap">
            <div className="mw-empty-state">
              <div className="mw-empty-icon">
                <Search size={20} />
              </div>
              <h3>Không có doanh nghiệp khớp bộ lọc</h3>
              <p>Xóa từ khóa hoặc bấm Đặt lại bộ lọc để xem toàn bộ danh sách.</p>
              <button type="button" className="mw-header-outline-btn" onClick={resetFilters}>
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <>
            <div className="mw-ent-grid" role="list" aria-label="Danh sách doanh nghiệp dạng thẻ">
              {pagedItems.map((ent) => {
                const hasPending = ent.pendingCount > 0;
                const hasFlagged = ent.flaggedCount > 0;
                const isPriority = hasPending || hasFlagged;
                const donePct =
                  ent.totalSubmissions > 0
                    ? Math.round((ent.reviewedCount / ent.totalSubmissions) * 100)
                    : 0;
                const targetPath = `/mentor/enterprises/${ent.organizationId}`;
                const shortCode = formatShortOrgCode(ent.organizationCode);

                return (
                  <article
                    key={ent.organizationId}
                    role="listitem"
                    className={`mw-ent-card${hasFlagged ? ' is-flagged' : isPriority ? ' is-priority' : ''}`}
                    onClick={() => navigate(targetPath)}
                  >
                    <div className="mw-ent-card-head">
                      <div className="mw-ent-identity" style={{ minWidth: 0 }}>
                        <div className="mw-ent-badge-icon" aria-hidden="true">
                          <Building2 size={18} />
                        </div>
                        <div className="mw-ent-meta">
                          <h3 className="mw-ent-card-title">{ent.organizationName}</h3>
                          <div className="mw-ent-card-sub">
                            <span className={`mw-stage-pill ${ent.stage === 'TRIAL' ? 'trial' : 'official'}`}>
                              {ent.stage === 'TRIAL' ? 'Dùng thử' : 'Chính thức'}
                            </span>
                            <span className="mw-ent-code" title={ent.organizationCode}>
                              {shortCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mw-ent-card-owner">
                      <strong>{ent.ownerName || 'Chưa cập nhật người phụ trách'}</strong>
                      {ent.ownerEmail && <span>{ent.ownerEmail}</span>}
                      <span className="mw-ent-scale">
                        <Users size={12} style={{ color: '#64748b' }} aria-hidden="true" />
                        <span>
                          {ent.departmentCount} phòng ban · {ent.employeeCount} nhân viên
                        </span>
                      </span>
                    </div>

                    <div className="mw-ent-card-metrics">
                      <div className="mw-ent-card-metric-row">
                        <span className={`mw-ent-pending-pill ${hasPending ? 'has-work' : 'clear'}`}>
                          <Clock size={12} aria-hidden="true" />
                          <span>{ent.pendingCount} chờ chấm</span>
                        </span>

                        <div className="mw-ent-attention-stack">
                          {ent.retryCount > 0 && (
                            <span className="mw-mini-stat-pill retry">{ent.retryCount} chờ nộp lại</span>
                          )}
                          {ent.flaggedCount > 0 && (
                            <span className="mw-mini-stat-pill flagged">{ent.flaggedCount} cần hỗ trợ</span>
                          )}
                          {ent.retryCount === 0 && ent.flaggedCount === 0 && !hasPending && (
                            <span className="mw-mini-stat-pill muted">
                              {ent.totalSubmissions > 0 ? 'Đã xử lý xong' : 'Chưa có bài nộp'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mw-ent-card-prog-row">
                        <div className="mw-ent-card-prog-track" aria-hidden="true">
                          <div className="mw-ent-card-prog-fill" style={{ width: `${donePct}%` }} />
                        </div>
                        <span>
                          {ent.reviewedCount}/{ent.totalSubmissions} đã xử lý
                        </span>
                      </div>
                    </div>

                    <div className="mw-ent-card-foot">
                      <span className="mw-time-cell">
                        {ent.latestSubmittedAt ? formatDateTime(ent.latestSubmittedAt) : 'Chưa có bài nộp'}
                      </span>
                      <button
                        type="button"
                        className={`mw-row-btn ${isPriority ? 'primary' : 'ghost'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(targetPath);
                        }}
                      >
                        <span>{isPriority ? 'Mở bàn chấm' : 'Xem bài nộp'}</span>
                        <ArrowRight size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mw-ledger-wrap">
              <PaginationBar
                page={currentPage}
                pageSize={pageSize}
                totalItems={sortedFiltered.length}
                unitLabel="doanh nghiệp"
                onPageChange={setPage}
                onPageSizeChange={(nextSize) => {
                  setPageSize(nextSize);
                  setPage(1);
                }}
              />
            </div>
          </>
        ) : (
          <div className="mw-ledger-wrap">
            <table className="mw-ledger-table">
              <thead className="mw-ledger-thead">
                <tr>
                  <th className="mw-ledger-th">Doanh nghiệp</th>
                  <th className="mw-ledger-th">Phụ trách & quy mô</th>
                  <th className="mw-ledger-th">Bài chờ chấm</th>
                  <th className="mw-ledger-th">Nộp lại & hỗ trợ</th>
                  <th className="mw-ledger-th col-fit">Nộp gần nhất</th>
                  <th className="mw-ledger-th col-action">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.map((ent) => {
                  const hasPending = ent.pendingCount > 0;
                  const hasFlagged = ent.flaggedCount > 0;
                  const isPriority = hasPending || hasFlagged;
                  const donePct =
                    ent.totalSubmissions > 0
                      ? Math.round((ent.reviewedCount / ent.totalSubmissions) * 100)
                      : 0;
                  const targetPath = `/mentor/enterprises/${ent.organizationId}`;

                  return (
                    <tr
                      key={ent.organizationId}
                      className={`mw-ledger-row${isPriority ? ' is-pending-row' : ''}`}
                      onClick={() => navigate(targetPath)}
                    >
                      <td className="mw-ledger-td">
                        <div className="mw-ent-identity">
                          <div className="mw-ent-badge-icon" aria-hidden="true">
                            <Building2 size={18} />
                          </div>
                          <div className="mw-ent-meta">
                            <div className="mw-ent-title-row">
                              <span className="mw-ent-name">{ent.organizationName}</span>
                              <span className={`mw-stage-pill ${ent.stage === 'TRIAL' ? 'trial' : 'official'}`}>
                                {ent.stage === 'TRIAL' ? 'Dùng thử' : 'Chính thức'}
                              </span>
                            </div>
                            <div className="mw-ent-sub-row">
                              <span className="mw-ent-code" title={ent.organizationCode}>
                                {formatShortOrgCode(ent.organizationCode)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="mw-ledger-td">
                        <div className="mw-ent-owner-cell">
                          <span className="mw-ent-owner-name">
                            {ent.ownerName || 'Chưa cập nhật người phụ trách'}
                          </span>
                          {ent.ownerEmail && <span className="mw-ent-owner-email">{ent.ownerEmail}</span>}
                          <span className="mw-ent-scale">
                            <Users size={12} style={{ color: '#64748b' }} aria-hidden="true" />
                            <span>
                              {ent.departmentCount} phòng ban · {ent.employeeCount} nhân viên
                            </span>
                          </span>
                        </div>
                      </td>

                      <td className="mw-ledger-td">
                        <div className="mw-ent-pending-cell">
                          <span className={`mw-ent-pending-pill ${hasPending ? 'has-work' : 'clear'}`}>
                            <Clock size={12} aria-hidden="true" />
                            <span>{ent.pendingCount} chờ chấm</span>
                          </span>
                          <div className="mw-ent-prog-wrap">
                            <div className="mw-ent-prog-track" aria-hidden="true">
                              <div className="mw-ent-prog-fill" style={{ width: `${donePct}%` }} />
                            </div>
                            <span>
                              {ent.reviewedCount}/{ent.totalSubmissions} đã xử lý
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="mw-ledger-td">
                        <div className="mw-ent-attention-stack">
                          {ent.retryCount > 0 && (
                            <span className="mw-mini-stat-pill retry">{ent.retryCount} chờ nộp lại</span>
                          )}
                          {ent.flaggedCount > 0 && (
                            <span className="mw-mini-stat-pill flagged">{ent.flaggedCount} cần hỗ trợ</span>
                          )}
                          {ent.retryCount === 0 && ent.flaggedCount === 0 && (
                            <span className="mw-mini-stat-pill muted">Không có</span>
                          )}
                        </div>
                      </td>

                      <td className="mw-ledger-td col-fit">
                        <span className="mw-time-cell">
                          {ent.latestSubmittedAt ? formatDateTime(ent.latestSubmittedAt) : 'Chưa có bài nộp'}
                        </span>
                      </td>

                      <td className="mw-ledger-td col-action">
                        <button
                          type="button"
                          className={`mw-row-btn ${isPriority ? 'primary' : 'ghost'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(targetPath);
                          }}
                        >
                          <span>{isPriority ? 'Mở bàn chấm' : 'Xem bài nộp'}</span>
                          <ArrowRight size={13} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <PaginationBar
              page={currentPage}
              pageSize={pageSize}
              totalItems={sortedFiltered.length}
              unitLabel="doanh nghiệp"
              onPageChange={setPage}
              onPageSizeChange={(nextSize) => {
                setPageSize(nextSize);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
