import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type { BillingCycle, Plan } from '../lib/plans';

export interface Invoice {
  id: string;
  code: string;
  issuedAt: string;
  description: string;
  amount: number;
  status: 'PAID';
}

export interface SubscriptionDto {
  planCode: string;
  planName: string;
  status: 'active' | 'expired' | 'payment_required';
  cycle: BillingCycle;
  seatLimit?: number;
  seatsUsed: number;
  renewsAt?: string;
  cancelAtPeriodEnd: boolean;
  amountPerPeriod: number | null;
  entitlements: string[];
  invoices: Invoice[];
}

export interface UsageDto {
  planName: string;
  seats: { used: number; limit: number | null };
  storage: { usedMb: number; limitMb: number };
  members: { active: number; pending: number; inactive: number };
  features: { key: string; label: string; enabled: boolean }[];
}

export interface PlanOption extends Plan {
  current: boolean;
}

export interface PlanChangeRequest {
  planCode: string;
  seats: number;
  cycle: BillingCycle;
}

export interface PlanChangeImpact {
  direction: 'upgrade' | 'downgrade' | 'same';
  allowed: boolean;
  blockers: string[];
  gained: string[];
  lost: string[];
  seatsUsed: number;
  currentAmount: number;
  newAmount: number;
  difference: number;
  effective: 'NOW' | 'NEXT_PERIOD';
  note: string;
}

/** Plan, usage and plan changes of the organization (spec ADM-08 to ADM-10). Owner only, except usage. */
export const subscriptionService = {
  get: () => apiClient.get<ApiResponse<SubscriptionDto>>('/subscription'),
  getUsage: () => apiClient.get<ApiResponse<UsageDto>>('/subscription/usage'),
  getPlans: () => apiClient.get<ApiResponse<PlanOption[]>>('/subscription/plans'),
  previewChange: (data: PlanChangeRequest) => apiClient.post<ApiResponse<PlanChangeImpact>>('/subscription/preview', data),
  change: (data: PlanChangeRequest) => apiClient.post<ApiResponse<PlanChangeImpact>>('/subscription/change', data),
  cancel: () => apiClient.post<ApiResponse<{ cancelAtPeriodEnd: boolean }>>('/subscription/cancel'),
  resume: () => apiClient.post<ApiResponse<{ cancelAtPeriodEnd: boolean }>>('/subscription/resume'),
};
