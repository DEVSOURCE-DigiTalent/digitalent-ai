import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Bug,
  MessageSquare,
  Star,
  Search,
  RotateCw,
  Download,
  X,
  Building,
  Clock,
  Check,
  Sparkles,
  ExternalLink,
  ImageIcon,
  Copy,
  CheckCheck,
  ZoomIn,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { feedbackService, type FeedbackItem } from '@/services/feedback.service';
import { Footer, Loading, LoadError, Pager } from '@/features/platform/components/pulse-ui';
import { formatDate, formatDateTime, formatRelativeTime } from '@/features/platform/components/pulse-format';
import { PlatformDrawer } from '@/features/platform/components/PlatformDrawer';
import { openScreenshot } from '../lib/open-screenshot';

const FEEDBACK_STATUS: Record<
  string,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  OPEN: {
    label: 'Chờ xử lý',
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    dot: '#ea580c',
  },
  IN_PROGRESS: {
    label: 'Đang xử lý',
    color: '#0369a1',
    bg: '#f0f9ff',
    border: '#bae6fd',
    dot: '#0284c7',
  },
  RESOLVED: {
    label: 'Đã giải quyết',
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    dot: '#16a34a',
  },
  CLOSED: {
    label: 'Đã đóng',
    color: '#475569',
    bg: '#f8fafc',
    border: '#cbd5e1',
    dot: '#64748b',
  },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'OPEN', label: 'Chờ xử lý' },
  { value: 'IN_PROGRESS', label: 'Đang xử lý' },
  { value: 'RESOLVED', label: 'Đã giải quyết' },
  { value: 'CLOSED', label: 'Đã đóng' },
];

export interface ModuleInfo {
  key: string;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export function inferModule(item: FeedbackItem): ModuleInfo {
  const url = (item.pageUrl || '').toLowerCase();
  const text = `${item.title} ${item.description}`.toLowerCase();

  if (
    url.includes('exam') ||
    url.includes('proctor') ||
    text.includes('bài thi') ||
    text.includes('kiểm tra') ||
    text.includes('proctoring') ||
    text.includes('khảo thí') ||
    text.includes('mất tiến trình')
  ) {
    return {
      key: 'EXAM',
      label: 'Thi và giám sát',
      color: '#6d28d9',
      bg: '#f5f3ff',
      border: '#ddd6fe',
    };
  }

  if (
    url.includes('learn') ||
    url.includes('course') ||
    text.includes('khóa học') ||
    text.includes('bài giảng') ||
    text.includes('slide') ||
    text.includes('học liệu') ||
    text.includes('video')
  ) {
    return {
      key: 'LEARNING',
      label: 'Học tập',
      color: '#0369a1',
      bg: '#f0f9ff',
      border: '#bae6fd',
    };
  }

  if (
    url.includes('enterprise') ||
    url.includes('organization') ||
    text.includes('doanh nghiệp') ||
    text.includes('nhân sự') ||
    text.includes('phòng ban') ||
    text.includes('tổ chức')
  ) {
    return {
      key: 'ORGANIZATION',
      label: 'Quản trị tổ chức',
      color: '#b45309',
      bg: '#fffbeb',
      border: '#fde68a',
    };
  }

  if (
    url.includes('auth') ||
    url.includes('login') ||
    url.includes('users') ||
    text.includes('tài khoản') ||
    text.includes('mật khẩu') ||
    text.includes('đăng nhập')
  ) {
    return {
      key: 'AUTH',
      label: 'Tài khoản',
      color: '#c2410c',
      bg: '#fff7ed',
      border: '#fed7aa',
    };
  }

  return {
    key: 'GENERAL',
    label: 'Khác',
    color: '#475569',
    bg: '#f8fafc',
    border: '#e2e8f0',
  };
}

const MODULE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả khu vực' },
  { value: 'EXAM', label: 'Thi và giám sát' },
  { value: 'LEARNING', label: 'Học tập' },
  { value: 'ORGANIZATION', label: 'Quản trị tổ chức' },
  { value: 'AUTH', label: 'Tài khoản' },
  { value: 'GENERAL', label: 'Khác' },
];

const BUG_RESPONSE_TEMPLATES = [
  'Đội ngũ kỹ thuật đã ghi nhận sự cố và đang tiến hành kiểm tra nguyên nhân xử lý.',
  'Sự cố kỹ thuật đã được khắc phục và cập nhật lên hệ thống. Bạn vui lòng tải lại trang để tiếp tục.',
  'Bộ phận kỹ thuật chưa tái hiện được lỗi. Bạn vui lòng gửi thêm thông tin trình duyệt hoặc thao tác trước khi phát sinh lỗi.',
];

const FEEDBACK_RESPONSE_TEMPLATES = [
  'Cảm ơn bạn đã đóng góp. Đội ngũ sản phẩm đã tiếp nhận và sẽ bổ sung trong các phiên bản cập nhật.',
  'Vấn đề đã được cập nhật và kiểm thử thành công. Bạn vui lòng trải nghiệm lại nhé.',
  'Yêu cầu đã được chuyển đến bộ phận chuyên môn để phối hợp xử lý và phản hồi sớm nhất.',
];

