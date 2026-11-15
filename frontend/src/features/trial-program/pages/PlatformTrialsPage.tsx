import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useAssignMentor,
  useCreateMentor,
  useMentors,
  usePlatformTrials,
} from '@/hooks/use-trial-program';
import type { MentorItem, PlatformTrialItem, TrialStage } from '@/services/trial-program.service';
import { LoadError } from '@/features/platform/components/pulse-ui';
import { errorMessage, initials } from '@/features/platform/components/pulse-format';
import { PlatformDrawer } from '@/features/platform/components/PlatformDrawer';
import { PlatformTrialsSkeleton } from './PlatformTrialsSkeleton';
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  FlaskConical,
  Mail,
  RefreshCw,
  Search,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

type TabKey = TrialStage | 'ALL';

const TABS: readonly { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'REQUESTED', label: 'Chờ phân công' },
  { key: 'ASSIGNED', label: 'Đang chấm thi' },
  { key: 'REPORTED', label: 'Đã có kết quả' },
  { key: 'SETUP', label: 'Chưa gửi yêu cầu' },
];

const ADMIN_STAGE: Record<TrialStage, { label: string; tone: 'neutral' | 'warn' | 'info' | 'ok' }> = {
  REQUESTED: { label: 'Chờ phân công', tone: 'warn' },
  ASSIGNED: { label: 'Đang chấm thi', tone: 'info' },
  REPORTED: { label: 'Đã có kết quả', tone: 'ok' },
  SETUP: { label: 'Chưa gửi yêu cầu', tone: 'neutral' },
};

function formatDateTimePlain(value?: string | null, fallback = 'Chưa đặt'): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getSlaStatus(trial: PlatformTrialItem) {
  if (trial.stage === 'REPORTED') {
    return { label: 'Đã hoàn tất', tone: 'ok' as const };
  }
  if (trial.stage === 'SETUP') {
    return { label: 'Đang thiết lập', tone: 'neutral' as const };
  }
  const now = Date.now();
  if (trial.testDeadline) {
    const deadline = new Date(trial.testDeadline).getTime();
    if (!Number.isNaN(deadline) && deadline < now) {
      return { label: 'Quá hạn nộp bài', tone: 'bad' as const };
    }
  }
  if (trial.preferredReviewAt) {
    const pref = new Date(trial.preferredReviewAt).getTime();
    if (!Number.isNaN(pref)) {
      if (pref < now) {
        return { label: 'Quá hạn mong muốn', tone: 'bad' as const };
      }
      if (pref - now <= 48 * 3600 * 1000) {
        return { label: 'Gấp trong 48 giờ', tone: 'warn' as const };
      }
    }
  }
  return { label: 'Đúng hạn', tone: 'neutral' as const };
}

function getWorkloadLabel(activeTrials: number, status?: string) {
  if (status && status !== 'ACTIVE') return { label: 'Tạm khóa', tone: 'is-locked' };
  if (activeTrials === 0) return { label: 'Trống tải', tone: 'is-free' };
  if (activeTrials >= 3) return { label: 'Tải cao', tone: 'is-high' };
  return { label: 'Đang phụ trách', tone: '' };
}

const COMPANY_PREFIX_REGEX =
  /^(công ty cổ phần công nghệ|công ty cổ phần thương mại dịch vụ|công ty cổ phần thương mại|công ty cổ phần giáo dục số|công ty cổ phần giáo dục|công ty cổ phần đầu tư|công ty cổ phần logistics|công ty cổ phần|công ty tnhh một thành viên|công ty tnhh mtv|công ty tnhh thương mại|công ty tnhh dịch vụ|công ty tnhh|công ty cp|công ty|tập đoàn bưu chính viễn thông|tập đoàn công nghệ|tập đoàn viễn thông|tập đoàn|tổng công ty|doanh nghiệp tư nhân|doanh nghiệp|ngân hàng tmcp|ngân hàng)\s+/i;

