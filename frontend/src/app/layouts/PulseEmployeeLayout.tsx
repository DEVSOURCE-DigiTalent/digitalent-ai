import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { RequireOnboarded } from '../../components/guards/RequireOnboarded';
import { RequireWorkspace } from '../../components/guards/RequireWorkspace';
import { WORKSPACES } from '../../lib/roles';
import { PulseHeader } from '../../features/pulse-employee/components/PulseHeader';
import '../../features/pulse-employee/pulse.css';

/**
 * Khung cổng nhân viên Pulse (docs/ui-redesign/16-pulse-product-flow-detailed.md §3): không có menu bên,
 * thanh đầu trang với Hôm nay / Lộ trình / Thực hành; chi tiết khóa và trang học mở theo ngữ cảnh.
 */
export function PulseEmployeeLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Khối lệnh (không trả về): scrollTo trả về Promise trên trình duyệt mới, React chỉ chấp nhận hàm dọn dẹp.
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <AuthGuard>
      <RequireWorkspace workspace={WORKSPACES.ENTERPRISE}>
        <RequireOnboarded>
          <div className="pu" data-testid="pulse-employee-layout">
            <PulseHeader />
            <main className="pu-main" id="main">
              <Outlet />
            </main>
          </div>
        </RequireOnboarded>
      </RequireWorkspace>
    </AuthGuard>
  );
}
