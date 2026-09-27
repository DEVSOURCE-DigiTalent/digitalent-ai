import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { AuthGuard } from '../../components/guards/AuthGuard';

export const EnterpriseLayout: React.FC = () => {
  return (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  );
};
