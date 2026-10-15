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
import { Footer, Kpi, ListItem, LoadError, Loading, PageHead } from '../components/pulse-ui';
import { LEVEL_NAMES, errorMessage, formatDateTime } from '../components/pulse-format';

const DESCRIPTION_MIN = 10;

/**
 * PA-02 · Khung chuẩn: the platform's one competency framework (Thông tư 02/2025). Its domains are added, renamed and
 * deleted here (a domain with courses cannot be deleted); new domain descriptions are drafted and reach organizations
 * when the framework is published.
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
      <PageHead
        eyebrow={f.status === 'PUBLISHED' ? `Nền tảng / Khung chuẩn · v${f.currentVersionNo} đang dùng` : 'Nền tảng / Khung chuẩn · bản nháp'}
        title={f.name}
        description={f.description || undefined}
      />
      <div className="grid-3 pa-gap-bottom">
        <Kpi label="Lĩnh vực" value={f.domainCount} hint={f.code} />
        <Kpi
          label={`Khóa học trong v${f.currentCatalogVersionNo ?? '—'}`}
          value={f.courseCount}
          hint={`${LEVEL_NAMES[1]} ${byLevel1 ?? 0} · ${LEVEL_NAMES[2]} ${byLevel2 ?? 0} · ${LEVEL_NAMES[3]} ${byLevel3 ?? 0}`}
        />
        {f.draftCatalogVersionNo !== null ? (
          <Kpi
            label={`Khóa học trong bản nháp v${f.draftCatalogVersionNo}`}
            value={f.draftCourseCount ?? 0}
            hint={<Link to={`/platform/versions/${f.draftCatalogVersionNo}`}>Thêm khóa trong Phiên bản khóa học →</Link>}
          />
        ) : (
          <Kpi label="Bản nháp phiên bản khóa học" value="—" hint={<Link to="/platform/versions">Tạo bản nháp để thêm khóa →</Link>} />
        )}
      </div>

      <section className="surface pad" aria-labelledby="domains-title">
        <div className="pa-card-head">
          <div>
            <h2 id="domains-title" className="panel-title">
              Lĩnh vực và khóa học
            </h2>
            <p className="panel-desc">
              Tên lĩnh vực đổi ngay khi lưu. Mô tả mới lưu vào bản nháp và hiện với doanh nghiệp sau khi công bố. Chỉ xóa được lĩnh vực chưa
              có khóa học.
            </p>
          </div>
          {canManage && !addingDomain && (
            <button type="button" className="btn btn-primary btn-small" onClick={() => setAddingDomain(true)}>
              + Thêm lĩnh vực
            </button>
          )}
        </div>
        {addingDomain && <AddDomainForm frameworkId={f.id} onClose={() => setAddingDomain(false)} />}
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
        {f.domains.length === 0 && <p className="pa-empty">Khung chưa có lĩnh vực.</p>}
        {canManage && (
          <div className="pa-publish-row">
            <span className="mini-label">Công bố mô tả lĩnh vực</span>
            <label className="field">
              Ghi chú khi công bố
              <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Mô tả lĩnh vực thay đổi gì, vì sao." />
            </label>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={onPublish} disabled={!unpublished || tooShort.length > 0 || publish.isPending}>
                {publish.isPending ? 'Đang công bố…' : `Công bố khung v${f.currentVersionNo + 1} →`}
              </button>
            </div>
            <small className="pa-hint">
              {tooShort.length > 0
                ? `Mỗi lĩnh vực cần mô tả ít nhất ${DESCRIPTION_MIN} ký tự trước khi công bố (còn: ${tooShort.map((d) => d.name).join(', ')}).`
                : unpublished
                  ? `${drafted.length} lĩnh vực có mô tả mới chưa công bố.`
                  : 'Không có mô tả nào chưa công bố.'}
            </small>
          </div>
        )}
      </section>

      {f.releases.length > 0 && (
        <section className="surface pad pa-gap-top" aria-labelledby="releases-title">
          <h2 id="releases-title" className="panel-title">
            Lịch sử công bố khung
          </h2>
          {f.releases.map((r) => (
            <ListItem
              key={r.versionNo}
              title={`Khung v${r.versionNo}`}
              detail={[r.releaseNote, r.publishedByEmail, formatDateTime(r.publishedAt)].filter(Boolean).join(' · ')}
            />
          ))}
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
    <div className="pa-domain">
      <div className="stack pa-gap-sm">
        <div className="pa-row-between">
          <span className="mini-label">{label}</span>
          {editable && mode === 'view' && (
            <div className="button-row">
              <button type="button" className="btn btn-light btn-small" onClick={() => setMode('edit')} aria-label={`Sửa ${d.name}`}>
                Sửa
              </button>
              <button type="button" className="btn btn-ghost btn-small pa-danger-text" onClick={() => setMode('delete')} aria-label={`Xóa ${d.name}`}>
                Xóa
              </button>
            </div>
          )}
        </div>
        {mode === 'edit' ? (
          <DomainEditForm frameworkId={frameworkId} domain={d} label={label} onClose={() => setMode('view')} />
        ) : (
          <>
            <h4>{d.name}</h4>
            <p className="pa-domain-desc">{d.publishedDescription || <span className="pa-empty">Chưa có mô tả công bố.</span>}</p>
            {draftDiffers && (
              <small className="pa-hint">
                Mô tả mới chưa công bố: “{d.draftDescription || 'trống'}”
              </small>
            )}
          </>
        )}
        {mode === 'delete' &&
          (blockedReason ? (
            <div className="notice warning pa-row-between" role="alert">
              <span>{blockedReason}</span>
              <button type="button" className="btn btn-ghost btn-small" onClick={() => setMode('view')}>
                Đóng
              </button>
            </div>
          ) : (
            <div className="notice pa-row-between" role="alert">
              <span>Xóa lĩnh vực “{d.name}”? Lĩnh vực sẽ không còn trong khung và không thêm khóa vào được.</span>
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
      <div className="stack pa-gap-sm">
        <span className="mini-label">
          {d.courses.length} khóa trong v{currentNo ?? '—'}
          {d.draftNewCourses.length ? ` · +${d.draftNewCourses.length} trong bản nháp v${draftNo}` : ''}
        </span>
        {courses.length ? (
          courses.map((c) => (
            <Link key={`${c.courseId}-${c.isNew}`} className="pa-course-chip" to={`/platform/versions/${c.isNew ? draftNo : currentNo}/courses/${c.courseId}`}>
              <span>
                <b>{c.code}</b> · {c.title}
              </span>
              {c.isNew ? <span className="pill green">Mới (nháp)</span> : <span className={`pa-level pa-level-${c.level}`}>{c.levelName}</span>}
            </Link>
          ))
        ) : (
          <div className="notice warning">Chưa có khóa học. Thêm khóa trong bản nháp phiên bản khóa học.</div>
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
