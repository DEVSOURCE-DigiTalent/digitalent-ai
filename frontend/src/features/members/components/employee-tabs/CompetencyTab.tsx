import React from 'react';
import { LevelBadge } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import type { CompetencyLevelRow, EvidenceSource } from '@/services/workforce.service';

interface CompetencyTabProps {
  rows: CompetencyLevelRow[];
  hasRequirement: boolean;
  readOnly?: boolean;
}

const SOURCE_LABELS: Record<EvidenceSource, string> = {
  MIGRATION: 'Đánh giá đầu vào',
  ASSESSMENT: 'Bài đánh giá',
  TASK: 'Nhiệm vụ thực hành',
  MANUAL: 'Quản trị xác nhận',
};

export const CompetencyTab: React.FC<CompetencyTabProps> = ({ rows, hasRequirement }) => {
  const domains = [...new Set(rows.map((r) => r.categoryName))];

  return (
    <div className="space-y-6">
      {!hasRequirement && (
        <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Vị trí này chưa kích hoạt bộ yêu cầu năng lực chuẩn nên chưa thể đối chiếu mức độ đáp ứng.
        </div>
      )}

      {domains.map((domain) => (
        <section key={domain} aria-label={domain} className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <h3 className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800">
            {domain}
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-4 py-2.5 font-medium">Năng lực số</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Trình độ hiện tại</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Trình độ yêu cầu</th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">Nguồn xác nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows
                .filter((r) => r.categoryName === domain)
                .map((row) => (
                  <tr key={row.competencyId} className="hover:bg-slate-50/50">
                    <th scope="row" className="px-4 py-2.5 text-left font-normal text-slate-800">
                      <span className="mr-2 font-mono text-xs text-slate-500">{row.frameworkCode}</span>
                      {row.name}
                    </th>
                    <td className="px-4 py-2.5">
                      <LevelBadge level={row.currentLevel} />
                    </td>
                    <td className="px-4 py-2.5">
                      {row.requiredLevel > 0 ? (
                        <LevelBadge level={row.requiredLevel} />
                      ) : (
                        <span className="text-xs text-slate-400">Không yêu cầu</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-slate-600 sm:table-cell">
                      {row.source ? `${SOURCE_LABELS[row.source]} · ${formatDate(row.confirmedAt)}` : '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
};
