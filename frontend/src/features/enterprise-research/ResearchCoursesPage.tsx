import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Eye, GraduationCap, Layers, Plus, Settings, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Modal } from '@/components/shared/Modal';
import { useCurrentUser } from '@/hooks/use-current-user';
import { apiErrorMessage } from '@/lib/utils';
import { LessonSlide } from '@/features/pulse-employee/components/LessonSlide';
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
import { useResearchCourses, useResearchPreview, useResearchSettings, useSaveResearchCourse, type ResearchCourse } from './research-api';
import { useResearchAuthoring } from './research-authoring';

const smallButton = 'btn btn-outline btn-small inline-flex items-center gap-1.5';
const two = (value: number) => String(value).padStart(2, '0');
type Section = 'info' | 'practice' | 'final' | number;

export function ResearchCoursesPage() {
  const settings = useResearchSettings();
  const courses = useResearchCourses(settings.data === true);
  const isOwner = useCurrentUser((state) => state.user?.roles.includes('OWNER') === true);
  const [params, setParams] = useSearchParams();
  const selected = courses.data?.find((course) => course.courseId === params.get('course')) ?? courses.data?.[0];
  const settingsLink = isOwner && <Link className={smallButton} to="/enterprise/settings"><Settings size={14} /> Cài đặt R&D</Link>;
  const requesting = settings.isPending || (settings.data === true && courses.isPending);
  const failed = settings.isError || (settings.data === true && courses.isError);

  return (
    <div className="pulse-ui pa-console !min-h-0">
      {requesting ? <Loading /> : failed ? (
        <p className="notice warning" role="alert">
          Không tải được dữ liệu R&D. <button type="button" className={smallButton} onClick={() => void (settings.isError ? settings.refetch() : courses.refetch())}>Thử lại</button>
        </p>
      ) : !settings.data || !selected ? (
        <CourseBuilderPanel icon={<BookOpen size={18} aria-hidden="true" />} title="Tùy chỉnh khóa học">
          <p>{settings.data ? 'Doanh nghiệp chưa có khóa học khả dụng.' : 'Tính năng R&D đang tắt. Chủ doanh nghiệp có thể bật trong cài đặt tổ chức.'}</p>
          {settingsLink}
        </CourseBuilderPanel>
      ) : (
        <ResearchEditor
          key={selected.courseId}
          course={selected}
          actions={<>
            <select className="pa-cb-input max-w-full sm:max-w-[300px]" style={{ width: 'auto' }} aria-label="Chọn khóa học R&D" value={selected.courseId}
              onChange={(event) => setParams({ course: event.target.value })}>
              {courses.data?.map((course) => (
                <option key={course.courseId} value={course.courseId}>{course.code} · {course.title}</option>
              ))}
            </select>
            {settingsLink}
          </>}
        />
      )}
    </div>
  );
}

