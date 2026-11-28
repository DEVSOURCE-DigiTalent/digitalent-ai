import { useId } from 'react';
import { translateUi, useUiLanguage } from '@/lib/i18n';

interface ChangeSizeChoiceProps {
  /** true = major change: employees who finished the course learn it again for a new certificate. */
  major: boolean;
  onChange: (major: boolean) => void;
  disabled?: boolean;
}

const OPTIONS = [
  {
    major: false,
    title: 'Nhỏ: sửa câu chữ, thêm ví dụ',
    hint: 'Người đã học xong giữ kết quả, không phải học lại.',
  },
  {
    major: true,
    title: 'Lớn: kiến thức cũ đã sai (quy định, quy trình mới)',
    hint: 'Người đã học xong học lại khóa này để lấy chứng nhận mới; chứng nhận cũ vẫn giữ. Khóa khác không ảnh hưởng.',
  },
] as const;

/** The size of the change in the "apply new content" dialogs (course updates, R&D apply / remove). Minor by default. */
export function ChangeSizeChoice({ major, onChange, disabled }: ChangeSizeChoiceProps) {
  useUiLanguage();
  const name = useId();
  return (
    <fieldset className="mt-4 space-y-2" disabled={disabled}>
      <legend className="mb-2 text-sm font-semibold text-ent-fg">{translateUi('Thay đổi này là:')}</legend>
      {OPTIONS.map((option) => (
        <label
          key={String(option.major)}
          className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
            major === option.major ? 'border-ent-accent bg-ent-accent-soft' : 'border-ent-line'
          }`}
        >
          <input type="radio" name={name} checked={major === option.major} onChange={() => onChange(option.major)} className="mt-1" />
          <span>
            <span className="font-medium text-ent-fg">{translateUi(option.title)}</span>
            <span className="block text-xs text-ent-fg-2">{translateUi(option.hint)}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
