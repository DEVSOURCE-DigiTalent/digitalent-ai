import { useEffect, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { RequireOnboarded } from '../../components/guards/RequireOnboarded';
import { RequireWorkspace } from '../../components/guards/RequireWorkspace';
import { ROLES, WORKSPACES } from '../../lib/roles';
import { ENTERPRISE_PORTAL } from '../../lib/portals';
import { sidebarFor } from '../../lib/sidebars';
import { MainLayout } from '../../components/layout/MainLayout';
import { useCurrentUser } from '../../hooks/use-current-user';
import { useEnterpriseTheme } from '../../hooks/use-enterprise-theme';
import { PulseHeader } from '../../features/pulse-employee/components/PulseHeader';
import { PulseSidebar } from '../../features/pulse-employee/components/PulseSidebar';
import { PULSE_PATHS, isExamPath } from '../../features/pulse-employee/lib/paths';
import { TrialNotice } from '../../features/pulse-employee/components/TrialLearning';
import { trialGateOf } from '../../features/pulse-employee/lib/trial-gate';
import '../../features/pulse-employee/pulse-trial.css';
import { useIsEnterpriseTrial, useMyTrialAssessment } from '../../hooks/use-trial-program';
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
/**
 * Doanh nghiệp dùng thử: trước khi mentor công bố kết quả, trang học (khóa học, thực hành, kết quả) hiện cảnh báo "làm bài
 * test trước" / "đang chờ mentor chấm" thay cho nội dung; trang Học thử tự hiện cảnh báo trên các khóa đang khóa. Vào cổng
 * (/enterprise/me) thì tới thẳng bài test. Hồ sơ, hoạt động vẫn mở. Sau công bố: học thử các khóa Cơ bản như bình thường.
 */
function TrialGate({ pathname, children }: { pathname: string; children: ReactNode }) {
  const trial = useIsEnterpriseTrial();
  const { data, isLoading } = useMyTrialAssessment(trial);
  if (!trial) return <>{children}</>;
  if (isLoading) return null;
  const gate = trialGateOf(data);
  if (!gate || !data) return <>{children}</>;
  if (pathname === PULSE_PATHS.today) return <Navigate to={PULSE_PATHS.trialTest} replace />;
  const open = [PULSE_PATHS.trialTest, PULSE_PATHS.path, PULSE_PATHS.profile, PULSE_PATHS.activity]
    .some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (open) return <>{children}</>;
  return (
    <div className="pu-gate">
      <TrialNotice state={gate} mine={data} />
    </div>
  );
}

/**
 * Chủ doanh nghiệp tự làm bài / học thử (doanh nghiệp dùng thử): trang Pulse nằm trong khung quản trị — menu bên, thanh trên —
 * để không mất các thao tác quản lý khi chuyển sang bài test và khóa học.
 */
function OwnerLearningShell({ pathname }: { pathname: string }) {
  useEnterpriseTheme({ lightOnly: true });
  const user = useCurrentUser((s) => s.user);
  return (
    <>
      <MainLayout portal={ENTERPRISE_PORTAL} sidebarConfig={sidebarFor(user)}>
        <div className="pu pu-in-shell" data-testid="pulse-employee-layout">
          <TrialGate pathname={pathname}>
            <Outlet />
          </TrialGate>
        </div>
      </MainLayout>
      <AssistantWidget />
    </>
  );
}

export function PulseEmployeeLayout() {
  const { pathname } = useLocation();
  const exam = isExamPath(pathname);
  const trial = useIsEnterpriseTrial();
  const owner = useCurrentUser((s) => Boolean(s.user?.roles.includes(ROLES.OWNER)));
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <AuthGuard>
      <RequireWorkspace workspace={WORKSPACES.ENTERPRISE}>
        <RequireOnboarded>
          {owner && !exam ? (
            <OwnerLearningShell pathname={pathname} />
          ) : (
            <div className={exam ? 'pu pu-exam-mode' : 'pu pu-workspace'} data-testid="pulse-employee-layout">
              {/* 1. Header trên cùng toàn màn hình */}
              {!exam && <PulseHeader />}

              {/* 2. Vùng làm việc: Khung Sidebar dạng thẻ nhỏ gọn + Main content */}
              <div className={exam ? 'pu-exam-container' : 'pu-workspace-content'}>
                {!exam && <PulseSidebar />}
                <main className={exam ? 'pu-exam-main' : 'pu-main-content'} id="main">
                  <TrialGate pathname={pathname}>
                    <Outlet />
                  </TrialGate>
                </main>
              </div>

              {/* Không có trợ lý trong bài làm có giám sát */}
              {!exam && <AssistantWidget />}
              {!exam && !trial && <RoleTutorialContainer forcedRole="EMPLOYEE" />}
            </div>
          )}
        </RequireOnboarded>
      </RequireWorkspace>
    </AuthGuard>
  );
}
