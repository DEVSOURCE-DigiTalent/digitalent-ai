import { cn } from '@/lib/utils';
import { TIER_LABELS, type WorkflowPreview } from '../landing-content';
import { TT02_DOMAINS, getReferencePosition, summarizeRequirements } from '@/lib/reference-positions';
import { RadarChart } from './RadarChart';
import { LP_KICKER } from '../landing-type';

/** Small product mock-ups that go with each step of the competency loop. Sample data, decorative. */
export function WorkflowPreviewView({ kind }: { kind: WorkflowPreview }) {
  return (
    <div aria-hidden="true" className="grid gap-4 text-cream">
      {kind === 'requirements' && <RequirementsPreview />}
      {kind === 'assessment' && <AssessmentPreview />}
      {kind === 'gap' && <GapPreview />}
      {kind === 'assignment' && <AssignmentPreview />}
      {kind === 'task' && <TaskPreview />}
      {kind === 'profile' && <ConfirmedPreview />}
    </div>
  );
}

const ROW = 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-cream/12 bg-black/25 px-5 py-4 text-base leading-[1.35]';

function Chip({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'ok' }) {
  return (
    <span
      className={cn(
        'inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs',
        tone === 'ok' ? 'border-[#A7C4A0]/35 text-[#A7C4A0]' : 'border-cream/12 text-cream/80',
      )}
    >
      {children}
    </span>
  );
}

function Pips({ level }: { level: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3].map((step) => (
        <i key={step} className={cn('block h-2 w-5 rounded-full', step <= level ? 'bg-cream' : 'bg-cream/15')} />
      ))}
    </span>
  );
}

const REQUIREMENT_POSITION = 'MARKETING';
const LEVEL_DOT = ['border border-cream/25', 'bg-cream/40', 'bg-cream/75', 'bg-cream'];

/** The requirement matrix of one reference position: a row per domain, a dot per competency, brighter = higher level. */
function RequirementsPreview() {
  const position = getReferencePosition(REQUIREMENT_POSITION);
  if (!position) return null;
  const { selected } = summarizeRequirements(position);
  let offset = 0;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Chip>Vị trí · {position.name}</Chip>
        <Chip>{selected}/24 năng lực được chọn</Chip>
      </div>
      <ul className="grid gap-3">
        {TT02_DOMAINS.map((domain) => {
          const levels = position.levels.slice(offset, offset + domain.competencyCount);
          offset += domain.competencyCount;
          return (
            <li key={domain.number} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-base">
              <span className="truncate text-cream/90">
                <span className="mr-2 text-stone-500 tabular-nums">{domain.number}</span>
                {domain.name}
              </span>
              <span className="flex gap-1.5">
                {levels.map((level, index) => (
                  <i key={index} className={cn('block size-3.5 rounded-full', LEVEL_DOT[level])} />
                ))}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-stone-400">Mỗi chấm là một năng lực; càng sáng, trình độ yêu cầu càng cao.</p>
    </div>
  );
}

const GAP_REQUIRED = [3, 3, 3, 2, 3, 3];
const GAP_CURRENT = [2, 3, 2, 1, 2, 1];

function GapPreview() {
  return (
    <div className="flex flex-wrap items-center gap-8 text-cream">
      <RadarChart required={GAP_REQUIRED} current={GAP_CURRENT} size={240} />
      <div className="grid gap-2 text-sm text-stone-400">
        <span className="flex items-center gap-2"><i className="inline-block h-0 w-4 border-t-[1.5px] border-cream" />Trình độ yêu cầu</span>
        <span className="flex items-center gap-2"><i className="inline-block size-3 rounded-[2px] bg-cream/35" />Trình độ hiện tại</span>
        <Chip>4 ưu tiên đào tạo</Chip>
      </div>
    </div>
  );
}

const ASSESSMENT_ROWS = [
  { code: '4.1', name: 'Bảo vệ thiết bị', level: 2 },
  { code: '4.2', name: 'Bảo vệ dữ liệu cá nhân', level: 1 },
  { code: '6.1', name: 'Hiểu biết về AI', level: 1 },
];

function AssessmentPreview() {
  return (
    <ul className="grid gap-2">
      {ASSESSMENT_ROWS.map((row) => (
        <li key={row.code} className={ROW}>
          <span>
            <span className="mr-2 text-stone-500 tabular-nums">{row.code}</span>
            {row.name}
          </span>
          <span className="flex items-center gap-2">
            <Pips level={row.level} />
            <span className="w-16 text-right text-[11px] text-stone-400">{TIER_LABELS[row.level]}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function AssignmentPreview() {
  return (
    <ul className="grid gap-2">
      <li className={ROW}>
        <span>
          <span className="block font-mono text-[11px] text-stone-500">A4-I</span>
          An toàn thông tin trong công việc
        </span>
        <span className="grid justify-items-end gap-1">
          <span className="text-[11px] text-stone-400 tabular-nums">5 nhân viên</span>
          <Chip>Chờ Owner duyệt</Chip>
        </span>
      </li>
      <li className={ROW}>
        <span>
          <span className="block font-mono text-[11px] text-stone-500">M6-I</span>
          Ứng dụng AI trung cấp
        </span>
        <span className="grid justify-items-end gap-1">
          <span className="text-[11px] text-stone-400 tabular-nums">8 nhân viên</span>
          <Chip tone="ok">Đã giao</Chip>
        </span>
      </li>
    </ul>
  );
}

function TaskPreview() {
  return (
    <div className={cn(ROW, 'grid-cols-1 gap-2')}>
      <span className={LP_KICKER}>Nhiệm vụ · năng lực 4.2</span>
      <span>Lập quy trình xử lý dữ liệu khách hàng</span>
      <span className="flex flex-wrap gap-2">
        <Chip>Đã nộp 1 minh chứng</Chip>
        <Chip>Chờ review</Chip>
      </span>
    </div>
  );
}

function ConfirmedPreview() {
  return (
    <ul className="grid gap-2">
      {[
        { code: '4.2', name: 'Bảo vệ dữ liệu cá nhân', level: 2 },
        { code: '4.1', name: 'Bảo vệ thiết bị', level: 2 },
      ].map((row) => (
        <li key={row.code} className={ROW}>
          <span>
            <span className="mr-2 text-stone-500 tabular-nums">{row.code}</span>
            {row.name}
          </span>
          <Chip tone="ok">Đã xác nhận · {TIER_LABELS[row.level]}</Chip>
        </li>
      ))}
    </ul>
  );
}
