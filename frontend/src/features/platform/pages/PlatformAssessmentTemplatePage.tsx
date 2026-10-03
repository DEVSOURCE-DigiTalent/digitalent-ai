import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Edit3, Clock, RotateCcw, Layers,
} from 'lucide-react';
import { PageHeader, StatusBadge, DataTable, Modal } from '@/components/shared';
import {
  usePlatformAssessmentTemplates, useUpdateAssessmentTemplate,
} from '@/hooks/use-platform';
import type { PlatformAssessmentTemplateDto } from '@/services/platform.service';

export function PlatformAssessmentTemplatePage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [pageIndex, setPageIndex] = useState(1);

  const { data, isLoading, isError, refetch } = usePlatformAssessmentTemplates({
    search: search || undefined,
    status: status || undefined,
    pageIndex,
    pageSize: 15,
  });

  const updateTemplate = useUpdateAssessmentTemplate();

  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTpl, setSelectedTpl] = useState<PlatformAssessmentTemplateDto | null>(null);
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [passScorePercentage, setPassScorePercentage] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [tplStatus, setTplStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [errorMsg, setErrorMsg] = useState<string>();

  const openEdit = (tpl: PlatformAssessmentTemplateDto) => {
    setSelectedTpl(tpl);
    setTitle(tpl.title);
    setDurationMinutes(tpl.durationMinutes);
    setTotalQuestions(tpl.totalQuestions);
    setPassScorePercentage(tpl.passScorePercentage);
    setMaxAttempts(tpl.maxAttempts);
    setTplStatus(tpl.status);
    setErrorMsg(undefined);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTpl) return;
    setErrorMsg(undefined);
    try {
      await updateTemplate.mutateAsync({
        id: selectedTpl.id,
        data: {
          title: title.trim(),
          durationMinutes: Number(durationMinutes),
          totalQuestions: Number(totalQuestions),
          passScorePercentage: Number(passScorePercentage),
          maxAttempts: Number(maxAttempts),
          status: tplStatus,
        },
      });
      setEditModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể lưu cấu hình đề đánh giá.');
    }
  };

  const columns = [
    {
      key: 'code',
      header: 'Mã & Tên đề đánh giá chuẩn',
      cell: (row: PlatformAssessmentTemplateDto) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.title}</span>
          <span className="font-mono text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded inline-block mt-0.5">
            {row.code}
          </span>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'rules',
      header: 'Thời lượng & Quy chuẩn',
      cell: (row: PlatformAssessmentTemplateDto) => (
        <div className="space-y-1 text-xs text-slate-700">
          <p className="flex items-center gap-1 font-medium">
            <Clock className="size-3.5 text-slate-400" /> {row.durationMinutes} phút
          </p>
          <p className="flex items-center gap-1">
            <Layers className="size-3.5 text-slate-400" /> {row.totalQuestions} câu hỏi
          </p>
        </div>
      ),
    },
    {
      key: 'criteria',
      header: 'Ngưỡng đạt & Lần thử',
      cell: (row: PlatformAssessmentTemplateDto) => (
        <div className="space-y-1 text-xs">
          <p className="font-bold text-emerald-700">≥ {row.passScorePercentage}% điểm</p>
          <p className="text-slate-500 flex items-center gap-1">
            <RotateCcw className="size-3 text-slate-400" /> Tối đa {row.maxAttempts} lượt
          </p>
        </div>
      ),
    },
    {
      key: 'coverage',
      header: 'Độ phủ năng lực TT02',
      cell: (row: PlatformAssessmentTemplateDto) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.targetCompetencies.map((comp) => (
            <span
              key={comp.frameworkCode}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-700"
              title={`${comp.name} (${comp.questionCount} câu)`}
            >
              {comp.frameworkCode} ({comp.questionCount}q)
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (row: PlatformAssessmentTemplateDto) => (
        <StatusBadge
          label={row.status === 'ACTIVE' ? 'Đang áp dụng' : row.status === 'DRAFT' ? 'Bản nháp' : 'Lưu trữ'}
          variant={row.status === 'ACTIVE' ? 'success' : row.status === 'DRAFT' ? 'warning' : 'default'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      cell: (row: PlatformAssessmentTemplateDto) => (
        <button
          type="button"
          onClick={() => openEdit(row)}
          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Edit3 className="size-3.5" />
          Cấu hình
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/platform/questions')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Ngân hàng câu hỏi
        </button>
      </div>

      <PageHeader
        title="Mẫu bài đánh giá chuẩn (Assessment Templates)"
        subtitle="Quản lý cấu hình bộ đề kiểm tra chuẩn hóa: số lượng câu hỏi, thời gian làm bài, điểm đạt và số lần làm lại tối đa"
      />

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên mẫu đề đánh giá..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang áp dụng</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="ARCHIVED">Lưu trữ</option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Đang tải danh sách mẫu đề đánh giá…</div>
      ) : isError || !data ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không thể tải danh sách mẫu đề đánh giá.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
            Thử lại
          </button>
        </div>
      ) : (
        <DataTable
          data={data.items}
          columns={columns}
          keyExtractor={(row) => row.id}
          pageInfo={{
            page: pageIndex,
            pageSize: 15,
            total: data.totalItems,
            onPageChange: setPageIndex,
          }}
          emptyTitle="Chưa có mẫu đề đánh giá chuẩn nào."
        />
      )}

      {/* Edit Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Cấu hình mẫu đề: ${selectedTpl?.code}`}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="tpl-title" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Tiêu đề mẫu đề đánh giá
            </label>
            <input
              id="tpl-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tpl-time" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Thời gian làm bài (Phút)
              </label>
              <input
                id="tpl-time"
                type="number"
                min={15}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="tpl-count" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Tổng số câu hỏi
              </label>
              <input
                id="tpl-count"
                type="number"
                min={5}
                max={100}
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tpl-pass" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Ngưỡng điểm đạt (%)
              </label>
              <input
                id="tpl-pass"
                type="number"
                min={50}
                max={100}
                value={passScorePercentage}
                onChange={(e) => setPassScorePercentage(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="tpl-attempts" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Số lần làm bài tối đa
              </label>
              <input
                id="tpl-attempts"
                type="number"
                min={1}
                max={10}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tpl-status" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Trạng thái áp dụng
            </label>
            <select
              id="tpl-status"
              value={tplStatus}
              onChange={(e) => setTplStatus(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:outline-none"
            >
              <option value="ACTIVE">Đang áp dụng (ACTIVE)</option>
              <option value="DRAFT">Bản nháp (DRAFT)</option>
              <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
            </select>
          </div>

          {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateTemplate.isPending}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {updateTemplate.isPending ? 'Đang lưu…' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
