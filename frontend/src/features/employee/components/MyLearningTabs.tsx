import { Link, useLocation, useInRouterContext } from 'react-router-dom';
import { Route, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

function MyLearningTabsContent() {
  const { pathname } = useLocation();

  const tabs = [
    {
      label: 'Lộ trình của tôi',
      path: '/enterprise/me/learning-path',
      icon: Route,
      isActive: pathname === '/enterprise/me/learning-path',
    },
    {
      label: 'Khóa học của tôi',
      path: '/enterprise/me/courses',
      icon: BookOpen,
      isActive: pathname === '/enterprise/me/courses' || pathname === '/enterprise/me/learning',
    },
  ];

  return (
    <nav aria-label="Phần mục học tập của tôi" className="flex items-center gap-1 border-b border-slate-200">
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

export function MyLearningTabs() {
  const inRouter = useInRouterContext();
  if (!inRouter) return null;
  return <MyLearningTabsContent />;
}
