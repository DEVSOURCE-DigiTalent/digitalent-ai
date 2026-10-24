/** Pure helpers for how assistant replies are shown (no React). */

/** Vietnamese labels for the record types / metrics the backend reports as sources. Unknown codes are not shown. */
const SOURCE_LABELS: Record<string, string> = {
  employees: 'Nhân viên',
  departments: 'Phòng ban',
  job_positions: 'Vị trí công việc',
  courses: 'Khóa học',
  enrollments: 'Tiến độ học tập',
  certificates: 'Chứng chỉ',
  tasks: 'Nhiệm vụ',
  competencies: 'Khung năng lực',
  competency_profiles: 'Hồ sơ năng lực',
  'analytics:headcount_by_department': 'Thống kê nhân sự',
  'analytics:learning_progress': 'Thống kê học tập',
  'analytics:course_completion': 'Tỉ lệ hoàn thành khóa học',
  'analytics:certificate_status': 'Thống kê chứng chỉ',
  'analytics:task_status': 'Thống kê nhiệm vụ',
  'analytics:competency_levels': 'Thống kê năng lực',
};

/** Friendly, de-duplicated source labels; technical codes without a label are dropped. */
export function sourceLabels(sources: string[] | undefined): string[] {
  const labels = (sources ?? []).map((s) => SOURCE_LABELS[s]).filter((s): s is string => Boolean(s));
  return [...new Set(labels)];
}

/** A trailing "_Nguồn: … · phạm vi: … · dữ liệu lúc …_" line (older prompt) — the widget shows sources itself. */
const SOURCE_LINE = /^\s*[_*]*\s*(nguồn|nguon)\s*:.*$/i;

export function cleanReply(text: string): string {
  const lines = text.trimEnd().split('\n');
  while (lines.length > 0 && (SOURCE_LINE.test(lines[lines.length - 1]) || lines[lines.length - 1].trim() === '')) {
    lines.pop();
  }
  return lines.join('\n');
}

export function formatTime(at: number | undefined): string {
  if (!at) return '';
  return new Date(at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
