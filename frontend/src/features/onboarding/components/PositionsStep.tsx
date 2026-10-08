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

/**
 * AUTH-05 / ENT-ONB-07: Vị trí công việc tổ chức sử dụng.
 * Cho phép chọn vị trí tham chiếu hoặc thêm vị trí riêng,
 * và gắn Phòng ban tương ứng.
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
  const [draftDept, setDraftDept] = useState('');

  // Lưu cấu hình phòng ban cho từng code vị trí
  const [details, setDetails] = useState<Record<string, { departmentName?: string }>>(() => {
    const map: Record<string, { departmentName?: string }> = {};
    for (const p of setup.positions) {
      map[p.code] = { departmentName: p.departmentName };
    }
    return map;
  });

  const [error, setError] = useState<string>();

  const departments = setup.departments.map((d) => d.name);

  const toggle = (code: string) => {
    if (codes.includes(code)) {
      setCodes(codes.filter((c) => c !== code));
    } else {
      setCodes([...codes, code]);
    }
  };

  const updateDepartment = (code: string, departmentName: string) => {
    setDetails((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        departmentName: departmentName || undefined,
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
      [customCode]: { departmentName: draftDept || undefined },
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
        <legend className="mb-2 text-sm font-medium text-ent-fg">
          Vị trí tham chiếu chuẩn theo Khung chuẩn năng lực số
        </legend>
        <ul className="grid gap-3 sm:grid-cols-2">
          {REFERENCE_POSITIONS.map((position) => {
            const isChecked = codes.includes(position.code);
            const currentDept = details[position.code]?.departmentName || '';

            return (
              <li
                key={position.code}
                className={`rounded-xl border p-3.5 text-sm transition-all ${
                  isChecked
                    ? 'border-amber-400/40 bg-amber-500/10 shadow-sm ring-1 ring-amber-400/20'
                    : 'border-ent-line bg-ent-card hover:bg-ent-raised'
                }`}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(position.code)}
                    className="mt-0.5 size-4 accent-[#E5A93C]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ent-fg">{position.name}</span>
                    <span className="block text-xs text-ent-fg-3 line-clamp-2">{position.description}</span>
                  </span>
                </label>

                {isChecked && (
                  <div className="mt-3 border-t border-amber-400/20 pt-2.5">
                    <div>
                      <label className="text-[11px] font-medium text-[#F5CA65]">Phòng ban trực thuộc</label>
                      <select
                        value={currentDept}
                        onChange={(e) => updateDepartment(position.code, e.target.value)}
                        className="mt-1 h-8 w-full rounded-lg border border-amber-400/20 bg-ent-card px-2 text-xs text-ent-fg focus:outline-none focus:ring-1 focus:ring-[#E5A93C]"
                      >
                        <option value="" className="bg-[#11151E] text-cream">Chưa gán phòng ban</option>
                        {departments.map((d) => (
                          <option key={d} value={d} className="bg-[#11151E] text-cream">
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
        className="rounded-xl border border-ent-line bg-ent-card p-4 shadow-md ring-1 ring-amber-400/10"
      >
        <p className="mb-2 text-sm font-medium text-ent-fg flex items-center gap-1.5">
          <Layers className="size-4 text-[#F5CA65]" />
          Thêm vị trí riêng của tổ chức
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="custom-position" className="text-xs text-ent-fg-2 block mb-1">
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
            <label htmlFor="custom-dept" className="text-xs text-ent-fg-2 block mb-1">
              Phòng ban
            </label>
            <select
              id="custom-dept"
              value={draftDept}
              onChange={(e) => setDraftDept(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="" className="bg-[#11151E] text-cream">Chưa gán phòng ban</option>
              {departments.map((d) => (
                <option key={d} value={d} className="bg-[#11151E] text-cream">
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
            const dept = details[customCode]?.departmentName;

            return (
              <li
                key={name}
                className="inline-flex items-center gap-2 rounded-lg bg-ent-raised border border-amber-400/20 py-1.5 pl-3 pr-2 text-xs font-medium text-ent-fg"
              >
                <span>{name}</span>
                {dept && <span className="text-[11px] text-[#F5CA65] font-normal">({dept})</span>}
                <button
                  type="button"
                  onClick={() => setCustom(custom.filter((n) => n !== name))}
                  aria-label={`Xóa ${name}`}
                  className="grid size-5 place-items-center rounded-full hover:bg-amber-400/20 text-ent-fg-3 hover:text-ent-fg"
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
