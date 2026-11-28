import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Eye, GraduationCap, Layers, Lock, Plus, Settings, ShoppingCart, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Modal } from '@/components/shared/Modal';
import { CourseUpdateBanner } from '@/features/organization/components/CourseUpdateBanner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { apiErrorMessage } from '@/lib/utils';
import { LessonSlide } from '@/features/pulse-employee/components/LessonSlide';
import { BUY_COURSES_PATH } from '@/features/trial-program/lib/buy-courses';
import { CourseBuilderHeader, CourseBuilderLayout, CourseBuilderPanel, CourseCodeBadge, CourseLevelBadge, CourseOutlineItem } from '@/features/platform/builder/CourseBuilderLayout';
import { CourseBuilderServiceContext } from '@/features/platform/builder/course-builder-service';
import { FinalEditor } from '@/features/platform/builder/FinalEditor';
import { LearnerPreview } from '@/features/platform/builder/LearnerPreview';
import { ModuleEditor } from '@/features/platform/builder/ModuleEditor';
import { LEVEL_NAMES } from '@/features/platform/components/pulse-format';
import { Loading } from '@/features/platform/components/pulse-ui';
import '@/features/platform/pulse-mock.css';
import '@/features/platform/pulse-admin.css';
import '@/features/platform/pulse-catalog.css';
import '@/features/platform/pulse-admin-shell.css';
import '@/features/platform/pulse-admin-polish.css';
import '@/features/platform/pulse-admin-owner-look.css';
import '@/features/pulse-employee/pulse-lesson.css';
import { useResearchAccess, useResearchCourses, useResearchPreview, useSaveResearchCourse, type ResearchCourse } from './research-api';
import { useResearchAuthoring } from './research-authoring';

const smallButton = 'btn btn-outline btn-small inline-flex items-center gap-1.5';
const two = (value: number) => String(value).padStart(2, '0');
type Section = 'info' | 'practice' | 'final' | number;
type EditorAction = 'apply' | 'discard' | 'unpublish';
const EMPTY = { title: '', objective: '', practice: '' };

/** Where a problem the server reports can be fixed ("Mô đun 2: …" → module 2). */
function problemTarget(problem: string): Section | undefined {
  const module = /^Mô đun (\d+):/.exec(problem);
  if (module) return Number(module[1]) - 1;
  if (/cuối khóa/i.test(problem)) return 'final';
  if (/^Mục tiêu/.test(problem)) return 'info';
  return undefined;
}

export function ResearchCoursesPage() {
  const access = useResearchAccess();
  const open = access.data?.canView === true;
  const courses = useResearchCourses(open);
  const isOwner = useCurrentUser((state) => state.user?.roles.includes('OWNER') === true);
  const [params, setParams] = useSearchParams();
  // A course is picked by its code: applying the company version gives the course a new revision (a new id).
  const wanted = params.get('course');
  const selected = courses.data?.find((course) => course.code === wanted || course.courseId === wanted) ?? courses.data?.[0];
  const settingsLink = isOwner && <Link className={smallButton} to="/enterprise/settings"><Settings size={14} /> Cài đặt R&D</Link>;
  const requesting = access.isPending || (open && courses.isPending);
  const failed = access.isError || (open && courses.isError);
  // A company with R&D: the R&D accounts edit and apply, the owner only views.
  const readOnly = open && access.data?.canEdit !== true;

  return (
    <div className="pulse-ui pa-console !min-h-0">
      {/* A course version DigiTalent published waits for R&D's decision (shown only to who may read it). */}
      <CourseUpdateBanner />
      {requesting ? <Loading /> : failed ? (
        <p className="notice warning" role="alert">
          Không tải được dữ liệu R&D. <button type="button" className={smallButton} onClick={() => void (access.isError ? access.refetch() : courses.refetch())}>Thử lại</button>
        </p>
      ) : !open ? (
        <CourseBuilderPanel icon={<Lock size={18} aria-hidden="true" />} title="Tùy chỉnh khóa học">
          <p>{access.data?.reason ?? 'Bạn chưa dùng được phần tùy chỉnh khóa học.'}</p>
          {access.data?.purchased === false
            ? isOwner
              ? <Link className="btn btn-primary btn-small inline-flex items-center gap-1.5" to={BUY_COURSES_PATH}><ShoppingCart size={14} aria-hidden="true" /> Mua khóa học</Link>
              : <p className="pa-hint">Nhờ chủ doanh nghiệp mua khóa học để mở phần này.</p>
            : settingsLink}
        </CourseBuilderPanel>
      ) : !selected ? (
        <CourseBuilderPanel icon={<BookOpen size={18} aria-hidden="true" />} title="Tùy chỉnh khóa học">
          <p>Doanh nghiệp chưa có khóa học khả dụng.</p>
          {settingsLink}
        </CourseBuilderPanel>
      ) : (
        <>
          {readOnly && (
            <p className="notice" role="note" style={{ margin: '0 0 12px' }}>
              Công ty đã có R&D ({access.data?.researchers} tài khoản): R&D sửa và áp dụng khóa học, bạn xem được nội dung.
              Muốn tự sửa thì tắt R&D trong Cài đặt tổ chức.
            </p>
          )}
          <ResearchEditor
            key={selected.code}
            course={selected}
            readOnly={readOnly}
            actions={<>
              <select className="pa-cb-input max-w-full sm:max-w-[300px]" style={{ width: 'auto' }} aria-label="Chọn khóa học R&D" value={selected.code}
                onChange={(event) => setParams({ course: event.target.value })}>
                {courses.data?.map((course) => (
                  <option key={course.code} value={course.code}>{course.code} · {course.title}</option>
                ))}
              </select>
              {settingsLink}
            </>}
          />
        </>
      )}
    </div>
  );
}

