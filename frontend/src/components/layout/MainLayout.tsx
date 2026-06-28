import { Outlet } from 'react-router-dom';
import { RoleSidebar } from './RoleSidebar';
import { Topbar } from './Topbar';

/**
 * Enterprise layout shell: RoleSidebar + Topbar + Content area.
 * Maps to IA Document section 4.1: Application Shell.
 */
export function MainLayout() {
  return (
    <div className="min-h-screen flex">
      <RoleSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 bg-surface overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
