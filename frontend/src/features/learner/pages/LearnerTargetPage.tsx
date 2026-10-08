import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { usePersonalAccess, usePersonalProgress, usePersonalSkillGap, useSetPersonalTarget } from '@/hooks/use-personal-learning';
import { levelLabelVi } from '@/lib/competency-levels';
import { REFERENCE_POSITIONS, getReferencePosition, requirementsByDomain, summarizeRequirements, type ReferencePosition } from '@/lib/reference-positions';
import { cn } from '@/lib/utils';
import { Card, ErrorBlock, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PersonalPageHeader, Tag } from '../components/ui';
import { errorMessage } from '../utils/error-message';

export function LearnerTargetPage() {
  const [params] = useSearchParams();
  const gap = usePersonalSkillGap();
  const progress = usePersonalProgress();
  const setTarget = useSetPersonalTarget();
  const { data: access } = usePersonalAccess();
  const savedCode = gap.data?.target?.code ?? null;
  const [previewCode, setPreviewCode] = useState<string | null>(params.get('role')?.toUpperCase() ?? null);
  const preview = getReferencePosition(previewCode ?? savedCode ?? '') ?? REFERENCE_POSITIONS[0];
  const levels = useMemo(() => new Map(progress.data?.profile.flatMap((domain) => domain.items.map((item) => [item.code, item.level] as const)) ?? []), [progress.data]);
  return <div data-testid="learner-target-page" className="grid gap-6">
    <PersonalPageHeader label="Học tập" title="Mục tiêu nghề nghiệp" lead="Xem công việc và yêu cầu năng lực của từng vị trí trước khi chọn mục tiêu học tập." />
    {(gap.isLoading || progress.isLoading) && <LoadingBlock />}
    {gap.isError && <ErrorBlock message={errorMessage(gap.error)} onRetry={() => gap.refetch()} />}
    {progress.isError && <ErrorBlock message={errorMessage(progress.error)} onRetry={() => progress.refetch()} />}
    {gap.data && <>
      {savedCode && <Card className="p-5">
        <p className="text-sm text-pt-fg-2">Mục tiêu hiện tại</p>
        <p className="mt-1 text-lg font-semibold">{gap.data.target?.name}</p>
        {access?.targetChangesLeft !== null && access?.targetChangesLeft !== undefined && (
          <p className="mt-2 text-sm text-pt-fg-2">
            {access.targetChangesLeft > 0
              ? `Còn ${access.targetChangesLeft} lần đổi vị trí trong kỳ thử`
              : 'Bạn đã dùng lần đổi vị trí trong kỳ thử. Nâng cấp để đổi không giới hạn.'}
          </p>
        )}
      </Card>}
      <div className="grid items-start gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <div role="radiogroup" aria-label="Vị trí tham chiếu" className="grid gap-2">
          {REFERENCE_POSITIONS.map((position) => <PositionOption key={position.code} position={position} selected={position.code === preview.code} saved={position.code === savedCode} onSelect={() => setPreviewCode(position.code)} />)}
        </div>
        <PositionDetail position={preview} levels={levels} assessed={gap.data.assessed && Boolean(progress.data)} saved={preview.code === savedCode} changing={Boolean(savedCode) && preview.code !== savedCode} saving={setTarget.isPending} changeBlocked={access?.targetChangesLeft === 0} error={setTarget.isError ? errorMessage(setTarget.error) : undefined} onSave={() => setTarget.mutate(preview.code)} />
      </div>
    </>}
  </div>;
}

function PositionOption({ position, selected, saved, onSelect }: { position: ReferencePosition; selected: boolean; saved: boolean; onSelect: () => void }) {
  return <button type="button" role="radio" aria-checked={selected} onClick={onSelect}
    className={cn('flex min-h-20 flex-col gap-2 rounded-xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pt-accent', selected ? 'border-pt-fg bg-pt-raised' : 'border-pt-line bg-pt-card hover:border-pt-fg/40')}>
    <span className="flex flex-wrap items-center gap-2"><span className="text-base font-medium">{position.name}</span>{saved && <Tag><Check className="size-3" aria-hidden="true" />Mục tiêu</Tag>}</span>
    <span className="text-xs text-pt-fg-3">{summarizeRequirements(position).selected}/24 năng lực · {selected ? 'Đang xem' : 'Xem chi tiết'}</span>
  </button>;
}

