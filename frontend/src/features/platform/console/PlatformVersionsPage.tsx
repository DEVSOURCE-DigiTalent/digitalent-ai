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
} from 'lucide-react';

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{1,29}$/;

/**
 * PA-03 / PA-12 · Phiên bản khóa học: catalog version management.
 */
export function PlatformVersionsPage() {
  const { versionNo: param } = useParams<{ versionNo?: string }>();
  const versions = useCatalogVersions();
  const navigate = useNavigate();
  const createDraft = useCreateDraft();
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const selected = param !== undefined ? Number(param) : (versions.data?.draftVersionNo ?? versions.data?.currentVersionNo ?? undefined);
  const version = useCatalogVersion(Number.isFinite(selected) ? selected : undefined);
  const data = versions.data;
  const nextNo = data ? Math.max(0, ...data.items.map((v) => v.versionNo)) + 1 : null;

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
      <div className="pa-page-header">
        <div className="pa-row-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="pa-header-eyebrow">
              <span className="pa-eyebrow-dot" />
              QUẢN TRỊ NỀN TẢNG / PHIÊN BẢN KHÓA HỌC
            </div>
            <h1 className="pa-header-title">Mỗi lần thêm hoặc sửa khóa là một phiên bản.</h1>
            <p className="pa-header-subtitle">
              Phiên bản có neo ⚓ là bản các tổ chức đang dùng. Thêm, sửa khóa trong bản nháp rồi công bố để neo chuyển sang bản mới.
            </p>
          </div>
          {data &&
            (data.draftVersionNo !== null ? (
              selected !== data.draftVersionNo && (
                <Link className="btn btn-primary" to={`/platform/versions/${data.draftVersionNo}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Edit3 size={15} />
                  Mở bản nháp v{data.draftVersionNo}
                </Link>
              )
            ) : (
              canManage && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onCreateDraft}
                  disabled={createDraft.isPending}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={16} />
                  {createDraft.isPending ? 'Đang tạo…' : `Tạo phiên bản v${nextNo}`}
                </button>
              )
            ))}
        </div>
      </div>

      {versions.isLoading && <Loading />}
      {versions.error && <LoadError error={versions.error} />}
      {data && (
        <>
          <AnchorBar versions={data} />
          <div className="pa-ver-layout">
            <VersionList versions={data} selected={selected} />
            <div className="stack pa-min0">
              {version.isLoading && <Loading />}
              {version.error && <LoadError error={version.error} />}
              {version.data && <VersionCourses key={version.data.version.versionNo} detail={version.data} canManage={canManage} />}
            </div>
          </div>
        </>
      )}
      <Footer />
    </>
  );
}

function AnchorBar({ versions }: { versions: CatalogVersionsOutput }) {
  const current = versions.items.find((v) => v.status === 'CURRENT');
  if (!current) return <div className="notice warning">Chưa có phiên bản nào được công bố.</div>;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 22px',
        borderRadius: 14,
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderLeft: '4px solid #d97706',
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: '#fef3c7',
            color: '#d97706',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Anchor size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#b45309', letterSpacing: '0.05em' }}>
              PHIÊN BẢN NEO HIỆN TẠI
            </span>
            <span style={{ padding: '2px 8px', borderRadius: 6, background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 700 }}>
              Đang áp dụng
            </span>
          </div>
          <strong style={{ fontSize: 17, color: '#0f172a', display: 'block', marginTop: 2 }}>Phiên bản v{current.versionNo}</strong>
          <small style={{ fontSize: 12, color: '#64748b' }}>
            {current.courseCount} khóa · {current.frameworkCount} khung · công bố {formatDate(current.publishedAt)}
            {current.publishedByEmail ? ` bởi ${current.publishedByEmail}` : ''}
          </small>
        </div>
      </div>
      <Link
        className="btn btn-light"
        to={`/platform/versions/${current.versionNo}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        Xem khóa của v{current.versionNo}
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function VersionStatus({ version }: { version: CatalogVersionSummary }) {
  if (version.status === 'CURRENT')
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 6,
          background: '#fef3c7',
          color: '#b45309',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        <Anchor size={11} /> Đang dùng
      </span>
    );
  if (version.status === 'DRAFT')
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 6,
          background: '#e0e7ff',
          color: '#4338ca',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        <Edit3 size={11} /> Bản nháp
      </span>
    );
  return <Pill tone="gray">Đã thay</Pill>;
}

function VersionList({ versions, selected }: { versions: CatalogVersionsOutput; selected: number | undefined }) {
  return (
    <nav className="pa-ver-list" aria-label="Các phiên bản" style={{ display: 'grid', gap: 8 }}>
      {versions.items.map((v) => {
        const isCurrent = v.versionNo === selected;
        return (
          <Link
            key={v.versionNo}
            to={`/platform/versions/${v.versionNo}`}
            style={{
              display: 'grid',
              gap: 4,
              padding: '14px 16px',
              borderRadius: 12,
              background: '#fff',
              border: isCurrent ? '1px solid #0f172a' : '1px solid #e2e8f0',
              borderLeft: isCurrent ? '4px solid #d97706' : '1px solid #e2e8f0',
              boxShadow: isCurrent ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
              textDecoration: 'none',
              color: '#0f172a',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>v{v.versionNo}</span>
              <VersionStatus version={v} />
            </div>
            <small style={{ fontSize: 12, color: '#64748b' }}>
              {v.courseCount} khóa · {v.status === 'DRAFT' ? `tạo ${formatDate(v.createdAt)}` : `công bố ${formatDate(v.publishedAt)}`}
            </small>
            {v.status === 'DRAFT' && (
              <small style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>
                {v.newCount} khóa mới · {v.editedCount} đã sửa
              </small>
            )}
            {v.releaseNote && (
              <small style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', marginTop: 2 }}>
                “{v.releaseNote}”
              </small>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function VersionCourses({ detail, canManage }: { detail: CatalogVersionDetail; canManage: boolean }) {
  const { version } = detail;
  const editable = detail.editable && canManage;
  const [adding, setAdding] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [search, setSearch] = useState('');
  const [changedOnly, setChangedOnly] = useState(false);

  const term = search.trim().toLowerCase();
  const rows = detail.courses.filter(
    (c) =>
      (!changedOnly || c.changeKind !== 'UNCHANGED') &&
      (!term || c.title.toLowerCase().includes(term) || c.code.toLowerCase().includes(term) || c.domainName.toLowerCase().includes(term)),
  );
  const groups = [...new Set(rows.map((c) => c.frameworkId))].map((id) => ({
    id,
    name: rows.find((c) => c.frameworkId === id)!.frameworkName,
    courses: rows.filter((c) => c.frameworkId === id),
  }));

  const summary =
    version.status === 'DRAFT'
      ? `Bản nháp chép từ v${version.basedOnVersionNo ?? '—'}: ${version.newCount} khóa mới, ${version.editedCount} khóa đã sửa.`
      : version.status === 'CURRENT'
        ? 'Phiên bản đang áp dụng chính thức toàn hệ thống. Mở bản nháp để thực hiện cập nhật hoặc bổ sung khóa học.'
        : 'Phiên bản lưu trữ lịch sử (chỉ xem).';

  return (
    <>
      {adding && <AddCourseForm versionNo={version.versionNo} onClose={() => setAdding(false)} />}
      <section className="surface pad" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }} aria-labelledby="version-courses">
        <div className="pa-card-head" style={{ marginBottom: 16 }}>
          <div>
            <h2 id="version-courses" className="panel-title" style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              Danh mục khóa học thuộc v{version.versionNo}
            </h2>
            <p className="panel-desc" style={{ fontSize: 13, color: '#64748b' }}>{summary}</p>
          </div>
          {editable && (
            <div className="button-row" style={{ display: 'flex', gap: 8 }}>
              {!adding && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setAdding(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={15} />
                  Thêm khóa học
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPublishing(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Sparkles size={15} />
                Công bố v{version.versionNo}
              </button>
            </div>
          )}
        </div>

        {/* Filter bar */}
        <div className="pa-row-between" style={{ marginBottom: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: 320, flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, mã khóa hoặc lĩnh vực..."
              aria-label="Tìm khóa học"
              style={{ paddingLeft: 34, height: 38, width: '100%', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            />
          </div>
          {version.status === 'DRAFT' && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={changedOnly}
                onChange={(e) => setChangedOnly(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#d97706' }}
              />
              Chỉ khóa đã thay đổi ({detail.courses.filter((c) => c.changeKind !== 'UNCHANGED').length})
            </label>
          )}
        </div>

        <div className="table-scroll" style={{ borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="data-table pa-course-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>KHÓA HỌC & LĨNH VỰC</th>
                <th style={{ padding: '12px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#475569' }}>CẤP ĐỘ</th>
                <th className="num" style={{ padding: '12px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#475569' }}>MÔ ĐUN</th>
                <th className="num" style={{ padding: '12px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#475569' }}>CÂU HỎI</th>
                <th className="num" style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#475569' }}>ĐƠN GIÁ</th>
                <th style={{ padding: '12px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#475569' }}>TRẠNG THÁI</th>
                <th style={{ width: 110, padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#475569' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <CourseGroup key={group.id} name={group.name} courses={group.courses} detail={detail} editable={editable} />
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

function CourseGroup({ name, courses, detail, editable }: { name: string; courses: CatalogCourseRow[]; detail: CatalogVersionDetail; editable: boolean }) {
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

  return (
    <>
      <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <td colSpan={7} style={{ padding: '10px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#0f172a' }}>
              {name}
            </span>
            <span style={{ padding: '2px 8px', borderRadius: 12, background: '#e2e8f0', color: '#475569', fontSize: 11, fontWeight: 600 }}>
              {courses.length} khóa
            </span>
          </div>
        </td>
      </tr>
      {courses.map((c) => {
        const kind = CHANGE_KIND[c.changeKind];
        const levelStyle =
          c.level === 1
            ? { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }
            : c.level === 2
              ? { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' }
              : { bg: '#fffbeb', color: '#d97706', border: '#fde68a' };

        return (
          <tr key={c.courseId} className="pa-row-link" onClick={() => open(c)} style={{ borderTop: '1px solid #f1f5f9' }}>
            <td style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <code style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                  {c.code}
                </code>
                <div>
                  <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>{c.title}</strong>
                  <small style={{ fontSize: 12, color: '#64748b' }}>{c.domainName}</small>
                </div>
              </div>
            </td>
            <td style={{ padding: '12px', textAlign: 'center' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  background: levelStyle.bg,
                  color: levelStyle.color,
                  border: `1px solid ${levelStyle.border}`,
                }}
              >
                {LEVEL_NAMES[c.level] ?? c.levelName}
              </span>
            </td>
            <td className="num" style={{ padding: '12px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
              {c.moduleCount}
            </td>
            <td className="num" style={{ padding: '12px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
              {c.questionCount}
            </td>
            <td className="num" style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>
              {c.level === 1 ? <span style={{ color: '#16a34a' }}>Miễn phí</span> : formatMoney(c.pricePerSeat)}
            </td>
            <td style={{ padding: '12px', textAlign: 'center' }}>
              <Pill tone={kind?.tone}>{kind?.label ?? c.changeKind}</Pill>
              {c.salesStatus === 'PAUSED' && (
                <span style={{ marginLeft: 4 }}>
                  <Pill tone="coral">Tạm ngưng</Pill>
                </span>
              )}
            </td>
            <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
              {confirm === c.courseId ? (
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-small pa-danger" onClick={() => onRemove(c)} disabled={remove.isPending}>
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
                    {editable ? 'Sửa' : 'Xem'}
                    <ArrowRight size={12} />
                  </button>
                  {editable && c.changeKind === 'NEW' && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => setConfirm(c.courseId)}
                      aria-label={`Bỏ ${c.code} khỏi bản nháp`}
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
      })}
    </>
  );
}

function AddCourseForm({ versionNo, onClose }: { versionNo: number; onClose: () => void }) {
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
        <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>
          Hủy
        </button>
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
        <label className="field">
          Lĩnh vực
          <select value={form.domainId} onChange={(e) => setForm({ ...form, domainId: e.target.value })} required>
            <option value="" disabled>
              {framework.isLoading ? 'Đang tải…' : 'Chọn lĩnh vực'}
            </option>
            {(framework.data?.domains ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Cấp độ
          <select value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}>
            {[1, 2, 3].map((l) => (
              <option key={l} value={l}>
                {LEVEL_NAMES[l]}
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
        <label className="field">
          Tên khóa học
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={250} placeholder="VD: Viết câu lệnh AI cho công việc hằng ngày" required />
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
            Sau khi công bố, mốc neo ⚓ sẽ chuyển {currentNo ? `từ v${currentNo} ` : ''}sang <strong>v{versionNo}</strong>. Các tổ chức doanh nghiệp sẽ ngay lập tức được truy cập danh mục khóa học mới.
          </div>

          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', display: 'block', marginBottom: 8 }}>
              Các khóa có thay đổi ({changed.length})
            </span>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
              {changed.map((c) => (
                <li key={c.courseId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Pill tone={CHANGE_KIND[c.changeKind]?.tone}>{CHANGE_KIND[c.changeKind]?.label}</Pill>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.code}</span> · {c.title}
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
                      {item.message}
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
              placeholder="VD: Cập nhật học liệu Thông tư 02 theo lộ trình quý 4/2026..."
              style={{ width: '100%', height: 70, padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Hủy bỏ
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onPublish}
              disabled={!check.data?.canPublish || publish.isPending}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Anchor size={15} />
              {publish.isPending ? 'Đang xuất bản…' : `Xác nhận công bố v${versionNo}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
