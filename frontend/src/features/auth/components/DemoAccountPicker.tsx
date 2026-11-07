import { useEffect, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { ROLE_LABELS, type Role } from '../../../lib/roles';
import type { SessionUser } from '../../../types/session';

interface DemoAccountPickerProps {
  onPick: (email: string, password: string) => void;
  enterpriseOnly?: boolean;
}

interface DemoAccounts {
  accounts: SessionUser[];
  password: string;
}

const SEEDED_API_ACCOUNTS: SessionUser[] = [
  { id: 'seed-platform', email: 'platform@digitalent.ai', fullName: 'Platform Administrator', roles: ['PLATFORM_ADMIN'], permissions: [], workspace: 'platform' },
  { id: 'seed-owner', email: 'owner@digitalent.ai', fullName: 'Enterprise Owner', roles: ['OWNER'], permissions: [], workspace: 'enterprise' },
  { id: 'seed-manager', email: 'manager@digitalent.ai', fullName: 'Department Manager', roles: ['MANAGER'], permissions: [], workspace: 'enterprise' },
  { id: 'seed-employee', email: 'employee@digitalent.ai', fullName: 'Employee', roles: ['EMPLOYEE'], permissions: [], workspace: 'enterprise' },
  { id: 'seed-personal', email: 'personal@digitalent.ai', fullName: 'Bùi Thị Cá Nhân', roles: ['LEARNER'], permissions: [], workspace: 'personal' },
  { id: 'seed-trial', email: 'trial@digitalent.ai', fullName: 'Lý Văn Dùng Thử', roles: ['LEARNER'], permissions: [], workspace: 'personal' },
  { id: 'seed-free', email: 'free@digitalent.ai', fullName: 'Mai Thị Miễn Phí', roles: ['LEARNER'], permissions: [], workspace: 'personal' },
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
    <details className="pulse-auth-demo-picker">
      <summary className="pulse-auth-demo-summary">
        <span className="pulse-auth-demo-summary-label">
          <Sparkles size={14} className="pulse-auth-demo-sparkle" aria-hidden="true" />
          <span>Tài khoản demo thử nghiệm · Chọn để điền nhanh</span>
        </span>
        <ChevronDown size={14} className="pulse-auth-demo-arrow" aria-hidden="true" />
      </summary>
      <div className="pulse-auth-demo-body">
        <p className="pulse-auth-demo-hint">
          Mật khẩu chung: <code>{demo.password}</code>
        </p>
        <ul className="pulse-auth-demo-list">
          {demo.accounts.filter(account => !enterpriseOnly || account.workspace !== 'personal').map((account) => {
            const role = account.roles[0] as Role | undefined;
            const roleClass = role === 'OWNER' ? 'owner' : role === 'MANAGER' ? 'manager' : 'employee';
            return (
              <li key={account.id}>
                <button
                  type="button"
                  onClick={() => onPick(account.email, demo.password)}
                  className="pulse-auth-demo-item"
                >
                  <span className="pulse-auth-demo-email">{account.email}</span>
                  <span className={`pulse-auth-demo-badge pulse-auth-demo-badge--${roleClass}`}>
                    {describeAccount(account)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}
