import { Award, BookOpen, ClipboardCheck, FileCheck2, Flag, GraduationCap } from 'lucide-react';
import type { ActivityKind, PersonalActivity } from '@/services/personal-learning.service';
import { formatDateTime, formatRelativeDay } from '../utils/format';

const ICONS: Record<ActivityKind, typeof Flag> = {
  TARGET: Flag,
  DIAGNOSTIC: ClipboardCheck,
  LESSON: BookOpen,
  ASSESSMENT: GraduationCap,
  TASK: FileCheck2,
  CERTIFICATE: Award,
};

/** Recent learning events, newest first, on a thin timeline. */
export function ActivityList({ items }: { items: PersonalActivity[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-pt-fg-3">Chưa có hoạt động nào. Mọi bước học sẽ hiện ở đây.</p>;
  }
  return (
    <ol className="relative grid gap-5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-pt-line">
      {items.map((item) => {
        const Icon = ICONS[item.kind];
        return (
          <li key={item.id} className="relative flex gap-4">
            <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full border border-pt-line bg-pt-card text-pt-fg-2">
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm leading-snug text-pt-fg">{item.title}</p>
              <p className="mt-0.5 truncate text-xs text-pt-fg-3">
                <time dateTime={item.at} title={formatDateTime(item.at)}>{formatRelativeDay(item.at)}</time>
                {item.detail && <> · {item.detail}</>}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
