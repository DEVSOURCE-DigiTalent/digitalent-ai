import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';

export const PublicLayout: React.FC = () => {
  return (
    <div data-testid="public-layout" className="public-layout min-h-screen flex flex-col font-sans">
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-base font-bold text-blue-700">
            <Wordmark className="text-base text-blue-700" />
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Trang chủ</Link>
            <Link to="/careers" className="text-gray-600 hover:text-gray-900">Vị trí nghề nghiệp</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/experience?role=personal" className="text-sm font-medium text-blue-700 hover:underline">
            Xem mẫu cá nhân
          </Link>
          <Link to="/experience?role=enterprise" className="text-sm font-medium text-blue-700 hover:underline">
            Xem mẫu doanh nghiệp
          </Link>
          <Link to="/personal" className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition">
            Vào học
          </Link>
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition">
            Dành cho Doanh nghiệp / Đăng nhập
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white p-6 text-center">
        <div className="max-w-4xl mx-auto">
          <p>&copy; {new Date().getFullYear()} DigiTalent AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