function getCompanyInitials(name: string): string {
  if (!name) return 'DN';
  const lower = name.toLowerCase();
  if (lower.includes('bưu chính viễn thông') || lower.includes('vnpt')) return 'VN';
  if (lower.includes('viettel')) return 'VT';
  if (lower.includes('fpt')) return 'FP';
  if (lower.includes('fuwa')) return 'FW';

  const clean = name.replace(COMPANY_PREFIX_REGEX, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return name.slice(0, 2).toUpperCase();

  if (words.length === 1) {
    const w = words[0];
    const camel = w.match(/([A-Z][a-z]+)([A-Z][a-z]+)/);
    if (camel) return (camel[1][0] + camel[2][0]).toUpperCase();
    return w.slice(0, 2).toUpperCase();
  }

  const first = words[0];
  const second = words[1];
  const camelFirst = first.match(/([A-Z][a-z]+)([A-Z][a-z]+)/);
  if (camelFirst) return (camelFirst[1][0] + camelFirst[2][0]).toUpperCase();

  return (first[0] + second[0]).toUpperCase();
}

function CompanyAvatar({
  name,
  size = 38,
  className = '',
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initialsText = getCompanyInitials(name);
  const fontSize = Math.max(11, Math.round(size * 0.35));
  const borderRadius = Math.max(7, Math.round(size * 0.24));

  return (
    <div
      className={`pa-tr-monogram ${className}`}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius,
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '1px solid #bfdbfe',
        color: '#1d4ed8',
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.04em',
        boxShadow: '0 1px 2px rgba(29, 78, 216, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initialsText}
    </div>
  );
}

/**
 * PA-14: Yêu cầu thẩm định & Đánh giá dùng thử doanh nghiệp
 */
export function PlatformTrialsPage() {
  const trials = usePlatformTrials();
  const mentors = useMentors();

  const [tab, setTab] = useState<TabKey>('ALL');
  const [search, setSearch] = useState('');
  const [mentorFilter, setMentorFilter] = useState('');
  const [slaFilter, setSlaFilter] = useState<'ALL' | 'URGENT'>('ALL');
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);
  const [drawerFocusAssign, setDrawerFocusAssign] = useState(false);
  const [createMentorOpen, setCreateMentorOpen] = useState(false);
  const [mentorDropdownOpen, setMentorDropdownOpen] = useState(false);
  const [mentorTrialsDrawer, setMentorTrialsDrawer] = useState<{
    mentor: MentorItem;
    trials: PlatformTrialItem[];
  } | null>(null);
  const mentorDropdownRef = useRef<HTMLDivElement | null>(null);
  const mentorSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!mentorDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (mentorDropdownRef.current && !mentorDropdownRef.current.contains(e.target as Node)) {
        setMentorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mentorDropdownOpen]);

  const trialsList = useMemo(() => trials.data ?? [], [trials.data]);
  const mentorsList = useMemo(() => mentors.data ?? [], [mentors.data]);

  const selectedTrial = useMemo(
    () => trialsList.find((t) => t.organizationId === selectedTrialId) ?? null,
    [trialsList, selectedTrialId],
  );

  const requestedCount = useMemo(
    () => trialsList.filter((t) => t.stage === 'REQUESTED').length,
    [trialsList],
  );
  const urgentRequestedCount = useMemo(
    () =>
      trialsList.filter((t) => {
        if (t.stage !== 'REQUESTED') return false;
        const sla = getSlaStatus(t);
        return sla.tone === 'bad' || sla.tone === 'warn';
      }).length,
    [trialsList],
  );
  const assignedCount = useMemo(
    () => trialsList.filter((t) => t.stage === 'ASSIGNED').length,
    [trialsList],
  );
  const reportedCount = useMemo(
    () => trialsList.filter((t) => t.stage === 'REPORTED').length,
    [trialsList],
  );
  const setupCount = useMemo(
    () => trialsList.filter((t) => t.stage === 'SETUP').length,
    [trialsList],
  );

  const totalEvaluatingSubs = useMemo(
    () =>
      trialsList
        .filter((t) => t.stage === 'ASSIGNED')
        .reduce((sum, t) => sum + (t.submitted || 0), 0),
    [trialsList],
  );
  const totalParticipants = useMemo(
    () => trialsList.reduce((sum, t) => sum + (t.participants || 0), 0),
    [trialsList],
  );

  const activeMentors = useMemo(
    () => mentorsList.filter((m) => m.status === 'ACTIVE'),
    [mentorsList],
  );
  const freeMentors = useMemo(
    () => activeMentors.filter((m) => (m.activeTrials || 0) === 0),
    [activeMentors],
  );
  const busyMentors = useMemo(
    () => activeMentors.filter((m) => (m.activeTrials || 0) > 0),
    [activeMentors],
  );
  const mentorTrialsMap = useMemo(() => {
    const map = new Map<string, PlatformTrialItem[]>();
    for (const t of trialsList) {
      if (t.mentorUserId) {
        const list = map.get(t.mentorUserId) || [];
        list.push(t);
        map.set(t.mentorUserId, list);
      }
    }
    return map;
  }, [trialsList]);
  const maxMentorLoad = useMemo(
    () => Math.max(3, ...mentorsList.map((m) => m.activeTrials || 0)),
    [mentorsList],
  );

  const selectedMentorName = useMemo(
    () => mentorsList.find((m) => m.userId === mentorFilter)?.fullName ?? '',
    [mentorsList, mentorFilter],
  );

  const countForTab = (k: TabKey) => {
    if (k === 'ALL') return trialsList.length;
    if (k === 'REQUESTED') return requestedCount;
    if (k === 'ASSIGNED') return assignedCount;
    if (k === 'REPORTED') return reportedCount;
    if (k === 'SETUP') return setupCount;
    return 0;
  };

  const filteredItems = useMemo(() => {
    let result = trialsList;

    if (tab !== 'ALL') {
      result = result.filter((t) => t.stage === tab);
    }
    if (mentorFilter) {
      result = result.filter((t) => t.mentorUserId === mentorFilter);
    }
    if (slaFilter === 'URGENT') {
      result = result.filter((t) => {
        const sla = getSlaStatus(t);
        return sla.tone === 'bad' || sla.tone === 'warn';
      });
    }
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.organizationName.toLowerCase().includes(q) ||
          t.ownerName.toLowerCase().includes(q) ||
          t.ownerEmail.toLowerCase().includes(q) ||
          (t.mentorName && t.mentorName.toLowerCase().includes(q)) ||
          (t.requestNote && t.requestNote.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [trialsList, tab, mentorFilter, slaFilter, search]);

  const hasFilters = Boolean(search || mentorFilter || slaFilter !== 'ALL' || tab !== 'ALL');

  const resetFilters = () => {
    setSearch('');
    setMentorFilter('');
    setSlaFilter('ALL');
    setTab('ALL');
  };

  const toggleStageFromKpi = (target: TrialStage) => {
    setTab((prev) => (prev === target ? 'ALL' : target));
  };

  const openTrialDrawer = (trial: PlatformTrialItem, focusAssign = false) => {
    setSelectedTrialId(trial.organizationId);
    setDrawerFocusAssign(focusAssign);
  };

  const refetchAll = () => {
    void trials.refetch();
    void mentors.refetch();
    toast.success('Đã cập nhật dữ liệu mới nhất');
  };

  const isLoadingPage = trials.isLoading && !trials.data;

  return (
    <div className="pa-ov-stage">
      {/* Tier 1: Clean Header without redundant paragraph */}
      <header className="pa-ov-header" style={{ marginBottom: 0 }}>
        <div>
          <h1>Yêu cầu thẩm định &amp; Đánh giá dùng thử</h1>
        </div>

        <div className="pa-ov-actions">
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={refetchAll}
            disabled={trials.isFetching || mentors.isFetching}
          >
            <RefreshCw size={14} className={trials.isFetching ? 'animate-spin' : ''} aria-hidden="true" />
            <span>Làm mới</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-small inline-flex items-center gap-1.5"
            onClick={() => setCreateMentorOpen(true)}
          >
            <UserPlus size={14} aria-hidden="true" />
            <span>Thêm Mentor</span>
          </button>
        </div>
      </header>

      {isLoadingPage && <PlatformTrialsSkeleton />}
      {!isLoadingPage && trials.error && <LoadError error={trials.error} />}

      {!isLoadingPage && !trials.error && (
        <>
          {/* Tier 2: 4 Clickable KPI Filter Cards (Compact & Punchy) */}
          <div className="pa-ov-kpi-grid pa-tr-kpi-compact" role="group" aria-label="Tổng hợp theo giai đoạn dùng thử">
            <button
              type="button"
              className="pa-ov-kpi-card pa-tr-kpi-btn is-tone-amber"
              aria-pressed={tab === 'REQUESTED'}
              onClick={() => toggleStageFromKpi('REQUESTED')}
            >
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Chờ phân công</span>
                <span className="pa-kpi-icon is-amber" aria-hidden="true">
                  <Clock size={16} />
                </span>
              </div>
              <div className="pa-tr-kpi-val-row">
                <span className="pa-ov-kpi-val">{requestedCount}</span>
                {urgentRequestedCount > 0 ? (
                  <span className="pa-tr-pill is-bad" style={{ fontSize: 11.5, padding: '2px 8px' }}>
                    {urgentRequestedCount} gấp &lt;48h
                  </span>
                ) : (
                  <span className="pa-tr-kpi-sub-neutral">0 chờ</span>
                )}
              </div>
            </button>

            <button
              type="button"
              className="pa-ov-kpi-card pa-tr-kpi-btn is-tone-sky"
              aria-pressed={tab === 'ASSIGNED'}
              onClick={() => toggleStageFromKpi('ASSIGNED')}
            >
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Đang chấm thi</span>
                <span className="pa-kpi-icon is-sky" aria-hidden="true">
                  <FlaskConical size={16} />
                </span>
              </div>
              <div className="pa-tr-kpi-val-row">
                <span className="pa-ov-kpi-val">{assignedCount}</span>
                <span className="pa-tr-pill is-info" style={{ fontSize: 11.5, padding: '2px 8px' }}>
                  {totalEvaluatingSubs} bài
                </span>
              </div>
            </button>

            <button
              type="button"
              className="pa-ov-kpi-card pa-tr-kpi-btn is-tone-green"
              aria-pressed={tab === 'REPORTED'}
              onClick={() => toggleStageFromKpi('REPORTED')}
            >
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Đã có báo cáo</span>
                <span className="pa-kpi-icon is-jade" aria-hidden="true">
                  <CheckCircle2 size={16} />
                </span>
              </div>
              <div className="pa-tr-kpi-val-row">
                <span className="pa-ov-kpi-val">{reportedCount}</span>
                <span className="pa-tr-pill is-ok" style={{ fontSize: 11.5, padding: '2px 8px' }}>
                  {totalParticipants} nhân sự
                </span>
              </div>
            </button>

            <button
              type="button"
              className="pa-ov-kpi-card pa-tr-kpi-btn is-tone-orange"
              aria-pressed={false}
              onClick={() =>
                mentorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Mentor sẵn sàng</span>
                <span className="pa-kpi-icon is-orange" aria-hidden="true">
                  <Users size={16} />
                </span>
              </div>
              <div className="pa-tr-kpi-val-row">
                <span className="pa-ov-kpi-val">
                  {freeMentors.length}
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--pa-ink-2)' }}>
                    {' '}/ {mentorsList.length}
                  </span>
                </span>
                <span className="pa-tr-pill is-ok" style={{ fontSize: 11.5, padding: '2px 8px' }}>
                  {freeMentors.length} rảnh
                </span>
              </div>
            </button>
          </div>

          {/* Tier 3: Unified Trials Worklist Table */}
          <section className="pa-ov-panel" aria-labelledby="trials-worklist-heading">
            <h2 id="trials-worklist-heading" className="sr-only">
              Danh sách yêu cầu thẩm định doanh nghiệp
            </h2>

            <div className="pa-tr-toolbar">
              <div className="pa-tr-toolbar-row">
                <div className="pa-ov-tablist" role="tablist" aria-label="Lọc theo giai đoạn dùng thử">
                  {TABS.map((t) => {
                    const isActive = tab === t.key;
                    const count = countForTab(t.key);
                    return (
                      <button
                        key={t.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className="pa-ov-tab pa-tr-tab-btn"
                        onClick={() => setTab(t.key)}
                      >
                        <span>{t.label}</span>
                        <span
                          className={`pa-tr-tab-count ${t.key === 'REQUESTED' && count > 0 ? 'is-urgent' : ''
                            }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pa-tr-results-count">
                  Hiển thị <strong>{filteredItems.length}</strong> / {trialsList.length} doanh nghiệp
                </div>
              </div>

              <div className="pa-tr-toolbar-row">
                <div className="pa-tr-toolbar-controls">
                  <div className="pa-tr-search-wrap">
                    <Search size={16} className="pa-tr-search-icon" aria-hidden="true" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Tìm tên doanh nghiệp, đại diện hoặc email..."
                      aria-label="Tìm doanh nghiệp, người đại diện hoặc email"
                      className="pa-tr-search-input"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="pa-tr-search-clear"
                        aria-label="Xóa từ khóa tìm kiếm"
                        title="Xóa từ khóa"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <select
                    aria-label="Lọc theo tiến độ xử lý"
                    value={slaFilter}
                    onChange={(e) => setSlaFilter(e.target.value as 'ALL' | 'URGENT')}
                    className="pa-tr-select"
                  >
                    <option value="ALL">Tất cả tiến độ</option>
                    <option value="URGENT">Cần gấp hoặc quá hạn</option>
                  </select>

                  {/* Mentor Filter Dropdown */}
                  <div className="pa-tr-mentor-dropdown-wrap" ref={mentorDropdownRef}>
                    <button
                      type="button"
                      className={`pa-tr-select-btn ${mentorFilter ? 'is-active' : ''}`}
                      onClick={() => setMentorDropdownOpen((prev) => !prev)}
                      aria-expanded={mentorDropdownOpen}
                      aria-haspopup="listbox"
                      aria-label={
                        selectedMentorName
                          ? `Mentor: ${selectedMentorName}`
                          : `Lọc theo Mentor (${freeMentors.length} sẵn sàng)`
                      }
                    >
                      <Users size={15} aria-hidden="true" />
                      <span className="pa-tr-select-btn-text">
                        {selectedMentorName ? selectedMentorName : `Mentor sẵn sàng (${freeMentors.length})`}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`pa-tr-select-chevron ${mentorDropdownOpen ? 'is-open' : ''}`}
                        aria-hidden="true"
                      />
                    </button>

                    {mentorFilter && (
                      <button
                        type="button"
                        className="pa-tr-filter-clear-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMentorFilter('');
                        }}
                        title="Bỏ lọc Mentor"
                        aria-label="Bỏ lọc Mentor"
                      >
                        <X size={13} />
                      </button>
                    )}

                    {mentorDropdownOpen && (
                      <div className="pa-tr-mentor-menu" role="listbox">
                        <button
                          type="button"
                          className={`pa-tr-mentor-menu-item ${!mentorFilter ? 'is-selected' : ''}`}
                          onClick={() => {
                            setMentorFilter('');
                            setMentorDropdownOpen(false);
                          }}
                        >
                          <span>Tất cả Mentor ({mentorsList.length})</span>
                          {!mentorFilter && <Check size={14} aria-hidden="true" />}
                        </button>

                        <div className="pa-tr-menu-header">
                          <span className="pa-tr-strip-dot is-free" aria-hidden="true" />
                          <span>SẴN SÀNG NHẬN VIỆC ({freeMentors.length})</span>
                        </div>
                        {freeMentors.map((m) => {
                          const isSel = mentorFilter === m.userId;
                          return (
                            <button
                              key={m.userId}
                              type="button"
                              className={`pa-tr-mentor-menu-item ${isSel ? 'is-selected' : ''}`}
                              aria-label={`Lọc theo Mentor ${m.fullName} (${m.email})`}
                              onClick={() => {
                                setMentorFilter(m.userId);
                                setMentorDropdownOpen(false);
                              }}
                            >
                              <div className="pa-tr-menu-item-left">
                                <span className="pa-tr-chip-avatar" aria-hidden="true">{initials(m.fullName)}</span>
                                <div>
                                  <div className="pa-tr-menu-item-name">{m.fullName}</div>
                                  <div className="pa-tr-menu-item-email">{m.email}</div>
                                </div>
                              </div>
                              <span className="pa-tr-pill is-ok" style={{ fontSize: 11, padding: '2px 7px' }}>0 DN</span>
                            </button>
                          );
                        })}

                        {busyMentors.length > 0 && (
                          <>
                            <div className="pa-tr-menu-header">
                              <span className="pa-tr-strip-dot is-busy" aria-hidden="true" />
                              <span>ĐANG CHẤM BÀI ({busyMentors.length})</span>
                            </div>
                            {busyMentors.map((m) => {
                              const isSel = mentorFilter === m.userId;
                              return (
                                <button
                                  key={m.userId}
                                  type="button"
                                  className={`pa-tr-mentor-menu-item ${isSel ? 'is-selected' : ''}`}
                                  aria-label={`Lọc theo Mentor ${m.fullName} (${m.email})`}
                                  onClick={() => {
                                    setMentorFilter(m.userId);
                                    setMentorDropdownOpen(false);
                                  }}
                                >
                                  <div className="pa-tr-menu-item-left">
                                    <span className="pa-tr-chip-avatar" aria-hidden="true">{initials(m.fullName)}</span>
                                    <div>
                                      <div className="pa-tr-menu-item-name">{m.fullName}</div>
                                      <div className="pa-tr-menu-item-email">{m.email}</div>
                                    </div>
                                  </div>
                                  <span className="pa-tr-pill is-info" style={{ fontSize: 11, padding: '2px 7px' }}>{m.activeTrials} DN</span>
                                </button>
                              );
                            })}
                          </>
                        )}

                        <div className="pa-tr-menu-footer">
                          <button
                            type="button"
                            className="pa-tr-menu-link"
                            onClick={() => {
                              setMentorDropdownOpen(false);
                              mentorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                          >
                            Bảng chi tiết đội ngũ ↓
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {hasFilters && (
                  <div className="pa-tr-active-chips">
                    <button type="button" onClick={resetFilters} className="pa-tr-reset-link">
                      Đặt lại bộ lọc
                    </button>
                  </div>
                )}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="pa-ov-empty-state">
                <div className="pa-ov-empty-icon" aria-hidden="true">
                  <FlaskConical size={22} />
                </div>
                <p className="pa-ov-empty-text">
                  Không có doanh nghiệp dùng thử phù hợp với bộ lọc hiện tại. Bấm đặt lại bộ lọc hoặc chọn trạng thái khác để xem toàn bộ danh sách.
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    onClick={resetFilters}
                  >
                    Xem tất cả doanh nghiệp
                  </button>
                )}
              </div>
            ) : (
              <div
                tabIndex={0}
                role="region"
                aria-label="Bảng yêu cầu thẩm định dùng thử"
                className="pa-tr-table-scroll"
              >
                <table className="pa-tr-table">
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>Doanh nghiệp</th>
                      <th style={{ width: '17%' }}>Tiến độ thi</th>
                      <th style={{ width: '17%' }}>Thời hạn làm bài</th>
                      <th style={{ width: '14%' }}>Trạng thái</th>
                      <th style={{ width: '14%' }}>Mentor phụ trách</th>
                      <th style={{ width: '10%' }} className="is-right">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((t) => {
                      const sla = getSlaStatus(t);
                      const stageMeta = ADMIN_STAGE[t.stage];
                      const pct = Math.min(
                        100,
                        Math.round((t.submitted / Math.max(1, t.participants)) * 100),
                      );
                      const canAssign = t.stage === 'REQUESTED' || t.stage === 'ASSIGNED';

                      return (
                        <tr key={t.organizationId}>
                          <td>
                            <div className="pa-tr-org-cell">
                              <CompanyAvatar name={t.organizationName} size={38} />
                              <div className="pa-tr-org-info">
                                <Link
                                  to={`/platform/organizations/${t.organizationId}`}
                                  className="pa-tr-org-name"
                                >
                                  {t.organizationName}
                                </Link>
                                {t.requestNote && (
                                  <span className="pa-tr-org-note" title={t.requestNote}>
                                    Ghi chú: {t.requestNote}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="pa-tr-progress-cell">
                              <div className="pa-tr-progress-top">
                                <strong>
                                  {t.submitted} / {t.participants} nhân sự
                                </strong>
                                <span>{pct}%</span>
                              </div>
                              <div className="pa-tr-progress-track" aria-hidden="true">
                                <div
                                  className={`pa-tr-progress-fill ${pct >= 100 ? 'is-complete' : ''}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span
                                className={`pa-tr-progress-sub ${t.reviewed > 0 ? 'is-done' : ''}`}
                              >
                                {t.reviewed > 0 ? `Đã chấm ${t.reviewed} bài` : 'Chưa chấm bài nào'}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="pa-tr-dates-cell">
                              <div className="pa-tr-date-line">
                                <Calendar size={14} aria-hidden="true" />
                                <span>Hạn: {formatDateTimePlain(t.testDeadline)}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                              <span className={`pa-tr-pill is-${stageMeta.tone}`}>
                                <span className="pa-tr-pill-dot" aria-hidden="true" />
                                <span>{stageMeta.label}</span>
                              </span>
                              {t.stage !== 'REPORTED' && (sla.tone === 'bad' || sla.tone === 'warn') && (
                                <span className={`pa-tr-pill is-${sla.tone}`} style={{ fontSize: 11, padding: '1px 6px' }}>
                                  {sla.label}
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <div className="pa-tr-mentor-cell">
                              {t.stage === 'SETUP' ? (
                                <span style={{ fontSize: 13.5, color: 'var(--pa-ink-2)' }}>
                                  Chưa gửi yêu cầu
                                </span>
                              ) : t.mentorName ? (
                                <>
                                  <div className="pa-tr-mentor-person">
                                    <span className="pa-tr-avatar" aria-hidden="true">
                                      {initials(t.mentorName)}
                                    </span>
                                    <span>{t.mentorName}</span>
                                  </div>
                                  {canAssign && (
                                    <button
                                      type="button"
                                      className="pa-tr-reassign-btn"
                                      onClick={() => openTrialDrawer(t, true)}
                                    >
                                      Đổi Mentor
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--pa-amber)' }}>
                                    Chưa phân công
                                  </span>
                                  {canAssign && (
                                    <button
                                      type="button"
                                      className="pa-tr-assign-btn"
                                      onClick={() => openTrialDrawer(t, true)}
                                    >
                                      Phân công
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>

                          <td className="is-right">
                            <div className="pa-tr-actions-cell">
                              <button
                                type="button"
                                className="pa-tr-detail-btn"
                                onClick={() => openTrialDrawer(t, false)}
                              >
                                Chi tiết
                              </button>
                              <Link
                                to={`/platform/organizations/${t.organizationId}`}
                                className="pa-tr-ext-link"
                                aria-label={`Mở hồ sơ tổ chức ${t.organizationName}`}
                                title="Mở hồ sơ tổ chức"
                              >
                                <ExternalLink size={15} aria-hidden="true" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Tier 4: Mentor Team Scorecard Table Panel */}
          <section
            ref={mentorSectionRef}
            className="pa-ov-panel"
            aria-labelledby="mentor-team-heading"
          >
            <div className="pa-ov-panel-head">
              <div>
                <h2 id="mentor-team-heading" className="pa-ov-panel-title">
                  Bảng theo dõi năng lực Mentor thẩm định
                </h2>
                <p className="pa-ov-panel-sub">
                  {activeMentors.length} chuyên gia sẵn sàng chấm bài tự luận. Đối chiếu khối lượng công việc và doanh nghiệp đang phụ trách.
                </p>
              </div>

              {mentorFilter && (
                <button
                  type="button"
                  className="btn btn-outline btn-small"
                  onClick={() => setMentorFilter('')}
                >
                  Bỏ lọc Mentor
                </button>
              )}
            </div>

            {mentorsList.length === 0 ? (
              <div className="pa-ov-empty-state" style={{ minHeight: 160 }}>
                <p className="pa-ov-empty-text">
                  Chưa có tài khoản Mentor nào trong hệ thống. Bấm nút Thêm Mentor ở góc trên để tạo tài khoản chuyên gia đầu tiên.
                </p>
              </div>
            ) : (
              <div
                className="pa-tr-mentor-table-wrap"
                tabIndex={0}
                role="region"
                aria-label="Bảng theo dõi năng lực đội ngũ Mentor"
              >
                <table className="pa-tr-mentor-table">
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>Chuyên gia Mentor</th>
                      <th style={{ width: '25%' }}>Tình trạng &amp; Khối lượng tải</th>
                      <th style={{ width: '33%' }}>Doanh nghiệp đang thẩm định</th>
                      <th style={{ width: '14%' }} className="is-right">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentorsList.map((m) => {
                      const isSelected = mentorFilter === m.userId;
                      const loadMeta = getWorkloadLabel(m.activeTrials, m.status);
                      const loadPct = Math.min(100, Math.round((m.activeTrials / maxMentorLoad) * 100));
                      const assignedTrials = mentorTrialsMap.get(m.userId) || [];

                      return (
                        <tr key={m.userId} className={isSelected ? 'is-filtered' : ''}>
                          <td>
                            <div className="pa-tr-mentor-cell-main">
                              <span className="pa-tr-mentor-avatar" aria-hidden="true">
                                {initials(m.fullName)}
                              </span>
                              <div>
                                <div className="pa-tr-mentor-name">{m.fullName}</div>
                                <div className="pa-tr-mentor-email">{m.email}</div>
                                <div className="pa-tr-mentor-joined">
                                  Gia nhập: {formatDateTimePlain(m.createdAt)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="pa-tr-load-wrap">
                              <div className="pa-tr-load-head">
                                <strong>{m.activeTrials} doanh nghiệp</strong>
                                <span>{loadMeta.label}</span>
                              </div>
                              <div className="pa-tr-load-track" aria-hidden="true">
                                <div
                                  className={`pa-tr-load-fill ${loadMeta.tone}`}
                                  style={{
                                    width: `${Math.max(m.activeTrials > 0 ? 18 : 6, loadPct)}%`,
                                  }}
                                />
                              </div>
                              <div>
                                <span
                                  className={`pa-tr-pill ${m.status === 'ACTIVE'
                                      ? m.activeTrials === 0
                                        ? 'is-ok'
                                        : 'is-info'
                                      : 'is-neutral'
                                    }`}
                                >
                                  <span className="pa-tr-pill-dot" aria-hidden="true" />
                                  <span>
                                    {m.status === 'ACTIVE'
                                      ? m.activeTrials === 0
                                        ? 'Sẵn sàng nhận việc'
                                        : 'Đang chấm bài'
                                      : 'Đã khóa'}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            {assignedTrials.length === 0 ? (
                              <span className="pa-tr-mentor-company-none">
                                Chưa phụ trách doanh nghiệp nào
                              </span>
                            ) : (
                              <div className="pa-tr-mentor-org-summary">
                                <div className="pa-tr-mentor-org-count">
                                  <strong>{assignedTrials.length} doanh nghiệp</strong>
                                  <span>
                                    · {assignedTrials.reduce((sum, t) => sum + (t.submitted || 0), 0)}/
                                    {assignedTrials.reduce((sum, t) => sum + (t.participants || 0), 0)} bài thi
                                  </span>
                                  <button
                                    type="button"
                                    className="pa-tr-mentor-view-all-link"
                                    onClick={() => setMentorTrialsDrawer({ mentor: m, trials: assignedTrials })}
                                    title="Mở ngăn kéo xem danh sách chi tiết các doanh nghiệp do Mentor phụ trách"
                                    aria-label={`Xem tất cả ${assignedTrials.length} doanh nghiệp của ${m.fullName}`}
                                  >
                                    Xem tất cả ↗
                                  </button>
                                </div>
                                <div className="pa-tr-mentor-org-stack">
                                  {assignedTrials.slice(0, 2).map((t) => (
                                    <div
                                      key={t.organizationId}
                                      className="pa-tr-mentor-org-line"
                                      title={`${t.organizationName} (${t.submitted}/${t.participants} bài đã nộp)`}
                                    >
                                      <span className="pa-tr-org-bullet" aria-hidden="true">•</span>
                                      <span className="pa-tr-mentor-org-truncate">{t.organizationName}</span>
                                      <span className="pa-tr-mentor-org-pct">
                                        ({t.submitted}/{t.participants})
                                      </span>
                                    </div>
                                  ))}
                                  {assignedTrials.length > 2 && (
                                    <div className="pa-tr-more-actions">
                                      <button
                                        type="button"
                                        className="pa-tr-more-badge-btn"
                                        onClick={() => setMentorTrialsDrawer({ mentor: m, trials: assignedTrials })}
                                        title="Nhấn để xem danh sách toàn bộ doanh nghiệp do Mentor phụ trách"
                                        aria-label={`Xem chi tiết ${assignedTrials.length - 2} doanh nghiệp khác của ${m.fullName}`}
                                      >
                                        +{assignedTrials.length - 2} doanh nghiệp khác
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="is-right">
                            <button
                              type="button"
                              className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'} btn-small`}
                              aria-label={`Lọc bảng danh sách theo ${m.fullName}`}
                              onClick={() => {
                                setMentorFilter((prev) => (prev === m.userId ? '' : m.userId));
                                window.scrollTo({ top: 380, behavior: 'smooth' });
                              }}
                            >
                              {isSelected ? 'Đang lọc' : 'Lọc bảng DN'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* Slide-over Drawer: Trial Detail & Mentor Assignment */}
      {selectedTrial && (
        <TrialDetailDrawer
          trial={selectedTrial}
          mentors={mentorsList}
          focusAssign={drawerFocusAssign}
          onClose={() => setSelectedTrialId(null)}
        />
      )}

      {/* Slide-over Drawer: Create Mentor */}
      {createMentorOpen && (
        <CreateMentorDrawer
          isOpen={createMentorOpen}
          onClose={() => setCreateMentorOpen(false)}
        />
      )}

      {/* Slide-over Drawer: View All Assigned Trials of Mentor */}
      {mentorTrialsDrawer && (
        <MentorAssignedTrialsDrawer
          mentor={mentorTrialsDrawer.mentor}
          trials={mentorTrialsDrawer.trials}
          onClose={() => setMentorTrialsDrawer(null)}
          onSelectTrial={(trial) => {
            setMentorTrialsDrawer(null);
            openTrialDrawer(trial, false);
          }}
        />
      )}
    </div>
  );
}

function TrialDetailDrawer({
  trial,
  mentors,
  focusAssign,
  onClose,
}: {
  trial: PlatformTrialItem;
  mentors: MentorItem[];
  focusAssign: boolean;
  onClose: () => void;
}) {
  const [selectedMentorId, setSelectedMentorId] = useState(trial.mentorUserId ?? '');
  const assign = useAssignMentor();
  const stageMeta = ADMIN_STAGE[trial.stage];
  const activeMentors = mentors.filter((m) => m.status === 'ACTIVE');
  const canAssign = trial.stage === 'REQUESTED' || trial.stage === 'ASSIGNED';

  const handleAssign = () => {
    if (!selectedMentorId || selectedMentorId === trial.mentorUserId) return;
    assign.mutate(
      { organizationId: trial.organizationId, mentorUserId: selectedMentorId },
      {
        onSuccess: () => {
          toast.success(`Đã phân công Mentor cho ${trial.organizationName}`);
          onClose();
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <PlatformDrawer
      isOpen
      onClose={onClose}
      title={trial.organizationName}
      icon={FlaskConical}
      badge={<span className={`pa-tr-pill is-${stageMeta.tone}`}>{stageMeta.label}</span>}
      subtitle={`Chủ doanh nghiệp: ${trial.ownerName}`}
      width={580}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button type="button" className="pa-btn-neutral" onClick={onClose}>
            Đóng
          </button>
          <Link
            to={`/platform/organizations/${trial.organizationId}`}
            className="pa-btn-accent inline-flex items-center gap-1.5"
          >
            <span>Hồ sơ tổ chức 360</span>
            <ExternalLink size={14} aria-hidden="true" />
          </Link>
        </div>
      }
    >
      <div className="pa-tr-drawer-stack">
        {/* Contact Information */}
        <div className="pa-tr-drawer-box">
          <div className="pa-tr-drawer-heading">Thông tin liên hệ</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} aria-hidden="true" style={{ color: 'var(--pa-ink-3)' }} />
            <strong>{trial.ownerName}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--pa-ink-2)' }}>
            <Mail size={16} aria-hidden="true" style={{ color: 'var(--pa-ink-3)' }} />
            <span>{trial.ownerEmail}</span>
          </div>
        </div>

        {/* Request Note */}
        {trial.requestNote && (
          <div className="pa-tr-drawer-box is-note">
            <div className="pa-tr-drawer-heading" style={{ color: 'var(--pa-accent-solid)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FileText size={15} aria-hidden="true" />
                Ghi chú từ doanh nghiệp
              </span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.55 }}>{trial.requestNote}</p>
          </div>
        )}

        {/* Metrics */}
        <div className="pa-tr-drawer-metrics">
          <div className="pa-tr-metric-box">
            <span>Người tham gia</span>
            <strong>{trial.participants}</strong>
          </div>
          <div className="pa-tr-metric-box">
            <span>Đã nộp bài</span>
            <strong style={{ color: 'var(--pa-accent-solid)' }}>{trial.submitted}</strong>
          </div>
          <div className="pa-tr-metric-box">
            <span>Đã chấm điểm</span>
            <strong style={{ color: 'var(--pa-live)' }}>{trial.reviewed}</strong>
          </div>
        </div>

        {/* Timeline */}
        <div className="pa-tr-drawer-box">
          <div className="pa-tr-drawer-heading">Lịch trình và thời hạn</div>
          <div className="pa-tr-drawer-row">
            <span style={{ color: 'var(--pa-ink-2)' }}>Bắt đầu dùng thử:</span>
            <strong>{formatDateTimePlain(trial.startedAt)}</strong>
          </div>
          <div className="pa-tr-drawer-row">
            <span style={{ color: 'var(--pa-ink-2)' }}>Hạn làm bài thi:</span>
            <strong style={{ color: 'var(--pa-danger)' }}>
              {formatDateTimePlain(trial.testDeadline)}
            </strong>
          </div>
          {trial.reportPublishedAt && (
            <div
              className="pa-tr-drawer-row"
              style={{ paddingTop: 8, borderTop: '1px solid var(--pa-border)' }}
            >
              <span style={{ color: 'var(--pa-ink-2)' }}>Đã công bố báo cáo lúc:</span>
              <strong style={{ color: 'var(--pa-live)' }}>
                {formatDateTimePlain(trial.reportPublishedAt)}
              </strong>
            </div>
          )}
        </div>

        {/* Mentor Assignment */}
        <div className="pa-tr-drawer-box">
          <div className="pa-tr-drawer-heading">
            <span>Phân công Mentor thẩm định</span>
            {trial.mentorName && (
              <span style={{ color: 'var(--pa-live)' }}>Hiện tại: {trial.mentorName}</span>
            )}
          </div>

          {!canAssign ? (
            <p style={{ margin: 0, color: 'var(--pa-ink-2)', lineHeight: 1.5 }}>
              {trial.stage === 'REPORTED'
                ? 'Báo cáo năng lực đã công bố cho doanh nghiệp nên không thể thay đổi Mentor phụ trách.'
                : 'Doanh nghiệp đang thiết lập danh sách và chưa gửi yêu cầu thẩm định.'}
            </p>
          ) : activeMentors.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--pa-ink-2)', lineHeight: 1.5 }}>
              Chưa có Mentor đang hoạt động. Tạo tài khoản Mentor trước khi phân công.
            </p>
          ) : (
            <>
              <div className="pa-tr-mentor-radio-list" role="radiogroup" aria-label="Chọn Mentor phụ trách">
                {activeMentors
                  .slice()
                  .sort((a, b) => (a.activeTrials || 0) - (b.activeTrials || 0))
                  .map((m, idx) => {
                    const checked = selectedMentorId === m.userId;
                    const isRecommended = (m.activeTrials || 0) === 0;
                    return (
                      <label
                        key={m.userId}
                        className={`pa-tr-mentor-radio ${checked ? 'is-selected' : ''} ${isRecommended ? 'is-recommended' : ''
                          }`}
                      >
                        <div className="pa-tr-mentor-radio-left">
                          <input
                            type="radio"
                            name="assign-mentor"
                            value={m.userId}
                            checked={checked}
                            autoFocus={focusAssign && idx === 0}
                            onChange={() => setSelectedMentorId(m.userId)}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--pa-ink)' }}>{m.fullName}</div>
                            <div style={{ fontSize: 13, color: 'var(--pa-ink-2)' }}>{m.email}</div>
                          </div>
                        </div>
                        <span className={`pa-tr-pill ${isRecommended ? 'is-ok' : 'is-info'}`}>
                          {isRecommended ? 'Khuyên chọn (0 DN)' : `${m.activeTrials} DN đang chấm`}
                        </span>
                      </label>
                    );
                  })}
              </div>

              <button
                type="button"
                className="pa-btn-accent"
                style={{ width: '100%', justifyContent: 'center', marginTop: 8, height: 40 }}
                disabled={
                  !selectedMentorId ||
                  selectedMentorId === trial.mentorUserId ||
                  assign.isPending
                }
                onClick={handleAssign}
              >
                {assign.isPending
                  ? 'Đang phân công...'
                  : trial.mentorUserId
                    ? 'Cập nhật Mentor phụ trách'
                    : 'Xác nhận phân công Mentor'}
              </button>
            </>
          )}
        </div>
      </div>
    </PlatformDrawer>
  );
}

function CreateMentorDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const create = useCreateMentor();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const isPasswordValid = form.password.length >= 12;
  const isNameValid = form.fullName.trim().length >= 2;
  const isValid = isNameValid && isEmailValid && isPasswordValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || create.isPending) return;

    create.mutate(
      { fullName: form.fullName.trim(), email: form.email.trim(), password: form.password },
      {
        onSuccess: (m) => {
          toast.success(`Đã tạo tài khoản Mentor: ${m.email}`);
          setForm({ fullName: '', email: '', password: '' });
          onClose();
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <PlatformDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Mentor mới"
      icon={UserPlus}
      subtitle="Tạo tài khoản chuyên gia chấm thi bài làm tự luận"
      width={480}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <button type="button" className="btn btn-outline btn-small" onClick={onClose} disabled={create.isPending}>
            Hủy
          </button>
          <button
            type="submit"
            form="create-mentor-form"
            className="btn btn-primary btn-small"
            disabled={!isValid || create.isPending}
          >
            {create.isPending ? 'Đang tạo...' : 'Tạo tài khoản Mentor'}
          </button>
        </div>
      }
    >
      <form id="create-mentor-form" onSubmit={handleSubmit} className="pa-tr-drawer-stack">
        <div className="pa-tr-field">
          <label htmlFor="mentor-fullname">Họ và tên chuyên gia</label>
          <input
            id="mentor-fullname"
            type="text"
            required
            autoFocus
            placeholder="Ví dụ: Nguyễn Văn Minh"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="pa-tr-input"
          />
        </div>

        <div className="pa-tr-field">
          <label htmlFor="mentor-email">Email công việc</label>
          <input
            id="mentor-email"
            type="email"
            required
            placeholder="mentor@digitalent.ai"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="pa-tr-input"
          />
          {form.email && !isEmailValid && (
            <span className="pa-tr-field-err">Email không đúng định dạng.</span>
          )}
        </div>

        <div className="pa-tr-field">
          <label htmlFor="mentor-password">Mật khẩu khởi tạo</label>
          <div className="pa-tr-input-wrap">
            <input
              id="mentor-password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Tối thiểu 12 ký tự"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="pa-tr-input"
              style={{ paddingRight: 64 }}
            />
            <button
              type="button"
              className="pa-tr-pwd-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
          <div className="pa-tr-field-hint">
            <span>Yêu cầu tối thiểu 12 ký tự</span>
            <strong style={{ color: isPasswordValid ? 'var(--pa-live)' : 'var(--pa-ink-2)' }}>
              {form.password.length}/12
            </strong>
          </div>
        </div>

        <div className="pa-tr-drawer-box">
          <span style={{ color: 'var(--pa-ink-2)', lineHeight: 1.55 }}>
            Tài khoản mới có quyền truy cập Cổng Mentor (/mentor/trials) để tiếp nhận danh sách doanh nghiệp và chấm phần tự luận được giao.
          </span>
        </div>
      </form>
    </PlatformDrawer>
  );
}

function MentorAssignedTrialsDrawer({
  mentor,
  trials,
  onClose,
  onSelectTrial,
}: {
  mentor: MentorItem;
  trials: PlatformTrialItem[];
  onClose: () => void;
  onSelectTrial: (trial: PlatformTrialItem) => void;
}) {
  const totalSubmitted = trials.reduce((sum, t) => sum + (t.submitted || 0), 0);
  const totalParticipants = trials.reduce((sum, t) => sum + (t.participants || 0), 0);

  return (
    <PlatformDrawer
      isOpen
      onClose={onClose}
      title={`Doanh nghiệp do ${mentor.fullName} phụ trách`}
      subtitle={mentor.email}
      icon={Users}
      badge={
        <span className="pa-tr-pill is-accent" style={{ fontWeight: 600 }}>
          {trials.length} doanh nghiệp
        </span>
      }
      width={580}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontSize: 13, color: 'var(--pa-ink-2)' }}>
            Tổng cộng: <strong>{trials.length}</strong> doanh nghiệp · <strong>{totalSubmitted}/{totalParticipants}</strong> bài thi
          </span>
          <button type="button" className="pa-btn-neutral" onClick={onClose}>
            Đóng
          </button>
        </div>
      }
    >
      <div className="pa-tr-drawer-stack">
        <div className="pa-tr-drawer-metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="pa-tr-metric-box">
            <span>Doanh nghiệp</span>
            <strong>{trials.length}</strong>
          </div>
          <div className="pa-tr-metric-box">
            <span>Bài đã nộp</span>
            <strong>{totalSubmitted}</strong>
          </div>
          <div className="pa-tr-metric-box">
            <span>Tổng nhân sự</span>
            <strong>{totalParticipants}</strong>
          </div>
        </div>

        <div className="pa-tr-drawer-heading" style={{ marginTop: 8 }}>
          Danh sách doanh nghiệp đang thẩm định ({trials.length})
        </div>

        <div className="pa-tr-mentor-trials-list">
          {trials.map((t) => {
            const pct = Math.min(100, Math.round((t.submitted / Math.max(1, t.participants)) * 100));
            const stage = ADMIN_STAGE[t.stage];
            return (
              <div key={t.organizationId} className="pa-tr-mentor-trial-item">
                <div className="pa-tr-mentor-trial-head">
                  <div className="pa-tr-mentor-trial-org">
                    <CompanyAvatar name={t.organizationName} size={32} />
                    <div className="pa-tr-mentor-trial-name">{t.organizationName}</div>
                  </div>
                  <span className={`pa-tr-pill is-${stage.tone}`}>
                    {stage.label}
                  </span>
                </div>

                <div className="pa-tr-mentor-trial-progress">
                  <div className="pa-tr-progress-top" style={{ fontSize: 12 }}>
                    <span>{t.submitted} / {t.participants} bài đã nộp</span>
                    <strong>{pct}%</strong>
                  </div>
                  <div className="pa-tr-progress-track" style={{ height: 5 }}>
                    <div
                      className={`pa-tr-progress-fill ${pct >= 100 ? 'is-complete' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="pa-tr-mentor-trial-dates">
                  <div className="pa-tr-date-line" style={{ fontSize: 12 }}>
                    <Calendar size={13} aria-hidden="true" />
                    <span>Hạn: {formatDateTimePlain(t.testDeadline)}</span>
                  </div>
                </div>

                <div className="pa-tr-mentor-trial-actions">
                  <button
                    type="button"
                    className="pa-btn-accent-subtle inline-flex items-center gap-1"
                    onClick={() => onSelectTrial(t)}
                  >
                    <span>Xem hồ sơ thẩm định</span>
                    <ExternalLink size={12} aria-hidden="true" />
                  </button>
                  <Link
                    to={`/platform/organizations/${t.organizationId}`}
                    className="pa-tr-org-link-btn"
                    title="Mở hồ sơ tổ chức"
                  >
                    <span>Tổ chức 360</span>
                    <ExternalLink size={12} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PlatformDrawer>
  );
}
