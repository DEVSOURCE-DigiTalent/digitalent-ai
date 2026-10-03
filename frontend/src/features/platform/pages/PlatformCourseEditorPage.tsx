import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Video, FileText, CheckCircle2, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { usePlatformCourse, useUpdatePlatformCourse } from '@/hooks/use-platform';
import { levelLabel } from '@/lib/competency-levels';

export function PlatformCourseEditorPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: course, isLoading, isError } = usePlatformCourse(id);
  const updateCourse = useUpdatePlatformCourse();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setTargetAudience(course.targetAudience);
      setOutcomes(course.learningOutcomes || []);
    }
  }, [course]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải nội dung khóa học…</div>;
  }

  if (isError || !course) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/platform/courses')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Quay lại danh mục khóa học
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Không tìm thấy khóa học chuẩn này.
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(undefined);
    setSaveSuccess(false);

    try {
      await updateCourse.mutateAsync({
        id: course.id,
        data: {
          title: title.trim(),
          description: description.trim(),
          targetAudience: targetAudience.trim(),
          learningOutcomes: outcomes,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Không thể lưu khóa học.');
    }
  };

  const handleOutcomeChange = (index: number, val: string) => {
    const updated = [...outcomes];
    updated[index] = val;
    setOutcomes(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/platform/courses')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Danh mục khóa học chuẩn
        </button>

        <span className="rounded bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
          Mã: {course.code} · Trình độ: {levelLabel(course.level)} (Bậc {course.level === 1 ? '1–2' : course.level === 2 ? '3–4' : '5–8'})
        </span>
      </div>

      <PageHeader
        title={`Soạn khóa học: ${course.title}`}
        subtitle="Biên tập thông tin cơ bản, chuẩn đầu ra và cấu trúc học phần của khóa học chuẩn nền tảng"
      />

      {saveSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-5 text-emerald-600" />
          Đã lưu thành công nội dung khóa học chuẩn!
        </div>
      )}

      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Metadata */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Thông tin chung
          </h2>

          <div>
            <label htmlFor="course-title" className="block text-sm font-medium text-slate-700 mb-1">
              Tên khóa học
            </label>
            <input
              id="course-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="course-desc" className="block text-sm font-medium text-slate-700 mb-1">
              Mô tả khóa học
            </label>
            <textarea
              id="course-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="course-audience" className="block text-sm font-medium text-slate-700 mb-1">
              Đối tượng người học
            </label>
            <input
              id="course-audience"
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Chuẩn đầu ra (Learning Outcomes)
          </h2>
          <div className="space-y-3">
            {outcomes.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="size-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 p-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Modules & Lessons Structure */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <BookOpen className="size-5 text-primary-600" />
            Cấu trúc học phần & Bài học ({course.modulesList?.length || course.modules} học phần)
          </h2>

          <div className="space-y-4">
            {course.modulesList?.map((mod) => (
              <div key={mod.id} className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 font-semibold text-sm text-slate-800 flex items-center justify-between">
                  <span>{mod.title}</span>
                  <span className="text-xs font-normal text-slate-500">
                    Khoảng {mod.estimatedMinutes} phút
                  </span>
                </div>
                <ul className="divide-y divide-slate-100 p-3 bg-white space-y-1">
                  {mod.lessons.map((les) => (
                    <li key={les.id} className="flex items-center justify-between py-2 px-2 text-sm text-slate-700 hover:bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        {les.type === 'video' && <Video className="size-4 text-blue-500" />}
                        {les.type === 'reading' && <FileText className="size-4 text-emerald-500" />}
                        {les.type === 'quiz' && <CheckCircle2 className="size-4 text-amber-500" />}
                        <span>{les.title}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{les.durationMinutes}p</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Submit button bar */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/platform/courses')}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Quay lại
          </button>
          <button
            type="submit"
            disabled={updateCourse.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="size-4" />
            {updateCourse.isPending ? 'Đang lưu…' : 'Lưu khóa học'}
          </button>
        </div>
      </form>
    </div>
  );
}
