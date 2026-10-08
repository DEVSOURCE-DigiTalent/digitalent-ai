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
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-ent-fg ring-1 ring-amber-400/20">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-[#F5CA65]" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold text-[#F5CA65]">Quy chuẩn Cấp bậc G1–G3</p>
            <p className="text-xs text-ent-fg-2 leading-relaxed">
              Mã cấp bậc <strong>G1, G2, G3</strong> là bất biến trong hệ thống nhằm liên kết tự động với Khung chuẩn năng lực số.
              Bạn có thể điều chỉnh <strong>Tên hiển thị</strong> và <strong>Mô tả</strong> phù hợp với cơ cấu chức danh tại tổ chức của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {grades.map((grade) => (
          <div
            key={grade.code}
            className="rounded-xl border border-ent-line bg-ent-card p-4 shadow-md ring-1 ring-amber-400/10 transition-colors"
          >
            <div className="mb-3 flex items-center justify-between border-b border-ent-line pb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 border border-amber-400/30 px-2.5 py-1 text-xs font-bold text-[#F5CA65]">
                  <ShieldCheck className="size-3.5" />
                  Mã: {grade.code}
                </span>
                <span className="text-xs text-ent-fg-3">
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
                <label htmlFor={`grade-name-${grade.code}`} className="text-xs font-medium text-ent-fg">
                  Tên hiển thị cấp bậc <span className="text-amber-400">*</span>
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
                <label htmlFor={`grade-desc-${grade.code}`} className="text-xs font-medium text-ent-fg">
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
