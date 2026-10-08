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
      label: 'Cấp bậc (G1–G3)',
      detail: setup.grades?.length ? `${setup.grades.length} cấp bậc chuẩn hóa` : '3 cấp bậc (G1–G3)',
      done: true,
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
        ? `${setup.positions.length} vị trí đã cấu hình Cấp bậc`
        : 'Chưa chọn, thêm sau trong mục Vị trí',
      done: setup.positions.length > 0,
    },
    {
      label: 'Nhân viên & Phân quyền',
      detail: setup.invitations.length
        ? `Đã mời ${setup.invitations.length} người`
        : 'Chưa mời, thêm sau trong mục Thành viên',
      done: setup.invitations.length > 0,
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
        <div className="flex items-center gap-3.5 rounded-xl border border-ent-line bg-ent-card p-4 shadow-md ring-1 ring-amber-400/10">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-ent-line bg-ent-raised text-ent-fg-3">
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
              <Building2 className="size-6 text-[#F5CA65]" />
            )}
          </div>
          <div>
            <p className="font-semibold text-ent-fg">{setup.organization.name}</p>
            <p className="text-xs text-ent-fg-3">
              {setup.organization.industry} · {setup.organization.size} · Múi giờ {setup.organization.timezone || 'Asia/Ho_Chi_Minh'}
            </p>
          </div>
        </div>
      )}

      <ul className="divide-y divide-ent-line rounded-xl border border-ent-line bg-ent-card shadow-md ring-1 ring-amber-400/10">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-3 px-4 py-3.5">
            {item.done ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" aria-label="Đã xong" />
            ) : (
              <Circle className="mt-0.5 size-5 shrink-0 text-ent-fg-3/40" aria-label="Chưa làm" />
            )}
            <div>
              <p className="text-sm font-medium text-ent-fg">{item.label}</p>
              <p className="text-xs text-ent-fg-3">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-ent-fg ring-1 ring-amber-400/20">
        <p className="font-semibold text-[#F5CA65] text-sm">Việc tiếp theo sau khi khởi tạo</p>
        <p className="mt-1 text-ent-fg-2">
          Thiết lập <strong>Bộ yêu cầu năng lực</strong> cho từng vị trí công việc theo Khung chuẩn năng lực số
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
