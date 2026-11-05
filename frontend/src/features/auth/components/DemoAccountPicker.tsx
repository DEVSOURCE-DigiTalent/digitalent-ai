import { useEffect, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { ROLE_LABELS, type Role } from '../../../lib/roles';
import type { SessionUser } from '../../../types/session';

interface DemoAccountPickerProps {
  onPick: (email: string, password: string) => void;
  enterpriseOnly?: boolean;
}

interface DemoAccountItem extends SessionUser {
  customPassword?: string;
}

interface DemoAccounts {
  accounts: DemoAccountItem[];
  password: string;
}

const SEEDED_API_ACCOUNTS: DemoAccountItem[] = [
  { id: 'seed-mentor', email: 'mentor@digitalent.ai', fullName: 'Mentor Thẩm định (mentor)', roles: ['MENTOR'], permissions: [], workspace: 'platform', customPassword: 'Admin@1234' },
  { id: 'seed-admin', email: 'admin@digitalent.ai', fullName: 'Quản trị viên Nền tảng (admin)', roles: ['PLATFORM_ADMIN'], permissions: [], workspace: 'platform', customPassword: 'Admin@1234' },
  { id: 'seed-owner', email: 'owner@digitalent.ai', fullName: 'Chủ Doanh nghiệp (owner)', roles: ['OWNER'], permissions: [], workspace: 'enterprise', customPassword: 'Admin@1234' },
  { id: 'seed-manager', email: 'manager@digitalent.ai', fullName: 'Trưởng bộ phận (manager)', roles: ['MANAGER'], permissions: [], workspace: 'enterprise', customPassword: 'Admin@1234' },
  { id: 'seed-employee', email: 'employee@digitalent.ai', fullName: 'Nhân viên (employee)', roles: ['EMPLOYEE'], permissions: [], workspace: 'enterprise', customPassword: 'Admin@1234' },
  { id: 'seed-personal', email: 'personal@digitalent.ai', fullName: 'Bùi Thị Cá Nhân', roles: ['LEARNER'], permissions: [], workspace: 'personal', customPassword: 'Admin@1234' },
  { id: 'seed-trial', email: 'trial@digitalent.ai', fullName: 'Lý Văn Dùng Thử', roles: ['LEARNER'], permissions: [], workspace: 'personal', customPassword: 'Admin@1234' },
];

function describeAccount(account: SessionUser): string {
  if (account.workspace === 'personal') {
    if (account.subscription?.status === 'trialing') return 'Cá nhân · dùng thử';
    if (account.subscription?.planCode === 'IND_FREE') return 'Cá nhân · Miễn phí';
    return 'Cá nhân';
  }
  return account.roles.map((role) => ROLE_LABELS[role as Role] ?? role).join(', ');
}

/**
 * Lists development accounts so each role can be tried quickly. The real API list is visible only
 * when VITE_SHOW_DEMO_ACCOUNTS=true in a development build.
 * Folded into an accessible collapsible details panel so it doesn't take form space.
 */
export function DemoAccountPicker({ onPick, enterpriseOnly = false }: DemoAccountPickerProps) {
  const [demo, setDemo] = useState<DemoAccounts | null>(null);

  useEffect(() => {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      import('../../../services/mock/mock-accounts').then((module) =>
        setDemo({ accounts: module.MOCK_ACCOUNTS, password: module.MOCK_PASSWORD }),
      );
      return;
    }
    if (import.meta.env.DEV && import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === 'true') {
      setDemo({ accounts: SEEDED_API_ACCOUNTS, password: 'Admin@1234' });
    }
  }, []);

  if (!demo) return null;

  return (
    <details className="group mt-4 cramped:mt-3 rounded-xl border border-amber-400/20 bg-black/30 text-xs transition-colors">
      <summary className="flex cursor-pointer items-center justify-between px-3.5 py-2.5 font-medium text-cream/70 hover:text-cream select-none outline-none focus-visible:ring-1 focus-visible:ring-cream/50 rounded-xl">
        <span className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-cream-soft/80" />
          <span>Tài khoản demo · bấm để điền nhanh</span>
        </span>
        <ChevronDown className="size-3.5 text-cream/40 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="border-t border-amber-400/15 p-3 pt-2">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-cream/45">
          Mật khẩu chung cho tất cả tài khoản: <code className="text-cream/90 font-mono">Admin@1234</code>
        </p>
        <ul className="grid gap-1 max-h-48 overflow-y-auto pr-1">
          {demo.accounts.filter(account => !enterpriseOnly || account.workspace !== 'personal').map((account) => {
            const pwd = account.customPassword || demo.password;
            return (
              <li key={account.id}>
                <button
                  type="button"
                  onClick={() => onPick(account.email, pwd)}
                  className="flex w-full items-baseline justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-cream/80 hover:bg-cream/10 transition-colors cursor-pointer"
                >
                  <span className="truncate font-mono">{account.email}</span>
                  <span className="shrink-0 text-[11px] text-cream/45">{describeAccount(account)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}