function getTicketCode(item: FeedbackItem, isBug: boolean): string {
  const prefix = isBug ? 'BUG' : 'FB';
  const cleanId = (item.id || '').replace(/-/g, '');
  const shortId = cleanId ? cleanId.slice(-4).toUpperCase() : '0000';
  return `#${prefix}-${shortId}`;
}

function Stars({ count, showScore = false }: { count: number; showScore?: boolean }) {
  useUiLanguage();
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'inline-flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={13}
            style={{
              fill: s <= count ? '#f59e0b' : '#e2e8f0',
              color: s <= count ? '#f59e0b' : '#cbd5e1',
            }}
          />
        ))}
      </div>
      {showScore && (
        <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309', marginLeft: 2 }}>
          {count}.0
        </span>
      )}
    </div>
  );
}

function getAvatarPalette(text: string) {
  const charCode = (text || 'A').charCodeAt(0) % 4;
  switch (charCode) {
    case 0:
      return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' }; // Xanh biển
    case 1:
      return { bg: '#f5f3ff', color: '#7c3aed', border: '#ede9fe' }; // Tím sapphire
    case 2:
      return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' }; // Xanh ngọc
    default:
      return { bg: 'var(--pa-accent-soft, #fef3e7)', color: 'var(--pa-accent-solid, #c2410c)', border: 'var(--pa-accent-border, #fed7aa)' }; // Cam ấm
  }
}

