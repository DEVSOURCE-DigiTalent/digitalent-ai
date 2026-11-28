import { useCallback, useMemo, useRef, useState } from 'react';
import { LoaderCircle, RefreshCw, ShieldAlert, ShieldCheck, ShieldQuestionMark, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useAnalyzeBehaviorReport, useBehaviorReport } from '@/hooks/use-behavior-reports';
import type { BehaviorReportDetail } from '@/services/behavior-report.service';
import type { PulseProctoringEvent } from '@/services/pulse.service';
import { PROCTORING_EVENT_LABELS, clock, eventDetailText, formatDuration } from '@/features/pulse-employee/lib/labels';
import { RecordingPlayer, type RecordingPlayerHandle } from '@/features/pulse-manager/components/RecordingPlayer';
import { BehaviorTimeline } from './BehaviorTimeline';
import { EvidenceList, MomentList } from './EvidenceList';
import { AI_ERROR_TEXT, LEVEL_TEXT, TIER_TEXT, facts, findingAt, pastedShare, timelineTotal } from '../lib/behavior';
import '@/features/pulse-employee/pulse-exam.css';

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

/**
 * Xem lại một bài cuối khóa (trong bảng nhân viên của Khoảng trống năng lực): kết luận của AI, các con số đáng nói, rồi
 * video bên cạnh bằng chứng — dòng thời gian, thẻ bằng chứng và video cùng một đồng hồ: bấm chỗ nào thì video tua tới đó.
 */
export function BehaviorReplay({ reportId }: { reportId: string }) {
  useUiLanguage();
  const report = useBehaviorReport(reportId);
  if (report.isLoading) return <div className="br-skeleton" role="status" aria-label={translateUi('Đang tải bài thi')} />;
  if (report.isError || !report.data) return <p className="br-error">{translateUi('Không tải được bài thi này.')}</p>;
  return <ReplayView key={reportId} report={report.data} />;
}

function ReplayView({ report }: { report: BehaviorReportDetail }) {
  const player = useRef<RecordingPlayerHandle>(null);
  const [t, setT] = useState(0);
  const total = useMemo(() => timelineTotal(report), [report]);
  const events = useMemo(() => report.recording?.events ?? report.findings.flatMap((f) => f.events), [report]);
  const hasVideo = (report.recording?.segments ?? []).some((s) => s.contentPath);
  const active = findingAt(report.findings, t);

  const seek = useCallback((ms: number) => {
    const at = Math.max(0, Math.min(total, ms));
    setT(at);
    player.current?.play(at);
  }, [total]);

  const course = [report.domainName, report.tier ? TIER_TEXT[report.tier] : null].filter(Boolean).join(' · ');
  return (
    <div className="br-replay">
      <header className="br-replay__head">
        <div>
          {course && <small className="br-replay__domain" data-domain={report.domainNumber ?? undefined}>{translateUi(course)}</small>}
          <h3>{report.courseTitle}</h3>
          <p>
            <span>{translateUi('Lần')} {report.attemptNo}</span>
            <span>{translateUi('nộp')} {dateTime(report.submittedAt)}</span>
            <span>{translateUi('làm bài')} {formatDuration(report.durationMs)}</span>
          </p>
        </div>
        <Verdict report={report} />
      </header>

      <AiBand report={report} />

      <div className="br-grid">
        <div className="br-grid__main">
          <section className="br-card br-video" aria-label={translateUi('Xem lại bài làm')}>
            {report.recording && hasVideo ? (
              <RecordingPlayer
                recording={report.recording}
                handleRef={player}
                onTimeChange={setT}
                parts={{ lanes: false, marks: false, risk: false, log: false }}
                title={translateUi('Xem lại bài làm')}
              />
            ) : (
              <p className="br-novideo">{translateUi('Bài này không có bản ghi video để xem lại. Dòng thời gian và bằng chứng vẫn dựa trên nhật ký giám sát.')}</p>
            )}
          </section>
          <BehaviorTimeline findings={report.findings} events={events} totalMs={total} t={t} activeFinding={active} onSeek={seek} />
        </div>

        <div className="br-grid__side">
          <section className="br-card" aria-labelledby={`br-evidence-${report.reportId}`}>
            <div className="br-card__head">
              <h4 id={`br-evidence-${report.reportId}`}>{translateUi('Bằng chứng')}</h4>
              <small>{report.findings.length > 0 ? translateUi('Theo AI') : translateUi('Theo nhật ký')}</small>
            </div>
            {report.findings.length > 0 ? (
              <EvidenceList findings={report.findings} active={active} onSeek={seek} />
            ) : report.risk.moments.length > 0 ? (
              <MomentList moments={report.risk.moments} onSeek={seek} />
            ) : (
              <p className="br-muted">{translateUi('Không có đoạn nào cần xem.')}</p>
            )}
          </section>
          {report.essayText && <Essay report={report} />}
        </div>
      </div>

      {events.length > 0 && <EventLog report={report} events={events} onSeek={seek} />}
    </div>
  );
}

const VERDICT_ICON = { HIGH: ShieldAlert, MEDIUM: ShieldQuestionMark, LOW: ShieldCheck } as const;

