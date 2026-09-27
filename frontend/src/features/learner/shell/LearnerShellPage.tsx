import React from 'react';
import { Outlet } from 'react-router-dom';

export const LearnerShellPage: React.FC = () => {
  return (
    <div className="learner-shell p-6 max-w-6xl mx-auto">
      <Outlet />
    </div>
  );
};
