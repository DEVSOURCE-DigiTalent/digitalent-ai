import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const PublicLayout: React.FC = () => {
  return (
    <div className="public-layout min-h-screen flex flex-col font-sans">
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-6">
          <div className="text-xl font-bold text-blue-700">DigiTalent AI</div>
          <nav className="hidden md:flex gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Trang chủ</Link>
            <Link to="/careers" className="text-gray-600 hover:text-gray-900">Vị trí nghề nghiệp</Link>
            <Link to="/verify" className="text-gray-600 hover:text-gray-900">Tra cứu chứng chỉ</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/learn" className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded">
            Vào học
          </Link>
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded">
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