/**
 * Mức kết luận: của AI khi có, không thì của nhật ký. Điểm nhật ký là điểm rủi ro (0 = không có dấu hiệu), nên chỉ ghi
 * ở dòng phụ kèm mức của nó, không đặt thành con số lớn dễ bị đọc như điểm bài thi.
 */
function Verdict({ report }: { report: BehaviorReportDetail }) {
  const Icon = VERDICT_ICON[report.level];
  const ruleLevel = LEVEL_TEXT[report.riskLevel].toLocaleLowerCase('vi');
  return (
    <div className={`br-verdict ${report.level.toLowerCase()}`}>
      <span className="br-verdict__icon" aria-hidden><Icon size={24} /></span>
      <div>
        <strong>{translateUi(LEVEL_TEXT[report.level])}</strong>
        <small>
          {report.aiLevel ? translateUi('Kết luận của AI') : translateUi('Theo nhật ký giám sát')}
          {' · '}{translateUi(`điểm rủi ro theo nhật ký ${report.riskScore}/100 (${ruleLevel})`)}
        </small>
      </div>
    </div>
  );
}

function AiBand({ report }: { report: BehaviorReportDetail }) {
  const { can } = usePermission();
  const analyze = useAnalyzeBehaviorReport();
  const list = facts(report.stats);
  const pending = report.status === 'PENDING' || analyze.isPending;
  const canAnalyze = can(PERMISSIONS.BEHAVIOR_REPORT_ANALYZE);

  const run = () =>
    analyze.mutate(report.reportId, {
      onSuccess: () => toast.success(translateUi('AI đang phân tích lại báo cáo.')),
      onError: () => toast.error(translateUi('Chưa gửi được yêu cầu phân tích lại.')),
    });

  return (
    <section className={`br-band ${report.level.toLowerCase()}`} aria-label={translateUi('Nhận định của AI')}>
      <div className="br-band__text">
        {pending ? (
          <p className="br-band__busy"><LoaderCircle size={16} aria-hidden className="br-spin" /> {translateUi('AI đang phân tích nhật ký giám sát…')}</p>
        ) : report.summary ? (
          <>
            <p className="br-band__summary"><Sparkles size={15} aria-hidden /> {report.summary}</p>
            {report.advice && <p className="br-band__advice">{report.advice}</p>}
          </>
        ) : (
          <p className="br-band__summary">{translateUi(AI_ERROR_TEXT[report.errorCode ?? ''] ?? 'AI chưa phân tích báo cáo này.')}</p>
        )}
        {!pending && report.summary && report.errorCode && (
          <p className="br-band__note">{translateUi('Lần phân tích lại gần nhất chưa thành công, đang hiện kết quả trước.')}</p>
        )}
        {list.length > 0 && (
          <ul className="br-facts">
            {list.map((fact) => <li key={fact.id} data-tone={fact.tone}>{translateUi(fact.text)}</li>)}
          </ul>
        )}
      </div>
      <div className="br-band__side">
        {report.analyzedAt && !pending && (
          <small>{translateUi('AI phân tích')} {dateTime(report.analyzedAt)}</small>
        )}
        {canAnalyze && (
          <button type="button" className="br-btn" onClick={run} disabled={pending}>
            <RefreshCw size={14} aria-hidden /> {translateUi(report.summary ? 'Phân tích lại' : 'Phân tích bằng AI')}
          </button>
        )}
      </div>
    </section>
  );
}

function Essay({ report }: { report: BehaviorReportDetail }) {
  const share = pastedShare(report.stats);
  return (
    <details className="br-card br-essay">
      <summary>
        <span>{translateUi('Bài tự luận đã nộp')}</span>
        <small>{report.stats.essayChars.toLocaleString('vi-VN')} {translateUi('ký tự')}</small>
      </summary>
      {share != null && share > 0 && (
        <div className="br-essay__meter">
          <span style={{ width: `${share}%` }} />
          <small>{translateUi(`Khoảng ${share}% số ký tự là chữ dán vào`)}</small>
        </div>
      )}
      <p className="br-essay__text">{report.essayText}</p>
    </details>
  );
}

function EventLog({ report, events, onSeek }: { report: BehaviorReportDetail; events: PulseProctoringEvent[]; onSeek: (ms: number) => void }) {
  const shown = events.filter((e) => e.kind !== 'FACE_CHECK_ON');
  return (
    <details className="br-card br-log">
      <summary>
        <span>{translateUi('Toàn bộ nhật ký giám sát')}</span>
        <small>{shown.length} {translateUi('sự kiện')}{report.eventsTruncated ? ` · ${translateUi('AI chỉ đọc các sự kiện đáng chú ý')}` : ''}</small>
      </summary>
      <ol>
        {shown.map((event, index) => {
          const detail = eventDetailText(event);
          return (
            <li key={`${event.kind}-${event.offsetMs}-${index}`} data-flagged={event.flagged ? 'true' : undefined}>
              <button type="button" onClick={() => onSeek(event.offsetMs - 2000)}>
                <time>{clock(event.offsetMs)}</time>
                <span>
                  {translateUi(PROCTORING_EVENT_LABELS[event.kind])}
                  {event.durationMs ? ` · ${formatDuration(event.durationMs)}` : ''}
                  {detail ? ` · ${detail}` : ''}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
