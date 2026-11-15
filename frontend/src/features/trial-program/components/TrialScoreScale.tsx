import { translateUi } from '@/lib/i18n';
import { LEVEL_LABELS, LEVEL_SHARE_PERCENTS } from '../lib/trial-format';

export function TrialScoreScale() {
  const [basic, intermediate, advanced] = LEVEL_SHARE_PERCENTS;
  const ranges = [`< ${basic}%`, `${basic}–<${intermediate}%`, `${intermediate}–<${advanced}%`, `≥ ${advanced}%`];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <p className="font-semibold">{translateUi('Mức gợi ý theo tỷ lệ đúng của từng lĩnh vực')}</p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {LEVEL_LABELS.map((label, level) => (
          <li key={label}>{translateUi(label)} <strong className="ml-1 tabular-nums">{ranges[level]}</strong></li>
        ))}
      </ul>
    </div>
  );
}
