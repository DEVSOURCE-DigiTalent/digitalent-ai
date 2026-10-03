import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { usePersonalProgress, usePersonalSkillGap, useSetPersonalTarget } from '@/hooks/use-personal-learning';
import { levelLabelVi } from '@/lib/competency-levels';
import {
  REFERENCE_POSITIONS, getReferencePosition, requirementsByDomain, summarizeRequirements, type ReferencePosition,
} from '@/lib/reference-positions';
import { cn } from '@/lib/utils';
import { DomainPips } from '../../public/components/DomainPips';
import {
  Card, ErrorBlock, LevelPips, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PT_EYEBROW, PageIntro, Tag
} from '../components/ui';
import { errorMessage } from '../utils/error-message';

/** IND-05 "/personal/target": pick one of the reference positions, after seeing what it asks of you. */
export function LearnerTargetPage() {
  const [params] = useSearchParams();
  const gap = usePersonalSkillGap();
  const progress = usePersonalProgress();
  const setTarget = useSetPersonalTarget();
  const savedCode = gap.data?.target?.code ?? null;
  const [previewCode, setPreviewCode] = useState<string | null>(params.get('role')?.toUpperCase() ?? null);

  useEffect(() => {
    if (!previewCode && savedCode) setPreviewCode(savedCode);
  }, [previewCode, savedCode]);

  const levels = useMemo(() => {
    const map = new Map<string, number>();
    progress.data?.profile.forEach((domain) => domain.items.forEach((item) => map.set(item.code, item.level)));
    return map;
  }, [progress.data]);

  const preview = getReferencePosition(previewCode ?? '') ?? (gap.data ? REFERENCE_POSITIONS[0] : undefined);

  return (
    <div data-testid="learner-target-page" className="grid gap-10">
      <PageIntro
        label="Vị trí mục tiêu"
        title="Bạn muốn hướng tới"
        accent="vị trí nào?"
        lead="Mỗi vị trí tham chiếu chọn một bộ năng lực trong Khung năng lực số TT02 và một mức yêu cầu cho từng năng lực. Xem yêu cầu so với mức hiện tại của bạn trước khi chọn; bạn có thể đổi mục tiêu bất cứ lúc nào."
      />

      {(gap.isLoading || progress.isLoading) && <LoadingBlock />}
      {gap.isError && <ErrorBlock message={errorMessage(gap.error)} onRetry={() => gap.refetch()} />}

      {gap.data && preview && (
        <>
          <div role="radiogroup" aria-label="Vị trí tham chiếu" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {REFERENCE_POSITIONS.map((position) => (
              <PositionOption
                key={position.code}
                position={position}
                selected={position.code === preview.code}
                saved={position.code === savedCode}
                onSelect={() => setPreviewCode(position.code)}
              />
            ))}
          </div>

          <PositionDetail
            position={preview}
            levels={levels}
            assessed={gap.data.assessed}
            saved={preview.code === savedCode}
            saving={setTarget.isPending}
            error={setTarget.isError ? errorMessage(setTarget.error) : undefined}
            onSave={() => setTarget.mutate(preview.code)}
          />
        </>
      )}
    </div>
  );
}

interface PositionOptionProps {
  position: ReferencePosition;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
}

function PositionOption({ position, selected, saved, onSelect }: PositionOptionProps) {
  const { selected: count, domains } = summarizeRequirements(position);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'group flex min-h-[188px] flex-col justify-between gap-6 rounded-card border p-5 text-left transition-[border-color,background-color,transform] duration-300 ease-cinematic',
        selected ? 'border-pt-fg bg-pt-raised' : 'border-pt-line bg-pt-card hover:-translate-y-0.5 hover:border-pt-fg/40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <DomainPips domains={domains} tone="theme" className="gap-1.5 [&_i]:w-4" />
        {saved && <Tag tone="solid"><Check className="size-3" aria-hidden="true" />Mục tiêu</Tag>}
      </div>
      <div>
        <span className="block text-[19px] font-normal leading-tight tracking-[-0.015em] text-pt-fg">{position.name}</span>
        <span className="mt-1.5 block text-xs leading-snug text-pt-fg-3">{count}/24 năng lực</span>
      </div>
    </button>
  );
}

interface PositionDetailProps {
  position: ReferencePosition;
  levels: Map<string, number>;
  assessed: boolean;
  saved: boolean;
  saving: boolean;
  error?: string;
  onSave: () => void;
}

