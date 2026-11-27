import apiClient from './api-client';
import type { ApiResponse } from '@/types/api';
import type { PulseProctoringEvent, PulseProctoringRisk, PulseRecording, PulseRiskLevel } from './pulse.service';

/**
 * Báo cáo hành vi khi làm bài cuối khóa (api/v1/behavior-reports, quyền behavior_report.read / analyze; canonical v3.10):
 * lập khi nhân viên nộp bài, AI phân tích nhật ký giám sát ở nền. Xem trong Khoảng trống năng lực (OW-21), cạnh mức
 * năng lực của từng nhân viên.
 */

/** PENDING: AI đang phân tích · READY: đã có kết luận AI · FAILED: AI không phân tích được (vẫn có phần tổng hợp từ nhật ký). */
export type BehaviorReportStatus = 'PENDING' | 'READY' | 'FAILED';
export type BehaviorErrorCode = 'AI_NOT_CONFIGURED' | 'AI_UNAVAILABLE' | 'AI_INVALID_ANSWER';

/** Một vạch trên dải thời gian thu nhỏ của danh sách. */
export interface BehaviorMark {
  startMs: number;
  endMs: number;
  severity: PulseRiskLevel;
}

export interface BehaviorReportItem {
  reportId: string;
  sessionId: string;
  employeeId: string;
  employeeName: string;
  departmentName?: string | null;
  positionName?: string | null;
  courseId?: string | null;
  courseCode?: string | null;
  courseTitle?: string | null;
  /** Lĩnh vực TT02 của khóa (1–6, như domains[].number của khoảng trống năng lực) và cấp của khóa (1–3). */
  domainNumber?: number | null;
  domainName?: string | null;
  tier?: number | null;
  attemptNo: number;
  submittedAt: string;
  durationMs: number;
  status: BehaviorReportStatus;
  /** Điểm tổng hợp từ nhật ký theo luật cố định (0–100). */
  riskScore: number;
  riskLevel: PulseRiskLevel;
  /** Kết luận của AI; null khi chưa có. */
  aiLevel?: PulseRiskLevel | null;
  /** Mức hiển thị: kết luận AI khi có, không thì mức tổng hợp từ nhật ký. */
  level: PulseRiskLevel;
  summary?: string | null;
  findingCount: number;
  /** Tiêu đề các phát hiện của AI, nặng nhất trước (tối đa 3). */
  findingTitles?: string[];
  /** Kết quả chấm bài cuối khóa: null = đang chờ chấm. */
  decision?: 'PASSED' | 'NOT_YET' | null;
  marks: BehaviorMark[];
}

export interface BehaviorReportCounts {
  all: number;
  high: number;
  medium: number;
  low: number;
  analyzing: number;
  /** Số người có bài rủi ro cao. */
  peopleHigh: number;
}

/** Các bài cuối khóa của một nhân viên (mới nộp trước) và mức nặng nhất. */
export interface BehaviorEmployee {
  employeeId: string;
  level: PulseRiskLevel;
  high: number;
  medium: number;
  low: number;
  analyzing: number;
  reports: BehaviorReportItem[];
}

export interface BehaviorOverview {
  counts: BehaviorReportCounts;
  /** Mức nặng nhất trước. */
  employees: BehaviorEmployee[];
}

export interface BehaviorStats {
  attemptNo: number;
  essayChars: number;
  pasteCount: number;
  pastedChars: number;
  pastedIntoEssayChars: number;
  largePasteCount: number;
  copyCount: number;
  awayCount: number;
  awayMs: number;
  idleMs: number;
  faceAlertCount: number;
  faceAlertMs: number;
  sourceLossCount: number;
  secondScreen: boolean;
  choiceScore?: number | null;
  choiceTotal?: number | null;
}

/** Một phát hiện của AI: khoảng thời gian lấy từ chính các sự kiện làm bằng chứng. */
export interface BehaviorFinding {
  startMs: number;
  endMs: number;
  severity: PulseRiskLevel;
  title: string;
  explanation: string;
  events: PulseProctoringEvent[];
}

export interface BehaviorReportDetail extends BehaviorReportItem {
  stats: BehaviorStats;
  risk: PulseProctoringRisk;
  findings: BehaviorFinding[];
  advice?: string | null;
  model?: string | null;
  analyzedAt?: string | null;
  errorCode?: BehaviorErrorCode | null;
  eventsTruncated: boolean;
  essayText?: string | null;
  recording?: PulseRecording | null;
}

export const behaviorReportService = {
  overview: () => apiClient.get<ApiResponse<BehaviorOverview>>('/behavior-reports').then((r) => r.data.data!),
  get: (reportId: string) =>
    apiClient.get<ApiResponse<BehaviorReportDetail>>(`/behavior-reports/${reportId}`).then((r) => r.data.data!),
  analyze: (reportId: string) =>
    apiClient
      .post<ApiResponse<{ reportId: string; status: BehaviorReportStatus }>>(`/behavior-reports/${reportId}/analyze`)
      .then((r) => r.data.data!),
};
