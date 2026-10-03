import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { WizardShell, type WizardStep } from '@/components/shared';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefreshSession } from '@/hooks/use-refresh-session';
import { useSetup } from '@/hooks/use-onboarding';
import { resolveNextStep } from '@/lib/navigation';
import { onboardingService } from '@/services/onboarding.service';
import { PurchaseStepper } from '@/features/commerce/components/PurchaseStepper';
import { CompletionStep } from '../components/CompletionStep';
import { DepartmentsStep } from '../components/DepartmentsStep';
import { GradesStep } from '../components/GradesStep';
import { InviteStep } from '../components/InviteStep';
import { OrganizationStep } from '../components/OrganizationStep';
import { PositionsStep } from '../components/PositionsStep';

const STEPS: WizardStep[] = [
  { id: 'organization', label: 'Thông tin tổ chức' },
  { id: 'grades', label: 'Cấp bậc (G1–G3)', optional: true },
  { id: 'departments', label: 'Phòng ban', optional: true },
  { id: 'positions', label: 'Vị trí công việc', optional: true },
  { id: 'members', label: 'Mời nhân viên', optional: true },
  { id: 'done', label: 'Hoàn tất' },
];

const TITLES: Record<string, { title: string; description: string }> = {
  organization: {
    title: 'Thông tin tổ chức',
    description: 'Cho chúng tôi biết về doanh nghiệp của bạn, logo thương hiệu và múi giờ làm việc. Có thể chỉnh lại sau trong Cài đặt tổ chức.',
  },
  grades: {
    title: 'Cấp bậc nhân sự (G1–G3)',
    description: 'Chuẩn hóa 3 cấp bậc năng lực theo quy chuẩn Thông tư 02/2025. Bạn có thể điều chỉnh tên hiển thị hoặc dùng mặc định.',
  },
  departments: {
    title: 'Phòng ban và nhóm',
    description: 'Dùng để xếp nhân viên và xem skill gap theo phòng ban. Bạn có thể bỏ qua và thêm sau.',
  },
  positions: {
    title: 'Vị trí công việc',
    description: 'Chọn các vị trí đang có trong tổ chức, phân bổ Cấp bậc G1–G3 và phòng ban trực thuộc.',
  },
  members: {
    title: 'Mời nhân viên',
    description: 'Mỗi người nhận một lời mời và tự đặt mật khẩu. Bạn có thể bỏ qua và mời sau trong mục Thành viên.',
  },
  done: {
    title: 'Sẵn sàng bắt đầu',
    description: 'Xem lại những gì đã thiết lập. Phần còn thiếu có thể bổ sung bất cứ lúc nào.',
  },
};

/** AUTH-04 / AUTH-05 / ENT-ONB-05: the organization setup wizard, shown to a new owner after payment and before the portal. */
export function SetupWizardPage() {
  const user = useCurrentUser((s) => s.user)!;
  const navigate = useNavigate();
  const refreshSession = useRefreshSession();
  const setupQuery = useSetup();
  const [stepIndex, setStepIndex] = useState<number>();
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set());

  const setup = setupQuery.data;

  // Initialize step from savedStep if not yet set
  useEffect(() => {
    if (stepIndex === undefined && setup) {
      if (setup.setupStep !== undefined && setup.setupStep > 0) {
        setStepIndex(setup.setupStep);
      } else if (setup.organization?.industry) {
        setStepIndex(1);
      } else {
        setStepIndex(0);
      }
    }
  }, [setup, stepIndex]);

  // Setup is for owners who have not finished it; anyone else belongs in the portal.
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingStatus !== 'setup') return <Navigate to={resolveNextStep(user)} replace />;

  const isOrgSaved = Boolean(setup?.organization?.industry);
  const current = stepIndex ?? (setup?.setupStep ?? (isOrgSaved ? 1 : 0));
  const step = STEPS[current] ?? STEPS[0];

  const goTo = (idx: number) => {
    const nextIdx = Math.max(0, Math.min(idx, STEPS.length - 1));
    setStepIndex(nextIdx);
    onboardingService.saveStep(nextIdx).catch(() => {});
  };

  const next = () => goTo(current + 1);
  const back = () => goTo(current - 1);
  const skip = () => {
    setSkipped(new Set([...skipped, step.id]));
    next();
  };

  const handleSaveAndExit = async () => {
    try {
      await onboardingService.saveStepAndExit(current);
      await refreshSession();
    } catch {
      // ignore
    }
    navigate('/enterprise/dashboard', { replace: true });
  };

  const completed = new Set<string>(skipped);
  if (isOrgSaved) completed.add('organization');
  if (setup?.grades?.length && current > 1) completed.add('grades');
  if (setup?.departments.length) completed.add('departments');
  if (setup?.positions.length) completed.add('positions');
  if (setup?.invitations.length) completed.add('members');

  return (
    <div className="py-8">
      <main className="mx-auto max-w-5xl px-4 lg:px-8">
        <PurchaseStepper audience="enterprise" currentStep={5} className="mb-6" />
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-ent-fg">Thiết lập tổ chức</h1>
          {isOrgSaved && (
            <button
              type="button"
              onClick={handleSaveAndExit}
              className="text-xs text-stone-400 hover:text-cream underline underline-offset-4"
            >
              Lưu và tiếp tục sau
            </button>
          )}
        </div>

        {setupQuery.isLoading && <p className="text-sm text-slate-500">Đang tải…</p>}
        {setupQuery.isError && (
          <p role="alert" className="text-sm text-red-600">
            Không tải được dữ liệu thiết lập. Hãy tải lại trang.
          </p>
        )}

        {setup && (
          <WizardShell
            steps={STEPS}
            current={current}
            completed={completed}
            onStepSelect={isOrgSaved ? goTo : undefined}
            title={TITLES[step.id].title}
            description={TITLES[step.id].description}
          >
            {step.id === 'organization' && <OrganizationStep setup={setup} onDone={next} />}
            {step.id === 'grades' && <GradesStep setup={setup} onBack={back} onDone={next} onSkip={skip} />}
            {step.id === 'departments' && (
              <DepartmentsStep setup={setup} onBack={back} onDone={next} onSkip={skip} />
            )}
            {step.id === 'positions' && (
              <PositionsStep setup={setup} onBack={back} onDone={next} onSkip={skip} />
            )}
            {step.id === 'members' && <InviteStep setup={setup} onBack={back} onDone={next} onSkip={skip} />}
            {step.id === 'done' && <CompletionStep setup={setup} onBack={back} />}
          </WizardShell>
        )}
      </main>
    </div>
  );
}
