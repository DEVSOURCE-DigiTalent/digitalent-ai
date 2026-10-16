import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ClipboardList, Paperclip, ScanEye, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePulsePractice } from '@/hooks/use-pulse';
import { useMyTasks, useSubmitMyTask, useUploadTaskAttachment } from '@/hooks/use-me';
import type { PulsePracticeItem } from '@/services/pulse.service';
import type { MyTaskCard, MyTaskFile } from '@/services/me.service';
import { formatDate, formatDateTime } from '@/lib/utils';
import { CriteriaRubric, FinalStatusPill } from '../components/blocks';
import { Empty, LoadError, Mini, Notice, PageHead, PageSkeleton, Pill, PuLink } from '../components/ui';
import { btn } from '../lib/button';
import { PRE_LABELS, SUPPORT_LABELS, levelName, pulseErrorMessage, timeLeft } from '../lib/labels';
import { PULSE_PATHS } from '../lib/paths';

/**
 * Bài làm: bài đánh giá trước khi học đã nộp, bài cuối của các khóa đang học (cả hai có giám sát) + nhánh minh chứng
 * thực tế riêng (§9.3, §12.1).
 */
export function PulsePracticePage() {
  const practice = usePulsePractice();
  const tasks = useMyTasks();

  return (
    <div className="pu-stack" style={{ gap: 26 }}>
      <PageHead
        eyebrow="Thực hành"
        title="Trình bày điều bạn đã học."
        description="Người chấm xem bài đánh giá trước khi học và bài cuối khóa cùng bản ghi màn hình, camera và micro. Gợi ý AI chỉ để tham khảo — người chấm đưa ra quyết định cuối cùng."
      />

      {practice.data && practice.data.preAssessments.length > 0 && (
        <section aria-labelledby="pu-pre-title">
          <div className="pu-section-head">
            <div>
              <Mini>Đánh giá trước khi học</Mini>
              <h2 id="pu-pre-title">Bài bạn làm trước khi vào khóa.</h2>
              <p>Đạt thì khóa được công nhận, không cần học. Chưa đạt thì học khóa rồi làm bài cuối khóa.</p>
            </div>
            <span className="pu-count">{practice.data.preAssessments.length} bài</span>
          </div>
          <div className="pu-final-list">
            {practice.data.preAssessments.map((item) => <PreAssessmentItem key={item.course.courseId} item={item} />)}
          </div>
        </section>
      )}

      <section aria-labelledby="pu-finals-title">
        <div className="pu-section-head">
          <div>
            <Mini>Bài cuối khóa</Mini>
            <h2 id="pu-finals-title">Mỗi khóa kết thúc bằng một bài làm thật.</h2>
            <p>Đạt câu hỏi ôn tập của mọi mô đun để mở bài cuối. Bài làm có giám sát, mỗi khóa tối đa hai lần nộp.</p>
          </div>
        </div>
        {practice.isLoading ? (
          <PageSkeleton blocks={[96, 96]} />
        ) : practice.error || !practice.data ? (
          <LoadError message={pulseErrorMessage(practice.error, 'Không tải được bài cuối khóa.')} onRetry={() => practice.refetch()} />
        ) : practice.data.finals.length === 0 ? (
          <Empty
            icon={<ClipboardList size={24} />}
            title="Chưa có bài cuối khóa nào"
            action={<PuLink to={PULSE_PATHS.path}>Chọn khóa trên lộ trình →</PuLink>}
          >
            Bài cuối khóa xuất hiện ở đây khi bạn bắt đầu một khóa trong lộ trình. Khóa Cơ bản mở miễn phí toàn bộ.
          </Empty>
        ) : (
          <div className="pu-final-list">
            {practice.data.finals.map((item) => <FinalItem key={item.course.courseId} item={item} />)}
          </div>
        )}
      </section>

      {practice.data && (
        <section className="pu-surface pu-pad">
          <Mini>Tiêu chí chung của bài cuối khóa</Mini>
          <h2 className="pu-panel-title">Ba điều quản lý sẽ kiểm tra.</h2>
          <CriteriaRubric criteria={practice.data.criteria} />
        </section>
      )}

      <section aria-labelledby="pu-tasks-title">
        <div className="pu-section-head">
          <div>
            <Mini>Một luồng minh chứng riêng</Mini>
            <h2 id="pu-tasks-title">Nhiệm vụ thực tế tại nơi làm việc</h2>
            <p>Nhiệm vụ thực tế xác nhận năng lực sau khi quản lý duyệt và không áp dụng quy tắc hai lần nộp của bài cuối khóa.</p>
          </div>
          {tasks.data && <span className="pu-count">{tasks.data.items.length} nhiệm vụ</span>}
        </div>
        {tasks.isLoading ? (
          <PageSkeleton blocks={[220]} />
        ) : tasks.error || !tasks.data ? (
          <LoadError message={pulseErrorMessage(tasks.error, 'Không tải được nhiệm vụ thực tế.')} onRetry={() => tasks.refetch()} />
        ) : tasks.data.items.length === 0 ? (
          <div className="pu-surface pu-pad"><p style={{ margin: 0 }}>Chưa có nhiệm vụ thực tế nào được giao cho vị trí của bạn. Bài cuối khóa vẫn sẵn sàng ở phía trên.</p></div>
        ) : (
          <div className="pu-stack">
            {tasks.data.items.map((task) => <TaskCard key={task.assignmentId} task={task} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function PreAssessmentItem({ item }: { item: PulsePracticeItem }) {
  const { course } = item;
  const status = course.preStatus;
  const detail = status === 'PENDING' ? `Đã nộp lúc ${formatDateTime(item.lastSubmittedAt)} — chờ chấm.`
    : status === 'PASSED' ? `Đạt${item.lastReviewedAt ? ` ngày ${formatDate(item.lastReviewedAt)}` : ''} — khóa được công nhận.`
    : status === 'NOT_YET' ? 'Chưa đạt — học khóa rồi làm bài cuối khóa.'
    : PRE_LABELS[status];
  const tone = status === 'PASSED' ? 'green' : status === 'NOT_YET' ? 'coral' : '';
  return (
    <Link to={PULSE_PATHS.preAssessment(course.courseId)} className="pu-final-item">
      <div className="pu-final-symbol" aria-hidden>{status === 'PASSED' ? <Check size={22} strokeWidth={3} /> : <ScanEye size={20} />}</div>
      <div>
        <h3>{course.title}</h3>
        <p>{course.domainName} · {levelName(course.tier)} · {detail}</p>
      </div>
      <Pill tone={tone}>{PRE_LABELS[status]}</Pill>
    </Link>
  );
}

function FinalItem({ item }: { item: PulsePracticeItem }) {
  const { course } = item;
  const detail = (() => {
    switch (course.finalStatus) {
      case 'READY': return `Đã qua ${course.modulesPassed}/${course.moduleCount} mô đun — sẵn sàng nộp.`;
      case 'LEARNING': return `Đã qua ${course.modulesPassed}/${course.moduleCount} mô đun.`;
      case 'PENDING': return `Đã nộp lần ${course.finalAttempts} lúc ${formatDateTime(item.lastSubmittedAt)} — chờ chấm.`;
      case 'RETRY_WAIT': return `Lần nộp cuối mở lúc ${formatDateTime(item.retryOpensAt)} (${timeLeft(item.retryOpensAt)}).`;
      case 'RETRY_READY': return `Hạn nộp lần cuối ${formatDateTime(item.retryDueAt)} (${timeLeft(item.retryDueAt)}).`;
      case 'DEADLINE_MISSED': return item.supportAction ? SUPPORT_LABELS[item.supportAction] : 'Đã quá hạn nộp lần cuối — quản lý sẽ sắp xếp hỗ trợ.';
      case 'FLAGGED': return item.supportAction ? SUPPORT_LABELS[item.supportAction] : 'Hai lần nộp chưa đạt — quản lý sẽ sắp xếp hỗ trợ.';
      case 'APPROVED': return item.lastReviewedAt ? `Được duyệt ngày ${formatDate(item.lastReviewedAt)}.` : 'Khóa đã hoàn thành.';
      default: return 'Bắt đầu các mô đun để mở bài cuối.';
    }
  })();

  return (
    <Link to={PULSE_PATHS.final(course.courseId)} className="pu-final-item">
      <div className="pu-final-symbol" aria-hidden>{course.finalStatus === 'APPROVED' ? <Check size={22} strokeWidth={3} /> : <ClipboardList size={20} />}</div>
      <div>
        <h3>{course.title}</h3>
        <p>{course.domainName} · {levelName(course.tier)} · {detail}</p>
      </div>
      <FinalStatusPill status={course.finalStatus} />
    </Link>
  );
}

const TASK_STATUS: Record<MyTaskCard['status'], { label: string; tone: '' | 'green' | 'coral' | 'gray' }> = {
  ASSIGNED: { label: 'Cần làm', tone: 'gray' },
  SUBMITTED: { label: 'Chờ quản lý duyệt', tone: '' },
  NEEDS_REVISION: { label: 'Cần chỉnh sửa', tone: 'coral' },
  PASSED: { label: 'Đã duyệt', tone: 'green' },
  FAILED: { label: 'Chưa đạt', tone: 'coral' },
};

function TaskCard({ task }: { task: MyTaskCard }) {
  const status = TASK_STATUS[task.status];
  const feedback = task.latestSubmission?.evaluation?.feedback;
  const domains = task.targets.slice(0, 2).map((t) => t.name);

  return (
    <article className="pu-task">
      <div className="pu-task-head">
        <div>
          <Mini>
            {domains.length ? `${domains.join(', ')} · ` : ''}Mức {task.targetLevel}{task.dueAt ? ` · hạn ${formatDate(task.dueAt)}` : ''}
          </Mini>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
        </div>
        <Pill tone={status.tone}>{task.isOverdue && task.canSubmit ? 'Quá hạn' : status.label}</Pill>
      </div>
      {task.expectedOutput && (
        <div className="pu-criteria-box">
          <b>Tiêu chí đánh giá</b>
          <span>{task.expectedOutput}</span>
        </div>
      )}
      {feedback && (
        <div style={{ marginTop: 14 }}>
          <Notice tone={task.status === 'PASSED' ? 'success' : 'warning'}>
            <strong>Phản hồi của {task.latestSubmission?.evaluation?.reviewerName ?? 'quản lý'}:</strong> {feedback}
          </Notice>
        </div>
      )}
      {task.canSubmit ? (
        <TaskSubmitForm task={task} />
      ) : task.status === 'SUBMITTED' ? (
        <div style={{ marginTop: 14 }}><Notice>Quản lý phòng ban của bạn đang xem minh chứng này.</Notice></div>
      ) : null}
    </article>
  );
}

function TaskSubmitForm({ task }: { task: MyTaskCard }) {
  const submit = useSubmitMyTask();
  const upload = useUploadTaskAttachment();
  const fileInput = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [files, setFiles] = useState<MyTaskFile[]>([]);
  const noteOk = note.trim().length >= 20;
  const linkOk = !link.trim() || /^https?:\/\//i.test(link.trim());

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    upload.mutate(
      { assignmentId: task.assignmentId, file },
      {
        onSuccess: (uploaded) => setFiles((prev) => [...prev, uploaded]),
        onError: (err) => toast.error(pulseErrorMessage(err, `Chưa tải lên được ${file.name}.`)),
      },
    );
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!noteOk || !linkOk) return;
    submit.mutate(
      {
        assignmentId: task.assignmentId,
        payload: { content: note.trim(), linkUrls: link.trim() ? [link.trim()] : [], attachmentIds: files.map((f) => f.id) },
      },
      {
        onSuccess: () => {
          toast.success('Minh chứng đã vào hàng chờ của quản lý.');
          setNote('');
          setLink('');
          setFiles([]);
        },
        onError: (err) => toast.error(pulseErrorMessage(err, 'Chưa nộp được minh chứng.')),
      },
    );
  };

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 6 }}>
      <div className="pu-divider" />
      <label className="pu-field">
        Ghi chú minh chứng
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nêu nguồn, cách làm và kết quả." maxLength={10000} />
        <small className={note && !noteOk ? 'error' : undefined}>Ít nhất 20 ký tự.</small>
      </label>
      <div className="pu-grid-2" style={{ gap: 12 }}>
        <label className="pu-field" style={{ margin: 0 }}>
          Liên kết minh chứng (không bắt buộc)
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" inputMode="url" />
          {!linkOk && <small className="error">Liên kết cần bắt đầu bằng http:// hoặc https://</small>}
        </label>
        <div className="pu-field" style={{ margin: 0 }}>
          Tệp đính kèm (không bắt buộc)
          <div className="pu-row">
            <button type="button" className={btn('outline', true)} onClick={() => fileInput.current?.click()} disabled={upload.isPending}>
              <Paperclip size={14} /> {upload.isPending ? 'Đang tải lên…' : 'Chọn tệp'}
            </button>
            <input ref={fileInput} type="file" hidden onChange={onFile} />
          </div>
          {files.length > 0 && (
            <div className="pu-files">
              {files.map((file) => (
                <span key={file.id}>
                  {file.fileName}
                  <button type="button" aria-label={`Bỏ ${file.fileName}`} onClick={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))} style={{ border: 0, background: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex' }}>
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        <button type="submit" className={btn()} disabled={!noteOk || !linkOk || submit.isPending || upload.isPending}>
          {submit.isPending ? 'Đang nộp…' : task.submissionCount ? 'Nộp lại minh chứng thực tế →' : 'Nộp minh chứng thực tế →'}
        </button>
      </div>
    </form>
  );
}
