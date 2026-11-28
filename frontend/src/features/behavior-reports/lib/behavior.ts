import type { BehaviorFinding, BehaviorReportDetail, BehaviorReportItem, BehaviorStats } from '@/services/behavior-report.service';
import type { PulseProctoringEvent, PulseProctoringEventKind, PulseRiskLevel } from '@/services/pulse.service';
import { clipboardDetail, formatDuration } from '@/features/pulse-employee/lib/labels';

/**
 * Pure helpers of exam behavior on Khoảng trống năng lực (OW-21): timeline lanes, event severities, the facts line and
 * the grouping of a person's course finals by domain.
 * The severities mirror the backend rule weights (PulseProctoringRisk) so the timeline and the score tell the same story.
 */

/** Dán từ chừng này ký tự là dán dài (giống backend PulseProctoringRisk.LargePasteChars). */
export const LARGE_PASTE_CHARS = 200;

export const LEVEL_ORDER: PulseRiskLevel[] = ['HIGH', 'MEDIUM', 'LOW'];

/** Tên mức cho chủ doanh nghiệp. */
export const LEVEL_TEXT: Record<PulseRiskLevel, string> = {
  HIGH: 'Rủi ro cao',
  MEDIUM: 'Cần xem lại',
  LOW: 'Bình thường',
};

/** Cấp của khóa. */
export const TIER_TEXT: Record<number, string> = { 1: 'Cơ bản', 2: 'Trung cấp', 3: 'Nâng cao' };

/** Tên ngắn của 6 lĩnh vực TT02 (như trang Khoảng trống năng lực). */
export const DOMAIN_SHORT = ['Dữ liệu', 'Giao tiếp', 'Sáng tạo', 'An toàn', 'Giải quyết vấn đề', 'Trí tuệ nhân tạo'];

const rank = (level: PulseRiskLevel) => 2 - LEVEL_ORDER.indexOf(level);

/** Mức nặng nhất của các bài (LOW khi không có bài). */
export function worstLevel(reports: Pick<BehaviorReportItem, 'level'>[]): PulseRiskLevel {
  return reports.reduce<PulseRiskLevel>((worst, r) => (rank(r.level) > rank(worst) ? r.level : worst), 'LOW');
}

/** Bài nên mở trước: bài nặng nhất, cùng mức thì bài mới nộp nhất (danh sách đã xếp mới trước). */
export function primaryReport<T extends Pick<BehaviorReportItem, 'level'>>(reports: T[]): T | undefined {
  const worst = worstLevel(reports);
  return reports.find((r) => r.level === worst);
}

/** Các bài của từng lĩnh vực (theo số lĩnh vực), mới nộp trước. */
export function reportsByDomain<T extends Pick<BehaviorReportItem, 'domainNumber'>>(reports: T[]): Map<number, T[]> {
  const map = new Map<number, T[]>();
  for (const report of reports) {
    if (report.domainNumber == null) continue;
    map.set(report.domainNumber, [...(map.get(report.domainNumber) ?? []), report]);
  }
  return map;
}

export type LaneId = 'away' | 'face' | 'input' | 'device';

export interface Lane {
  id: LaneId;
  label: string;
  kinds: PulseProctoringEventKind[];
}

/** Các làn của dòng thời gian, mỗi làn một nhóm hành vi. */
export const LANES: Lane[] = [
  { id: 'away', label: 'Rời bài làm', kinds: ['TAB_HIDDEN', 'FOCUS_LOST'] },
  { id: 'face', label: 'Khuôn mặt', kinds: ['FACE_MISSING', 'MULTIPLE_FACES', 'LOOKING_AWAY'] },
  { id: 'input', label: 'Sao chép, dán', kinds: ['COPY', 'PASTE', 'IDLE'] },
  { id: 'device', label: 'Thiết bị', kinds: ['SHARE_STOPPED', 'CAMERA_STOPPED', 'MIC_STOPPED', 'SECOND_SCREEN', 'FACE_CHECK_OFF'] },
];

const RESUMED_BY: Partial<Record<PulseProctoringEventKind, PulseProctoringEventKind>> = {
  SHARE_STOPPED: 'SHARE_RESUMED',
  CAMERA_STOPPED: 'CAMERA_RESUMED',
  MIC_STOPPED: 'MIC_RESUMED',
};

const HIGH_KINDS: PulseProctoringEventKind[] = ['MULTIPLE_FACES', 'SHARE_STOPPED', 'CAMERA_STOPPED'];
const MEDIUM_KINDS: PulseProctoringEventKind[] = ['TAB_HIDDEN', 'FACE_MISSING', 'MIC_STOPPED', 'PASTE', 'SECOND_SCREEN'];

/** Mức nặng của một sự kiện (dán dài nặng như nhiều người trước camera). */
export function eventSeverity(event: Pick<PulseProctoringEvent, 'kind' | 'detail'>): PulseRiskLevel {
  if (event.kind === 'PASTE' && (clipboardDetail(event.detail)?.chars ?? 0) >= LARGE_PASTE_CHARS) return 'HIGH';
  if (HIGH_KINDS.includes(event.kind)) return 'HIGH';
  if (MEDIUM_KINDS.includes(event.kind)) return 'MEDIUM';
  return 'LOW';
}

export interface LaneMark {
  startMs: number;
  endMs: number;
  severity: PulseRiskLevel;
  event: PulseProctoringEvent;
}

/**
 * Sự kiện của từng làn trên đồng hồ phiên. Mất nguồn ghi kéo tới lần bật lại (hoặc hết phiên); sự kiện tức thời giữ
 * nguyên mốc (endMs = startMs).
 */
