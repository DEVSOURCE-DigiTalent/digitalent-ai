import { ENTITLEMENT_LABELS, type Entitlement } from '../../../../lib/entitlements';
import { ROLES } from '../../../../lib/roles';
import {
  clampSeats, entitlementKeys, getPlan, isPurchasableOnline, plansFor, priceFor, type BillingCycle, type Plan,
} from '../../../../lib/plans';
import { getDb, updateDb } from '../../mock-store';
import { badRequest, conflict } from '../http';
import { listMembers, seatsInUse } from '../members-logic';
import { route, type RequestContext } from '../router';
import type { OrgData } from '../types';
import { recordAudit } from './audit';

/** Subscription, usage and plan changes of the organization (spec ADM-08, ADM-09, ADM-10). Owner only, except usage. */

const OWNER_ONLY = { roles: [ROLES.OWNER] };
const OWNER_OR_ADMIN = { roles: [ROLES.OWNER] };

const DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE_LIMIT_MB: Record<string, number> = { ENT_STARTER: 10_240, ENT_PRO: 51_200, ENT_CORP: 204_800 };

function cycleOf(data: OrgData): BillingCycle {
  return data.subscriptionOverride?.cycle ?? 'month';
}

function requireCurrentPlan(context: RequestContext): Plan {
  const plan = getPlan(context.session.subscription?.planCode);
  if (!plan) throw conflict('Tổ chức chưa có gói dịch vụ.');
  return plan;
}

function invoicesFor(data: OrgData, plan: Plan, seats: number, cycle: BillingCycle, ownerId: string | undefined) {
  const paidOrders = getDb().orders.filter((order) => order.userId === ownerId && order.status === 'paid');
  if (paidOrders.length > 0) {
    return paidOrders.map((order) => ({
      id: order.id,
      code: order.code,
      issuedAt: order.paidAt ?? order.createdAt,
      description: `Gói ${getPlan(order.planCode)?.name ?? order.planCode} (${order.seats} ghế)`,
      amount: order.amount,
      status: 'PAID' as const,
    }));
  }
  // The demo organization has history in code: three monthly invoices.
  const amount = priceFor(plan, seats, cycle) ?? 0;
  return [1, 2, 3].map((n) => ({
    id: `inv-${data.organizationId}-${n}`,
    code: `DT-${new Date(Date.now() - n * 30 * DAY_MS).toISOString().slice(0, 7).replace('-', '')}`,
    issuedAt: new Date(Date.now() - n * 30 * DAY_MS).toISOString(),
    description: `Gói ${plan.name} (${seats} ghế)`,
    amount,
    status: 'PAID' as const,
  }));
}

route('GET', '/subscription', (context) => {
  const data = context.org();
  const plan = requireCurrentPlan(context);
  const subscription = context.session.subscription!;
  const seats = subscription.seatLimit ?? 1;
  const cycle = cycleOf(data);
  const owner = getDb().organizations.find((org) => org.id === data.organizationId)?.ownerId;
  return {
    planCode: plan.code,
    planName: plan.name,
    status: subscription.status,
    cycle,
    seatLimit: subscription.seatLimit,
    seatsUsed: seatsInUse(data),
    renewsAt: subscription.renewsAt,
    cancelAtPeriodEnd: data.subscriptionOverride?.cancelAtPeriodEnd ?? false,
    amountPerPeriod: priceFor(plan, seats, cycle),
    entitlements: subscription.entitlements,
    invoices: invoicesFor(data, plan, seats, cycle, owner),
  };
}, OWNER_ONLY);

route('GET', '/subscription/usage', (context) => {
  const data = context.org();
  const subscription = context.session.subscription!;
  const members = listMembers(data);
  const count = (status: string) => members.filter((m) => m.status === status).length;
  const planCode = subscription.planCode;
  const allFeatures = Object.keys(ENTITLEMENT_LABELS) as Entitlement[];
  return {
    planName: subscription.planName,
    seats: { used: seatsInUse(data), limit: subscription.seatLimit ?? null },
    storage: { usedMb: 1_240 + members.length * 35, limitMb: STORAGE_LIMIT_MB[planCode] ?? 10_240 },
    members: { active: count('ACTIVE'), pending: count('PENDING'), inactive: count('INACTIVE') },
    features: allFeatures
      .filter((key) => key !== 'personal_learning_path')
      .map((key) => ({ key, label: ENTITLEMENT_LABELS[key], enabled: subscription.entitlements.includes(key) })),
  };
}, OWNER_OR_ADMIN);

route('GET', '/subscription/plans', (context) => {
  const current = context.session.subscription?.planCode;
  return plansFor('enterprise').map((plan) => ({ ...plan, current: plan.code === current }));
}, OWNER_ONLY);

interface ChangeRequest {
  plan: Plan;
  seats: number;
  cycle: BillingCycle;
}