function ResearchEditor({ course, actions }: { course: ResearchCourse; actions: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const formId = useId();
  const [content, setContent] = useState(course.draft ?? course.applied ?? { title: '', objective: '', practice: '' });
  const [previewIndex, setPreviewIndex] = useState<number>();
  const [editorAction, setEditorAction] = useState<'apply' | 'discard' | 'unpublish'>();
  const [busy, setBusy] = useState(false);
  const save = useSaveResearchCourse();
  const authoring = useResearchAuthoring(course.courseId);
  const builder = authoring.data?.course;
  const modules = builder ? builder.modules.map((module) => module.title) : course.modules;
  const raw = params.get('s');
  const section: Section = raw === 'practice' || raw === 'final' ? raw
    : raw && /^\d+$/.test(raw) && Number(raw) < modules.length ? Number(raw) : 'info';
  const preview = useResearchPreview(course.courseId, !builder && (previewIndex !== undefined || typeof section === 'number'));
  const canSave = Boolean(content.objective.trim() && content.practice.trim()) && !save.isPending;
  const draftChanged = course.applied && course.draft &&
    (course.applied.title !== course.draft.title || course.applied.objective !== course.draft.objective || course.applied.practice !== course.draft.practice);
  const status = draftChanged ? 'Có bản nháp mới' : course.applied ? 'Đang áp dụng' : course.draft ? 'Bản nháp' : 'Chưa tùy chỉnh';
  const accessLabel = course.tier === 1 ? 'Miễn phí' : 'Đã mua';
  const go = (target: Section) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (target === 'info') next.delete('s');
      else next.set('s', String(target));
      return next;
    }, { replace: true });
  };
  const runEditorAction = async (action: 'add' | 'create' | 'apply' | 'discard' | 'unpublish') => {
    if (!builder || busy) return;
    setBusy(true);
    try {
      if (action === 'add') {
        const updated = await authoring.service.addModule(builder.versionNo, builder.courseId, `Mô đun ${two(modules.length + 1)}`);
        go(updated.modules.length - 1);
      } else if (action === 'create') {
        await authoring.create();
        toast.success('Đã tạo bản nháp biên soạn.');
      } else if (action === 'apply') {
        await authoring.apply();
        toast.success('Đã áp dụng chương trình biên soạn trong doanh nghiệp.');
      } else {
        await authoring.remove(action === 'discard' ? 'draft' : 'applied');
        go('info');
        toast.success(action === 'discard' ? 'Đã bỏ bản nháp biên soạn.' : 'Đã gỡ chương trình đã áp dụng.');
      }
      setEditorAction(undefined);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không hoàn thành được thao tác biên soạn.'));
    } finally {
      setBusy(false);
    }
  };
  const submit = async (apply: boolean) => {
    if (!canSave) return;
    try {
      const result = await save.mutateAsync({ courseId: course.courseId, content, apply });
      if (result.draft) setContent(result.draft);
      toast.success(apply ? 'Đã áp dụng bản tùy chỉnh cho doanh nghiệp.' : 'Đã lưu bản nháp.');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không lưu được bản tùy chỉnh.'));
    }
  };
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit(false);
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
        status={<span className={draftChanged || !course.applied ? 'pa-cb-version-draft-badge' : 'pa-cb-version-current-badge'}>
          {(draftChanged || !course.applied) && <Sparkles size={12} aria-hidden="true" />}
          {authoring.data?.hasDraft ? 'Bản nháp biên soạn' : authoring.data?.hasApplied ? 'Đã áp dụng chương trình' : status}
        </span>}
        subtitle={<p className="pa-ov-subtitle" style={{ margin: 0 }}>R&D doanh nghiệp · {modules.length} mô đun</p>}
        actions={<>
          {actions}
          <button type="button" className={smallButton} onClick={() => setPreviewIndex(typeof section === 'number' ? section : 0)}
            disabled={modules.length === 0}><Eye size={14} /> Xem thử như nhân viên</button>
          {builder && !authoring.data?.hasDraft && <button type="button" className={smallButton} disabled={busy} onClick={() => void runEditorAction('create')}>Tạo bản nháp biên soạn</button>}
          {authoring.data?.hasDraft && <button type="button" className={smallButton} disabled={busy} onClick={() => setEditorAction('apply')}>Áp dụng chương trình</button>}
          {authoring.data?.hasDraft && <button type="button" className={smallButton} disabled={busy} onClick={() => setEditorAction('discard')}>Bỏ bản nháp biên soạn</button>}
          {authoring.data?.hasApplied && <button type="button" className={smallButton} disabled={busy} onClick={() => setEditorAction('unpublish')}>Gỡ chương trình đã áp dụng</button>}
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
            detail={builder ? `${builder.modules[index]?.blocks.length} khối · ${builder.modules[index]?.questions.length} câu hỏi` : 'Nội dung khóa gốc'}
            active={section === index} onClick={() => go(index)} />
        ))}
        {builder && <button type="button" className="pa-ol-add" disabled={busy} onClick={() => void runEditorAction('add')}>
          <Plus size={14} /> Thêm mô đun
        </button>}
        <div className="pa-ol-label">Cuối khóa</div>
        {builder && <CourseOutlineItem icon={<GraduationCap size={14} aria-hidden="true" />} title={builder.final.title || 'Bài cuối khóa'}
          detail="Thực hành theo chương trình nội bộ" active={section === 'final'} onClick={() => go('final')} />}
        <CourseOutlineItem icon={<GraduationCap size={14} aria-hidden="true" />} title="Thực hành nội bộ"
          active={section === 'practice'} onClick={() => go('practice')} />
      </>}>
        {builder && (typeof section === 'number' || section === 'final') ? (
          <CourseBuilderServiceContext.Provider value={authoring.service}>
            {typeof section === 'number' && builder.modules[section] && <ModuleEditor
              key={builder.modules[section].moduleId} course={builder} module={builder.modules[section]} editable internal
              edit={(operation) => operation(builder.versionNo, builder.courseId)} onNavigate={go}
            />}
            {section === 'final' && <FinalEditor key={JSON.stringify(builder.final)} course={builder} editable
              edit={(operation) => operation(builder.versionNo, builder.courseId)} internal
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
            <CourseBuilderPanel icon={<BookOpen size={18} aria-hidden="true" />} title="Tên và mục tiêu" description={course.description ||
              'Tên khóa học và kết quả đạt được, hiển thị cho nhân viên trong doanh nghiệp.'}>
              <div>
                <label className="pa-cb-field-label" htmlFor={`${formId}-title`}>Tên hiển thị nội bộ<span aria-hidden="true">{content.title.length}/200</span></label>
                <input id={`${formId}-title`} className="pa-cb-input" value={content.title} maxLength={200} placeholder={course.title} disabled={save.isPending}
                  onChange={(event) => setContent({ ...content, title: event.target.value })} />
              </div>
              <div>
                <label className="pa-cb-field-label" htmlFor={`${formId}-objective`}>Mục tiêu học tập của doanh nghiệp<span aria-hidden="true">{content.objective.length}/2000</span></label>
                <textarea id={`${formId}-objective`} className="pa-cb-textarea" rows={4} required maxLength={2000} value={content.objective} disabled={save.isPending}
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
              description="Hướng dẫn nhân viên vận dụng nội dung khóa học vào công việc.">
              <label className="pa-cb-field-label" htmlFor={`${formId}-practice`}>Hướng dẫn thực hành nội bộ<span aria-hidden="true">{content.practice.length}/8000</span></label>
              <textarea id={`${formId}-practice`} className="pa-cb-textarea" rows={7} required maxLength={8000} value={content.practice} disabled={save.isPending}
                onChange={(event) => setContent({ ...content, practice: event.target.value })} />
            </CourseBuilderPanel>
          )}

          {course.applied && (
            <details className="pa-cb-panel p-4">
              <summary className="cursor-pointer font-semibold">Xem nội dung đang áp dụng</summary>
              <div className="pa-cb-outcome-box mt-3 space-y-3 whitespace-pre-wrap">
                <p className="font-semibold">{course.applied.title || course.title}</p>
                <p><strong>Mục tiêu</strong><br />{course.applied.objective}</p>
                <p><strong>Thực hành</strong><br />{course.applied.practice}</p>
              </div>
            </details>
          )}

          <div className="pa-cb-action-footer flex-wrap">
            <button type="submit" className={smallButton} disabled={!canSave}>Lưu nháp</button>
            <button type="button" className="btn btn-primary btn-small inline-flex items-center gap-1.5" disabled={!canSave} onClick={() => void submit(true)}>
              <CheckCircle2 size={14} aria-hidden="true" /> Áp dụng cho doanh nghiệp
            </button>
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
            {(content.objective || content.practice) && (
              <CourseBuilderPanel icon={<BookOpen size={18} aria-hidden="true" />} title="Nội dung của doanh nghiệp">
                {content.objective && <p className="whitespace-pre-wrap"><strong>Mục tiêu học tập</strong><br />{content.objective}</p>}
                {content.practice && <p className="whitespace-pre-wrap"><strong>Hướng dẫn thực hành</strong><br />{content.practice}</p>}
              </CourseBuilderPanel>
            )}
            <label className="pa-cb-field-label" htmlFor={`${formId}-preview`}>Mô đun</label>
            <select id={`${formId}-preview`} className="pa-cb-input mb-3" value={previewIndex}
              onChange={(event) => setPreviewIndex(Number(event.target.value))}>
              {course.modules.map((module, index) => <option key={index} value={index}>{two(index + 1)} · {module}</option>)}
            </select>
            {renderLessons(previewIndex)}
          </div>
        </Modal>
      )}
      {editorAction && <Modal open onClose={() => !busy && setEditorAction(undefined)}
        title={editorAction === 'apply' ? 'Áp dụng chương trình?' : editorAction === 'discard' ? 'Bỏ bản nháp biên soạn?' : 'Gỡ chương trình đã áp dụng?'}
        footer={<>
          <button type="button" className={smallButton} disabled={busy} onClick={() => setEditorAction(undefined)}>Hủy</button>
          <button type="button" className="btn btn-primary btn-small" disabled={busy} onClick={() => void runEditorAction(editorAction)}>
            {editorAction === 'apply' ? 'Áp dụng' : editorAction === 'discard' ? 'Bỏ bản nháp' : 'Gỡ chương trình'}
          </button>
        </>}>
        <p>{editorAction === 'apply'
          ? 'Nhân viên có quyền học sẽ thấy mô đun, câu hỏi ôn tập và bài thực hành đã biên soạn.'
          : editorAction === 'discard'
            ? 'Trình biên soạn sẽ quay về chương trình đang áp dụng hoặc nội dung khóa gốc.'
            : 'Nhân viên sẽ quay về chương trình gốc. Bạn vẫn có thể tiếp tục làm việc với bản nháp hiện có.'}</p>
      </Modal>}
    </>
  );
}
