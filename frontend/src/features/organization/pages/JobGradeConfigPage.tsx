import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Users, Briefcase } from 'lucide-react';
import { PageHeader, Modal } from '@/components/shared';
import { useJobGrades, useUpdateJobGrade } from '@/hooks/use-job-grades';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/utils';
import { INPUT_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import type { JobGradeItem } from '@/services/job-grade.service';

export function JobGradeConfigPage() {
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.JOB_GRADE_MANAGE);

  const { data: grades, isLoading, isError } = useJobGrades();
  const [editingGrade, setEditingGrade] = useState<JobGradeItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const updateMutation = useUpdateJobGrade();

  const handleEdit = (g: JobGradeItem) => {
    setEditingGrade(g);
    setName(g.name);
    setDescription(g.description);
  };

  const handleSave = async () => {
    if (!editingGrade) return;
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên hiển thị cho cấp bậc.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        code: editingGrade.code,
        data: { name: name.trim(), description: description.trim() },
      });
      toast.success(`Đã cập nhật Cấp bậc ${editingGrade.code}`);
      setEditingGrade(null);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Không cập nhật được cấp bậc'));
    }
  };

  if (isLoading) return <p className="text-sm text-slate-500">Đang tải cấu hình cấp bậc…</p>;
  if (isError || !grades) {
    return <p role="alert" className="text-sm text-red-600">Không tải được cấu hình cấp bậc.</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/enterprise/positions"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Vị trí công việc
      </Link>

      <PageHeader
        title="Cấu hình Cấp bậc (G1 – G3)"
        subtitle="Quản lý tên hiển thị và định nghĩa trách nhiệm cho 3 cấp bậc chuẩn trong tổ chức. Mã cấp bậc G1, G2, G3 là cố định."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {grades.map((g) => {
          const badgeColor =
            g.code === 'G3'
              ? 'bg-purple-100 text-purple-800 border-purple-200'
              : g.code === 'G2'
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-teal-100 text-teal-800 border-teal-200';

          return (
            <div
              key={g.code}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badgeColor}`}>
                    {g.code}
                  </span>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleEdit(g)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 rounded-md hover:bg-slate-50 transition-colors"
                      title="Chỉnh sửa tên và mô tả"
                    >
                      <Edit2 className="size-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900">{g.name}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed min-h-16">
                  {g.description || 'Chưa có mô tả chi tiết cho cấp bậc này.'}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Briefcase className="size-4 text-slate-400" />
                  <span>{g.positionCount} vị trí áp dụng</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Users className="size-4 text-slate-400" />
                  <span>{g.employeeCount} nhân sự</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">Quy tắc Cấp bậc theo chuẩn DigiTalent AI v2.1:</p>
        <p>• Cấp bậc gắn liền với từng vị trí công việc cụ thể và tự động suy ra cho nhân sự giữ vị trí đó.</p>
        <p>• Mã G1, G2, G3 được chuẩn hóa xuyên suốt hệ thống để phục vụ tính toán khoảng trống và giao đào tạo theo cấp bậc.</p>
      </div>

      {editingGrade && (
        <Modal
          open={Boolean(editingGrade)}
          onClose={() => setEditingGrade(null)}
          size="sm"
          title={`Chỉnh sửa Cấp bậc ${editingGrade.code}`}
          description="Cập nhật tên hiển thị phù hợp với văn hóa và cơ cấu chức danh doanh nghiệp của bạn."
          footer={
            <>
              <button
                type="button"
                onClick={() => setEditingGrade(null)}
                className={SECONDARY_BUTTON}
                disabled={updateMutation.isPending}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={PRIMARY_BUTTON}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mã cấp bậc</label>
              <input
                disabled
                value={editingGrade.code}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-md text-sm text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên hiển thị *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Chuyên viên, Trưởng nhóm, Trưởng phòng..."
                className={INPUT_CLASS}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả định nghĩa</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Mô tả phạm vi trách nhiệm hoặc mức độ chuyên môn của cấp bậc..."
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
