import type { CSSProperties, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PulseSkipTestResult } from '@/services/pulse.service';
import { formatDateTime } from '@/lib/utils';
import { pad2 } from '../lib/labels';
import { stagger } from './skip-test-motion';

type Level = 'ok' | 'mid' | 'bad';

const LEVEL_LABEL: Record<Level, string> = { ok: 'Vững', mid: 'Khá', bad: 'Cần ôn' };

const levelOf = (ratio: number): Level => (ratio >= 0.8 ? 'ok' : ratio >= 0.5 ? 'mid' : 'bad');

export function Banner({ tone, icon, alert, children }: {
  tone: 'ok' | 'warn' | 'bad' | 'info';
  icon: ReactNode;
  alert?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`pu-sk-banner tone-${tone}`} role={alert ? 'alert' : 'status'}>
      <span className="pu-sk-banner-icon" aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

/** Số câu đúng theo từng mô-đun (thanh chạy lần lượt), kèm nhãn Vững / Khá / Cần ôn. */
export function ModuleBreakdown({ result, heading = true, startOrder = 0 }: {
  result: PulseSkipTestResult;
  heading?: boolean;
  startOrder?: number;
}) {
  if (result.modules.length === 0) return null;
  return (
    <div className="pu-sk-modules">
      {heading && (
        <div className="pu-sk-modules-head pu-sk-rise" style={stagger(startOrder)}>
          <h2 className="pu-sk-section-title">Kết quả theo mô-đun</h2>
          <ul className="pu-sk-modules-legend" aria-hidden="true">
            <li><i className="ok" />Vững ≥ 80%</li>
            <li><i className="mid" />Khá ≥ 50%</li>
            <li><i className="bad" />Cần ôn</li>
          </ul>
        </div>
      )}
      <ul className="pu-sk-modlist" aria-label="Số câu đúng theo mô-đun">
        {result.modules.map((m, i) => {
          const ratio = m.total ? m.correct / m.total : 0;
          const level = levelOf(ratio);
          return (
            <li key={m.index} className={`pu-sk-mod tone-${level} pu-sk-rise`} style={stagger(startOrder + 1 + i)}>
              <span className="pu-sk-mod-idx" aria-hidden="true">{pad2(m.index + 1)}</span>
              <span className="pu-sk-mod-title" title={m.title}>
                <span className="pu-sk-sr">Mô-đun {pad2(m.index + 1)}: </span>
                {m.title}
              </span>
              <span className="pu-sk-mod-tag">{LEVEL_LABEL[level]}</span>
              <span className="pu-sk-mod-bar" aria-hidden="true">
                <i style={{ '--w': ratio } as CSSProperties} />
              </span>
              <b className="pu-sk-mod-score">
                {m.correct}<small>/{m.total}</small>
                <span className="pu-sk-sr"> câu đúng</span>
              </b>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Các lần đã làm (mới nhất trước), mỗi lần mở ra xem kết quả theo mô-đun. */
export function AttemptHistory({ results, order = 8 }: { results: PulseSkipTestResult[]; order?: number }) {
  const sorted = [...results].sort((a, b) => b.attemptNo - a.attemptNo);
  return (
    <section className="pu-sk-card pu-sk-history pu-sk-rise" style={stagger(order)} aria-labelledby="pu-sk-history-title">
      <h2 id="pu-sk-history-title" className="pu-sk-section-title">Các lần đã làm</h2>
      <ul className="pu-sk-attempts">
        {sorted.map((r) => (
          <li key={r.attemptNo}>
            <details className="pu-sk-attempt">
              <summary>
                <span className="pu-sk-attempt-no">Lần {r.attemptNo}</span>
                <span className={`pu-sk-pill tone-${r.passed ? 'ok' : 'bad'}`}>
                  {r.passed ? 'Đạt' : r.expired ? 'Quá giờ' : 'Chưa đạt'}
                </span>
                <b>{r.score}/{r.total} câu</b>
                <span className="pu-sk-attempt-at">{formatDateTime(r.submittedAt)}</span>
                <ChevronDown size={16} className="pu-sk-attempt-caret" aria-hidden="true" />
              </summary>
              <div className="pu-sk-attempt-body">
                <ModuleBreakdown result={r} heading={false} />
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
