import { useState, type FormEvent } from 'react';
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
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import type { FrameworkDetail, FrameworkDomain } from '@/services/platform-catalog.service';
import { Footer, LoadError, Loading } from '../components/pulse-ui';
import { LEVEL_NAMES, errorMessage, formatDateTime } from '../components/pulse-format';
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
  CheckCircle2,
} from 'lucide-react';

const DESCRIPTION_MIN = 10;

const DOMAIN_THEMES = [
  { icon: Database, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', label: 'Lĩnh vực 01 · Dữ liệu & Thông tin' },
  { icon: MessageSquare, color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', label: 'Lĩnh vực 02 · Giao tiếp & Hợp tác' },
  { icon: Palette, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', label: 'Lĩnh vực 03 · Sáng tạo nội dung số' },
  { icon: ShieldCheck, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: 'Lĩnh vực 04 · An toàn số' },
  { icon: Cpu, color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Lĩnh vực 05 · Giải quyết vấn đề' },
  { icon: Sparkles, color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', label: 'Lĩnh vực 06 · Trí tuệ nhân tạo (AI)' },
];

/**
 * PA-02 · Khung chuẩn: the platform's one competency framework (Thông tư 02/2025).
 */
export function PlatformFrameworkPage() {
  const list = useFrameworks();
  const frameworkId = list.data?.items[0]?.id;
  const framework = useFramework(frameworkId);

  return (
    <>
      {(list.isLoading || framework.isLoading) && <Loading />}
      {list.error && <LoadError error={list.error} />}
      {framework.error && <LoadError error={framework.error} />}
      {list.data && list.data.items.length === 0 && <div className="notice warning">Chưa có khung chuẩn.</div>}
      {framework.data && <FrameworkView key={framework.data.id} framework={framework.data} />}
      <Footer />
    </>
  );
}

function FrameworkView({ framework: f }: { framework: FrameworkDetail }) {
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const publish = usePublishFramework(f.id);
  const [note, setNote] = useState('');
  const [addingDomain, setAddingDomain] = useState(false);

  const drafted = f.domains.filter((d) => d.draftDescription !== d.publishedDescription);
  const tooShort = f.domains.filter((d) => d.draftDescription.trim().length < DESCRIPTION_MIN);
  const unpublished = f.status === 'DRAFT' || drafted.length > 0;
  const [byLevel1, byLevel2, byLevel3] = f.coursesByLevel;

  const onPublish = () =>
    publish.mutate(note.trim() || undefined, {
      onSuccess: (result) => {
        setNote('');
        toast.success(`Đã công bố mô tả lĩnh vực · khung v${result.currentVersionNo}`);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });

  return (
    <>
      {/* Page Header */}
      <div className="pa-page-header">
        <div className="pa-row-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="pa-header-eyebrow">
              <span className="pa-eyebrow-dot" />
              QUẢN TRỊ NỀN TẢNG / KHUNG CHUẨN THÔNG TƯ 02/2025
            </div>
            <h1 className="pa-header-title">{f.name}</h1>
            <p className="pa-header-subtitle">
              {f.description || 'Khung năng lực số tham chiếu theo Thông tư 02/2025/TT-BGDĐT: 6 lĩnh vực trụ cột, 18 khóa học chuẩn quốc gia.'}
            </p>
          </div>
          {canManage && !addingDomain && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              onClick={() => setAddingDomain(true)}
            >
              <Plus size={16} />
              Thêm lĩnh vực
            </button>
          )}
        </div>
      </div>

      {/* Bento KPI Grid */}
      <div className="pa-bento-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="pa-bento-card">
          <div className="pa-bento-top">
            <span className="pa-bento-label">LĨNH VỰC NĂNG LỰC</span>
            <Layers size={16} style={{ color: '#0284c7' }} />
          </div>
          <div className="pa-bento-value">{f.domainCount}</div>
          <div className="pa-bento-sub">Chuẩn Thông tư 02/2025/TT-BGDĐT</div>
        </div>

        <div className="pa-bento-card">
          <div className="pa-bento-top">
            <span className="pa-bento-label">KHÓA HỌC TRONG v{f.currentCatalogVersionNo ?? '—'} (ĐANG DÙNG)</span>
            <CheckCircle2 size={16} style={{ color: '#059669' }} />
          </div>
          <div className="pa-bento-value">{f.courseCount}</div>
          <div className="pa-bento-sub">
            {LEVEL_NAMES[1]} {byLevel1 ?? 0} · {LEVEL_NAMES[2]} {byLevel2 ?? 0} · {LEVEL_NAMES[3]} {byLevel3 ?? 0}
          </div>
        </div>

        <div className="pa-bento-card">
          <div className="pa-bento-top">
            <span className="pa-bento-label">BẢN NHÁP BIÊN SOẠN</span>
            <Sparkles size={16} style={{ color: '#d97706' }} />
          </div>
          {f.draftCatalogVersionNo !== null ? (
            <>
              <div className="pa-bento-value">{f.draftCourseCount ?? 0} <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>khóa ở v{f.draftCatalogVersionNo}</span></div>
              <div className="pa-bento-sub">
                <Link to={`/platform/versions/${f.draftCatalogVersionNo}`} style={{ color: '#d97706', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Mở biên soạn phiên bản nháp <ArrowRight size={12} />
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="pa-bento-value" style={{ color: '#94a3b8' }}>—</div>
              <div className="pa-bento-sub">
                <Link to="/platform/versions" style={{ color: '#6366f1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Tạo bản nháp mới <ArrowRight size={12} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Domains Section */}
      <section className="surface pad" aria-labelledby="domains-title" style={{ borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
        <div className="pa-card-head" style={{ marginBottom: 16 }}>
          <div>
            <h2 id="domains-title" className="panel-title" style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              6 Lĩnh vực năng lực số & Các khóa học trực thuộc
            </h2>
            <p className="panel-desc" style={{ fontSize: 13, color: '#64748b' }}>
              Tên lĩnh vực đổi ngay khi lưu. Mô tả mới được lưu vào bản nháp và tự động đồng bộ tới doanh nghiệp sau khi công bố.
            </p>
          </div>
        </div>

        {addingDomain && <AddDomainForm frameworkId={f.id} onClose={() => setAddingDomain(false)} />}

        <div style={{ display: 'grid', gap: 14 }}>
          {f.domains.map((d, i) => (
            <DomainRow
              key={d.id}
              frameworkId={f.id}
              domain={d}
              index={i}
              onlyOne={f.domains.length === 1}
              editable={canManage}
              currentNo={f.currentCatalogVersionNo}
              draftNo={f.draftCatalogVersionNo}
            />
          ))}
        </div>

        {f.domains.length === 0 && <p className="pa-empty">Khung chưa có lĩnh vực nào.</p>}

        {/* Publish Action Callout Banner */}
        {canManage && (
          <div
            style={{
              marginTop: 24,
              padding: '20px 24px',
              borderRadius: 14,
              background: '#f8fafc',
              border: unpublished ? '1px solid #fde68a' : '1px solid #e2e8f0',
              display: 'grid',
              gap: 12,
            }}
          >
            <div className="pa-row-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: unpublished ? '#fef3c7' : '#f1f5f9',
                    color: unpublished ? '#d97706' : '#64748b',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Send size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>Công bố cập nhật khung năng lực</strong>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {tooShort.length > 0
                      ? `Cần mô tả ít nhất ${DESCRIPTION_MIN} ký tự trước khi công bố (chưa đủ: ${tooShort.map((d) => d.name).join(', ')}).`
                      : unpublished
                        ? `${drafted.length} lĩnh vực có mô tả mới trong bản nháp sẵn sàng công bố.`
                        : 'Toàn bộ mô tả lĩnh vực hiện đang đồng bộ với phiên bản công bố.'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onPublish}
                disabled={!unpublished || tooShort.length > 0 || publish.isPending}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Send size={15} />
                {publish.isPending ? 'Đang công bố…' : `Công bố khung v${f.currentVersionNo + 1}`}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                placeholder="Ghi chú công bố (tùy chọn: lý do thay đổi, căn cứ quyết định)..."
                style={{
                  flex: 1,
                  height: 38,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Releases History */}
      {f.releases.length > 0 && (
        <section
          className="surface pad"
          style={{ marginTop: 24, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}
          aria-labelledby="releases-title"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <History size={18} style={{ color: '#64748b' }} />
            <h2 id="releases-title" className="panel-title" style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              Lịch sử các lần công bố khung chuẩn
            </h2>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {f.releases.map((r) => (
              <div
                key={r.versionNo}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: '#0f172a',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    >
                      Khung v{r.versionNo}
                    </span>
                    <strong style={{ fontSize: 13, color: '#0f172a' }}>{r.releaseNote || 'Công bố định kỳ tiêu chuẩn'}</strong>
                  </div>
                  <small style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'block' }}>
                    Người thực hiện: {r.publishedByEmail ?? 'Hệ thống'} · {formatDateTime(r.publishedAt)}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function DomainRow({
  frameworkId,
  domain: d,
  index,
  onlyOne,
  editable,
  currentNo,
  draftNo,
}: {
  frameworkId: string;
  domain: FrameworkDomain;
  index: number;
  onlyOne: boolean;
  editable: boolean;
  currentNo: number | null;
  draftNo: number | null;
}) {
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');
  const archive = useArchiveDomain(frameworkId);
  const draftDiffers = d.draftDescription !== d.publishedDescription;
  const courses = [...d.courses.map((c) => ({ ...c, isNew: false })), ...d.draftNewCourses.map((c) => ({ ...c, isNew: true }))];
  const label = `Lĩnh vực ${String(index + 1).padStart(2, '0')}`;
  const theme = DOMAIN_THEMES[index % DOMAIN_THEMES.length];
  const Icon = theme.icon;

  const blockedReason = courses.length
    ? `Lĩnh vực có ${courses.length} khóa học${d.draftNewCourses.length ? ` (gồm ${d.draftNewCourses.length} khóa mới trong bản nháp v${draftNo})` : ''} nên không xóa được.${d.courses.length ? ' Khóa đã công bố được doanh nghiệp sử dụng nên luôn được giữ lại.' : ' Bỏ các khóa mới khỏi bản nháp trước.'}`
    : onlyOne
      ? 'Khung cần ít nhất một lĩnh vực.'
      : null;

  const onDelete = () =>
    archive.mutate(d.id, {
      onSuccess: () => toast.success(`Đã xóa lĩnh vực ${d.name}.`),
      onError: (err) => toast.error(errorMessage(err)),
    });

  return (
    <div
      style={{
        padding: '20px 24px',
        borderRadius: 14,
        background: '#fff',
        border: '1px solid #e2e8f0',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: 24,
        alignItems: 'start',
      }}
    >
      {/* Left Column: Domain Meta & Description */}
      <div style={{ display: 'grid', gap: 12 }}>
        <div className="pa-row-between" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                color: theme.color,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={20} />
            </div>
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: theme.color,
                }}
              >
                {label}
              </span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{d.name}</h3>
            </div>
          </div>

          {editable && mode === 'view' && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="btn btn-light btn-small"
                onClick={() => setMode('edit')}
                aria-label={`Sửa ${d.name}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 32, padding: '0 10px' }}
              >
                <Edit2 size={13} />
                Sửa
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={() => setMode('delete')}
                aria-label={`Xóa ${d.name}`}
                style={{ color: '#ef4444', height: 32, padding: '0 8px' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {mode === 'edit' ? (
          <DomainEditForm frameworkId={frameworkId} domain={d} label={label} onClose={() => setMode('view')} />
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 13, lineHeight: '1.5', color: '#475569' }}>
              {d.publishedDescription || <span className="pa-empty">Chưa có mô tả công bố.</span>}
            </p>
            {draftDiffers && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  fontSize: 12,
                  color: '#92400e',
                  lineHeight: '1.4',
                }}
              >
                <strong>Bản nháp chưa công bố:</strong> “{d.draftDescription || 'trống'}”
              </div>
            )}
          </>
        )}

        {mode === 'delete' &&
          (blockedReason ? (
            <div className="notice warning pa-row-between" role="alert" style={{ marginTop: 8 }}>
              <span style={{ fontSize: 12 }}>{blockedReason}</span>
              <button type="button" className="btn btn-ghost btn-small" onClick={() => setMode('view')}>
                Đóng
              </button>
            </div>
          ) : (
            <div className="notice pa-row-between" role="alert" style={{ marginTop: 8 }}>
              <span style={{ fontSize: 12 }}>Xóa lĩnh vực “{d.name}”? Lĩnh vực sẽ không còn trong khung.</span>
              <div className="button-row">
                <button type="button" className="btn btn-small pa-danger" onClick={onDelete} disabled={archive.isPending}>
                  {archive.isPending ? 'Đang xóa…' : 'Xóa lĩnh vực'}
                </button>
                <button type="button" className="btn btn-ghost btn-small" onClick={() => setMode('view')}>
                  Giữ lại
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Right Column: Courses in this Domain */}
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
            {d.courses.length} Khóa trong v{currentNo ?? '—'}
            {d.draftNewCourses.length ? ` · +${d.draftNewCourses.length} khóa mới (nháp)` : ''}
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Bấm để mở Studio</span>
        </div>

        {courses.length ? (
          courses.map((c) => {
            const levelClass =
              c.level === 1
                ? { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }
                : c.level === 2
                  ? { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' }
                  : { bg: '#fffbeb', text: '#d97706', border: '#fde68a' };

            return (
              <Link
                key={`${c.courseId}-${c.isNew}`}
                to={`/platform/versions/${c.isNew ? draftNo : currentNo}/courses/${c.courseId}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  textDecoration: 'none',
                  color: '#0f172a',
                  transition: 'all 0.15s ease',
                }}
                className="pa-course-row-link"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <code style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', background: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>
                    {c.code}
                  </code>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {c.isNew ? (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>
                      Mới (nháp)
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: levelClass.bg,
                        color: levelClass.text,
                        border: `1px solid ${levelClass.border}`,
                        fontWeight: 600,
                      }}
                    >
                      {c.levelName}
                    </span>
                  )}
                  <ArrowRight size={14} style={{ color: '#94a3b8' }} />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="notice warning" style={{ margin: 0, fontSize: 12 }}>
            Chưa có khóa học nào. Thêm khóa trong bản nháp phiên bản.
          </div>
        )}
      </div>
    </div>
  );
}

/** Sửa lĩnh vực: the name changes at once, the description goes to the draft. */
function DomainEditForm({ frameworkId, domain: d, label, onClose }: { frameworkId: string; domain: FrameworkDomain; label: string; onClose: () => void }) {
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
          toast.success(`Đã lưu ${name.trim()}.`, {
            description: description.trim() !== d.publishedDescription ? 'Mô tả mới hiện với doanh nghiệp sau khi công bố khung.' : undefined,
          });
          onClose();
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <form className="pa-domain-edit" onSubmit={submit} aria-label={`Sửa ${label}`}>
      <label className="field">
        Tên lĩnh vực
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} autoFocus required />
      </label>
      <label className="field">
        Mô tả (bản nháp)
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={4000} />
        <small className={`field-hint ${description.trim().length < DESCRIPTION_MIN ? 'pa-error' : ''}`}>
          Cần ít nhất {DESCRIPTION_MIN} ký tự để công bố. Đang công bố: “{d.publishedDescription || 'chưa có'}”
        </small>
      </label>
      <div className="button-row">
        <button type="submit" className="btn btn-primary btn-small" disabled={!dirty || !valid || update.isPending}>
          {update.isPending ? 'Đang lưu…' : 'Lưu'}
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>
          Hủy
        </button>
      </div>
    </form>
  );
}

function AddDomainForm({ frameworkId, onClose }: { frameworkId: string; onClose: () => void }) {
  const add = useAddFrameworkDomain(frameworkId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    add.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`Đã thêm lĩnh vực ${name.trim()}.`, { description: 'Mô tả hiện với doanh nghiệp sau khi công bố khung.' });
          onClose();
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return (
    <form className="pa-add-domain" onSubmit={submit} aria-label="Thêm lĩnh vực">
      <div className="inline-fields">
        <label className="field">
          Tên lĩnh vực mới
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} autoFocus required />
        </label>
        <label className="field">
          Mô tả
          <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={4000} placeholder="Năng lực này giúp người học làm được gì" />
        </label>
      </div>
      <div className="button-row">
        <button type="submit" className="btn btn-primary btn-small" disabled={name.trim().length < 2 || add.isPending}>
          {add.isPending ? 'Đang thêm…' : 'Thêm lĩnh vực'}
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>
          Hủy
        </button>
      </div>
    </form>
  );
}
