import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { behaviorReportService } from '../services/behavior-report.service';

export const BEHAVIOR_REPORTS_KEY = ['behavior-reports'];

/** Khi AI còn đang phân tích, hỏi lại sau chừng này. */
const ANALYZING_POLL_MS = 4000;

/**
 * Bài cuối khóa của mọi nhân viên, gom theo người (Khoảng trống năng lực, OW-21); tự làm mới khi còn bài AI đang phân
 * tích. enabled = người dùng có quyền behavior_report.read.
 */
export function useBehaviorOverview(enabled = true) {
  return useQuery({
    queryKey: [...BEHAVIOR_REPORTS_KEY, 'overview'],
    queryFn: behaviorReportService.overview,
    enabled,
    refetchInterval: (query) => ((query.state.data?.counts.analyzing ?? 0) > 0 ? ANALYZING_POLL_MS : false),
  });
}

/** Một báo cáo; tự làm mới tới khi AI phân tích xong. */
export function useBehaviorReport(reportId: string | undefined) {
  return useQuery({
    queryKey: [...BEHAVIOR_REPORTS_KEY, 'detail', reportId],
    queryFn: () => behaviorReportService.get(reportId!),
    enabled: Boolean(reportId),
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? ANALYZING_POLL_MS : false),
  });
}

/** Yêu cầu AI phân tích lại; báo cáo về PENDING và trang tự hỏi lại kết quả. */
export function useAnalyzeBehaviorReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => behaviorReportService.analyze(reportId),
    onSuccess: () => qc.invalidateQueries({ queryKey: BEHAVIOR_REPORTS_KEY }),
  });
}
