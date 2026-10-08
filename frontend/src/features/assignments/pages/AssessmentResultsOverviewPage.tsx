import { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  FileQuestion,
  Check,
} from 'lucide-react';
import { PageHeader, StatusBadge, DataTable, ScoreCard } from '@/components/shared';
import { useAssessmentHistory } from '@/hooks/use-learning';
import { formatDate } from '@/lib/utils';
import type { AssessmentAttemptRowDto } from '@/services/learning.service';

interface QuestionReview {
  id: string;
  questionText: string;
  options: { key: string; text: string }[];
  selectedKey: string;
  correctKey: string;
  explanation: string;
}

/** Drill-down modal showing question-by-question attempt review */
function AssessmentAttemptDetailModal({
  attempt,
  open,
  onClose,
}: {
  attempt: AssessmentAttemptRowDto | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !attempt) return null;

  // Mock detailed question answers corresponding to the attempt
  const questions: QuestionReview[] = [
    {
      id: 'q1',
      questionText: 'Theo Khung chuẩn năng lực số, việc bảo vệ thông tin nhận dạng cá nhân khi làm việc trên môi trường mạng bao gồm những nguyên tắc nào?',
      options: [
        { key: 'A', text: 'Chỉ chia sẻ dữ liệu khi cần thiết và kích hoạt xác thực 2 lớp (2FA).' },
        { key: 'B', text: 'Lưu trữ mật khẩu trên trình duyệt công cộng để tiện truy cập.' },
        { key: 'C', text: 'Sử dụng chung một mật khẩu cho mọi tài khoản để không bị quên.' },
        { key: 'D', text: 'Tắt tính năng thông báo đăng nhập lạ.' },
      ],
      selectedKey: 'A',
      correctKey: 'A',
      explanation: 'Miền 4 (An toàn số): Nhân sự phải nắm rõ cách bảo vệ dữ liệu cá nhân và chủ động thiết lập xác thực đa yếu tố.',
    },
    {
      id: 'q2',
      questionText: 'Khi phát hiện một email có dấu hiệu lừa đảo (phishing) mạo danh phòng kế toán yêu cầu chuyển khoản, nhân viên cần thực hiện bước nào trước tiên?',
      options: [
        { key: 'A', text: 'Bấm vào liên kết để kiểm tra xem tài khoản có bị khóa không.' },
        { key: 'B', text: 'Không bấm vào liên kết, giữ nguyên email và báo cáo ngay cho bộ phận CNTT / An toàn thông tin.' },
        { key: 'C', text: 'Chuyển tiếp cho các đồng nghiệp khác để cảnh báo mà không thông báo IT.' },
        { key: 'D', text: 'Trả lời lại email hỏi xem có phải gửi nhầm hay không.' },
      ],
      selectedKey: attempt.score < 70 ? 'A' : 'B',
      correctKey: 'B',
      explanation: 'Nguyên tắc an toàn số: Tuyệt đối không tương tác với các tệp đính kèm hoặc URL nghi vấn; cô lập và gửi cảnh báo đến IT.',
    },
    {
      id: 'q3',
      questionText: 'Trong hợp tác và giao tiếp số (Miền 2), khi điều phối dự án liên phòng ban, công cụ nào sau đây đảm bảo tính minh bạch và theo dõi tiến độ theo thời gian thực?',
      options: [
        { key: 'A', text: 'Gửi tin nhắn riêng rẽ qua mạng xã hội cá nhân.' },
        { key: 'B', text: 'Nền tảng quản lý công việc số tích hợp (Digital Work Management / KanBan) có phân quyền.' },
        { key: 'C', text: 'Ghi chú trên sổ tay cá nhân của quản lý.' },
        { key: 'D', text: 'Họp mặt trực tiếp hàng ngày mà không có biên bản lưu trữ số.' },
      ],
      selectedKey: 'B',
      correctKey: 'B',
      explanation: 'Miền 2.2: Sử dụng công cụ số để hợp tác, phân công và kiểm soát luồng công việc tập trung.',
    },
    {
      id: 'q4',
      questionText: 'Để tối ưu hóa việc phân tích dữ liệu bán hàng hàng tuần (Miền 1: Thông tin và dữ liệu), giải pháp số nào sau đây mang lại hiệu quả cao nhất?',
      options: [
        { key: 'A', text: 'Nhập tay dữ liệu từng hóa đơn vào sổ ghi chép.' },
        { key: 'B', text: 'Sử dụng bảng tính số kết hợp hàm trích xuất tự động và biểu đồ trực quan hóa dữ liệu.' },
        { key: 'C', text: 'Chỉ ước tính doanh thu dựa trên kinh nghiệm.' },
        { key: 'D', text: 'Chờ đến cuối năm mới tổng hợp lại một lần.' },
      ],
      selectedKey: attempt.score < 80 ? 'A' : 'B',
      correctKey: 'B',
      explanation: 'Miền 1.3: Quản lý, lưu trữ và tổ chức dữ liệu bằng công cụ số có cấu trúc.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chi tiết kết quả làm bài</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Học viên: <strong className="text-slate-800">{attempt.employeeName}</strong> (ID: {attempt.employeeId})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Điểm số</p>
              <p className={`text-2xl font-bold mt-1 ${attempt.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                {attempt.score}%
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Kết quả</p>
              <div className="mt-1 flex justify-center">
                <StatusBadge
                  variant={attempt.passed ? 'success' : 'danger'}
                  label={attempt.passed ? 'Đạt chuẩn' : 'Chưa đạt'}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Câu đúng</p>
              <p className="text-xl font-bold text-slate-800 mt-1">
                {attempt.correctAnswers} / {attempt.totalQuestions}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Thời gian làm</p>
              <p className="text-sm font-semibold text-slate-700 mt-1.5">
                {Math.floor(attempt.durationSeconds / 60)}p {attempt.durationSeconds % 60}s
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Bài thi: {attempt.courseTitle}
            </h3>
            <p className="text-xs text-slate-500">
              Mã bài đánh giá: <span className="font-mono">{attempt.assessmentId}</span> · Nộp lúc: {formatDate(attempt.submittedAt)}
            </p>
          </div>

          {/* Drill-down Question List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileQuestion className="size-4 text-blue-600" />
              <span>Chi tiết từng câu hỏi ({questions.length} câu)</span>
            </h4>

            {questions.map((q, idx) => {
              const isCorrect = q.selectedKey === q.correctKey;
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-4 space-y-3 transition ${
                    isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      <span className="text-blue-600 font-bold mr-1">Câu {idx + 1}:</span>
                      {q.questionText}
                    </p>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                        <Check className="size-3.5" /> Đúng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded shrink-0">
                        <X className="size-3.5" /> Sai
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-1.5 pl-2">
                    {q.options.map((opt) => {
                      const isUserChoice = opt.key === q.selectedKey;
                      const isTargetCorrect = opt.key === q.correctKey;
                      let badgeStyle = 'border-slate-200 bg-white text-slate-700';

                      if (isTargetCorrect) {
                        badgeStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-medium';
                      } else if (isUserChoice && !isCorrect) {
                        badgeStyle = 'border-rose-300 bg-rose-50 text-rose-900 font-medium';
                      }

                      return (
                        <div
                          key={opt.key}
                          className={`text-xs p-2.5 rounded-lg border flex items-center justify-between gap-2 ${badgeStyle}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold shrink-0">{opt.key}.</span>
                            <span>{opt.text}</span>
                          </div>
                          {isUserChoice && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                              Học viên chọn
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800">Chuẩn năng lực & Giải thích: </span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export function AssessmentResultsOverviewPage() {
  const [search, setSearch] = useState('');
  const [passed, setPassed] = useState<string>('');
  const [pageIndex, setPageIndex] = useState(1);
  const [selectedAttempt, setSelectedAttempt] = useState<AssessmentAttemptRowDto | null>(null);

  const { data, isLoading } = useAssessmentHistory({
    search: search || undefined,
    passed: passed || undefined,
    pageIndex,
    pageSize: 15,
  });

  const allRows = data?.items ?? [];

  // KPIs
  const totalAttempts = data?.totalItems ?? allRows.length;
  const passedAttempts = allRows.filter((r) => r.passed).length;
  const passRate = allRows.length > 0 ? Math.round((passedAttempts / allRows.length) * 100) : 0;
  const avgScore = allRows.length > 0 ? Math.round(allRows.reduce((sum, r) => sum + r.score, 0) / allRows.length) : 0;
  const failedAttempts = allRows.filter((r) => !r.passed).length;

  const columns = [
    {
      key: 'employee',
      header: 'Nhân viên',
      cell: (row: AssessmentAttemptRowDto) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
            {row.employeeName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">{row.employeeName}</p>
            <p className="text-xs text-slate-500 font-mono">ID: {row.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'courseTitle',
      header: 'Bài đánh giá / Khóa học',
      cell: (row: AssessmentAttemptRowDto) => (
        <div>
          <p className="font-medium text-sm text-slate-900">{row.courseTitle}</p>
          <p className="text-xs text-slate-500">Mã bài thi: {row.assessmentId}</p>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Điểm số',
      cell: (row: AssessmentAttemptRowDto) => (
        <div className="flex items-center gap-2">
          {row.passed ? (
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="size-4 text-rose-600 shrink-0" />
          )}
          <span className="font-bold text-sm text-slate-900">{row.score}%</span>
          <span className="text-xs text-slate-500">
            ({row.correctAnswers}/{row.totalQuestions})
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Kết quả',
      cell: (row: AssessmentAttemptRowDto) => (
        <StatusBadge
          variant={row.passed ? 'success' : 'danger'}
          label={row.passed ? 'Đạt chuẩn' : 'Chưa đạt'}
        />
      ),
    },
    {
      key: 'duration',
      header: 'Thời gian',
      cell: (row: AssessmentAttemptRowDto) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Clock className="size-3.5 text-slate-400" />
          {Math.floor(row.durationSeconds / 60)}p {row.durationSeconds % 60}s
        </span>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Ngày làm bài',
      cell: (row: AssessmentAttemptRowDto) => (
        <span className="text-xs text-slate-600 font-medium">
          {formatDate(row.submittedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'text-right',
      cell: (row: AssessmentAttemptRowDto) => (
        <button
          type="button"
          onClick={() => setSelectedAttempt(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
        >
          <Eye className="size-3.5" />
          <span>Xem bài thi</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kết quả đánh giá năng lực"
        subtitle="Theo dõi toàn bộ các đợt kiểm tra năng lực của nhân sự trong tổ chức theo Khung chuẩn năng lực số."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard label="Tổng lượt kiểm tra" value={totalAttempts} subtitle="Lượt nộp bài" />
        <ScoreCard
          label="Tỷ lệ đạt chuẩn"
          value={`${passRate}%`}
          variant={passRate >= 70 ? 'success' : 'default'}
          subtitle="Đạt điểm yêu cầu"
        />
        <ScoreCard label="Điểm số trung bình" value={`${avgScore}%`} subtitle="Toàn doanh nghiệp" />
        <ScoreCard
          label="Lượt chưa đạt"
          value={failedAttempts}
          variant={failedAttempts > 0 ? 'danger' : 'success'}
          subtitle={failedAttempts > 0 ? 'Cần bồi dưỡng thêm' : 'Không có'}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
            placeholder="Tìm theo tên nhân sự, khóa học…"
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={passed}
            onChange={(e) => {
              setPassed(e.target.value);
              setPageIndex(1);
            }}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="">Tất cả kết quả</option>
            <option value="true">Chỉ bài đạt (≥ 70%)</option>
            <option value="false">Chỉ bài chưa đạt</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />
      ) : (
        <DataTable
          data={allRows}
          columns={columns}
          keyExtractor={(row) => row.id}
          emptyTitle="Chưa có dữ liệu kết quả đánh giá nào."
          emptyDescription="Nhân viên chưa hoàn thành bài thi trắc nghiệm nào."
        />
      )}

      {/* Drill-down Attempt Detail Modal */}
      <AssessmentAttemptDetailModal
        attempt={selectedAttempt}
        open={!!selectedAttempt}
        onClose={() => setSelectedAttempt(null)}
      />
    </div>
  );
}

