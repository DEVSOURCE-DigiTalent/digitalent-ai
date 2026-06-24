import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar placeholder */}
      <aside className="w-64 bg-slate-900 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">DigiTalent AI</h1>
        </div>
        <nav className="mt-4">
          {/* Navigation items will be added as features are built */}
          <p className="px-4 py-2 text-sm text-slate-400">Navigation</p>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-slate-50">
        <header className="bg-white border-b px-6 py-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Dashboard</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">User</span>
            </div>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
