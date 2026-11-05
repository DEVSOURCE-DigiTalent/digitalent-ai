import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  Building2,
  GraduationCap,
  RefreshCw,
  Monitor,
  Video,
  Mic,
} from 'lucide-react';
import { usePulseFinalReviews } from '@/hooks/use-pulse';
import { formatDateTime } from '@/lib/utils';
import '@/features/trial-program/mentor-workspace.css';

type FilterStatus = 'ALL' | 'PENDING' | 'RETRY' | 'FLAGGED';

export function MentorCourseReviewsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch, isFetching } = usePulseFinalReviews();

  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');

  // Filter items (final capstone reviews)
  const allItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((item) => item.kind === 'FINAL');
  }, [data]);

  // Extract unique organizations for filter dropdown
  const organizations = useMemo(() => {
    const orgs = new Set<string>();
    allItems.forEach((i) => {
      if (i.organizationName) orgs.add(i.organizationName);
    });
    return Array.from(orgs);
  }, [allItems]);

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Status filter
      if (statusFilter === 'PENDING' && item.status !== 'PENDING') return false;
      if (statusFilter === 'RETRY' && item.status !== 'RETRY_WAIT' && item.status !== 'RETRY_READY') return false;
      if (statusFilter === 'FLAGGED' && item.status !== 'FLAGGED' && item.status !== 'DEADLINE_MISSED') return false;

      // Organization filter
      if (selectedOrg !== 'ALL' && item.organizationName !== selectedOrg) return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = item.employeeName.toLowerCase().includes(q);
        const matchPos = item.positionName?.toLowerCase().includes(q) ?? false;
        const matchCourse = item.courseTitle.toLowerCase().includes(q) || item.courseCode.toLowerCase().includes(q);
        const matchOrg = item.organizationName?.toLowerCase().includes(q) ?? false;
        return matchName || matchPos || matchCourse || matchOrg;
      }
      return true;
    });
  }, [allItems, statusFilter, selectedOrg, search]);

  // Metrics
  const metrics = useMemo(() => {
    const pending = allItems.filter((i) => i.status === 'PENDING').length;
    const retry = allItems.filter((i) => i.status === 'RETRY_WAIT' || i.status === 'RETRY_READY').length;
    const flagged = allItems.filter((i) => i.status === 'FLAGGED' || i.status === 'DEADLINE_MISSED').length;
    return {
      total: allItems.length,
      pending,
      retry,
      flagged,
      orgCount: organizations.length,
    };
  }, [allItems, organizations]);

  return (
    <div className="pulse-ui" style={{ padding: '24px 32px 64px', maxWidth: 1560, margin: '0 auto' }}>
      {/* 1. Header & Breadcrumbs */}
      <div className="mw-header">
        <div className="mw-breadcrumbs">
          <span>Không gian làm việc</span>
          <span>/</span>
          <span className="current">Thẩm định năng lực đầu ra</span>
        </div>

        <div className="mw-header-main">
          <div className="mw-title-block">
            <div className="mw-title-icon">
              <GraduationCap className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h1>Hàng chờ thẩm định năng lực đầu ra</h1>
              <p>
                Danh sách bài đánh giá cuối khóa của nhân viên sau khi hoàn thành toàn bộ lộ trình đào tạo số.
              </p>
            </div>
          </div>

          <div className="mw-header-actions">
            <button
              type="button"
              className="mw-refresh-btn"
              onClick={() => void refetch()}
              disabled={isFetching}
              title="Làm mới dữ liệu hàng chờ"
            >
              <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Strip with clean icon + info layout */}
      <div className="mw-kpi-grid">
        <div className="mw-kpi-card">
          <div className="mw-kpi-icon amber">
            <Clock size={20} />
          </div>
          <div className="mw-kpi-info">
            <span className="mw-kpi-label">Chờ thẩm định</span>
            <div className="mw-kpi-value">{metrics.pending}</div>
            <span className="mw-kpi-sub">Bài nộp cần ra quyết định</span>
          </div>
        </div>

        <div className="mw-kpi-card">
          <div className="mw-kpi-icon emerald">
            <CheckCircle2 size={20} />
          </div>
          <div className="mw-kpi-info">
            <span className="mw-kpi-label">Tổng bài nộp</span>
            <div className="mw-kpi-value">{metrics.total}</div>
            <span className="mw-kpi-sub">Hồ sơ đã gửi thẩm định</span>
          </div>
        </div>

        <div className="mw-kpi-card">
          <div className="mw-kpi-icon violet">
            <RefreshCw size={20} />
          </div>
          <div className="mw-kpi-info">
            <span className="mw-kpi-label">Cần nộp lại</span>
            <div className="mw-kpi-value">{metrics.retry}</div>
            <span className="mw-kpi-sub">Yêu cầu bổ sung minh chứng</span>
          </div>
        </div>

        <div className="mw-kpi-card">
          <div className="mw-kpi-icon indigo">
            <Building2 size={20} />
          </div>
          <div className="mw-kpi-info">
            <span className="mw-kpi-label">Doanh nghiệp</span>
            <div className="mw-kpi-value">{metrics.orgCount}</div>
            <span className="mw-kpi-sub">Đơn vị có nhân sự thẩm định</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filters Toolbar */}
      <div className="mw-toolbar">
        <div className="mw-toolbar-left">
          <div className="mw-search-box">
            <Search size={15} className="mw-search-icon" />
            <input
              type="text"
              className="mw-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên nhân viên, vị trí, doanh nghiệp..."
            />
          </div>

          {organizations.length > 0 && (
            <select
              className="mw-sort-select"
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
            >
              <option value="ALL">Tất cả doanh nghiệp ({organizations.length})</option>
              {organizations.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mw-toolbar-right">
          <div className="mw-filter-pills">
            {[
              { id: 'ALL', label: 'Tất cả', count: allItems.length },
              { id: 'PENDING', label: 'Chờ thẩm định', count: metrics.pending },
              { id: 'RETRY', label: 'Cần nộp lại', count: metrics.retry },
              { id: 'FLAGGED', label: 'Cần lưu ý', count: metrics.flagged },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`mw-filter-btn ${statusFilter === tab.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab.id as FilterStatus)}
              >
                <span>{tab.label}</span>
                <span className="mw-filter-count">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Enterprise Table Queue */}
      <div className="mw-table-card">
        {isLoading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            Đang tải dữ liệu hàng chờ thẩm định...
          </div>
        ) : error ? (
          <div style={{ padding: '32px 24px', textAlign: 'center', color: '#e11d48' }}>
            Không thể tải dữ liệu bài làm. Vui lòng thử lại sau.
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
            <GraduationCap size={36} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
            <h3 style={{ margin: '0 0 6px', fontSize: 16, color: '#1e293b' }}>
              Không có bài làm nào trong danh sách
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Hiện không có học viên nào phù hợp với bộ lọc tìm kiếm hiện tại.
            </p>
          </div>
        ) : (
          <table className="mw-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Doanh nghiệp & Đơn vị</th>
                <th>Bài thẩm định cuối khóa</th>
                <th>Giám sát phòng thi</th>
                <th>Nộp lúc</th>
                <th>Trạng thái</th>
                <th className="right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const latestAttempt = item.attempts?.[item.attempts.length - 1];
                const isPending = item.status === 'PENDING';
                const isRetry = item.status === 'RETRY_WAIT' || item.status === 'RETRY_READY';

                return (
                  <tr
                    key={item.submissionId}
                    onClick={() => navigate(`/platform/course-reviews/${item.submissionId}`)}
                  >
                    {/* 1. Nhân viên */}
                    <td>
                      <span className="mw-org-title">
                        {item.employeeName}
                      </span>
                      <span className="mw-org-note">
                        {item.positionName || 'Nhân sự'}
                      </span>
                    </td>

                    {/* 2. Doanh nghiệp & Đơn vị */}
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building2 size={14} style={{ color: '#4f46e5', flexShrink: 0 }} />
                        {item.organizationName || '—'}
                      </div>
                      {item.departmentName && (
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {item.departmentName}
                        </div>
                      )}
                    </td>

                    {/* 3. Bài thẩm định cuối khóa tổng hợp */}
                    <td>
                      <div style={{ fontWeight: 650, color: '#0f172a', fontSize: 13.5 }}>
                        Thẩm định năng lực đầu ra tổng hợp
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: '#eef2ff',
                            color: '#3730a3',
                          }}
                        >
                          Lần nộp {item.attemptNo}/{item.maxAttempts}
                        </span>
                        <span style={{ fontSize: 11, color: '#64748b' }}>
                          Khung 6 miền TT02 ({item.courseCode})
                        </span>
                      </div>
                    </td>

                    {/* 4. Giám sát phòng thi */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          title="Có ghi hình màn hình"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            background: '#ecfdf5',
                            color: '#059669',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Monitor size={13} />
                        </span>
                        <span
                          title="Có ghi hình camera"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            background: '#ecfdf5',
                            color: '#059669',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Video size={13} />
                        </span>
                        <span
                          title="Có ghi âm micro"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            background: '#ecfdf5',
                            color: '#059669',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Mic size={13} />
                        </span>
                        <span style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginLeft: 2 }}>
                          Đầy đủ
                        </span>
                      </div>
                    </td>

                    {/* 5. Nộp lúc */}
                    <td style={{ fontSize: 12.5, color: '#475569' }}>
                      {latestAttempt?.submittedAt ? formatDateTime(latestAttempt.submittedAt) : '—'}
                    </td>

                    {/* 6. Trạng thái */}
                    <td>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: 9999,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          background: isPending ? '#fffbeb' : isRetry ? '#f1f5f9' : '#fff1f2',
                          color: isPending ? '#b45309' : isRetry ? '#475569' : '#9f1239',
                          border: `1px solid ${isPending ? '#fde68a' : isRetry ? '#cbd5e1' : '#fecdd3'}`,
                        }}
                      >
                        {isPending ? (
                          <>
                            <Clock size={13} /> Chờ thẩm định
                          </>
                        ) : isRetry ? (
                          <>
                            <RefreshCw size={13} /> Cần nộp lại
                          </>
                        ) : (
                          <>
                            <AlertCircle size={13} /> Cần lưu ý
                          </>
                        )}
                      </span>
                    </td>

                    {/* 7. Thao tác */}
                    <td className="right">
                      <button
                        type="button"
                        className={`mw-action-btn ${isPending ? 'grade' : 'view'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/platform/course-reviews/${item.submissionId}`);
                        }}
                      >
                        {isPending ? 'Vào thẩm định' : 'Xem chi tiết'}
                        <ArrowRight size={13} className="mw-action-arrow" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
