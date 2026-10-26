import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useCatalogCourse, useCatalogVersions, useCourseEdit, useCreateDraft } from '@/hooks/use-platform-catalog';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { platformCatalogService, type CatalogCourseDetail } from '@/services/platform-catalog.service';
import { Footer, LoadError, Loading, PageHead, Pill } from '../components/pulse-ui';
import { CHANGE_KIND, LEVEL_NAMES, errorMessage, formatMoney } from '../components/pulse-format';
import type { CourseEdit } from '../builder/builder-types';
import { CourseInfoForm } from '../builder/CourseInfoForm';
import { FinalEditor } from '../builder/FinalEditor';
import { LearnerPreview } from '../builder/LearnerPreview';
import { ModuleEditor } from '../builder/ModuleEditor';

type Section = 'info' | 'final' | number;

const two = (n: number) => String(n).padStart(2, '0');

/**
 * PA-04 · Soạn khóa học: a course of one catalog version. In the draft version everything is editable and saved as
 * it changes (outline: course info → modules → course-final); published versions are read-only.
 */
export function PlatformCourseBuilderPage() {
  const params = useParams<{ versionNo: string; courseId: string }>();
  const versionNo = Number(params.versionNo);
  const courseId = params.courseId!;
  const course = useCatalogCourse(Number.isFinite(versionNo) ? versionNo : undefined, courseId);

  return (
    <>
      {course.isLoading && <Loading />}
      {course.error && <LoadError error={course.error} />}
      {course.data && <Builder key={`${versionNo}-${courseId}`} course={course.data} />}
      <Footer />
    </>
  );
}

