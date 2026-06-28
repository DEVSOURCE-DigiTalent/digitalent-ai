import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, Settings, UserCircle } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { APP_NAME } from '@/lib/constants';
import apiClient from '@/services/api-client';

/**
 * Top bar with breadcrumb, global search, notifications, and profile dropdown.
 */
export function Topbar() {
  const navigate = useNavigate();
  const user = useCurrentUser((s) => s.user);
  const clearUser = useCurrentUser((s) => s.clearUser);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Proceed with local cleanup even if server call fails
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    clearUser();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="text-slate-400">{APP_NAME}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Global search */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          title="Search (Ctrl+K)"
        >
          <Search className="w-4.5 h-4.5" />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          title="Notifications"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500" />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100"
          >
            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm text-slate-700 font-medium hidden sm:inline">
              {user?.fullName || 'User'}
            </span>
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-1">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => { navigate('/my-profile'); setShowProfileMenu(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <UserCircle className="w-4 h-4" />
                  My Profile
                </button>
                <button
                  onClick={() => { navigate('/admin/settings'); setShowProfileMenu(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
