import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Circle,
  ClipboardCheck,
  Clock3,
  FlaskConical,
  Route,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PageContainer } from '@/components/shared';
import { useCurrentUser } from '@/hooks/use-current-user';
import { enterpriseTrialService as service } from '@/services/enterprise-trial.service';
import { useTrialQuery } from './trial-queries';
import { ErrorText } from './trial-ui';
import { TRIAL_STEP_LABELS, trialDashboardModel, trialStepHref } from './trial-dashboard-model';

const primaryButton = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-ent-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ent-accent';
const secondaryButton = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-ent-line bg-ent-card px-4 py-2 text-sm font-semibold text-ent-fg transition hover:bg-ent-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ent-accent disabled:cursor-not-allowed disabled:opacity-50';

interface ProductAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const OWNER_ACTIONS: ProductAction[] = [
  { label: 'Vị trí công việc', description: 'Tạo vị trí và gắn bộ phận trong màn hình quản trị thật.', href: '/enterprise/positions', icon: BriefcaseBusiness },
  { label: 'Thành viên', description: 'Mời nhân viên và quản lý quyền truy cập tổ chức.', href: '/enterprise/members', icon: UserPlus },
  { label: 'Yêu cầu năng lực', description: 'Thiết lập chuẩn năng lực cần đạt theo từng vị trí.', href: '/enterprise/requirements', icon: ClipboardCheck },
  { label: 'Kết quả đánh giá', description: 'Theo dõi kết quả và trạng thái đánh giá của nhân sự.', href: '/enterprise/assessment-results', icon: BarChart3 },
];

const MANAGER_ACTIONS: ProductAction[] = [
  { label: 'Thành viên nhóm', description: 'Theo dõi những thành viên thuộc phạm vi quản lý.', href: '/enterprise/team/members', icon: Users },
  { label: 'Năng lực nhóm', description: 'Mở ma trận năng lực hiện tại của cả nhóm.', href: '/enterprise/team/competency', icon: Award },
  { label: 'Khoảng trống nhóm', description: 'Xác định kỹ năng cần ưu tiên đào tạo.', href: '/enterprise/team/skill-gap', icon: TrendingUp },
  { label: 'Đánh giá của tôi', description: 'Trải nghiệm quy trình đánh giá ở vai trò người học.', href: '/enterprise/me/assessments', icon: ClipboardCheck },
];

const EMPLOYEE_ACTIONS: ProductAction[] = [
  { label: 'Bài đánh giá', description: 'Bắt đầu và hoàn thành bài đánh giá được giao.', href: '/enterprise/me/assessments', icon: ClipboardCheck },
  { label: 'Khoảng trống năng lực', description: 'Xem chênh lệch giữa năng lực hiện tại và yêu cầu.', href: '/enterprise/me/skill-gap', icon: TrendingUp },
  { label: 'Lộ trình học', description: 'Mở lộ trình được đề xuất từ kết quả đánh giá.', href: '/enterprise/me/learning-path', icon: Route },
  { label: 'Khóa học của tôi', description: 'Tiếp tục học và theo dõi tiến độ khóa được giao.', href: '/enterprise/me/courses', icon: BookOpen },
];

function actionsFor(roles: readonly string[]): ProductAction[] {
  if (roles.includes('OWNER')) return OWNER_ACTIONS;
  if (roles.includes('MANAGER')) return MANAGER_ACTIONS;
  return EMPLOYEE_ACTIONS;
}

