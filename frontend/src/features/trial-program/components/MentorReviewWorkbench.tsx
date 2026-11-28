import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardCheck,
  FileText,
  Filter,
  GraduationCap,
  History,
  Info,
  ListFilter,
  MessageSquarePlus,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useDecidePulseFinal,
  useMentorEnterprises,
  usePulseFinalReviews,
  useRecordPulseSupport,
  useRefreshPulseFinalAi,
} from '@/hooks/use-pulse';
import type {
  PulseCriterion,
  PulseCriterionEvaluationInput,
  PulseAiDetailEvidenceKey,
  PulseDecision,
  PulseFinalReviewItem,
  PulseReviewStatus,
  PulseSupportAction,
} from '@/services/pulse.service';
import { getAvatarColor, initials } from '@/features/platform/components/pulse-format';
import { clock, formatDuration, levelName, SUPPORT_LABELS } from '@/features/pulse-employee/lib/labels';
import { RichText } from '@/features/pulse-employee/components/RichText';
import { ReviewCard } from '@/features/pulse-manager/pages/PulseFinalReviewsPage';
import { RecordingPlayer } from '@/features/pulse-manager/components/RecordingPlayer';
import { RiskTag } from '@/features/pulse-manager/components/ProctoringRiskPanel';
import { PaginationBar } from '@/features/trial-program/components/PaginationBar';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';
import { ResizeHandle, useStoredWidth } from '@/features/trial-program/components/ResizeHandle';
import {
  buildEssayGuidance,
  compileRubricFeedback,
  computeRubricStats,
  ESSAY_PASS_SCORE_PERCENT,
  essayAnnotationRanges,
  formatMentorCourseLabel,
  findCriterionEvidence,
  resolveEffectiveCriteria,
  RUBRIC_QUICK_NOTES,
  type RubricCriterionEvaluation,
} from '@/features/trial-program/lib/mentor-ai-guidance';
import { apiErrorMessage, formatDateTime } from '@/lib/utils';
import '@/features/pulse-employee/pulse-exam.css';
import '@/features/trial-program/trial-program.css';
import '@/features/trial-program/mentor-workspace.css';

type FilterStatus = 'ALL' | 'PENDING' | 'ATTENTION' | 'RETRY' | 'FLAGGED' | 'REVIEWED';
type FilterTier = 'ALL' | '1' | '2' | '3';
type SortKey = 'PRIORITY' | 'LATEST_DESC' | 'OLDEST_ASC' | 'NAME_ASC';
type EvidenceTab = 'ESSAY' | 'VIDEO' | 'CHOICE';
type ChoiceFilterMode = 'ALL' | 'WRONG';

interface WorkbenchFilterState {
  search: string;
  selectedOrg: string;
  selectedDept: string;
  selectedDomain: string;
  selectedTier: FilterTier;
  statusFilter: FilterStatus;
  sortBy: SortKey;
  page: number;
  pageSize: number;
  queueCollapsed?: boolean;
}

interface WorkbenchLocationState {
  mentorFilter?: Partial<WorkbenchFilterState>;
}

const MIN_REASON_LENGTH = 10;
const ESSAY_ANNOTATION_LABELS = {
  strength: 'Điểm làm tốt',
  improve: 'Cần chỉnh sửa',
  observation: 'Quan sát',
  missing: 'Cần đối chiếu',
};

const STATUS_PRIORITY: Record<PulseReviewStatus, number> = {
  PENDING: 0,
  FLAGGED: 1,
  DEADLINE_MISSED: 2,
  RETRY_READY: 3,
  RETRY_WAIT: 4,
  APPROVED: 5,
  NOT_YET: 6,
};

const STATUS_BADGE: Record<
  PulseReviewStatus,
  { label: string; bg: string; color: string; border: string }
> = {
  PENDING: {
    label: 'Chờ chấm điểm',
    bg: '#fffbeb',
    color: '#b45309',
    border: '#fde68a',
  },
  RETRY_WAIT: {
    label: 'Chờ mở nộp lại',
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1',
  },
  RETRY_READY: {
    label: 'Đang mở nộp lại',
    bg: '#eef2ff',
    color: '#3730a3',
    border: '#c7d2fe',
  },
  DEADLINE_MISSED: {
    label: 'Quá hạn nộp lại',
    bg: '#fff1f2',
    color: '#9f1239',
    border: '#fecdd3',
  },
  FLAGGED: {
    label: 'Cần hỗ trợ',
    bg: '#fff1f2',
    color: '#9f1239',
    border: '#fecdd3',
  },
  APPROVED: {
    label: 'Đã đạt chuẩn',
    bg: '#ecfdf5',
    color: '#065f46',
    border: '#a7f3d0',
  },
  NOT_YET: {
    label: 'Chưa đạt',
    bg: '#fef2f2',
    color: '#991b1b',
    border: '#fecaca',
  },
};

const QUICK_TEMPLATES: { label: string; text: string; decision: PulseDecision }[] = [
  {
    label: 'Đạt chuẩn thực hành',
    text: 'Minh chứng nêu rõ nguồn dữ liệu, các bước kiểm tra logic và kết luận phù hợp với cấp độ khóa học.',
    decision: 'PASSED',
  },
  {
    label: 'Thiếu số liệu kiểm chứng',
    text: 'Bài làm có cấu trúc đúng hướng nhưng thiếu số liệu hoặc minh chứng cụ thể để người khác kiểm tra lại phép tính.',
    decision: 'NOT_YET',
  },
  {
    label: 'Chưa đạt yêu cầu đề bài',
    text: 'Nội dung trả lời còn khái quát, chưa áp dụng vào tình huống thực tế và chưa nêu bước hành động tiếp theo.',
    decision: 'NOT_YET',
  },
];

const SUPPORT_OPTIONS: { action: PulseSupportAction; label: string; hint: string }[] = [
  { action: 'COACHING', label: 'Sắp xếp kèm cặp', hint: 'Bố trí buổi hướng dẫn 1 kèm 1 trước khi mở chu kỳ mới.' },
  { action: 'FRESH_CYCLE', label: 'Mở chu kỳ học mới', hint: 'Cho phép nhân viên học lại mô đun và nộp lại từ đầu.' },
  { action: 'PAUSE', label: 'Tạm dừng lộ trình', hint: 'Tạm hoãn khóa học này để ưu tiên công việc hoặc khóa khác.' },
];

const AI_DETAIL_METRICS: {
  key: Exclude<PulseAiDetailEvidenceKey, 'verdict'>;
  label: string;
  scoreKey: 'plagiarismScore' | 'aiGeneratedScore' | 'relevanceScore' | 'depthScore' | 'clarityScore';
  noteKey: 'plagiarismNote' | 'aiGeneratedNote' | 'relevanceNote' | 'depthNote' | 'clarityNote';
  invert?: boolean;
}[] = [
  { key: 'plagiarism', label: 'Nguy cơ sao chép', scoreKey: 'plagiarismScore', noteKey: 'plagiarismNote', invert: true },
  { key: 'ai', label: 'Dấu hiệu văn bản tự động', scoreKey: 'aiGeneratedScore', noteKey: 'aiGeneratedNote', invert: true },
  { key: 'relevance', label: 'Đúng trọng tâm đề bài', scoreKey: 'relevanceScore', noteKey: 'relevanceNote' },
  { key: 'depth', label: 'Chiều sâu và minh chứng', scoreKey: 'depthScore', noteKey: 'depthNote' },
  { key: 'clarity', label: 'Trình bày mạch lạc', scoreKey: 'clarityScore', noteKey: 'clarityNote' },
];

function latestSubmittedTimestamp(item: PulseFinalReviewItem): number {
  const raw = item.attempts?.[item.attempts.length - 1]?.submittedAt;
  if (!raw) return 0;
  const ts = Date.parse(raw);
  return Number.isNaN(ts) ? 0 : ts;
}

function findNextPending(
  filteredQueue: PulseFinalReviewItem[],
  allItems: PulseFinalReviewItem[],
  currentSubmissionId: string,
): PulseFinalReviewItem | null {
  const idx = filteredQueue.findIndex((i) => i.submissionId === currentSubmissionId);
  if (idx >= 0) {
    const after = filteredQueue.slice(idx + 1).find((i) => i.status === 'PENDING');
    if (after) return after;
    const before = filteredQueue.slice(0, idx).find((i) => i.status === 'PENDING');
    if (before) return before;
  }
  const anyFiltered = filteredQueue.find(
    (i) => i.status === 'PENDING' && i.submissionId !== currentSubmissionId,
  );
  if (anyFiltered) return anyFiltered;
  return allItems.find((i) => i.status === 'PENDING' && i.submissionId !== currentSubmissionId) ?? null;
}

function matchesStatusFilter(item: PulseFinalReviewItem, statusFilter: FilterStatus): boolean {
  if (statusFilter === 'PENDING') return item.status === 'PENDING';
  if (statusFilter === 'ATTENTION') {
    return (
      item.status === 'RETRY_WAIT' ||
      item.status === 'RETRY_READY' ||
      item.status === 'FLAGGED' ||
      item.status === 'DEADLINE_MISSED'
    );
  }
  if (statusFilter === 'RETRY') return item.status === 'RETRY_WAIT' || item.status === 'RETRY_READY';
  if (statusFilter === 'FLAGGED') return item.status === 'FLAGGED' || item.status === 'DEADLINE_MISSED';
  if (statusFilter === 'REVIEWED') return item.status === 'APPROVED' || item.status === 'NOT_YET';
  return true;
}

export interface MentorReviewWorkbenchProps {
  organizationId?: string;
  selectedSubmissionId?: string;
}

