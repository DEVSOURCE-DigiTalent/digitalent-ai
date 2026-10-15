import { useCurrentUser } from '@/hooks/use-current-user';

interface SidebarPulseOrgCardProps {
  isRail?: boolean;
}

export function SidebarPulseOrgCard({ isRail = false }: SidebarPulseOrgCardProps) {
  const user = useCurrentUser((s) => s.user);

  const orgName = user?.organization?.name || 'Tổ chức';
  const planName = user?.subscription?.planName ?? user?.subscription?.planCode ?? '';
  const status = user?.subscription?.status;
  const usedSeats = user?.subscription?.seatsUsed;
  const totalSeats = user?.subscription?.seatLimit;

  const statusLabel =
    status === 'trialing'
      ? 'Dùng thử'
      : status === 'active'
        ? planName || 'Đang hoạt động'
        : status === 'expired'
          ? 'Hết hạn'
          : planName || 'Gói doanh nghiệp';

  if (isRail) {
    return (
      <div className="p-2 shrink-0 flex justify-center" title={orgName}>
        <div className="w-8 h-8 rounded-lg bg-[#e8eeff] flex items-center justify-center text-[#2945c2] font-bold text-sm">
          {orgName.trim().charAt(0).toUpperCase() || 'D'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-3 mt-auto shrink-0">
      <div className="p-3 border border-[#dfe6f6] rounded-xl bg-[#f8faff] text-[11px] text-[#69758d]">
        <b className="block text-[#17243f] mb-1 text-xs">{orgName}</b>
        {statusLabel}
        {totalSeats != null && totalSeats > 0 && (
          <>
            <br />
            {usedSeats ?? 0}/{totalSeats} Suất nhân viên
          </>
        )}
      </div>
    </div>
  );
}
