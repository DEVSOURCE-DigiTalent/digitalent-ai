import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Building2 } from 'lucide-react';
import { useCompleteSetup } from '@/hooks/use-onboarding';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefreshSession } from '@/hooks/use-refresh-session';
import { getHomePath } from '@/lib/navigation';
import type { OrganizationSetup } from '@/types/commerce';
import { PRIMARY_BUTTON, SECONDARY_BUTTON, errorMessage } from './styles';

interface ChecklistItem {
  label: string;
  detail: string;
  done: boolean;
}

function checklistFor(setup: OrganizationSetup): ChecklistItem[] {
  return [
    {
      label: 'Thông tin tổ chức',
      detail: setup.organization?.name
        ? `${setup.organization.name} (${setup.organization.timezone || 'Asia/Ho_Chi_Minh'})`
        : 'Chưa tạo',
      done: Boolean(setup.organization),
    },
    {
      label: 'Phòng ban',
      detail: setup.departments.length
        ? `${setup.departments.length} phòng ban`
        : 'Chưa có, thêm sau trong mục Phòng ban',
      done: setup.departments.length > 0,
    },
    {
      label: 'Vị trí công việc',
      detail: setup.positions.length
        ? `${setup.positions.length} vị trí công việc đã thiết lập`
        : 'Chưa chọn, thêm sau trong mục Vị trí',
      done: setup.positions.length > 0,
    },
  ];
}

/** AUTH-05 / ENT-ONB-09: readiness checklist. Skipped steps stay on it as things to do later. */
export function CompletionStep({ setup, onBack }: { setup: OrganizationSetup; onBack: () => void }) {
  const navigate = useNavigate();
  const complete = useCompleteSetup();
  const refreshSession = useRefreshSession();
  const [error, setError] = useState<string>();
  const items = checklistFor(setup);

  const finish = async () => {
    setError(undefined);
    try {
      await complete.mutateAsync(undefined);
      await refreshSession();
      const user = useCurrentUser.getState().user;
      navigate(user ? getHomePath(user) : '/', { replace: true });
    } catch (failure) {
      setError(errorMessage(failure));
    }
  };

  return (
    <div className="grid max-w-xl gap-6">
      {/* Org identity snippet */}
      {setup.organization && (
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50">
            {setup.organization.logoUrl ? (
              <img
                src={setup.organization.logoUrl}
                alt="Logo"
                className="size-full object-contain p-1"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Building2 className="size-6 text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{setup.organization.name}</p>
            <p className="text-xs text-slate-500">
              {setup.organization.industry} · {setup.organization.size} · Múi giờ {setup.organization.timezone || 'Asia/Ho_Chi_Minh'}
            </p>
          </div>
        </div>
      )}

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-xs">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-3 px-4 py-3.5">
            {item.done ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-label="Đã xong" />
            ) : (
              <Circle className="mt-0.5 size-5 shrink-0 text-slate-300" aria-label="Chưa làm" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-primary-200 bg-primary-50/70 p-4 text-xs leading-relaxed text-primary-950">
        <p className="font-semibold text-primary-900 text-sm">Việc tiếp theo sau khi khởi tạo</p>
        <p className="mt-1">
          Thiết lập <strong>Bộ yêu cầu năng lực</strong> cho từng vị trí công việc theo chuẩn Thông tư 02/2025/TT-BKHCN
          để hệ thống tự động đo lường khoảng trống năng lực (Skill Gap) và gợi ý lộ trình đào tạo phù hợp cho nhân viên.
        </p>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button type="button" onClick={onBack} className={SECONDARY_BUTTON}>Quay lại</button>
        <button
          type="button"
          onClick={finish}
          disabled={complete.isPending || !setup.organization}
          className={PRIMARY_BUTTON}
        >
          {complete.isPending ? 'Đang hoàn tất…' : 'Vào hệ thống'}
        </button>
      </div>
    </div>
  );
}