function Builder({ course }: { course: CatalogCourseDetail }) {
  const [params, setParams] = useSearchParams();
  const { can } = usePermission();
  const editable = course.editable && can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const courseEdit = useCourseEdit(course.versionNo, course.courseId);
  const edit: CourseEdit = (fn) => courseEdit.mutateAsync(fn);
  const [preview, setPreview] = useState(false);
  const [newModule, setNewModule] = useState(false);
  const [showInspector, setShowInspector] = useState(true);

  const totalBlocks = course.modules.reduce((sum, m) => sum + m.blocks.length, 0);
  const totalQuestions = course.modules.reduce((sum, m) => sum + m.questions.length, 0);
  const criteriaCount = course.final?.criteria?.length || 0;
  const estimatedMinutes = Math.max(15, totalBlocks * 4 + totalQuestions * 2 + (criteriaCount > 0 ? 30 : 0));

  const raw = params.get('s');
  const section: Section =
    raw === 'final' ? 'final' : raw !== null && /^\d+$/.test(raw) && Number(raw) < course.modules.length ? Number(raw) : 'info';
  const go = (target: Section) => {
    setParams(target === 'info' ? {} : { s: String(target) }, { replace: true });
    setNewModule(false);
    window.scrollTo?.({ top: 0 });
  };

  const status = course.versionStatus === 'DRAFT' ? `Bản nháp v${course.versionNo}` : `v${course.versionNo}`;
  const kind = CHANGE_KIND[course.changeKind];

  return (
    <>
      <PageHead
        eyebrow={`${status} · ${course.changeKind === 'NEW' ? 'khóa mới' : course.code}`}
        title={course.title || 'Khóa học mới'}
        description={`${course.frameworkName} · ${course.domainName} · ${course.levelName}`}
        actions={
          <>
            <Link className="btn btn-outline" to={`/platform/versions/${course.versionNo}`}>
              ← Phiên bản v{course.versionNo}
            </Link>
            <button
              type="button"
              className={`btn ${showInspector ? 'btn-outline' : 'btn-light'}`}
              onClick={() => setShowInspector((v) => !v)}
              title="Bật/tắt thanh thông số & chuẩn TT02"
            >
              {showInspector ? 'Chế độ tập trung (Zen)' : 'Hiện bảng thông số'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setPreview(true)} disabled={course.modules.length === 0}>
              Xem như nhân viên
            </button>
          </>
        }
      />
      {!course.editable && <ReadOnlyBar course={course} />}
      {editable && (
        <p className="pa-save-line" aria-live="polite">
          {kind && <Pill tone={kind.tone}>{kind.label}</Pill>}
          <span>{courseEdit.isPending ? 'Đang lưu…' : `Mọi thay đổi được lưu ngay vào bản nháp v${course.versionNo}.`}</span>
        </p>
      )}
      <div className={`pa-builder ${showInspector ? '' : 'no-inspector'}`}>
        <nav className="pa-outline" aria-label="Cấu trúc khóa học">
          <button type="button" className="pa-ol-item" aria-current={section === 'info' ? 'step' : undefined} onClick={() => go('info')}>
            <b>i</b>
            <span>
              <strong>Thông tin khóa học</strong>
              <small>
                {LEVEL_NAMES[course.level]} · {course.pricePerSeat ? formatMoney(course.pricePerSeat) : 'Miễn phí'}
              </small>
            </span>
          </button>
          <span className="pa-ol-label">Mô đun</span>
          {course.modules.map((m) => (
            <button
              key={m.moduleId}
              type="button"
              className="pa-ol-item"
              aria-current={section === m.index ? 'step' : undefined}
              onClick={() => go(m.index)}
            >
              <b>{two(m.index + 1)}</b>
              <span>
                <strong>{m.title || 'Mô đun chưa đặt tên'}</strong>
                <small>
                  {m.blocks.length} khối · {m.questions.length} câu hỏi
                </small>
              </span>
            </button>
          ))}
          {editable &&
            (newModule ? (
              <NewModuleForm
                edit={edit}
                onDone={(index) => (index === null ? setNewModule(false) : go(index))}
              />
            ) : (
              <button type="button" className="pa-ol-add" onClick={() => setNewModule(true)}>
                + Thêm mô đun
              </button>
            ))}
          {!editable && course.modules.length === 0 && <small className="pa-hint pa-ol-pad">Chưa có mô đun.</small>}
          <span className="pa-ol-label">Kết thúc khóa</span>
          <button type="button" className="pa-ol-item" aria-current={section === 'final' ? 'step' : undefined} onClick={() => go('final')}>
            <b>✓</b>
            <span>
              <strong>{course.final.title}</strong>
              <small>Quản lý phòng ban chấm</small>
            </span>
          </button>
        </nav>
        <div className="pa-canvas">
          {section === 'info' && (
            <CourseInfoForm
              key={`${course.title}|${course.domainId}|${course.level}|${course.pricePerSeat}|${course.salesStatus}|${course.code}|${course.outcome}`}
              course={course}
              editable={editable}
              edit={edit}
              onNext={() => go(0)}
              onAddModule={() => setNewModule(true)}
            />
          )}
          {typeof section === 'number' && course.modules[section] && (
            <ModuleEditor
              key={course.modules[section]!.moduleId}
              course={course}
              module={course.modules[section]!}
              editable={editable}
              edit={edit}
              onNavigate={go}
            />
          )}
          {section === 'final' && <FinalEditor key={JSON.stringify(course.final)} course={course} editable={editable} edit={edit} />}
        </div>
        {showInspector && (
          <aside className="pa-inspector" aria-label="Bảng thông số khóa học và Chuẩn hóa TT02">
            <div className="pa-inspector-head">
              <div className="pa-inspector-title">
                <span className="pa-inspector-dot" />
                <strong>Thông số & Chuẩn TT02</strong>
              </div>
              <button
                type="button"
                className="pa-inspector-close"
                onClick={() => setShowInspector(false)}
                title="Thu gọn bảng thông số để mở rộng vùng soạn thảo"
                aria-label="Đóng bảng thông số"
              >
                ✕
              </button>
            </div>

            <div className="pa-inspector-body">
              {/* 1. Chuẩn Năng Lực Số TT02 */}
              <div className="pa-inspector-section">
                <span className="pa-ins-label">Chuẩn Năng Lực Số TT02</span>
                <div className="pa-ins-badge-row">
                  <span className="pa-badge-domain" title={course.domainName}>
                    {course.domainName}
                  </span>
                  <span className={`pa-badge-level level-${course.level}`}>
                    {course.levelName || LEVEL_NAMES[course.level]}
                  </span>
                </div>
                <div className="pa-ins-meta-list">
                  <div className="pa-ins-meta-row">
                    <span className="pa-ins-meta-k">Khung chuẩn</span>
                    <span className="pa-ins-meta-v">TT 02/2025/TT-BGDĐT</span>
                  </div>
                  <div className="pa-ins-meta-row">
                    <span className="pa-ins-meta-k">Mã học phần</span>
                    <code className="pa-ins-code">{course.code}</code>
                  </div>
                  <div className="pa-ins-meta-row">
                    <span className="pa-ins-meta-k">Đơn giá / ghế</span>
                    <span className="pa-ins-meta-v">{course.pricePerSeat ? formatMoney(course.pricePerSeat) : 'Miễn phí'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Quy mô học liệu */}
              <div className="pa-inspector-section">
                <span className="pa-ins-label">Quy mô học liệu</span>
                <div className="pa-ins-stats-grid">
                  <div className="pa-ins-stat-box">
                    <span className="pa-ins-stat-num">{course.modules.length}</span>
                    <span className="pa-ins-stat-txt">Mô đun</span>
                  </div>
                  <div className="pa-ins-stat-box">
                    <span className="pa-ins-stat-num">{totalBlocks}</span>
                    <span className="pa-ins-stat-txt">Khối nội dung</span>
                  </div>
                  <div className="pa-ins-stat-box">
                    <span className="pa-ins-stat-num">{totalQuestions}</span>
                    <span className="pa-ins-stat-txt">Câu ôn tập</span>
                  </div>
                  <div className="pa-ins-stat-box">
                    <span className="pa-ins-stat-num">{criteriaCount}</span>
                    <span className="pa-ins-stat-txt">Tiêu chí rubric</span>
                  </div>
                </div>
                <div className="pa-ins-time-est">
                  <span>⏱ Thời lượng ước tính: <b>~{estimatedMinutes} phút</b></span>
                </div>
              </div>

              {/* 3. Thẩm định đầu ra */}
              <div className="pa-inspector-section">
                <span className="pa-ins-label">Thẩm định đầu ra</span>
                <div className="pa-ins-eval-card">
                  <strong className="pa-ins-eval-title">{course.final?.title || 'Đánh giá năng lực cuối khóa'}</strong>
                  <p className="pa-ins-eval-desc">
                    Hình thức: <b>Quản lý phòng ban chấm thực hành</b> theo rubric {criteriaCount} tiêu chí.
                  </p>
                  {course.final?.criteria?.length > 0 && (
                    <ul className="pa-ins-criteria-list">
                      {course.final.criteria.slice(0, 3).map((c, idx) => (
                        <li key={idx}>✓ {c}</li>
                      ))}
                      {course.final.criteria.length > 3 && (
                        <li className="pa-ins-more">+{course.final.criteria.length - 3} tiêu chí khác...</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {/* 4. Đồng bộ bản nháp */}
              <div className="pa-inspector-section">
                <span className="pa-ins-label">Đồng bộ máy chủ</span>
                <div className="pa-ins-sync-card">
                  <div className="pa-ins-sync-status">
                    <span className={`pa-ins-status-indicator ${courseEdit.isPending ? 'pending' : 'synced'}`} />
                    <span>{courseEdit.isPending ? 'Đang đồng bộ...' : `Đã lưu tự động (v${course.versionNo})`}</span>
                  </div>
                  <small className="pa-ins-sync-sub">Mọi thao tác thay đổi khối, câu hỏi hoặc cấu trúc đều được đồng bộ tức thì.</small>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
      {preview && <LearnerPreview course={course} moduleIndex={typeof section === 'number' ? section : 0} onClose={() => setPreview(false)} />}
    </>
  );
}

function NewModuleForm({ edit, onDone }: { edit: CourseEdit; onDone: (index: number | null) => void }) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const valid = title.trim().length >= 2;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    edit((v, c) => platformCatalogService.addModule(v, c, title.trim()))
      .then((detail) => {
        toast.success('Đã thêm mô đun. Bấm "+" để thêm nội dung.');
        onDone(detail.modules.length - 1);
      })
      .catch((err) => {
        toast.error(errorMessage(err));
        setSaving(false);
      });
  };

  return (
    <form className="pa-ol-new" onSubmit={submit}>
      <label className="field">
        Tên mô đun mới
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus maxLength={220} placeholder="VD: Kiểm chứng kết quả AI" />
      </label>
      <div className="button-row">
        <button type="submit" className="btn btn-primary btn-small" disabled={!valid || saving}>
          {saving ? 'Đang thêm…' : 'Thêm'}
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => onDone(null)}>
          Hủy
        </button>
      </div>
    </form>
  );
}

/** A published version cannot change: point to the draft (or create it) to edit the same course there. */
function ReadOnlyBar({ course }: { course: CatalogCourseDetail }) {
  const navigate = useNavigate();
  const versions = useCatalogVersions();
  const createDraft = useCreateDraft();
  const { can } = usePermission();
  const draftNo = versions.data?.draftVersionNo ?? null;
  const state = course.versionStatus === 'CURRENT' ? 'đang dùng' : 'đã được thay';

  const openDraft = () => {
    if (draftNo !== null) {
      navigate(`/platform/versions/${draftNo}/courses/${course.courseId}`);
      return;
    }
    createDraft.mutate(undefined, {
      onSuccess: (draft) => {
        toast.success(`Đã tạo bản nháp v${draft.version.versionNo}.`);
        navigate(`/platform/versions/${draft.version.versionNo}/courses/${course.courseId}`);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  return (
    <div className="notice warning pa-readonly">
      <span>
        v{course.versionNo} {state} — chỉ xem. Muốn sửa khóa này, mở bản nháp{draftNo !== null ? ` v${draftNo}` : ''}.
      </span>
      {can(PERMISSIONS.PLATFORM_CATALOG_MANAGE) && (
        <button type="button" className="btn btn-primary btn-small" onClick={openDraft} disabled={createDraft.isPending || versions.isLoading}>
          {draftNo !== null ? `Sửa trong v${draftNo}` : 'Tạo bản nháp để sửa'}
        </button>
      )}
    </div>
  );
}
