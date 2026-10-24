import { ScanFace } from 'lucide-react';
import type { PulseFaceCheck, PulseProctoringRisk, PulseRiskMoment } from '@/services/pulse.service';
import { PROCTORING_EVENT_LABELS, RISK_LEVEL_LABELS, clock, formatDuration } from '@/features/pulse-employee/lib/labels';

const FACE_CHECK_TEXT: Record<PulseFaceCheck, string | null> = {
  ON: 'Nhận diện khuôn mặt chạy trên máy nhân viên suốt bài làm.',
  PARTIAL: 'Nhận diện khuôn mặt chỉ chạy một phần bài làm — phần còn lại chưa được kiểm tra khuôn mặt.',
  OFF: 'Máy của nhân viên không chạy được nhận diện khuôn mặt — điểm chỉ dựa trên nhật ký tab, màn hình, camera và micro.',
  NONE: null,
};

/** Nhãn ngắn mức rủi ro (thẻ bài trong hàng chờ, đầu trình phát). */
export function RiskTag({ risk }: { risk: PulseProctoringRisk }) {
  return (
    <span className={`pu-risk-tag ${risk.level.toLowerCase()}`} title={`Điểm rủi ro gian lận ${risk.score}/100`}>
      {RISK_LEVEL_LABELS[risk.level]} · {risk.score}
    </span>
  );
}

function momentLabel(moment: PulseRiskMoment) {
  return moment.kinds.map((kind) => PROCTORING_EVENT_LABELS[kind]).join(' · ');
}

/**
 * Phân tích rủi ro gian lận của một phiên (MG-13): điểm 0–100 do máy chủ tổng hợp từ nhật ký giám sát, các yếu tố đóng góp và
 * các điểm đáng ngờ. Bấm một điểm để tua bản ghi tới trước điểm đó 2 giây. Chỉ để biết nên xem đoạn nào — quyết định vẫn
 * là của người chấm.
 */
export function ProctoringRiskPanel({ risk, t, onSeek }: { risk: PulseProctoringRisk; t: number; onSeek: (ms: number) => void }) {
  const faceText = FACE_CHECK_TEXT[risk.faceCheck];
  return (
    <section className={`pu-risk ${risk.level.toLowerCase()}`} aria-label="Phân tích rủi ro gian lận">
      <div className="pu-risk-score">
        <div className="pu-risk-gauge" style={{ ['--risk' as string]: `${risk.score}%` }} aria-hidden>
          <b>{risk.score}</b>
        </div>
        <div>
          <strong>{RISK_LEVEL_LABELS[risk.level]}</strong>
          <p>
            {risk.moments.length
              ? `${risk.moments.length} điểm đáng ngờ — bấm để tua bản ghi tới đúng đoạn.`
              : 'Không có điểm đáng ngờ trong nhật ký giám sát.'}
          </p>
        </div>
      </div>

      {risk.factors.length > 0 && (
        <ul className="pu-risk-factors" aria-label="Yếu tố đóng góp">
          {risk.factors.map((factor) => (
            <li key={factor.kind}>
              <span>{PROCTORING_EVENT_LABELS[factor.kind]}</span>
              <small>
                {factor.count} lần{factor.totalMs >= 1000 ? ` · ${formatDuration(factor.totalMs)}` : ''}
              </small>
              <b>+{factor.points}</b>
            </li>
          ))}
        </ul>
      )}

      {risk.moments.length > 0 && (
        <ol className="pu-risk-moments" aria-label="Điểm đáng ngờ">
          {risk.moments.map((moment) => {
            const current = t >= moment.startMs - 2000 && t < moment.endMs;
            return (
              <li key={moment.startMs}>
                <button
                  type="button"
                  className={moment.severity.toLowerCase()}
                  aria-current={current ? 'true' : undefined}
                  onClick={() => onSeek(moment.startMs - 2000)}
                >
                  <time>{clock(moment.startMs)}</time>
                  <span className="text">
                    {momentLabel(moment)}
                    <small>
                      {formatDuration(Math.max(1000, moment.endMs - moment.startMs))}
                      {moment.eventCount > 1 ? ` · ${moment.eventCount} sự kiện` : ''}
                    </small>
                  </span>
                  <b>+{moment.points}</b>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {faceText && (
        <p className="pu-risk-note">
          <ScanFace size={15} aria-hidden />
          {faceText} Hình camera không được gửi đi chỉ để phân tích; điểm chỉ để gợi ý đoạn cần xem, không tự đánh trượt bài.
        </p>
      )}
    </section>
  );
}
