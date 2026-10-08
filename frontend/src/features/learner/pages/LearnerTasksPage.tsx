import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Lock } from 'lucide-react';
import { usePersonalAccess, usePersonalTasks, useSubmitPersonalTask } from '@/hooks/use-personal-learning';
import { usePlanErrorHandler } from '@/hooks/use-plan-error-handler';
import { levelLabelVi } from '@/lib/competency-levels';
import { cn } from '@/lib/utils';
import type { PersonalTask, TaskStatus } from '@/services/personal-learning.service';
import { PtDialog } from '../components/PtDialog';
import {
  Card, EmptyState, ErrorBlock, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PT_EYEBROW, PT_INPUT, PersonalPageHeader, Tag
} from '../components/ui';
import { UpgradeLink } from '../components/UpgradeLink';
import { errorMessage, planErrorOf } from '../utils/error-message';
import { formatDate } from '../utils/format';

type Filter = 'todo' | 'review' | 'done' | 'locked';

const FILTERS: { key: Filter; label: string; statuses: TaskStatus[] }[] = [
  { key: 'todo', label: 'Cần làm', statuses: ['OPEN', 'REVISION_REQUESTED'] },
  { key: 'review', label: 'Đang chấm', statuses: ['PENDING_REVIEW'] },
  { key: 'done', label: 'Đã duyệt', statuses: ['APPROVED'] },
  { key: 'locked', label: 'Chưa bắt đầu khóa', statuses: ['LOCKED'] },
];

const STATUS: Record<TaskStatus, { label: string; tone: 'neutral' | 'ok' | 'warn' | 'info' | 'bad' }> = {
  OPEN: { label: 'Cần làm', tone: 'neutral' },
  REVISION_REQUESTED: { label: 'Cần sửa', tone: 'bad' },
  PENDING_REVIEW: { label: 'Đang chấm', tone: 'info' },
  APPROVED: { label: 'Đã duyệt', tone: 'ok' },
  LOCKED: { label: 'Chưa bắt đầu khóa', tone: 'neutral' },
};

const CONTENT_MIN = 20;

/** IND-12 "/personal/tasks": one practical task per course, turned into evidence of the competency. */
export function LearnerTasksPage() {
  const { data, isLoading, isError, error, refetch } = usePersonalTasks();
  const [filter, setFilter] = useState<Filter>('todo');
  const [active, setActive] = useState<PersonalTask | null>(null);
  const [notice, setNotice] = useState('');
  const counts = Object.fromEntries(FILTERS.map((f) => [f.key, data?.filter((task) => f.statuses.includes(task.status)).length ?? 0]));
  const visible = data?.filter((task) => FILTERS.find((f) => f.key === filter)!.statuses.includes(task.status)) ?? [];

  return (
    <div data-testid="learner-tasks-page" className="grid gap-10">
      <PersonalPageHeader
        label="Bài thực hành"
        title="Bài thực hành"
        lead="Xem yêu cầu đầu ra, nộp bài làm và theo dõi phản hồi hiện có."
      />

      {notice && <p role="status" className="rounded-2xl border border-pt-ok/40 bg-pt-ok/10 px-5 py-3 text-sm text-pt-ok">{notice}</p>}
      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message={errorMessage(error)} onRetry={() => refetch()} />}

      {data && (
        <>
          <div role="tablist" aria-label="Lọc bài thực hành" className="pt-scroll-x -mx-1 flex gap-1 overflow-x-auto px-1">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={filter === item.key}
                onClick={() => setFilter(item.key)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors',
                  filter === item.key ? 'border-pt-fg bg-pt-fg text-pt-bg' : 'border-pt-line text-pt-fg-2 hover:border-pt-fg/40 hover:text-pt-fg',
                )}
              >
                {item.label}
                <span className={cn('tabular-nums text-xs', filter === item.key ? 'opacity-70' : 'text-pt-fg-3')}>{counts[item.key]}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <EmptyState
              title={filter === 'todo' ? 'Không có bài nào đang chờ bạn' : 'Chưa có bài nào ở đây'}
              body={filter === 'todo' ? 'Bắt đầu một khóa trong lộ trình để mở bài thực hành của khóa đó.' : undefined}
              action={filter === 'todo' && <Link to="/personal/path" className={PT_BUTTON_SECONDARY}>Mở lộ trình</Link>}
            />
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {visible.map((task) => <TaskCard key={task.id} task={task} onSubmit={() => setActive(task)} />)}
            </ul>
          )}
        </>
      )}

      <SubmitDialog
        task={active}
        onClose={() => setActive(null)}
        onSubmitted={() => {
          setActive(null);
          setFilter('review');
          setNotice('Đã gửi nộp bài thực hành. Kết quả chấm và nhận xét sẽ hiện trong mục "Đang chấm".');
        }}
      />
    </div>
  );
}

