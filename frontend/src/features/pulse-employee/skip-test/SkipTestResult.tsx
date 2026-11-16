import { useEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, CheckCircle2, ChevronRight, GraduationCap, RotateCcw, XCircle } from 'lucide-react';
import type { PulseSkipTest, PulseSkipTestResult } from '@/services/pulse.service';
import { PULSE_PATHS } from '../lib/paths';
import { AttemptHistory, Banner, ModuleBreakdown } from './SkipTestParts';
import { attemptDuration, prefersReducedMotion, stagger, useCountUp } from './skip-test-motion';

/**
 * Kết quả bài kiểm tra đầu vào: vòng điểm chạy tới số câu đúng (vạch = ngưỡng đạt), số liệu, kết quả theo mô-đun và bước
 * tiếp theo. `fresh` = vừa nộp xong (đưa tiêu điểm vào tiêu đề, bắn pháo giấy khi đạt); không fresh = mở lại trang sau đó.
 */
export function SkipTestResult({ courseId, test, result, fresh, finalUnlocked, onRetry, retrying, retryError }: {
  courseId: string;
  test: PulseSkipTest;
  result: PulseSkipTestResult;
  fresh: boolean;
  finalUnlocked: boolean;
  onRetry: () => void;
  retrying: boolean;
  retryError: string | null;
}) {
  const passed = result.passed;
  const canRetry = !passed && test.status === 'AVAILABLE' && test.attemptsLeft > 0;
  const tone = passed ? 'ok' : 'bad';
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const duration = attemptDuration(result);
  const missing = Math.max(0, result.passMark - result.score);
  const olderResults = test.results.filter((r) => r.attemptNo !== result.attemptNo);
  const moduleCount = result.modules.length;

  // Vừa nộp: trang đang cuộn theo bài làm, đưa kết quả lên đầu và đặt tiêu điểm vào tiêu đề cho trình đọc màn hình.
  useEffect(() => {
    if (!fresh) return;
    sectionRef.current?.scrollIntoView?.({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    headingRef.current?.focus({ preventScroll: true });
  }, [fresh]);

  const title = passed
    ? 'Chúc mừng! Bạn được bỏ qua phần học'
    : result.expired
    ? 'Bài nộp quá giờ'
    : 'Chưa đạt bài kiểm tra đầu vào';

  const description = passed
    ? finalUnlocked
      ? 'Toàn bộ mô-đun đã được tính là hoàn thành. Bài đánh giá cuối khóa có giám sát đã mở — hoàn thành bài này để được công nhận khóa học.'
      : 'Toàn bộ mô-đun đã được tính là hoàn thành.'
    : canRetry
    ? `Bạn còn ${test.attemptsLeft} lần làm với bộ câu hỏi khác, hoặc học tuần tự các mô-đun để mở bài đánh giá cuối khóa.`
    : 'Các mô-đun đã mở để bạn học tuần tự; học xong sẽ mở bài đánh giá cuối khóa. Gợi ý: bắt đầu từ các mô-đun gắn nhãn "Cần ôn" bên dưới.';

  return (
    <div className="pu-sk-view">
      <section ref={sectionRef} className={`pu-sk-card pu-sk-result tone-${tone}`} aria-labelledby="pu-sk-result-title">
        <div className="pu-sk-result-hero">
          <ScoreRing score={result.score} total={result.total} passMark={result.passMark} tone={tone} celebrate={fresh && passed} />
          <span className={`pu-sk-status tone-${tone} pu-sk-rise`} style={stagger(2)}>
            {passed ? <CheckCircle2 size={14} aria-hidden="true" /> : <XCircle size={14} aria-hidden="true" />}
            {passed ? 'Đạt' : result.expired ? 'Quá giờ' : 'Chưa đạt'}
            {!passed && missing > 0 && <span className="pu-sk-status-note">· thiếu {missing} câu</span>}
          </span>
          <h1 id="pu-sk-result-title" ref={headingRef} tabIndex={-1} className="pu-sk-rise" style={stagger(3)}>
            {title}
          </h1>
          <p className="pu-sk-result-lead pu-sk-rise" style={stagger(4)}>{description}</p>
        </div>

        <dl className="pu-sk-stats pu-sk-rise" style={stagger(5)}>
          <div>
            <dt>Câu đúng</dt>
            <dd>{result.score}<small>/{result.total}</small></dd>
          </div>
          <div>
            <dt>Tỉ lệ đúng</dt>
            <dd>{Math.round(result.percent)}<small>%</small></dd>
          </div>
          <div>
            <dt>Ngưỡng đạt</dt>
            <dd>{result.passMark}<small> câu · {test.passPercent}%</small></dd>
          </div>
          <div>
            <dt>Thời gian làm</dt>
            <dd>{duration ?? '—'}</dd>
          </div>
        </dl>

        {!fresh && test.message && (
          <Banner tone={passed ? 'ok' : 'warn'} icon={passed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}>
            {test.message}
          </Banner>
        )}

        <ModuleBreakdown result={result} startOrder={6} />

        {retryError && <Banner tone="bad" icon={<XCircle size={16} />} alert>{retryError}</Banner>}

        <div className="pu-sk-actions center pu-sk-rise" style={stagger(Math.min(7 + moduleCount, 14))}>
          {passed ? (
            <Link to={PULSE_PATHS.final(courseId)} className="pu-sk-btn primary lg">
              <GraduationCap size={16} aria-hidden="true" />
              <span>Làm bài đánh giá cuối khóa</span>
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          ) : canRetry ? (
            <button type="button" className="pu-sk-btn primary lg" onClick={onRetry} disabled={retrying} aria-busy={retrying}>
              {retrying ? <span className="pu-sk-spinner" aria-hidden="true" /> : <RotateCcw size={16} aria-hidden="true" />}
              <span>{retrying ? 'Đang chuẩn bị đề…' : 'Làm lại với đề mới'}</span>
            </button>
          ) : (
            <Link to={PULSE_PATHS.course(courseId)} className="pu-sk-btn primary lg">
              <BookOpen size={16} aria-hidden="true" />
              <span>Bắt đầu học các mô-đun</span>
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          )}
          {(passed || canRetry) && (
            <Link to={PULSE_PATHS.course(courseId)} className="pu-sk-btn ghost lg">
              Quay lại khóa học
            </Link>
          )}
        </div>
      </section>

      {olderResults.length > 0 && <AttemptHistory results={olderResults} order={Math.min(8 + moduleCount, 16)} />}
    </div>
  );
}

const RING_R = 54;
const RING_C = 2 * Math.PI * RING_R;

function ScoreRing({ score, total, passMark, tone, celebrate }: {
  score: number;
  total: number;
  passMark: number;
  tone: 'ok' | 'bad';
  celebrate: boolean;
}) {
  const shown = useCountUp(score, 1100, 250);
  const ratio = total > 0 ? Math.min(1, score / total) : 0;
  const markAngle = total > 0 ? (Math.min(passMark, total) / total) * 360 : 0;
  return (
    <div className={`pu-sk-ring tone-${tone}`}>
      {celebrate && <Burst />}
      <svg viewBox="0 0 128 128" aria-hidden="true">
        <circle className="track" cx="64" cy="64" r={RING_R} />
        {ratio > 0 && (
          <circle
            className="arc"
            cx="64"
            cy="64"
            r={RING_R}
            transform="rotate(-90 64 64)"
            strokeDasharray={RING_C}
            style={{ '--c': RING_C, '--off': RING_C * (1 - ratio) } as CSSProperties}
          />
        )}
        <g className="mark" transform={`rotate(${markAngle} 64 64)`}>
          <line x1="64" y1={64 - RING_R - 9} x2="64" y2={64 - RING_R + 9} />
        </g>
      </svg>
      <div className="pu-sk-ring-read" aria-hidden="true">
        <b>{Math.round(shown)}<small>/{total}</small></b>
        <span>câu đúng</span>
      </div>
      <span className="pu-sk-sr">{score} trên {total} câu đúng, cần {passMark} câu để đạt.</span>
    </div>
  );
}

const BURST_COLORS = ['#3341c4', '#1f8a5b', '#f0a530', '#e9826d'];
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  angle: i * 20 + (i % 2 ? 7 : -5),
  distance: 92 + (i % 3) * 16,
  color: BURST_COLORS[i % BURST_COLORS.length]!,
  scale: i % 3 === 0 ? 1 : 0.72,
  delay: 520 + (i % 4) * 40,
}));

/** Pháo giấy một lần quanh vòng điểm khi vừa đạt (ẩn khi giảm chuyển động). */
function Burst() {
  return (
    <span className="pu-sk-burst" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <i
          key={i}
          style={{ '--a': `${p.angle}deg`, '--r': `${p.distance}px`, '--pc': p.color, '--s': p.scale, '--pd': `${p.delay}ms` } as CSSProperties}
        />
      ))}
    </span>
  );
}
