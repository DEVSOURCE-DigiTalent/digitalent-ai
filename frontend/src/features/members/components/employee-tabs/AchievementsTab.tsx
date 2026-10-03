import React from 'react';
import { Award } from 'lucide-react';
import { EmptyState } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import type { CertificateRecord } from '@/services/mock/server/types-work';

interface AchievementsTabProps {
  certificates?: CertificateRecord[];
  readOnly?: boolean;
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({ certificates = [] }) => {
  if (certificates.length === 0) {
    return (
      <EmptyState
        title="Chưa có chứng chỉ hay thành tựu nào"
        description="Khi hoàn thành các khóa đào tạo hoặc đạt chuẩn năng lực, chứng chỉ số sẽ được cấp và lưu trữ tại đây."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Chứng chỉ đã cấp ({certificates.length})
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="flex items-start gap-3.5 rounded-lg border border-slate-200 bg-linear-to-r from-white to-slate-50 p-4 shadow-2xs"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-600">
              <Award className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{cert.courseTitle}</p>
              <p className="text-xs font-mono text-slate-500 mt-0.5">Số hiệu: {cert.certificateCode}</p>
              <div className="mt-2 text-2xs text-slate-400">
                <span>Cấp ngày: {formatDate(cert.issueDate)}</span>
                {cert.expiryDate && <span> · Hạn: {formatDate(cert.expiryDate)}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
