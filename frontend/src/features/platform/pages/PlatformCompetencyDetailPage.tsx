import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Layers, Briefcase, Award, Save, Edit3, ShieldAlert, CheckCircle2,
} from 'lucide-react';
import { PageHeader, Modal } from '@/components/shared';
import {
  usePlatformCompetencyDetail, useUpdateCompetencySourceOfTruth,
} from '@/hooks/use-platform';

export function PlatformCompetencyDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: comp, isLoading, isError, refetch } = usePlatformCompetencyDetail(id);
  const updateSourceOfTruth = useUpdateCompetencySourceOfTruth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>();
  const [successMsg, setSuccessMsg] = useState<string>();

  useEffect(() => {
    if (comp) {
      setName(comp.name);
      setDescription(comp.description);
    }
  }, [comp]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu chuẩn năng lực số…</div>;
  }

  if (isError || !comp) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/platform/framework')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Quay lại khung năng lực
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">Không tìm thấy thông tin chuẩn năng lực này.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setErrorMsg(undefined);
    setSuccessMsg(undefined);
    try {
      await updateSourceOfTruth.mutateAsync({
        id: comp.id,
        data: {
          name: name.trim(),
          description: description.trim(),
        },
      });
      setConfirmModalOpen(false);
      setSuccessMsg('Đã lưu thay đổi vào dữ liệu gốc nền tảng (Source-of-truth) thành công.');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Không thể cập nhật dữ liệu gốc.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/platform/framework')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Danh sách năng lực chuẩn
        </button>
      </div>

      <PageHeader
        title={`${comp.code.startsWith('CMP-') ? comp.code : `CMP-${comp.code.replace(/^TT02-/, '')}`}: ${comp.name}`}
        subtitle={`Quản lý định nghĩa chuẩn (Source-of-truth) thuộc ${comp.domainName} theo Khung chuẩn năng lực số`}
      />

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Editor Box */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Edit3 className="size-5 text-primary-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Định nghĩa năng lực chuẩn nền tảng
            </h2>
          </div>
          <span className="rounded bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            Platform Admin Source-of-truth
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="comp-code" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Mã năng lực
            </label>
            <input
              id="comp-code"
              type="text"
              disabled
              value={comp.code.startsWith('CMP-') ? comp.code : `CMP-${comp.code.replace(/^TT02-/, '')}`}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="comp-domain" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Miền năng lực số
            </label>
            <input
              id="comp-domain"
              type="text"
              disabled
              value={comp.domainName}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label htmlFor="comp-name-input" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Tên năng lực chuẩn (Tiếng Việt)
          </label>
          <input
            id="comp-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="comp-desc-input" className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Mô tả phạm vi và ý nghĩa chuẩn (Descriptor)
          </label>
          <textarea
            id="comp-desc-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setConfirmModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Save className="size-4" />
            Lưu thay đổi Source-of-truth
          </button>
        </div>
      </div>

      {/* 3 Trình độ & 8 Bậc năng lực chi tiết */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Layers className="size-5 text-primary-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Tiêu chuẩn trình độ & các bậc năng lực theo Khung chuẩn
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {comp.levelsDetail.map((lvl) => (
            <div
              key={lvl.level}
              className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      Trình độ {lvl.levelName}
                    </span>
                    <span className="text-xs text-primary-700 font-semibold font-mono">
                      {lvl.subLevels}
                    </span>
                  </div>
                  <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-bold text-primary-800">
                    Mức {lvl.level}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-600">Chỉ số hành vi chuẩn:</span>
                    <p className="text-slate-800 mt-0.5 leading-relaxed">{lvl.behaviorIndicator}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Hướng dẫn đánh giá:</span>
                    <p className="text-slate-700 mt-0.5">{lvl.assessmentGuidance}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Minh chứng thực tế:</span>
                    <p className="text-slate-700 mt-0.5">{lvl.evidenceGuidance}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-400">
                Áp dụng chuẩn hóa cho toàn bộ chương trình và đề đánh giá
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Position requirements & Standard courses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Reference Positions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="size-5 text-primary-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Vị trí tham chiếu yêu cầu năng lực này
            </h2>
          </div>
          {comp.referencePositions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Chưa có vị trí tham chiếu nào yêu cầu.</p>
          ) : (
            <div className="space-y-2.5">
              {comp.referencePositions.map((pos) => (
                <div
                  key={pos.code}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 text-sm"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">{pos.name}</span>
                    <span className="text-xs text-slate-500 font-mono">{pos.code}</span>
                  </div>
                  <span className="rounded bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-800">
                    Trình độ {pos.requiredLevel === 1 ? 'Cơ bản' : pos.requiredLevel === 2 ? 'Trung cấp' : 'Nâng cao'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Standard Courses */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="size-5 text-primary-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Khóa đào tạo chuẩn liên kết
            </h2>
          </div>
          {comp.standardCourses.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Chưa có khóa học chuẩn liên kết.</p>
          ) : (
            <div className="space-y-2.5">
              {comp.standardCourses.map((crs) => (
                <div
                  key={crs.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 text-sm"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">{crs.title}</span>
                    <span className="text-xs text-slate-500 font-mono">{crs.code}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/platform/courses/${crs.id}`)}
                    className="text-xs font-semibold text-primary-700 hover:underline"
                  >
                    Xem khóa →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Xác nhận cập nhật dữ liệu gốc (Source-of-truth)"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
            <ShieldAlert className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Lưu ý quan trọng:</strong> Đây là dữ liệu gốc chuẩn toàn nền tảng. Thay đổi này sẽ ảnh hưởng tới hiển thị trên tất cả doanh nghiệp và chương trình đào tạo liên kết.
            </span>
          </div>

          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn lưu thay đổi cho năng lực chuẩn <strong className="text-slate-900">{comp.code}</strong> không?
          </p>

          {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setConfirmModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateSourceOfTruth.isPending}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {updateSourceOfTruth.isPending ? 'Đang lưu…' : 'Xác nhận cập nhật'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
