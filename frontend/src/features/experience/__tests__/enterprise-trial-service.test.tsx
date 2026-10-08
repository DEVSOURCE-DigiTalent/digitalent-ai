import { describe, expect, it, vi } from 'vitest';
import apiClient from '@/services/api-client';
import { apiEnterpriseTrialService as service, mockEnterpriseTrialService } from '@/services/enterprise-trial.service';

vi.mock('@/services/api-client', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));

describe('enterprise trial API transport', () => {
  it('offers identical methods in mock and API adapters', () => {
    expect(Object.keys(mockEnterpriseTrialService).sort()).toEqual(Object.keys(service).sort());
  });
  it('resends using the real authenticated API transport', () => {
    service.resendInvitation('invite');
    expect(apiClient.post).toHaveBeenCalledWith('/enterprise-trial/invitations/invite/resend', undefined, expect.objectContaining({ adapter: expect.any(Function) }));
  });
  it('fetches learning content using the real API transport', () => {
    service.pathContent('lesson');
    expect(apiClient.get).toHaveBeenCalledWith('/enterprise-trial/path/items/lesson/content', expect.objectContaining({ adapter: expect.any(Function) }));
  });
});
