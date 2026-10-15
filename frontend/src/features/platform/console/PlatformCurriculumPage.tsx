import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAddCourseQuestion, usePlatformCourse, usePlatformCourses, usePublishCourse, useSaveCourseDraft } from '@/hooks/use-platform-admin';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import type { PlatformCourse, PlatformCourseDraft, SalesStatus } from '@/services/platform-admin.service';
import { Box, Footer, ListItem, LoadError, Loading, PageHead, Pill } from '../components/pulse-ui';
import { SALES_STATUS, errorMessage, formatDateTime, formatMoney } from '../components/pulse-format';

/** PA-03 / PA-04 · Chương trình học chuẩn (mock `#/admin/curriculum/<course>`): course editor and question bank. */
export function PlatformCurriculumPage() {
  const { code } = useParams<{ code?: string }>();
  const courses = usePlatformCourses();
  const selected = (code ?? courses.data?.[0]?.code ?? '').toUpperCase();
  const detail = usePlatformCourse(selected || undefined);

  return (
    <>
      <PageHead
        eyebrow="Nền tảng / Chương trình học chuẩn"
        title="Phát hành nội dung khóa học kèm phiên bản."
        description="Cả 18 khóa đều gắn với lĩnh vực và mức. Bản nháp được kiểm tra trước khi công bố; người đã học vẫn giữ tham chiếu khóa học để truy vết."
        actions={detail.data && <Pill>{detail.data.questions.length} câu hỏi</Pill>}
      />
      {(courses.isLoading || detail.isLoading) && <Loading />}
      {courses.error && <LoadError error={courses.error} />}
      {detail.error && <LoadError error={detail.error} />}
      {courses.data && detail.data && <CourseEditor key={selected} courses={courses.data} detail={detail.data} />}
      <Footer />
    </>
  );
}