export function laneMarks(events: PulseProctoringEvent[], totalMs: number): Record<LaneId, LaneMark[]> {
  const ordered = [...events].sort((a, b) => a.offsetMs - b.offsetMs);
  const result: Record<LaneId, LaneMark[]> = { away: [], face: [], input: [], device: [] };
  ordered.forEach((event, index) => {
    const lane = LANES.find((l) => l.kinds.includes(event.kind));
    if (!lane) return;
    let end = event.offsetMs + (event.durationMs ?? 0);
    const resumed = RESUMED_BY[event.kind];
    if (resumed && event.durationMs == null) {
      end = ordered.slice(index + 1).find((e) => e.kind === resumed)?.offsetMs ?? totalMs;
    }
    result[lane.id].push({ startMs: event.offsetMs, endMs: Math.min(Math.max(end, event.offsetMs), totalMs), severity: eventSeverity(event), event });
  });
  return result;
}

/** Độ dài của trục: phiên, đoạn ghi, sự kiện và phát hiện dài nhất. */
export function timelineTotal(report: Pick<BehaviorReportDetail, 'durationMs' | 'findings' | 'recording'>): number {
  const recording = report.recording;
  return Math.max(
    1000,
    report.durationMs,
    recording?.durationMs ?? 0,
    ...(recording?.segments ?? []).map((s) => s.endOffsetMs ?? s.startOffsetMs),
    ...(recording?.events ?? []).map((e) => e.offsetMs + (e.durationMs ?? 0)),
    ...report.findings.map((f) => f.endMs),
  );
}

/** Mốc chia trục: khoảng tròn (30 giây, 1, 2, 5, 10… phút) sao cho có khoảng 4–8 mốc. */
export function axisTicks(totalMs: number): number[] {
  const steps = [15_000, 30_000, 60_000, 120_000, 300_000, 600_000, 900_000, 1_800_000, 3_600_000];
  const step = steps.find((s) => totalMs / s <= 8) ?? steps[steps.length - 1]!;
  const ticks: number[] = [];
  for (let at = 0; at <= totalMs; at += step) ticks.push(at);
  return ticks;
}

/** Phát hiện chứa mốc t (tính cả 2 giây trước, vì tua tới trước mốc 2 giây); -1 khi không có. */
export function findingAt(findings: Pick<BehaviorFinding, 'startMs' | 'endMs'>[], t: number): number {
  return findings.findIndex((f) => t >= f.startMs - 2000 && t <= f.endMs + 1000);
}

/** Phần trăm bài tự luận là chữ dán vào (0–100), null khi bài trống. */
export function pastedShare(stats: Pick<BehaviorStats, 'essayChars' | 'pastedIntoEssayChars'>): number | null {
  if (stats.essayChars <= 0) return null;
  return Math.min(100, Math.round((stats.pastedIntoEssayChars / stats.essayChars) * 100));
}

export interface Fact {
  id: string;
  text: string;
  tone: 'bad' | 'warn' | 'plain';
}

/** Các con số đáng nói của lần làm bài; chỉ những gì có xảy ra. */
export function facts(stats: BehaviorStats): Fact[] {
  const list: Fact[] = [];
  const share = pastedShare(stats);
  if (stats.pasteCount > 0) {
    list.push({
      id: 'paste',
      text: stats.pastedIntoEssayChars > 0 && share != null
        ? `Dán ${stats.pastedIntoEssayChars.toLocaleString('vi-VN')} ký tự · ${share}% bài tự luận`
        : `Dán ${stats.pastedChars.toLocaleString('vi-VN')} ký tự`,
      tone: stats.largePasteCount > 0 || (share ?? 0) >= 50 ? 'bad' : 'warn',
    });
  }
  if (stats.awayCount > 0) {
    list.push({ id: 'away', text: `Rời bài ${stats.awayCount} lần · ${formatDuration(stats.awayMs)}`, tone: stats.awayMs >= 60_000 ? 'bad' : 'warn' });
  }
  if (stats.faceAlertCount > 0) {
    list.push({ id: 'face', text: `Khuôn mặt bất thường ${stats.faceAlertCount} lần · ${formatDuration(stats.faceAlertMs)}`, tone: 'warn' });
  }
  if (stats.secondScreen) list.push({ id: 'screen', text: 'Có màn hình phụ', tone: 'warn' });
  if (stats.sourceLossCount > 0) list.push({ id: 'source', text: `Mất nguồn ghi ${stats.sourceLossCount} lần`, tone: 'bad' });
  if (stats.copyCount > 0) list.push({ id: 'copy', text: `Sao chép ${stats.copyCount} lần`, tone: 'plain' });
  if (stats.idleMs > 0) list.push({ id: 'idle', text: `Không thao tác ${formatDuration(stats.idleMs)}`, tone: 'plain' });
  if (stats.choiceTotal) list.push({ id: 'choice', text: `Trắc nghiệm ${stats.choiceScore ?? 0}/${stats.choiceTotal}`, tone: 'plain' });
  return list;
}

/** Nút "Phân tích lại" / lời nhắn theo mã lỗi của AI. */
export const AI_ERROR_TEXT: Record<string, string> = {
  AI_NOT_CONFIGURED: 'Máy chủ chưa có khóa AI, báo cáo mới có phần tổng hợp từ nhật ký.',
  AI_UNAVAILABLE: 'AI chưa trả lời được (quá tải hoặc lỗi mạng).',
  AI_INVALID_ANSWER: 'AI trả lời không đúng định dạng.',
};

/** "Nguyễn Văn An" → "VA". */
export const initials = (name: string) =>
  name.trim().split(/\s+/).slice(-2).map((word) => word[0]?.toLocaleUpperCase('vi') ?? '').join('');
