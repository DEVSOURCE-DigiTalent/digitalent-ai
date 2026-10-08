import apiClient from './api-client';
import { USE_MOCK } from './mock/mock-config';
import { lazyAdapter } from './lazy-adapter';
import type { PlanSelection, PurchaseDraft } from '../types/commerce';
import type { ApiResponse } from '../types/api';

type PurchaseService = typeof import('./mock/mock-purchase.service').mockPurchaseService;

const loadMock = () =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-purchase.service').then((module) => module.mockPurchaseService)
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

const apiPurchaseService: PurchaseService = {
  getMyDraft: async () => {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/individual/purchase-drafts/active');
      const draft = res.data?.data;
      if (!draft) return { data: { success: true, message: '', data: null, errors: [] } };
      const mapped: PurchaseDraft = {
        id: draft.id,
        userId: null,
        audience: 'individual',
        planCode: draft.planCode,
        seats: 1,
        cycle: draft.cycle?.toLowerCase() === 'year' ? 'year' : 'month',
        amount: draft.amount,
        currency: 'VND',
        status: draft.status,
        createdAt: draft.createdAt,
        expiresAt: draft.expiresAt,
      };
      return { data: { success: true, message: '', data: mapped, errors: [] } };
    } catch {
      return { data: { success: true, message: '', data: null, errors: [] } };
    }
  },

  getDraft: async (id: string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/individual/purchase-drafts/${id}`);
    const draft = res.data.data;
    const mapped: PurchaseDraft = {
      id: draft.id,
      userId: null,
      audience: 'individual',
      planCode: draft.planCode,
      seats: 1,
      cycle: draft.cycle?.toLowerCase() === 'year' ? 'year' : 'month',
      amount: draft.amount,
      currency: 'VND',
      status: draft.status,
      createdAt: draft.createdAt,
      expiresAt: draft.expiresAt,
    };
    return { data: { success: true, message: '', data: mapped, errors: [] } };
  },

  createDraft: async (selection: PlanSelection, _audience: 'enterprise' | 'individual') => {
    const res = await apiClient.post<ApiResponse<any>>('/individual/purchase-drafts', {
      planCode: selection.planCode,
      cycle: selection.cycle === 'year' ? 'YEAR' : 'MONTH',
    });
    const draft = res.data.data;
    const mapped: PurchaseDraft = {
      id: draft.id,
      userId: null,
      audience: 'individual',
      planCode: draft.planCode,
      seats: selection.seats,
      cycle: selection.cycle,
      amount: draft.amount,
      currency: 'VND',
      status: draft.status,
      createdAt: draft.createdAt,
      expiresAt: draft.expiresAt,
    };
    return { data: { success: true, message: '', data: mapped, errors: [] } };
  },

  updateDraft: async (id: string, selection: PlanSelection) => {
    const res = await apiClient.put<ApiResponse<any>>(`/individual/purchase-drafts/${id}`, {
      planCode: selection.planCode,
      cycle: selection.cycle === 'year' ? 'YEAR' : 'MONTH',
    });
    const draft = res.data.data;
    const mapped: PurchaseDraft = {
      id: draft.id,
      userId: null,
      audience: 'individual',
      planCode: draft.planCode,
      seats: selection.seats,
      cycle: selection.cycle,
      amount: draft.amount,
      currency: 'VND',
      status: draft.status,
      createdAt: draft.createdAt,
      expiresAt: draft.expiresAt,
    };
    return { data: { success: true, message: '', data: mapped, errors: [] } };
  },

  cancelDraft: async (id: string) => {
    await apiClient.post(`/individual/purchase-drafts/${id}/cancel`);
    return { data: { success: true, message: '', data: { cancelled: true }, errors: [] } };
  },
};

export const purchaseService: PurchaseService = USE_MOCK
  ? lazyAdapter(loadMock)
  : apiPurchaseService;
