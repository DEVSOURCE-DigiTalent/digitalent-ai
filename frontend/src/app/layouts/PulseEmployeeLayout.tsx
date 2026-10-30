import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { RequireOnboarded } from '../../components/guards/RequireOnboarded';
import { RequireWorkspace } from '../../components/guards/RequireWorkspace';
import { WORKSPACES } from '../../lib/roles';
import { PulseHeader } from '../../features/pulse-employee/components/PulseHeader';
import { PulseSidebar } from '../../features/pulse-employee/components/PulseSidebar';
import { isExamPath } from '../../features/pulse-employee/lib/paths';
import { AssistantWidget } from '../../features/assistant/components/AssistantWidget';
import { RoleTutorialContainer } from '../../features/onboarding-tutorial';
import '../../features/pulse-employee/pulse.css';
import '../../features/pulse-employee/pulse-roadmap.css';
import '../../features/pulse-employee/pulse-exam.css';

/**
 * Khung Cổng Nhân viên Pulse (PulseEmployeeLayout)
 * - Sidebar bên trái đồng bộ Personal Layout với tính năng Thu Phóng (68px ↔ 240px)
 * - Tự động ẩn hoàn toàn (Zero Distraction Focus Mode) khi làm bài thi Proctored (Pre-assessment & Final).
 */
export function PulseEmployeeLayout() {
  const { pathname } = useLocation();
  const exam = isExamPath(pathname);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <AuthGuard>
      <RequireWorkspace workspace={WORKSPACES.ENTERPRISE}>
        <RequireOnboarded>
          <div className={exam ? 'pu pu-exam-mode' : 'pu pu-workspace'} data-testid="pulse-employee-layout">
            {/* 1. Header trên cùng toàn màn hình */}
            {!exam && <PulseHeader />}

            {/* 2. Vùng làm việc: Khung Sidebar dạng thẻ nhỏ gọn + Main content */}
            <div className={exam ? 'pu-exam-container' : 'pu-workspace-content'}>
              {!exam && <PulseSidebar />}
              <main className={exam ? 'pu-exam-main' : 'pu-main-content'} id="main">
                <Outlet />
              </main>
            </div>

            {/* Không có trợ lý trong bài làm có giám sát */}
            {!exam && <AssistantWidget />}
            {!exam && <RoleTutorialContainer forcedRole="EMPLOYEE" />}
          </div>
        </RequireOnboarded>
      </RequireWorkspace>
    </AuthGuard>
  );
}
