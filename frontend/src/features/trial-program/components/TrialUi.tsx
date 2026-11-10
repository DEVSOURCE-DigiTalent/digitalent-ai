import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Check, Cpu, Database, MessageSquare, Palette, Shield, Sparkles } from 'lucide-react';
import type { TrialParticipantStatus, TrialStage } from '@/services/trial-program.service';
import { LEVEL_LABELS, STAGE } from '../lib/trial-format';

export const DOMAIN_THEMES = [
  {
    number: 1,
    name: 'Khai thác dữ liệu và thông tin',
    shortName: '1. Dữ liệu & TT',
    tableHeader: '1. Dữ liệu',
    icon: Database,
    color: '#0284c7', // Sky-600
    glowColor: 'rgba(2, 132, 199, 0.45)',
    bgClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
    lightBg: 'bg-sky-50',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-200',
  },
  {
    number: 2,
    name: 'Giao tiếp và hợp tác trong môi trường số',
    shortName: '2. Giao tiếp & HT',
    tableHeader: '2. Giao tiếp',
    icon: MessageSquare,
    color: '#0d9488', // Teal-600
    glowColor: 'rgba(13, 148, 136, 0.45)',
    bgClass: 'bg-teal-50 text-teal-700 border-teal-200/80',
    lightBg: 'bg-teal-50',
    textClass: 'text-teal-700',
    borderClass: 'border-teal-200',
  },
  {
    number: 3,
    name: 'Sáng tạo nội dung số',
    shortName: '3. Sáng tạo số',
    tableHeader: '3. Sáng tạo',
    icon: Palette,
    color: '#7c3aed', // Purple-600
    glowColor: 'rgba(124, 58, 237, 0.45)',
    bgClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
    lightBg: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
  },
  {
    number: 4,
    name: 'An toàn',
    shortName: '4. An toàn số',
    tableHeader: '4. An toàn',
    icon: Shield,
    color: '#059669', // Emerald-600
    glowColor: 'rgba(5, 150, 105, 0.45)',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    lightBg: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
  },
  {
    number: 5,
    name: 'Giải quyết vấn đề',
    shortName: '5. Giải quyết VĐ',
    tableHeader: '5. Giải quyết VĐ',
    icon: Cpu,
    color: '#d97706', // Amber-600
    glowColor: 'rgba(217, 119, 6, 0.45)',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    lightBg: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
  },
  {
    number: 6,
    name: 'Ứng dụng trí tuệ nhân tạo',
    shortName: '6. Trí tuệ AI',
    tableHeader: '6. Trí tuệ AI',
    icon: Sparkles,
    color: '#4f46e5', // Indigo-600
    glowColor: 'rgba(79, 70, 229, 0.45)',
    bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    lightBg: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-200',
  },
];

export function LevelBadge({ level, size = 'default' }: { level: number; size?: 'default' | 'sm' }) {
  useUiLanguage();
  const value = Math.max(0, Math.min(3, Math.round(level)));
  const styles = [
    'bg-slate-100/90 text-slate-600 border-slate-200/90 font-medium', // 0: Chưa đạt
    'bg-sky-50 text-sky-700 border-sky-200/90 font-bold', // 1: Cơ bản
    'bg-indigo-50 text-indigo-700 border-indigo-200/90 font-bold', // 2: Trung cấp
    'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-bold', // 3: Nâng cao
  ];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] min-w-[64px]' : 'px-2.5 py-1 text-xs min-w-[76px]';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border shadow-2xs transition-all ${sizeClasses} ${styles[value]}`}
    >
      {translateUi(LEVEL_LABELS[value])}
    </span>
  );
}

const PARTICIPANT: Record<TrialParticipantStatus, { label: string; tone: string }> = {
  INVITED: { label: 'Đã mời', tone: '' },
  INVITE_EXPIRED: { label: 'Lời mời hết hạn', tone: 'bad' },
  ACTIVE: { label: 'Chưa nộp', tone: 'warn' },
  SUBMITTED: { label: 'Đã nộp', tone: 'ok' },
};

export function ParticipantStatus({ status }: { status: TrialParticipantStatus }) {
  useUiLanguage();
  const s = PARTICIPANT[status];
  return <span className={`tp-badge ${s.tone}`}>{translateUi(s.label)}</span>;
}

export function StageBadge({ stage }: { stage: TrialStage }) {
  useUiLanguage();
  return <span className={`tp-badge ${STAGE[stage].tone}`}>{translateUi(STAGE[stage].label)}</span>;
}

/** Thanh bước: index = bước hiện tại (0-based); các bước trước đã xong. */
export function Steps({ steps, current, label = 'Các bước dùng thử' }: { steps: string[]; current: number; label?: string }) {
  useUiLanguage();
  return (
    <nav aria-label={translateUi(label)} className="w-full">
      <ol className="flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
        {steps.map((step, index) => {
          const isDone = index < current;
          const isCurrent = index === current;
          return (
            <li
              key={step}
              aria-current={isCurrent ? 'step' : undefined}
              data-state={isCurrent ? 'current' : isDone ? 'done' : 'upcoming'}
              className={`flex-1 flex items-center justify-center sm:justify-start gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs transition-all ${
                isDone
                  ? 'bg-emerald-50/80 text-emerald-800 font-semibold border border-emerald-200/60'
                  : isCurrent
                  ? 'bg-[#137b84]/10 text-[#0e5968] font-bold border border-[#137b84]/30 shadow-2xs'
                  : 'bg-transparent text-slate-400 font-medium'
              }`}
            >
              <span
                className={`grid size-5 place-items-center rounded-full text-[10px] font-bold shrink-0 transition-colors ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-[#137b84] text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? <Check size={11} strokeWidth={3} /> : index + 1}
              </span>
              <span className="hidden sm:inline truncate">{step}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function LevelLegend() {
  useUiLanguage();
  const dots = [
    { bg: 'bg-slate-300' },
    { bg: 'bg-sky-400' },
    { bg: 'bg-blue-600' },
    { bg: 'bg-indigo-700' },
  ];
  return (
    <div
      className="inline-flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs"
      aria-hidden
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5">{translateUi("Cấp độ:")}</span>
      {LEVEL_LABELS.map((label, level) => (
        <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <span className={`size-2 rounded-full ${dots[level]?.bg ?? 'bg-slate-300'} ring-2 ring-white shadow-2xs`} />
          <span className="text-[11px]">{translateUi(label)}</span>
        </span>
      ))}
    </div>
  );
}
