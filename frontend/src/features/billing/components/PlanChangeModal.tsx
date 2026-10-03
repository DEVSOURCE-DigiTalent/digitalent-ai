import { useId, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/shared';
import { useChangePlan, usePlanChangePreview, usePlanOptions } from '@/hooks/use-subscription';
import { BILLING_CYCLE_LABELS, clampSeats, formatVnd, type BillingCycle } from '@/lib/plans';
import { apiErrorMessage } from '@/lib/utils';
import type { SubscriptionDto } from '@/services/subscription.service';
import { INPUT_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/features/onboarding/components/styles';

interface PlanChangeModalProps {
  open: boolean;
  onClose: () => void;
  subscription: SubscriptionDto;
}

/** ADM-10: pick another plan, seats and cycle; see what changes before anything does. */
export function PlanChangeModal({ open, onClose, subscription }: PlanChangeModalProps) {
  const base = useId();
  const { data: plans } = usePlanOptions(open);
  const purchasable = (plans ?? []).filter((plan) => plan.monthlyPrice !== null);
  const [planCode, setPlanCode] = useState(subscription.planCode);
  const [seats, setSeats] = useState(subscription.seatLimit ?? 10);
  const [cycle, setCycle] = useState<BillingCycle>(subscription.cycle);
  const change = useChangePlan();

  const selected = purchasable.find((plan) => plan.code === planCode);
  const effectiveSeats = selected ? clampSeats(selected, seats) : seats;
  const request = useMemo(
    () => (selected ? { planCode, seats: effectiveSeats, cycle } : undefined),
    [selected, planCode, effectiveSeats, cycle],
  );
  const { data: impact, isFetching, error } = usePlanChangePreview(request);

  const confirm = async () => {
    if (!request) return;
    try {
      await change.mutateAsync(request);
      toast.success('Đã đổi gói dịch vụ.');
      onClose();
    } catch (failure) {
      toast.error(apiErrorMessage(failure, 'Không đổi được gói.'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Đổi gói dịch vụ"
      description="Xem tác động trước khi xác nhận. Dữ liệu của tổ chức luôn được giữ."
      footer={
        <>
          <button type="button" onClick={onClose} className={SECONDARY_BUTTON}>Hủy</button>
          <button
            type="button"
            onClick={confirm}
            disabled={!impact || !impact.allowed || impact.direction === 'same' || change.isPending}
            className={PRIMARY_BUTTON}
          >
            {change.isPending ? 'Đang đổi…' : impact?.direction === 'downgrade' ? 'Xác nhận hạ gói' : 'Xác nhận đổi gói'}
          </button>
        </>
      }
    >
      <div className="grid gap-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">Gói</legend>
          <ul className="grid gap-2 sm:grid-cols-2">
            {purchasable.map((plan) => (
              <li key={plan.code}>
                <label className="flex h-full cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50">
                  <input type="radio" name={`${base}-plan`} value={plan.code} checked={planCode === plan.code} onChange={() => { setPlanCode(plan.code); if (plan.seatRange) setSeats((s) => clampSeats(plan, s)); }} className="mt-0.5 size-4 accent-primary-600" />
                  <span>
                    <span className="block font-medium text-slate-900">
                      {plan.name}
                      {plan.current && <span className="ml-2 text-xs font-normal text-slate-500">(đang dùng)</span>}
                    </span>
                    <span className="block text-slate-500">{formatVnd(plan.monthlyPrice ?? 0)} / ghế / tháng</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label htmlFor={`${base}-seats`} className="text-sm font-medium text-slate-700">
              Số ghế{selected?.seatRange ? ` (${selected.seatRange.min}–${selected.seatRange.max})` : ''}
            </label>
            <input id={`${base}-seats`} type="number" min={selected?.seatRange?.min} max={selected?.seatRange?.max} value={seats} onChange={(e) => setSeats(Number(e.target.value))} onBlur={() => setSeats(effectiveSeats)} className={INPUT_CLASS} />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor={`${base}-cycle`} className="text-sm font-medium text-slate-700">Chu kỳ thanh toán</label>
            <select id={`${base}-cycle`} value={cycle} onChange={(e) => setCycle(e.target.value as BillingCycle)} className={INPUT_CLASS}>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm (giảm 20%)</option>
            </select>
          </div>
        </div>

        <section aria-live="polite" aria-label="Tác động của việc đổi gói" className="rounded-lg bg-slate-50 p-4 text-sm">
          {isFetching && !impact && <p className="text-slate-500">Đang tính…</p>}
          {error && <p role="alert" className="text-red-600">{apiErrorMessage(error, 'Không tính được tác động.')}</p>}
          {impact && impact.direction === 'same' && <p className="text-slate-600">Đây là gói bạn đang dùng. Hãy chọn gói, số ghế hoặc chu kỳ khác.</p>}
          {impact && impact.direction !== 'same' && (
            <div className="grid gap-3">
              <p className="font-medium text-slate-900">
                {impact.direction === 'upgrade' ? 'Nâng cấp' : 'Hạ gói'}: {formatVnd(impact.currentAmount)} → {formatVnd(impact.newAmount)} / {BILLING_CYCLE_LABELS[cycle]}
                <span className="ml-2 font-normal text-slate-600">({impact.difference >= 0 ? '+' : '−'}{formatVnd(Math.abs(impact.difference))})</span>
              </p>
              <p className="text-slate-600">{impact.note}</p>
              {impact.gained.length > 0 && <p><span className="font-medium text-emerald-700">Có thêm:</span> {impact.gained.join(', ')}</p>}
              {impact.lost.length > 0 && <p><span className="font-medium text-amber-700">Không còn:</span> {impact.lost.join(', ')}</p>}
              <p className="text-slate-600">Đang dùng {impact.seatsUsed} ghế.</p>
              {impact.blockers.map((blocker) => <p key={blocker} role="alert" className="font-medium text-red-600">{blocker}</p>)}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
