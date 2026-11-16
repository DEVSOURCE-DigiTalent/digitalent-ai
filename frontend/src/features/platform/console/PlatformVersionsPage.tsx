import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useCatalogVersion,
  useCatalogVersions,
  useCreateCatalogCourse,
  useCreateDraft,
  useFramework,
  useFrameworks,
  usePublishCheck,
  usePublishVersion,
  useRemoveCatalogCourse,
} from '@/hooks/use-platform-catalog';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import type { CatalogCourseRow, CatalogVersionDetail, CatalogVersionSummary, CatalogVersionsOutput } from '@/services/platform-catalog.service';
import { Footer, LoadError, Loading, Pill } from '../components/pulse-ui';
import { CHANGE_KIND, LEVEL_NAMES, errorMessage, formatDate, formatMoney } from '../components/pulse-format';
import {
  Anchor,
  Plus,
  Search,
  ArrowRight,
  Edit3,
  CheckCircle2,
  Trash2,
  X,
  Sparkles,
  RefreshCw,
  Layers,
} from 'lucide-react';

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{1,29}$/;

/**
 * PA-03 / PA-12 · Phiên bản khóa học: catalog version management.
 */
export function PlatformVersionsPage() {
  useUiLanguage();
  const { versionNo: param } = useParams<{ versionNo?: string }>();
  const versions = useCatalogVersions();
  const navigate = useNavigate();
  const createDraft = useCreateDraft();
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const selected = param !== undefined ? Number(param) : (versions.data?.draftVersionNo ?? versions.data?.currentVersionNo ?? undefined);
  const version = useCatalogVersion(Number.isFinite(selected) ? selected : undefined);
  const data = versions.data;
  const items = data?.items ?? [];
  const nextNo = items.length > 0 ? Math.max(0, ...items.map((v) => v.versionNo)) + 1 : 1;

  const handleRefresh = () => {
    void versions.refetch();
    if (selected !== undefined) {
      void version.refetch();
    }
  };

  const onCreateDraft = () =>
    createDraft.mutate(undefined, {
      onSuccess: (draft) => {
        toast.success(`Đã tạo bản nháp v${draft.version.versionNo}`, { description: `Chép toàn bộ khóa của v${draft.version.basedOnVersionNo ?? '—'}.` });
        navigate(`/platform/versions/${draft.version.versionNo}`);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });

  return (
    <>
      <header className="pa-ov-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 aria-label="Mỗi lần thêm hoặc sửa khóa là một phiên bản.">
              {translateUi('Phiên bản khóa học')}
            </h1>
            {data?.currentVersionNo && (
              <span className="pa-rp-version-badge">v{data.currentVersionNo}</span>
            )}
          </div>
          <p className="pa-ov-subtitle">
            {translateUi('Sửa khóa học trong bản nháp, rồi công bố để áp dụng cho mọi tổ chức.')}
          </p>
        </div>

        <div className="pa-ov-actions">
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={handleRefresh}
            disabled={versions.isFetching}
            title="Tải lại danh sách phiên bản từ máy chủ"
          >
            <RefreshCw size={14} className={versions.isFetching ? 'animate-spin' : ''} aria-hidden="true" />
            <span>{versions.isFetching ? translateUi('Đang tải...') : translateUi('Làm mới')}</span>
          </button>

          {data &&
            (data.draftVersionNo !== null ? (
              selected !== data.draftVersionNo && (
                <Link
                  className="btn btn-primary btn-small inline-flex items-center gap-1.5"
                  to={`/platform/versions/${data.draftVersionNo}`}
                >
                  <Edit3 size={14} />
                  <span>{translateUi(`Mở bản nháp v${data.draftVersionNo}`)}</span>
                </Link>
              )
            ) : (
              canManage && (
                <button
                  type="button"
                  className="btn btn-primary btn-small inline-flex items-center gap-1.5"
                  onClick={onCreateDraft}
                  disabled={createDraft.isPending}
                >
                  <Plus size={14} />
                  <span>{createDraft.isPending ? translateUi('Đang tạo…') : translateUi(`Tạo phiên bản v${nextNo}`)}</span>
                </button>
              )
            ))}
        </div>
      </header>

      {versions.isLoading && <Loading />}
      {versions.error && <LoadError error={versions.error} />}
      {data && (
        <div className="pa-ver-layout">
          <VersionList versions={data} selected={selected} />
          <div className="stack pa-min0">
            {version.isLoading && <Loading />}
            {version.error && <LoadError error={version.error} />}
            {version.data && <VersionCourses key={version.data.version.versionNo} detail={version.data} canManage={canManage} />}
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}

function VersionStatus({ version, compact = false }: { version: CatalogVersionSummary; compact?: boolean }) {
  useUiLanguage();
  if (version.status === 'CURRENT') {
    if (compact) {
      return (
        <span className="pa-ver-badge is-live" style={{ padding: '3px 6px' }} title={translateUi("Phiên bản chính thức")}>
          <span className="pa-ver-badge-dot" style={{ margin: 0 }} />
        </span>
      );
    }
    return (
      <span className="pa-ver-badge is-live">
        <span className="pa-ver-badge-dot" />
        {translateUi("Đang dùng")}
      </span>
    );
  }
  if (version.status === 'DRAFT') {
    return (
      <span className="pa-ver-badge is-draft">
        <Edit3 size={11} />
        {translateUi("Bản nháp")}
      </span>
    );
  }
  return (
    <span className="pa-ver-badge is-archived">
      {translateUi("Đã thay thế")}
    </span>
  );
}

function VersionList({ versions, selected }: { versions: CatalogVersionsOutput; selected: number | undefined }) {
  useUiLanguage();
  const current = versions.items.find((v) => v.status === 'CURRENT');
  const draft = versions.items.find((v) => v.status === 'DRAFT');
  const archived = versions.items.filter((v) => v.status === 'RETIRED');
  const standardIds = new Set([current?.versionNo, draft?.versionNo, ...archived.map((v) => v.versionNo)]);
  const others = versions.items.filter((v) => !standardIds.has(v.versionNo));

  const renderCard = (v: CatalogVersionSummary) => {
    const isCurrent = v.versionNo === selected;
    return (
      <Link
        key={v.versionNo}
        to={`/platform/versions/${v.versionNo}`}
        className={`pa-ver-card ${isCurrent ? 'is-selected' : ''}`}
        aria-current={isCurrent ? 'page' : undefined}
      >
        <div className="pa-ver-card-top">
          <span className="pa-ver-card-title">Phiên bản v{v.versionNo}</span>
          <VersionStatus version={v} compact={v.status === 'CURRENT'} />
        </div>
        <div className="pa-ver-card-meta">
          <span>{v.courseCount} {translateUi("khóa")}</span>
          <span className="pa-ver-meta-dot">·</span>
          <span>
            {v.status === 'DRAFT'
              ? translateUi(`tạo ${formatDate(v.createdAt)}`)
              : translateUi(`công bố ${formatDate(v.publishedAt)}`)}
          </span>
        </div>
        {v.status === 'DRAFT' && (
          <div className="pa-ver-changes-tag">
            {v.newCount} khóa mới, {v.editedCount} khóa đã sửa
          </div>
        )}
        {v.releaseNote && (
          <div className="pa-ver-card-note" title={v.releaseNote}>
            “{v.releaseNote}”
          </div>
        )}
      </Link>
    );
  };

  return (
    <nav className="pa-ver-sidebar pa-ver-list" aria-label="Các phiên bản">
      {draft && (
        <div className="pa-ver-section">
          <div className="pa-ver-section-label">Bản nháp</div>
          {renderCard(draft)}
        </div>
      )}
      {current && (
        <div className="pa-ver-section">
          <div className="pa-ver-section-label">Đang dùng</div>
          {renderCard(current)}
        </div>
      )}
      {archived.length > 0 && (
        <div className="pa-ver-section">
          <div className="pa-ver-section-label">Đã thay thế ({archived.length})</div>
          <div className="pa-ver-history-list">
            {archived.map(renderCard)}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <div className="pa-ver-section">
          <div className="pa-ver-section-label">Phiên bản khác</div>
          <div className="pa-ver-history-list">
            {others.map(renderCard)}
          </div>
        </div>
      )}
    </nav>
  );
}

function VersionCourses({ detail, canManage }: { detail: CatalogVersionDetail; canManage: boolean }) {
  useUiLanguage();
  const { version } = detail;
  const editable = detail.editable && canManage;
  const [adding, setAdding] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | number>('ALL');
  const [changedOnly, setChangedOnly] = useState(false);

  const term = search.trim().toLowerCase();
  const rows = detail.courses.filter(
    (c) =>
      (!changedOnly || c.changeKind !== 'UNCHANGED') &&
      (levelFilter === 'ALL' || c.level === levelFilter) &&
      (!term || c.title.toLowerCase().includes(term) || c.code.toLowerCase().includes(term) || c.domainName.toLowerCase().includes(term)),
  );

  const totalCount = detail.courses.length;
  const basicCount = detail.courses.filter((c) => c.level === 1).length;
  const interCount = detail.courses.filter((c) => c.level === 2).length;
  const advCount = detail.courses.filter((c) => c.level === 3).length;
  const changedCount = detail.courses.filter((c) => c.changeKind !== 'UNCHANGED').length;

  const navigate = useNavigate();
  const remove = useRemoveCatalogCourse(detail.version.versionNo);
  const [confirm, setConfirm] = useState<string | null>(null);
  const open = (c: CatalogCourseRow) => navigate(`/platform/versions/${detail.version.versionNo}/courses/${c.courseId}`);

  const onRemove = (c: CatalogCourseRow) =>
    remove.mutate(c.courseId, {
      onSuccess: () => {
        toast.success(`Đã bỏ ${c.code} khỏi bản nháp.`);
        setConfirm(null);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });

  const frameworkName = cleanFrameworkName(detail.courses[0]?.frameworkName || 'Khung chuẩn năng lực số doanh nghiệp');

  const summary =
    version.status === 'DRAFT'
      ? `Sao chép từ v${version.basedOnVersionNo ?? '—'}. ${version.newCount} khóa mới, ${version.editedCount} khóa đã sửa.`
      : version.status === 'CURRENT'
        ? 'Nội dung khóa học đang áp dụng cho mọi tổ chức.'
        : 'Phiên bản lưu trữ lịch sử (chỉ xem).';

  return (
    <>
      {adding && <AddCourseForm versionNo={version.versionNo} onClose={() => setAdding(false)} />}
      <section className="pa-ver-detail-panel" aria-labelledby="version-courses">
        <div className="pa-ver-detail-head">
          <div className="pa-ver-detail-head-left">
            <div className="pa-ver-title-row">
              <h2 id="version-courses" className="panel-title" style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Khóa học trong v{version.versionNo}
              </h2>
              {version.status !== 'CURRENT' && <VersionStatus version={version} />}
            </div>
            <p className="panel-desc" style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{summary}</p>
          </div>
          {editable && (
            <div className="pa-ver-detail-actions">
              {!adding && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setAdding(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, fontSize: 13 }}
                >
                  <Plus size={15} />
                  Thêm khóa học
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPublishing(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, fontSize: 13 }}
              >
                <Sparkles size={15} />
                Công bố v{version.versionNo}
              </button>
            </div>
          )}
        </div>

        {/* Filter toolbar */}
        <div className="pa-ver-filter-toolbar">
          <div className="pa-ver-search-box">
            <Search size={15} className="pa-ver-search-icon" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, mã khóa hoặc lĩnh vực..."
              aria-label={translateUi("Tìm khóa học")}
              className="pa-ver-search-input"
            />
            {search && (
              <button
                type="button"
                className="pa-ver-search-clear"
                onClick={() => setSearch('')}
                aria-label="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="pa-ver-filter-group">
            <div className="pa-ver-level-tabs" role="group" aria-label="Lọc theo cấp độ">
              <button
                type="button"
                className={`pa-ver-level-tab ${levelFilter === 'ALL' ? 'is-active' : ''}`}
                onClick={() => setLevelFilter('ALL')}
              >
                Tất cả ({totalCount})
              </button>
              <button
                type="button"
                className={`pa-ver-level-tab ${levelFilter === 1 ? 'is-active' : ''}`}
                onClick={() => setLevelFilter(1)}
              >
                Cơ bản ({basicCount})
              </button>
              <button
                type="button"
                className={`pa-ver-level-tab ${levelFilter === 2 ? 'is-active' : ''}`}
                onClick={() => setLevelFilter(2)}
              >
                Trung cấp ({interCount})
              </button>
              <button
                type="button"
                className={`pa-ver-level-tab ${levelFilter === 3 ? 'is-active' : ''}`}
                onClick={() => setLevelFilter(3)}
              >
                Nâng cao ({advCount})
              </button>
            </div>

            {version.status === 'DRAFT' && (
              <label className="pa-ver-changed-toggle">
                <input
                  type="checkbox"
                  checked={changedOnly}
                  onChange={(e) => setChangedOnly(e.target.checked)}
                />
                Chỉ khóa đã thay đổi ({changedCount})
              </label>
            )}
          </div>
        </div>

        <div className="pa-ver-table-wrapper">
          <div className="pa-ver-table-context-strip">
            <div className="pa-ver-table-context-left">
              <Layers size={14} className="pa-ver-context-icon" />
              <span className="pa-ver-context-title">{frameworkName}</span>
            </div>
            <span className="pa-ver-context-meta">
              {term || levelFilter !== 'ALL' || changedOnly
                ? `Hiển thị ${rows.length} / ${totalCount} khóa`
                : `${totalCount} khóa học`}
            </span>
          </div>

          <table className="pa-ver-table pa-course-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', minWidth: 260 }}>Khóa học</th>
                <th style={{ textAlign: 'center', width: 110 }}>{translateUi("Cấp độ")}</th>
                <th style={{ textAlign: 'center', width: 85 }}>Mô đun</th>
                <th style={{ textAlign: 'center', width: 85 }}>Câu hỏi</th>
                <th style={{ textAlign: 'right', width: 120 }}>{translateUi("Giá mỗi suất")}</th>
                <th style={{ textAlign: 'center', width: 110 }}>{translateUi("Thay đổi")}</th>
                <th style={{ width: 105, textAlign: 'right' }}>{translateUi("Thao tác")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <CourseRowItem
                  key={c.courseId}
                  c={c}
                  editable={editable}
                  open={open}
                  onRemove={onRemove}
                  confirm={confirm}
                  setConfirm={setConfirm}
                  isRemoving={remove.isPending}
                />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                    {detail.courses.length === 0 ? 'Phiên bản chưa có khóa học nào.' : 'Không có khóa học nào khớp bộ lọc.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {publishing && <PublishDialog detail={detail} onClose={() => setPublishing(false)} />}
    </>
  );
}

function cleanFrameworkName(rawName: string): string {
  const sanitized = rawName.replace(/\s*\(?Thông tư\s*02\/2025[^)]*\)?/gi, '').trim();
  return sanitized || 'Khung chuẩn năng lực số doanh nghiệp';
}

function CourseRowItem({
  c,
  editable,
  open,
  onRemove,
  confirm,
  setConfirm,
  isRemoving,
}: {
  c: CatalogCourseRow;
  editable: boolean;
  open: (c: CatalogCourseRow) => void;
  onRemove: (c: CatalogCourseRow) => void;
  confirm: string | null;
  setConfirm: (id: string | null) => void;
  isRemoving: boolean;
}) {
  useUiLanguage();
  const kind = CHANGE_KIND[c.changeKind];
  const levelClass = c.level === 1 ? 'is-basic' : c.level === 2 ? 'is-inter' : 'is-adv';

  return (
    <tr className="pa-ver-course-row pa-row-link" onClick={() => open(c)}>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="pa-ver-code-badge">
            {c.code}
          </span>
          <div>
            <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>{translateUi(c.title)}</strong>
            <small style={{ fontSize: 12, color: '#64748b' }}>{translateUi(c.domainName)}</small>
          </div>
        </div>
      </td>
      <td style={{ textAlign: 'center' }}>
        <span className={`pa-ver-level-badge ${levelClass}`}>
          {translateUi(LEVEL_NAMES[c.level]) ?? c.levelName}
        </span>
      </td>
      <td style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        {c.moduleCount}
      </td>
      <td style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        {c.questionCount}
      </td>
      <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        {c.level === 1 ? <span style={{ color: '#16a34a' }}>{translateUi("Miễn phí")}</span> : formatMoney(c.pricePerSeat)}
      </td>
      <td style={{ textAlign: 'center' }}>
        <Pill tone={kind?.tone}>{translateUi(kind?.label) ?? c.changeKind}</Pill>
        {c.salesStatus === 'PAUSED' && (
          <span style={{ marginLeft: 4 }}>
            <Pill tone="coral">Tạm ngưng</Pill>
          </span>
        )}
      </td>
      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
        {confirm === c.courseId ? (
          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-small pa-danger" onClick={() => onRemove(c)} disabled={isRemoving}>
              Bỏ
            </button>
            <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirm(null)}>
              Giữ
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-small btn-light"
              onClick={() => open(c)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 30, padding: '0 10px' }}
            >
              {editable ? translateUi('Sửa') : translateUi('Xem')}
              <ArrowRight size={12} />
            </button>
            {editable && c.changeKind === 'NEW' && (
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={() => setConfirm(c.courseId)}
                aria-label={translateUi(`Bỏ ${c.code} khỏi bản nháp`)}
                style={{ color: '#ef4444', height: 30, padding: '0 6px' }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

function AddCourseForm({ versionNo, onClose }: { versionNo: number; onClose: () => void }) {
  useUiLanguage();
  const navigate = useNavigate();
  const frameworks = useFrameworks();
  const create = useCreateCatalogCourse(versionNo);
  const [form, setForm] = useState({ frameworkId: '', domainId: '', level: 1, code: '', title: '' });
  const frameworkId = form.frameworkId || frameworks.data?.items[0]?.id || '';
  const framework = useFramework(frameworkId || undefined);
  const codeValid = CODE_PATTERN.test(form.code.trim().toUpperCase());
  const valid = codeValid && form.title.trim().length >= 3 && Boolean(form.domainId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate(
      { code: form.code.trim().toUpperCase(), title: form.title.trim(), domainId: form.domainId, level: form.level },
      {
        onSuccess: (course) => {
          toast.success(`Đã thêm ${course.code} vào bản nháp v${versionNo}.`, { description: 'Tiếp theo: thêm mô đun và nội dung.' });
          navigate(`/platform/versions/${versionNo}/courses/${course.courseId}`);
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <form className="surface pad" onSubmit={submit} aria-labelledby="add-course-title">
      <div className="pa-card-head">
        <h2 id="add-course-title" className="panel-title">
          Thêm khóa học vào v{versionNo}
        </h2>
        <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>{translateUi("Hủy")}</button>
      </div>
      <div className="pa-fields-3">
        <label className="field">
          Khung chuẩn
          <select value={frameworkId} onChange={(e) => setForm({ ...form, frameworkId: e.target.value, domainId: '' })}>
            {(frameworks.data?.items ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
                {f.status === 'DRAFT' ? ' (nháp)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="field">{translateUi("Lĩnh vực")}<select value={form.domainId} onChange={(e) => setForm({ ...form, domainId: e.target.value })} required>
            <option value="" disabled>
              {framework.isLoading ? translateUi('Đang tải…') : 'Chọn lĩnh vực'}
            </option>
            {(framework.data?.domains ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">{translateUi("Cấp độ")}<select value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}>
            {[1, 2, 3].map((l) => (
              <option key={l} value={l}>
                {translateUi(LEVEL_NAMES[l])}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="inline-fields">
        <label className="field">
          Mã khóa học
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} maxLength={30} placeholder="VD: AI1-F" required />
          <small className={`field-hint ${form.code && !codeValid ? 'pa-error' : ''}`}>Chữ in hoa, chữ số, dấu gạch ngang; không trùng khóa khác.</small>
        </label>
        <label className="field">{translateUi("Tên khóa học")}<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={250} placeholder="VD: Viết câu lệnh AI cho công việc hằng ngày" required />
        </label>
      </div>
      <p className="field-hint">
        {form.level === 1 ? 'Khóa Cơ bản luôn miễn phí.' : 'Giá mặc định theo cấp, sửa được trong trang soạn khóa.'} Khóa mới chỉ hiện với tổ chức sau khi công bố v
        {versionNo}.
      </p>
      <button type="submit" className="btn btn-primary" disabled={!valid || create.isPending}>
        {create.isPending ? 'Đang thêm…' : 'Thêm và soạn nội dung →'}
      </button>
    </form>
  );
}

function PublishDialog({ detail, onClose }: { detail: CatalogVersionDetail; onClose: () => void }) {
  useUiLanguage();
  const versionNo = detail.version.versionNo;
  const check = usePublishCheck(versionNo, true);
  const publish = usePublishVersion(versionNo);
  const versions = useCatalogVersions();
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const closeButton = useRef<HTMLButtonElement>(null);
  const changed = detail.courses.filter((c) => c.changeKind !== 'UNCHANGED');
  const currentNo = versions.data?.currentVersionNo;

  useEffect(() => {
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onPublish = () =>
    publish.mutate(note.trim() || undefined, {
      onSuccess: () => {
        toast.success(`Đã công bố v${versionNo}`, { description: 'Neo đã chuyển sang phiên bản mới.' });
        onClose();
        navigate(`/platform/versions/${versionNo}`);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });

  return (
    <div className="pa-overlay" onClick={onClose} style={{ display: 'grid', placeItems: 'center', background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, position: 'fixed', inset: 0 }}>
      <div
        className="pa-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '92%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', borderRadius: 16, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', color: '#d97706', display: 'grid', placeItems: 'center' }}>
              <Anchor size={18} />
            </div>
            <div>
              <h2 id="publish-title" style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                Công bố phiên bản v{versionNo}
              </h2>
              <small style={{ fontSize: 12, color: '#64748b' }}>Chuyển mốc neo chính thức của nền tảng</small>
            </div>
          </div>
          <button ref={closeButton} type="button" className="btn btn-ghost btn-small" onClick={onClose} style={{ padding: 6, borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'grid', gap: 18 }}>
          <div style={{ padding: '12px 16px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 13, color: '#1e40af' }}>
            Sau khi công bố, mốc neo ⚓ sẽ chuyển {currentNo ? translateUi(`từ v${currentNo} `) : ''}sang <strong>v{versionNo}</strong>. Các tổ chức doanh nghiệp sẽ ngay lập tức được truy cập danh mục khóa học mới.
          </div>

          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', display: 'block', marginBottom: 8 }}>
              Các khóa có thay đổi ({changed.length})
            </span>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
              {changed.map((c) => (
                <li key={c.courseId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Pill tone={CHANGE_KIND[c.changeKind]?.tone}>{translateUi(CHANGE_KIND[c.changeKind]?.label)}</Pill>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.code}</span> · {translateUi(c.title)}
                  </div>
                  <small style={{ color: '#64748b' }}>
                    {c.moduleCount} mô đun · {c.questionCount} câu hỏi
                  </small>
                </li>
              ))}
              {changed.length === 0 && <li style={{ padding: '8px 12px', fontSize: 13, color: '#64748b', fontStyle: 'italic' }}>Chưa có khóa nào được thêm hay sửa.</li>}
            </ul>
          </div>

          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', display: 'block', marginBottom: 8 }}>
              Kiểm tra điều kiện xuất bản
            </span>
            {check.isLoading && <p style={{ fontSize: 13, color: '#64748b' }}>Đang tự động rà soát nội dung…</p>}
            {check.error && <LoadError error={check.error} />}
            {check.data && (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {check.data.items.map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: item.level === 'BLOCK' ? '#fff1f2' : '#fffbeb', border: item.level === 'BLOCK' ? '1px solid #fecdd3' : '1px solid #fde68a', fontSize: 13 }}>
                    <span style={{ padding: '2px 6px', borderRadius: 4, background: item.level === 'BLOCK' ? '#e11d48' : '#d97706', color: '#fff', fontSize: 10, fontWeight: 800 }}>
                      {item.level === 'BLOCK' ? 'CHẶN' : 'NÊN SỬA'}
                    </span>
                    <div style={{ flex: 1, color: item.level === 'BLOCK' ? '#9f1239' : '#92400e' }}>
                      {item.courseCode && item.courseId ? (
                        <Link to={`/platform/versions/${versionNo}/courses/${item.courseId}`} onClick={onClose} style={{ fontWeight: 700, color: 'inherit', textDecoration: 'underline' }}>
                          {item.courseCode}
                        </Link>
                      ) : null}
                      {item.courseCode ? ' · ' : ''}
                      {translateUi(item.message)}
                    </div>
                  </li>
                ))}
                {check.data.items.length === 0 && (
                  <li style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 13, color: '#166534' }}>
                    <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                    <div>Đạt chuẩn: Mọi khóa thay đổi đã đầy đủ nội dung, câu hỏi và đề bài kiểm tra cuối khóa.</div>
                  </li>
                )}
              </ul>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
              Ghi chú phát hành phiên bản
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              placeholder="VD: Cập nhật chuẩn hóa nội dung học liệu quý 4/2026..."
              style={{ width: '100%', height: 70, padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>{translateUi("Hủy bỏ")}</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onPublish}
              disabled={!check.data?.canPublish || publish.isPending}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Anchor size={15} />
              {publish.isPending ? 'Đang xuất bản…' : translateUi(`Xác nhận công bố v${versionNo}`)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