export function TrialDashboardOverview({ now = new Date() }: { now?: Date }) {
  const user = useCurrentUser((state) => state.user);
  const context = useTrialQuery('context', service.context);

  if (context.isPending) {
    return <PageContainer width="wide"><p role="status" className="py-8 text-sm text-ent-fg-3">Đang mở dashboard dùng thử…</p></PageContainer>;
  }
  if (context.error || !context.data) {
    return <PageContainer width="wide"><div className="space-y-4 py-8"><ErrorText error={context.error ?? new Error('Không có dữ liệu trial.')} /><button type="button" className={secondaryButton} onClick={() => void context.refetch()}>Thử tải lại</button></div></PageContainer>;
  }

  const value = context.data;
  const roles = user?.roles ?? [];
  const model = trialDashboardModel(value, roles, now);
  const isOwner = roles.includes('OWNER');
  const firstName = user?.fullName.trim().split(/\s+/).at(-1) ?? 'bạn';
  const actions = actionsFor(roles);

  return (
    <PageContainer width="wide" className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-ent-line bg-ent-card shadow-sm">
        <div className="border-b border-ent-line bg-[linear-gradient(120deg,var(--ent-card),var(--ent-raised))] px-5 py-5 sm:px-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="max-w-2xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-ent-accent/30 bg-ent-accent/10 px-2.5 py-1 text-xs font-semibold text-ent-accent"><FlaskConical className="size-3.5" />Dùng thử Enterprise</span>
                <span className="rounded-full bg-ent-raised px-2.5 py-1 text-xs font-medium text-ent-fg-2">Dữ liệu demo</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-ent-fg sm:text-3xl">Hoàn tất một vòng trải nghiệm, {firstName}</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-ent-fg-2">Dashboard chỉ theo dõi tiến độ. Mỗi bước sẽ đưa bạn tới đúng màn hình Enterprise để thao tác như khi triển khai thật.</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link className={primaryButton} to={model.nextAction.href}>{model.nextAction.label} <ArrowRight className="size-4" /></Link>
              {isOwner && <Link className={secondaryButton} to="/business/pricing">Xem gói phù hợp</Link>}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-ent-fg">Tiến độ kích hoạt {model.completedSteps}/{model.totalSteps} bước</span>
              <span className="tabular-nums text-ent-fg-3">{model.progressPercent}%</span>
            </div>
            <div role="progressbar" aria-label="Tiến độ trải nghiệm" aria-valuemin={0} aria-valuemax={100} aria-valuenow={model.progressPercent} className="h-2 overflow-hidden rounded-full bg-ent-line">
              <div className="h-full rounded-full bg-ent-accent transition-[width]" style={{ width: `${model.progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-ent-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-3 px-5 py-4"><Clock3 className="size-5 text-ent-accent" /><div><p className="text-xs text-ent-fg-3">Thời gian còn lại</p><p className="font-semibold text-ent-fg">{model.remainingLabel}</p></div></div>
          <div className="flex items-center gap-3 px-5 py-4"><Users className="size-5 text-ent-accent" /><div><p className="text-xs text-ent-fg-3">Ghế đang giữ</p><p className="font-semibold tabular-nums text-ent-fg">{model.usedSeats} / {value.limits.maxAccounts}</p></div></div>
          <div className="flex items-center gap-3 px-5 py-4"><Sparkles className="size-5 text-ent-accent" /><div><p className="text-xs text-ent-fg-3">Trạng thái</p><p className="font-semibold text-ent-fg">{model.writable ? 'Đang dùng thử' : 'Chỉ đọc'}</p></div></div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="product-actions-title" className="rounded-xl border border-ent-line bg-ent-card p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ent-accent">Khám phá sản phẩm thật</p>
            <h2 id="product-actions-title" className="mt-1 text-xl font-semibold text-ent-fg">Đi tới chức năng cần thao tác</h2>
            <p className="mt-1 text-sm text-ent-fg-3">Không có biểu mẫu trial riêng. Bạn sẽ sử dụng trực tiếp các màn hình đang có của hệ thống.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} to={action.href} className="group flex min-h-32 flex-col justify-between rounded-xl border border-ent-line bg-ent-raised p-4 transition hover:-translate-y-0.5 hover:border-ent-accent/40 hover:bg-ent-card">
                  <div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-lg bg-ent-accent/10 text-ent-accent"><Icon className="size-4.5" /></span><ArrowRight className="size-4 text-ent-fg-3 transition group-hover:translate-x-0.5 group-hover:text-ent-accent" /></div>
                  <div className="mt-4"><h3 className="text-sm font-semibold text-ent-fg">{action.label}</h3><p className="mt-1 text-xs leading-5 text-ent-fg-3">{action.description}</p></div>
                </Link>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-ent-line bg-ent-card p-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-ent-fg">4 bước cần hoàn tất</h2><span className="text-xs tabular-nums text-ent-fg-3">{model.completedSteps}/{model.totalSteps}</span></div>
            <ol className="space-y-1">
              {value.checklist.map((item, index) => (
                <li key={item.key}>
                  <Link to={trialStepHref(item.key, roles)} className="group flex gap-3 rounded-lg px-2 py-2.5 hover:bg-ent-raised">
                    <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${item.complete ? 'border-ent-ok bg-ent-ok text-white' : 'border-ent-line bg-ent-raised text-ent-fg-3'}`}>{item.complete ? <Check className="size-3.5" /> : <Circle className="size-3.5" />}</span>
                    <div className="min-w-0 flex-1"><p className={`text-sm font-medium ${item.complete ? 'text-ent-fg-3' : 'text-ent-fg'}`}>{index + 1}. {TRIAL_STEP_LABELS[item.key] ?? item.key}</p><p className="mt-0.5 text-xs text-ent-fg-3">{item.complete ? 'Đã hoàn tất · mở lại' : item.key === model.nextAction.key ? 'Nên làm tiếp' : 'Đi tới chức năng'}</p></div>
                    <ArrowRight className="mt-1 size-3.5 shrink-0 text-ent-fg-3 group-hover:text-ent-accent" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border border-ent-accent/25 bg-ent-accent/5 p-5">
            <h2 className="font-semibold text-ent-fg">Phạm vi dùng thử</h2>
            <p className="mt-2 text-sm leading-6 text-ent-fg-2">Tối đa {value.limits.maxAccounts} tài khoản. Một số tính năng nâng cao được khóa và có thể mở sau khi nâng cấp.</p>
            {isOwner && <Link className={`${secondaryButton} mt-4 w-full`} to="/business/pricing">Xem quyền theo từng gói</Link>}
          </section>
        </aside>
      </div>
    </PageContainer>
  );
}