function FeedbackSenderCell({
  name,
  email,
  organizationName,
}: {
  name: string | null;
  email: string | null;
  organizationName: string | null;
}) {
  const displayName = name || translateUi('Người dùng ẩn danh');
  const initial = (name || email || '?').trim()[0]!.toUpperCase();
  const palette = getAvatarPalette(name || email || 'A');

  return (
    <div className="pa-org-cell-main" style={{ gap: 10 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          color: palette.color,
          display: 'grid',
          placeItems: 'center',
          fontWeight: 700,
          fontSize: 12.5,
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {initial}
      </div>
      <div style={{ minWidth: 0, display: 'grid', gap: 2 }}>
        <div
          className="pa-org-name"
          style={{
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={displayName}
        >
          {displayName}
        </div>
        <div
          className="pa-org-email"
          style={{
            fontSize: 11.5,
            color: '#64748b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={email || ''}
        >
          {email || ''}
        </div>
        {organizationName ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11.5,
              fontWeight: 500,
              color: '#0284c7',
              marginTop: 1,
            }}
            title={organizationName}
          >
            <Building size={11} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 190 }}>
              {organizationName}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
            {translateUi('Tài khoản cá nhân')}
          </span>
        )}
      </div>
    </div>
  );
}

function FeedbacksTable({ type }: { type: 'FEEDBACK' | 'BUG' }) {
  useUiLanguage();
  const queryClient = useQueryClient();
  const isBug = type === 'BUG';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [orgFilter, setOrgFilter] = useState('ALL');
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [viewingItem, setViewingItem] = useState<FeedbackItem | null>(null);

  // Form state inside drawer
  const [drawerStatus, setDrawerStatus] = useState<FeedbackItem['status']>('OPEN');
  const [drawerNote, setDrawerNote] = useState('');

  // Lightbox preview modal state
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['platform-feedbacks', pageIndex, statusFilter, type, search],
    queryFn: () =>
      feedbackService.getAll({
        pageIndex,
        pageSize: 50,
        status: statusFilter || undefined,
        type,
        search: search || undefined,
      }),
  });

  const rawItems = useMemo(() => data?.data?.items ?? [], [data?.data?.items]);
  const totalPages = data?.data?.totalPages ?? 0;
  const totalItems = data?.data?.totalItems ?? rawItems.length;

  // Lấy danh sách tổ chức duy nhất để lọc
  const orgOptions = useMemo(() => {
    const set = new Set<string>();
    rawItems.forEach((i) => {
      if (i.organizationName) set.add(i.organizationName);
    });
    return Array.from(set);
  }, [rawItems]);

  // Lọc thêm theo Module, Tổ chức và Đánh giá sao ở client
  const displayedItems = useMemo(() => {
    let items = rawItems;

    if (isBug && moduleFilter !== 'ALL') {
      items = items.filter((i) => inferModule(i).key === moduleFilter);
    }

    if (orgFilter !== 'ALL') {
      if (orgFilter === 'PERSONAL') {
        items = items.filter((i) => !i.organizationName);
      } else {
        items = items.filter((i) => i.organizationName === orgFilter);
      }
    }

    if (!isBug && starFilter !== null) {
      if (starFilter === 5) items = items.filter((i) => i.rating === 5);
      else if (starFilter === 4) items = items.filter((i) => i.rating === 4);
      else if (starFilter === 3) items = items.filter((i) => (i.rating ?? 0) <= 3 && (i.rating ?? 0) > 0);
    }

    return items;
  }, [rawItems, moduleFilter, orgFilter, starFilter, isBug]);

  // Thống kê nhanh KPI
  const kpiStats = useMemo(() => {
    const openCount = rawItems.filter((i) => i.status === 'OPEN').length;
    const inProgressCount = rawItems.filter((i) => i.status === 'IN_PROGRESS').length;
    const resolvedCount = rawItems.filter((i) => i.status === 'RESOLVED').length;
    const closedCount = rawItems.filter((i) => i.status === 'CLOSED').length;
    const totalResolved = resolvedCount + closedCount;
    const resolveRate = rawItems.length > 0 ? Math.round((totalResolved / rawItems.length) * 100) : 100;

    const ratedItems = rawItems.filter((i) => i.rating != null && i.rating > 0);
    const avgScore =
      ratedItems.length > 0
        ? (ratedItems.reduce((acc, curr) => acc + (curr.rating ?? 0), 0) / ratedItems.length).toFixed(1)
        : '5.0';

    return { total: totalItems, openCount, inProgressCount, resolvedCount, closedCount, totalResolved, resolveRate, avgScore };
  }, [rawItems, totalItems]);

  const mutation = useMutation({
    mutationFn: () =>
      feedbackService.update(viewingItem!.id, {
        status: drawerStatus,
        adminNote: drawerNote || undefined,
      }),
    onSuccess: () => {
      toast.success(translateUi('Cập nhật trạng thái thành công'));
      queryClient.invalidateQueries({ queryKey: ['platform-feedbacks'] });
      setViewingItem(null);
    },
    onError: () => toast.error(translateUi('Cập nhật thất bại. Vui lòng thử lại.')),
  });

  const quickStatusMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status: FeedbackItem['status']; adminNote?: string }) =>
      feedbackService.update(id, {
        status,
        adminNote,
      }),
    onSuccess: (_, variables) => {
      const label = FEEDBACK_STATUS[variables.status]?.label ?? variables.status;
      toast.success(translateUi(`Đã chuyển trạng thái sang: ${label}`));
      queryClient.invalidateQueries({ queryKey: ['platform-feedbacks'] });
      if (viewingItem && viewingItem.id === variables.id) {
        setViewingItem((prev) => (prev ? { ...prev, status: variables.status } : null));
        setDrawerStatus(variables.status);
      }
    },
    onError: () => toast.error(translateUi('Cập nhật trạng thái thất bại. Vui lòng thử lại.')),
  });

  const handleOpenDrawer = (item: FeedbackItem) => {
    setViewingItem(item);
    setDrawerStatus(item.status);
    setDrawerNote(item.adminNote ?? '');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    toast.success(translateUi('Đã sao chép liên kết trang lỗi'));
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleExportCsv = () => {
    if (displayedItems.length === 0) return;
    const headers = isBug
      ? ['Mã sự cố', 'Thời gian', 'Người gửi', 'Email', 'Tiêu đề', 'Khu vực', 'Mô tả', 'Đường dẫn lỗi', 'Tổ chức', 'Trạng thái', 'Phản hồi admin']
      : ['Mã phản hồi', 'Thời gian', 'Người gửi', 'Email', 'Tiêu đề', 'Mô tả', 'Đánh giá (sao)', 'Tổ chức', 'Trạng thái', 'Phản hồi admin'];

    const rows = displayedItems.map((item) => {
      const ticketCode = getTicketCode(item, isBug);
      if (isBug) {
        const mod = inferModule(item);
        return [
          `"${ticketCode}"`,
          `"${formatDateTime(item.createdAt)}"`,
          `"${(item.userName ?? '').replace(/"/g, '""')}"`,
          `"${(item.userEmail ?? '').replace(/"/g, '""')}"`,
          `"${(item.title ?? '').replace(/"/g, '""')}"`,
          `"${mod.label}"`,
          `"${(item.description ?? '').replace(/"/g, '""')}"`,
          `"${(item.pageUrl ?? '').replace(/"/g, '""')}"`,
          `"${(item.organizationName ?? 'Tài khoản cá nhân').replace(/"/g, '""')}"`,
          `"${FEEDBACK_STATUS[item.status]?.label ?? item.status}"`,
          `"${(item.adminNote ?? '').replace(/"/g, '""')}"`,
        ];
      }
      return [
        `"${ticketCode}"`,
        `"${formatDateTime(item.createdAt)}"`,
        `"${(item.userName ?? '').replace(/"/g, '""')}"`,
        `"${(item.userEmail ?? '').replace(/"/g, '""')}"`,
        `"${(item.title ?? '').replace(/"/g, '""')}"`,
        `"${(item.description ?? '').replace(/"/g, '""')}"`,
        `"${item.rating ?? ''}"`,
        `"${(item.organizationName ?? 'Tài khoản cá nhân').replace(/"/g, '""')}"`,
        `"${FEEDBACK_STATUS[item.status]?.label ?? item.status}"`,
        `"${(item.adminNote ?? '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${isBug ? 'bao-cao-su-co-ky-thuat' : 'y-kien-phan-hoi-nguoi-dung'}-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentSt = viewingItem ? FEEDBACK_STATUS[viewingItem.status] : null;
  const currentModule = viewingItem ? inferModule(viewingItem) : null;
  const templates = isBug ? BUG_RESPONSE_TEMPLATES : FEEDBACK_RESPONSE_TEMPLATES;
  const hasActiveFilters = search || statusFilter || moduleFilter !== 'ALL' || orgFilter !== 'ALL' || starFilter !== null;

  return (
    <>
      {/* ✦ 1. HEADER TRANG & NÚT HÀNH ĐỘNG (Chuẩn pa-org-header đồng bộ) */}
      <header className="pa-org-header">
        <div>
          <h1 className="pa-org-title">
            {translateUi(isBug ? 'Báo lỗi' : 'Góp ý')}
          </h1>
          <p className="pa-org-subtitle">
            {translateUi(
              isBug
                ? 'Lỗi người dùng báo từ trong ứng dụng. Cập nhật trạng thái và trả lời người gửi.'
                : 'Góp ý và điểm hài lòng người dùng gửi từ trong ứng dụng.',
            )}
          </p>
        </div>

        <div className="pa-org-actions">
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={() => refetch()}
            disabled={isFetching}
            title={translateUi('Tải lại dữ liệu mới nhất')}
          >
            <RotateCw size={14} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
            <span>{translateUi('Làm mới')}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={handleExportCsv}
            disabled={displayedItems.length === 0}
            title={translateUi('Xuất danh sách sang file CSV')}
          >
            <Download size={14} aria-hidden="true" />
            <span>{translateUi('Xuất CSV')}</span>
          </button>
        </div>
      </header>

      {/* ✦ 2. DẢI CHỈ SỐ KPI THÔNG MINH (INTERACTIVE METRIC STRIP) */}
      <div className="pa-audit-kpi-grid">
        {/* Card 1: Tổng số */}
        <div
          className="pa-audit-kpi-card"
          onClick={() => {
            setStatusFilter('');
            setModuleFilter('ALL');
            setOrgFilter('ALL');
            setStarFilter(null);
            setPageIndex(1);
          }}
          style={{
            cursor: 'pointer',
            borderColor: !statusFilter && moduleFilter === 'ALL' && orgFilter === 'ALL' && starFilter === null ? '#0f172a' : undefined,
            boxShadow: !statusFilter && moduleFilter === 'ALL' && orgFilter === 'ALL' && starFilter === null ? '0 0 0 1px #0f172a' : undefined,
          }}
          title={translateUi('Bấm để xem tất cả')}
        >
          <div className="pa-audit-kpi-icon" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
            {isBug ? <Bug size={18} /> : <MessageSquare size={18} />}
          </div>
          <div>
            <div className="pa-audit-kpi-value">{kpiStats.total}</div>
            <div className="pa-audit-kpi-label">{translateUi(isBug ? 'Báo lỗi' : 'Góp ý')}</div>
          </div>
        </div>

        {/* Card 2: Chờ xử lý */}
        <div
          className="pa-audit-kpi-card"
          onClick={() => {
            setStatusFilter(statusFilter === 'OPEN' ? '' : 'OPEN');
            setPageIndex(1);
          }}
          style={{
            cursor: 'pointer',
            borderColor: statusFilter === 'OPEN' ? '#ea580c' : undefined,
            boxShadow: statusFilter === 'OPEN' ? '0 0 0 1px #ea580c' : undefined,
          }}
          title={translateUi('Bấm để lọc các mục chờ xử lý')}
        >
          <div className="pa-audit-kpi-icon" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
            <Clock size={18} />
          </div>
          <div>
            <div className="pa-audit-kpi-value">{kpiStats.openCount}</div>
            <div className="pa-audit-kpi-label">{translateUi(isBug ? 'Chờ xử lý' : 'Chờ xử lý')}</div>
          </div>
        </div>

        {/* Card 3: Đang xử lý */}
        <div
          className="pa-audit-kpi-card"
          onClick={() => {
            setStatusFilter(statusFilter === 'IN_PROGRESS' ? '' : 'IN_PROGRESS');
            setPageIndex(1);
          }}
          style={{
            cursor: 'pointer',
            borderColor: statusFilter === 'IN_PROGRESS' ? '#0284c7' : undefined,
            boxShadow: statusFilter === 'IN_PROGRESS' ? '0 0 0 1px #0284c7' : undefined,
          }}
          title={translateUi('Bấm để lọc các mục đang xử lý')}
        >
          <div className="pa-audit-kpi-icon" style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
            <RotateCw size={18} />
          </div>
          <div>
            <div className="pa-audit-kpi-value">{kpiStats.inProgressCount}</div>
            <div className="pa-audit-kpi-label">{translateUi(isBug ? 'Đang xử lý' : 'Đang xử lý')}</div>
          </div>
        </div>

        {/* Card 4: Đã giải quyết / Đóng */}
        <div
          className="pa-audit-kpi-card"
          onClick={() => {
            setStatusFilter(statusFilter === 'RESOLVED' ? '' : 'RESOLVED');
            setPageIndex(1);
          }}
          style={{
            cursor: 'pointer',
            borderColor: statusFilter === 'RESOLVED' ? '#16a34a' : undefined,
            boxShadow: statusFilter === 'RESOLVED' ? '0 0 0 1px #16a34a' : undefined,
          }}
          title={translateUi(isBug ? 'Bấm để lọc các mục đã giải quyết' : 'Đánh giá trung bình')}
        >
          <div
            className="pa-audit-kpi-icon"
            style={{
              background: isBug ? '#f0fdf4' : '#fffbeb',
              color: isBug ? '#15803d' : '#b45309',
              border: `1px solid ${isBug ? '#bbf7d0' : '#fde68a'}`,
            }}
          >
            {isBug ? <Check size={18} /> : <Star size={18} />}
          </div>
          <div>
            <div className="pa-audit-kpi-value">
              {isBug ? `${kpiStats.totalResolved} (${kpiStats.resolveRate}%)` : `${kpiStats.avgScore} ★`}
            </div>
            <div className="pa-audit-kpi-label">
              {translateUi(isBug ? 'Đã giải quyết' : 'Điểm hài lòng')}
            </div>
          </div>
        </div>
      </div>

      {/* ✦ 3. KHU VỰC BẢNG DỮ LIỆU & BỘ LỌC TINH GỌN (SINGLE-ROW TOOLBAR) */}
      <section className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
        {/* Thanh công cụ lọc một hàng duy nhất */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {/* Ô tìm kiếm */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 260 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="search"
              placeholder={translateUi(isBug ? 'Tìm theo mã #BUG, tiêu đề, người gửi, email hoặc URL...' : 'Tìm theo tiêu đề, người gửi, email...')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(1);
              }}
              aria-label={translateUi('Tìm kiếm')}
              style={{
                paddingLeft: 34,
                paddingRight: search ? 34 : 12,
                height: 38,
                width: '100%',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                background: '#ffffff',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPageIndex(1);
                }}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 9,
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 2,
                }}
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Lọc theo Khu vực chức năng (chỉ cho Báo lỗi) */}
          {isBug && (
            <div style={{ minWidth: 160 }}>
              <select
                value={moduleFilter}
                onChange={(e) => {
                  setModuleFilter(e.target.value);
                  setPageIndex(1);
                }}
                aria-label={translateUi('Khu vực phát sinh')}
                style={{
                  height: 38,
                  width: '100%',
                  padding: '0 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  background: moduleFilter !== 'ALL' ? '#f0fdf4' : '#ffffff',
                  color: moduleFilter !== 'ALL' ? '#15803d' : '#0f172a',
                  fontWeight: moduleFilter !== 'ALL' ? 600 : 400,
                }}
              >
                {MODULE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {translateUi(o.label)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lọc theo Trạng thái */}
          <div style={{ minWidth: 150 }}>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageIndex(1);
              }}
              aria-label={translateUi('Trạng thái')}
              style={{
                height: 38,
                width: '100%',
                padding: '0 10px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                background: statusFilter ? '#fef3e7' : '#ffffff',
                color: statusFilter ? 'var(--pa-accent-solid, #7c2d12)' : '#0f172a',
                fontWeight: statusFilter ? 600 : 400,
              }}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {translateUi(o.label)}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo Tổ chức nếu có hơn 1 tổ chức */}
          {orgOptions.length > 0 && (
            <div style={{ minWidth: 160 }}>
              <select
                value={orgFilter}
                onChange={(e) => {
                  setOrgFilter(e.target.value);
                  setPageIndex(1);
                }}
                aria-label={translateUi('Tổ chức')}
                style={{
                  height: 38,
                  width: '100%',
                  padding: '0 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  background: orgFilter !== 'ALL' ? '#f0f9ff' : '#ffffff',
                  color: orgFilter !== 'ALL' ? '#0369a1' : '#0f172a',
                  fontWeight: orgFilter !== 'ALL' ? 600 : 400,
                }}
              >
                <option value="ALL">{translateUi('Tất cả tổ chức')}</option>
                <option value="PERSONAL">{translateUi('Tài khoản cá nhân')}</option>
                {orgOptions.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lọc theo Đánh giá sao (chỉ cho Góp ý) */}
          {!isBug && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                type="button"
                className={`pa-audit-chip ${starFilter === 5 ? 'is-active' : ''}`}
                onClick={() => {
                  setStarFilter(starFilter === 5 ? null : 5);
                  setPageIndex(1);
                }}
                style={{ height: 38 }}
              >
                <Star size={13} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                <span>5 {translateUi('sao')}</span>
              </button>
              <button
                type="button"
                className={`pa-audit-chip ${starFilter === 3 ? 'is-active' : ''}`}
                onClick={() => {
                  setStarFilter(starFilter === 3 ? null : 3);
                  setPageIndex(1);
                }}
                style={{ height: 38 }}
              >
                <Star size={13} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                <span>≤ 3 {translateUi('sao')}</span>
              </button>
            </div>
          )}

          {/* Nút Xóa bộ lọc */}
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-ghost btn-small inline-flex items-center gap-1"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setModuleFilter('ALL');
                setOrgFilter('ALL');
                setStarFilter(null);
                setPageIndex(1);
              }}
              style={{ color: '#64748b', fontSize: 12.5, height: 38 }}
            >
              <X size={13} />
              <span>{translateUi('Xóa bộ lọc')}</span>
            </button>
          )}
        </div>

        {isLoading && <Loading />}
        {error && <LoadError error={error} />}

        {displayedItems.length === 0 && !isLoading && (
          <div style={{ padding: '48px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
            {isBug ? <Bug size={36} style={{ color: '#94a3b8', margin: '0 auto 8px' }} /> : <MessageSquare size={36} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />}
            <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0f172a' }}>
              {translateUi('Không có mục nào khớp với bộ lọc')}
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              {translateUi('Thử thay đổi từ khóa tìm kiếm hoặc bấm nút Xóa bộ lọc.')}
            </p>
          </div>
        )}

        {/* ✦ 4. BẢNG DỮ LIỆU SỰ CỐ MẬT ĐỘ CAO (HIGH-DENSITY OPERATIONAL TABLE) */}
        {displayedItems.length > 0 && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 140 }}>{translateUi(isBug ? 'Mã và khu vực' : 'Mã và điểm')}</th>
                  <th>{translateUi('Nội dung')}</th>
                  <th style={{ width: 230 }}>{translateUi('Người gửi')}</th>
                  <th style={{ width: 130 }}>{translateUi('Ngày gửi')}</th>
                  <th style={{ width: 145 }}>{translateUi('Trạng thái')}</th>
                  <th style={{ width: 100, textAlign: 'right' }}>{translateUi('Thao tác')}</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((item) => {
                  const st = FEEDBACK_STATUS[item.status] ?? FEEDBACK_STATUS.OPEN;
                  const ticketCode = getTicketCode(item, isBug);
                  const mod = inferModule(item);
                  const hasScreenshots = item.screenshots && item.screenshots.length > 0;
                  const isRowUpdating = quickStatusMutation.isPending && quickStatusMutation.variables?.id === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="pa-audit-row"
                      onClick={() => handleOpenDrawer(item)}
                      title={translateUi('Bấm để mở chi tiết sự cố và phản hồi')}
                    >
                      {/* Cột 1: Mã ticket & Phân loại khu vực */}
                      <td>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: 12,
                              color: '#334155',
                              background: '#f1f5f9',
                              padding: '2px 6px',
                              borderRadius: 4,
                              width: 'fit-content',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {ticketCode}
                          </span>

                          {isBug ? (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: mod.color,
                                background: mod.bg,
                                border: `1px solid ${mod.border}`,
                                padding: '1px 6px',
                                borderRadius: 4,
                                width: 'fit-content',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {mod.label}
                            </span>
                          ) : (
                            item.rating != null && item.rating > 0 && <Stars count={item.rating} />
                          )}
                        </div>
                      </td>

                      {/* Cột 2: Tiêu đề, đính kèm ảnh và trích đoạn */}
                      <td>
                        <div style={{ display: 'grid', gap: 3, maxWidth: 440 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <strong style={{ fontSize: 13.5, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {translateUi(item.title)}
                            </strong>
                            {hasScreenshots && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: '#0369a1',
                                  background: '#f0f9ff',
                                  border: '1px solid #bae6fd',
                                  padding: '1px 5px',
                                  borderRadius: 4,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  flexShrink: 0,
                                }}
                                title={translateUi(`Có ${item.screenshots!.length} ảnh đính kèm`)}
                              >
                                <ImageIcon size={11} />
                                <span>{item.screenshots!.length} ảnh</span>
                              </span>
                            )}
                          </div>

                          <span
                            style={{
                              fontSize: 12,
                              color: '#64748b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {translateUi(item.description)}
                          </span>

                          {item.pageUrl && (
                            <span
                              style={{
                                fontSize: 11,
                                color: '#94a3b8',
                                fontFamily: 'monospace',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              URL: {item.pageUrl}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cột 3: Người gửi (Avatar pastel + Typography chuẩn admin) */}
                      <td>
                        <FeedbackSenderCell
                          name={item.userName ?? null}
                          email={item.userEmail ?? null}
                          organizationName={item.organizationName ?? null}
                        />
                      </td>

                      {/* Cột 4: Ngày gửi */}
                      <td>
                        <div style={{ display: 'grid', gap: 2 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
                            {formatRelativeTime(item.createdAt)}
                          </span>
                          <span style={{ fontSize: 11.5, color: '#64748b', fontFamily: 'monospace' }}>
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Cột 5: Trạng thái & Đổi nhanh trực tiếp trên bảng */}
                      <td>
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                          <select
                            value={item.status}
                            disabled={isRowUpdating}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newStatus = e.target.value as FeedbackItem['status'];
                              quickStatusMutation.mutate({
                                id: item.id,
                                status: newStatus,
                                adminNote: item.adminNote ?? undefined,
                              });
                            }}
                            title={translateUi('Bấm để đổi nhanh trạng thái')}
                            style={{
                              height: 30,
                              fontSize: 12,
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: st.bg,
                              color: st.color,
                              border: `1px solid ${st.border}`,
                              cursor: 'pointer',
                              outline: 'none',
                              opacity: isRowUpdating ? 0.6 : 1,
                            }}
                          >
                            {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                              <option key={o.value} value={o.value} style={{ background: '#ffffff', color: '#0f172a' }}>
                                {translateUi(o.label)}
                              </option>
                            ))}
                          </select>
                          {isRowUpdating && (
                            <RotateCw size={12} className="animate-spin" style={{ marginLeft: 6, color: '#64748b' }} />
                          )}
                        </div>
                      </td>

                      {/* Cột 6: Thao tác mở chi tiết */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDrawer(item);
                          }}
                          style={{
                            padding: '4px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            borderRadius: 6,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#334155',
                          }}
                          title={translateUi('Xem chi tiết và gửi phản hồi')}
                        >
                          {isBug ? (
                            <Bug size={13} style={{ color: 'var(--pa-accent, #b85c24)' }} />
                          ) : (
                            <MessageSquare size={13} style={{ color: 'var(--pa-accent, #b85c24)' }} />
                          )}
                          <span>{translateUi('Chi tiết')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {displayedItems.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <Pager
              pageIndex={pageIndex}
              totalPages={totalPages}
              totalItems={displayedItems.length}
              onChange={setPageIndex}
            />
          </div>
        )}
      </section>

      {/* ✦ 5. NGĂN KÉO PHẢN HỒI NÂNG CẤP (SLIDE-IN PLATFORM DRAWER) */}
      <PlatformDrawer
        isOpen={viewingItem !== null}
        onClose={() => setViewingItem(null)}
        title={
          viewingItem ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#475569',
                  background: '#f1f5f9',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                }}
              >
                {getTicketCode(viewingItem, isBug)}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {translateUi(viewingItem.title)}
              </span>
            </div>
          ) : (
            ''
          )
        }
        subtitle={
          viewingItem ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', marginTop: 2 }}>
              <Clock size={12} />
              <span>{formatDateTime(viewingItem.createdAt)}</span>
              <span>•</span>
              <span>{isBug ? (currentModule?.label ?? translateUi('Báo lỗi')) : translateUi('Góp ý')}</span>
            </div>
          ) : undefined
        }
        icon={isBug ? Bug : MessageSquare}
        badge={
          currentSt ? (
            <span
              style={{
                fontSize: 11.5,
                padding: '2px 8px',
                borderRadius: 6,
                background: currentSt.bg,
                color: currentSt.color,
                border: `1px solid ${currentSt.border}`,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: currentSt.dot }} />
              {translateUi(currentSt.label)}
            </span>
          ) : undefined
        }
        width={680}
      >
        {viewingItem && (
          <div style={{ display: 'grid', gap: 18 }}>
            {/* Thẻ người gửi & Tổ chức */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'var(--pa-accent-soft, #fef3e7)',
                    color: 'var(--pa-accent-solid, #7c2d12)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: 15,
                    border: '1px solid var(--pa-accent-border, #efc69b)',
                  }}
                >
                  {(viewingItem.userName || viewingItem.userEmail || '?')[0]!.toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#0f172a' }}>
                    {viewingItem.userName || translateUi('Người dùng ẩn danh')}
                  </h4>
                  <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                    {viewingItem.userEmail}
                    {viewingItem.organizationName ? ` · ${viewingItem.organizationName}` : ''}
                  </div>
                </div>
              </div>

              {viewingItem.rating != null && viewingItem.rating > 0 && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 2 }}>
                    {translateUi('Đánh giá')}:
                  </span>
                  <Stars count={viewingItem.rating} showScore />
                </div>
              )}
            </div>

            {/* Đường dẫn phát sinh nếu có */}
            {viewingItem.pageUrl && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: 12.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <ExternalLink size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
                  <span style={{ color: '#64748b', flexShrink: 0 }}>{translateUi('Trang gặp lỗi')}:</span>
                  <code style={{ color: '#0f172a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {viewingItem.pageUrl}
                  </code>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={() => handleCopyUrl(viewingItem.pageUrl!)}
                    style={{ padding: '3px 8px', fontSize: 11.5 }}
                    title={translateUi('Sao chép đường dẫn')}
                  >
                    {copiedUrl ? <CheckCheck size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                    <span>{copiedUrl ? translateUi('Đã chép') : translateUi('Sao chép')}</span>
                  </button>

                  <a
                    href={viewingItem.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost btn-small"
                    style={{ padding: '3px 8px', fontSize: 11.5, color: '#0284c7' }}
                    title={translateUi('Mở trang này trong tab mới')}
                  >
                    <ArrowUpRight size={13} />
                    <span>{translateUi('Mở trang')}</span>
                  </a>
                </div>
              </div>
            )}

            {/* Nội dung chi tiết */}
            <div style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                {translateUi(isBug ? 'Mô tả' : 'Nội dung góp ý / Báo cáo')}:
              </span>
              <div
                style={{
                  background: '#ffffff',
                  padding: '16px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 13.5,
                  color: '#1e293b',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {translateUi(viewingItem.description)}
              </div>
            </div>

            {/* Danh sách ảnh đính kèm kèm Lightbox */}
            {viewingItem.screenshots && viewingItem.screenshots.length > 0 && (
              <div style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ImageIcon size={14} style={{ color: '#64748b' }} />
                  {translateUi('Ảnh chụp màn hình đính kèm')} ({viewingItem.screenshots.length}):
                </span>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {viewingItem.screenshots.map((src, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'relative',
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: '1px solid #cbd5e1',
                        cursor: 'pointer',
                      }}
                      onClick={() => setLightboxSrc(src)}
                      title={translateUi('Bấm để xem phóng to ảnh này')}
                    >
                      <img
                        src={src}
                        alt={translateUi(`Ảnh chụp màn hình ${i + 1}`)}
                        style={{
                          height: 90,
                          width: 140,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(15, 23, 42, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 120ms ease',
                          color: '#fff',
                        }}
                        className="hover:opacity-100"
                      >
                        <ZoomIn size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

            {/* Form cập nhật trạng thái & Phản hồi */}
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                  {translateUi('Trạng thái')}
                </label>
                <select
                  value={drawerStatus}
                  onChange={(e) => setDrawerStatus(e.target.value as FeedbackItem['status'])}
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13.5,
                    color: '#0f172a',
                    background: '#ffffff',
                  }}
                >
                  {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                    <option key={o.value} value={o.value}>
                      {translateUi(o.label)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {translateUi('Trả lời người gửi')}
                  </label>
                  <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                    {drawerNote.length}/2000 {translateUi('ký tự')}
                  </span>
                </div>

                {/* Các mẫu phản hồi nhanh 1 chạm */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={12} style={{ color: 'var(--pa-accent, #b85c24)' }} />
                    {translateUi('Mẫu nhanh')}:
                  </span>
                  {templates.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDrawerNote(tmpl)}
                      style={{
                        fontSize: 11.5,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        cursor: 'pointer',
                        transition: 'all 120ms ease',
                      }}
                      className="hover:border-slate-400"
                    >
                      {translateUi(`Mẫu ${idx + 1}`)}
                    </button>
                  ))}
                </div>

                <textarea
                  value={drawerNote}
                  onChange={(e) => setDrawerNote(e.target.value)}
                  placeholder={translateUi(
                    isBug
                      ? 'Nhập giải pháp hoặc phản hồi tiến độ khắc phục gửi tới người dùng...'
                      : 'Nhập nội dung phản hồi sẽ được gửi tới thông báo của người dùng...',
                  )}
                  maxLength={2000}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    color: '#0f172a',
                    lineHeight: 1.5,
                    resize: 'none',
                    background: '#ffffff',
                  }}
                />
              </div>

              {/* Cụm nút hành động */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setViewingItem(null)}
                  style={{ minHeight: 38, padding: '0 16px', fontSize: 13, fontWeight: 600 }}
                >
                  {translateUi('Đóng')}
                </button>

                <button
                  type="button"
                  className="btn btn-primary inline-flex items-center gap-1.5"
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending}
                  style={{ minHeight: 38, padding: '0 18px', fontSize: 13, fontWeight: 600 }}
                >
                  {mutation.isPending ? (
                    <>
                      <RotateCw size={14} className="animate-spin" />
                      <span>{translateUi('Đang lưu...')}</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{translateUi('Lưu thay đổi')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </PlatformDrawer>

      {/* ✦ 6. LIGHTBOX MODAL XEM ẢNH PHÓNG TO (FULLSCREEN LIGHTBOX OVERLAY) */}
      {lightboxSrc &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
            onClick={() => setLightboxSrc(null)}
          >
            {/* Header thanh điều khiển Lightbox */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                right: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => openScreenshot(lightboxSrc)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ExternalLink size={14} />
                <span>{translateUi('Mở tab mới')}</span>
              </button>

              <button
                type="button"
                onClick={() => setLightboxSrc(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  padding: 8,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                }}
                aria-label={translateUi('Đóng')}
              >
                <X size={20} />
              </button>
            </div>

            {/* Ảnh phóng to */}
            <div
              style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxSrc}
                alt={translateUi('Ảnh chụp màn hình phóng to')}
                style={{
                  maxWidth: '100%',
                  maxHeight: '85vh',
                  objectFit: 'contain',
                  borderRadius: 8,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              />
            </div>
          </div>,
          document.body,
        )}

      <Footer />
    </>
  );
}

export function PlatformFeedbacksPage() {
  useUiLanguage();
  return <FeedbacksTable type="FEEDBACK" />;
}

export function PlatformBugReportsPage() {
  useUiLanguage();
  return <FeedbacksTable type="BUG" />;
}
