import { Link } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import { PageHeader, StatusBadge } from '@/components/shared';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useUsage } from '@/hooks/use-subscription';
import { ROLES } from '@/lib/roles';

function Meter({ label, used, limit, unit, valueLabel }: { label: string; used: number; limit: number | null; unit: string; valueLabel: string }) {
  const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const warn = limit !== null && percent >= 90;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-slate-700">{label}</h2>
        <p className={`text-sm font-semibold tabular-nums ${warn ? 'text-red-600' : 'text-slate-900'}`}>{valueLabel}</p>
      </div>
      {limit !== null && (
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={used}
          aria-valuetext={`${used} trên ${limit} ${unit}`}
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
        >
          <div className={`h-full rounded-full ${warn ? 'bg-red-500' : 'bg-primary-600'}`} style={{ width: `${percent}%` }} />
        </div>
      )}
      {warn && <p className="mt-2 text-xs text-red-600">Sắp hết {unit}: hãy cân nhắc nâng cấp gói.</p>}
    </div>
  );
}

/** ADM-09: seats, storage and which plan features are on. */
export function UsagePage() {
  const isOwner = useCurrentUser((s) => s.hasRole)(ROLES.OWNER);
  const { data, isLoading, isError } = useUsage();

  if (isLoading) return <p className="text-sm text-slate-500">Đang tải…</p>;
  if (isError || !data) return <p role="alert" className="text-sm text-red-600">Không tải được mức sử dụng.</p>;

  const gb = (mb: number) => `${(mb / 1024).toFixed(1)} GB`;

  return (
    <div>
      <PageHeader title="Quyền sử dụng và mức lưu trữ" subtitle={`Gói ${data.planName}`}>
        {isOwner && <Link to="/enterprise/subscription" className="text-sm font-medium text-primary-700 hover:underline">Quản lý gói</Link>}
      </PageHeader>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Meter label="Quyền sử dụng" used={data.seats.used} limit={data.seats.limit} unit="quyền sử dụng" valueLabel={data.seats.limit === null ? `${data.seats.used}` : `${data.seats.used} / ${data.seats.limit}`} />
        <Meter label="Dung lượng lưu trữ" used={data.storage.usedMb} limit={data.storage.limitMb} unit="dung lượng" valueLabel={`${gb(data.storage.usedMb)} / ${gb(data.storage.limitMb)}`} />
      </div>

      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <StatusBadge label={`${data.members.active} đang hoạt động`} variant="success" />
        <StatusBadge label={`${data.members.pending} chờ kích hoạt`} variant="warning" />
        <StatusBadge label={`${data.members.inactive} đã vô hiệu hóa`} variant="default" />
      </div>

      <section aria-labelledby="features-title" className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 id="features-title" className="mb-3 text-base font-semibold text-slate-900">Tính năng của gói</h2>
        <ul className="divide-y divide-slate-100">
          {data.features.map((feature) => (
            <li key={feature.key} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="text-slate-800">{feature.label}</span>
              {feature.enabled ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700"><Check className="size-4" aria-hidden="true" />Có trong gói</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-slate-500"><Lock className="size-4" aria-hidden="true" />Chưa có trong gói</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
