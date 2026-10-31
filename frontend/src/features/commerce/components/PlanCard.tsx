import { useId, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BILLING_CYCLE_LABELS,
  clampSeats,
  formatVnd,
  priceFor,
  type BillingCycle,
  type Plan,
} from '@/lib/plans';
import type { PlanSelection } from '@/types/commerce';

interface PlanCardProps {
  plan: Plan;
  cycle: BillingCycle;
  onChoose: (selection: PlanSelection) => void;
  salesEmail: string;
  isSuggested?: boolean;
}

/**
 * Thẻ gói dịch vụ theo ngôn ngữ thiết kế Light Pearl Glassmorphism của DigiTalent Pulse.
 * Tối ưu công thái học, đạt độ tương phản chuẩn WCAG AAA trên nền sáng.
 */
export function PlanCard({ plan, cycle, onChoose, salesEmail, isSuggested }: PlanCardProps) {
  const seatsId = useId();
  const defaultUsers = plan.users?.included ?? 1;
  const [seats, setSeats] = useState(defaultUsers);
  const effectiveSeats = clampSeats(plan, seats);
  const total = priceFor(plan, effectiveSeats, cycle);

  const isEnterprise = plan.audience === 'enterprise';
  const hasAddon = Boolean(plan.users?.addonAllowed && plan.users.max > plan.users.included);
  const isOnline = plan.billing.monthlyPrice !== null;
  const isFeatured = plan.recommended || isSuggested;

  return (
    <article
      aria-label={`Gói ${plan.name}`}
      className={cn(
        'relative flex h-full flex-col rounded-3xl p-7 transition-all duration-300',
        'bg-white/95 backdrop-blur-sm text-slate-800',
        isFeatured
          ? 'border-2 border-amber-500/70 shadow-xl shadow-amber-500/10 ring-4 ring-amber-500/10'
          : 'border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-slate-300'
      )}
    >
      {/* Featured Ribbon */}
      {isFeatured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1 text-xs font-bold text-white shadow-md shadow-amber-500/30 uppercase tracking-wide">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {isSuggested ? 'Đề xuất phù hợp' : 'Khuyên dùng cho B2B'}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{plan.name}</h2>
        {plan.recommended && !isSuggested && (
          <span className="rounded-full bg-amber-50 border border-amber-200/60 px-3 py-0.5 text-xs font-semibold text-amber-800">
            Phổ biến nhất
          </span>
        )}
      </div>

      <p className="mt-2 min-h-[2.8em] text-sm leading-relaxed text-slate-600">{plan.tagline}</p>

      {/* Pricing block */}
      <div className="mt-5 border-y border-slate-100 py-5">
        {!isOnline ? (
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900">Liên hệ</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Quy mô lớn &amp; tích hợp hệ thống theo yêu cầu
            </p>
          </div>
        ) : (
          <div>
            {cycle === 'year' ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                    {formatVnd(plan.billing.annualPrice ?? 0)}
                  </span>
                  <span className="text-sm font-medium text-slate-500">/ năm</span>
                </div>
                <p className="mt-1.5 text-xs font-medium text-emerald-700 tabular-nums">
                  ≈ {formatVnd(Math.round((plan.billing.annualPrice ?? 0) / 12))} / tháng · Tiết kiệm 20%
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                    {formatVnd(plan.billing.monthlyPrice ?? 0)}
                  </span>
                  <span className="text-sm font-medium text-slate-500">/ tháng</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Thanh toán định kỳ hàng tháng</p>
              </>
            )}

            {/* Total calculation with add-on summary */}
            {total !== null && (
              <p className="mt-2 text-xs font-semibold text-slate-700 tabular-nums bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1.5 inline-block">
                {effectiveSeats > defaultUsers
                  ? `Tổng ${formatVnd(total)} / ${BILLING_CYCLE_LABELS[cycle]} cho ${effectiveSeats} người dùng`
                  : `Trọn gói cho tối đa ${defaultUsers} người dùng`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add-on / Capacity Selector (B2B online plans) */}
      {isEnterprise && isOnline && hasAddon && plan.users && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor={seatsId} className="text-xs font-semibold text-slate-700">
              Số nhân viên ({plan.users.included}–{plan.users.max})
            </label>
            <span className="text-[11px] font-medium text-slate-500">
              Bao gồm sẵn {plan.users.included}
            </span>
          </div>
          <input
            id={seatsId}
            type="number"
            inputMode="numeric"
            min={plan.users.included}
            max={plan.users.max}
            value={seats}
            onChange={(event) => setSeats(Number(event.target.value))}
            onBlur={() => setSeats(effectiveSeats)}
            className="w-full rounded-lg bg-white px-3 py-1.5 text-center text-sm font-bold text-slate-900 border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
          />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Thêm nhân viên: +
            {formatVnd(
              cycle === 'year'
                ? (plan.users.annualAddonPrice ?? 0)
                : (plan.users.monthlyAddonPrice ?? 0),
            )}{' '}
            / người / {BILLING_CYCLE_LABELS[cycle]}
          </p>
        </div>
      )}

      {/* Highlight features */}
      <ul className="mt-5 grid flex-1 content-start gap-2.5 text-sm text-slate-700">
        {plan.highlights.map((point) => (
          <li key={point} className="flex items-start gap-2.5 leading-snug">
            <span className="flex-shrink-0 mt-0.5 rounded-full bg-emerald-50 text-emerald-600 p-0.5 border border-emerald-200/60">
              <Check className="size-3.5 stroke-[3]" aria-hidden="true" />
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <div className="mt-8 pt-4">
        {!isOnline ? (
          <a
            href={`mailto:${salesEmail}?subject=${encodeURIComponent('Tư vấn gói Enterprise DigiTalent')}`}
            className="w-full inline-flex items-center justify-center rounded-xl border-2 border-slate-300 px-6 py-3 text-sm font-bold text-slate-800 transition-all hover:border-slate-800 hover:bg-slate-50 active:scale-[0.99]"
          >
            Liên hệ chuyên viên B2B
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onChoose({ planCode: plan.code, seats: effectiveSeats, cycle })}
            className={cn(
              'w-full rounded-xl px-6 py-3 text-sm font-bold transition-all shadow-sm active:scale-[0.99]',
              isFeatured
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700'
                : 'border-2 border-slate-200 bg-slate-50/80 text-slate-800 hover:border-amber-500 hover:text-amber-800 hover:bg-amber-50/40'
            )}
          >
            Chọn gói {plan.name}
          </button>
        )}
      </div>
    </article>
  );
}
