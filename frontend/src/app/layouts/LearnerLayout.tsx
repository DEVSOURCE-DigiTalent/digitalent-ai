import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const LearnerLayout: React.FC = () => {
  return (
    <div className="learner-layout min-h-screen flex flex-col bg-slate-50">
      <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/learn" className="text-xl font-bold text-blue-700">DigiTalent AI</Link>
          <div className="hidden sm:block text-sm text-gray-500">
            <span>/</span> <span className="ml-2">Learning Area</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              className="border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2"
            />
          </div>
          <Link to="/learn/my-learning" className="text-sm font-medium text-gray-700">My Learning</Link>
          <Link to="/login" className="text-sm text-blue-600">Sign In</Link>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full">
        <Outlet />
      </div>
    </div>
  );
};