function TaskCard({ task, onSubmit }: { task: PersonalTask; onSubmit: () => void }) {
  const status = STATUS[task.status];
  const locked = task.status === 'LOCKED';
  const freePlan = usePersonalAccess().data?.mode === 'free';

  return (
    <Card as="li" className={cn('flex flex-col gap-5 p-6', locked && 'bg-pt-card/60')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-pt-fg-3"><span className="tabular-nums">{task.courseCode}</span> · {task.courseTitle}</span>
        <div className="flex gap-1.5">
          <Tag>{levelLabelVi(task.level)}</Tag>
          <Tag tone={status.tone}>{status.label}</Tag>
        </div>
      </div>

      <div>
        <h2 className={cn('text-[19px] font-normal leading-snug tracking-[-0.015em]', locked ? 'text-pt-fg-2' : 'text-pt-fg')}>{task.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-pt-fg-2">{task.brief}</p>
      </div>

      {!locked && (
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className={PT_EYEBROW}>Sản phẩm nộp</p>
            <p className="mt-2 leading-relaxed text-pt-fg-2">{task.deliverable}</p>
          </div>
          <div>
            <p className={PT_EYEBROW}>Tiêu chí chấm</p>
            <ul className="mt-2 grid gap-1.5">
              {task.rubric.map((criterion) => (
                <li key={criterion} className="flex gap-2 text-pt-fg-2"><span aria-hidden="true" className="text-pt-fg-3">—</span>{criterion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {task.submission && (
        <div className="rounded-2xl border border-pt-line bg-pt-raised/50 p-4 text-sm">
          <p className="text-xs text-pt-fg-3">Nộp ngày {formatDate(task.submission.submittedAt)}</p>
          <p className="mt-2 leading-relaxed text-pt-fg-2">{task.submission.content}</p>
          {task.submission.linkUrl && (
            <a href={task.submission.linkUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs text-pt-fg underline decoration-pt-fg/30 underline-offset-4">
              Liên kết bài làm <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          )}
          {task.submission.score !== undefined && (
            <div className="mt-4 border-t border-pt-line pt-4">
              <p className="text-[22px] font-light tracking-[-0.02em] text-pt-ok">{task.submission.score}/100</p>
              {task.submission.feedback && <p className="mt-1 leading-relaxed text-pt-fg-2">{task.submission.feedback}</p>}
            </div>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-pt-line pt-4">
        <span className="text-xs text-pt-fg-3">Năng lực {task.competencyCodes.join(', ')}</span>
        {locked ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-pt-fg-3"><Lock className="size-3.5" aria-hidden="true" />Cần bắt đầu khóa {task.courseCode} trước</span>
        ) : (task.status === 'OPEN' || task.status === 'REVISION_REQUESTED') && (
          freePlan ? (
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-pt-fg-3">
              <span className="inline-flex items-center gap-1.5"><Lock className="size-3.5" aria-hidden="true" />Gói Miễn phí không nộp bài mới</span>
              <UpgradeLink placement="course" variant="text">Nâng cấp Plus</UpgradeLink>
            </span>
          ) : (
            <button type="button" onClick={onSubmit} className={PT_BUTTON}>Nộp bài làm</button>
          )
        )}
      </div>
    </Card>
  );
}

function SubmitDialog({ task, onClose, onSubmitted }: { task: PersonalTask | null; onClose: () => void; onSubmitted: () => void }) {
  const submit = useSubmitPersonalTask();
  const handlePlanError = usePlanErrorHandler();
  const [linkUrl, setLinkUrl] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const close = () => {
    setLinkUrl('');
    setContent('');
    setError('');
    submit.reset();
    onClose();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!task) return;
    if (linkUrl && !/^https?:\/\/\S+$/i.test(linkUrl.trim())) {
      setError('Liên kết phải bắt đầu bằng http:// hoặc https://.');
      return;
    }
    if (content.trim().length < CONTENT_MIN) {
      setError(`Mô tả bài làm tối thiểu ${CONTENT_MIN} ký tự.`);
      return;
    }
    setError('');
    submit.mutate(
      { taskId: task.id, input: { linkUrl: linkUrl.trim(), content: content.trim() } },
      {
        onSuccess: () => {
          setLinkUrl('');
          setContent('');
          onSubmitted();
        },
        onError: handlePlanError,
      },
    );
  };

  return (
    <PtDialog
      open={Boolean(task)}
      onClose={close}
      title="Nộp minh chứng công việc thực tế"
      description={task ? `${task.title} · ${task.courseCode}` : undefined}
    >
      {task && (
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <div className="grid gap-1.5">
            <label htmlFor="task-link" className="text-sm text-pt-fg-2">Liên kết bài làm (tài liệu, thư mục chia sẻ)</label>
            <input
              id="task-link"
              type="url"
              inputMode="url"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://docs.google.com/…"
              className={PT_INPUT}
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="task-content" className="text-sm text-pt-fg-2">Mô tả bài làm</label>
            <textarea
              id="task-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              placeholder="Bạn đã làm gì, theo các bước nào, kết quả ra sao…"
              aria-invalid={Boolean(error) || undefined}
              className={PT_INPUT}
            />
            <p className="text-xs text-pt-fg-3">Không dán mật khẩu hay dữ liệu cá nhân của khách hàng; che thông tin nhạy cảm trước khi chia sẻ.</p>
          </div>
          {(error || (submit.isError && !planErrorOf(submit.error))) && <p role="alert" className="text-sm text-pt-bad">{error || errorMessage(submit.error)}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} className={PT_BUTTON_SECONDARY}>Hủy</button>
            <button type="submit" disabled={submit.isPending} className={PT_BUTTON}>
              {submit.isPending ? 'Đang gửi…' : 'Gửi nộp bài đánh giá'}
            </button>
          </div>
        </form>
      )}
    </PtDialog>
  );
}
