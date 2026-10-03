import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { RequireWorkspace } from '../../components/guards/RequireWorkspace';
import { PLATFORM_PORTAL } from '../../lib/portals';
import { WORKSPACES } from '../../lib/roles';
import { PLATFORM_SIDEBAR } from '../../lib/sidebars/platform';
import { useEnterpriseTheme } from '../../hooks/use-enterprise-theme';

export const PlatformLayout: React.FC = () => {
  useEnterpriseTheme();

  return (
    <AuthGuard>
      <RequireWorkspace workspace={WORKSPACES.PLATFORM}>
        <div data-testid="platform-layout">
          <MainLayout portal={PLATFORM_PORTAL} sidebarConfig={PLATFORM_SIDEBAR} />
        </div>
      </RequireWorkspace>
    </AuthGuard>
  );
};

