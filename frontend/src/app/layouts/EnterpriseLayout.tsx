import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { AuthGuard } from '../../components/guards/AuthGuard';

export const EnterpriseLayout: React.FC = () => {
  return (
    <AuthGuard>
      <div data-testid="enterprise-layout" className="min-h-screen">
        <MainLayout />
      </div>
    </AuthGuard>
  );
};
