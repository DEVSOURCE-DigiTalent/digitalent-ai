import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { RequireOnboarded } from '../../components/guards/RequireOnboarded';
import { RequireWorkspace } from '../../components/guards/RequireWorkspace';
import { WORKSPACES } from '../../lib/roles';
import { PulseHeader } from '../../features/pulse-employee/components/PulseHeader';
import { isExamPath } from '../../features/pulse-employee/lib/paths';
import { AssistantWidget } from '../../features/assistant/components/AssistantWidget';
import '../../features/pulse-employee/pulse.css';
import '../../features/pulse-employee/pulse-roadmap.css';
import '../../features/pulse-employee/pulse-exam.css';

/**
 * Khung cổng nhân viên Pulse (docs/ui-redesign/16-pulse-product-flow-detailed.md §3): không có menu bên,
 * thanh đầu trang với Hôm nay / Lộ trình / Thực hành; chi tiết khóa và trang học mở theo ngữ cảnh. Trang làm bài có giám sát
 * (bài đánh giá trước khi học, bài cuối khóa) không có thanh điều hướng: trang tự hiện thanh ghi hình và nút Thoát.
 */
export function PulseEmployeeLayout() {
  const { pathname } = useLocation();
  const exam = isExamPath(pathname);
  useEffect(() => {
    // Khối lệnh (không trả về): scrollTo trả về Promise trên trình duyệt mới, React chỉ chấp nhận hàm dọn dẹp.
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <AuthGuard>
      <RequireWorkspace workspace={WORKSPACES.ENTERPRISE}>
        <RequireOnboarded>
          <div className={exam ? 'pu pu-exam-mode' : 'pu'} data-testid="pulse-employee-layout">
            {!exam && <PulseHeader />}
            <main className={exam ? 'pu-exam-main' : 'pu-main'} id="main">
              <Outlet />
            </main>
            {/* Không có trợ lý trong bài làm có giám sát. */}
            {!exam && <AssistantWidget />}
          </div>
        </RequireOnboarded>
      </RequireWorkspace>
    </AuthGuard>
  );
}
