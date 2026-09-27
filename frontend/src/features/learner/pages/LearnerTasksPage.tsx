import React, { useState } from 'react';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  UploadCloud,
  ExternalLink,
  X,
  AlertCircle,
  FileCode,
  Link as LinkIcon,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PRACTICAL_TASKS, type PracticalTask } from '../data/learnerData';

export const LearnerTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<PracticalTask[]>(() => {
    try {
      const stored = localStorage.getItem('digitalent_tasks_state');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return PRACTICAL_TASKS;
  });

  const [activeTaskModal, setActiveTaskModal] = useState<PracticalTask | null>(null);

  // Form states for submission modal
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [reportUrl, setReportUrl] = useState<string>('');
  const [summaryNotes, setSummaryNotes] = useState<string>('');
  const [agreedSecurity, setAgreedSecurity] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  const handleOpenSubmitModal = (task: PracticalTask) => {
    setActiveTaskModal(task);
    setRepoUrl(task.submission?.repoUrl || '');
    setReportUrl(task.submission?.reportUrl || '');
    setSummaryNotes(task.submission?.summaryNotes || '');
    setAgreedSecurity(true);
    setFormError('');
  };

  const handleCloseModal = () => {
    setActiveTaskModal(null);
    setFormError('');
  };

  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl.trim() && !reportUrl.trim()) {
      setFormError('Vui lòng cung cấp ít nhất một đường dẫn liên kết (GitHub Repo hoặc Báo cáo).');
      return;
    }

    if (!summaryNotes.trim()) {
      setFormError('Vui lòng nhập tóm tắt kết quả triển khai và phương án giải quyết.');
      return;
    }

    if (!agreedSecurity) {
      setFormError('Vui lòng xác nhận quyền chia sẻ và tuân thủ an toàn dữ liệu.');
      return;
    }

    if (!activeTaskModal) return;

    const updatedTasks: PracticalTask[] = tasks.map((t) => {
      if (t.id === activeTaskModal.id) {
        return {
          ...t,
          status: 'SUBMITTED',
          submission: {
            repoUrl: repoUrl.trim(),
            reportUrl: reportUrl.trim(),
            summaryNotes: summaryNotes.trim(),
            submittedAt: new Date().toLocaleString('vi-VN'),
          },
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    try {
      localStorage.setItem('digitalent_tasks_state', JSON.stringify(updatedTasks));
    } catch {
      // ignore
    }

    setSuccessToast(`Đã gửi nộp bài thực hành ${activeTaskModal.id} thành công! Đang chờ giảng viên chấm điểm.`);
    setTimeout(() => setSuccessToast(''), 4000);
    handleCloseModal();
  };

  return (
    <div data-testid="learner-tasks-page" className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="border-b pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <FileCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Bài tập thực chiến</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Nhiệm vụ & Bài tập thực hành</h1>
          <p className="text-sm text-slate-500 mt-1">
            Áp dụng kiến thức đã học vào các tình huống thực tế tại doanh nghiệp để được chấm điểm tự động và nhận phản hồi chi tiết.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-semibold">
            Đã đạt: {tasks.filter((t) => t.status === 'GRADED').length} bài
          </span>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 font-semibold">
            Đang chấm: {tasks.filter((t) => t.status === 'SUBMITTED').length} bài
          </span>
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-semibold animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Task List Cards */}
      <div className="space-y-5">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col space-y-4 hover:border-slate-300 transition"
          >
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    {t.id}
                  </span>
                  <span className="text-xs text-blue-600 font-semibold">
                    {t.courseTitle}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  {t.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Hạn nộp: <strong className="text-slate-700">{t.dueDate}</strong>
                  </span>
                  {t.score !== undefined && (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Điểm số: {t.score}/100
                    </span>
                  )}
                  {t.submission?.submittedAt && (
                    <span className="text-slate-500">
                      Nộp lúc: {t.submission.submittedAt}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                {t.status === 'GRADED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã có điểm</span>
                  </span>
                )}
                {t.status === 'SUBMITTED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-300">
                    <Clock className="w-4 h-4" />
                    <span>Đang chấm điểm</span>
                  </span>
                )}
                {t.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => handleOpenSubmitModal(t)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Nộp bài làm</span>
                  </button>
                )}
              </div>
            </div>

            {/* Rubrics Accordion / Checklist */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Tiêu chí đánh giá & Nghiệm thu (Rubrics):
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                {t.rubrics.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold shrink-0">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Submission & Feedback details if submitted or graded */}
            {t.submission && (
              <div className="bg-white rounded-xl p-4 border border-blue-100 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <span className="font-bold text-slate-800">Minh chứng đã nộp:</span>
                  <div className="flex items-center gap-3">
                    {t.submission.repoUrl && (
                      <a
                        href={t.submission.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Kho mã nguồn GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {t.submission.reportUrl && (
                      <a
                        href={t.submission.reportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Báo cáo Google Docs/Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-slate-600">
                  <strong>Thuyết minh giải pháp:</strong> {t.submission.summaryNotes}
                </p>

                {t.submission.evaluatorNotes && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 mt-2">
                    <strong>Đánh giá của Giảng viên:</strong> {t.submission.evaluatorNotes}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Practical Task Submission Modal */}
      {activeTaskModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Nộp minh chứng công việc thực tế
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {activeTaskModal.title}
              </h2>
              <p className="text-xs text-slate-500">
                Khóa học: {activeTaskModal.courseTitle}
              </p>
            </div>

            <form onSubmit={handleSubmitEvidence} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Liên kết kho mã nguồn (GitHub / GitLab Repo URL):
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/project-repo"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono transition"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Liên kết tài liệu hoặc báo cáo nghiệm thu (Google Drive / Notion):
                </label>
                <input
                  type="url"
                  value={reportUrl}
                  onChange={(e) => setReportUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono transition"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Tóm tắt kết quả triển khai & Thuyết minh giải pháp (*):
                </label>
                <textarea
                  value={summaryNotes}
                  onChange={(e) => setSummaryNotes(e.target.value)}
                  rows={4}
                  required
                  placeholder="Mô tả các kỹ thuật đã áp dụng, số lượng mẫu kiểm thử, kết quả đo lường và các bài học rút ra..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedSecurity}
                    onChange={(e) => setAgreedSecurity(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-600 leading-relaxed">
                    Tôi xác nhận có toàn quyền chia sẻ liên kết này và đã kiểm tra loại bỏ các thông tin bí mật hoặc dữ liệu cá nhân nhạy cảm theo quy định bảo mật.
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Gửi nộp bài đánh giá</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
