import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PurchaseStepperProps {
  audience: 'enterprise' | 'individual';
  currentStep: number;
  changePlanPath?: string;
  className?: string;
}

const ENTERPRISE_STEPS = [
  { id: 1, name: 'Chọn gói' },
  { id: 2, name: 'Tài khoản' },
  { id: 3, name: 'Thanh toán' },
  { id: 4, name: 'Ký hợp đồng' },
  { id: 5, name: 'Thiết lập tổ chức' },
];

const INDIVIDUAL_STEPS = [
  { id: 1, name: 'Chọn gói' },
  { id: 2, name: 'Tài khoản' },
  { id: 3, name: 'Thanh toán' },
  { id: 4, name: 'Thiết lập cá nhân' },
];

export function PurchaseStepper({
  audience,
  currentStep,
  changePlanPath = audience === 'enterprise' ? '/business/pricing' : '/individual/pricing',
  className,
}: PurchaseStepperProps) {
  const steps = audience === 'enterprise' ? ENTERPRISE_STEPS : INDIVIDUAL_STEPS;
  const total = steps.length;
  const current = steps.find((s) => s.id === currentStep) ?? steps[0];

  return (
    <nav aria-label="Tiến trình mua gói" className={cn('w-full', className)}>
      {/* Mobile view (< 640px) */}
      <div className="flex items-center justify-between gap-3 rounded-full bg-landing-card px-4 py-2 text-xs sm:hidden ring-1 ring-cream/10">
        <span className="font-medium text-cream">
          Bước {currentStep}/{total} · {current.name}
        </span>
        {currentStep > 1 && changePlanPath && (
          <Link
            to={changePlanPath}
            className="text-stone-400 hover:text-cream underline decoration-stone-500 underline-offset-2"
          >
            Đổi gói
          </Link>
        )}
      </div>

      {/* Desktop view (>= 640px) */}
      <ol className="hidden sm:flex items-center justify-between gap-2">
        {steps.map((step, idx) => {
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isPlanStep = step.id === 1;

          return (
            <li
              key={step.id}
              className={cn(
                'flex items-center gap-2.5 text-xs md:text-sm',
                idx < steps.length - 1 && 'flex-1',
              )}
            >
              <div
                className={cn(
                  'flex items-center gap-2',
                  isCurrent && 'text-cream font-medium',
                  isDone && 'text-stone-300',
                  !isDone && !isCurrent && 'text-stone-500',
                )}
                {...(isCurrent ? { 'aria-current': 'step' } : {})}
              >
                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors',
                    isDone && 'bg-cream-soft text-black',
                    isCurrent && 'bg-cream text-black ring-2 ring-cream/40',
                    !isDone && !isCurrent && 'border border-stone-700 bg-stone-900 text-stone-500',
                  )}
                >
                  {isDone ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : step.id}
                </span>

                <span className="truncate">
                  {step.name}
                  {isPlanStep && isDone && changePlanPath && (
                    <Link
                      to={changePlanPath}
                      className="ml-1.5 text-xs text-stone-400 hover:text-cream underline underline-offset-2 font-normal"
                    >
                      (Đổi gói)
                    </Link>
                  )}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={cn(
                    'h-px flex-1 min-w-4 transition-colors',
                    isDone ? 'bg-cream/40' : 'bg-stone-800',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