function parseChange(body: Record<string, unknown>): ChangeRequest {
  const plan = getPlan(String(body.planCode));
  if (!plan || plan.audience !== 'enterprise' || !isPurchasableOnline(plan)) throw badRequest('Gói này không đổi được trực tuyến. Hãy liên hệ tư vấn.');
  const cycle: BillingCycle = body.cycle === 'year' ? 'year' : 'month';
  return { plan, seats: clampSeats(plan, Number(body.seats)), cycle };
}

function describeChange(context: RequestContext, change: ChangeRequest) {
  const data = context.org();
  const current = requireCurrentPlan(context);
  const subscription = context.session.subscription!;
  const used = seatsInUse(data);
  const currentSeats = subscription.seatLimit ?? 1;
  const currentAmount = priceFor(current, currentSeats, cycleOf(data)) ?? 0;
  const newAmount = priceFor(change.plan, change.seats, change.cycle) ?? 0;

  const next = entitlementKeys(change.plan);
  const label = (key: string) => ENTITLEMENT_LABELS[key as Entitlement] ?? key;
  const blockers: string[] = [];
  if (used > change.seats) blockers.push(`Tổ chức đang dùng ${used} ghế, nhiều hơn ${change.seats} ghế của gói mới. Hãy vô hiệu hóa bớt thành viên hoặc chọn thêm ghế.`);

  const isUpgrade = newAmount > currentAmount;
  return {
    direction: change.plan.code === current.code && change.seats === currentSeats && change.cycle === cycleOf(data) ? 'same' : isUpgrade ? 'upgrade' : 'downgrade',
    allowed: blockers.length === 0,
    blockers,
    gained: next.filter((key) => !subscription.entitlements.includes(key)).map(label),
    lost: subscription.entitlements.filter((key) => !next.includes(key)).map(label),
    seatsUsed: used,
    currentAmount,
    newAmount,
    difference: newAmount - currentAmount,
    effective: isUpgrade ? 'NOW' : 'NEXT_PERIOD',
    note: isUpgrade
      ? 'Gói mới có hiệu lực ngay; phần chênh lệch được tính theo thời gian còn lại của chu kỳ.'
      : 'Gói mới có hiệu lực từ chu kỳ tiếp theo. Dữ liệu vẫn được giữ; tính năng không còn trong gói sẽ ngừng dùng được.',
  };
}

route('POST', '/subscription/preview', (context) => describeChange(context, parseChange(context.body)), OWNER_ONLY);

route('POST', '/subscription/change', (context) => {
  const change = parseChange(context.body);
  const impact = describeChange(context, change);
  if (!impact.allowed) throw conflict(impact.blockers[0]);
  if (impact.direction === 'same') throw badRequest('Bạn đang dùng đúng gói này.');

  const previous = requireCurrentPlan(context);
  return context.update((data) => {
    data.subscriptionOverride = { planCode: change.plan.code, seats: change.seats, cycle: change.cycle, status: 'active', cancelAtPeriodEnd: false };
    const registered = getDb().organizations.find((org) => org.id === data.organizationId);
    if (registered) {
      const renews = new Date();
      renews.setMonth(renews.getMonth() + (change.cycle === 'year' ? 12 : 1));
      updateDb((db) => {
        const owner = db.users.find((u) => u.id === registered.ownerId);
        if (owner) {
          owner.subscription = {
            planCode: change.plan.code, planName: change.plan.name, status: 'active', entitlements: entitlementKeys(change.plan),
            seatLimit: change.seats, renewsAt: renews.toISOString().slice(0, 10),
          };
        }
      });
    }
    recordAudit(data, context.session, 'SUBSCRIPTION_CHANGED', 'Gói dịch vụ', change.plan.name, `${previous.name} → ${change.plan.name}, ${change.seats} ghế`);
    return impact;
  });
}, { ...OWNER_ONLY, message: 'Đã đổi gói dịch vụ.' });

route('POST', '/subscription/cancel', (context) => {
  const plan = requireCurrentPlan(context);
  return context.update((data) => {
    const subscription = context.session.subscription!;
    data.subscriptionOverride = {
      planCode: plan.code, seats: subscription.seatLimit ?? 1, cycle: cycleOf(data), status: 'active', cancelAtPeriodEnd: true,
    };
    recordAudit(data, context.session, 'SUBSCRIPTION_CANCEL_SCHEDULED', 'Gói dịch vụ', plan.name, 'Hủy vào cuối chu kỳ');
    return { cancelAtPeriodEnd: true, renewsAt: subscription.renewsAt };
  });
}, { ...OWNER_ONLY, message: 'Gói sẽ ngừng gia hạn vào cuối chu kỳ.' });

route('POST', '/subscription/resume', (context) => {
  const plan = requireCurrentPlan(context);
  return context.update((data) => {
    if (data.subscriptionOverride) data.subscriptionOverride.cancelAtPeriodEnd = false;
    recordAudit(data, context.session, 'SUBSCRIPTION_RESUMED', 'Gói dịch vụ', plan.name);
    return { cancelAtPeriodEnd: false };
  });
}, { ...OWNER_ONLY, message: 'Đã bật lại gia hạn.' });
