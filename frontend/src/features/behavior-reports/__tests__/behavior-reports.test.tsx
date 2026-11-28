import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { BehaviorReportDetail, BehaviorReportItem } from '@/services/behavior-report.service';
import type { PulseProctoringEvent, PulseProctoringEventKind } from '@/services/pulse.service';
import { clipboardDetail, eventDetailText } from '@/features/pulse-employee/lib/labels';
import { axisTicks, eventSeverity, facts, findingAt, laneMarks, pastedShare, primaryReport, reportsByDomain, worstLevel } from '../lib/behavior';
import { BehaviorReplay } from '../components/BehaviorReplay';

const MINUTE = 60_000;
const ev = (kind: PulseProctoringEventKind, offsetMs: number, durationMs: number | null = null, detail: string | null = null): PulseProctoringEvent =>
  ({ kind, offsetMs, durationMs, detail, flagged: kind !== 'STARTED' && kind !== 'SUBMITTED' && kind !== 'SHARE_RESUMED' });

const detailHook = vi.fn();
const analyze = vi.fn();
vi.mock('@/hooks/use-behavior-reports', () => ({
  useBehaviorReport: (id: string) => detailHook(id),
  useAnalyzeBehaviorReport: () => ({ mutate: analyze, isPending: false }),
}));
vi.mock('@/hooks/use-permission', async (original) => ({
  ...(await original<typeof import('@/hooks/use-permission')>()),
  usePermission: () => ({ can: () => true, is: () => false, user: null }),
}));

afterEach(cleanup);

describe('behavior report helpers', () => {
  it('reads the clipboard note and tells a large paste from a small one', () => {
    expect(clipboardDetail('ESSAY:640')).toEqual({ place: 'ESSAY', chars: 640 });
    expect(clipboardDetail('hello')).toBeNull();
    expect(eventDetailText(ev('PASTE', 0, null, 'ESSAY:1200'))).toBe('1.200 ký tự vào ô tự luận');
    expect(eventDetailText(ev('COPY', 0, null, 'QUESTION:80'))).toBe('80 ký tự từ đề bài');
    expect(eventDetailText(ev('SECOND_SCREEN', 0, null, 'EXTENDED'))).toBeNull();
    expect(eventSeverity(ev('PASTE', 0, null, 'ESSAY:640'))).toBe('HIGH');
    expect(eventSeverity(ev('PASTE', 0, null, 'ESSAY:40'))).toBe('MEDIUM');
    expect(eventSeverity(ev('IDLE', 0, 90_000))).toBe('LOW');
  });

  it('puts each event on its lane and stretches a lost source until it comes back', () => {
    const lanes = laneMarks([
      ev('STARTED', 0),
      ev('TAB_HIDDEN', 40_000, 45_000),
      ev('CAMERA_STOPPED', 2 * MINUTE),
      ev('CAMERA_RESUMED', 3 * MINUTE),
      ev('MIC_STOPPED', 9 * MINUTE),
      ev('PASTE', 90_000, null, 'ESSAY:640'),
    ], 10 * MINUTE);
    expect(lanes.away.map((m) => [m.startMs, m.endMs])).toEqual([[40_000, 85_000]]);
    expect(lanes.device.map((m) => [m.event.kind, m.startMs, m.endMs])).toEqual([
      ['CAMERA_STOPPED', 2 * MINUTE, 3 * MINUTE],
      ['MIC_STOPPED', 9 * MINUTE, 10 * MINUTE],
    ]);
    expect(lanes.input[0]).toMatchObject({ startMs: 90_000, endMs: 90_000, severity: 'HIGH' });
    expect(lanes.face).toEqual([]);
  });

  it('chooses round axis steps, finds the finding under the playhead and lists only what happened', () => {
    expect(axisTicks(18 * MINUTE)).toEqual([0, 5, 10, 15].map((m) => m * MINUTE));
    expect(axisTicks(90_000)).toEqual([0, 15_000, 30_000, 45_000, 60_000, 75_000, 90_000]);
    expect(findingAt([{ startMs: 10_000, endMs: 20_000 }, { startMs: 60_000, endMs: 61_000 }], 8_500)).toBe(0);
    expect(findingAt([{ startMs: 10_000, endMs: 20_000 }], 40_000)).toBe(-1);

    const stats = {
      attemptNo: 1, essayChars: 660, pasteCount: 1, pastedChars: 612, pastedIntoEssayChars: 612, largePasteCount: 1, copyCount: 1,
      awayCount: 2, awayMs: 83_000, idleMs: 0, faceAlertCount: 0, faceAlertMs: 0, sourceLossCount: 0, secondScreen: true,
      choiceScore: 17, choiceTotal: 20,
    };
    expect(pastedShare(stats)).toBe(93);
    expect(facts(stats).map((f) => [f.id, f.tone, f.text])).toEqual([
      ['paste', 'bad', 'Dán 612 ký tự · 93% bài tự luận'],
      ['away', 'bad', 'Rời bài 2 lần · 1 phút 23 giây'],
      ['screen', 'warn', 'Có màn hình phụ'],
      ['copy', 'plain', 'Sao chép 1 lần'],
      ['choice', 'plain', 'Trắc nghiệm 17/20'],
    ]);
  });

  it('opens the worst, most recent final first and groups finals by domain', () => {
    const item = (id: string, level: 'HIGH' | 'MEDIUM' | 'LOW', domainNumber: number | null) => ({ reportId: id, level, domainNumber }) as BehaviorReportItem;
    const reports = [item('new-low', 'LOW', 1), item('new-medium', 'MEDIUM', 2), item('old-medium', 'MEDIUM', 2), item('none', 'LOW', null)];
    expect(worstLevel(reports)).toBe('MEDIUM');
    expect(worstLevel([])).toBe('LOW');
    expect(primaryReport(reports)?.reportId).toBe('new-medium');
    expect([...reportsByDomain(reports).entries()].map(([n, list]) => [n, list.map((r) => r.reportId)])).toEqual([
      [1, ['new-low']],
      [2, ['new-medium', 'old-medium']],
    ]);
  });
});

