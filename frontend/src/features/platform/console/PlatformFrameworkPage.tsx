import { useState, useMemo, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useAddFrameworkDomain,
  useArchiveDomain,
  useFramework,
  useFrameworks,
  usePublishFramework,
  useUpdateDomain,
} from '@/hooks/use-platform-catalog';
import { usePlatformOverview } from '@/hooks/use-platform-admin';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import type { FrameworkDetail, FrameworkDomain } from '@/services/platform-catalog.service';
import { Footer, LoadError } from '../components/pulse-ui';
import { LEVEL_NAMES, errorMessage, formatDate, formatDateTime } from '../components/pulse-format';
import { PlatformFrameworkSkeleton } from './PlatformFrameworkSkeleton';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import {
  Database,
  MessageSquare,
  Palette,
  ShieldCheck,
  Cpu,
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Send,
  History,
  RefreshCw,
  Search,
  X,
  BookOpen,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

const DESCRIPTION_MIN = 10;

const DOMAIN_THEMES = [
  { icon: Database, color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', name: 'Dữ liệu và Thông tin' },
  { icon: MessageSquare, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', name: 'Giao tiếp và Hợp tác' },
  { icon: Palette, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', name: 'Sáng tạo nội dung số' },
  { icon: ShieldCheck, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', name: 'An toàn số' },
  { icon: Cpu, color: '#b45309', bg: '#fef3c7', border: '#fde68a', name: 'Giải quyết vấn đề' },
  { icon: Sparkles, color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', name: 'Trí tuệ nhân tạo (AI)' },
];

/**
 * PA-02 · Khung chuẩn năng lực số doanh nghiệp.
 * Redesigned with Ink & Paper standard: 4-tier hierarchy, enterprise-aligned KPI cards,
 * live search/filter, matched 1:1 skeleton loader, and strict Anti-AI writing compliance.
 */
export function PlatformFrameworkPage() {
  useUiLanguage();
  const list = useFrameworks();
  const frameworkId = list.data?.items[0]?.id;
  const framework = useFramework(frameworkId);
  const overviewQuery = usePlatformOverview();

  const isLoading = list.isLoading || framework.isLoading;

  const handleRefresh = () => {
    void list.refetch();
    void overviewQuery.refetch();
    if (frameworkId) {
      void framework.refetch();
    }
  };

  return (
    <>
      {isLoading && <PlatformFrameworkSkeleton />}
      {list.error && <LoadError error={list.error} />}
      {framework.error && <LoadError error={framework.error} />}

      {!isLoading && list.data && list.data.items.length === 0 && (
        <div className="notice warning" role="alert">
          Chưa có khung chuẩn trong hệ thống. Liên hệ quản trị viên kỹ thuật để khởi tạo dữ liệu mẫu.
        </div>
      )}

      {!isLoading && framework.data && (
        <FrameworkView
          key={framework.data.id}
          framework={framework.data}
          overviewData={overviewQuery.data}
          isRefreshing={list.isFetching || framework.isFetching || overviewQuery.isFetching}
          onRefresh={handleRefresh}
        />
      )}

      <Footer />
    </>
  );
}

interface FrameworkViewProps {
  framework: FrameworkDetail;
  overviewData?: ReturnType<typeof usePlatformOverview>['data'];
  isRefreshing: boolean;
  onRefresh: () => void;
}

function FrameworkView({ framework: f, overviewData: ov, isRefreshing, onRefresh }: FrameworkViewProps) {
  useUiLanguage();
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const publish = usePublishFramework(f.id);

  const [note, setNote] = useState('');
  const [addingDomain, setAddingDomain] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | 1 | 2 | 3>('ALL');

  const drafted = f.domains.filter((d) => d.draftDescription !== d.publishedDescription);
  const tooShort = f.domains.filter((d) => d.draftDescription.trim().length < DESCRIPTION_MIN);
  const unpublished = f.status === 'DRAFT' || drafted.length > 0;
  const [byLevel1, byLevel2, byLevel3] = f.coursesByLevel;

  // Synced with Backend overview data & catalog version
  const currentCatalogVersion = ov?.currentVersionNo ?? f.currentCatalogVersionNo ?? f.currentVersionNo;
  // f.courseCount chỉ đếm khóa của phiên bản đang dùng; ov.courseCount còn tính khóa phiên bản cũ.
  const totalCourses = f.courseCount ?? ov?.courseCount ?? 0;
  const publishedDate = ov?.currentVersionPublishedAt;
  const draftCatalogVersion = ov?.draftVersionNo ?? f.draftCatalogVersionNo;
  const draftNewCourseCount = ov?.draftNewCourseCount ?? f.draftCourseCount ?? 0;

  // Clean framework title without regulatory noise
  const displayTitle = f.name.includes('Thông tư 02/2025')
    ? 'Khung năng lực số'
    : f.name;

  const onPublish = () =>
    publish.mutate(note.trim() || undefined, {
      onSuccess: (result) => {
        setNote('');
        toast.success(`Đã công bố mô tả lĩnh vực (lần ${result.currentVersionNo}).`);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });

  // Filtered domains by search query and level
  const filteredDomains = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return f.domains
      .map((domain) => {
        const matchesLevel = (courseLevel: number) => {
          if (selectedLevel === 'ALL') return true;
          return courseLevel === selectedLevel;
        };

        const matchingCourses = domain.courses.filter(
          (c) =>
            matchesLevel(c.level) &&
            (!q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)),
        );

        const matchingDraftCourses = domain.draftNewCourses.filter(
          (c) =>
            matchesLevel(c.level) &&
            (!q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)),
        );

        const domainNameMatches = domain.name.toLowerCase().includes(q);
        const domainDescMatches =
          domain.publishedDescription.toLowerCase().includes(q) ||
          domain.draftDescription.toLowerCase().includes(q);

        const isDomainMatch = domainNameMatches || domainDescMatches;

        if (q && !isDomainMatch && matchingCourses.length === 0 && matchingDraftCourses.length === 0) {
          return null;
        }

        return {
          ...domain,
          visibleCourses: isDomainMatch && selectedLevel === 'ALL' && !q ? domain.courses : matchingCourses,
          visibleDraftCourses: isDomainMatch && selectedLevel === 'ALL' && !q ? domain.draftNewCourses : matchingDraftCourses,
        };
      })
      .filter((d): d is NonNullable<typeof d> => d !== null);
  }, [f.domains, searchQuery, selectedLevel]);

  return (
    <div className={`pa-ov-stage${isRefreshing ? ' is-refreshing' : ''}`}>
      {/* Page Header */}
      <header className="pa-ov-header">
        <div>
          <h1>{displayTitle}</h1>
          <p className="pa-ov-subtitle">
            {translateUi('6 lĩnh vực năng lực số và các khóa học thuộc từng lĩnh vực.')}
          </p>
        </div>

        <div className="pa-ov-actions">
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Làm mới dữ liệu khung từ máy chủ"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} aria-hidden="true" />
            <span>{translateUi('Làm mới')}</span>
          </button>

          {canManage && !addingDomain && (
            <button
              type="button"
              className="btn btn-primary btn-small inline-flex items-center gap-1.5"
              onClick={() => setAddingDomain(true)}
            >
              <Plus size={14} aria-hidden="true" />
              <span>{translateUi('Thêm lĩnh vực')}</span>
            </button>
          )}
        </div>
      </header>

      {/* Tier 1: Version Status Strip (Aligned with Backend Overview & Catalog) */}
      <div className="pa-ov-version-bar" role="region" aria-label="Trạng thái phiên bản khóa học">
        <div className="pa-ov-version-item">
          <span className="pa-status-dot is-live" aria-hidden="true" />
          <span className="pa-ov-version-label">{translateUi('Phiên bản khóa học đang dùng')}</span>
          <strong className="pa-ov-version-val">
            v{currentCatalogVersion}
          </strong>
          <span className="pa-ov-version-meta">
            {totalCourses} khóa học{publishedDate ? ` · Công bố ${formatDate(publishedDate)}` : ''}
          </span>
        </div>

        <div className="pa-ov-version-divider" aria-hidden="true" />

        <div className="pa-ov-version-item">
          {draftCatalogVersion !== null ? (
            <>
              <span className="pa-status-dot is-amber" style={{ background: '#d97706' }} aria-hidden="true" />
              <span className="pa-ov-version-label">{translateUi('Bản nháp khóa học')}</span>
              <strong className="pa-ov-version-val">v{draftCatalogVersion}</strong>
              <span className="pa-ov-version-meta">
                {draftNewCourseCount > 0
                  ? `+${draftNewCourseCount} khóa mới trong nháp`
                  : 'Đang biên soạn nội dung'}
              </span>
              <Link
                to={`/platform/versions/${draftCatalogVersion}`}
                className="pa-ov-version-link"
              >
                <span>{translateUi('Mở bản nháp')}</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <span className="pa-status-dot" aria-hidden="true" />
              <span className="pa-ov-version-label">{translateUi('Bản nháp khóa học')}</span>
              <span className="pa-ov-version-meta">{translateUi('Không có bản nháp đang mở.')}</span>
              <Link to="/platform/versions" className="pa-ov-version-link">
                <span>{translateUi('Tạo bản nháp mới')}</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Tier 2: 3 KPI cards about the framework itself (course versions live in the strip above) */}
      <div className="pa-ov-kpi-grid pa-kpi-compact pa-kpi-3" role="region" aria-label="Chỉ số tổng hợp khung năng lực">
        {/* KPI 1: Lĩnh vực trụ cột */}
        <div className="pa-ov-kpi-card is-tone-sky">
          <div className="pa-ov-kpi-top">
            <span className="pa-ov-kpi-label">{translateUi('Lĩnh vực')}</span>
            <div className="pa-kpi-icon-box" aria-hidden="true">
              <Layers size={18} />
            </div>
          </div>
          <div className="pa-ov-kpi-val">{f.domainCount}</div>
          <div className="pa-ov-kpi-sub">
            {drafted.length > 0 ? `${drafted.length} lĩnh vực sửa mô tả, chưa công bố` : translateUi('Mô tả đã công bố')}
          </div>
        </div>

        {/* KPI 2: Danh mục khóa học */}
        <div className="pa-ov-kpi-card is-tone-orange">
          <div className="pa-ov-kpi-top">
            <span className="pa-ov-kpi-label">{translateUi('Khóa học')}</span>
            <div className="pa-kpi-icon-box" aria-hidden="true">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="pa-ov-kpi-val">{totalCourses}</div>
          <div className="pa-ov-kpi-sub">
            {`${byLevel1} Cơ bản · ${byLevel2} Trung cấp · ${byLevel3} Nâng cao (v${currentCatalogVersion})`}
          </div>
        </div>

        {/* KPI 3: Mô tả lĩnh vực chờ công bố (điều kiện để công bố khung) */}
        <div className={`pa-ov-kpi-card ${drafted.length > 0 ? 'is-tone-amber' : 'is-tone-green'}`}>
          <div className="pa-ov-kpi-top">
            <span className="pa-ov-kpi-label">{translateUi('Mô tả chờ công bố')}</span>
            <div className="pa-kpi-icon-box" aria-hidden="true">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="pa-ov-kpi-val">{drafted.length}</div>
          <div className="pa-ov-kpi-sub">
            {tooShort.length > 0
              ? `${tooShort.length} mô tả dưới ${DESCRIPTION_MIN} ký tự`
              : translateUi(`Mỗi lĩnh vực có mô tả từ ${DESCRIPTION_MIN} ký tự`)}
          </div>
        </div>
      </div>

      {/* Tier 3: Main Framework Domains Section */}
      <section className="pa-ov-panel" aria-labelledby="domains-title">
        <div className="pa-ov-panel-head" style={{ marginBottom: 14 }}>
          <div>
            <h2 id="domains-title" className="pa-ov-panel-title">
              {f.domains.length} lĩnh vực
            </h2>
          </div>
        </div>

        {/* Quick Search & Level Filter Toolbar */}
        <div className="pa-fw-toolbar">
          <div className="pa-fw-search-box">
            <Search size={15} className="pa-fw-search-icon" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên lĩnh vực, mã khóa hoặc tiêu đề khóa..."
              className="pa-fw-search-input"
              aria-label="Tìm kiếm lĩnh vực hoặc khóa học"
            />
            {searchQuery && (
              <button
                type="button"
                className="pa-fw-search-clear"
                onClick={() => setSearchQuery('')}
                title="Xóa tìm kiếm"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="pa-fw-filter-pills" role="radiogroup" aria-label="Lọc theo cấp độ khóa học">
            <button
              type="button"
              className={`pa-fw-filter-pill${selectedLevel === 'ALL' ? ' is-active' : ''}`}
              onClick={() => setSelectedLevel('ALL')}
            >
              {translateUi('Tất cả')} ({f.courseCount})
            </button>
            <button
              type="button"
              className={`pa-fw-filter-pill${selectedLevel === 1 ? ' is-active' : ''}`}
              onClick={() => setSelectedLevel(1)}
            >
              {translateUi(LEVEL_NAMES[1])} ({byLevel1 ?? 0})
            </button>
            <button
              type="button"
              className={`pa-fw-filter-pill${selectedLevel === 2 ? ' is-active' : ''}`}
              onClick={() => setSelectedLevel(2)}
            >
              {translateUi(LEVEL_NAMES[2])} ({byLevel2 ?? 0})
            </button>
            <button
              type="button"
              className={`pa-fw-filter-pill${selectedLevel === 3 ? ' is-active' : ''}`}
              onClick={() => setSelectedLevel(3)}
            >
              {translateUi(LEVEL_NAMES[3])} ({byLevel3 ?? 0})
            </button>
          </div>
        </div>

        {/* Inline Add Domain Form */}
        {addingDomain && (
          <AddDomainForm
            frameworkId={f.id}
            onClose={() => setAddingDomain(false)}
          />
        )}

        {/* Domains List */}
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredDomains.map((d, i) => (
            <DomainRow
              key={d.id}
              frameworkId={f.id}
              domain={d}
              index={i}
              onlyOne={f.domains.length === 1}
              editable={canManage}
              currentNo={currentCatalogVersion}
              draftNo={draftCatalogVersion}
            />
          ))}
        </div>

        {filteredDomains.length === 0 && (
          <div className="notice" style={{ marginTop: 12 }}>
            <p style={{ margin: 0 }}>
              Không tìm thấy lĩnh vực hoặc khóa học phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
              Thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc cấp độ.
            </p>
          </div>
        )}

        {/* Publish Action Callout Banner */}
        {canManage && (
          <div className={`pa-fw-publish-callout${unpublished ? ' has-drafts' : ''}`}>
            <div className="pa-fw-publish-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  className="pa-fw-publish-icon"
                  style={{
                    background: unpublished ? '#fef3c7' : '#f1f5f9',
                    color: unpublished ? '#b45309' : '#64748b',
                  }}
                >
                  <Send size={18} aria-hidden="true" />
                </div>
                <div>
                  <strong style={{ fontSize: 14.5, color: '#0f172a' }}>
                    {translateUi('Công bố cập nhật khung năng lực')}
                  </strong>
                  <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
                    {tooShort.length > 0
                      ? translateUi(
                          `Cần mô tả ít nhất ${DESCRIPTION_MIN} ký tự trước khi công bố (chưa đủ: ${tooShort.map((d) => d.name).join(', ')}).`,
                        )
                      : unpublished
                        ? translateUi(`${drafted.length} lĩnh vực có mô tả mới trong bản nháp sẵn sàng công bố.`)
                        : translateUi('Chưa có thay đổi nào cần công bố.')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary inline-flex items-center gap-1.5"
                onClick={onPublish}
                disabled={!unpublished || tooShort.length > 0 || publish.isPending}
              >
                <Send size={14} aria-hidden="true" />
                <span>
                  {publish.isPending
                    ? translateUi('Đang công bố…')
                    : translateUi(`Công bố mô tả lĩnh vực (lần ${f.currentVersionNo + 1})`)}
                </span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                placeholder="Ghi chú công bố (không bắt buộc)"
                className="pa-fw-publish-input"
                aria-label="Ghi chú công bố khung chuẩn"
              />
            </div>
          </div>
        )}
      </section>

      {/* Tier 4: Releases History */}
      {f.releases.length > 0 && (
        <section className="pa-ov-panel" aria-labelledby="releases-title">
          <div className="pa-ov-panel-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <History size={18} style={{ color: '#64748b' }} aria-hidden="true" />
              <div>
                <h2 id="releases-title" className="pa-ov-panel-title">
                  {translateUi('Lịch sử công bố')}
                </h2>
                <p className="pa-ov-panel-sub">
                  Các lần công bố mô tả lĩnh vực, áp dụng cho toàn hệ thống.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {f.releases.map((r) => (
              <div key={r.versionNo} className="pa-fw-release-item">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="pa-fw-release-badge">
                      Lần {r.versionNo}
                    </span>
                    <strong style={{ fontSize: 13.5, color: '#0f172a' }}>
                      {r.releaseNote || translateUi('Không có ghi chú')}
                    </strong>
                  </div>
                  <small style={{ fontSize: 12.5, color: '#475569', marginTop: 4, display: 'block' }}>
                    Người thực hiện: {r.publishedByEmail ?? translateUi('Hệ thống')} · {formatDateTime(r.publishedAt)}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface DomainRowProps {
  frameworkId: string;
  domain: FrameworkDomain & { visibleCourses?: FrameworkDomain['courses']; visibleDraftCourses?: FrameworkDomain['draftNewCourses'] };
  index: number;
  onlyOne: boolean;
  editable: boolean;
  currentNo: number | null;
  draftNo: number | null;
}

function DomainRow({
  frameworkId,
  domain: d,
  index,
  onlyOne,
  editable,
  currentNo,
  draftNo,
}: DomainRowProps) {
  useUiLanguage();
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');
  const archive = useArchiveDomain(frameworkId);
  const draftDiffers = d.draftDescription !== d.publishedDescription;

  // Use visible courses if search/filter applied, else standard domain courses
  const sourceCourses = d.visibleCourses ?? d.courses;
  const sourceDraftCourses = d.visibleDraftCourses ?? d.draftNewCourses;

  const courses = [
    ...sourceCourses.map((c) => ({ ...c, isNew: false })),
    ...sourceDraftCourses.map((c) => ({ ...c, isNew: true })),
  ];

  const totalDomainCourses = d.courses.length + d.draftNewCourses.length;

  const label = `Lĩnh vực ${String(index + 1).padStart(2, '0')}`;
  const theme = DOMAIN_THEMES[index % DOMAIN_THEMES.length];
  const Icon = theme.icon;

  const blockedReason = totalDomainCourses > 0
    ? `Lĩnh vực có ${totalDomainCourses} khóa học${d.draftNewCourses.length ? ` (gồm ${d.draftNewCourses.length} khóa mới trong bản nháp v${draftNo})` : ''} nên không xóa được.${d.courses.length ? ' Khóa đã công bố được doanh nghiệp sử dụng nên luôn được giữ lại.' : ' Bỏ các khóa mới khỏi bản nháp trước.'}`
    : onlyOne
      ? 'Khung cần ít nhất một lĩnh vực.'
      : null;

  const onDelete = () =>
    archive.mutate(d.id, {
      onSuccess: () => toast.success(`Đã xóa lĩnh vực ${d.name}.`),
      onError: (err) => toast.error(errorMessage(err)),
    });

  return (
    <div className="pa-fw-domain-card">
      {/* Left Column: Domain Meta, Descriptions & Forms */}
      <div className="pa-fw-domain-left">
        <div className="pa-fw-domain-head">
          <div className="pa-fw-identity-wrap">
            <div
              className="pa-fw-icon-box"
              style={{
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                color: theme.color,
              }}
            >
              <Icon size={22} aria-hidden="true" />
            </div>
            <div>
              <div
                className="pa-fw-domain-tag"
              >
                {translateUi(label)}
              </div>
              <h3 className="pa-fw-domain-title">{d.name}</h3>
            </div>
          </div>

          {editable && mode === 'view' && (
            <div className="pa-fw-domain-actions">
              <button
                type="button"
                className="pa-fw-action-btn"
                onClick={() => setMode('edit')}
                aria-label={translateUi(`Sửa ${d.name}`)}
              >
                <Edit2 size={13} aria-hidden="true" />
                <span>{translateUi('Sửa')}</span>
              </button>
              <button
                type="button"
                className="pa-fw-action-btn is-danger"
                onClick={() => setMode('delete')}
                aria-label={translateUi(`Xóa ${d.name}`)}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {mode === 'edit' ? (
          <DomainEditForm
            frameworkId={frameworkId}
            domain={d}
            label={translateUi(label)}
            onClose={() => setMode('view')}
          />
        ) : (
          <>
            <p className="pa-fw-desc-box">
              {d.publishedDescription || <span className="pa-empty">Chưa có mô tả công bố chính thức.</span>}
            </p>

            {draftDiffers && (
              <div className="pa-fw-draft-alert">
                <strong>Bản nháp chưa công bố:</strong> &ldquo;{d.draftDescription || translateUi('trống')}&rdquo;
              </div>
            )}
          </>
        )}

        {mode === 'delete' &&
          (blockedReason ? (
            <div className="notice warning pa-row-between" role="alert" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={16} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                <span style={{ fontSize: 13, color: '#92400e' }}>{blockedReason}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={() => setMode('view')}
              >
                {translateUi('Đóng')}
              </button>
            </div>
          ) : (
            <div className="notice pa-row-between" role="alert" style={{ marginTop: 8 }}>
              <span style={{ fontSize: 13 }}>
                Xóa lĩnh vực &ldquo;{d.name}&rdquo;? Lĩnh vực sẽ không còn trong khung.
              </span>
              <div className="button-row">
                <button
                  type="button"
                  className="btn btn-small pa-danger"
                  onClick={onDelete}
                  disabled={archive.isPending}
                >
                  {archive.isPending ? 'Đang xóa…' : 'Xóa lĩnh vực'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={() => setMode('view')}
                >
                  {translateUi('Giữ lại')}
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Right Column: Courses in this Domain */}
      <div className="pa-fw-domain-right">
        <div className="pa-fw-courses-header">
          <span>
            {d.courses.length} khóa trong v{currentNo ?? ''}
            {d.draftNewCourses.length ? translateUi(` · +${d.draftNewCourses.length} khóa mới (nháp)`) : ''}
          </span>
        </div>

        <div className="pa-fw-course-list">
          {courses.length > 0 ? (
            courses.map((c) => {
              const levelClass =
                c.level === 1
                  ? 'is-level-1'
                  : c.level === 2
                    ? 'is-level-2'
                    : 'is-level-3';

              return (
                <Link
                  key={`${c.courseId}-${c.isNew}`}
                  to={`/platform/versions/${c.isNew ? draftNo : currentNo}/courses/${c.courseId}`}
                  className="pa-fw-course-item"
                >
                  <div className="pa-fw-course-info">
                    <code className="pa-fw-course-code">
                      {c.code}
                    </code>
                    <span className="pa-fw-course-title" title={c.title}>
                      {translateUi(c.title)}
                    </span>
                  </div>

                  <div className="pa-fw-course-meta">
                    {c.isNew ? (
                      <span className="pa-fw-new-tag">
                        Mới (nháp)
                      </span>
                    ) : (
                      <span className={`pa-fw-level-pill ${levelClass}`}>
                        {c.levelName}
                      </span>
                    )}
                    <ArrowRight size={14} style={{ color: '#64748b' }} aria-hidden="true" />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="notice warning" style={{ margin: 0, fontSize: 13 }}>
              Chưa có khóa học nào thuộc lĩnh vực này. Thêm khóa mới trong bản nháp phiên bản.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Form chỉnh sửa lĩnh vực: tên thay đổi ngay, mô tả lưu vào bản nháp */
function DomainEditForm({
  frameworkId,
  domain: d,
  label,
  onClose,
}: {
  frameworkId: string;
  domain: FrameworkDomain;
  label: string;
  onClose: () => void;
}) {
  useUiLanguage();
  const update = useUpdateDomain(frameworkId);
  const [name, setName] = useState(d.name);
  const [description, setDescription] = useState(d.draftDescription);
  const dirty = name.trim() !== d.name || description.trim() !== d.draftDescription;
  const valid = name.trim().length >= 2;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    update.mutate(
      { domainId: d.id, name: name.trim(), description: description.trim() },
      {
        onSuccess: () => {
          toast.success(`Đã lưu lĩnh vực ${name.trim()}.`, {
            description:
              description.trim() !== d.publishedDescription
                ? 'Mô tả mới sẽ hiển thị với doanh nghiệp sau khi công bố khung.'
                : undefined,
          });
          onClose();
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <form className="pa-domain-edit pa-fw-form-card" onSubmit={submit} aria-label={translateUi(`Sửa ${label}`)}>
      <label className="field">
        {translateUi('Tên lĩnh vực')}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={150}
          autoFocus
          required
        />
      </label>

      <label className="field">
        Mô tả (bản nháp)
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={4000}
          rows={3}
        />
        <small className={`field-hint ${description.trim().length < DESCRIPTION_MIN ? 'pa-error' : ''}`}>
          Cần ít nhất {DESCRIPTION_MIN} ký tự để công bố. Đang công bố: &ldquo;{d.publishedDescription || 'chưa có'}&rdquo;
        </small>
      </label>

      <div className="button-row">
        <button
          type="submit"
          className="btn btn-primary btn-small"
          disabled={!dirty || !valid || update.isPending}
        >
          {update.isPending ? translateUi('Đang lưu…') : translateUi('Lưu')}
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>
          {translateUi('Hủy')}
        </button>
      </div>
    </form>
  );
}

/** Form thêm mới lĩnh vực */
function AddDomainForm({
  frameworkId,
  onClose,
}: {
  frameworkId: string;
  onClose: () => void;
}) {
  useUiLanguage();
  const add = useAddFrameworkDomain(frameworkId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    add.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`Đã thêm lĩnh vực ${name.trim()}.`, {
            description: 'Mô tả sẽ hiển thị với doanh nghiệp sau khi công bố khung.',
          });
          onClose();
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <form className="pa-add-domain pa-fw-form-card" onSubmit={submit} aria-label="Thêm lĩnh vực">
      <div className="pa-fw-form-grid">
        <label className="field">
          Tên lĩnh vực mới
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={150}
            autoFocus
            required
            placeholder="Ví dụ: Dữ liệu khách hàng"
          />
        </label>
        <label className="field">
          {translateUi('Mô tả')}
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={4000}
            placeholder="Năng lực này giúp người học làm được gì trong thực tế công việc"
          />
        </label>
      </div>

      <div className="button-row">
        <button
          type="submit"
          className="btn btn-primary btn-small"
          disabled={name.trim().length < 2 || add.isPending}
        >
          {add.isPending ? 'Đang thêm…' : 'Thêm lĩnh vực'}
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>
          {translateUi('Hủy')}
        </button>
      </div>
    </form>
  );
}
