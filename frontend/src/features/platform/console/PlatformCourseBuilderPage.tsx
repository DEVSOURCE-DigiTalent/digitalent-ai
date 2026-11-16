import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useCatalogCourse, useCatalogVersions, useCourseEdit, useCreateDraft } from '@/hooks/use-platform-catalog';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { platformCatalogService, type CatalogCourseDetail } from '@/services/platform-catalog.service';
import { Footer, LoadError, Loading } from '../components/pulse-ui';
import { LEVEL_NAMES, errorMessage, formatMoney } from '../components/pulse-format';
import type { CourseEdit } from '../builder/builder-types';
import { CourseInfoForm } from '../builder/CourseInfoForm';
import { FinalEditor } from '../builder/FinalEditor';
import { LearnerPreview } from '../builder/LearnerPreview';
import { ModuleEditor } from '../builder/ModuleEditor';
import {
  ArrowLeft,
  Eye,
  Lock,
  Sparkles,
  SlidersHorizontal,
  Layers,
  GraduationCap,
  Plus,
} from 'lucide-react';

const LEVEL_STYLES: Record<number, { bg: string; color: string; border: string }> = {
  1: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  2: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  3: { bg: '#fefce8', color: '#ca8a04', border: '#fef08a' },
};

type Section = 'info' | 'final' | number;

const two = (n: number) => String(n).padStart(2, '0');

/**
 * PA-04 · Soạn khóa học: a course of one catalog version. In the draft version everything is editable and saved as
 * it changes (outline: course info → modules → course-final); published versions are read-only.
 */
