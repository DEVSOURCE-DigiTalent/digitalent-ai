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
 * Khung cổng nhân viên Pulse (docs/ui-redesign/16-pulse-product-flow-detailed.md §3): không có menu bên,
 * thanh đầu trang với Hôm nay / Lộ trình / Thực hành; chi tiết khóa và trang học mở theo ngữ cảnh. Trang làm bài có giám sát
 * (bài đánh giá trước khi học, bài cuối khóa) không có thanh điều hướng: trang tự hiện thanh ghi hình và nút Thoát.
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
    // Khối lệnh (không trả về): scrollTo trả về Promise trên trình duyệt mới, React chỉ chấp nhận hàm dọn dẹp.
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <AuthGuard>
      <RequireWorkspace workspace={WORKSPACES.ENTERPRISE}>
        <RequireOnboarded>
          {owner && !exam ? (
            <OwnerLearningShell pathname={pathname} />
          ) : (
          <div className={exam ? 'pu pu-exam-mode' : 'pu'} data-testid="pulse-employee-layout">
            {!exam && <PulseHeader />}
            <main className={exam ? 'pu-exam-main' : 'pu-main'} id="main">
              <TrialGate pathname={pathname}>
                <Outlet />
              </TrialGate>
            </main>
            {/* Không có trợ lý trong bài làm có giám sát. */}
            {!exam && <AssistantWidget />}
            {!exam && !trial && <RoleTutorialContainer forcedRole="EMPLOYEE" />}
          </div>
          )}
        </RequireOnboarded>
      </RequireWorkspace>
    </AuthGuard>
  );
}
