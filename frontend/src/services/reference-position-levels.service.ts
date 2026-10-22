import apiClient from './api-client';
import type { ApiResponse } from '../types/api';

export interface ReferencePositionLevels {
  version: number;
  levels: Record<string, number[]>;
}

export const referencePositionLevelsService = {
  get: () => apiClient.get<ApiResponse<ReferencePositionLevels>>('/reference-positions/levels'),
  update: (data: ReferencePositionLevels) =>
    apiClient.put<ApiResponse<ReferencePositionLevels>>('/reference-positions/levels', data),
};
