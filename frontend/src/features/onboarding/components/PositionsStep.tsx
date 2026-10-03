import { useState } from 'react';
import { Plus, X, Layers } from 'lucide-react';
import { REFERENCE_POSITIONS } from '@/lib/reference-positions';
import { useSavePositions } from '@/hooks/use-onboarding';
import type { OrganizationSetup } from '@/types/commerce';
import { INPUT_CLASS, LINK_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON, errorMessage } from './styles';

interface PositionsStepProps {
  setup: OrganizationSetup;
  onBack: () => void;
  onDone: () => void;
  onSkip: () => void;
}

const DEFAULT_GRADE_MAP: Record<string, string> = {
  POS_CEO: 'G3',
  POS_CTO: 'G3',
  POS_CFO: 'G3',
  POS_CHRO: 'G3',
  POS_SALES_DIRECTOR: 'G2',
  POS_HR_SPECIALIST: 'G1',
  POS_DATA_ANALYST: 'G1',
};

/**
 * AUTH-05 / ENT-ONB-07: Vị trí công việc tổ chức sử dụng.
 * Cho phép chọn vị trí tham chiếu hoặc thêm vị trí riêng,
 * gắn Cấp bậc G1–G3 và Phòng ban tương ứng.
 */
export function PositionsStep({ setup, onBack, onDone, onSkip }: PositionsStepProps) {
  const save = useSavePositions();
  const [codes, setCodes] = useState<string[]>(() =>
    setup.positions.filter((p) => !p.isCustom).map((p) => p.code),
  );
  const [custom, setCustom] = useState<string[]>(() =>
    setup.positions.filter((p) => p.isCustom).map((p) => p.name),
  );
  const [draft, setDraft] = useState('');
  const [draftGrade, setDraftGrade] = useState('G1');
  const [draftDept, setDraftDept] = useState('');

  // Lưu cấu hình cấp bậc & phòng ban cho từng code vị trí
  const [details, setDetails] = useState<Record<string, { jobGrade?: string; departmentName?: string }>>(() => {
    const map: Record<string, { jobGrade?: string; departmentName?: string }> = {};
    for (const p of setup.positions) {
      map[p.code] = { jobGrade: p.jobGrade || DEFAULT_GRADE_MAP[p.code] || 'G1', departmentName: p.departmentName };
    }
    return map;
  });

  const [error, setError] = useState<string>();

  const grades = setup.grades ?? [
    { code: 'G1', name: 'Cấp Tác nghiệp / Chuyên viên' },
    { code: 'G2', name: 'Cấp Quản lý trực tiếp / Trưởng nhóm' },
    { code: 'G3', name: 'Cấp Lãnh đạo / Quản lý cấp cao' },
  ];

  const departments = setup.departments.map((d) => d.name);

  const toggle = (code: string) => {
    if (codes.includes(code)) {
      setCodes(codes.filter((c) => c !== code));
    } else {
      setCodes([...codes, code]);
      if (!details[code]) {
        setDetails((prev) => ({
          ...prev,
          [code]: { jobGrade: DEFAULT_GRADE_MAP[code] || 'G1' },
        }));
      }
    }
  };

  const updateDetail = (code: string, field: 'jobGrade' | 'departmentName', value: string) => {
    setDetails((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [field]: value || undefined,
      },
    }));
  };

  const addCustom = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (custom.some((name) => name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" đã có trong danh sách.`);
      return;
    }
    const customCode = `CUSTOM_${trimmed.toUpperCase().replace(/\s+/g, '_')}`;
    setError(undefined);
    setCustom([...custom, trimmed]);
    setDetails((prev) => ({
      ...prev,
      [customCode]: { jobGrade: draftGrade, departmentName: draftDept || undefined },
    }));
    setDraft('');
  };

  const total = codes.length + custom.length;

  const submit = async () => {
    setError(undefined);
    try {
      await save.mutateAsync({ codes, custom, details });
      onDone();
    } catch (failure) {
      setError(errorMessage(failure));
    }
  };

  return (
    <div className="grid max-w-3xl gap-6">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Vị trí tham chiếu chuẩn theo Thông tư 02/2025
        </legend>
        <ul className="grid gap-3 sm:grid-cols-2">
          {REFERENCE_POSITIONS.map((position) => {
            const isChecked = codes.includes(position.code);
            const currentGrade = details[position.code]?.jobGrade || DEFAULT_GRADE_MAP[position.code] || 'G1';
            const currentDept = details[position.code]?.departmentName || '';

            return (
              <li
                key={position.code}
                className={`rounded-lg border p-3 text-sm transition-colors ${
                  isChecked
                    ? 'border-primary-600 bg-primary-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(position.code)}
                    className="mt-0.5 size-4 accent-primary-600"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-slate-900">{position.name}</span>
                    <span className="block text-xs text-slate-500 line-clamp-2">{position.description}</span>
                  </span>
                </label>

                {isChecked && (
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-primary-200/60 pt-2.5">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Cấp bậc</label>
                      <select
                        value={currentGrade}
                        onChange={(e) => updateDetail(position.code, 'jobGrade', e.target.value)}
                        className="mt-0.5 h-7 w-full rounded border border-slate-300 bg-white px-1.5 text-xs text-slate-800"
                      >
                        {grades.map((g) => (
                          <option key={g.code} value={g.code}>
                            {g.code} ({g.name.split('/')[0].trim()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Phòng ban</label>
                      <select
                        value={currentDept}
                        onChange={(e) => updateDetail(position.code, 'departmentName', e.target.value)}
                        className="mt-0.5 h-7 w-full rounded border border-slate-300 bg-white px-1.5 text-xs text-slate-800"
                      >
                        <option value="">Chưa gán</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          addCustom();
        }}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
      >
        <p className="mb-2 text-sm font-medium text-slate-800 flex items-center gap-1.5">
          <Layers className="size-4 text-slate-500" />
          Thêm vị trí riêng của tổ chức
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label htmlFor="custom-position" className="text-xs text-slate-600 block mb-1">
              Tên vị trí
            </label>
            <input
              id="custom-position"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className={INPUT_CLASS}
              placeholder="Ví dụ: Chuyên viên pháp chế"
            />
          </div>

          <div>
            <label htmlFor="custom-grade" className="text-xs text-slate-600 block mb-1">
              Cấp bậc
            </label>
            <select
              id="custom-grade"
              value={draftGrade}
              onChange={(e) => setDraftGrade(e.target.value)}
              className={INPUT_CLASS}
            >
              {grades.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.code} ({g.name.split('/')[0].trim()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="custom-dept" className="text-xs text-slate-600 block mb-1">
              Phòng ban
            </label>
            <select
              id="custom-dept"
              value={draftDept}
              onChange={(e) => setDraftDept(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Chưa gán</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <button type="submit" className={SECONDARY_BUTTON}>
            <Plus className="size-4" aria-hidden="true" />
            Thêm vị trí này
          </button>
        </div>
      </form>

      {custom.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {custom.map((name) => {
            const customCode = `CUSTOM_${name.toUpperCase().replace(/\s+/g, '_')}`;
            const grade = details[customCode]?.jobGrade || 'G1';
            const dept = details[customCode]?.departmentName;

            return (
              <li
                key={name}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 py-1.5 pl-3 pr-2 text-xs font-medium text-slate-800"
              >
                <span>{name}</span>
                <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-primary-700 font-semibold border border-slate-200">
                  {grade}
                </span>
                {dept && <span className="text-[11px] text-slate-500 font-normal">({dept})</span>}
                <button
                  type="button"
                  onClick={() => setCustom(custom.filter((n) => n !== name))}
                  aria-label={`Xóa ${name}`}
                  className="grid size-5 place-items-center rounded-full hover:bg-slate-200"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button type="button" onClick={onBack} className={SECONDARY_BUTTON}>Quay lại</button>
        <button type="button" onClick={submit} disabled={save.isPending || total === 0} className={PRIMARY_BUTTON}>
          {save.isPending ? 'Đang lưu…' : `Lưu ${total} vị trí và tiếp tục`}
        </button>
        <button type="button" onClick={onSkip} className={LINK_BUTTON}>Bỏ qua bước này</button>
      </div>
    </div>
  );
}