function PositionDetail({ position, levels, assessed, saved, saving, error, onSave }: PositionDetailProps) {
  const groups = requirementsByDomain(position);
  const required = groups.flatMap((group) => group.items);
  const missing = required.filter((item) => (levels.get(item.code) ?? 0) < item.level);
  const steps = missing.reduce((sum, item) => sum + item.level - (levels.get(item.code) ?? 0), 0);

  return (
    <Card className="grid gap-10 p-6 md:p-9 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
        <div>
          <p className={PT_EYEBROW}>{saved ? 'Mục tiêu hiện tại' : 'Đang xem'}</p>
          <h2 className="mt-3 text-[clamp(28px,3.4vw,40px)] font-normal leading-[1.05] tracking-[-0.03em]">{position.name}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-pt-fg-2">{position.description}</p>
        </div>

        <dl className="grid grid-cols-3 gap-4 border-y border-pt-line py-5">
          <div>
            <dt className="text-xs text-pt-fg-3">Yêu cầu</dt>
            <dd className="mt-1 text-2xl font-light tabular-nums">{required.length}<span className="text-sm text-pt-fg-3">/24</span></dd>
          </div>
          <div>
            <dt className="text-xs text-pt-fg-3">Còn thiếu</dt>
            <dd className="mt-1 text-2xl font-light tabular-nums">{missing.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-pt-fg-3">Bậc cần lên</dt>
            <dd className="mt-1 text-2xl font-light tabular-nums">{steps}</dd>
          </div>
        </dl>

        {!assessed && (
          <p className="text-sm leading-relaxed text-pt-fg-3">
            Bạn chưa làm đánh giá đầu vào nên mức hiện tại đang tính là 0. Sau khi làm bài, phần còn thiếu sẽ chính xác hơn.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {saved ? (
            <Link to={assessed ? '/personal/path' : '/personal/diagnostic'} className={PT_BUTTON}>
              {assessed ? 'Xem lộ trình' : 'Làm đánh giá đầu vào'}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <button type="button" onClick={onSave} disabled={saving} className={PT_BUTTON}>
              {saving ? 'Đang lưu…' : 'Chọn làm mục tiêu'}
            </button>
          )}
          <Link to={`/careers/${position.code.toLowerCase()}`} className={PT_BUTTON_SECONDARY}>Mô tả công khai</Link>
        </div>
        {saved && <p role="status" className="text-xs text-pt-ok">Đây là mục tiêu của bạn. Lộ trình được dựng theo vị trí này.</p>}
        {error && <p role="alert" className="text-xs text-pt-bad">{error}</p>}
      </div>

      <div className="grid gap-7">
        {groups.map((group) => (
          <section key={group.number} aria-labelledby={`domain-${group.number}`}>
            <h3 id={`domain-${group.number}`} className="flex items-baseline gap-3 border-b border-pt-line pb-2 text-sm text-pt-fg">
              <span className="font-landing-serif text-lg italic text-pt-fg-3">{group.number}</span>
              {group.name}
            </h3>
            {group.items.length === 0 ? (
              <p className="py-3 text-xs text-pt-fg-3">Vị trí này không yêu cầu năng lực nào của miền.</p>
            ) : (
              <ul>
                {group.items.map((item) => {
                  const current = levels.get(item.code) ?? 0;
                  return (
                    <li key={item.code} className="grid grid-cols-[2.5rem_1fr] items-center gap-x-3 gap-y-1.5 border-b border-pt-line/60 py-3 last:border-0 sm:grid-cols-[2.5rem_1fr_auto]">
                      <span className="text-xs tabular-nums text-pt-fg-3">{item.code}</span>
                      <span className="text-sm leading-snug text-pt-fg">{item.name}</span>
                      <span className="col-start-2 flex items-center gap-3 sm:col-start-3">
                        <LevelPips level={current} required={item.level} />
                        <span className={cn('w-[4.5rem] text-right text-xs', current >= item.level ? 'text-pt-ok' : 'text-pt-fg-2')}>
                          {levelLabelVi(item.level)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {group.notRequired.length > 0 && group.items.length > 0 && (
              <p className="pt-2 text-[11px] text-pt-fg-3">Không yêu cầu: {group.notRequired.join(', ')}</p>
            )}
          </section>
        ))}
      </div>
    </Card>
  );
}