function CourseEditor({ courses, detail }: { courses: PlatformCourse[]; detail: NonNullable<ReturnType<typeof usePlatformCourse>['data']> }) {
  const navigate = useNavigate();
  const c = detail.course;
  const saveDraft = useSaveCourseDraft(c.code);
  const publish = usePublishCourse(c.code);
  const addQuestion = useAddCourseQuestion(c.code);
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);

  const base: PlatformCourseDraft = c.draft ?? { title: c.title, outcome: c.outcome, pricePerSeat: c.pricePerSeat, salesStatus: c.salesStatus };
  const [form, setForm] = useState<PlatformCourseDraft>(base);
  const [question, setQuestion] = useState({ questionText: '', correctAnswer: '', explanation: '' });

  useEffect(() => {
    setForm(c.draft ?? { title: c.title, outcome: c.outcome, pricePerSeat: c.pricePerSeat, salesStatus: c.salesStatus });
  }, [c]);

  const dirty = JSON.stringify(base) !== JSON.stringify(form);
  const formValid = form.title.trim().length > 0 && form.outcome.trim().length >= 20 && form.pricePerSeat >= 0;
  const canPublish = (c.hasDraft || c.draftQuestionCount > 0) && !dirty;
  const questionValid =
    question.questionText.trim().length >= 15 && question.correctAnswer.trim().length > 0 && question.explanation.trim().length >= 15;

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    saveDraft.mutate(form, {
      onSuccess: () => toast.success('Đã lưu bản nháp khóa học', { description: 'Doanh nghiệp vẫn thấy phiên bản đã công bố.' }),
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  const onPublish = () =>
    publish.mutate(undefined, {
      onSuccess: (result) => toast.success(`Đã công bố ${result.course.title} v${result.course.versionNo}.0`),
      onError: (err) => toast.error(errorMessage(err)),
    });

  const onAddQuestion = (e: FormEvent) => {
    e.preventDefault();
    addQuestion.mutate(question, {
      onSuccess: () => {
        setQuestion({ questionText: '', correctAnswer: '', explanation: '' });
        toast.success('Đã thêm câu hỏi vào bản nháp', { description: 'Câu hỏi được công bố cùng phiên bản khóa tiếp theo.' });
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  return (
    <div className="grid-2 sideflow-layout">
      <Box>
        <span className="mini-label">Bộ chỉnh sửa khóa học</span>
        <label className="field">
          Chọn khóa học
          <select value={c.code} onChange={(e) => navigate(`/platform/curriculum/${e.target.value}`)}>
            {courses.map((course) => (
              <option key={course.code} value={course.code}>
                {course.domainName} · {course.levelName}
                {course.hasDraft || course.draftQuestionCount > 0 ? ' (có nháp)' : ''}
              </option>
            ))}
          </select>
        </label>
        <form onSubmit={onSave}>
          <fieldset disabled={!canManage} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            <label className="field">
              Tên khóa học
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={250} required />
            </label>
            <label className="field">
              Kết quả học tập
              <textarea value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} minLength={20} maxLength={4000} required />
            </label>
            <div className="inline-fields">
              <label className="field">
                Giá mỗi suất (VND)
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={c.isFree ? 0 : form.pricePerSeat}
                  onChange={(e) => setForm({ ...form, pricePerSeat: Number(e.target.value) })}
                  disabled={c.isFree}
                />
              </label>
              <label className="field">
                Trạng thái bán
                <select value={form.salesStatus} onChange={(e) => setForm({ ...form, salesStatus: e.target.value as SalesStatus })}>
                  <option value="OPEN">Đang mở bán</option>
                  <option value="PAUSED">Tạm ngưng bán</option>
                </select>
              </label>
            </div>
          </fieldset>
          <p className="field-hint">
            Khóa Cơ bản luôn miễn phí. Tạm ngưng bán chỉ chặn lượt mua mới; suất đã cấp vẫn dùng tiếp. Đang công bố v{c.versionNo}.0 ·{' '}
            {SALES_STATUS[c.salesStatus]?.label}
            {c.hasDraft ? ' · có bản nháp chưa công bố' : ''}.
          </p>
          {canManage && (
            <div className="button-row">
              <button className="btn btn-outline" type="submit" disabled={!dirty || !formValid || saveDraft.isPending}>
                {saveDraft.isPending ? 'Đang lưu…' : 'Lưu bản nháp'}
              </button>
              <button className="btn btn-primary" type="button" disabled={!canPublish || publish.isPending} onClick={onPublish}>
                {publish.isPending ? 'Đang công bố…' : `Công bố v${c.versionNo + 1} →`}
              </button>
            </div>
          )}
        </form>
        <div className="divider" />
        <span className="mini-label">Lịch sử phiên bản</span>
        {detail.releases.map((r) => (
          <ListItem
            key={r.versionNo}
            title={`v${r.versionNo}.0 · ${r.title}`}
            detail={[
              formatDateTime(r.publishedAt),
              r.pricePerSeat === 0 ? 'Miễn phí' : formatMoney(r.pricePerSeat),
              SALES_STATUS[r.salesStatus]?.label,
              r.publishedByEmail,
            ]
              .filter(Boolean)
              .join(' · ')}
          />
        ))}
      </Box>
      <Box>
        <span className="mini-label">
          Ngân hàng câu hỏi / {c.domainName} · {c.levelName}
        </span>
        <h2 className="panel-title">{detail.questions.length} câu hỏi trong khóa học này</h2>
        {detail.questions.map((q) => (
          <ListItem
            key={q.id}
            title={q.questionText}
            detail={`Đáp án: ${q.correctAnswer} · Giải thích: ${q.explanation}`}
            aside={q.status === 'DRAFT' ? <Pill tone="coral">Bản nháp</Pill> : undefined}
          />
        ))}
        {canManage && (
          <form onSubmit={onAddQuestion}>
            <label className="field">
              Câu hỏi mới
              <input value={question.questionText} onChange={(e) => setQuestion({ ...question, questionText: e.target.value })} minLength={15} maxLength={1000} required />
            </label>
            <label className="field">
              Đáp án đúng
              <input value={question.correctAnswer} onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value })} maxLength={1000} required />
            </label>
            <label className="field">
              Giải thích
              <input value={question.explanation} onChange={(e) => setQuestion({ ...question, explanation: e.target.value })} minLength={15} maxLength={1000} required />
            </label>
            <button className="btn btn-outline" type="submit" disabled={!questionValid || addQuestion.isPending}>
              {addQuestion.isPending ? 'Đang thêm…' : 'Thêm câu hỏi vào bản nháp'}
            </button>
          </form>
        )}
        <div className="divider" />
        <span className="mini-label">Mẫu bài kiểm tra</span>
        <p className="small">
          Mẫu tạo câu hỏi cho lĩnh vực và mức này. Hiện có {c.publishedQuestionCount} câu đã công bố; bản chính thức cần biên tập và kiểm định đầy đủ.
        </p>
      </Box>
    </div>
  );
}
