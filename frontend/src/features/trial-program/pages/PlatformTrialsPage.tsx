import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useAssignMentor,
  useCreateMentor,
  useMentors,
  usePlatformTrials,
} from '@/hooks/use-trial-program';
import type { MentorItem, PlatformTrialItem } from '@/services/trial-program.service';
import { LoadError } from '@/features/platform/components/pulse-ui';
import { errorMessage, initials } from '@/features/platform/components/pulse-format';
import { PlatformDrawer } from '@/features/platform/components/PlatformDrawer';
import { PlatformTrialsSkeleton } from './PlatformTrialsSkeleton';
import { MENTOR_MAX_ORGANIZATIONS, isTrialLearning, trialNeedsMentor } from '../lib/trial-mentor';
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  ExternalLink,
  FileText,
  FlaskConical,
  GraduationCap,
  Mail,
  RefreshCw,
  Search,
  User,
  UserPlus,
  UserX,
  Users,
  X,
} from 'lucide-react';

type SurveyStatus = 'TAKING' | 'REPORTED' | 'SETUP';
type SurveyTab = SurveyStatus | 'ALL';
type LearningTab = 'ALL' | 'NO_MENTOR' | 'WAITING';

const SURVEY_TABS: readonly { key: SurveyTab; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'TAKING', label: 'Đang làm bài' },
  { key: 'REPORTED', label: 'Đã có báo cáo' },
  { key: 'SETUP', label: 'Chưa gửi yêu cầu' },
];

const LEARNING_TABS: readonly { key: LearningTab; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'NO_MENTOR', label: 'Chưa có mentor' },
  { key: 'WAITING', label: 'Có bài chờ chấm' },
];

/** The survey phase only: the multiple choice is scored by the system, so the mentor does not change it. */
const SURVEY_STATUS: Record<SurveyStatus, { label: string; tone: 'neutral' | 'warn' | 'ok' }> = {
  TAKING: { label: 'Đang làm bài', tone: 'warn' },
  REPORTED: { label: 'Đã có báo cáo', tone: 'ok' },
  SETUP: { label: 'Chưa gửi yêu cầu', tone: 'neutral' },
};

function surveyStatusOf(t: PlatformTrialItem): SurveyStatus {
  if (t.stage === 'REPORTED') return 'REPORTED';
  return t.stage === 'SETUP' ? 'SETUP' : 'TAKING';
}

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

/** Deadline warning while employees are still taking the survey. */
function getDeadlineStatus(t: PlatformTrialItem) {
  if (surveyStatusOf(t) !== 'TAKING' || !t.testDeadline) return null;
  const left = new Date(t.testDeadline).getTime() - Date.now();
  if (Number.isNaN(left)) return null;
  if (left < 0) return { label: 'Quá hạn nộp bài', tone: 'bad' as const };
  if (left <= 48 * 3600 * 1000) return { label: 'Còn dưới 48 giờ', tone: 'warn' as const };
  return null;
}

const isLearning = isTrialLearning;
const needsMentor = trialNeedsMentor;

/** The mentor can be set or changed before the report; after it, only set once (the backend refuses a change). */
function canAssignMentor(t: PlatformTrialItem) {
  return t.stage === 'REQUESTED' || t.stage === 'ASSIGNED' || needsMentor(t);
}

/** Learning rows that need the admin first: assignments nobody can grade, then no mentor, then waiting work. */
function learningRank(t: PlatformTrialItem) {
  const waiting = t.waitingFinals ?? 0;
  if (!t.mentorUserId && waiting > 0) return 0;
  if (!t.mentorUserId) return 1;
  return waiting > 0 ? 2 : 3;
}

