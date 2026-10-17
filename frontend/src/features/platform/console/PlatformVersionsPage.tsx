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
import { Footer, LoadError, Loading, PageHead, Pill } from '../components/pulse-ui';
import { CHANGE_KIND, LEVEL_NAMES, errorMessage, formatDate, formatMoney } from '../components/pulse-format';

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{1,29}$/;

/**
 * PA-03 / PA-12 · Phiên bản khóa học. Every change to the catalog is a version: the anchor (⚓) marks the version
 * organizations use; courses are added or edited in the draft, then publishing it moves the anchor.
 */
export function PlatformVersionsPage() {
  const { versionNo: param } = useParams<{ versionNo?: string }>();
  const versions = useCatalogVersions();
  const navigate = useNavigate();
  const createDraft = useCreateDraft();
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  // The Admin's working view should open the editable draft first. Explicit version URLs still
  // preserve history/current inspection, while organizations continue to consume CURRENT only.
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
      <PageHead
        eyebrow="Nền tảng / Phiên bản khóa học"
        title="Mỗi lần thêm hoặc sửa khóa là một phiên bản."
        description="Phiên bản có neo ⚓ là bản các tổ chức đang dùng. Thêm, sửa khóa trong bản nháp rồi công bố để neo chuyển sang bản mới."
        actions={
          data &&
          (data.draftVersionNo !== null ? (
            selected !== data.draftVersionNo && (
              <Link className="btn btn-primary" to={`/platform/versions/${data.draftVersionNo}`}>
                Mở bản nháp v{data.draftVersionNo}
              </Link>
            )
          ) : (
            canManage && (
              <button type="button" className="btn btn-primary" onClick={onCreateDraft} disabled={createDraft.isPending}>
                {createDraft.isPending ? 'Đang tạo…' : `+ Tạo phiên bản v${nextNo}`}
              </button>
            )
          ))
        }
      />
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
    <div className="pa-anchor-bar">
      <div className="pa-anchor-main">
        <span className="pa-anchor-icon" aria-hidden="true">
          ⚓
        </span>
        <div>
          <small>Đang dùng</small>
          <strong>Phiên bản v{current.versionNo}</strong>
          <small>
            {current.courseCount} khóa · {current.frameworkCount} khung · công bố {formatDate(current.publishedAt)}
            {current.publishedByEmail ? ` · ${current.publishedByEmail}` : ''}
          </small>
        </div>
      </div>
      <Link className="btn btn-light" to={`/platform/versions/${current.versionNo}`}>
        Xem khóa của v{current.versionNo} →
      </Link>
    </div>
  );
}

function VersionStatus({ version }: { version: CatalogVersionSummary }) {
  if (version.status === 'CURRENT') return <span className="pill pa-pill-gold">⚓ Đang dùng</span>;
  if (version.status === 'DRAFT') return <span className="pill pa-pill-violet">Bản nháp</span>;
  return <Pill tone="gray">Đã thay</Pill>;
}