export function PlatformCourseBuilderPage() {
  useUiLanguage();
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
  useUiLanguage();
  const [params, setParams] = useSearchParams();
  const { can } = usePermission();
  const editable = course.editable && can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const courseEdit = useCourseEdit(course.versionNo, course.courseId);
  const edit: CourseEdit = (fn) => courseEdit.mutateAsync(fn);
  const [preview, setPreview] = useState(false);
  const [creatingModule, setCreatingModule] = useState(false);

  const raw = params.get('s');
  const section: Section =
    raw === 'final' ? 'final' : raw !== null && /^\d+$/.test(raw) && Number(raw) < course.modules.length ? Number(raw) : 'info';
  const go = (target: Section) => {
    setParams(target === 'info' ? {} : { s: String(target) }, { replace: true });
    window.scrollTo?.({ top: 0 });
  };

  const handleAddModule = () => {
    if (creatingModule) return;
    setCreatingModule(true);
    const nextIndex = course.modules.length + 1;
    const defaultTitle = `Mô đun ${two(nextIndex)}`;
    edit((v, c) => platformCatalogService.addModule(v, c, defaultTitle))
      .then((detail) => {
        const newIdx = detail.modules.length - 1;
        toast.success(translateUi(`Đã tạo ${defaultTitle}. Bạn có thể nhập tên mô đun ngay.`));
        go(newIdx);
      })
      .catch((err) => {
        toast.error(errorMessage(err));
      })
      .finally(() => {
        setCreatingModule(false);
      });
  };

  const isDraft = course.versionStatus === 'DRAFT';
  const totalQuestions = course.modules.reduce((sum, m) => sum + m.questions.length, 0);
  const levelStyle = LEVEL_STYLES[course.level] ?? { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

  return (
    <>
      <header className="pa-ov-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 aria-label={course.title}>
              {translateUi(course.title) || 'Khóa học mới'}
            </h1>
            <span
              className="pa-ver-level-badge"
              style={{
                background: levelStyle.bg,
                color: levelStyle.color,
                border: `1px solid ${levelStyle.border}`,
                padding: '3px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {translateUi(LEVEL_NAMES[course.level]) ?? course.levelName}
            </span>
            <span className="pa-rp-version-badge" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {course.code}
            </span>
            {isDraft ? (
              <span className="pa-cb-version-draft-badge">
                <Sparkles size={12} aria-hidden="true" />
                <span>{translateUi(`Bản nháp v${course.versionNo}`)}</span>
              </span>
            ) : (
              <span className="pa-cb-version-current-badge">
                <span>{translateUi(`v${course.versionNo} (đang dùng)`)}</span>
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
            <p className="pa-ov-subtitle" style={{ margin: 0 }}>
              {translateUi('Khung năng lực số')} · {translateUi(course.domainName)} · {course.modules.length} {translateUi('mô đun')} · {totalQuestions} {translateUi('câu hỏi ôn tập')}
            </p>
            {editable && (
              <div className="pa-cb-autosave-indicator" title="Khối và mô đun tự lưu sau mỗi thay đổi. Thông tin khóa học cần bấm Lưu thay đổi.">
                <span className="pa-cb-pulse-dot" aria-hidden="true" />
                <span>{courseEdit.isPending ? translateUi('Đang lưu thay đổi…') : translateUi('Khối và mô đun tự lưu')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pa-ov-actions">
          <Link
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            to={`/platform/versions/${course.versionNo}`}
          >
            <ArrowLeft size={14} />
            <span>{translateUi('Phiên bản khóa học')}</span>
          </Link>
          <button
            type="button"
            className="btn btn-outline btn-small inline-flex items-center gap-1.5"
            onClick={() => setPreview(true)}
            disabled={course.modules.length === 0}
          >
            <Eye size={14} />
            <span>{translateUi('Xem thử như nhân viên')}</span>
          </button>
        </div>
      </header>

      {!course.editable && <ReadOnlyBar course={course} />}
      <div className="pa-builder">
        <nav className="pa-outline" aria-label={translateUi("Cấu trúc khóa học")}>
          <div className="pa-ol-header">
            <div className="pa-ol-header-title">
              <Layers size={13} aria-hidden="true" />
              <span>{translateUi("Nội dung khóa học")}</span>
            </div>
            <span className="pa-ol-header-count">{course.modules.length} {translateUi("mô đun")}</span>
          </div>

          <button
            type="button"
            className="pa-ol-item"
            aria-current={section === 'info' ? 'step' : undefined}
            onClick={() => go('info')}
          >
            <b className="pa-ol-icon-box">
              <SlidersHorizontal size={14} aria-hidden="true" />
            </b>
            <span className="pa-ol-text">
              <strong>{translateUi("Thông tin khóa học")}</strong>
              <small>
                {translateUi(LEVEL_NAMES[course.level])} · {course.pricePerSeat ? formatMoney(course.pricePerSeat) : translateUi('Miễn phí')}
              </small>
            </span>
          </button>

          <div className="pa-ol-label">{translateUi("Mô đun")}</div>

          {course.modules.map((m) => (
            <button
              key={m.moduleId}
              type="button"
              className="pa-ol-item"
              aria-current={section === m.index ? 'step' : undefined}
              onClick={() => go(m.index)}
            >
              <b className="pa-ol-number-box">{two(m.index + 1)}</b>
              <span className="pa-ol-text">
                <strong>{translateUi(m.title) || translateUi('Mô đun chưa đặt tên')}</strong>
                <small>
                  {m.blocks.length} {translateUi('khối')} · {m.questions.length} {translateUi('câu hỏi')}
                </small>
              </span>
            </button>
          ))}

          {editable && (
            <button
              type="button"
              className="pa-ol-add"
              onClick={handleAddModule}
              disabled={creatingModule}
            >
              <Plus size={14} />
              <span>{creatingModule ? translateUi('Đang tạo…') : translateUi('Thêm mô đun')}</span>
            </button>
          )}

          {!editable && course.modules.length === 0 && (
            <small className="pa-hint pa-ol-pad">{translateUi("Chưa có mô đun nào.")}</small>
          )}

          <div className="pa-ol-label">{translateUi("Cuối khóa")}</div>
          <button
            type="button"
            className="pa-ol-item"
            aria-current={section === 'final' ? 'step' : undefined}
            onClick={() => go('final')}
          >
            <b className="pa-ol-icon-box">
              <GraduationCap size={14} aria-hidden="true" />
            </b>
            <span className="pa-ol-text">
              <strong>{translateUi(course.final.title)}</strong>
              <small>{translateUi("Quản lý phòng ban chấm")}</small>
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
              onAddModule={handleAddModule}
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
      </div>
      {preview && <LearnerPreview course={course} moduleIndex={typeof section === 'number' ? section : 0} onClose={() => setPreview(false)} />}
    </>
  );
}

/** A published version cannot change: point to the draft (or create it) to edit the same course there. */
function ReadOnlyBar({ course }: { course: CatalogCourseDetail }) {
  useUiLanguage();
  const navigate = useNavigate();
  const versions = useCatalogVersions();
  const createDraft = useCreateDraft();
  const { can } = usePermission();
  const draftNo = versions.data?.draftVersionNo ?? null;
  const isCurrent = course.versionStatus === 'CURRENT';

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
    <div className="pa-cb-status-bar pa-cb-status-readonly">
      <div className="pa-cb-status-left">
        <Lock size={15} className="pa-cb-status-icon text-slate-500" aria-hidden="true" />
        <span className="pa-cb-status-text">
          {isCurrent
            ? `Bản công bố chính thức v${course.versionNo} (chế độ chỉ xem). Để chỉnh sửa nội dung, vui lòng chuyển sang bản nháp${draftNo !== null ? ` v${draftNo}` : ''}.`
            : `Bản lưu trữ lịch sử v${course.versionNo} (chế độ chỉ xem). Để chỉnh sửa nội dung, vui lòng thao tác trên bản nháp${draftNo !== null ? ` v${draftNo}` : ''}.`}
        </span>
      </div>
      {can(PERMISSIONS.PLATFORM_CATALOG_MANAGE) && (
        <button
          type="button"
          className="btn btn-primary btn-small inline-flex items-center gap-1.5"
          onClick={openDraft}
          disabled={createDraft.isPending || versions.isLoading}
        >
          <span>
            {draftNo !== null ? translateUi(`Chuyển sang bản nháp v${draftNo}`) : translateUi('Tạo bản nháp mới để sửa')}
          </span>
        </button>
      )}
    </div>
  );
}
