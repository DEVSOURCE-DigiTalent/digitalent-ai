import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="landing-page max-w-4xl mx-auto py-12 px-4 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to DigiTalent AI</h1>
      <p className="text-lg mb-8">Choose your path to get started:</p>
      
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        <div className="border p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Dành cho Doanh nghiệp</h2>
          <p className="mb-6">Quản lý đào tạo và phát triển nhân tài cho tổ chức của bạn.</p>
          <Link to="/enterprise" className="bg-blue-600 text-white px-6 py-2 rounded">
            Enterprise Dashboard
          </Link>
        </div>
        
        <div className="border p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Người học theo vị trí</h2>
          <p className="mb-6">Khám phá lộ trình học tập và phát triển sự nghiệp.</p>
          <Link to="/learn" className="bg-green-600 text-white px-6 py-2 rounded">
            Bắt đầu học
          </Link>
        </div>
      </div>
    </div>
  );
};
