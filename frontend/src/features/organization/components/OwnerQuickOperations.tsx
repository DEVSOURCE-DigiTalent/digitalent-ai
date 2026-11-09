import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  UserPlus,
} from 'lucide-react';

export function OwnerQuickOperations() {
  useUiLanguage();
  const operations = [
    {
      title: 'Đánh giá đội ngũ',
      to: '/enterprise/trial',
      icon: ClipboardCheck,
      color: 'bg-gradient-to-br from-teal-50 to-emerald-100/80 text-[#137b84] border-teal-200/70',
      hoverBorder: 'group-hover:border-teal-300',
    },
    {
      title: 'Mời nhân sự',
      to: '/enterprise/members',
      icon: UserPlus,
      color: 'bg-gradient-to-br from-sky-50 to-blue-100/80 text-[#0284c7] border-sky-200/70',
      hoverBorder: 'group-hover:border-sky-300',
    },
    {
      title: 'Khoảng cách năng lực',
      to: '/enterprise/skill-gap',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-indigo-50 to-purple-100/80 text-[#6366f1] border-indigo-200/70',
      hoverBorder: 'group-hover:border-indigo-300',
    },
    {
      title: 'Khóa học đào tạo',
      to: '/enterprise/courses',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-amber-50 to-orange-100/80 text-[#d97706] border-amber-200/70',
      hoverBorder: 'group-hover:border-amber-300',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-5 shadow-xs hover:shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-[#17243f] pb-3 border-b border-slate-100">{translateUi("Thao tác Nhanh")}</h3>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {operations.map((op) => {
            const Icon = op.icon;
            return (
              <Link
                key={op.title}
                to={op.to}
                className={`p-3 rounded-xl border border-slate-200/70 bg-slate-50/60 hover:bg-white transition-all flex flex-col items-center text-center gap-2 group hover:-translate-y-0.5 hover:shadow-xs ${op.hoverBorder}`}
              >
                <div className={`size-9 rounded-xl flex items-center justify-center border shadow-2xs group-hover:scale-105 transition-transform ${op.color}`}>
                  <Icon className="size-4" />
                </div>
                <span className="text-xs font-semibold text-[#17243f] group-hover:text-[#137b84] transition-colors">
                  {translateUi(op.title)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
