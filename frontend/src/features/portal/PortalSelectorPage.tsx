import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Building2, UserRound } from 'lucide-react';
import { PublicShell } from '../public/components/PublicShell';
import { PORTAL_HOME, getPortalChoice, rememberPortalChoice, type PortalChoice } from './portal-preference';

interface PortalOption {
  choice: PortalChoice;
  icon: typeof Building2;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  cta: string;
}

const OPTIONS: PortalOption[] = [
  {
    choice: 'enterprise',
    icon: Building2,
    eyebrow: 'Dành cho doanh nghiệp',
    title: 'Quản trị năng lực số của cả đội ngũ.',
    body: 'Đặt yêu cầu năng lực cho từng vị trí, thấy khoảng trống kỹ năng, giao khóa học và xác nhận năng lực bằng bằng chứng thực tế.',
    points: ['Mua gói theo quy mô người dùng', 'Mời nhân viên, phân quyền theo vai trò', 'Nhiệm vụ thực hành và đánh giá của quản lý'],
    cta: 'Xem giải pháp doanh nghiệp',
  },
  {
    choice: 'individual',
    icon: UserRound,
    eyebrow: 'Dành cho cá nhân',
    title: 'Phát triển năng lực cho vị trí bạn nhắm tới.',
    body: 'Chọn mục tiêu nghề nghiệp, làm bài đánh giá đầu vào, biết mình còn thiếu gì và học theo lộ trình được dựng riêng cho bạn.',
    points: ['Chọn gói theo mục tiêu của bạn', 'Lộ trình học theo thứ tự tiên quyết', 'Theo dõi tiến bộ qua từng bài đánh giá'],
    cta: 'Xem giải pháp cá nhân',
  },
];

/** PUB-01: gateway that positions the product as two experiences on one competency core. */
export function PortalSelectorPage() {
  return (
    <PublicShell width="wide" className="pt-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-cream-soft sm:text-xs">DigiTalent AI</p>
        <h1 className="mt-5 text-balance text-[clamp(32px,5.4vw,64px)] font-normal leading-[1.05] tracking-[-0.03em]">
          Bạn muốn dùng DigiTalent AI theo cách nào?
        </h1>
        <p className="mx-auto mt-5 max-w-[46ch] text-pretty text-sm leading-[1.7] text-stone-400 sm:text-base">
          Hai trải nghiệm khác nhau, cùng một khung năng lực số theo Thông tư 02/2025/TT-BGDĐT.
        </p>
      </div>

      <ul className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
        {OPTIONS.map((option) => (
          <li key={option.choice}>
            <PortalCard option={option} />
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center text-sm text-stone-400">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-cream underline underline-offset-4">
          Đăng nhập
        </Link>
      </p>
    </PublicShell>
  );
}

function PortalCard({ option }: { option: PortalOption }) {
  const Icon = option.icon;
  return (
    <Link
      to={PORTAL_HOME[option.choice]}
      onClick={() => rememberPortalChoice(option.choice)}
      className="group flex h-full flex-col rounded-3xl bg-landing-panel p-7 ring-1 ring-cream/10 transition-[box-shadow,transform] duration-300 hover:ring-cream/40 motion-safe:hover:-translate-y-1 md:p-9"
    >
      <span className="grid size-11 place-items-center rounded-full bg-landing-card text-cream-soft" aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <p className="mt-6 text-[11px] uppercase tracking-[0.14em] text-cream-soft">{option.eyebrow}</p>
      <h2 className="mt-3 text-balance text-2xl font-normal leading-[1.15] tracking-[-0.02em]">{option.title}</h2>
      <p className="mt-4 text-sm leading-[1.65] text-stone-400">{option.body}</p>
      <ul className="mt-6 grid gap-2 text-sm text-cream/80">
        {option.points.map((point) => (
          <li key={point} className="flex gap-2.5">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-cream-soft" aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>
      <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-cream">
        {option.cta}
        <ArrowRight className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}

/**
 * "/": asks once. A returning visitor goes straight to the product they chose before;
 * /portal always shows the selector, for changing direction.
 */
export function RootRoute() {
  const choice = getPortalChoice();
  return choice ? <Navigate to={PORTAL_HOME[choice]} replace /> : <PortalSelectorPage />;
}
