import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { MemberHistoryEntry } from '@/services/member.service';
import { formatDate } from '@/lib/utils';
import { auditActionLabel } from '@/features/members/member-labels';

interface OwnerTrainingCycleProps {
  events: MemberHistoryEntry[];
}

export function OwnerTrainingCycle({ events }: OwnerTrainingCycleProps) {
  useUiLanguage();
  const recent = events.slice(0, 3);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-5 shadow-xs hover:shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-[#17243f] pb-3 border-b border-slate-100">{translateUi("Hoạt động Gần đây")}</h3>

        {recent.length > 0 ? (
          <div className="mt-3.5 space-y-2.5">
            {recent.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50/60 hover:bg-slate-50 border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-[#17243f] block truncate">
                      {auditActionLabel(event.action)}
                    </span>
                    <span className="text-[11px] text-[#64748b] block truncate">
                      {event.targetLabel}
                    </span>
                  </div>
                </div>
                <time className="text-[11px] text-[#94a3b8] font-medium tabular-nums shrink-0">
                  {formatDate(event.at)}
                </time>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#94a3b8]">{translateUi("Chưa có hoạt động mới")}</div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <Link
          to="/enterprise/reports"
          className="text-xs font-bold text-[#137b84] hover:text-[#0e5968] inline-flex items-center gap-1 transition-colors"
        >{translateUi("Xem tất cả")}<ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
