import { useEffect } from 'react';
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
import { PageSkeleton } from '../../features/pulse-employee/components/ui';
import { trialGateOf } from '../../features/pulse-employee/lib/trial-gate';
import '../../features/pulse-employee/pulse-trial.css';
import { useIsEnterpriseTrial, useMyTrialAssessment } from '../../hooks/use-trial-program';
import { usePulseOverview } from '../../hooks/use-pulse';
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
 * Chủ doanh nghiệp tự làm bài / học thử (doanh nghiệp dùng thử): trang Pulse nằm trong khung quản trị — menu bên, thanh trên —
 * để không mất các thao tác quản lý khi chuyển sang bài test và khóa học.
 */
function OwnerLearningShell({ pathname: _pathname }: { pathname: string }) {
  useEnterpriseTheme({ lightOnly: true });
  const user = useCurrentUser((s) => s.user);
  return (
    <>
      <MainLayout portal={ENTERPRISE_PORTAL} sidebarConfig={sidebarFor(user)}>
        <div className="pu pu-in-shell" data-testid="pulse-employee-layout">
          <Outlet />
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
  const { data: myTrial, isLoading: isTrialLoading } = useMyTrialAssessment(trial);
  const gate = trialGateOf(myTrial, undefined, owner);
  const { data: overview } = usePulseOverview(trial && !owner && myTrial?.status === 'REVIEWED');
  const trialLearning = trial && !owner && myTrial?.status === 'REVIEWED' &&
    (!overview?.hasPosition || !overview.hasTargets || Boolean(overview.awaitingFramework));
  const isWaiting = myTrial?.status === 'SUBMITTED' || gate === 'waiting';
  const isGateActive = Boolean(gate && myTrial);
  const shouldFocus = Boolean(exam || isGateActive || (pathname === PULSE_PATHS.trialTest && isWaiting));

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  // Khi đang bị Gate (chưa làm bài hoặc đã nộp đang chờ doanh nghiệp xác nhận kết quả):
  // Nhân viên BẮT BUỘC ở trang trial-test (hoặc phòng thi trial-test/exam).
  // Chặn toàn bộ truy cập vào các trang khác trong /enterprise/me.
  if (isGateActive && !isTrialLoading) {
    const isAllowedGatedPath =
      pathname === PULSE_PATHS.trialTest ||
      pathname === PULSE_PATHS.trialExam ||
      pathname.startsWith(`${PULSE_PATHS.trialExam}/`);

    if (!isAllowedGatedPath) {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      return <Navigate to={`${PULSE_PATHS.trialTest}${search}`} replace />;
    }
  }

  return (
    <AuthGuard>
      <RequireWorkspace workspace={WORKSPACES.ENTERPRISE}>
        <RequireOnboarded>
          {owner && !exam && !shouldFocus ? (
            <OwnerLearningShell pathname={pathname} />
          ) : (
            <div
              className={exam ? 'pu pu-exam-mode' : shouldFocus ? 'pu pu-gate-mode' : 'pu pu-workspace'}
              data-testid="pulse-employee-layout"
            >
              {/* 1. Header trên cùng toàn màn hình - truyền gate để Header tự tối giản */}
              {!exam && <PulseHeader gate={gate} isGateActive={shouldFocus} />}

              {/* 2. Vùng làm việc: Ẩn hoàn toàn sidebar khi đang ở Gate Mode hoặc Exam Mode */}
              <div
                className={
                  exam
                    ? 'pu-exam-container'
                    : shouldFocus
                    ? 'pu-gate-focused-container'
                    : 'pu-workspace-content'
                }
              >
                {!exam && !shouldFocus && <PulseSidebar trialLearning={trialLearning} />}
                <main
                  className={
                    exam
                      ? 'pu-exam-main'
                      : shouldFocus
                      ? 'pu-gate-focused-main'
                      : 'pu-main-content'
                  }
                  id="main"
                >
                  {isTrialLoading ? (
                    <PageSkeleton />
                  ) : (
                    <Outlet />
                  )}
                </main>
              </div>

              {/* Trợ lý & Hướng dẫn: ẩn khi thi hoặc khi đang ở Gate Mode */}
              {!exam && !shouldFocus && <AssistantWidget />}
              {!exam && !trial && !shouldFocus && <RoleTutorialContainer forcedRole="EMPLOYEE" />}
            </div>
          )}
        </RequireOnboarded>
      </RequireWorkspace>
    </AuthGuard>
  );
}
