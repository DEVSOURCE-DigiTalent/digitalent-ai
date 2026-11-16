import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  Info,
  ListChecks,
  Lock,
  RotateCcw,
  Target,
  XCircle,
  Zap,
} from 'lucide-react';
import type { PulseSkipTest } from '@/services/pulse.service';
import { pad2 } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';
import { SkipTestDialog } from './SkipTestDialog';
import { AttemptHistory, Banner } from './SkipTestParts';
import { stagger } from './skip-test-motion';

/** Màn giới thiệu & quy định trước khi làm (hoặc khi bài không làm được: khóa, không cần, chưa mở). */
export function SkipTestIntro({ courseId, test, starting, startError, onStart }: {
  courseId: string;
  test: PulseSkipTest;
  starting: boolean;
  startError: string | null;
  onStart: () => void;
}) {
  const canStart = test.status === 'AVAILABLE';
  const passed = test.status === 'PASSED';
  const single = test.maxAttempts === 1;
  // Bấm bắt đầu là tính giờ và dùng mất lượt, nên hỏi lại trước.
  const [confirming, setConfirming] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="pu-sk-view">
      <section className="pu-sk-card pu-sk-intro" aria-labelledby="pu-sk-intro-title">
        <header className="pu-sk-intro-head pu-sk-rise" style={stagger(0)}>
          <span className="pu-sk-kicker pill">
            <Zap size={13} aria-hidden="true" />
            {test.course.preStatus === 'REQUIRED' ? 'Bắt buộc trước khi học' : 'Vượt quá trình học'}
          </span>
          <h1 id="pu-sk-intro-title">Kiểm tra đầu vào</h1>
          <p className="pu-sk-lead">
            Bài trắc nghiệm tổng hợp nội dung {pad2(test.moduleCount)} mô-đun của khóa, chấm tự động ngay khi nộp — không có
            phần tự luận, không cần camera và không chờ người chấm.
          </p>
        </header>

        <ul className="pu-sk-facts" aria-label="Quy định bài kiểm tra">
          <Fact index={1} icon={<ListChecks size={18} />} value={`${test.questionCount} câu`} caption={`trắc nghiệm từ ${pad2(test.moduleCount)} mô-đun`} />
          <Fact index={2} icon={<Clock size={18} />} value={`${test.timeLimitMinutes} phút`} caption="hết giờ bài tự nộp" />
          <Fact
            index={3}
            icon={<Target size={18} />}
            value={`${test.passMark}/${test.questionCount} câu`}
            caption={`Đạt khi đúng từ ${test.passPercent}% số câu`}
          />
          <Fact
            index={4}
            icon={single ? <Lock size={18} /> : <RotateCcw size={18} />}
            value={single ? '1 lần duy nhất' : `${test.maxAttempts} lần làm`}
            caption={single ? 'không làm lại, không sửa sau khi nộp' : `còn ${test.attemptsLeft} lần, mỗi lần một đề khác`}
            tone={single ? 'warn' : undefined}
          />
        </ul>

        {canStart && (
          <div className="pu-sk-outcomes pu-sk-rise" style={stagger(5)}>
            <h2 className="pu-sk-section-title">Sau khi nộp bài</h2>
            <div className="pu-sk-outcome-grid">
              <div className="pu-sk-outcome tone-ok">
                <span className="pu-sk-outcome-icon" aria-hidden="true"><GraduationCap size={18} /></span>
                <div>
                  <strong>Đạt từ {test.passPercent}%</strong>
                  <p>Mọi mô-đun được tính là hoàn thành, bài đánh giá cuối khóa mở ngay.</p>
                </div>
              </div>
              <div className="pu-sk-outcome tone-mid">
                <span className="pu-sk-outcome-icon" aria-hidden="true"><BookOpen size={18} /></span>
                <div>
                  <strong>Chưa đạt</strong>
                  <p>Học tuần tự từng mô-đun; kết quả gợi ý các mô-đun cần tập trung.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="pu-sk-note pu-sk-rise" style={stagger(6)}>
          <Info size={15} aria-hidden="true" />
          <span>
            Bài kiểm tra đầu vào không công nhận khóa học: bạn vẫn cần làm bài đánh giá cuối khóa để hoàn thành khóa. Kết quả
            chỉ cho biết số câu đúng theo từng mô-đun, không hiển thị đáp án.
          </span>
        </p>

        {test.message && (
          <Banner tone={passed ? 'ok' : 'warn'} icon={passed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}>
            {test.message}
          </Banner>
        )}
        {startError && !confirming && <Banner tone="bad" icon={<XCircle size={16} />} alert>{startError}</Banner>}

        <div className="pu-sk-actions pu-sk-rise" style={stagger(7)}>
          {canStart && (
            <button type="button" className="pu-sk-btn primary lg" onClick={() => setConfirming(true)}>
              <Zap size={16} aria-hidden="true" />
              <span>{test.attemptsUsed > 0 ? 'Làm lại bài kiểm tra' : 'Bắt đầu làm bài'}</span>
            </button>
          )}
          {passed && (
            <Link to={PULSE_PATHS.final(courseId)} className="pu-sk-btn primary lg">
              <GraduationCap size={16} aria-hidden="true" />
              <span>Làm bài đánh giá cuối khóa</span>
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          )}
          <Link to={PULSE_PATHS.course(courseId)} className={`pu-sk-btn ${canStart || passed ? 'ghost' : 'primary'} lg`}>
            Quay lại khóa học
          </Link>
        </div>
      </section>

      {test.results.length > 0 && <AttemptHistory results={test.results} />}

      <SkipTestDialog
        open={canStart && confirming}
        tone="warn"
        icon={<Clock size={22} />}
        title="Bắt đầu tính giờ?"
        onDismiss={starting ? undefined : () => setConfirming(false)}
        initialFocusRef={cancelRef}
        actions={
          <>
            <button ref={cancelRef} type="button" className="pu-sk-btn ghost" onClick={() => setConfirming(false)} disabled={starting}>
              Để sau
            </button>
            <button type="button" className="pu-sk-btn primary" onClick={onStart} disabled={starting} aria-busy={starting}>
              {starting && <span className="pu-sk-spinner" aria-hidden="true" />}
              <span>{starting ? 'Đang chuẩn bị đề…' : 'Bắt đầu ngay'}</span>
            </button>
          </>
        }
      >
        <p>
          {single
            ? `Bạn chỉ có một lần làm. Khi bắt đầu, ${test.timeLimitMinutes} phút được tính ngay; thoát giữa chừng vẫn tính là đã làm và không thể làm lại.`
            : `Khi bắt đầu, ${test.timeLimitMinutes} phút được tính ngay và lần làm này được tính vào số lần của bạn.`}
        </p>
        <ul className="pu-sk-dialog-list">
          <li>{test.questionCount} câu, mỗi câu chọn một đáp án; chuyển câu tự do.</li>
          <li>Lựa chọn được lưu trên trình duyệt này khi tải lại trang.</li>
          <li>Hết giờ, bài được nộp tự động với các câu đã chọn.</li>
        </ul>
        {startError && <p className="pu-sk-dialog-error" role="alert">{startError}</p>}
      </SkipTestDialog>
    </div>
  );
}

function Fact({ index, icon, value, caption, tone }: { index: number; icon: ReactNode; value: string; caption: string; tone?: 'warn' }) {
  return (
    <li className={`pu-sk-fact pu-sk-rise${tone ? ` tone-${tone}` : ''}`} style={stagger(index)}>
      <span className="pu-sk-fact-icon" aria-hidden="true">{icon}</span>
      <b>{value}</b>
      <span>{caption}</span>
    </li>
  );
}