interface PositionDetailProps {
  position: ReferencePosition;
  levels: Map<string, number>;
  assessed: boolean;
  saved: boolean;
  changing: boolean;
  saving: boolean;
  /** The trial's one change is used: another position cannot be saved. */
  changeBlocked: boolean;
  error?: string;
  onSave: () => void;
}

function PositionDetail({ position, levels, assessed, saved, changing, saving, changeBlocked, error, onSave }: PositionDetailProps) {
  const groups = requirementsByDomain(position);
  const required = groups.flatMap((group) => group.items);
  const missing = required.filter((item) => (levels.get(item.code) ?? 0) < item.level);
  return <Card className="grid min-w-0 gap-6 p-5 sm:p-6">
    <div>
      <h2 className="text-xl font-semibold">{position.name}</h2>
      <h3 className="mt-4 text-sm font-medium">Công việc tiêu biểu</h3>
      <p className="mt-1 text-sm leading-relaxed text-pt-fg-2">{position.description}</p>
      <h3 className="mt-4 text-sm font-medium">Nội dung đào tạo liên quan</h3>
      <p className="mt-1 text-sm leading-relaxed text-pt-fg-2">{groups.filter((group) => group.items.length > 0).map((group) => group.name).join('; ')}. Các khóa cụ thể được đề xuất theo mục tiêu và kết quả đánh giá.</p>
    </div>
    <p className="border-y border-pt-line py-4 text-sm">{required.length}/24 năng lực có yêu cầu. {assessed ? `${missing.length} năng lực cần phát triển.` : 'Chưa đánh giá: chưa xác định phần năng lực cần phát triển.'}</p>
    <div>
      {changing && <p className="mb-4 text-sm leading-relaxed text-pt-fg-2">Lộ trình sẽ được tính lại theo yêu cầu của vị trí mới dựa trên kết quả học tập hiện có. Các khóa cần học và tỷ lệ đáp ứng yêu cầu có thể thay đổi.</p>}
      <div className="flex flex-wrap gap-3">
        {saved ? <Link to={assessed ? '/personal/path' : '/personal/diagnostic'} className={PT_BUTTON}>{assessed ? 'Xem lộ trình' : 'Làm đánh giá đầu vào'}</Link>
          : <button type="button" onClick={onSave} disabled={saving || (changing && changeBlocked)} aria-describedby={changing && changeBlocked ? 'target-change-blocked' : undefined} className={PT_BUTTON}>{saving ? 'Đang lưu…' : 'Chọn làm mục tiêu'}</button>}
        <Link to={`/careers/${position.code.toLowerCase()}`} className={PT_BUTTON_SECONDARY}>Mô tả công khai</Link>
      </div>
      {changing && changeBlocked && <p id="target-change-blocked" className="mt-3 text-sm text-pt-fg-2">Bạn đã dùng lần đổi vị trí trong kỳ thử. Nâng cấp để đổi không giới hạn.</p>}
      {saved && <p role="status" className="mt-3 text-sm text-pt-ok">Đây là mục tiêu của bạn. Lộ trình được dựng theo vị trí này.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-pt-bad">{error}</p>}
    </div>
    <div className="grid gap-5">
      {groups.filter((group) => group.items.length > 0).map((group) => <section key={group.number} aria-labelledby={`domain-${group.number}`}>
        <h3 id={`domain-${group.number}`} className="border-b border-pt-line pb-2 text-base font-semibold">{group.number}. {group.name}</h3>
        <ul className="divide-y divide-pt-line">
          {group.items.map((item) => <li key={item.code} className="grid gap-2 py-3 text-sm">
            <span>{item.code} · {item.name}</span>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-pt-fg-2"><span>{assessed ? `Hiện tại: ${levelLabelVi(levels.get(item.code) ?? 0)}` : 'Chưa đánh giá'}</span><span>Yêu cầu: {levelLabelVi(item.level)}</span></div>
          </li>)}
        </ul>
      </section>)}
    </div>
  </Card>;
}
