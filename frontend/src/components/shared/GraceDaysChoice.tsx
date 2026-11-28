import { useId } from 'react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { DEFAULT_GRACE_DAYS, GRACE_DAY_CHOICES, switchDay, type GraceDays } from '@/lib/grace-days';

interface GraceDaysChoiceProps {
  value: GraceDays;
  onChange: (days: GraceDays) => void;
  disabled?: boolean;
  /** Major change: whoever has not finished starts again; minor: they go on with the new content, progress kept. */
  major?: boolean;
}

/** The choice in the "apply new content" dialogs (course updates, R&D apply / remove). */
export function GraceDaysChoice({ value, onChange, disabled, major = false }: GraceDaysChoiceProps) {
  useUiLanguage();
  const name = useId();
  return (
    <fieldset className="mt-4 space-y-2" disabled={disabled}>
      <legend className="mb-2 text-sm font-semibold text-ent-fg">{translateUi('Người đang học có bao lâu để học xong bản cũ?')}</legend>
      {GRACE_DAY_CHOICES.map((days) => (
        <label
          key={days}
          className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
            value === days ? 'border-ent-accent bg-ent-accent-soft' : 'border-ent-line'
          }`}
        >
          <input type="radio" name={name} value={days} checked={value === days} onChange={() => onChange(days)} className="mt-1" />
          <span>
            <span className="font-medium text-ent-fg">
              {days === 0 ? translateUi('Áp dụng ngay') : translateUi(`${days} ngày`)}
              {days === DEFAULT_GRACE_DAYS && <span className="font-normal text-ent-fg-2">{translateUi(' (mặc định)')}</span>}
            </span>
            <span className="block text-xs text-ent-fg-2">
              {days === 0
                ? major
                  ? translateUi('Người đang học học lại từ đầu bản mới ngay.')
                  : translateUi('Người đang học chuyển ngay sang bản mới, giữ nguyên tiến trình.')
                : major
                  ? translateUi(`Đổi vào ${switchDay(days)}. Học xong trước hạn thì giữ kết quả, sau hạn học lại từ đầu.`)
                  : translateUi(`Đổi vào ${switchDay(days)}. Học xong trước hạn thì giữ kết quả, chưa xong thì học tiếp trên bản mới, giữ tiến trình.`)}
            </span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
