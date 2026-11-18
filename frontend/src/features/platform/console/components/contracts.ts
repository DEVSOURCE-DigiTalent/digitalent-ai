import type { PlatformCourseOrder } from '@/services/platform-admin.service';

export interface OrganizationContract {
  /** Mã hợp đồng điện tử, ví dụ DT-ESIGN-4MQLNW8. */
  code: string;
  /** Người đại diện ký, đọc từ ghi chú đơn (không gồm số điện thoại). */
  signer: string | null;
  /** Courses bought under the contract (one order per course). */
  orderCount: number;
  totalAmount: number;
  /** Thời điểm đơn đầu tiên của hợp đồng (ISO). */
  signedAt: string;
}

const CONTRACT_PATTERN = /\[Hợp đồng điện tử:\s*([^\]\s]+)\s*\]/;
const SIGNER_PATTERN = /Đại diện:\s*([^()\r\n]+?)\s*(?:\(|$)/;

/**
 * Gom các đơn mua của một tổ chức theo mã hợp đồng điện tử trong ghi chú đơn.
 * Đơn không có mã (mua trước khi có hợp đồng điện tử) không thuộc hợp đồng nào.
 * Kết quả sắp theo ngày ký mới nhất trước.
 */
export function extractContracts(orders: readonly PlatformCourseOrder[]): OrganizationContract[] {
  const byCode = new Map<string, OrganizationContract>();

  for (const order of orders) {
    if (!order.reason) continue;
    const code = CONTRACT_PATTERN.exec(order.reason)?.[1];
    if (!code) continue;

    const existing = byCode.get(code);
    if (existing) {
      existing.orderCount += 1;
      existing.totalAmount += order.amount;
      if (order.createdAt < existing.signedAt) existing.signedAt = order.createdAt;
      continue;
    }

    byCode.set(code, {
      code,
      signer: SIGNER_PATTERN.exec(order.reason)?.[1]?.trim() || null,
      orderCount: 1,
      totalAmount: order.amount,
      signedAt: order.createdAt,
    });
  }

  return [...byCode.values()].sort((a, b) => (a.signedAt < b.signedAt ? 1 : -1));
}
