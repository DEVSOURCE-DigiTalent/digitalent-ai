import { useEffect, useState } from 'react';
import { formatVnd } from '@/lib/plans';
import { USE_MOCK } from '@/services/mock/mock-config';
import type { Order, PaymentOutcome } from '@/types/commerce';
import { DARK_PRIMARY_BUTTON, DARK_SECONDARY_BUTTON } from '../../public/components/FormControls';
import { PseudoQr } from './PseudoQr';

/** How long a QR code stays valid. */
export const QR_VALID_MS = 15 * 60 * 1000;

interface QrPaymentPanelProps {
  order: Order;
  busy: boolean;
  /** A new order is being created (the "new code" button must not fire twice). */
  regenerating: boolean;
  /** The customer says they paid. With a real bank this is a webhook; here the button stands in for it. */
  onSimulate: (outcome: PaymentOutcome) => void;
  onRegenerate: () => void;
}

function useSecondsLeft(createdAt: string): number {
  const deadline = new Date(createdAt).getTime() + QR_VALID_MS;
  const [left, setLeft] = useState(() => Math.max(0, Math.round((deadline - Date.now()) / 1000)));

  useEffect(() => {
    const timer = window.setInterval(() => setLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000))), 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  return left;
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** ENT-ONB-02: shows the QR code, the amount and the transfer reference, and waits for the payment. */
export function QrPaymentPanel({ order, busy, regenerating, onSimulate, onRegenerate }: QrPaymentPanelProps) {
  const secondsLeft = useSecondsLeft(order.createdAt);
  const isOrderExpired = order.status === 'expired' || secondsLeft === 0;

  return (
    <section aria-labelledby="qr-title" className="relative overflow-hidden rounded-3xl bg-landing-panel p-6 ring-1 ring-amber-400/20 shadow-2xl shadow-black/40 sm:p-8">
      {/* Amber glowing subtle gradient matching 3D logo */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-amber-500/10 blur-3xl" />

      <h2 id="qr-title" className="text-lg font-medium tracking-[-0.02em] text-cream">
        Quét mã để thanh toán
      </h2>
      <p className="mt-1 text-sm text-stone-300">Mở ứng dụng ngân hàng, chọn quét QR và xác nhận chuyển khoản.</p>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0 rounded-2xl p-1 bg-white ring-1 ring-amber-400/30 shadow-lg shadow-black/20">
          <PseudoQr
            value={order.code}
            className={`size-48 rounded-xl transition-opacity ${isOrderExpired ? 'opacity-20' : ''}`}
          />
          {isOrderExpired && (
            <p className="absolute inset-0 grid place-items-center text-center text-sm font-semibold text-stone-900 bg-white/90 backdrop-blur-sm rounded-xl">
              Mã đã hết hạn
            </p>
          )}
        </div>

        <dl className="grid w-full gap-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-[#F5CA65] font-semibold">Số tiền</dt>
            <dd className="mt-0.5 text-3xl font-light text-[#F5CA65] tabular-nums">{formatVnd(order.amount)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-400">Nội dung chuyển khoản</dt>
            <dd className="mt-0.5 font-mono tracking-wider font-semibold text-cream bg-landing-card inline-block px-3 py-1 rounded-lg ring-1 ring-amber-400/20">{order.code}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-400">Mã hết hạn sau</dt>
            <dd className="mt-0.5 tabular-nums text-amber-300 font-mono font-medium" aria-live="off">
              {formatClock(isOrderExpired ? 0 : secondsLeft)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-7 grid gap-3">
        {isOrderExpired ? (
          <div className="grid gap-2 text-center" role="status" aria-live="polite">
            <p className="text-sm font-medium text-amber-300">Mã QR đã hết hạn</p>
            <button type="button" onClick={onRegenerate} disabled={busy || regenerating} className={DARK_PRIMARY_BUTTON}>
              {regenerating ? 'Đang tạo mã…' : 'Tạo mã mới'}
            </button>
          </div>
        ) : USE_MOCK ? (
          <>
            <button type="button" onClick={() => onSimulate('paid')} disabled={busy} className={DARK_PRIMARY_BUTTON}>
              {busy ? 'Đang xác nhận…' : 'Tôi đã quét mã và thanh toán'}
            </button>
            <p className="text-center text-xs text-stone-400">
              Đây là bản giả lập: nút trên thay cho thông báo thanh toán từ ngân hàng.
            </p>
          </>
        ) : (
          // Only the bank (or the payment provider) can confirm a payment; the page just waits for it.
          <p role="status" className="text-center text-sm text-stone-400">
            Đang chờ ngân hàng xác nhận thanh toán…
          </p>
        )}
      </div>

      {USE_MOCK && !isOrderExpired && (
        <div className="mt-6 border-t border-amber-400/15 pt-4">
          <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[#F5CA65] font-semibold">Thử các kết quả khác</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onSimulate('paid')} disabled={busy} className={DARK_SECONDARY_BUTTON}>
              Giả lập đã thanh toán
            </button>
            <button type="button" onClick={() => onSimulate('failed')} disabled={busy} className={DARK_SECONDARY_BUTTON}>
              Giả lập thất bại
            </button>
            <button type="button" onClick={() => onSimulate('expired')} disabled={busy} className={DARK_SECONDARY_BUTTON}>
              Giả lập hết hạn
            </button>
            <button type="button" onClick={() => onSimulate('pending')} disabled={busy} className={DARK_SECONDARY_BUTTON}>
              Giả lập chờ xử lý
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
