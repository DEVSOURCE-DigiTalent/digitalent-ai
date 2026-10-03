import { Link, useLocation, useInRouterContext } from 'react-router-dom';
import { UserCheck, TrendingUp, History } from 'lucide-react';
import { cn } from '@/lib/utils';

function MyCompetencyTabsContent() {
  const { pathname } = useLocation();

  const tabs = [
    {
      label: 'Hồ sơ năng lực',
      path: '/enterprise/me/competency',
      icon: UserCheck,
      isActive: pathname === '/enterprise/me/competency',
    },
    {
      label: 'Khoảng trống năng lực',
      path: '/enterprise/me/skill-gap',
      icon: TrendingUp,
      isActive: pathname === '/enterprise/me/skill-gap',
    },
    {
      label: 'Dòng thời gian minh chứng',
      path: '/enterprise/me/evidence',
      icon: History,
      isActive: pathname === '/enterprise/me/evidence',
    },
  ];

  return (
    <nav aria-label="Phần mục năng lực của tôi" className="flex items-center gap-1 border-b border-slate-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            aria-current={tab.isActive ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab.isActive
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
            )}
          >
            <Icon className="size-4" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MyCompetencyTabs() {
  const inRouter = useInRouterContext();
  if (!inRouter) return null;
  return <MyCompetencyTabsContent />;
}
