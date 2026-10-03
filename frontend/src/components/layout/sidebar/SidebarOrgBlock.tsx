import { useCurrentUser } from '@/hooks/use-current-user';

interface SidebarOrgBlockProps {
  isRail?: boolean;
}

export function SidebarOrgBlock({ isRail = false }: SidebarOrgBlockProps) {
  const user = useCurrentUser((s) => s.user);

  const orgName = user?.organization?.name || 'DigiTalent AI Org';
  const planName = user?.subscription?.planName
    ? `Gói ${user.subscription.planName}`
    : user?.subscription?.planCode
    ? `Gói ${user.subscription.planCode}`
    : 'Gói Doanh nghiệp';

  const initial = orgName.trim().charAt(0).toUpperCase() || 'D';

  return (
    <div className="flex flex-col gap-1 p-4 border-b border-ent-line">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-ent-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
          {initial}
        </div>
        {!isRail && (
          <div className="flex-1 min-w-0">
            <div className="text-ent-sidebar-fg font-semibold leading-tight text-sm truncate" title={orgName}>
              {orgName}
            </div>
            <div className="text-[10px] text-ent-sidebar-muted uppercase tracking-wider mt-0.5 truncate">
              {planName}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
