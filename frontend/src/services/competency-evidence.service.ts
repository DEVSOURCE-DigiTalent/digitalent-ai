import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

/** Khớp UseCases/Competency/Evidence/CreateManualEvidence (spec Sprint 3 §6.3). */
export interface CreateManualEvidenceRequest {
  employeeId: string;
  competencyId: string;
  /** 1 = Basic, 2 = Intermediate, 3 = Advanced */
  confirmedLevel: number;
  reviewNote: string;
}

export interface CreateManualEvidenceResult {
  evidenceId: string;
  employeeId: string;
  competencyId: string;
  previousLevel: number | null;
  confirmedLevel: number;
  supersededEvidenceId: string | null;
}

/** Competency evidence API — api/v1/competency-evidences. */
export const competencyEvidenceService = {
  createManual: (data: CreateManualEvidenceRequest) =>
    apiClient.post<ApiResponse<CreateManualEvidenceResult>>('/competency-evidences/manual', data),
};