function getWorkloadLabel(activeTrials: number, status?: string) {
  if (status && status !== 'ACTIVE') return { label: 'Đã khóa', tone: 'is-locked' };
  if (activeTrials === 0) return { label: 'Đang rảnh', tone: 'is-free' };
  if (activeTrials >= MENTOR_MAX_ORGANIZATIONS) return { label: 'Đã đủ', tone: 'is-high' };
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
 * PA-14: Dùng thử & mentor — tiến độ khảo sát của tổ chức dùng thử và mentor chấm bài học
 */
/** PA-14: survey progress of the trial organizations. */
export function PlatformTrialsPage() {
  return <TrialsConsole view="survey" />;
}

/** PA-17: organizations that learn, the mentor who grades their end-of-level assignments, and the mentor team. */
export function PlatformMentorsPage() {
  return <TrialsConsole view="mentors" />;
}

function TrialsConsole({ view }: { view: 'survey' | 'mentors' }) {
  const trials = usePlatformTrials();
  const mentors = useMentors();

  const [tab, setTab] = useState<SurveyTab>('ALL');
  const [learningTab, setLearningTab] = useState<LearningTab>('ALL');
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
  const learningSectionRef = useRef<HTMLElement | null>(null);

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

  // Survey phase
  const surveyCounts = useMemo(() => {
    const counts: Record<SurveyTab, number> = { ALL: trialsList.length, TAKING: 0, REPORTED: 0, SETUP: 0 };
    for (const t of trialsList) counts[surveyStatusOf(t)] += 1;
    return counts;
  }, [trialsList]);
  const takingTotals = useMemo(() => {
    const taking = trialsList.filter((t) => surveyStatusOf(t) === 'TAKING');
    return {
      submitted: taking.reduce((sum, t) => sum + (t.submitted || 0), 0),
      participants: taking.reduce((sum, t) => sum + (t.participants || 0), 0),
      urgent: taking.filter((t) => getDeadlineStatus(t) !== null).length,
    };
  }, [trialsList]);
  // Employees with results: participants of the trials whose report is published.
  const reportedParticipants = useMemo(
    () => trialsList.filter((t) => t.stage === 'REPORTED').reduce((sum, t) => sum + (t.participants || 0), 0),
    [trialsList],
  );

  const activeMentors = useMemo(
    () => mentorsList.filter((m) => m.status === 'ACTIVE'),
    [mentorsList],
  );
  // Free = no course final waiting for the mentor; busy = at least one.
  const freeMentors = useMemo(
    () => activeMentors.filter((m) => (m.waitingFinals || 0) === 0),
    [activeMentors],
  );
  const busyMentors = useMemo(
    () => activeMentors.filter((m) => (m.waitingFinals || 0) > 0),
    [activeMentors],
  );
  const mentorTrialsMap = useMemo(() => {
    const map = new Map<string, PlatformTrialItem[]>();
    for (const t of trialsList) {
      if (t.mentorUserId && !t.converted) {
        const list = map.get(t.mentorUserId) || [];
        list.push(t);
        map.set(t.mentorUserId, list);
      }
    }
    return map;
  }, [trialsList]);
  const maxMentorLoad = MENTOR_MAX_ORGANIZATIONS;
  const fullMentors = useMemo(
    () => activeMentors.filter((m) => (m.activeTrials || 0) >= MENTOR_MAX_ORGANIZATIONS),
    [activeMentors],
  );

  const selectedMentorName = useMemo(
    () => mentorsList.find((m) => m.userId === mentorFilter)?.fullName ?? '',
    [mentorsList, mentorFilter],
  );

  const filteredItems = useMemo(() => {
    let result = trialsList;

    if (tab !== 'ALL') {
      result = result.filter((t) => surveyStatusOf(t) === tab);
    }
    if (slaFilter === 'URGENT') {
      result = result.filter((t) => getDeadlineStatus(t) !== null);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.organizationName.toLowerCase().includes(q) ||
          t.ownerName.toLowerCase().includes(q) ||
          t.ownerEmail.toLowerCase().includes(q) ||
          (t.requestNote && t.requestNote.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [trialsList, tab, slaFilter, search]);

  const hasFilters = Boolean(search || slaFilter !== 'ALL' || tab !== 'ALL');

  const resetFilters = () => {
    setSearch('');
    setSlaFilter('ALL');
    setTab('ALL');
  };

  const toggleSurveyTab = (target: SurveyTab) => {
    setTab((prev) => (prev === target ? 'ALL' : target));
  };

  // Learning phase
  const learningList = useMemo(
    () =>
      trialsList
        .filter(isLearning)
        .slice()
        .sort((a, b) => learningRank(a) - learningRank(b) || a.organizationName.localeCompare(b.organizationName, 'vi')),
    [trialsList],
  );
  const learningCounts = useMemo(
    () => ({
      ALL: learningList.length,
      NO_MENTOR: learningList.filter((t) => !t.mentorUserId).length,
      WAITING: learningList.filter((t) => (t.waitingFinals ?? 0) > 0).length,
    }),
    [learningList],
  );
  const waitingTotals = useMemo(
    () => ({
      all: learningList.reduce((sum, t) => sum + (t.waitingFinals ?? 0), 0),
      unattended: learningList.filter((t) => !t.mentorUserId).reduce((sum, t) => sum + (t.waitingFinals ?? 0), 0),
    }),
    [learningList],
  );
  const filteredLearning = useMemo(() => {
    let result = learningList;
    if (learningTab === 'NO_MENTOR') result = result.filter((t) => !t.mentorUserId);
    if (learningTab === 'WAITING') result = result.filter((t) => (t.waitingFinals ?? 0) > 0);
    if (mentorFilter) result = result.filter((t) => t.mentorUserId === mentorFilter);
    return result;
  }, [learningList, learningTab, mentorFilter]);

  const showLearning = (target: LearningTab) => {
    setLearningTab((prev) => (prev === target ? 'ALL' : target));
    learningSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          <h1>{view === 'survey' ? 'Đánh giá dùng thử' : 'Mentor'}</h1>
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
          {view === 'mentors' && (
            <button
              type="button"
              className="btn btn-primary btn-small inline-flex items-center gap-1.5"
              onClick={() => setCreateMentorOpen(true)}
            >
              <UserPlus size={14} aria-hidden="true" />
              <span>Thêm mentor</span>
            </button>
          )}
        </div>
      </header>

      {isLoadingPage && <PlatformTrialsSkeleton />}
      {!isLoadingPage && trials.error && <LoadError error={trials.error} />}

      {!isLoadingPage && !trials.error && (
        <>
          {view === 'survey' && (
          <div className="pa-ov-kpi-grid pa-tr-kpi-compact pa-kpi-2" role="group" aria-label="Tổng hợp bài khảo sát">
            <button
              type="button"
              className="pa-ov-kpi-card pa-tr-kpi-btn is-tone-amber"
              aria-pressed={tab === 'TAKING'}
              onClick={() => toggleSurveyTab('TAKING')}
            >
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Đang làm khảo sát</span>
                <span className="pa-kpi-icon is-amber" aria-hidden="true">
                  <Clock size={16} />
                </span>
              </div>
              <div className="pa-tr-kpi-val-row">
                <span className="pa-ov-kpi-val">{surveyCounts.TAKING}</span>
                {takingTotals.urgent > 0 ? (
                  <span className="pa-tr-pill is-warn" style={{ fontSize: 12, padding: '2px 8px' }}>
                    {takingTotals.urgent} tổ chức sắp hoặc đã quá hạn
                  </span>
                ) : (
                  <span className="pa-tr-kpi-sub-neutral">
                    {takingTotals.submitted}/{takingTotals.participants} nhân viên đã nộp bài
                  </span>
                )}
              </div>
            </button>

            <button
              type="button"
              className="pa-ov-kpi-card pa-tr-kpi-btn is-tone-green"
              aria-pressed={tab === 'REPORTED'}
              onClick={() => toggleSurveyTab('REPORTED')}
            >
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Đã có báo cáo</span>
                <span className="pa-kpi-icon is-jade" aria-hidden="true">
                  <CheckCircle2 size={16} />
                </span>
              </div>
              <div className="pa-tr-kpi-val-row">
                <span className="pa-ov-kpi-val">{surveyCounts.REPORTED}</span>
                <span className="pa-tr-kpi-sub-neutral">{reportedParticipants} nhân viên có kết quả</span>
              </div>
            </button>

          </div>
          )}

          {view === 'mentors' && (
          <div className="pa-ov-kpi-grid pa-tr-kpi-compact pa-kpi-3" role="group" aria-label="Tổng hợp mentor">
            <button
              type="button"
              className="pa-ov-kpi-card pa-tr-kpi-btn is-tone-orange"
              aria-pressed={learningTab === 'NO_MENTOR'}
              onClick={() => showLearning('NO_MENTOR')}
            >
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Chưa có mentor</span>
                <span className="pa-kpi-icon is-orange" aria-hidden="true">
                  <UserX size={16} />
                </span>
              </div>
              <div className="pa-tr-kpi-val-row">
                <span className="pa-ov-kpi-val">{learningCounts.NO_MENTOR}</span>
                {waitingTotals.unattended > 0 ? (
                  <span className="pa-tr-pill is-bad" style={{ fontSize: 12, padding: '2px 8px' }}>
                    {waitingTotals.unattended} bài nộp chưa ai chấm được
                  </span>
                ) : (
                  <span className="pa-tr-kpi-sub-neutral">tổ chức đang học chưa có mentor</span>
                )}
              </div>
            </button>

            <button
              type="button"
              className="pa-ov-kpi-card pa-tr-kpi-btn is-tone-sky"
              aria-pressed={learningTab === 'WAITING'}
              onClick={() => showLearning('WAITING')}
            >
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Bài cuối cấp chờ chấm</span>
                <span className="pa-kpi-icon is-sky" aria-hidden="true">
                  <ClipboardCheck size={16} />
                </span>
              </div>
              <div className="pa-tr-kpi-val-row">
                <span className="pa-ov-kpi-val">{waitingTotals.all}</span>
                <span className="pa-tr-kpi-sub-neutral">ở {learningCounts.WAITING} tổ chức đang học</span>
              </div>
            </button>
            <button
              type="button"
              className="pa-ov-kpi-card pa-tr-kpi-btn is-tone-green"
              aria-pressed={false}
              onClick={() => mentorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <div className="pa-ov-kpi-top">
                <span className="pa-ov-kpi-label">Mentor</span>
                <span className="pa-kpi-icon is-jade" aria-hidden="true">
                  <Users size={16} />
                </span>
              </div>
              <div className="pa-tr-kpi-val-row">
                <span className="pa-ov-kpi-val">{mentorsList.length}</span>
                <span className="pa-tr-kpi-sub-neutral">
                  {freeMentors.length} rảnh · {busyMentors.length} có bài chờ · {fullMentors.length} đã đủ{' '}
                  {MENTOR_MAX_ORGANIZATIONS}
                  {mentorsList.length > activeMentors.length ? ` · ${mentorsList.length - activeMentors.length} đã khóa` : ''}
                </span>
              </div>
            </button>
          </div>
          )}

          {/* Part 1: the survey (multiple choice scored by the system, no mentor) */}
          {view === 'survey' && (
          <section className="pa-ov-panel" aria-labelledby="trials-survey-heading">
            <div className="pa-ov-panel-head" style={{ marginBottom: 12 }}>
              <div>
                <h2 id="trials-survey-heading" className="pa-ov-panel-title">
                  Bài khảo sát
                </h2>
                <p className="pa-ov-panel-sub">
                  Nhân viên làm bài trắc nghiệm có giám sát; hệ thống tự chấm và ra báo cáo khi mọi người nộp xong hoặc hết hạn.
                </p>
              </div>
            </div>

            <div className="pa-tr-toolbar">
              <div className="pa-tr-toolbar-row">
                <div className="pa-ov-tablist" role="tablist" aria-label="Lọc theo tiến độ khảo sát">
                  {SURVEY_TABS.map((t) => {
                    const isActive = tab === t.key;
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
                        <span className="pa-tr-tab-count">{surveyCounts[t.key]}</span>
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
                    aria-label="Lọc theo hạn nộp bài"
                    value={slaFilter}
                    onChange={(e) => setSlaFilter(e.target.value as 'ALL' | 'URGENT')}
                    className="pa-tr-select"
                  >
                    <option value="ALL">Mọi thời hạn</option>
                    <option value="URGENT">Sắp hết hạn hoặc quá hạn</option>
                  </select>
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
                  Không có doanh nghiệp dùng thử phù hợp với bộ lọc hiện tại.
                </p>
                {hasFilters && (
                  <button type="button" className="btn btn-outline btn-small" onClick={resetFilters}>
                    Xem tất cả doanh nghiệp
                  </button>
                )}
              </div>
            ) : (
              <div tabIndex={0} role="region" aria-label="Bảng bài khảo sát" className="pa-tr-table-scroll">
                <table className="pa-tr-table">
                  <thead>
                    <tr>
                      <th style={{ width: '34%' }}>Tổ chức</th>
                      <th style={{ width: '22%' }}>Đã nộp bài</th>
                      <th style={{ width: '18%' }}>Hạn nộp</th>
                      <th style={{ width: '14%' }}>Trạng thái</th>
                      <th style={{ width: '12%' }} className="is-right">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((t) => {
                      const status = surveyStatusOf(t);
                      const statusMeta = SURVEY_STATUS[status];
                      const deadline = getDeadlineStatus(t);
                      const pct = Math.min(100, Math.round((t.submitted / Math.max(1, t.participants)) * 100));
                      const notSubmitted = Math.max(0, t.participants - t.submitted);

                      return (
                        <tr key={t.organizationId}>
                          <td>
                            <div className="pa-tr-org-cell">
                              <CompanyAvatar name={t.organizationName} size={38} />
                              <div className="pa-tr-org-info">
                                <Link to={`/platform/organizations/${t.organizationId}`} className="pa-tr-org-name">
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
                                  {t.submitted} / {t.participants} người
                                </strong>
                                <span>{pct}%</span>
                              </div>
                              <div className="pa-tr-progress-track" aria-hidden="true">
                                <div
                                  className={`pa-tr-progress-fill ${pct >= 100 ? 'is-complete' : ''}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`pa-tr-progress-sub ${status === 'REPORTED' ? 'is-done' : ''}`}>
                                {status === 'REPORTED'
                                  ? notSubmitted > 0
                                    ? `Hết hạn, ${notSubmitted} người không nộp`
                                    : 'Mọi người đã nộp'
                                  : status === 'TAKING'
                                    ? `${notSubmitted} người chưa nộp`
                                    : 'Chưa gửi yêu cầu khảo sát'}
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
                              <span className={`pa-tr-pill is-${statusMeta.tone}`}>
                                <span className="pa-tr-pill-dot" aria-hidden="true" />
                                <span>{statusMeta.label}</span>
                              </span>
                              {deadline && (
                                <span className={`pa-tr-pill is-${deadline.tone}`} style={{ fontSize: 12, padding: '1px 6px' }}>
                                  {deadline.label}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="is-right">
                            <div className="pa-tr-actions-cell">
                              <button type="button" className="pa-tr-detail-btn" onClick={() => openTrialDrawer(t, false)}>
                                Chi tiết
                              </button>
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
          )}

          {view === 'mentors' && (
          <>
          {/* Part 2: after the report the employees learn; the assigned mentor grades the end-of-level assignments */}
          <section ref={learningSectionRef} className="pa-ov-panel" aria-labelledby="trials-learning-heading">
            <div className="pa-ov-panel-head" style={{ marginBottom: 12 }}>
              <div>
                <h2 id="trials-learning-heading" className="pa-ov-panel-title">
                  Mentor chấm bài học
                </h2>
                <p className="pa-ov-panel-sub">
                  Tổ chức đã có báo cáo: nhân viên học 6 lĩnh vực × 3 cấp và nộp bài cuối cấp. Ở tổ chức dùng thử chỉ mentor được giao mới chấm được, nên tổ chức nào cũng cần một mentor.
                </p>
              </div>
            </div>

            <div className="pa-tr-toolbar">
              <div className="pa-tr-toolbar-row">
                <div className="pa-ov-tablist" role="tablist" aria-label="Lọc tổ chức đang học">
                  {LEARNING_TABS.map((t) => {
                    const isActive = learningTab === t.key;
                    const count = learningCounts[t.key];
                    return (
                      <button
                        key={t.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className="pa-ov-tab pa-tr-tab-btn"
                        onClick={() => setLearningTab(t.key)}
                      >
                        <span>{t.label}</span>
                        <span className={`pa-tr-tab-count ${t.key === 'NO_MENTOR' && count > 0 ? 'is-urgent' : ''}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Mentor filter */}
                <div className="pa-tr-mentor-dropdown-wrap" ref={mentorDropdownRef}>
                  <button
                    type="button"
                    className={`pa-tr-select-btn ${mentorFilter ? 'is-active' : ''}`}
                    onClick={() => setMentorDropdownOpen((prev) => !prev)}
                    aria-expanded={mentorDropdownOpen}
                    aria-haspopup="listbox"
                    aria-label={selectedMentorName ? `Mentor: ${selectedMentorName}` : 'Lọc theo mentor'}
                  >
                    <Users size={15} aria-hidden="true" />
                    <span className="pa-tr-select-btn-text">{selectedMentorName || 'Tất cả mentor'}</span>
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
                      title="Bỏ lọc mentor"
                      aria-label="Bỏ lọc mentor"
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
                        <span>Tất cả mentor ({mentorsList.length})</span>
                        {!mentorFilter && <Check size={14} aria-hidden="true" />}
                      </button>

                      {[
                        { key: 'busy', label: `CÓ BÀI CHỜ CHẤM (${busyMentors.length})`, dot: 'is-busy', items: busyMentors },
                        { key: 'free', label: `ĐANG RẢNH (${freeMentors.length})`, dot: 'is-free', items: freeMentors },
                      ]
                        .filter((group) => group.items.length > 0)
                        .map((group) => (
                          <div key={group.key}>
                            <div className="pa-tr-menu-header">
                              <span className={`pa-tr-strip-dot ${group.dot}`} aria-hidden="true" />
                              <span>{group.label}</span>
                            </div>
                            {group.items.map((m) => (
                              <button
                                key={m.userId}
                                type="button"
                                className={`pa-tr-mentor-menu-item ${mentorFilter === m.userId ? 'is-selected' : ''}`}
                                aria-label={`Lọc theo mentor ${m.fullName} (${m.email})`}
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
                                <span
                                  className={`pa-tr-pill ${(m.waitingFinals ?? 0) > 0 ? 'is-info' : 'is-ok'}`}
                                  style={{ fontSize: 12, padding: '2px 7px' }}
                                >
                                  {m.activeTrials} DN
                                </span>
                              </button>
                            ))}
                          </div>
                        ))}

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
            </div>

            {filteredLearning.length === 0 ? (
              <div className="pa-ov-empty-state" style={{ minHeight: 140 }}>
                <div className="pa-ov-empty-icon" aria-hidden="true">
                  <GraduationCap size={22} />
                </div>
                <p className="pa-ov-empty-text">
                  {learningList.length === 0
                    ? 'Chưa có tổ chức dùng thử nào có báo cáo, nên chưa có nhân viên học.'
                    : 'Không có tổ chức nào khớp bộ lọc.'}
                </p>
              </div>
            ) : (
              <div tabIndex={0} role="region" aria-label="Bảng mentor chấm bài học" className="pa-tr-table-scroll">
                <table className="pa-tr-table">
                  <thead>
                    <tr>
                      <th style={{ width: '32%' }}>Tổ chức</th>
                      <th style={{ width: '20%' }}>Học</th>
                      <th style={{ width: '16%' }}>Bài cuối cấp chờ chấm</th>
                      <th style={{ width: '20%' }}>Mentor</th>
                      <th style={{ width: '12%' }} className="is-right">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLearning.map((t) => {
                      const waiting = t.waitingFinals ?? 0;
                      const learners = t.learners ?? 0;
                      return (
                        <tr key={t.organizationId}>
                          <td>
                            <div className="pa-tr-org-cell">
                              <CompanyAvatar name={t.organizationName} size={38} />
                              <div className="pa-tr-org-info">
                                <Link to={`/platform/organizations/${t.organizationId}`} className="pa-tr-org-name">
                                  {t.organizationName}
                                </Link>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div style={{ display: 'grid', gap: 2, fontSize: 13.5 }}>
                              <strong>{t.coursesPurchased ?? 0} khóa đã mua</strong>
                              <span style={{ color: 'var(--pa-ink-2)', fontSize: 12.5 }}>
                                {learners > 0 ? `${learners} nhân viên đang học` : 'Chưa ai bắt đầu học'}
                              </span>
                            </div>
                          </td>

                          <td>
                            {waiting > 0 ? (
                              <span
                                className={`pa-tr-pill ${t.mentorUserId ? 'is-info' : 'is-bad'}`}
                                title={t.mentorUserId ? undefined : 'Chưa có mentor nên chưa ai chấm được các bài này.'}
                              >
                                {waiting} bài
                              </span>
                            ) : (
                              <span style={{ fontSize: 13, color: 'var(--pa-ink-3)' }}>Không có</span>
                            )}
                          </td>

                          <td>
                            <div className="pa-tr-mentor-cell">
                              {t.mentorName ? (
                                <div className="pa-tr-mentor-person">
                                  <span className="pa-tr-avatar" aria-hidden="true">
                                    {initials(t.mentorName)}
                                  </span>
                                  <span>{t.mentorName}</span>
                                </div>
                              ) : (
                                <>
                                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--pa-amber)' }}>
                                    Chưa phân công
                                  </span>
                                  <button type="button" className="pa-tr-assign-btn" onClick={() => openTrialDrawer(t, true)}>
                                    Phân công
                                  </button>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="is-right">
                            <div className="pa-tr-actions-cell">
                              <button type="button" className="pa-tr-detail-btn" onClick={() => openTrialDrawer(t, false)}>
                                Chi tiết
                              </button>
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
                  Mentor
                </h2>
                <p className="pa-ov-panel-sub">
                  {activeMentors.length} mentor đang hoạt động. Mentor chấm bài cuối cấp (assignment mỗi cấp độ của từng lĩnh vực). Ở doanh nghiệp dùng thử, chỉ mentor được giao mới chấm được.
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
                  Chưa có tài khoản Mentor nào trong hệ thống. Bấm "Thêm mentor" ở góc trên để thêm mentor đầu tiên.
                </p>
              </div>
            ) : (
              <div
                className="pa-tr-mentor-table-wrap"
                tabIndex={0}
                role="region"
                aria-label="Danh sách mentor"
              >
                <table className="pa-tr-mentor-table">
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>Mentor</th>
                      <th style={{ width: '25%' }}>Trạng thái</th>
                      <th style={{ width: '33%' }}>Tổ chức phụ trách</th>
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
                                <strong>Phụ trách {m.activeTrials}/{MENTOR_MAX_ORGANIZATIONS} doanh nghiệp</strong>
                                {loadMeta.tone === 'is-high' && <span>{loadMeta.label}</span>}
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
                                      ? (m.waitingFinals || 0) === 0
                                        ? 'is-ok'
                                        : 'is-info'
                                      : 'is-neutral'
                                    }`}
                                >
                                  <span className="pa-tr-pill-dot" aria-hidden="true" />
                                  <span>
                                    {m.status === 'ACTIVE'
                                      ? (m.waitingFinals || 0) === 0
                                        ? 'Đang rảnh'
                                        : `${m.waitingFinals} bài chờ chấm`
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
                                  <strong>Đang phụ trách {assignedTrials.length} doanh nghiệp</strong>
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
                                      title={t.organizationName}
                                    >
                                      <span className="pa-tr-org-bullet" aria-hidden="true">•</span>
                                      <span className="pa-tr-mentor-org-truncate">{t.organizationName}</span>
                                      {/* What the mentor has to do there: end-of-level assignments waiting (the survey is not theirs). */}
                                      {(t.waitingFinals ?? 0) > 0 && (
                                        <span className="pa-tr-mentor-org-pct">({t.waitingFinals} bài chờ chấm)</span>
                                      )}
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
                                learningSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }}
                            >
                              {isSelected ? 'Đang lọc' : 'Xem tổ chức'}
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
  const stageMeta = SURVEY_STATUS[surveyStatusOf(trial)];
  const activeMentors = mentors.filter((m) => m.status === 'ACTIVE');
  const canAssign = canAssignMentor(trial);

  const handleAssign = () => {
    if (!selectedMentorId || selectedMentorId === trial.mentorUserId) return;
    assign.mutate(
      { organizationId: trial.organizationId, mentorUserId: selectedMentorId },
      {
        onSuccess: () => {
          toast.success(`Đã phân công mentor cho ${trial.organizationName}`);
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
            <span>Mở hồ sơ tổ chức</span>
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
                Ghi chú từ tổ chức
              </span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.55 }}>{trial.requestNote}</p>
          </div>
        )}

        {/* Metrics */}
        <div className="pa-tr-drawer-metrics">
          <div className="pa-tr-metric-box">
            <span>Nhân viên</span>
            <strong>{trial.participants}</strong>
          </div>
          <div className="pa-tr-metric-box">
            <span>Đã nộp khảo sát</span>
            <strong style={{ color: 'var(--pa-accent-solid)' }}>{trial.submitted}</strong>
          </div>
          <div className="pa-tr-metric-box">
            <span>Bài cuối cấp chờ chấm</span>
            <strong style={{ color: 'var(--pa-live)' }}>{trial.waitingFinals ?? 0}</strong>
          </div>
        </div>

        {/* Timeline */}
        <div className="pa-tr-drawer-box">
          <div className="pa-tr-drawer-heading">Thời gian</div>
          <div className="pa-tr-drawer-row">
            <span style={{ color: 'var(--pa-ink-2)' }}>Bắt đầu dùng thử:</span>
            <strong>{formatDateTimePlain(trial.startedAt)}</strong>
          </div>
          <div className="pa-tr-drawer-row">
            <span style={{ color: 'var(--pa-ink-2)' }}>Hạn nộp bài:</span>
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
            <span>Mentor chấm bài học</span>
            {trial.mentorName && (
              <span style={{ color: 'var(--pa-live)' }}>Hiện tại: {trial.mentorName}</span>
            )}
          </div>

          {!canAssign ? (
            <p style={{ margin: 0, color: 'var(--pa-ink-2)', lineHeight: 1.5 }}>
              {trial.converted
                ? 'Tổ chức đã lên gói chính thức nên không cần mentor nữa.'
                : trial.stage === 'REPORTED'
                ? 'Báo cáo đã công bố. Mentor đã phân công được giữ nguyên để chấm bài cuối cấp.'
                : 'Tổ chức đang thiết lập danh sách và chưa gửi yêu cầu khảo sát.'}
            </p>
          ) : activeMentors.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--pa-ink-2)', lineHeight: 1.5 }}>
              Chưa có mentor nào đang hoạt động. Thêm mentor trước khi phân công.
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
                    // Full = already 5 other organizations; the current mentor of this one stays selectable.
                    const isFull = (m.activeTrials || 0) >= MENTOR_MAX_ORGANIZATIONS && m.userId !== trial.mentorUserId;
                    return (
                      <label
                        key={m.userId}
                        className={`pa-tr-mentor-radio ${checked ? 'is-selected' : ''} ${isRecommended ? 'is-recommended' : ''
                          }`}
                        style={isFull ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
                      >
                        <div className="pa-tr-mentor-radio-left">
                          <input
                            type="radio"
                            name="assign-mentor"
                            value={m.userId}
                            checked={checked}
                            disabled={isFull}
                            autoFocus={focusAssign && idx === 0}
                            onChange={() => setSelectedMentorId(m.userId)}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--pa-ink)' }}>{m.fullName}</div>
                            <div style={{ fontSize: 13, color: 'var(--pa-ink-2)' }}>{m.email}</div>
                          </div>
                        </div>
                        <span className={`pa-tr-pill ${isFull ? 'is-neutral' : isRecommended ? 'is-ok' : 'is-info'}`}>
                          {isFull
                            ? `Đã đủ ${MENTOR_MAX_ORGANIZATIONS} tổ chức`
                            : isRecommended
                              ? 'Đang rảnh'
                              : `Phụ trách ${m.activeTrials}/${MENTOR_MAX_ORGANIZATIONS} tổ chức${m.waitingFinals ? ` · ${m.waitingFinals} bài chờ chấm` : ''}`}
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
                    ? 'Đổi mentor'
                    : 'Xác nhận phân công'}
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
          toast.success(`Đã tạo tài khoản mentor: ${m.email}`);
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
      title="Thêm mentor mới"
      icon={UserPlus}
      subtitle="Tạo tài khoản mentor để chấm bài tự luận"
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
  const totalWaiting = trials.reduce((sum, t) => sum + (t.waitingFinals ?? 0), 0);
  const totalLearners = trials.reduce((sum, t) => sum + (t.learners ?? 0), 0);

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
            Tổng cộng: <strong>{trials.length}</strong> doanh nghiệp · <strong>{totalWaiting}</strong> bài cuối cấp chờ chấm
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
            <span>Nhân viên đang học</span>
            <strong>{totalLearners}</strong>
          </div>
          <div className="pa-tr-metric-box">
            <span>Bài chờ chấm</span>
            <strong>{totalWaiting}</strong>
          </div>
        </div>

        <div className="pa-tr-drawer-heading" style={{ marginTop: 8 }}>
          Doanh nghiệp được giao ({trials.length})
        </div>

        <div className="pa-tr-mentor-trials-list">
          {trials.map((t) => {
            const stage = SURVEY_STATUS[surveyStatusOf(t)];
            const waiting = t.waitingFinals ?? 0;
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

                <div className="pa-tr-mentor-trial-dates" style={{ fontSize: 12.5, color: 'var(--pa-ink-2)' }}>
                  {t.converted
                    ? 'Đã lên gói chính thức: bài vào hàng chờ chung'
                    : `${t.coursesPurchased ?? 0} khóa đã mua · ${t.learners ?? 0} nhân viên đang học · ${waiting} bài chờ chấm`}
                </div>

                <div className="pa-tr-mentor-trial-actions">
                  <button
                    type="button"
                    className="pa-btn-accent-subtle inline-flex items-center gap-1"
                    onClick={() => onSelectTrial(t)}
                  >
                    <span>Xem chi tiết</span>
                    <ExternalLink size={12} aria-hidden="true" />
                  </button>
                  <Link
                    to={`/platform/organizations/${t.organizationId}`}
                    className="pa-tr-org-link-btn"
                    title="Mở hồ sơ tổ chức"
                  >
                    <span>Hồ sơ tổ chức</span>
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
