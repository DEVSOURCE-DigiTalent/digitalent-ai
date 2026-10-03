import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { usePlatformQuestion, useSavePlatformQuestion } from '@/hooks/use-platform';
import { COMPETENCIES } from '@/services/mock/server/catalog';
import type { PlatformAssessmentQuestionDto } from '@/services/platform.service';

export function PlatformQuestionEditorPage() {
  const { id = 'new' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isNew = id === 'new';
  const { data: existingQuestion, isLoading } = usePlatformQuestion(id);
  const saveQuestion = useSavePlatformQuestion();

  const [code, setCode] = useState('');
  const [competencyCode, setCompetencyCode] = useState('TT02-1.1');
  const [level, setLevel] = useState<number>(1);
  const [type, setType] = useState<'MCQ' | 'PRACTICAL_RUBRIC'>('MCQ');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<Array<{ id: string; text: string; isCorrect: boolean }>>([
    { id: 'opt-1', text: '', isCorrect: true },
    { id: 'opt-2', text: '', isCorrect: false },
    { id: 'opt-3', text: '', isCorrect: false },
    { id: 'opt-4', text: '', isCorrect: false },
  ]);
  const [rubricGuide, setRubricGuide] = useState('');
  const [errorMsg, setErrorMsg] = useState<string>();
  const [successMsg, setSuccessMsg] = useState<string>();

  useEffect(() => {
    if (existingQuestion && !isNew) {
      setCode(existingQuestion.code);
      setCompetencyCode(existingQuestion.competencyCode);
      setLevel(existingQuestion.level);
      setType(existingQuestion.type);
      setQuestionText(existingQuestion.questionText);
      if (existingQuestion.options && existingQuestion.options.length > 0) {
        setOptions(existingQuestion.options);
      }
      setRubricGuide(existingQuestion.rubricGuide || '');
    } else if (isNew) {
      setCode(`Q-TT02-${Date.now().toString().slice(-4)}`);
    }
  }, [existingQuestion, isNew]);

  if (!isNew && isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông tin câu hỏi…</div>;
  }

  const handleOptionChange = (idx: number, text: string) => {
    const next = [...options];
    next[idx].text = text;
    setOptions(next);
  };

  const handleSetCorrect = (idx: number) => {
    const next = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === idx,
    }));
    setOptions(next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(undefined);
    setSuccessMsg(undefined);

    if (!questionText.trim()) {
      setErrorMsg('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    if (type === 'MCQ') {
      const emptyOpt = options.find((o) => !o.text.trim());
      if (emptyOpt) {
        setErrorMsg('Vui lòng điền đầy đủ các phương án trắc nghiệm.');
        return;
      }
      const hasCorrect = options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        setErrorMsg('Vui lòng chọn ít nhất một đáp án đúng.');
        return;
      }
    } else {
      if (!rubricGuide.trim()) {
        setErrorMsg('Vui lòng nhập tiêu chí chấm điểm và rubric thực hành.');
        return;
      }
    }

    try {
      const payload: Partial<PlatformAssessmentQuestionDto> = {
        id: isNew ? undefined : id,
        code: code.trim(),
        competencyCode,
        level,
        type,
        questionText: questionText.trim(),
        options: type === 'MCQ' ? options : undefined,
        rubricGuide: type === 'PRACTICAL_RUBRIC' ? rubricGuide.trim() : undefined,
      };

      await saveQuestion.mutateAsync(payload);
      setSuccessMsg('Đã lưu câu hỏi đánh giá thành công.');
      setTimeout(() => {
        navigate('/platform/questions');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể lưu câu hỏi.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/platform/questions')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Ngân hàng câu hỏi
        </button>
      </div>

      <PageHeader
        title={isNew ? 'Soạn câu hỏi đánh giá mới' : `Chỉnh sửa câu hỏi: ${code}`}
        subtitle="Biên soạn câu hỏi trắc nghiệm hoặc tiêu chí rubric thực hành gắn trực tiếp với khung năng lực TT02"
      />

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-2">
          <AlertTriangle className="size-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic metadata */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900 pb-2 border-b border-slate-100">
            Thông tin định danh câu hỏi
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="q-code" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Mã câu hỏi
              </label>
              <input
                id="q-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="q-comp" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Năng lực đo lường (TT02)
              </label>
              <select
                id="q-comp"
                value={competencyCode}
                onChange={(e) => setCompetencyCode(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:outline-none"
              >
                {COMPETENCIES.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="q-level" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Trình độ & Bậc năng lực
              </label>
              <select
                id="q-level"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:outline-none"
              >
                <option value={1}>Cơ bản (Bậc 1–2)</option>
                <option value={2}>Trung cấp (Bậc 3–4)</option>
                <option value={3}>Nâng cao (Bậc 5–8)</option>
              </select>
            </div>

            <div>
              <label htmlFor="q-type" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Dạng đề thi
              </label>
              <select
                id="q-type"
                value={type}
                onChange={(e) => setType(e.target.value as 'MCQ' | 'PRACTICAL_RUBRIC')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:outline-none"
              >
                <option value="MCQ">Trắc nghiệm chọn 1 đáp án (MCQ)</option>
                <option value="PRACTICAL_RUBRIC">Đánh giá nhiệm vụ thực hành (Rubric)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="q-text" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Nội dung câu hỏi / Tình huống nghiệp vụ (Stem)
            </label>
            <textarea
              id="q-text"
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Nhập tình huống công việc thực tế yêu cầu nhân viên áp dụng kỹ năng số để xử lý..."
              required
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* MCQ Options */}
        {type === 'MCQ' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">
                Các phương án lựa chọn (Chọn 1 đáp án đúng)
              </h2>
              <span className="text-xs text-slate-500">Đánh dấu tích tròn vào đáp án chuẩn mực</span>
            </div>

            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <input
                    type="radio"
                    name="correct-answer"
                    checked={opt.isCorrect}
                    onChange={() => handleSetCorrect(idx)}
                    className="size-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-slate-700 w-6">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Nội dung phương án ${String.fromCharCode(65 + idx)}...`}
                    className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white focus:border-primary-500 focus:outline-none"
                  />
                  {opt.isCorrect && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shrink-0">
                      Đáp án đúng
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rubric Guide for Practical questions */}
        {type === 'PRACTICAL_RUBRIC' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 pb-2 border-b border-slate-100">
              Barem chấm điểm & Tiêu chí đánh giá thực hành (Rubric)
            </h2>
            <div>
              <label htmlFor="q-rubric" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Hướng dẫn đánh giá dành cho Người đánh giá (Manager / Examiner)
              </label>
              <textarea
                id="q-rubric"
                rows={4}
                value={rubricGuide}
                onChange={(e) => setRubricGuide(e.target.value)}
                placeholder="Ví dụ: 1) Tính đúng đắn của dữ liệu phân tích; 2) Tuân thủ bảo mật thông tin; 3) Khả năng giải trình giải pháp..."
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/platform/questions')}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={saveQuestion.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 shadow-sm disabled:opacity-50"
          >
            <Save className="size-4" />
            {saveQuestion.isPending ? 'Đang lưu…' : 'Lưu câu hỏi'}
          </button>
        </div>
      </form>
    </div>
  );
}
