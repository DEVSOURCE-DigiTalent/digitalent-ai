import React from 'react';
import { BriefcaseBusiness, CalendarDays, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import { auditActionLabel, rolesLabel, SYSTEM_ACTOR } from '../../member-labels';
import type { MemberDetail } from '@/services/member.service';

interface OverviewTabProps {
  member: MemberDetail;
  readOnly?: boolean;
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="min-w-0 border-b border-slate-100 py-3 last:border-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-[15px] font-semibold text-slate-900">{value || '—'}</dd>
    </div>
  );
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ member }) => {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-white to-teal-50/40 p-5 sm:p-6">
          <div className="mb-2 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-100 text-teal-700"><UserRound size={19} /></span>
            <h2 className="text-lg font-bold text-slate-900">Thông tin tài khoản</h2>
          </div>
          <dl className="grid gap-x-7 sm:grid-cols-2">
            <Field label="Mã nhân viên" value={member.employeeCode} />
            <Field label="Vai trò" value={rolesLabel(member.roles)} />
            <Field label="Email" value={<span className="inline-flex items-center gap-2"><Mail size={15} className="shrink-0 text-teal-700" />{member.email}</span>} />
            <Field label={member.kind === 'invitation' ? 'Ngày mời' : 'Ngày tham gia'} value={formatDate(member.kind === 'invitation' ? member.invitedAt : member.joinedAt)} />
          </dl>
        </section>

        <section className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-white to-sky-50/40 p-5 sm:p-6">
          <div className="mb-2 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-sky-100 text-sky-700"><BriefcaseBusiness size={19} /></span>
            <h2 className="text-lg font-bold text-slate-900">Phòng ban & vị trí</h2>
          </div>
          <dl className="grid gap-x-7 sm:grid-cols-2">
            <Field label="Phòng ban" value={member.departmentName} />
            <Field label="Vị trí công việc" value={member.positionName} />
            <Field label="Quản lý trực tiếp" value={member.directManagerName} />
            <Field label="Hoạt động gần nhất" value={member.lastActiveAt ? formatDateTime(member.lastActiveAt) : 'Chưa có'} />
          </dl>
        </section>
      </div>

      {member.history && member.history.length > 0 && (
        <details className="group rounded-[18px] border border-slate-200 bg-white p-5 open:shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-slate-900 marker:hidden">
            <span className="inline-flex items-center gap-2"><CalendarDays size={17} className="text-teal-700" />Lịch sử thay đổi <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{member.history.length}</span></span>
            <span className="text-xs font-semibold text-teal-700 group-open:hidden">Xem lịch sử</span><span className="hidden text-xs font-semibold text-teal-700 group-open:block">Thu gọn</span>
          </summary>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {member.history.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm">
                <p className="flex items-center gap-2 font-semibold text-slate-900"><ShieldCheck size={15} className="text-teal-700" />{auditActionLabel(entry.action)}</p>
                <p className="text-xs text-slate-600 mt-0.5">{entry.detail ?? entry.targetLabel}</p>
                <p className="mt-1.5 text-xs text-slate-500">
                  {entry.actorName ?? SYSTEM_ACTOR} · {formatDateTime(entry.at)}
                </p>
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
};