const mai: PulseProctoringEvent[] = [
  ev('STARTED', 0),
  ev('SECOND_SCREEN', 2_000, null, 'EXTENDED'),
  ev('COPY', 3 * MINUTE + 12_000, null, 'QUESTION:186'),
  ev('TAB_HIDDEN', 3 * MINUTE + 20_000, 74_000),
  ev('PASTE', 4 * MINUTE + 40_000, null, 'ESSAY:612'),
  ev('SUBMITTED', 18 * MINUTE),
];
const detail: BehaviorReportDetail = {
  reportId: 'br-1', sessionId: 's1', employeeId: 'e1', employeeName: 'Trần Thị Mai', positionName: 'Marketing', departmentName: 'Marketing',
  courseId: 'c1', courseCode: 'M1-I', courseTitle: 'Khai thác dữ liệu số', domainNumber: 1, domainName: 'Dữ liệu và thông tin số', tier: 2,
  attemptNo: 1, submittedAt: '2026-11-25T09:42:00Z', durationMs: 18 * MINUTE, status: 'READY', riskScore: 62, riskLevel: 'HIGH', aiLevel: 'HIGH',
  level: 'HIGH', findingCount: 1, decision: null, marks: [{ startMs: 3 * MINUTE, endMs: 5 * MINUTE, severity: 'HIGH' }],
  stats: {
    attemptNo: 1, essayChars: 660, pasteCount: 1, pastedChars: 612, pastedIntoEssayChars: 612, largePasteCount: 1, copyCount: 1,
    awayCount: 1, awayMs: 74_000, idleMs: 0, faceAlertCount: 0, faceAlertMs: 0, sourceLossCount: 0, secondScreen: true, choiceScore: 17, choiceTotal: 20,
  },
  risk: { score: 62, level: 'HIGH', faceCheck: 'ON', factors: [], moments: [] },
  findings: [{
    startMs: 3 * MINUTE + 12_000, endMs: 4 * MINUTE + 40_000, severity: 'HIGH', title: 'Sao chép đề, rời tab rồi dán gần hết bài',
    explanation: 'Chuỗi sao chép → rời tab → dán.', events: [mai[2]!, mai[3]!, mai[4]!],
  }],
  summary: 'Nhân viên sao chép đề, rời tab rồi dán 612 ký tự.',
  advice: 'Xem đoạn 03:12–04:45.',
  model: 'gemini-test', analyzedAt: '2026-11-25T09:43:00Z', errorCode: null, eventsTruncated: false,
  essayText: 'Bài làm.',
  recording: {
    sessionId: 's1', kind: 'FINAL', status: 'SUBMITTED', startedAt: '2026-11-25T09:24:00Z', durationMs: 18 * MINUTE,
    flaggedCount: 4, segments: [], events: mai,
  },
};

describe('replaying one final', () => {
  beforeEach(() => {
    detailHook.mockReturnValue({ data: detail, isLoading: false, isError: false });
    analyze.mockReset();
  });

  it('shows the verdict, the facts and the evidence; seeking to a finding lights it on the timeline', () => {
    render(<BehaviorReplay reportId="br-1" />);

    expect(detailHook).toHaveBeenCalledWith('br-1');
    expect(screen.getByText('Dữ liệu và thông tin số · Trung cấp')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Khai thác dữ liệu số' })).toBeTruthy();
    expect(screen.getByText('Nhân viên sao chép đề, rời tab rồi dán 612 ký tự.')).toBeTruthy();
    expect(screen.getByText('Dán 612 ký tự · 93% bài tự luận')).toBeTruthy();
    // the log score is a risk score, said in words beside its level, never a big number read like a grade
    expect(screen.getByText('Kết luận của AI · điểm rủi ro theo nhật ký 62/100 (rủi ro cao)')).toBeTruthy();
    expect(screen.getByText('Bài này không có bản ghi video để xem lại. Dòng thời gian và bằng chứng vẫn dựa trên nhật ký giám sát.')).toBeTruthy();

    const card = screen.getByRole('heading', { level: 5, name: 'Sao chép đề, rời tab rồi dán gần hết bài' }).closest('li')!;
    expect(within(card).getByText('186 ký tự từ đề bài', { exact: false })).toBeTruthy();
    const timelineFinding = screen.getByRole('button', { name: /^1\. Sao chép đề/ });
    expect(timelineFinding.getAttribute('aria-current')).toBeNull();
    fireEvent.click(within(card).getByRole('button', { name: /Xem đoạn 03:12–04:40/ }));
    expect(timelineFinding.getAttribute('aria-current')).toBe('true');
    expect(card.getAttribute('aria-current')).toBe('true');
  });

  it('asks the AI to analyze again', () => {
    render(<BehaviorReplay reportId="br-1" />);
    fireEvent.click(screen.getByRole('button', { name: /Phân tích lại/ }));
    expect(analyze).toHaveBeenCalledWith('br-1', expect.anything());
  });
});
