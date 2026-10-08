import apiClient from './api-client';
import { USE_MOCK } from './mock/mock-config';
import { lazyAdapter } from './lazy-adapter';
import type { Order, OrderStatus, PaymentOutcome, PlanSelection } from '../types/commerce';
import type { ApiResponse } from '../types/api';

type CheckoutService = typeof import('./mock/mock-checkout.service').mockCheckoutService;

const loadMock = () =>
  import.meta.env.VITE_USE_MOCK === 'true'
    ? import('./mock/mock-checkout.service').then((module) => module.mockCheckoutService)
    : Promise.reject(new Error('Mock services are disabled (VITE_USE_MOCK is not true).'));

const apiCheckoutService: CheckoutService = {
  getPendingPlan: async () => {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/individual/purchase-drafts/active');
      const draft = res.data?.data;
      if (!draft) return { data: { success: true, message: '', data: null, errors: [] } };
      return {
        data: {
          success: true,
          message: '',
          data: {
            planCode: draft.planCode,
            seats: 1,
            cycle: draft.cycle?.toLowerCase() === 'year' ? 'year' : 'month',
          },
          errors: [],
        },
      };
    } catch {
      return { data: { success: true, message: '', data: null, errors: [] } };
    }
  },

  createOrder: async (selection: PlanSelection, draftId?: string) => {
    const res = await apiClient.post<ApiResponse<any>>('/individual/orders', {
      purchaseDraftId: draftId,
      paymentMethod: 'VIETQR',
    });
    const orderData = res.data.data;
    const mappedOrder: Order = {
      id: orderData.id,
      code: orderData.code,
      draftId: draftId,
      planCode: orderData.planCode,
      seats: selection.seats,
      cycle: orderData.cycle?.toLowerCase() === 'year' ? 'year' : 'month',
      amount: orderData.amount,
      status: (orderData.status?.toLowerCase() as OrderStatus) ?? 'pending',
      createdAt: orderData.createdAt,
      expiresAt: orderData.expiresAt,
    };
    return { data: { success: true, message: '', data: mappedOrder, errors: [] } };
  },

  getOrder: async (orderId: string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/individual/orders/${orderId}`);
    const orderData = res.data.data;
    const mappedOrder: Order = {
      id: orderData.id,
      code: orderData.code,
      planCode: orderData.planCode,
      seats: 1,
      cycle: orderData.cycle?.toLowerCase() === 'year' ? 'year' : 'month',
      amount: orderData.amount,
      status: (orderData.status?.toLowerCase() as OrderStatus) ?? 'pending',
      createdAt: orderData.createdAt,
      expiresAt: orderData.expiresAt,
    };
    return { data: { success: true, message: '', data: mappedOrder, errors: [] } };
  },

  confirmPayment: async (orderId: string, _outcome: PaymentOutcome) => {
    const res = await apiClient.get<ApiResponse<any>>(`/individual/orders/${orderId}`);
    const orderData = res.data.data;
    const mappedOrder: Order = {
      id: orderData.id,
      code: orderData.code,
      planCode: orderData.planCode,
      seats: 1,
      cycle: orderData.cycle?.toLowerCase() === 'year' ? 'year' : 'month',
      amount: orderData.amount,
      status: (orderData.status?.toLowerCase() as OrderStatus) ?? 'pending',
      createdAt: orderData.createdAt,
      expiresAt: orderData.expiresAt,
    };
    return { data: { success: true, message: '', data: mappedOrder, errors: [] } };
  },

  updateEmail: async (newEmail: string) => {
    const res = await apiClient.put<ApiResponse<any>>('/account/email', { email: newEmail });
    return { data: { success: true, message: '', data: res.data.data, errors: [] } };
  },
};

export const checkoutService: CheckoutService = USE_MOCK
  ? lazyAdapter(loadMock)
  : apiCheckoutService;
