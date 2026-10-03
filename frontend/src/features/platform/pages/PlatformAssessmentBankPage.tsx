import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, CheckCircle2 } from 'lucide-react';
import { PageHeader, DataTable, Modal } from '@/components/shared';
import { usePlatformAssessmentBank } from '@/hooks/use-platform';
import { levelLabel } from '@/lib/competency-levels';
import { CATEGORIES } from '@/services/mock/server/catalog';
import type { PlatformAssessmentQuestionDto } from '@/services/platform.service';

export function PlatformAssessmentBankPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [domainId, setDomainId] = useState('');
  const [level, setLevel] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data, isLoading, isError, refetch } = usePlatformAssessmentBank({
    search: search || undefined,
    domainId: domainId || undefined,
    level: level ? Number(level) : undefined,
    type: type || undefined,
    pageIndex,
    pageSize: 15,
  });

  // Question detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<PlatformAssessmentQuestionDto | null>(null);

  const openDetail = (q: PlatformAssessmentQuestionDto) => {
    setSelectedQuestion(q);
    setDetailModalOpen(true);
  };

  const columns = [
    {
      key: 'code',
      header: 'Mã câu hỏi',
      cell: (row: PlatformAssessmentQuestionDto) => (
        <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
          {row.code}
        </span>
      ),
    },
    {
      key: 'competency',
      header: 'Năng lực đo lường',
      cell: (row: PlatformAssessmentQuestionDto) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-800">{row.competencyCode}</span>
          <p className="text-xs text-slate-500 line-clamp-1">{row.competencyName}</p>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Trình độ & Bậc năng lực',
      cell: (row: PlatformAssessmentQuestionDto) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
          {levelLabel(row.level)} (Bậc {row.level === 1 ? '1–2' : row.level === 2 ? '3–4' : '5–8'})
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Dạng đề',
      cell: (row: PlatformAssessmentQuestionDto) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          row.type === 'MCQ' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
        }`}>
          {row.type === 'MCQ' ? 'Trắc nghiệm (MCQ)' : 'Barem thực hành'}
        </span>
      ),
    },
    {
      key: 'question',
      header: 'Nội dung câu hỏi',
      cell: (row: PlatformAssessmentQuestionDto) => (
        <p className="text-xs text-slate-700 line-clamp-2 max-w-md">{row.questionText}</p>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      cell: (row: PlatformAssessmentQuestionDto) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(row)}
            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Eye className="size-3.5" />
            Xem
          </button>
          <button
            type="button"
            onClick={() => navigate(`/platform/questions/${row.id}`)}
            className="inline-flex items-center gap-1 rounded border border-primary-200 bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
          >
            Sửa
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader
          title="Ngân hàng đề thi & bài đánh giá chuẩn"
          subtitle="Quản lý câu hỏi trắc nghiệm, tình huống nghiệp vụ và barem chấm điểm thực hành chuẩn Thông tư 02"
        />

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => navigate('/platform/assessment-templates')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Mẫu đề đánh giá →
          </button>
          <button
            type="button"
            onClick={() => navigate('/platform/questions/new')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 shadow-sm"
          >
            + Soạn câu hỏi mới
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo nội dung, mã câu hỏi hoặc tên năng lực..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={domainId}
            onChange={(e) => {
              setDomainId(e.target.value);
              setPageIndex(1);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả miền năng lực</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.code}: {cat.name}
              </option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPageIndex(1);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả trình độ</option>
            <option value="1">Cơ bản (Bậc 1–2)</option>
            <option value="2">Trung cấp (Bậc 3–4)</option>
            <option value="3">Nâng cao (Bậc 5–8)</option>
          </select>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPageIndex(1);
            }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả dạng đề</option>
            <option value="MCQ">Trắc nghiệm (MCQ)</option>
            <option value="PRACTICAL_RUBRIC">Barem thực hành</option>
          </select>
        </div>
      </div>

      {isLoading && <div className="p-8 text-center text-slate-500">Đang tải ngân hàng đề…</div>}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không thể tải danh sách câu hỏi.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
            Thử lại
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <DataTable
            data={data.items}
            columns={columns}
            keyExtractor={(row) => row.id}
            emptyTitle="Không tìm thấy câu hỏi phù hợp."
          />

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Hiển thị trang {data.pageIndex} / {data.totalPages} (Tổng số {data.totalItems} câu hỏi)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pageIndex <= 1}
                  onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 text-xs font-medium border border-slate-200 rounded bg-white disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={pageIndex >= data.totalPages}
                  onClick={() => setPageIndex((p) => p + 1)}
                  className="px-3 py-1 text-xs font-medium border border-slate-200 rounded bg-white disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question Detail Modal */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết câu hỏi: ${selectedQuestion?.code}`}
      >
        {selectedQuestion && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded bg-primary-100 px-2 py-0.5 font-mono font-bold text-primary-800">
                {selectedQuestion.competencyCode}
              </span>
              <span className="font-semibold text-slate-700">{selectedQuestion.competencyName}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                Mức {selectedQuestion.level} · {levelLabel(selectedQuestion.level)}
              </span>
            </div>

            <div>
              <p className="font-medium text-slate-900 mb-1">Nội dung tình huống / Câu hỏi:</p>
              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 text-slate-800 leading-relaxed">
                {selectedQuestion.questionText}
              </div>
            </div>

            {selectedQuestion.type === 'MCQ' && selectedQuestion.options && (
              <div>
                <p className="font-medium text-slate-900 mb-2">Các phương án đáp án:</p>
                <div className="space-y-2">
                  {selectedQuestion.options.map((opt, i) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${
                        opt.isCorrect
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-medium'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="font-bold">{String.fromCharCode(65 + i)}.</span>
                      <span className="flex-1">{opt.text}</span>
                      {opt.isCorrect && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          <CheckCircle2 className="size-3.5" /> Đáp án chuẩn
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedQuestion.type === 'PRACTICAL_RUBRIC' && selectedQuestion.rubricGuide && (
              <div>
                <p className="font-medium text-slate-900 mb-1">Hướng dẫn chấm điểm thực hành (Barem Rubric):</p>
                <div className="rounded-lg bg-purple-50 p-3.5 border border-purple-200 text-purple-900 leading-relaxed">
                  {selectedQuestion.rubricGuide}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