export function MentorReviewWorkbench({
  organizationId,
  selectedSubmissionId,
}: MentorReviewWorkbenchProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const initialFilter = (location.state as WorkbenchLocationState | null)?.mentorFilter;

  const { data, isLoading, error, refetch, isFetching } = usePulseFinalReviews({
    includeReviewed: true,
    organizationId,
  });
  const { data: enterprisesData } = useMentorEnterprises(true);

  const [search, setSearch] = useState(() => initialFilter?.search ?? '');
  const [selectedOrg, setSelectedOrg] = useState<string>(() => initialFilter?.selectedOrg ?? 'ALL');
  const [selectedDept, setSelectedDept] = useState<string>(() => initialFilter?.selectedDept ?? 'ALL');
  const [selectedDomain, setSelectedDomain] = useState<string>(() => initialFilter?.selectedDomain ?? 'ALL');
  const [selectedTier, setSelectedTier] = useState<FilterTier>(() => initialFilter?.selectedTier ?? 'ALL');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(() => initialFilter?.statusFilter ?? 'ALL');
  const [sortBy, setSortBy] = useState<SortKey>(() => initialFilter?.sortBy ?? 'PRIORITY');
  const [page, setPage] = useState(() => initialFilter?.page ?? 1);
  const [pageSize, setPageSize] = useState(() => initialFilter?.pageSize ?? 10);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [desktopQueueCollapsed, setDesktopQueueCollapsed] = useState(
    () => initialFilter?.queueCollapsed ?? false,
  );
  const [showMobileQueue, setShowMobileQueue] = useState(false);
  const [railWidth, setRailWidth] = useStoredWidth('mw-wb-rail-width');
  const [justFinishedQueue, setJustFinishedQueue] = useState(false);

  useEffect(() => {
    if (!showCriteriaModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCriteriaModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCriteriaModal]);

  const allItems = useMemo(
    () => data?.items ?? [],
    [data],
  );
  const criteriaList = useMemo(() => data?.criteria ?? [], [data]);

  const enterpriseMeta = useMemo(() => {
    if (!organizationId) return null;
    return enterprisesData?.items.find((e) => e.organizationId === organizationId) ?? null;
  }, [enterprisesData, organizationId]);

  const enterpriseOptions = useMemo(() => {
    const byId = new Map<string, { key: string; name: string; count: number }>();
    const keyByName = new Map<string, string>();

    for (const ent of enterprisesData?.items ?? []) {
      const key = ent.organizationId || ent.organizationName;
      if (!key) continue;
      byId.set(key, { key, name: ent.organizationName, count: 0 });
      if (ent.organizationName) {
        keyByName.set(ent.organizationName.trim().toLowerCase(), key);
      }
    }

    for (const item of allItems) {
      const orgId = item.organizationId?.trim();
      const orgName = item.organizationName?.trim();
      const normalizedName = orgName?.toLowerCase();
      const matchedKey =
        (orgId && byId.has(orgId) ? orgId : undefined) ??
        (normalizedName ? keyByName.get(normalizedName) : undefined);

      if (matchedKey) {
        byId.get(matchedKey)!.count += 1;
      } else if (orgId || orgName) {
        const key = orgId || orgName!;
        const name = orgName || orgId!;
        byId.set(key, { key, name, count: 1 });
        if (normalizedName) keyByName.set(normalizedName, key);
      }
    }

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [enterprisesData, allItems]);

  const selectedOrgOption = useMemo(
    () => enterpriseOptions.find((opt) => opt.key === selectedOrg || opt.name === selectedOrg) ?? null,
    [enterpriseOptions, selectedOrg],
  );

  const orgScopedItems = useMemo(() => {
    if (organizationId || selectedOrg === 'ALL') return allItems;
    return allItems.filter(
      (item) =>
        item.organizationId === selectedOrg ||
        item.organizationName === selectedOrg ||
        (selectedOrgOption != null && item.organizationName === selectedOrgOption.name),
    );
  }, [allItems, organizationId, selectedOrg, selectedOrgOption]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    orgScopedItems.forEach((item) => {
      if (item.departmentName) set.add(item.departmentName);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [orgScopedItems]);

  const domains = useMemo(() => {
    const set = new Set<string>();
    orgScopedItems.forEach((item) => {
      if (item.domainName) set.add(item.domainName);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [orgScopedItems]);

  const itemsMatchingContext = useMemo(() => {
    return orgScopedItems.filter((item) => {
      if (selectedDept !== 'ALL' && item.departmentName !== selectedDept) return false;
      if (selectedDomain !== 'ALL' && item.domainName !== selectedDomain) return false;
      if (selectedTier !== 'ALL' && String(item.tier ?? '') !== selectedTier) return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = item.employeeName.toLowerCase().includes(q);
        const matchPos = item.positionName?.toLowerCase().includes(q) ?? false;
        const matchDept = item.departmentName?.toLowerCase().includes(q) ?? false;
        const matchCourse = item.courseTitle.toLowerCase().includes(q) || item.courseCode.toLowerCase().includes(q);
        const matchDomain = item.domainName?.toLowerCase().includes(q) ?? false;
        const matchOrg = item.organizationName?.toLowerCase().includes(q) ?? false;
        return matchName || matchPos || matchDept || matchCourse || matchDomain || matchOrg;
      }
      return true;
    });
  }, [orgScopedItems, selectedDept, selectedDomain, selectedTier, search]);

  const sortedFilteredItems = useMemo(() => {
    const matched = itemsMatchingContext.filter((item) => matchesStatusFilter(item, statusFilter));

    return [...matched].sort((a, b) => {
      if (sortBy === 'NAME_ASC') {
        return a.employeeName.localeCompare(b.employeeName, 'vi');
      }
      if (sortBy === 'LATEST_DESC') {
        return latestSubmittedTimestamp(b) - latestSubmittedTimestamp(a);
      }
      if (sortBy === 'OLDEST_ASC') {
        return latestSubmittedTimestamp(a) - latestSubmittedTimestamp(b);
      }
      const pDiff = (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9);
      if (pDiff !== 0) return pDiff;
      return latestSubmittedTimestamp(b) - latestSubmittedTimestamp(a);
    });
  }, [itemsMatchingContext, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedFilteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedFilteredItems.slice(start, start + pageSize);
  }, [sortedFilteredItems, currentPage, pageSize]);

  const statusTabCounts = useMemo(
    () => ({
      ALL: itemsMatchingContext.length,
      PENDING: itemsMatchingContext.filter((i) => i.status === 'PENDING').length,
      RETRY: itemsMatchingContext.filter((i) => i.status === 'RETRY_WAIT' || i.status === 'RETRY_READY').length,
      FLAGGED: itemsMatchingContext.filter((i) => i.status === 'FLAGGED' || i.status === 'DEADLINE_MISSED').length,
      REVIEWED: itemsMatchingContext.filter((i) => i.status === 'APPROVED' || i.status === 'NOT_YET').length,
    }),
    [itemsMatchingContext],
  );

  const [railFiltersCollapsed, setRailFiltersCollapsed] = useState(true);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedOrg !== 'ALL') count += 1;
    if (selectedDept !== 'ALL') count += 1;
    if (selectedDomain !== 'ALL') count += 1;
    if (selectedTier !== 'ALL') count += 1;
    if (statusFilter !== 'ALL') count += 1;
    if (sortBy !== 'PRIORITY') count += 1;
    return count;
  }, [selectedOrg, selectedDept, selectedDomain, selectedTier, statusFilter, sortBy]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    activeFiltersCount > 0;

  const resetFilters = () => {
    setSearch('');
    setSelectedOrg('ALL');
    setSelectedDept('ALL');
    setSelectedDomain('ALL');
    setSelectedTier('ALL');
    setStatusFilter('ALL');
    setSortBy('PRIORITY');
    setPage(1);
    if (selectedSubmissionId) {
      navigate(organizationId ? `/mentor/enterprises/${organizationId}` : '/mentor/course-reviews', {
        state: {
          mentorFilter: {
            search: '',
            selectedOrg: 'ALL',
            selectedDept: 'ALL',
            selectedDomain: 'ALL',
            selectedTier: 'ALL',
            statusFilter: 'ALL',
            sortBy: 'PRIORITY',
            page: 1,
            pageSize,
            queueCollapsed: desktopQueueCollapsed,
          },
        },
      });
    }
  };

  const currentFilterState = (override?: Partial<WorkbenchFilterState>): WorkbenchFilterState => ({
    search,
    selectedOrg,
    selectedDept,
    selectedDomain,
    selectedTier,
    statusFilter,
    sortBy,
    page: currentPage,
    pageSize,
    queueCollapsed: desktopQueueCollapsed,
    ...override,
  });

  const handleRailCollapseClick = () => {
    const isMobileViewport =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 1100px)').matches;
    if (isMobileViewport) {
      setShowMobileQueue(false);
    } else {
      setDesktopQueueCollapsed(true);
    }
  };

  const scopedOrgTitle =
    enterpriseMeta?.organizationName ||
    allItems[0]?.organizationName ||
    'Chấm bài theo doanh nghiệp';

  const baseQueuePath = organizationId
    ? `/mentor/enterprises/${organizationId}`
    : '/mentor/course-reviews';

  const buildSubmissionPath = (submissionId: string) =>
    organizationId
      ? `/mentor/enterprises/${organizationId}/submissions/${submissionId}`
      : `/mentor/course-reviews/${submissionId}`;

  const explicitSelectedItem = useMemo(() => {
    if (!selectedSubmissionId) return null;
    return allItems.find((i) => i.submissionId === selectedSubmissionId) ?? null;
  }, [allItems, selectedSubmissionId]);

  const activeItem = useMemo(() => {
    if (selectedSubmissionId) return explicitSelectedItem;
    return sortedFilteredItems[0] ?? null;
  }, [selectedSubmissionId, explicitSelectedItem, sortedFilteredItems]);

  const activeModalCriteria = useMemo(
    () => (activeItem?.rubric && activeItem.rubric.length > 0 ? activeItem.rubric : criteriaList),
    [activeItem, criteriaList],
  );

  const activeQueueIndex = useMemo(() => {
    if (!activeItem) return -1;
    return sortedFilteredItems.findIndex((i) => i.submissionId === activeItem.submissionId);
  }, [sortedFilteredItems, activeItem]);

  const missingExplicitSelection = Boolean(selectedSubmissionId && !isLoading && !error && !explicitSelectedItem);

  const navigateToSubmission = (item: PulseFinalReviewItem, filterOverride?: Partial<WorkbenchFilterState>) => {
    setShowMobileQueue(false);
    if (item.status === 'PENDING') {
      setJustFinishedQueue(false);
    }
    navigate(buildSubmissionPath(item.submissionId), {
      state: { mentorFilter: currentFilterState(filterOverride) },
    });
  };

  const prevItem = activeQueueIndex > 0 ? sortedFilteredItems[activeQueueIndex - 1] ?? null : null;
  const nextItem =
    activeQueueIndex >= 0 && activeQueueIndex < sortedFilteredItems.length - 1
      ? sortedFilteredItems[activeQueueIndex + 1] ?? null
      : null;

  const remainingPendingCount = useMemo(
    () => allItems.filter((i) => i.status === 'PENDING').length,
    [allItems],
  );

  return (
    <div className="mw-wb-root">
      {/* 1. Breadcrumb Hierarchy */}
      <nav className="mw-breadcrumbs" aria-label="Đường dẫn vị trí">
        {organizationId ? (
          <>
            <Link to="/mentor/enterprises">
              <ArrowLeft size={14} aria-hidden="true" />
              <span>Doanh nghiệp được giao</span>
            </Link>
            <span>/</span>
            {selectedSubmissionId ? (
              <>
                <Link to={baseQueuePath}>{scopedOrgTitle}</Link>
                {activeItem && (
                  <>
                    <span>/</span>
                    <span className="current">{activeItem.employeeName}</span>
                  </>
                )}
              </>
            ) : (
              <span className="current">{scopedOrgTitle}</span>
            )}
          </>
        ) : (
          <>
            <Link to="/mentor/enterprises">
              <ArrowLeft size={14} aria-hidden="true" />
              <span>Doanh nghiệp được giao</span>
            </Link>
            <span>/</span>
            {selectedSubmissionId && activeItem ? (
              <>
                <Link to="/mentor/course-reviews">Tất cả bài nộp</Link>
                <span>/</span>
                <span className="current">{activeItem.employeeName}</span>
              </>
            ) : (
              <span className="current">Chấm bài & Thẩm định Năng lực</span>
            )}
          </>
        )}
      </nav>

      {/* 2. Workbench Top Bar */}
      <header className="mw-wb-topbar">
        <div className="mw-wb-title-block">
          <div className="mw-badge-pill">
            <GraduationCap size={13} aria-hidden="true" />
            <span>{organizationId ? 'Đơn vị phụ trách' : 'Thẩm định bài cuối cấp'}</span>
          </div>
          <h1>{organizationId ? scopedOrgTitle : 'Chấm bài & Thẩm định Năng lực'}</h1>
          {!organizationId && (
            <p className="mw-wb-subtitle">
              Kiểm tra và chấm điểm bài cuối cấp sau mỗi cấp độ theo từng lĩnh vực.
            </p>
          )}
        </div>

        <div className="mw-workbench-actions">
          {allItems.length > 0 && (
            <>
              <button
                type="button"
                className={`mw-header-outline-btn mw-wb-desktop-toggle${desktopQueueCollapsed ? ' is-collapsed' : ''}`}
                onClick={() => setDesktopQueueCollapsed((prev) => !prev)}
                aria-expanded={!desktopQueueCollapsed}
                aria-controls="mw-employee-queue-rail"
              >
                {desktopQueueCollapsed ? (
                  <PanelLeftOpen size={14} aria-hidden="true" />
                ) : (
                  <PanelLeftClose size={14} aria-hidden="true" />
                )}
                <span>
                  {desktopQueueCollapsed
                    ? `Mở danh sách (${sortedFilteredItems.length})`
                    : 'Thu gọn danh sách'}
                </span>
              </button>
              <button
                type="button"
                className="mw-header-outline-btn mw-wb-mobile-toggle"
                onClick={() => setShowMobileQueue((prev) => !prev)}
                aria-expanded={showMobileQueue}
              >
                <ListFilter size={14} aria-hidden="true" />
                <span>{showMobileQueue ? 'Ẩn danh sách bài nộp' : `Danh sách bài nộp (${sortedFilteredItems.length})`}</span>
              </button>
            </>
          )}
          {activeModalCriteria.length > 0 && (
            <button
              type="button"
              className="mw-header-outline-btn"
              onClick={() => setShowCriteriaModal(true)}
            >
              <Info size={14} aria-hidden="true" />
              <span>Xem tiêu chuẩn</span>
            </button>
          )}
          <button
            type="button"
            className="mw-header-outline-btn"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label="Làm mới danh sách bài nộp"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
            <span>{isFetching ? 'Đang tải' : 'Làm mới'}</span>
          </button>
        </div>
      </header>

      {/* 3. Main Workbench States */}
      {isLoading ? (
        <div className="mw-ledger-wrap">
          <div className="mw-empty-state">
            <div className="spinner" />
            <p>Đang tải danh sách bài nộp của nhân viên...</p>
          </div>
        </div>
      ) : error ? (
        <div className="mw-ledger-wrap">
          <div className="mw-empty-state">
            <div className="mw-empty-icon" style={{ background: '#fff1f2', color: '#e11d48' }}>
              <AlertCircle size={22} />
            </div>
            <h3>Không tải được danh sách bài nộp</h3>
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
              <GraduationCap size={22} />
            </div>
            <h3>Chưa có bài cuối cấp nào</h3>
            <p>
              {organizationId
                ? 'Nhân viên thuộc doanh nghiệp này chưa nộp bài cuối cấp nào. Quay lại danh sách doanh nghiệp hoặc bấm Làm mới.'
                : 'Chưa có nhân viên nào nộp bài cuối cấp. Bấm Làm mới để kiểm tra lại hoặc mở danh sách doanh nghiệp.'}
            </p>
            <Link to="/mentor/enterprises" className="mw-header-outline-btn" style={{ textDecoration: 'none' }}>
              Quay lại danh sách doanh nghiệp
            </Link>
          </div>
        </div>
      ) : (
        <div
          className={`mw-split-shell${desktopQueueCollapsed ? ' is-queue-collapsed' : ''}`}
          style={railWidth ? ({ '--mw-rail-w': `${railWidth}px` } as CSSProperties) : undefined}
        >
          {/* Left Queue Rail */}
          <aside
            id="mw-employee-queue-rail"
            className={`mw-queue-rail${showMobileQueue ? '' : ' is-collapsed-mobile'}${desktopQueueCollapsed ? ' is-collapsed-desktop' : ''}`}
            aria-label="Hàng chờ bài nộp"
          >
            {desktopQueueCollapsed && (
              <div className="mw-rail-mini">
                <button
                  type="button"
                  className="mw-rail-expand-btn"
                  onClick={() => setDesktopQueueCollapsed(false)}
                  aria-label="Mở rộng thanh nhân viên"
                  title="Mở rộng thanh nhân viên"
                >
                  <PanelLeftOpen size={16} aria-hidden="true" />
                </button>
                <span
                  className="mw-rail-mini-count"
                  title={`Tổng ${sortedFilteredItems.length} bài cuối cấp`}
                >
                  {sortedFilteredItems.length}
                </span>
                {pagedItems.length > 0 && (
                  <ul className="mw-rail-mini-avatars" aria-label="Chuyển nhanh nhân viên">
                    {pagedItems.slice(0, 10).map((item) => {
                      const isSelected = activeItem?.submissionId === item.submissionId;
                      const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.PENDING;
                      const tone = getAvatarColor(item.employeeName);
                      const dotColor =
                        item.status === 'PENDING'
                          ? '#d97706'
                          : item.status === 'APPROVED'
                            ? '#059669'
                            : '#e11d48';
                      return (
                        <li key={`mini-${item.kind}-${item.submissionId}`}>
                          <button
                            type="button"
                            className={`mw-rail-mini-avatar-btn${isSelected ? ' is-active' : ''}`}
                            style={{
                              background: isSelected ? '#4f46e5' : tone.bg,
                              color: isSelected ? '#ffffff' : tone.text,
                              border: `1.5px solid ${isSelected ? '#4f46e5' : tone.border}`,
                            }}
                            aria-current={isSelected ? 'true' : undefined}
                            aria-label={`Chọn ${item.employeeName}`}
                            title={`${item.employeeName} · ${badge.label}`}
                            onClick={() => navigateToSubmission(item)}
                          >
                            <span>{initials(item.employeeName)}</span>
                            <span className="mw-rail-mini-dot" style={{ background: dotColor }} aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            <div className="mw-rail-full">
              <div className="mw-rail-head">
                <div className="mw-rail-head-top">
                  <div className="mw-rail-head-title">
                    <Users size={14} aria-hidden="true" />
                    <span>Danh sách nhân viên</span>
                    <span className="mw-rail-head-count">{sortedFilteredItems.length}</span>
                  </div>
                  <div className="mw-rail-head-actions">
                    <button
                      type="button"
                      className="mw-rail-collapse-btn"
                      onClick={handleRailCollapseClick}
                      aria-label="Thu gọn thanh nhân viên"
                      title="Thu gọn thanh nhân viên"
                    >
                      <PanelLeftClose size={13} aria-hidden="true" />
                      <span>Thu gọn</span>
                    </button>
                  </div>
                </div>

                <div className="mw-rail-toolbar">
                  <div className="mw-rail-search">
                    <Search size={14} aria-hidden="true" className="mw-rail-search-icon" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Tìm nhân viên, vị trí, mã..."
                      aria-label="Tìm bài nộp"
                    />
                    <div className="mw-rail-search-actions">
                      {search.trim() && (
                        <button
                          type="button"
                          className="mw-rail-clear"
                          onClick={() => {
                            setSearch('');
                            setPage(1);
                          }}
                          aria-label="Xóa từ khóa tìm kiếm"
                          title="Xóa từ khóa tìm kiếm"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`mw-rail-search-filter-btn${!railFiltersCollapsed ? ' is-open' : ''}${activeFiltersCount > 0 ? ' has-filters' : ''}`}
                    onClick={() => setRailFiltersCollapsed((prev) => !prev)}
                    aria-label={railFiltersCollapsed ? 'Mở bộ lọc nhân viên' : 'Thu gọn bộ lọc'}
                      aria-description={activeFiltersCount > 0 ? `${activeFiltersCount} bộ lọc đang chọn` : undefined}
                    title={railFiltersCollapsed ? 'Mở bộ lọc nhân viên' : 'Thu gọn bộ lọc'}
                    aria-expanded={!railFiltersCollapsed}
                  >
                    <Filter size={13} aria-hidden="true" />
                  </button>
                </div>

              {!railFiltersCollapsed ? (
                <>
                  <div className="mw-rail-tabs" role="tablist" aria-label="Lọc theo trạng thái bài nộp">
                    {(
                      [
                        { id: 'ALL', label: 'Tất cả', count: statusTabCounts.ALL },
                        { id: 'PENDING', label: 'Chờ chấm', count: statusTabCounts.PENDING },
                        ...(statusFilter === 'ATTENTION'
                          ? [
                              {
                                id: 'ATTENTION' as const,
                                label: 'Hỗ trợ / nộp lại',
                                count: statusTabCounts.RETRY + statusTabCounts.FLAGGED,
                              },
                            ]
                          : []),
                        { id: 'RETRY', label: 'Chờ nộp lại', count: statusTabCounts.RETRY },
                        { id: 'FLAGGED', label: 'Cần hỗ trợ', count: statusTabCounts.FLAGGED },
                        { id: 'REVIEWED', label: 'Đã chấm', count: statusTabCounts.REVIEWED },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === tab.id}
                        className={`mw-rail-tab${statusFilter === tab.id ? ' active' : ''}`}
                        onClick={() => {
                          setStatusFilter(tab.id);
                          setPage(1);
                        }}
                      >
                        <span>{tab.label}</span>
                        <span className="count">{tab.count}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mw-rail-selects">
                    {!organizationId && enterpriseOptions.length > 0 && (
                      <OwnerFilterSelect
                        className="span-all"
                        variant="mentor"
                        icon="filter"
                        label="Lọc theo doanh nghiệp"
                        value={selectedOrg}
                        options={[
                          { value: 'ALL', label: `Mọi doanh nghiệp (${enterpriseOptions.length})` },
                          ...enterpriseOptions.map((org) => ({ value: org.key, label: `${org.name} (${org.count} bài)` })),
                        ]}
                        onChange={(nextOrg) => {
                          setSelectedOrg(nextOrg);
                          setSelectedDept('ALL');
                          setSelectedDomain('ALL');
                          setPage(1);
                          if (selectedSubmissionId) {
                            navigate('/mentor/course-reviews', {
                              state: {
                                mentorFilter: currentFilterState({
                                  selectedOrg: nextOrg,
                                  selectedDept: 'ALL',
                                  selectedDomain: 'ALL',
                                  page: 1,
                                }),
                              },
                            });
                          }
                        }}
                      />
                    )}

                    <OwnerFilterSelect
                      variant="mentor"
                      icon="filter"
                      label="Lọc theo lĩnh vực"
                      value={selectedDomain}
                      options={[
                        { value: 'ALL', label: `Mọi lĩnh vực (${domains.length})` },
                        ...domains.map((domain) => ({ value: domain, label: formatMentorCourseLabel(domain) || 'Lĩnh vực' })),
                      ]}
                      menuMinWidth={220}
                      onChange={(value) => {
                        setSelectedDomain(value);
                        setPage(1);
                      }}
                    />

                    <OwnerFilterSelect
                      variant="mentor"
                      icon="filter"
                      label="Lọc theo cấp độ"
                      value={selectedTier}
                      options={[
                        { value: 'ALL', label: 'Mọi cấp độ' },
                        { value: '1', label: 'Cơ bản (Mức 1)' },
                        { value: '2', label: 'Trung cấp (Mức 2)' },
                        { value: '3', label: 'Nâng cao (Mức 3)' },
                      ]}
                      menuMinWidth={200}
                      onChange={(value) => {
                        setSelectedTier(value as FilterTier);
                        setPage(1);
                      }}
                    />

                    {departments.length > 0 && (
                      <OwnerFilterSelect
                        variant="mentor"
                        icon="filter"
                        label="Lọc theo phòng ban"
                        value={selectedDept}
                        options={[
                          { value: 'ALL', label: `Mọi phòng ban (${departments.length})` },
                          ...departments.map((dept) => ({ value: dept, label: dept })),
                        ]}
                        menuMinWidth={220}
                        onChange={(value) => {
                          setSelectedDept(value);
                          setPage(1);
                        }}
                      />
                    )}

                    <OwnerFilterSelect
                      className={departments.length === 0 ? 'span-all' : ''}
                      variant="mentor"
                      icon="sort"
                      label="Sắp xếp danh sách bài nộp"
                      value={sortBy}
                      options={[
                        { value: 'PRIORITY', label: 'Ưu tiên cần chấm' },
                        { value: 'LATEST_DESC', label: 'Mới nộp gần đây' },
                        { value: 'OLDEST_ASC', label: 'Nộp lâu nhất' },
                        { value: 'NAME_ASC', label: 'Tên nhân viên A đến Z' },
                      ]}
                      menuMinWidth={220}
                      onChange={(value) => {
                        setSortBy(value as SortKey);
                        setPage(1);
                      }}
                    />
                  </div>
                </>
              ) : (
                activeFiltersCount > 0 && (
                  <div className="mw-rail-collapsed-filter-bar">
                    <div className="mw-rail-collapsed-tags">
                      {statusFilter !== 'ALL' && (
                        <span className="mw-rail-filter-tag">
                          {statusFilter === 'PENDING'
                            ? 'Chờ chấm'
                            : statusFilter === 'RETRY'
                            ? 'Chờ nộp lại'
                            : statusFilter === 'FLAGGED'
                            ? 'Cần hỗ trợ'
                            : statusFilter === 'REVIEWED'
                            ? 'Đã chấm'
                            : String(statusFilter)}
                        </span>
                      )}
                      {selectedOrg !== 'ALL' && (
                        <span className="mw-rail-filter-tag">1 doanh nghiệp</span>
                      )}
                      {selectedDomain !== 'ALL' && (
                        <span className="mw-rail-filter-tag">1 lĩnh vực</span>
                      )}
                      {selectedTier !== 'ALL' && (
                        <span className="mw-rail-filter-tag">Cấp {selectedTier}</span>
                      )}
                      {selectedDept !== 'ALL' && (
                        <span className="mw-rail-filter-tag">1 phòng ban</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="mw-rail-quick-reset"
                      onClick={resetFilters}
                      aria-label="Đặt lại bộ lọc"
                    >
                      Xóa lọc
                    </button>
                  </div>
                )
              )}

              <div className="mw-rail-meta">
                <span>Tổng {sortedFilteredItems.length} bài cuối cấp</span>
                {hasActiveFilters && (!railFiltersCollapsed || activeFiltersCount === 0) && (
                  <button type="button" className="mw-reset-link-btn" onClick={resetFilters}>
                    <RotateCcw size={11} aria-hidden="true" />
                    <span>Đặt lại bộ lọc</span>
                  </button>
                )}
              </div>
            </div>

            {sortedFilteredItems.length === 0 ? (
              <div style={{ padding: '24px 14px', textAlign: 'center', fontSize: 12.5, color: '#64748b' }}>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: 4 }}>
                  {selectedOrgOption && selectedOrgOption.count === 0
                    ? 'Doanh nghiệp này chưa có bài nộp'
                    : 'Không có bài nộp khớp bộ lọc'}
                </strong>
                <span>
                  {selectedOrgOption && selectedOrgOption.count === 0
                    ? `${selectedOrgOption.name} chưa có nhân viên nộp bài cuối cấp.`
                    : 'Xóa từ khóa hoặc bấm Đặt lại bộ lọc để xem tiếp danh sách.'}
                </span>
                <div style={{ marginTop: 10 }}>
                  <button type="button" className="mw-header-outline-btn" onClick={resetFilters}>
                    Đặt lại bộ lọc
                  </button>
                </div>
              </div>
            ) : (
              <>
                <ul className="mw-rail-list" role="list" aria-label="Danh sách bài nộp">
                  {pagedItems.map((item) => {
                    const isSelected = activeItem?.submissionId === item.submissionId;
                    const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.PENDING;
                    const latest = item.attempts?.[item.attempts.length - 1];
                    const tone = getAvatarColor(item.employeeName);
                    const roleParts = [item.positionName, item.departmentName].filter(Boolean);
                    const roleLabel = roleParts.length > 0 ? roleParts.join(' · ') : 'Chưa phân vị trí';
                    const tierLabel = item.tier ? levelName(item.tier) : 'Chưa phân cấp';
                    const domainLabel = formatMentorCourseLabel(item.domainName);

                    return (
                      <li key={`${item.kind}-${item.submissionId}`} style={{ width: '100%' }}>
                        <button
                          type="button"
                          className="mw-rail-item"
                          aria-current={isSelected ? 'true' : undefined}
                          onClick={() => navigateToSubmission(item)}
                        >
                          <div className="mw-rail-item-top">
                            <div className="mw-rail-user">
                              <span
                                className="mw-rail-avatar"
                                style={{
                                  background: tone.bg,
                                  color: tone.text,
                                  border: `1px solid ${tone.border}`,
                                }}
                                aria-hidden="true"
                              >
                                {initials(item.employeeName)}
                              </span>
                              <div style={{ minWidth: 0 }}>
                                <div className="mw-rail-name">{item.employeeName}</div>
                                {!organizationId && <div className="mw-rail-role">{roleLabel}</div>}
                              </div>
                            </div>

                            <span
                              className="mw-status-pill"
                              style={{
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                padding: '2px 7px',
                                fontSize: 10.5,
                              }}
                            >
                              {badge.label}
                            </span>
                          </div>

                          <div className="mw-rail-course">
                            {formatMentorCourseLabel(item.courseTitle) || domainLabel}
                          </div>

                          <div className="mw-rail-foot">
                            <span>
                              {domainLabel ? `${domainLabel} · ` : ''}
                              {tierLabel}
                            </span>
                            <span>
                              {latest?.choice ? `TN ${latest.choice.score}/${latest.choice.total}` : 'Tự luận'}
                              {item.recording?.risk ? ` · Rủi ro ${item.recording.risk.score}` : ''}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <PaginationBar
                  modernControls
                  page={currentPage}
                  pageSize={pageSize}
                  totalItems={sortedFilteredItems.length}
                  unitLabel="bài nộp"
                  showSummary={!organizationId}
                  onPageChange={setPage}
                  onPageSizeChange={(nextSize) => {
                    setPageSize(nextSize);
                    setPage(1);
                  }}
                />
              </>
            )}
            </div>
          </aside>

          <ResizeHandle
            target="prev"
            min={260}
            max={(container) => Math.min(container - 18 - 640, 390)}
            onResize={setRailWidth}
            onReset={() => setRailWidth(null)}
            label="Đổi độ rộng danh sách nhân viên"
            disabled={desktopQueueCollapsed}
          />

          {/* Right Grading Stage */}
          <div className="mw-stage-col">
            {justFinishedQueue && remainingPendingCount === 0 && (
              <div className="mw-done-banner" role="status">
                <span>Đã chấm xong toàn bộ bài chờ chấm trong hàng đợi hiện tại.</span>
                <Link to="/mentor/enterprises" className="mw-header-outline-btn" style={{ textDecoration: 'none' }}>
                  Quay lại doanh nghiệp được giao
                </Link>
              </div>
            )}

            {missingExplicitSelection ? (
              <div className="mw-ledger-wrap">
                <div className="mw-empty-state">
                  <div className="mw-empty-icon" style={{ background: '#fff1f2', color: '#e11d48' }}>
                    <AlertCircle size={22} />
                  </div>
                  <h3>Không tìm thấy bài nộp cần chấm.</h3>
                  <p>
                    Bài nộp này chưa tồn tại hoặc không thuộc doanh nghiệp bạn phụ trách. Chọn một bài khác ở danh sách bên trái hoặc quay lại danh sách chính.
                  </p>
                  <Link to={baseQueuePath} className="mw-header-primary-btn" style={{ textDecoration: 'none' }}>
                    Mở bài đầu hàng chờ
                  </Link>
                </div>
              </div>
            ) : !activeItem ? (
              <div className="mw-ledger-wrap">
                <div className="mw-empty-state">
                  <div className="mw-empty-icon">
                    <Search size={20} />
                  </div>
                  <h3>
                    {selectedOrgOption && selectedOrgOption.count === 0
                      ? 'Doanh nghiệp này chưa có bài nộp'
                      : 'Không có bài nộp khớp bộ lọc'}
                  </h3>
                  <p>
                    {selectedOrgOption && selectedOrgOption.count === 0
                      ? `Nhân viên tại ${selectedOrgOption.name} chưa nộp bài cuối cấp nào. Chọn doanh nghiệp khác hoặc bấm Đặt lại bộ lọc.`
                      : 'Xóa từ khóa hoặc bấm Đặt lại bộ lọc để mở lại danh sách bài cần chấm.'}
                  </p>
                  <button type="button" className="mw-header-outline-btn" onClick={resetFilters}>
                    Đặt lại bộ lọc
                  </button>
                </div>
              </div>
            ) : activeItem.kind === 'PRE_ASSESSMENT' ? (
              <ReviewCard key={activeItem.submissionId} item={activeItem} criteria={criteriaList} showOrganization />
            ) : (
              <MentorReviewDetailPane
                key={`${activeItem.kind}-${activeItem.submissionId}`}
                activeItem={activeItem}
                criteriaList={criteriaList}
                organizationId={organizationId}
                activeIndex={activeQueueIndex}
                totalFiltered={sortedFilteredItems.length}
                prevItem={prevItem}
                nextItem={nextItem}
                nextPendingItem={findNextPending(sortedFilteredItems, allItems, activeItem.submissionId)}
                onSelectItem={navigateToSubmission}
                onRefetch={refetch}
                onFinishedAllPending={() => {
                  setJustFinishedQueue(true);
                  if (statusFilter === 'PENDING') {
                    setStatusFilter('ALL');
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      {showCriteriaModal && activeModalCriteria.length > 0 && (
        <div className="mw-modal-portal" role="dialog" aria-modal="true" aria-labelledby="mw-crit-modal-title">
          <div className="mw-modal-backdrop" onClick={() => setShowCriteriaModal(false)} />
          <div className="mw-modal-box">
            <div className="mw-modal-head">
              <div>
                <h2 id="mw-crit-modal-title" className="mw-modal-title">
                  {activeItem?.rubric && activeItem.rubric.length > 0
                    ? 'Tiêu chuẩn Đánh giá Tự luận'
                    : 'Tiêu chuẩn Đánh giá Năng lực'}
                </h2>
                <p className="mw-modal-desc">
                  {activeItem?.rubric && activeItem.rubric.length > 0
                    ? `${activeItem.domainName ? `${activeItem.domainName} · ` : ''}${activeItem.tier ? `${levelName(activeItem.tier)} · ` : ''}Ngưỡng đạt từ ${ESSAY_PASS_SCORE_PERCENT}% và không rớt tiêu chí bắt buộc.`
                    : 'Áp dụng cho bài thực hành cuối cấp sau mỗi cấp độ trên hệ thống.'}
                </p>
              </div>
              <button
                type="button"
                className="mw-modal-close"
                onClick={() => setShowCriteriaModal(false)}
                aria-label="Đóng hộp thoại"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mw-criteria-grid">
              {activeModalCriteria.map((c, idx) => (
                <div key={c.number || idx} className={`mw-crit-card${c.isRequired ? ' is-required-gate' : ''}`}>
                  <div className="mw-crit-card-head">
                    <span className="mw-crit-badge">
                      {`Tiêu chí ${String(c.number || idx + 1).padStart(2, '0')}`}
                    </span>
                    {(c.weightPercent != null || c.isRequired) && (
                      <div className="mw-crit-meta-pills">
                        {c.weightPercent != null && (
                          <span className="mw-crit-weight-pill">{c.weightPercent}%</span>
                        )}
                        {c.isRequired && (
                          <span className="mw-crit-gate-pill">Bắt buộc</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mw-crit-body">
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

interface MentorReviewDetailPaneProps {
  activeItem: PulseFinalReviewItem;
  criteriaList: PulseCriterion[];
  organizationId?: string;
  activeIndex: number;
  totalFiltered: number;
  prevItem: PulseFinalReviewItem | null;
  nextItem: PulseFinalReviewItem | null;
  nextPendingItem: PulseFinalReviewItem | null;
  onSelectItem: (item: PulseFinalReviewItem, filterOverride?: Partial<WorkbenchFilterState>) => void;
  onRefetch: () => Promise<unknown>;
  onFinishedAllPending: () => void;
}

function MentorReviewDetailPane({
  activeItem,
  criteriaList,
  organizationId,
  activeIndex,
  totalFiltered,
  prevItem,
  nextItem,
  nextPendingItem,
  onSelectItem,
  onRefetch,
  onFinishedAllPending,
}: MentorReviewDetailPaneProps) {
  const decideFinalMutation = useDecidePulseFinal();
  const recordSupportMutation = useRecordPulseSupport();
  const refreshAiMutation = useRefreshPulseFinalAi();

  const latestAttempt = activeItem.attempts?.[activeItem.attempts.length - 1];
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<EvidenceTab>('ESSAY');
  const [choiceFilter, setChoiceFilter] = useState<ChoiceFilterMode>('ALL');
  const [decision, setDecision] = useState<PulseDecision | ''>('');
  const [reason, setReason] = useState(() => latestAttempt?.decisionReason ?? '');
  const [reasonTouchedByUser, setReasonTouchedByUser] = useState(() =>
    Boolean(latestAttempt?.decisionReason),
  );
  const [supportAction, setSupportAction] = useState<PulseSupportAction | ''>('');
  const [supportNote, setSupportNote] = useState('');

  const effectiveCriteria = useMemo(
    () => resolveEffectiveCriteria(activeItem, criteriaList),
    [activeItem, criteriaList],
  );
  const [rubricDraft, setRubricRows] = useState<RubricCriterionEvaluation[]>([]);
  const rubricRows = useMemo(() => effectiveCriteria.map((criterion) => {
    const draft = rubricDraft.find((row) => row.number === criterion.number && row.title === criterion.title);
    return {
      ...criterion,
      status: draft?.status ?? null,
      scorePercent: draft?.scorePercent,
      note: draft?.note ?? '',
    };
  }), [effectiveCriteria, rubricDraft]);
  const [expandedNoteKeys, setExpandedNoteKeys] = useState<Record<string, boolean>>({});
  const [expandedCriterion, setExpandedCriterion] = useState<number | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<
    { criterion: number } | { metric: PulseAiDetailEvidenceKey; label: string; note: string } | { all: true } | null
  >(null);
  const [annotationIndex, setAnnotationIndex] = useState<number | null>(null);
  const [aiEvidenceLookupFinished, setAiEvidenceLookupFinished] = useState(false);
  const aiRefreshInFlight = useRef(false);
  const passageRef = useRef<HTMLElement>(null);
  const evidenceNoticeRef = useRef<HTMLDivElement>(null);

  const essayReport = useMemo(
    () => buildEssayGuidance(activeItem, criteriaList),
    [activeItem, criteriaList],
  );

  const earlierAttempts = activeItem.attempts.slice(0, -1);
  const essay = latestAttempt?.evidenceText ?? '';
  const essayContent = essay || 'Nhân viên chưa nhập nội dung bài làm.';
  const selectedCriterion = selectedEvidence && 'criterion' in selectedEvidence ? selectedEvidence.criterion : null;
  const selectedMetric = selectedEvidence && 'metric' in selectedEvidence ? selectedEvidence : null;
  const showAllAnnotations = selectedEvidence != null && 'all' in selectedEvidence;
  const annotations = activeItem.aiHint?.annotations;
  const selectedAnnotations = useMemo(() => annotations?.filter((annotation) => showAllAnnotations
    || (selectedMetric != null && annotation.metric === selectedMetric.metric)
    || (selectedCriterion !== null && annotation.criterionIndex === selectedCriterion)) ?? [],
  [annotations, selectedCriterion, selectedMetric, showAllAnnotations]);
  const firstAnchor = selectedAnnotations.findIndex((annotation) => annotation.start != null);
  const activeAnnotationIndex = Math.min(annotationIndex ?? Math.max(0, firstAnchor), Math.max(0, selectedAnnotations.length - 1));
  const activeAnnotation = selectedAnnotations[activeAnnotationIndex];
  const ranges = useMemo(
    () => essayAnnotationRanges(essay, selectedAnnotations, activeAnnotationIndex),
    [essay, selectedAnnotations, activeAnnotationIndex],
  );
  const aiEvidence = activeItem.aiHint?.detail?.evidence;
  const metricExcerpt = selectedMetric ? aiEvidence?.[selectedMetric.metric] : undefined;
  const criterionEvidence = activeItem.aiHint?.criterionEvidence;
  const criterionPassages = useMemo(
    () => essayReport.isPromptCopy
      ? []
      : criterionEvidence?.map((excerpt) => findCriterionEvidence(essay, excerpt)) ?? [],
    [criterionEvidence, essay, essayReport.isPromptCopy],
  );
  const metricPassage = useMemo(
    () => findCriterionEvidence(essay, metricExcerpt),
    [essay, metricExcerpt],
  );
  const passage = selectedAnnotations.length ? null
    : selectedCriterion === null ? metricPassage : criterionPassages[selectedCriterion];
  const evidenceNote = selectedMetric?.note
    ?? (selectedCriterion === null ? undefined : essayReport.criteriaStatus[selectedCriterion]?.aiNote);
  const evidenceLabel = (showAllAnnotations ? 'Chú thích AI trên bài làm' : selectedMetric?.label)
    ?? (selectedCriterion === null ? undefined : rubricRows[selectedCriterion]?.title);
  const selectedExcerpt = selectedCriterion === null ? metricExcerpt : criterionEvidence?.[selectedCriterion];
  const isLookingUpEvidence = Boolean(selectedEvidence && selectedExcerpt === undefined && refreshAiMutation.isPending);

  useEffect(() => {
    if (activeEvidenceTab !== 'ESSAY' || !selectedEvidence) return;
    (passageRef.current ?? evidenceNoticeRef.current)?.scrollIntoView?.({ block: 'center', inline: 'nearest' });
  }, [activeEvidenceTab, passage, selectedEvidence, activeAnnotationIndex, ranges]);

  const submittedAtText = latestAttempt?.submittedAt ? formatDateTime(latestAttempt.submittedAt) : 'Chưa có';
  const isPending = activeItem.status === 'PENDING';
  const needsSupport = activeItem.status === 'FLAGGED' || activeItem.status === 'DEADLINE_MISSED';
  const isReviewed = activeItem.status === 'APPROVED' || activeItem.status === 'NOT_YET';
  const isRetryState = activeItem.status === 'RETRY_WAIT' || activeItem.status === 'RETRY_READY';

  const choice = latestAttempt?.choice ?? null;
  const choiceFails = Boolean(choice && !choice.passed);
  const choiceItems = useMemo(() => choice?.items ?? [], [choice]);
  const wrongChoiceItems = useMemo(
    () => choiceItems.filter((q) => !q.isCorrect),
    [choiceItems],
  );
  const displayedChoiceItems = choiceFilter === 'WRONG' ? wrongChoiceItems : choiceItems;
  const isLastFinalAttempt = activeItem.attemptNo >= activeItem.maxAttempts;

  const badge = STATUS_BADGE[activeItem.status] ?? STATUS_BADGE.PENDING;
  const tierLabel = activeItem.tier ? levelName(activeItem.tier) : 'Chưa phân cấp';
  const courseLabel = formatMentorCourseLabel(activeItem.courseTitle);
  const domainLabel = formatMentorCourseLabel(activeItem.domainName);
  const assignmentTitle = formatMentorCourseLabel(activeItem.assignment?.title);
  const assignmentCriteria = activeItem.assignment?.criteria ?? [];
  const avatarTone = getAvatarColor(activeItem.employeeName);

  const [sideWidth, setSideWidth] = useStoredWidth('mw-wb-side-width');
  const recording = activeItem.recording ?? null;
  const segments = recording?.segments ?? [];
  const hasScreen = segments.some((s) => s.track === 'SCREEN');
  const hasCamera = segments.some((s) => s.track === 'CAMERA');
  const recordingDuration = recording?.durationMs ?? 0;
  const flaggedCount = recording?.flaggedCount ?? 0;
  const risk = recording?.risk ?? null;

  const rubricStats = useMemo(
    () => computeRubricStats(rubricRows, choice ? choice.passed : null),
    [rubricRows, choice],
  );
  const hasRatedAnyCriterion = rubricStats.ratedCount > 0;

  const handleRubricScoreChange = (index: number, scorePercent: number | undefined) => {
    const status: RubricCriterionEvaluation['status'] = scorePercent === undefined ? null
      : scorePercent >= ESSAY_PASS_SCORE_PERCENT ? 'PASS'
        : scorePercent > 0 ? 'PARTIAL' : 'FAIL';
    const nextRows = rubricRows.map((row, idx) =>
      idx === index ? { ...row, status, scorePercent } : row,
    );
    setRubricRows(nextRows);
    if (!reasonTouchedByUser) {
      setReason(compileRubricFeedback({ rows: nextRows, decision, choice }));
    }
  };

  const handleRubricNoteChange = (index: number, nextNote: string) => {
    const nextRows = rubricRows.map((row, idx) =>
      idx === index ? { ...row, note: nextNote } : row,
    );
    setRubricRows(nextRows);
    if (!reasonTouchedByUser && nextRows.some((r) => r.status !== null)) {
      setReason(compileRubricFeedback({ rows: nextRows, decision, choice }));
    }
  };

  const handleMarkAllPass = () => {
    const nextRows = rubricRows.map((row) => ({ ...row, status: 'PASS' as const, scorePercent: 100 }));
    setRubricRows(nextRows);
    if (!reasonTouchedByUser) {
      setReason(
        compileRubricFeedback({
          rows: nextRows,
          decision,
          choice,
        }),
      );
    }
  };

  const handleCompileRubricFeedback = () => {
    const compiled = compileRubricFeedback({ rows: rubricRows, decision, choice });
    if (!compiled) return;
    setReason(compiled);
    setReasonTouchedByUser(false);
    toast.success('Đã tổng hợp nhận xét chi tiết từ bảng tiêu chí.');
  };

  const handleRefreshAi = async (forEvidence = false, evidenceMetric?: PulseAiDetailEvidenceKey) => {
    if (aiRefreshInFlight.current) return;
    aiRefreshInFlight.current = true;
    setAiEvidenceLookupFinished(false);
    try {
      const freshQueue = await refreshAiMutation.mutateAsync({
        includeReviewed: true,
        organizationId,
        submissionId: activeItem.submissionId,
        evidenceMetric,
      });
      const freshHint = freshQueue.items.find((item) => item.submissionId === activeItem.submissionId)?.aiHint;
      if (forEvidence) return;
      if (freshHint?.analysisStatus === 'NOT_CONFIGURED') {
        toast.error('Backend chưa nhận được khóa Gemini. Kiểm tra cấu hình của tiến trình backend.');
      } else if (freshHint?.analysisStatus === 'UNAVAILABLE') {
        toast.error('Gemini chưa trả kết quả. Phân tích đã lưu vẫn được giữ nếu có.');
      } else if (freshHint?.analysisStatus === 'INVALID_RESPONSE') {
        toast.error('Phản hồi Gemini chưa khớp bộ tiêu chí của đề. Phân tích đã lưu vẫn được giữ nếu có.');
      } else if (freshHint?.analysisStatus === 'PROMPT_COPY') {
        toast.warning('Bài làm trùng nội dung đề nên hệ thống không đưa điểm AI gợi ý. Mentor vẫn có thể chấm.');
      } else if (freshHint?.analysisStatus === 'SCORES_MISSING') {
        toast.warning('Đã cập nhật nhận xét AI. Gemini chưa trả điểm hợp lệ cho từng tiêu chí.');
      } else if (freshHint?.source === 'GEMINI' && freshHint.reviewedAt !== activeItem.aiHint?.reviewedAt) {
        toast.success('Đã cập nhật phân tích mới cho bài nộp này.');
      } else {
        toast.error('Backend chưa trả phân tích mới cho bài nộp này.');
      }
    } catch (err) {
      if (!forEvidence) toast.error(apiErrorMessage(err, 'Không làm mới được phân tích. Thử lại sau.'));
    } finally {
      setAiEvidenceLookupFinished(true);
      aiRefreshInFlight.current = false;
    }
  };

  const showAiEvidence = (metric: PulseAiDetailEvidenceKey, label: string, note: string) => {
    setAnnotationIndex(null);
    setAiEvidenceLookupFinished(false);
    setSelectedEvidence({ metric, label, note });
    setActiveEvidenceTab('ESSAY');
    if (isPending && latestAttempt?.evidenceText?.trim() && aiEvidence?.[metric] === undefined
      && !annotations?.some((annotation) => annotation.metric === metric)) {
      void handleRefreshAi(true, metric);
    }
  };

  const showCriterionEvidence = (index: number) => {
    setAnnotationIndex(null);
    setAiEvidenceLookupFinished(false);
    setSelectedEvidence({ criterion: index });
    setActiveEvidenceTab('ESSAY');
    if (isPending && !essayReport.isPromptCopy && essay.trim() && criterionEvidence?.[index] === undefined
      && !annotations?.some((annotation) => annotation.criterionIndex === index)) {
      void handleRefreshAi(true);
    }
  };

  const handleApplyAiDraft = () => {
    setReason(essayReport.draftFeedback);
    setReasonTouchedByUser(true);
    toast.success('Đã chèn gợi ý vào khung nhận xét. Kiểm tra lại trước khi lưu.');
  };

  const handleDecisionSubmit = async () => {
    if (!decision) {
      toast.warning('Chọn quyết định trước khi lưu.');
      return;
    }
    if (choiceFails && decision === 'PASSED') {
      toast.warning('Phần trắc nghiệm chưa đạt ngưỡng tối thiểu nên không thể công nhận đạt.');
      return;
    }
    if (rubricStats.gateFailed && decision === 'PASSED') {
      toast.warning('Tiêu chí bắt buộc chưa đạt nên không thể công nhận đạt.');
      return;
    }
    if (hasRatedAnyCriterion && !rubricStats.allRated) {
      toast.warning('Chấm đủ các tiêu chí tự luận trước khi lưu bảng điểm.');
      return;
    }
    if (reason.trim().length < MIN_REASON_LENGTH) {
      toast.warning(`Nhập nhận xét ít nhất ${MIN_REASON_LENGTH} ký tự.`);
      return;
    }

    const criterionEvaluations: PulseCriterionEvaluationInput[] | undefined = hasRatedAnyCriterion
      ? rubricRows
          .filter((r) => r.status !== null)
          .map((r) => ({
            number: r.number,
            title: r.title,
            status: r.status!,
            scorePercent: r.scorePercent,
            note: r.note.trim() || null,
            ...(r.weightPercent !== undefined ? { weightPercent: r.weightPercent } : {}),
            ...(r.isRequired !== undefined ? { isRequired: r.isRequired } : {}),
          }))
      : undefined;

    try {
      const res = await decideFinalMutation.mutateAsync(
        criterionEvaluations
          ? {
              submissionId: activeItem.submissionId,
              decision,
              reason: reason.trim(),
              criterionEvaluations,
            }
          : {
              submissionId: activeItem.submissionId,
              decision,
              reason: reason.trim(),
            },
      );
      const baseMsg =
        res.status === 'APPROVED'
          ? `Đã duyệt đạt cấp độ cho ${activeItem.employeeName}.`
          : res.status === 'FLAGGED'
            ? 'Đã lưu kết quả chưa đạt ở lần cuối và bật cờ hỗ trợ.'
            : 'Đã lưu nhận xét và mở cửa sổ nộp lại cho nhân viên.';
      toast.success(
        nextPendingItem
          ? `${baseMsg} Chuyển sang bài của ${nextPendingItem.employeeName}.`
          : baseMsg,
      );
      await onRefetch();

      if (nextPendingItem) {
        onSelectItem(nextPendingItem);
      } else {
        onFinishedAllPending();
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không lưu được quyết định. Thử lại sau.'));
    }
  };

  const handleSupportSubmit = async () => {
    if (!supportAction) {
      toast.warning('Chọn một hướng hỗ trợ cho nhân viên.');
      return;
    }
    try {
      await recordSupportMutation.mutateAsync({
        submissionId: activeItem.submissionId,
        action: supportAction,
        note: supportNote.trim() || undefined,
      });
      toast.success('Đã ghi hướng hỗ trợ cho nhân viên.');
      setSupportAction('');
      setSupportNote('');
      await onRefetch();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không ghi được hướng hỗ trợ. Thử lại sau.'));
    }
  };

  return (
    <>
      {/* Compact Learner & Queue Stepper Banner */}
      <section className="mw-learner-banner" aria-label="Thông tin nhân viên và điều hướng hàng chờ">
        <div className="mw-learner-banner-id">
          <div
            className="mw-learner-banner-avatar"
            style={{
              background: avatarTone.bg,
              color: avatarTone.text,
              border: `1px solid ${avatarTone.border}`,
            }}
            aria-hidden="true"
          >
            {initials(activeItem.employeeName)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="mw-learner-banner-title">
              <h2>{activeItem.employeeName}</h2>
              <span
                className="mw-status-pill"
                style={{
                  background: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                }}
              >
                {badge.label}
              </span>
              <span className="mw-chip indigo" style={{ fontSize: 11.5 }}>
                {`Lần ${activeItem.attemptNo}/${activeItem.maxAttempts}`}
              </span>
              {risk && !organizationId && <RiskTag risk={risk} />}
            </div>

            <div className="mw-learner-banner-meta">
              {activeItem.organizationName && !organizationId && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Building2 size={13} style={{ color: '#4f46e5' }} aria-hidden="true" />
                  <strong>{activeItem.organizationName}</strong>
                </span>
              )}
              {activeItem.departmentName && <span>Phòng ban: {activeItem.departmentName}</span>}
              {activeItem.positionName && <span>Vị trí: {activeItem.positionName}</span>}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} aria-hidden="true" />
                <span>Nộp lúc: {submittedAtText}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mw-queue-stepper">
          <button
            type="button"
            className="mw-header-outline-btn"
            disabled={!prevItem}
            onClick={() => prevItem && onSelectItem(prevItem)}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            <span>Bài trước</span>
          </button>
          {activeIndex >= 0 && (
            <span className="mw-step-count">
              {activeIndex + 1} / {totalFiltered}
            </span>
          )}
          <button
            type="button"
            className="mw-header-outline-btn"
            disabled={!nextItem}
            onClick={() => nextItem && onSelectItem(nextItem)}
          >
            <span>Bài tiếp</span>
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Main Two-Column Grading Stage */}
      <div
        className={`mw-grade-core${sideWidth ? ' has-custom-side' : ''}`}
        style={sideWidth ? ({ '--mw-side-w': `${sideWidth}px` } as CSSProperties) : undefined}
      >
        {/* Evidence Column */}
        <section className="mw-evidence-card" aria-label="Chi tiết bài nộp và giám sát">
          <div className="mw-ev-tabs" role="tablist" aria-label="Chuyển phần kiểm tra bài làm">
            <button
              type="button"
              role="tab"
              aria-selected={activeEvidenceTab === 'ESSAY'}
              className="mw-ev-tab"
              onClick={() => setActiveEvidenceTab('ESSAY')}
            >
              <FileText size={14} aria-hidden="true" />
              <span>Tự luận & Đề bài</span>
              <span className="mw-ev-badge">{essayReport.wordCount} từ</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeEvidenceTab === 'VIDEO'}
              className="mw-ev-tab"
              onClick={() => setActiveEvidenceTab('VIDEO')}
            >
              <Video size={14} aria-hidden="true" />
              <span>Video giám sát</span>
              <span
                className={`mw-ev-badge ${
                  !recording || segments.length === 0
                    ? ''
                    : flaggedCount > 0 || (risk && risk.score >= 50)
                      ? 'alert'
                      : 'ok'
                }`}
              >
                {!recording || segments.length === 0
                  ? 'Chưa có'
                  : flaggedCount > 0
                    ? `${flaggedCount} cảnh báo`
                    : clock(recordingDuration)}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeEvidenceTab === 'CHOICE'}
              className="mw-ev-tab"
              onClick={() => setActiveEvidenceTab('CHOICE')}
            >
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Trắc nghiệm</span>
              <span className={`mw-ev-badge ${choice ? (choice.passed ? 'ok' : 'alert') : ''}`}>
                {choice
                  ? `${choice.score}/${choice.total} · ${choice.passed ? 'Đạt' : 'Chưa đạt'}`
                  : 'Không có'}
              </span>
            </button>
          </div>

          <div className="mw-ev-body" role="tabpanel">
            {activeEvidenceTab === 'ESSAY' && (
              <>
                <div className="mw-course-meta-strip">
                  <div>
                    <h3>
                      {courseLabel || domainLabel}
                    </h3>
                    <div className="mw-course-meta-sub">
                      {domainLabel || 'Chưa gắn lĩnh vực'} · {tierLabel}
                    </div>
                  </div>
                </div>

                <details className="mw-prompt-details">
                  <summary>
                    <FileText size={15} aria-hidden="true" />
                    <span className="mw-prompt-label">
                      Đề bài thực hành yêu cầu
                      {assignmentTitle ? `: ${assignmentTitle}` : ''}
                    </span>
                    <ChevronDown size={14} className="mw-disclosure-chevron" aria-hidden="true" />
                  </summary>
                  <div className="mw-prompt-box">
                    {!activeItem.assignment?.promptHtml && (
                      <span className="mw-prompt-tag">Đề chuẩn theo khung khóa học</span>
                    )}
                    {activeItem.assignment?.promptHtml ? (
                      <RichText body={activeItem.assignment.promptHtml} />
                    ) : (
                      <p style={{ margin: 0 }}>
                        Mô tả một nhiệm vụ thực tế của vị trí {activeItem.positionName || 'hiện tại'} thuộc lĩnh vực{' '}
                        {(domainLabel || courseLabel).toLowerCase()} ({tierLabel.toLowerCase()}): nêu rõ
                        nguồn dữ liệu, hành động hoặc phép tính người khác kiểm tra lại được, kết luận và bước tiếp theo.
                      </p>
                    )}

                    {activeItem.rubric && activeItem.rubric.length > 0 ? (
                      <ul className="mw-prompt-criteria">
                        {effectiveCriteria.map((req, idx) => (
                          <li key={req.number || idx}>
                            {req.title}
                            {req.weightPercent != null
                              ? ` (${req.weightPercent}%${req.isRequired ? ' · Bắt buộc' : ''})`
                              : req.isRequired
                                ? ' (Bắt buộc)'
                                : ''}
                          </li>
                        ))}
                      </ul>
                    ) : assignmentCriteria.length > 0 ? (
                      <ul className="mw-prompt-criteria">
                        {assignmentCriteria.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </details>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: '#3730a3',
                      }}
                    >
                      Minh chứng tự luận của nhân viên
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                      {essayReport.wordCount} từ · {essayReport.charCount} ký tự
                    </span>
                  </div>
                  {!!annotations?.length && (
                    <button type="button" className="mw-essay-annotation-trigger" aria-pressed={showAllAnnotations}
                      onClick={() => {
                        setAnnotationIndex(null);
                        setSelectedEvidence(showAllAnnotations ? null : { all: true });
                      }}>
                      <Sparkles size={14} aria-hidden="true" />
                      Xem {annotations.length} chú thích AI
                    </button>
                  )}
                  {essayReport.isPromptCopy && (
                    <div className="mw-prompt-copy-alert" role="alert">
                      <AlertCircle size={15} aria-hidden="true" />
                      <div>
                        <strong>Cảnh báo sao chép đề bài:</strong> {essayReport.promptCopyNote}
                      </div>
                    </div>
                  )}
                  {evidenceLabel && (
                    <div ref={evidenceNoticeRef} className={`mw-evidence-notice${activeAnnotation ? ' has-annotation' : ''}`}>
                      <div role="status">
                        <strong>{evidenceLabel}</strong>
                        {activeAnnotation ? (
                          <>
                            <span className="mw-essay-annotation-kind" data-kind={activeAnnotation.kind}>
                              {ESSAY_ANNOTATION_LABELS[activeAnnotation.kind]}
                              {activeAnnotation.start == null && ' · Nhận xét toàn bài'}
                            </span>
                            <span className="mw-evidence-comment">{activeAnnotation.note}</span>
                            {activeAnnotation.action && (
                              <span className="mw-essay-annotation-action"><strong>Gợi ý sửa</strong> {activeAnnotation.action}</span>
                            )}
                          </>
                        ) : <>
                        <span>
                          {isLookingUpEvidence
                            ? 'AI đang tìm đoạn liên quan trong bài làm…'
                            : passage
                              ? 'Đoạn trích từ bài làm'
                              : !essay.trim()
                                ? 'Bài nộp chưa có nội dung tự luận để đối chiếu.'
                                : selectedExcerpt === undefined && aiEvidenceLookupFinished
                                  ? activeItem.aiHint?.evidenceLookupStatus === 'NOT_CONFIGURED'
                                    ? 'Backend hiện chưa có cấu hình Gemini để tìm dẫn chứng.'
                                    : 'Chưa nhận được dẫn chứng từ AI. Bấm lại để thử lại.'
                                  : 'Không có đoạn trích trực tiếp. Đối chiếu nhận xét với toàn bộ bài làm bên dưới.'}
                        </span>
                        {evidenceNote && <span className="mw-evidence-comment">{evidenceNote}</span>}
                        </>}
                      </div>
                      <div className="mw-essay-annotation-controls">
                        {isPending && !annotations?.length && !essayReport.isPromptCopy && !!essay.trim() && (
                          <button type="button"
                            className="mw-essay-annotation-refresh"
                            disabled={refreshAiMutation.isPending}
                            onClick={() => void handleRefreshAi()}>
                            <Sparkles size={13} aria-hidden="true" />
                            {refreshAiMutation.isPending ? 'Đang phân tích…' : 'Phân tích theo đoạn'}
                          </button>
                        )}
                        {selectedAnnotations.length > 1 && (
                          <div className="mw-essay-annotation-pager">
                            <button type="button" aria-label="Chú thích trước" disabled={activeAnnotationIndex <= 0}
                              onClick={() => setAnnotationIndex(activeAnnotationIndex - 1)}>
                              <ChevronLeft size={15} aria-hidden="true" />
                            </button>
                            <span>{activeAnnotationIndex + 1}/{selectedAnnotations.length}</span>
                            <button type="button" aria-label="Chú thích tiếp theo"
                              disabled={activeAnnotationIndex >= selectedAnnotations.length - 1}
                              onClick={() => setAnnotationIndex(activeAnnotationIndex + 1)}>
                              <ChevronRight size={15} aria-hidden="true" />
                            </button>
                          </div>
                        )}
                        <button type="button" onClick={() => setSelectedEvidence(null)} aria-label="Bỏ đối chiếu bài làm">
                          <X size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="mw-essay-paper">
                    {ranges.length > 0 ? (
                      <>
                        {ranges.map((range, index) => (
                          <Fragment key={range.index}>
                            {essay.slice(ranges[index - 1]?.end ?? 0, range.start)}
                            <mark
                              ref={range.index === activeAnnotationIndex ? passageRef : undefined}
                              className="mw-essay-highlight mw-essay-annotation-mark"
                              data-kind={range.kind} data-active={range.index === activeAnnotationIndex}
                              title={selectedAnnotations[range.index].note}
                              tabIndex={0}
                              onClick={() => setAnnotationIndex(range.index)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  setAnnotationIndex(range.index);
                                }
                              }}
                            >{essay.slice(range.start, range.end)}</mark>
                          </Fragment>
                        ))}
                        {essay.slice(ranges[ranges.length - 1].end)}
                      </>
                    ) : passage ? (
                      <>
                        {essayContent.slice(0, passage.start)}
                        <mark ref={passageRef} className="mw-essay-highlight">{essayContent.slice(passage.start, passage.end)}</mark>
                        {essayContent.slice(passage.end)}
                      </>
                    ) : essayContent}
                  </div>
                </div>

                {earlierAttempts.length > 0 && (
                  <details className="mw-history-details">
                    <summary>
                      <History size={15} aria-hidden="true" />
                      <span>Lịch sử các lần nộp trước ({earlierAttempts.length})</span>
                      <ChevronDown size={14} className="mw-disclosure-chevron" aria-hidden="true" />
                    </summary>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                      {earlierAttempts.map((prev, idx) => (
                        <div
                          key={prev.submissionId || prev.attemptNo || idx}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 10,
                            padding: 12,
                            fontSize: 13,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 6,
                              gap: 8,
                            }}
                          >
                            <strong>
                              Lần {prev.attemptNo}/{activeItem.maxAttempts} · {formatDateTime(prev.submittedAt)}
                            </strong>
                            <span className={`mw-chip ${prev.decision === 'PASSED' ? 'emerald' : 'rose'}`}>
                              {prev.decision === 'PASSED' ? 'Đã duyệt' : 'Chưa đạt'}
                            </span>
                          </div>
                          <p style={{ margin: '0 0 6px', color: '#334155', whiteSpace: 'pre-wrap' }}>
                            {prev.evidenceText}
                          </p>
                          {prev.decisionReason && (
                            <div style={{ fontSize: 12, color: '#475569' }}>
                              <strong>Nhận xét của {prev.reviewerName || 'người chấm'}:</strong>{' '}
                              {prev.decisionReason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </>
            )}

            {activeEvidenceTab === 'VIDEO' && (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span className={`mw-proctor-pill${hasScreen ? ' ok' : ''}`}>
                      <Monitor size={12} aria-hidden="true" />
                      <span>{hasScreen ? 'Có màn hình' : 'Thiếu màn hình'}</span>
                    </span>
                    <span className={`mw-proctor-pill${hasCamera ? ' ok' : ''}`}>
                      <Video size={12} aria-hidden="true" />
                      <span>{hasCamera ? 'Có camera & micro' : 'Thiếu camera'}</span>
                    </span>
                  </div>
                  {recording && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                      Thời lượng: {formatDuration(recordingDuration)}
                    </span>
                  )}
                </div>

                {recording ? (
                  <div className="tp-pu">
                    <RecordingPlayer
                      key={recording.sessionId}
                      recording={recording}
                      aiFraud={organizationId ? activeItem.aiHint?.fraud : undefined}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      borderRadius: 12,
                      color: '#64748b',
                      fontSize: 13,
                    }}
                  >
                    Bài nộp này chưa có bản ghi giám sát từ phiên làm bài. Chuyển sang tab Tự luận để chấm minh chứng viết tay.
                  </div>
                )}
              </>
            )}

            {activeEvidenceTab === 'CHOICE' && (
              <>
                {choice ? (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 17, color: '#0f172a' }}>
                          Đúng {choice.score}/{choice.total} câu
                        </strong>
                        <span
                          className="mw-status-pill"
                          style={{
                            background: choice.passed ? '#ecfdf5' : '#fff1f2',
                            color: choice.passed ? '#065f46' : '#9f1239',
                            border: `1px solid ${choice.passed ? '#a7f3d0' : '#fecdd3'}`,
                          }}
                        >
                          {choice.passed ? 'Đạt' : 'Chưa đạt'} · cần từ {choice.passMark} câu
                        </span>
                      </div>

                      {choiceItems.length > 0 && (
                        <div className="mw-view-toggle" role="group" aria-label="Lọc câu trắc nghiệm">
                          <button
                            type="button"
                            className="mw-view-btn"
                            aria-pressed={choiceFilter === 'ALL'}
                            onClick={() => setChoiceFilter('ALL')}
                          >
                            Tất cả câu ({choiceItems.length})
                          </button>
                          <button
                            type="button"
                            className="mw-view-btn"
                            aria-pressed={choiceFilter === 'WRONG'}
                            onClick={() => setChoiceFilter('WRONG')}
                          >
                            Chỉ câu sai ({wrongChoiceItems.length})
                          </button>
                        </div>
                      )}
                    </div>

                    {choiceItems.length === 0 ? (
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        Hệ thống chỉ lưu điểm tổng trắc nghiệm cho lượt nộp này.
                      </div>
                    ) : displayedChoiceItems.length === 0 ? (
                      <div
                        style={{
                          padding: 16,
                          borderRadius: 10,
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          color: '#065f46',
                          fontSize: 13,
                        }}
                      >
                        Nhân viên trả lời đúng toàn bộ {choiceItems.length} câu hỏi.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {displayedChoiceItems.map((q) => (
                          <div
                            key={q.number}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                              padding: '10px 12px',
                              borderRadius: 10,
                              background: q.isCorrect ? '#f0fdf4' : '#fff1f2',
                              border: `1px solid ${q.isCorrect ? '#bbf7d0' : '#fecdd3'}`,
                              fontSize: 12.5,
                            }}
                          >
                            <span
                              style={{
                                marginTop: 2,
                                color: q.isCorrect ? '#059669' : '#e11d48',
                                flexShrink: 0,
                              }}
                              aria-label={q.isCorrect ? 'Đúng' : 'Sai'}
                            >
                              {q.isCorrect ? (
                                <Check size={15} strokeWidth={2.5} />
                              ) : (
                                <X size={15} strokeWidth={2.5} />
                              )}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 650, color: '#0f172a', marginBottom: 3 }}>
                                Câu {q.number}. {q.question}
                              </div>
                              <div style={{ color: '#334155' }}>Nhân viên chọn: {q.selected}</div>
                              {!q.isCorrect && (
                                <div style={{ color: '#065f46', fontWeight: 650, marginTop: 2 }}>
                                  Đáp án đúng: {q.correct}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      borderRadius: 12,
                      color: '#64748b',
                      fontSize: 13,
                    }}
                  >
                    Khóa học này chỉ chấm phần bài tự luận, không có phần trắc nghiệm.
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <ResizeHandle
          target="next"
          min={300}
          max={(container) => container - 16 - 420}
          onResize={setSideWidth}
          onReset={() => setSideWidth(null)}
          label="Đổi độ rộng khung gợi ý chấm"
        />

        {/* Action, Detailed Rubric & Guidance Column */}
        <aside className="mw-action-col" aria-label="Gợi ý thẩm định và khung quyết định">
          {/* Compact Honest Guidance Card */}
          <section className="mw-ai-card" aria-label="Gợi ý chấm tự luận">
            <div className="mw-ai-head">
              <div className="mw-ai-title">
                <span className="mw-ai-icon" aria-hidden="true">
                  <Sparkles size={14} />
                </span>
                <span>Gợi ý chấm tự luận</span>
              </div>
              <div className="mw-ai-head-right">
                <span
                  className={`mw-ai-mode-pill${essayReport.mode === 'GEMINI' ? '' : ' is-fallback'}`}
                  title={essayReport.model ? `Model: ${essayReport.model}` : undefined}
                >
                  {essayReport.mode === 'GEMINI' ? 'Trợ lý phân tích' : 'Dò từ khóa'}
                </span>
                {essayReport.mode === 'GEMINI' && activeItem.aiHint?.reviewedAt && (
                  <span style={{ fontSize: 11, color: 'var(--mw-slate-500, #64748b)' }}>
                    AI phân tích lúc {formatDateTime(activeItem.aiHint.reviewedAt)}
                  </span>
                )}
                {isPending && latestAttempt?.evidenceText?.trim() && (
                  <button
                    type="button"
                    className="mw-ai-refresh-btn"
                    disabled={refreshAiMutation.isPending}
                    onClick={() => void handleRefreshAi()}
                    aria-label="Phân tích lại bài nộp"
                  >
                    <RefreshCw
                      size={12}
                      className={refreshAiMutation.isPending ? 'animate-spin' : ''}
                      aria-hidden="true"
                    />
                    <span>{refreshAiMutation.isPending ? 'Đang chạy' : 'Phân tích lại'}</span>
                  </button>
                )}
              </div>
            </div>

            {essayReport.isPromptCopy ? (
              <div className="mw-ai-alert-compact">
                <AlertCircle size={14} aria-hidden="true" />
                <span>
                  <strong>Cảnh báo:</strong> Bài nộp lặp lại nội dung đề bài, chưa có minh chứng công việc thực tế.
                </span>
              </div>
            ) : organizationId ? null : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <strong style={{ fontSize: 13, color: '#0f172a' }}>{essayReport.verdictTitle}</strong>
                {essayReport.summaryText && (
                  <p style={{ margin: 0, fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>
                    {essayReport.summaryText}
                  </p>
                )}
              </div>
            )}

            {!(organizationId && activeItem.recording) &&
              activeItem.aiHint?.fraud &&
              activeItem.aiHint.fraud.items.length > 0 && (
              <div
                style={{
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: 10,
                  padding: '9px 11px',
                  fontSize: 12,
                  color: '#9f1239',
                }}
              >
                <strong>Cảnh báo hành vi thi: {activeItem.aiHint.fraud.summary}</strong>
                <ul style={{ margin: '5px 0 0', paddingLeft: 16 }}>
                  {activeItem.aiHint.fraud.items.map((fi, idx) => (
                    <li key={idx}>
                      [{fi.time}] {fi.event}: {fi.note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeItem.aiHint?.detail && (
              <details className="mw-ai-details">
                <summary>
                  <ListFilter size={15} aria-hidden="true" />
                  <span>
                    Chi tiết 5 chỉ số phân tích bài nộp (trọng tâm {activeItem.aiHint.detail.relevanceScore}/100)
                  </span>
                  <ChevronDown size={14} className="mw-disclosure-chevron" aria-hidden="true" />
                </summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
                  {AI_DETAIL_METRICS.map((m) => {
                    const score = activeItem.aiHint!.detail![m.scoreKey];
                    const note = activeItem.aiHint!.detail![m.noteKey];
                    const badScore = m.invert ? score : 100 - score;
                    const barColor = badScore >= 70 ? '#e11d48' : badScore >= 40 ? '#d97706' : '#059669';
                    return (
                      <button
                        key={m.key}
                        type="button"
                        className="mw-ai-evidence-btn"
                        aria-label={`Xem dẫn chứng: ${m.label}`}
                        aria-pressed={selectedMetric?.metric === m.key}
                        onClick={() => showAiEvidence(m.key, m.label, note)}
                      >
                        <span className="mw-ai-evidence-head">
                          <strong>{m.label}</strong>
                          <span style={{ color: barColor }}>{score}/100</span>
                          <Search size={14} aria-hidden="true" />
                        </span>
                        <span className="mw-ai-evidence-track" aria-hidden="true">
                          <span style={{ width: `${score}%`, background: barColor }} />
                        </span>
                        {note && <span className="mw-ai-evidence-note">{note}</span>}
                      </button>
                    );
                  })}
                  {activeItem.aiHint.detail.verdict && (
                    <button
                      type="button"
                      className="mw-ai-evidence-btn"
                      aria-label="Xem dẫn chứng: Kết luận sơ bộ"
                      aria-pressed={selectedMetric?.metric === 'verdict'}
                      onClick={() => showAiEvidence('verdict', 'Kết luận sơ bộ', activeItem.aiHint?.detail?.verdict ?? '')}
                    >
                      <span className="mw-ai-evidence-head">
                        <strong>Kết luận sơ bộ</strong>
                        <Search size={14} aria-hidden="true" />
                      </span>
                      <span className="mw-ai-evidence-note">{activeItem.aiHint.detail.verdict}</span>
                    </button>
                  )}
                </div>
              </details>
            )}

            <details className="mw-ai-draft-details">
              <summary>
                <MessageSquarePlus size={15} aria-hidden="true" />
                <span>Nhận xét nháp đề xuất</span>
                <ChevronDown size={14} className="mw-disclosure-chevron" aria-hidden="true" />
              </summary>
              <div className="mw-ai-draft-box">
                <p className="mw-ai-draft-text">{essayReport.draftFeedback}</p>
                {isPending && (
                  <button
                    type="button"
                    className="mw-ai-insert-btn"
                    onClick={handleApplyAiDraft}
                  >
                    <Sparkles size={13} aria-hidden="true" />
                    <span>Chèn gợi ý vào nhận xét</span>
                  </button>
                )}
              </div>
            </details>
          </section>

          {/* Decision / Support / Reviewed Panel */}
          <section className="mw-decide-card" aria-label="Quyết định chấm bài">
            {isPending && (
              <>
                {/* Detailed Per-Criterion Essay Rubric */}
                <div className="mw-rubric-box" aria-label="Bảng chấm chi tiết theo tiêu chí">
                  <div className="mw-rubric-head">
                    <span className="mw-rubric-head-icon"><ClipboardCheck size={17} aria-hidden="true" /></span>
                    <h3>Chấm chi tiết tự luận</h3>
                  </div>
                  <div className="mw-rubric-summary">
                    <div className="mw-rubric-summary-top">
                      <span>Điểm tự luận{hasRatedAnyCriterion && !rubricStats.allRated ? ' tạm tính' : ''}</span>
                      <button
                        type="button"
                        className="mw-rubric-all-btn"
                        onClick={handleMarkAllPass}
                      >
                        Đạt hết
                      </button>
                    </div>
                    <div className="mw-rubric-summary-value">
                      <div aria-live="polite"><strong>{hasRatedAnyCriterion ? rubricStats.scorePercent : '—'}</strong> <span>/ 100</span></div>
                      <span>{rubricStats.ratedCount}/{rubricStats.total} tiêu chí đã chấm</span>
                    </div>
                    <div className="mw-rubric-total-track" aria-hidden="true">
                      <span style={{ width: `${hasRatedAnyCriterion ? rubricStats.scorePercent : 0}%` }} />
                      <i style={{ left: `${ESSAY_PASS_SCORE_PERCENT}%` }} />
                    </div>
                    <div className="mw-rubric-summary-caption">
                      <span>Mốc đề xuất {ESSAY_PASS_SCORE_PERCENT}/100</span>
                      {rubricStats.allRated && (
                        <strong className={rubricStats.recommendedDecision === 'PASSED' ? 'is-pass' : 'is-review'}>
                          {rubricStats.recommendedDecision === 'PASSED' ? 'Đề xuất công nhận đạt' : 'Đề xuất chưa đạt'}
                        </strong>
                      )}
                    </div>
                    {rubricStats.hasRequiredCriterion && (
                      <div className="mw-rubric-gate-caption">Tiêu chí bắt buộc cần từ {ESSAY_PASS_SCORE_PERCENT}%</div>
                    )}
                  </div>
                  {activeItem.aiHint?.analysisStatus === 'PROMPT_COPY' && (
                    <p className="mw-rubric-crit-desc">AI không gợi ý điểm vì nội dung bài trùng với đề. Mentor vẫn có thể tự chấm.</p>
                  )}
                  {essayReport.mode === 'GEMINI' && !essayReport.isPromptCopy
                    && activeItem.aiHint?.analysisStatus !== 'PROMPT_COPY'
                    && !activeItem.aiHint?.criterionScores?.some((score) => score != null) && (
                    <p className="mw-rubric-crit-desc">Chọn Phân tích lại để lấy điểm AI theo từng tiêu chí.</p>
                  )}

                  <div className="mw-rubric-list">
                    {rubricRows.map((row, idx) => {
                      const aiCrit = essayReport.criteriaStatus[idx];
                      const aiScore = essayReport.mode === 'GEMINI' && !essayReport.isPromptCopy
                        ? activeItem.aiHint?.criterionScores?.[idx] : null;
                      const matchesAi = aiScore != null && row.scorePercent === aiScore;
                      const showNoteBox = expandedNoteKeys[row.number] ?? Boolean(row.note);
                      const rowStateClass =
                        row.status === 'PASS'
                          ? ' is-pass'
                          : row.status === 'PARTIAL'
                            ? ' is-partial'
                            : row.status === 'FAIL'
                              ? ' is-fail'
                              : '';

                      return (
                        <div
                          key={`${row.number}-${idx}`}
                          className={`mw-rubric-item${rowStateClass}${row.isRequired ? ' is-required-gate' : ''}`}
                        >
                          <div className="mw-rubric-item-top">
                            <div className="mw-rubric-crit-meta">
                              <span className="mw-rubric-num">
                                {String(row.number || idx + 1).padStart(2, '0')}
                              </span>
                              {row.weightPercent != null && (
                                <span className="mw-rubric-weight-tag">Trọng số {row.weightPercent}%</span>
                              )}
                              {row.isRequired && (
                                <span className="mw-rubric-gate-tag">Bắt buộc</span>
                              )}
                            </div>
                            <button
                              type="button"
                              className="mw-rubric-note-toggle"
                              onClick={() =>
                                setExpandedNoteKeys((prev) => ({
                                  ...prev,
                                  [row.number]: !showNoteBox,
                                }))
                              }
                              aria-expanded={showNoteBox}
                            >
                              <MessageSquarePlus size={12} aria-hidden="true" />
                              <span>{showNoteBox ? 'Ẩn ghi chú' : 'Ghi chú'}</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            className="mw-rubric-criterion-link"
                            aria-expanded={expandedCriterion === idx}
                            onClick={() => {
                              setExpandedCriterion(expandedCriterion === idx ? null : idx);
                              if (selectedCriterion !== null && selectedCriterion !== idx) setSelectedEvidence(null);
                            }}
                          >
                            <span>{row.title}</span>
                            <ChevronDown size={14} className="mw-disclosure-chevron" aria-hidden="true" />
                          </button>
                          {expandedCriterion === idx && (
                            <div className="mw-rubric-crit-body">
                              {row.description && (
                                <div className="mw-rubric-crit-desc">{row.description}</div>
                              )}
                              {aiCrit && (aiCrit.met !== null || aiCrit.aiNote) && (
                                <div
                                  className={`mw-rubric-ai-cue ${
                                    essayReport.mode === 'GEMINI'
                                      ? aiCrit.met === true
                                        ? 'is-met'
                                        : 'is-gap'
                                      : 'is-fallback'
                                  }`}
                                >
                                  <strong>
                                    {essayReport.mode === 'GEMINI'
                                      ? aiScore != null ? `AI gợi ý ${aiScore}%` : `Gợi ý: ${
                                          aiCrit.met === true
                                            ? 'Đạt'
                                            : aiCrit.met === false
                                              ? 'Chưa đạt'
                                              : 'Tham khảo'
                                        }`
                                      : `Từ khóa: ${aiCrit.met === true ? 'Có từ liên quan' : 'Chưa thấy từ khớp'}`}
                                  </strong>
                                  {aiCrit.aiNote && <span> · {aiCrit.aiNote}</span>}
                                </div>
                              )}
                              <button
                                type="button"
                                className="mw-rubric-find-evidence"
                                aria-label={`Tìm trong bài làm: ${row.title}`}
                                aria-pressed={selectedCriterion === idx}
                                onClick={() => showCriterionEvidence(idx)}
                              >
                                <Search size={13} aria-hidden="true" />
                                Tìm trong bài làm
                              </button>
                            </div>
                          )}

                          <div className="mw-rubric-scale">
                            <div className="mw-rubric-scale-labels">
                              <span className="mw-rubric-mentor-score">
                                <span>Điểm Mentor</span>
                                <strong>{row.scorePercent === undefined ? 'Chưa chấm' : `${row.scorePercent}%`}</strong>
                              </span>
                              {aiScore != null && (
                                <button type="button" className="mw-rubric-ai-score"
                                  disabled={matchesAi}
                                  onClick={() => handleRubricScoreChange(idx, aiScore)}
                                  title={matchesAi ? 'Điểm Mentor đang khớp với gợi ý AI' : 'Dùng điểm AI gợi ý'}
                                  aria-label={matchesAi
                                    ? `Điểm Mentor khớp gợi ý AI ${aiScore}% cho ${row.title}`
                                    : `Dùng điểm AI gợi ý ${aiScore}% cho ${row.title}`}>
                                  {matchesAi ? <Check size={13} aria-hidden="true" /> : <Sparkles size={13} aria-hidden="true" />}
                                  <span>AI {aiScore}%</span>
                                </button>
                              )}
                            </div>
                            <div className={`mw-rubric-scale-track${matchesAi ? ' is-ai-match' : ''}${row.scorePercent === undefined ? ' is-unrated' : ''}`}
                              style={{ '--mentor-score': `${row.scorePercent ?? 0}%` } as CSSProperties}>
                              <div className="mw-rubric-scale-fill" aria-hidden="true" />
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={row.scorePercent ?? 0}
                                aria-label={`Điểm Mentor cho ${row.title}`}
                                aria-valuetext={row.scorePercent === undefined ? 'Chưa chấm' : `${row.scorePercent}%`}
                                onChange={(event) => handleRubricScoreChange(idx, event.currentTarget.valueAsNumber)}
                              />
                              {aiScore != null && !matchesAi && (
                                <span className="mw-rubric-ai-marker" aria-hidden="true" style={{ left: `${aiScore}%` }} />
                              )}
                            </div>
                            <div className="mw-rubric-scale-labels mw-rubric-scale-ends">
                              <button type="button" onClick={() => handleRubricScoreChange(idx, 0)}
                                aria-label={`Chấm 0% cho ${row.title}`}>0%</button>
                              {row.scorePercent !== undefined && (
                                <button type="button" onClick={() => handleRubricScoreChange(idx, undefined)}
                                  aria-label={`Xóa điểm của ${row.title}`}>Xóa điểm</button>
                              )}
                              <button type="button" onClick={() => handleRubricScoreChange(idx, 100)}
                                aria-label={`Chấm 100% cho ${row.title}`}>100%</button>
                            </div>
                          </div>

                          {showNoteBox && (
                            <div className="mw-rubric-note-area">
                              <input
                                type="text"
                                className="mw-rubric-note-input"
                                value={row.note}
                                onChange={(e) => handleRubricNoteChange(idx, e.target.value)}
                                placeholder={`Ghi chú cho tiêu chí ${String(row.number || idx + 1).padStart(2, '0')}...`}
                                aria-label={`Ghi chú tiêu chí ${String(row.number || idx + 1).padStart(2, '0')}`}
                                maxLength={400}
                              />
                              {row.status && (
                                <div className="mw-rubric-quick-notes">
                                  {RUBRIC_QUICK_NOTES[row.status].map((chip, cIdx) => (
                                    <button
                                      key={cIdx}
                                      type="button"
                                      className="mw-rubric-quick-chip"
                                      onClick={() => handleRubricNoteChange(idx, chip)}
                                    >
                                      + {chip}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {hasRatedAnyCriterion && (
                    <div className="mw-rubric-foot">
                      <button
                        type="button"
                        className="mw-rubric-compile-btn"
                        onClick={handleCompileRubricFeedback}
                      >
                        Tổng hợp bảng điểm vào nhận xét
                      </button>
                    </div>
                  )}
                </div>

                {!organizationId && (
                  <div style={{ paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                      Quyết định chấm điểm
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
                      Chọn Đạt để công nhận cấp độ khóa học, hoặc Chưa đạt để gửi nhận xét yêu cầu bổ sung.
                    </p>
                  </div>
                )}

                {choiceFails && (
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 9,
                      padding: '10px 12px',
                      fontSize: 12.5,
                      color: '#92400e',
                    }}
                  >
                    Phần trắc nghiệm đúng {choice!.score}/{choice!.total} câu, chưa đạt mức tối thiểu{' '}
                    {choice!.passMark} câu nên chỉ có thể chọn Chưa đạt.
                  </div>
                )}

                {rubricStats.gateFailed && (
                  <div className="mw-gate-block-banner" role="alert">
                    Tiêu chí bắt buộc dưới {ESSAY_PASS_SCORE_PERCENT}% nên chưa thể công nhận đạt.
                  </div>
                )}

                {!rubricStats.gateFailed &&
                  !choiceFails &&
                  rubricStats.allRated &&
                  rubricStats.scorePercent < ESSAY_PASS_SCORE_PERCENT && (
                    <div className="mw-score-warn-banner" role="status">
                      Điểm trọng số tự luận đạt {rubricStats.scorePercent}% (dưới ngưỡng {ESSAY_PASS_SCORE_PERCENT}%). Nên chọn Chưa đạt để yêu cầu bổ sung.
                    </div>
                  )}

                {isLastFinalAttempt && decision === 'NOT_YET' && (
                  <div
                    style={{
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: 9,
                      padding: '10px 12px',
                      fontSize: 12.5,
                      color: '#9f1239',
                    }}
                  >
                    Đây là lần nộp cuối cùng ({activeItem.attemptNo}/{activeItem.maxAttempts}). Chọn Chưa đạt sẽ chuyển bài sang trạng thái cần hỗ trợ.
                  </div>
                )}

                <div className="mw-decide-choice-grid">
                  <button
                    type="button"
                    disabled={choiceFails || rubricStats.gateFailed}
                    aria-pressed={decision === 'PASSED'}
                    className={`mw-decide-choice-btn pass${decision === 'PASSED' ? ' selected' : ''}`}
                    onClick={() => {
                      setDecision('PASSED');
                    }}
                  >
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span>Công nhận đạt</span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={decision === 'NOT_YET'}
                    className={`mw-decide-choice-btn fail${decision === 'NOT_YET' ? ' selected' : ''}`}
                    onClick={() => {
                      setDecision('NOT_YET');
                    }}
                  >
                    <AlertCircle size={15} aria-hidden="true" />
                    <span>Chưa đạt</span>
                  </button>
                </div>

                {!organizationId && (
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        marginBottom: 6,
                      }}
                    >
                      Mẫu nhận xét nhanh
                    </div>
                    <div className="mw-template-chips">
                      {QUICK_TEMPLATES.map((tmpl, idx) => {
                        const disabled = (choiceFails || rubricStats.gateFailed) && tmpl.decision === 'PASSED';
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={disabled}
                            className="mw-template-chip"
                            onClick={() => {
                              setReason(tmpl.text);
                              setReasonTouchedByUser(true);
                              setDecision(tmpl.decision);
                            }}
                          >
                            {tmpl.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="mentor-reason-input"
                    style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}
                  >
                    Nhận xét gửi nhân viên <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <textarea
                    id="mentor-reason-input"
                    className="mw-reason-textarea"
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      setReasonTouchedByUser(true);
                    }}
                    placeholder="Nêu cụ thể điểm đã đạt, điểm thiếu cần bổ sung và bước tiếp theo."
                    rows={4}
                    maxLength={2000}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 11.5,
                      color: '#64748b',
                      marginTop: 4,
                    }}
                  >
                    <span>Bắt buộc tối thiểu {MIN_REASON_LENGTH} ký tự</span>
                    <span>{reason.trim().length} ký tự</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="mw-btn mw-btn-primary"
                  disabled={
                    decideFinalMutation.isPending || !decision || reason.trim().length < MIN_REASON_LENGTH
                  }
                  onClick={handleDecisionSubmit}
                  style={{ width: '100%', height: 42, fontSize: 14 }}
                >
                  {decideFinalMutation.isPending
                    ? 'Đang lưu quyết định...'
                    : nextPendingItem
                      ? 'Lưu & sang bài tiếp theo'
                      : 'Lưu quyết định'}
                </button>
              </>
            )}

            {needsSupport && (
              <>
                <div style={{ paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                    Ghi hướng hỗ trợ sau 2 lần nộp chưa đạt
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
                    Chọn biện pháp hỗ trợ tiếp theo để nhân viên tiếp tục lộ trình đào tạo.
                  </p>
                </div>

                {latestAttempt?.decisionReason && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 9,
                      padding: 10,
                      fontSize: 12.5,
                      color: '#334155',
                    }}
                  >
                    <strong>Nhận xét gần nhất:</strong> {latestAttempt.decisionReason}
                  </div>
                )}

                {latestAttempt?.supportAction && (
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 9,
                      padding: 10,
                      fontSize: 12.5,
                      color: '#065f46',
                    }}
                  >
                    <strong>Hướng hỗ trợ hiện tại:</strong> {SUPPORT_LABELS[latestAttempt.supportAction]}
                    {latestAttempt.supportNote ? ` (${latestAttempt.supportNote})` : ''}
                    {latestAttempt.supportRecordedAt ? ` vào ${formatDateTime(latestAttempt.supportRecordedAt)}` : ''}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {SUPPORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.action}
                      type="button"
                      onClick={() => setSupportAction(opt.action)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: 9,
                        border: `1.5px solid ${supportAction === opt.action ? '#4f46e5' : '#e2e8f0'}`,
                        background: supportAction === opt.action ? '#eef2ff' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{opt.hint}</div>
                    </button>
                  ))}
                </div>

                <div>
                  <label
                    htmlFor="mentor-support-note"
                    style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}
                  >
                    Ghi chú kế hoạch hỗ trợ (không bắt buộc)
                  </label>
                  <textarea
                    id="mentor-support-note"
                    className="mw-reason-textarea"
                    value={supportNote}
                    onChange={(e) => setSupportNote(e.target.value)}
                    placeholder="Ví dụ: Lịch kèm cặp vào thứ Năm tuần này."
                    rows={3}
                    maxLength={1000}
                  />
                </div>

                <button
                  type="button"
                  className="mw-btn mw-btn-primary"
                  disabled={recordSupportMutation.isPending || !supportAction}
                  onClick={handleSupportSubmit}
                  style={{ width: '100%', height: 42, fontSize: 14 }}
                >
                  {recordSupportMutation.isPending ? 'Đang lưu...' : 'Ghi hướng hỗ trợ'}
                </button>
              </>
            )}

            {(isReviewed || isRetryState) && (
              <>
                <div style={{ paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                    {isReviewed ? 'Kết quả đã chấm' : 'Đang trong thời gian nộp lại'}
                  </h3>
                </div>

                <div
                  style={{
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                    borderRadius: 10,
                    padding: 13,
                  }}
                >
                  <div style={{ fontWeight: 750, fontSize: 14, marginBottom: 4 }}>{badge.label}</div>
                  {latestAttempt?.reviewerName && (
                    <div style={{ fontSize: 12.5 }}>Người chấm: {latestAttempt.reviewerName}</div>
                  )}
                  {latestAttempt?.reviewedAt && (
                    <div style={{ fontSize: 12.5 }}>Thời gian chấm: {formatDateTime(latestAttempt.reviewedAt)}</div>
                  )}
                </div>

                {latestAttempt?.decisionReason && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Nhận xét đã gửi
                    </div>
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 9,
                        padding: 12,
                        fontSize: 13,
                        color: '#0f172a',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {latestAttempt.decisionReason}
                    </div>
                  </div>
                )}

                {isRetryState && (latestAttempt?.retryOpensAt || latestAttempt?.retryDueAt) && (
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 9,
                      padding: 12,
                      fontSize: 12.5,
                      color: '#92400e',
                    }}
                  >
                    <div>
                      Mở nộp lại từ:{' '}
                      {latestAttempt.retryOpensAt ? formatDateTime(latestAttempt.retryOpensAt) : 'Ngay lập tức'}
                    </div>
                    <div>
                      Hạn nộp lại:{' '}
                      {latestAttempt.retryDueAt ? formatDateTime(latestAttempt.retryDueAt) : 'Chưa đặt hạn'}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