function VersionList({ versions, selected }: { versions: CatalogVersionsOutput; selected: number | undefined }) {
  return (
    <nav className="pa-ver-list" aria-label="Các phiên bản">
      {versions.items.map((v) => (
        <Link key={v.versionNo} to={`/platform/versions/${v.versionNo}`} className="pa-ver" aria-current={v.versionNo === selected ? 'page' : undefined}>
          <span className="vn">
            v{v.versionNo} <VersionStatus version={v} />
          </span>
          <small>
            {v.courseCount} khóa · {v.status === 'DRAFT' ? `tạo ${formatDate(v.createdAt)}` : `công bố ${formatDate(v.publishedAt)}`}
          </small>
          {v.status === 'DRAFT' && (
            <small>
              {v.newCount} khóa mới · {v.editedCount} đã sửa
            </small>
          )}
          {v.releaseNote && <small className="note">{v.releaseNote}</small>}
        </Link>
      ))}
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
        ? 'Đang dùng — chỉ xem. Muốn sửa, mở bản nháp.'
        : 'Đã được thay — chỉ xem.';

  return (
    <>
      {adding && <AddCourseForm versionNo={version.versionNo} onClose={() => setAdding(false)} />}
      <section className="surface pad" aria-labelledby="version-courses">
        <div className="pa-card-head">
          <div>
            <h2 id="version-courses" className="panel-title">
              Khóa học của v{version.versionNo}
            </h2>
            <p className="panel-desc">{summary}</p>
          </div>
          {editable && (
            <div className="button-row">
              {!adding && (
                <button type="button" className="btn btn-outline" onClick={() => setAdding(true)}>
                  + Thêm khóa học
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={() => setPublishing(true)}>
                Công bố v{version.versionNo}
              </button>
            </div>
          )}
        </div>
        <div className="pa-filters">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên, mã khóa hoặc lĩnh vực" aria-label="Tìm khóa học" />
          {version.status === 'DRAFT' && (
            <label className="pa-check">
              <input type="checkbox" checked={changedOnly} onChange={(e) => setChangedOnly(e.target.checked)} />
              Chỉ khóa đã thay đổi
            </label>
          )}
        </div>
        <div className="table-scroll">
          <table className="data-table pa-course-table">
            <thead>
              <tr>
                <th>Khóa học</th>
                <th>Cấp</th>
                <th className="num">Mô đun</th>
                <th className="num">Câu hỏi</th>
                <th className="num">Giá / suất</th>
                <th>Thay đổi</th>
                <th aria-label="Thao tác" />
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <CourseGroup key={group.id} name={group.name} courses={group.courses} detail={detail} editable={editable} />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="pa-empty">
                    {detail.courses.length === 0 ? 'Phiên bản chưa có khóa học.' : 'Không có khóa học khớp bộ lọc.'}
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
      <tr className="pa-group-row">
        <td colSpan={7}>{name}</td>
      </tr>
      {courses.map((c) => {
        const kind = CHANGE_KIND[c.changeKind];
        return (
          <tr key={c.courseId} className="pa-row-link" onClick={() => open(c)}>
            <td>
              <strong className="pa-cell-title">{c.title}</strong>
              <small className="pa-cell-sub">
                {c.code} · {c.domainName}
              </small>
            </td>
            <td>
              <span className={`pa-level pa-level-${c.level}`}>{LEVEL_NAMES[c.level] ?? c.levelName}</span>
            </td>
            <td className="num">{c.moduleCount}</td>
            <td className="num">{c.questionCount}</td>
            <td className="num">{c.level === 1 ? 'Miễn phí' : formatMoney(c.pricePerSeat)}</td>
            <td>
              <Pill tone={kind?.tone}>{kind?.label ?? c.changeKind}</Pill>
              {c.salesStatus === 'PAUSED' && (
                <>
                  {' '}
                  <Pill tone="coral">Tạm ngưng bán</Pill>
                </>
              )}
            </td>
            <td className="pa-actions" onClick={(e) => e.stopPropagation()}>
              {confirm === c.courseId ? (
                <div className="button-row">
                  <button type="button" className="btn btn-small pa-danger" onClick={() => onRemove(c)} disabled={remove.isPending}>
                    Bỏ khóa này
                  </button>
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirm(null)}>
                    Giữ
                  </button>
                </div>
              ) : (
                <div className="button-row">
                  <button type="button" className={`btn btn-small ${editable ? 'btn-light' : 'btn-outline'}`} onClick={() => open(c)}>
                    {editable ? 'Sửa' : 'Xem'}
                  </button>
                  {editable && c.changeKind === 'NEW' && (
                    <button type="button" className="btn btn-ghost btn-small pa-danger-text" onClick={() => setConfirm(c.courseId)} aria-label={`Bỏ ${c.code} khỏi bản nháp`}>
                      Bỏ
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
    <div className="pa-overlay" onClick={onClose}>
      <div className="pa-dialog" role="dialog" aria-modal="true" aria-labelledby="publish-title" onClick={(e) => e.stopPropagation()}>
        <div className="pa-dialog-head">
          <h2 id="publish-title">Công bố phiên bản v{versionNo}</h2>
          <button ref={closeButton} type="button" className="btn btn-ghost btn-small" onClick={onClose}>
            Đóng
          </button>
        </div>
        <div className="pa-dialog-body">
          <div className="notice">
            Sau khi công bố, neo ⚓ chuyển {currentNo ? `từ v${currentNo} ` : ''}sang v{versionNo}.{currentNo ? ` v${currentNo} vẫn xem lại được nhưng không sửa.` : ''}
          </div>
          <div>
            <span className="mini-label">Thay đổi ({changed.length})</span>
            <ul className="pa-check-list">
              {changed.map((c) => (
                <li key={c.courseId}>
                  <Pill tone={CHANGE_KIND[c.changeKind]?.tone}>{CHANGE_KIND[c.changeKind]?.label}</Pill>
                  <div>
                    <b>{c.code}</b> · {c.title}
                    <small>
                      {c.moduleCount} mô đun · {c.questionCount} câu hỏi · {c.level === 1 ? 'Miễn phí' : formatMoney(c.pricePerSeat)}
                    </small>
                  </div>
                </li>
              ))}
              {changed.length === 0 && <li className="pa-empty">Chưa có khóa nào được thêm hay sửa.</li>}
            </ul>
          </div>
          <div>
            <span className="mini-label">Kiểm tra trước khi công bố</span>
            {check.isLoading && <p className="pa-hint">Đang kiểm tra…</p>}
            {check.error && <LoadError error={check.error} />}
            {check.data && (
              <ul className="pa-check-list">
                {check.data.items.map((item, i) => (
                  <li key={i}>
                    <Pill tone={item.level === 'BLOCK' ? 'coral' : undefined}>{item.level === 'BLOCK' ? 'Chặn' : 'Nên sửa'}</Pill>
                    <div>
                      {item.courseCode && item.courseId ? (
                        <Link to={`/platform/versions/${versionNo}/courses/${item.courseId}`} onClick={onClose}>
                          <b>{item.courseCode}</b>
                        </Link>
                      ) : null}
                      {item.courseCode ? ' · ' : ''}
                      {item.message}
                    </div>
                  </li>
                ))}
                {check.data.items.length === 0 && (
                  <li>
                    <Pill tone="green">Ổn</Pill>
                    <div>Mọi khóa thay đổi đã đủ nội dung, câu hỏi và đề bài cuối khóa.</div>
                  </li>
                )}
              </ul>
            )}
          </div>
          <label className="field">
            Ghi chú phiên bản
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Phiên bản này thay đổi gì, vì sao." />
            <small className="field-hint">Ghi vào nhật ký kiểm tra cùng người công bố.</small>
          </label>
          <div className="button-row">
            <button type="button" className="btn btn-primary" onClick={onPublish} disabled={!check.data?.canPublish || publish.isPending}>
              {publish.isPending ? 'Đang công bố…' : `Công bố v${versionNo} →`}
            </button>
            {check.data && !check.data.canPublish && <small className="pa-hint">Sửa các mục "Chặn" trước khi công bố.</small>}
          </div>
        </div>
      </div>
    </div>
  );
}
