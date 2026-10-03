import { useState } from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useSaveGrades } from '@/hooks/use-onboarding';
import type { OrganizationSetup, SetupGrade } from '@/types/commerce';
import { INPUT_CLASS, LINK_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON, errorMessage } from './styles';

interface GradesStepProps {
  setup: OrganizationSetup;
  onBack: () => void;
  onDone: () => void;
  onSkip: () => void;
}

const DEFAULT_GRADES: SetupGrade[] = [
  {
    code: 'G1',
    name: 'Cấp Tác nghiệp / Chuyên viên',
    description: 'Thực hiện công việc chuyên môn, tác nghiệp hàng ngày',
  },
  {
    code: 'G2',
    name: 'Cấp Quản lý trực tiếp / Trưởng nhóm',
    description: 'Quản lý nhóm, phân công, giám sát và đánh giá công việc',
  },
  {
    code: 'G3',
    name: 'Cấp Lãnh đạo / Quản lý cấp cao',
    description: 'Định hướng chiến lược, quản trị phòng ban và toàn tổ chức',
  },
];

/**
 * AUTH-05: Cấu hình Cấp bậc (G1–G3) trong Setup Wizard.
 * Hệ thống DigiTalent AI chuẩn hóa 3 Cấp bậc G1-G3 để phân định vai trò,
 * quyền hạn duyệt minh chứng và ma trận yêu cầu năng lực.
 */
export function GradesStep({ setup, onBack, onDone, onSkip }: GradesStepProps) {
  const save = useSaveGrades();
  const [error, setError] = useState<string>();
  const [grades, setGrades] = useState<SetupGrade[]>(() => {
    if (setup.grades && setup.grades.length === 3) {
      return setup.grades;
    }
    return DEFAULT_GRADES;
  });

  const updateGrade = (code: string, field: 'name' | 'description', value: string) => {
    setGrades((prev) =>
      prev.map((g) => (g.code === code ? { ...g, [field]: value } : g)),
    );
  };

  const submit = async () => {
    setError(undefined);
    try {
      await save.mutateAsync(grades);
      onDone();
    } catch (failure) {
      setError(errorMessage(failure));
    }
  };

  return (
    <div className="grid max-w-2xl gap-6">
      <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-sm text-sky-900">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-sky-600" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold text-sky-950">Quy chuẩn Cấp bậc G1–G3</p>
            <p className="text-xs text-sky-800 leading-relaxed">
              Mã cấp bậc <strong>G1, G2, G3</strong> là bất biến trong hệ thống nhằm liên kết tự động với khung năng lực Thông tư 02/2025.
              Bạn có thể điều chỉnh <strong>Tên hiển thị</strong> và <strong>Mô tả</strong> phù hợp với cơ cấu chức danh tại tổ chức của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {grades.map((grade) => (
          <div
            key={grade.code}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-colors hover:border-slate-300"
          >
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-700">
                  <ShieldCheck className="size-3.5" />
                  Mã: {grade.code}
                </span>
                <span className="text-xs text-slate-500">
                  {grade.code === 'G1'
                    ? '(Nhân viên / Chuyên viên)'
                    : grade.code === 'G2'
                    ? '(Trưởng nhóm / Phó phòng / Trưởng phòng)'
                    : '(Ban Giám đốc / Lãnh đạo)'}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor={`grade-name-${grade.code}`} className="text-xs font-medium text-slate-700">
                  Tên hiển thị cấp bậc <span className="text-red-500">*</span>
                </label>
                <input
                  id={`grade-name-${grade.code}`}
                  value={grade.name}
                  onChange={(e) => updateGrade(grade.code, 'name', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Ví dụ: Chuyên viên"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor={`grade-desc-${grade.code}`} className="text-xs font-medium text-slate-700">
                  Mô tả vai trò
                </label>
                <input
                  id={`grade-desc-${grade.code}`}
                  value={grade.description}
                  onChange={(e) => updateGrade(grade.code, 'description', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Mô tả trách nhiệm cốt lõi"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button type="button" onClick={onBack} className={SECONDARY_BUTTON}>
          Quay lại
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={save.isPending || grades.some((g) => !g.name.trim())}
          className={PRIMARY_BUTTON}
        >
          {save.isPending ? 'Đang lưu…' : 'Lưu và tiếp tục'}
        </button>
        <button type="button" onClick={onSkip} className={LINK_BUTTON}>
          Bỏ qua (dùng mặc định)
        </button>
      </div>
    </div>
  );
}
