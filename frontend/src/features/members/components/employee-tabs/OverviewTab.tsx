import React from 'react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { auditActionLabel, rolesLabel, SYSTEM_ACTOR } from '../../member-labels';
import type { MemberDetail } from '@/services/member.service';

interface OverviewTabProps {
  member: MemberDetail;
  readOnly?: boolean;
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value ?? '—'}</dd>
    </div>
  );
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ member }) => {
  return (
    <div className="space-y-6">
      <dl className="grid gap-x-8 gap-y-4 rounded-lg border border-slate-200 bg-white p-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Mã nhân viên" value={member.employeeCode} />
        <Field label="Họ và tên" value={member.fullName} />
        <Field label="Email" value={member.email} />
        <Field label="Vai trò" value={rolesLabel(member.roles)} />
        <Field label="Phòng ban" value={member.departmentName} />
        <Field
          label="Vị trí công việc"
          value={member.positionName || '—'}
        />
        <Field label="Quản lý trực tiếp" value={member.directManagerName} />
        <Field
          label={member.kind === 'invitation' ? 'Ngày mời' : 'Ngày tham gia'}
          value={formatDate(member.kind === 'invitation' ? member.invitedAt : member.joinedAt)}
        />
        <Field
          label="Hoạt động gần nhất"
          value={member.lastActiveAt ? formatDateTime(member.lastActiveAt) : 'Chưa có'}
        />
      </dl>

      {member.history && member.history.length > 0 && (
        <section aria-labelledby="history-heading" className="space-y-3">
          <h3 id="history-heading" className="text-sm font-semibold text-slate-900">
            Lịch sử hoạt động & thay đổi ({member.history.length})
          </h3>
          <ol className="grid gap-2 sm:grid-cols-2">
            {member.history.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
                <p className="font-medium text-slate-900">{auditActionLabel(entry.action)}</p>
                <p className="text-xs text-slate-600 mt-0.5">{entry.detail ?? entry.targetLabel}</p>
                <p className="mt-1.5 text-2xs text-slate-400">
                  {entry.actorName ?? SYSTEM_ACTOR} · {formatDateTime(entry.at)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
};
