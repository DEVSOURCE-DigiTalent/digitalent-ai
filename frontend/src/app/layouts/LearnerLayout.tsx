import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { BookOpen, Target, CheckCircle2, TrendingUp, Award, FileText, Home } from 'lucide-react';

export const LearnerLayout: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
      isActive
        ? 'bg-blue-50 text-blue-700 border border-blue-200'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <div data-testid="learner-layout" className="learner-layout min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Learner Top Header */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <Link to="/learn" className="flex items-center gap-2 text-blue-700 font-extrabold text-xl tracking-tight">
            <span>DigiTalent AI</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full tracking-normal uppercase">
              Learner
            </span>
          </Link>

          {/* Surface Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink to="/learn/dashboard" className={navLinkClass}>
              <Home className="w-3.5 h-3.5" />
              Tổng quan
            </NavLink>
            <NavLink to="/learn/target" className={navLinkClass}>
              <Target className="w-3.5 h-3.5" />
              Mục tiêu
            </NavLink>
            <NavLink to="/learn/diagnostic" className={navLinkClass}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đánh giá
            </NavLink>
            <NavLink to="/learn/path" className={navLinkClass}>
              <TrendingUp className="w-3.5 h-3.5" />
              Lộ trình
            </NavLink>
            <NavLink to="/learn/progress" className={navLinkClass}>
              <BookOpen className="w-3.5 h-3.5" />
              Tiến độ
            </NavLink>
            <NavLink to="/learn/tasks" className={navLinkClass}>
              <FileText className="w-3.5 h-3.5" />
              Bài tập
            </NavLink>
            <NavLink to="/learn/certificates" className={navLinkClass}>
              <Award className="w-3.5 h-3.5" />
              Chứng chỉ
            </NavLink>
          </nav>
        </div>

        {/* Right Action / Switch Area */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-slate-800 transition hidden sm:inline"
          >
            Trang chủ DigiTalent
          </Link>
          <span className="text-slate-200 hidden sm:inline">|</span>
          <Link
            to="/login"
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition"
          >
            Cổng Doanh nghiệp / Đăng nhập
          </Link>
        </div>
      </header>

      {/* Main Learner Content Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} DigiTalent AI. Nền tảng Đào tạo và Phát triển Năng lực Số Chuẩn hóa.</p>
      </footer>
    </div>
  );
};