function ResearchEditor({ course, actions, readOnly }: { course: ResearchCourse; actions: ReactNode; readOnly: boolean }) {
  const [params, setParams] = useSearchParams();
  const formId = useId();
  const [content, setContent] = useState(course.draft ?? course.applied ?? EMPTY);
  const [previewIndex, setPreviewIndex] = useState<number>();
  const [editorAction, setEditorAction] = useState<EditorAction>();
  const [busy, setBusy] = useState(false);
  const save = useSaveResearchCourse();
  const authoring = useResearchAuthoring(course.courseId);
  const builder = authoring.data?.course;
  const modules = builder ? builder.modules.map((module) => module.title) : course.modules;
  const raw = params.get('s');
  const section: Section = raw === 'practice' || raw === 'final' ? raw
    : raw && /^\d+$/.test(raw) && Number(raw) < modules.length ? Number(raw) : 'info';
  const preview = useResearchPreview(course.courseId, !builder && (previewIndex !== undefined || typeof section === 'number'));
  const hasApplied = Boolean(authoring.data?.hasApplied || course.applied);
  const hasDraft = Boolean(authoring.data?.hasDraft || course.draft);
  const status = hasApplied ? (hasDraft ? 'Bản doanh nghiệp · có thay đổi chưa áp dụng' : 'Đang dùng bản doanh nghiệp')
    : hasDraft ? 'Bản nháp chưa áp dụng' : 'Đang dùng bản chuẩn';
  const objective = content.objective.trim();
  // The same rules as a DigiTalent publication; the objective is checked here because the form is not saved yet.
  const problems = [
    ...(objective && objective.length < 10 ? ['Mục tiêu học tập cần ít nhất 10 ký tự (để trống thì dùng mục tiêu của khóa chuẩn).'] : []),
    ...(authoring.data?.problems ?? []),
  ];
  const problemSections = new Set(problems.map(problemTarget));
  const accessLabel = course.tier === 1 ? 'Miễn phí' : 'Đã mua';
  const go = (target: Section) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (target === 'info') next.delete('s');
      else next.set('s', String(target));
      return next;
    }, { replace: true });
  };
  const runEditorAction = async (action: 'add' | EditorAction) => {
    if (!builder || busy) return;
    setBusy(true);
    try {
      if (action === 'add') {
        const updated = await authoring.service.addModule(builder.versionNo, builder.courseId, `Mô đun ${two(modules.length + 1)}`);
        go(updated.modules.length - 1);
      } else if (action === 'apply') {
        await authoring.apply(content);
        toast.success('Đã áp dụng bản doanh nghiệp. Nhân viên học khóa này lại từ đầu theo nội dung mới.');
      } else if (action === 'discard') {
        await authoring.discardDraft();
        setContent(course.applied ?? EMPTY);
        go('info');
        toast.success('Đã bỏ các thay đổi chưa áp dụng.');
      } else {
        await authoring.removeApplied();
        toast.success('Đã gỡ bản doanh nghiệp. Nhân viên học lại theo nội dung chuẩn.');
      }
      setEditorAction(undefined);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không hoàn thành được thao tác.'));
    } finally {
      setBusy(false);
    }
  };
  const saveInfo = async () => {
    if (save.isPending) return;
    try {
      const result = await save.mutateAsync({ courseId: course.courseId, content });
      if (result.draft) setContent(result.draft);
      toast.success('Đã lưu bản nháp.');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không lưu được bản nháp.'));
    }
  };
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void saveInfo();
  };
  const renderLessons = (index: number) => {
    if (preview.isPending) return <Loading />;
    if (preview.isError) {
      return <p role="alert">Không tải được mô đun. <button type="button" className={smallButton} onClick={() => void preview.refetch()}>Thử lại</button></p>;
    }
    const lessons = preview.data?.[index]?.lessons ?? [];
    return lessons.length ? lessons.map((lesson) => <LessonSlide key={lesson.lessonId} slide={lesson} />)
      : <p className="pa-hint">Chưa có bài học trong mô đun này.</p>;
  };

  return (
    <>
      <CourseBuilderHeader
        title={course.title} code={course.code} level={course.tier}
        status={<span className={hasDraft || !hasApplied ? 'pa-cb-version-draft-badge' : 'pa-cb-version-current-badge'}>
          {hasDraft && <Sparkles size={12} aria-hidden="true" />}
          {status}
        </span>}
        subtitle={<p className="pa-ov-subtitle" style={{ margin: 0 }}>R&D doanh nghiệp · {modules.length} mô đun</p>}
        actions={<>
          {actions}
          <button type="button" className={smallButton} onClick={() => setPreviewIndex(typeof section === 'number' ? section : 0)}
            disabled={modules.length === 0}><Eye size={14} /> Xem thử như nhân viên</button>
          {!readOnly && <>
            {hasDraft && <button type="button" className={smallButton} disabled={busy || !builder} onClick={() => setEditorAction('discard')}>Bỏ bản nháp</button>}
            {hasApplied && <button type="button" className={smallButton} disabled={busy || !builder} onClick={() => setEditorAction('unpublish')}>Gỡ bản doanh nghiệp</button>}
            <button type="button" className="btn btn-primary btn-small inline-flex items-center gap-1.5" disabled={busy || !builder}
              onClick={() => setEditorAction('apply')}>
              <CheckCircle2 size={14} aria-hidden="true" /> Áp dụng cho doanh nghiệp
            </button>
          </>}
        </>}
      />

      {authoring.isError && <p className="notice warning" role="alert">
        {apiErrorMessage(authoring.error, 'Không tải được bản biên soạn mô đun.')}
        <button type="button" className={smallButton} onClick={() => void authoring.refetch()}>Tải lại</button>
      </p>}
      <CourseBuilderLayout moduleCount={modules.length} outline={<>
        <CourseOutlineItem icon={<SlidersHorizontal size={14} aria-hidden="true" />} title="Thông tin khóa học"
          detail={`${LEVEL_NAMES[course.tier]} · ${accessLabel}`} active={section === 'info'} onClick={() => go('info')} />
        <div className="pa-ol-label">Mô đun</div>
        {modules.map((title, index) => (
          <CourseOutlineItem key={builder?.modules[index]?.moduleId ?? index} number={two(index + 1)} title={title}
            detail={builder
              ? `${builder.modules[index]?.blocks.length} khối · ${builder.modules[index]?.questions.length} câu hỏi${problemSections.has(index) ? ' · cần sửa' : ''}`
              : 'Nội dung khóa gốc'}
            active={section === index} onClick={() => go(index)} />
        ))}
        {builder && !readOnly && <button type="button" className="pa-ol-add" disabled={busy} onClick={() => void runEditorAction('add')}>
          <Plus size={14} /> Thêm mô đun
        </button>}
        <div className="pa-ol-label">Cuối khóa</div>
        {builder && <CourseOutlineItem icon={<GraduationCap size={14} aria-hidden="true" />} title={builder.final.title || 'Bài cuối khóa'}
          detail={problemSections.has('final') ? 'Cần sửa' : 'Đề bài và tiêu chí chấm'} active={section === 'final'} onClick={() => go('final')} />}
        <CourseOutlineItem icon={<GraduationCap size={14} aria-hidden="true" />} title="Thực hành nội bộ" detail="Không bắt buộc"
          active={section === 'practice'} onClick={() => go('practice')} />
      </>}>
        {builder && (typeof section === 'number' || section === 'final') ? (
          <CourseBuilderServiceContext.Provider value={authoring.service}>
            {typeof section === 'number' && builder.modules[section] && <ModuleEditor
              key={builder.modules[section].moduleId} course={builder} module={builder.modules[section]} editable={!readOnly} internal
              edit={(operation) => operation(builder.versionNo, builder.courseId)} onNavigate={go}
            />}
            {section === 'final' && <FinalEditor key={JSON.stringify(builder.final)} course={builder} editable={!readOnly}
              edit={(operation) => operation(builder.versionNo, builder.courseId)} internal showWeights
            />}
          </CourseBuilderServiceContext.Provider>
        ) : <form id={formId} onSubmit={onSubmit}>
          {section === 'info' && <>
            <CourseBuilderPanel icon={<Layers size={18} aria-hidden="true" />} title="Phân loại" description="Cấp độ và quyền truy cập khóa học.">
              <div className="pa-cb-grid-3">
                <div className="pa-cb-meta-cell"><span className="pa-cb-meta-label">Mã khóa</span><div><CourseCodeBadge code={course.code} /></div></div>
                <div className="pa-cb-meta-cell"><span className="pa-cb-meta-label">Cấp độ</span><div><CourseLevelBadge level={course.tier} /></div></div>
                <div className="pa-cb-meta-cell"><span className="pa-cb-meta-label">Quyền truy cập</span><span className="pa-cb-meta-value">{accessLabel}</span></div>
              </div>
            </CourseBuilderPanel>
            <CourseBuilderPanel icon={<BookOpen size={18} aria-hidden="true" />} title="Tên và mục tiêu"
              description="Không bắt buộc. Để trống thì nhân viên thấy tên và mục tiêu của khóa chuẩn.">
              <div>
                <label className="pa-cb-field-label" htmlFor={`${formId}-title`}>Tên hiển thị nội bộ<span aria-hidden="true">{content.title.length}/200</span></label>
                <input id={`${formId}-title`} className="pa-cb-input" value={content.title} maxLength={200} placeholder={course.title} disabled={save.isPending || readOnly}
                  onChange={(event) => setContent({ ...content, title: event.target.value })} />
              </div>
              <div>
                <label className="pa-cb-field-label" htmlFor={`${formId}-objective`}>Mục tiêu học tập của doanh nghiệp<span aria-hidden="true">{content.objective.length}/2000</span></label>
                <textarea id={`${formId}-objective`} className="pa-cb-textarea" rows={4} maxLength={2000} value={content.objective} disabled={save.isPending || readOnly}
                  placeholder={course.description ?? undefined}
                  onChange={(event) => setContent({ ...content, objective: event.target.value })} />
              </div>
            </CourseBuilderPanel>
          </>}

          {typeof section === 'number' && (
            <CourseBuilderPanel icon={<Layers size={18} aria-hidden="true" />} title={course.modules[section]} description="Nội dung khóa gốc">
              {renderLessons(section)}
            </CourseBuilderPanel>
          )}

          {section === 'practice' && (
            <CourseBuilderPanel icon={<GraduationCap size={18} aria-hidden="true" />} title="Thực hành nội bộ"
              description="Không bắt buộc. Nhân viên thấy hướng dẫn này ở trang khóa học.">
              <label className="pa-cb-field-label" htmlFor={`${formId}-practice`}>Hướng dẫn thực hành nội bộ<span aria-hidden="true">{content.practice.length}/8000</span></label>
              <textarea id={`${formId}-practice`} className="pa-cb-textarea" rows={7} maxLength={8000} value={content.practice} disabled={save.isPending || readOnly}
                onChange={(event) => setContent({ ...content, practice: event.target.value })} />
            </CourseBuilderPanel>
          )}

          <div className="pa-cb-action-footer flex-wrap">
            {!readOnly && <button type="submit" className={smallButton} disabled={save.isPending}>Lưu nháp</button>}
            {section !== 'practice' && (
              <button type="button" className={smallButton}
                onClick={() => go(section === 'info' && course.modules.length > 0 ? 0 : typeof section === 'number' && section + 1 < course.modules.length ? section + 1 : 'practice')}>
                Tiếp <ArrowRight size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </form>}
      </CourseBuilderLayout>

      {previewIndex !== undefined && builder && <LearnerPreview course={builder} moduleIndex={previewIndex} onClose={() => setPreviewIndex(undefined)} />}
      {previewIndex !== undefined && !builder && (
        <Modal open onClose={() => setPreviewIndex(undefined)} title="Xem thử như nhân viên" description={content.title.trim() || course.title} size="xl">
          <div className="pulse-ui pa-console !min-h-0">
            <label className="pa-cb-field-label" htmlFor={`${formId}-preview`}>Mô đun</label>
            <select id={`${formId}-preview`} className="pa-cb-input mb-3" value={previewIndex}
              onChange={(event) => setPreviewIndex(Number(event.target.value))}>
              {course.modules.map((module, index) => <option key={index} value={index}>{two(index + 1)} · {module}</option>)}
            </select>
            {renderLessons(previewIndex)}
          </div>
        </Modal>
      )}
      {editorAction && <EditorActionDialog action={editorAction} busy={busy} problems={problems} hasDraft={hasDraft} hasApplied={hasApplied}
        onCancel={() => !busy && setEditorAction(undefined)} onConfirm={() => void runEditorAction(editorAction)}
        onFix={(target) => { setEditorAction(undefined); go(target); }} />}
    </>
  );
}

function EditorActionDialog({ action, busy, problems, hasDraft, hasApplied, onCancel, onConfirm, onFix }: {
  action: EditorAction; busy: boolean; problems: string[]; hasDraft: boolean; hasApplied: boolean;
  onCancel: () => void; onConfirm: () => void; onFix: (target: Section) => void;
}) {
  const blocked = action === 'apply' && problems.length > 0;
  const title = blocked ? 'Chưa áp dụng được'
    : action === 'apply' ? 'Áp dụng cho doanh nghiệp?' : action === 'discard' ? 'Bỏ bản nháp?' : 'Gỡ bản doanh nghiệp?';
  const what = hasDraft ? 'bản nháp đang soạn' : hasApplied ? 'bản doanh nghiệp đang dùng' : 'nội dung chuẩn';
  return (
    <Modal open onClose={onCancel} title={title}
      footer={<>
        <button type="button" className={smallButton} disabled={busy} onClick={onCancel}>{blocked ? 'Đóng' : 'Hủy'}</button>
        {!blocked && <button type="button" className="btn btn-primary btn-small" disabled={busy} onClick={onConfirm}>
          {action === 'apply' ? 'Áp dụng' : action === 'discard' ? 'Bỏ bản nháp' : 'Gỡ bản doanh nghiệp'}
        </button>}
      </>}>
      {blocked ? <>
        <p>Sửa các mục sau rồi bấm Áp dụng lại (cùng điều kiện DigiTalent dùng khi công bố khóa học):</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {problems.map((problem) => {
            const target = problemTarget(problem);
            return <li key={problem}>
              {target === undefined ? problem
                : <button type="button" className="text-left underline" onClick={() => onFix(target)}>{problem}</button>}
            </li>;
          })}
        </ul>
      </> : action === 'apply' ? <>
        <p>Nhân viên sẽ học, làm câu hỏi ôn tập, bài kiểm tra đầu vào và bài cuối khóa theo {what}, cùng tên, mục tiêu và hướng dẫn thực hành bạn đang nhập. Mentor chấm như cũ.</p>
        <p className="mt-2">Ai đang học hoặc đã đạt khóa này đều học lại từ đầu; chứng nhận đã cấp vẫn được giữ.</p>
      </> : action === 'discard'
        ? <p>Bỏ các thay đổi chưa áp dụng (nội dung và thông tin khóa học). Nhân viên không bị ảnh hưởng.</p>
        : <p>Nhân viên quay về nội dung chuẩn của DigiTalent và học lại khóa từ đầu; chứng nhận đã cấp vẫn được giữ. Bản doanh nghiệp được giữ lại làm bản nháp để bạn sửa và áp dụng lại.</p>}
    </Modal>
  );
}
