import type { TrialPlanKind, TrialRoadmap } from '@/services/trial-program.service';
import { formatMoneyShort } from '@/features/trial-program/lib/trial-format';
import { levelsOf, optionOf, PLAN_KINDS, planTotals } from '@/features/trial-program/lib/trial-plan';
import { trialDomainIndex } from '../lib/trial-scope';
import type { CapabilityCeilings } from '@/services/capability-ceiling.service';
import '@/features/trial-program/trial-program.css';
import '@/features/trial-program/components/report/trial-report.css';

interface TrialScopePanelProps {
  roadmap: TrialRoadmap;
  matrix: CapabilityCeilings;
  kind: TrialPlanKind;
  onKind: (kind: TrialPlanKind) => void;
  /** Đánh dấu mua các khóa 🔒 của phương án (kèm số suất). */
  onSelect: () => void;
  canEdit: boolean;
}

/**
 * OW-05 · Phạm vi đào tạo theo kết quả test dùng thử: 3 phương án (số khóa, suất, chi phí), chi phí theo lĩnh vực và nút
 * chọn mua các khóa của phương án. Số liệu theo luật (planner); ✦ chỉ là lý do ngắn của AI.
 */
export function TrialScopePanel({ roadmap, matrix, kind, onKind, onSelect, canEdit }: TrialScopePanelProps) {
  const option = optionOf(roadmap, kind);
  const totals = option ? planTotals(roadmap.people, levelsOf(option), roadmap.prices) : null;
  const maxCost = Math.max(1, ...(totals?.costByDomain ?? []).map(([a, b]) => a + b));

  return (
    <section className="tp-vars tp-card" aria-labelledby="cc-trial-title" style={{ marginBottom: 12 }}>
      <div className="tp-card-head">
        <h2 id="cc-trial-title">Theo kết quả test <span className="tp-muted">· {roadmap.people.length} người đã làm bài</span></h2>
        {canEdit && totals && totals.courses > 0 && (
          <button type="button" className="tp-btn small" onClick={onSelect}>Chọn {totals.courses} khóa cần mua</button>
        )}
      </div>

      <div className="tp-grid-2" role="radiogroup" aria-label="Phương án phạm vi">
        {PLAN_KINDS.map((p) => {
          const o = optionOf(roadmap, p.kind);
          const t = o ? planTotals(roadmap.people, levelsOf(o), roadmap.prices) : null;
          return (
            <button key={p.kind} type="button" role="radio" aria-checked={kind === p.kind} onClick={() => onKind(p.kind)}
              className="tp-stat" style={{ textAlign: 'left', cursor: 'pointer', borderColor: kind === p.kind ? 'var(--tp-accent)' : undefined, boxShadow: kind === p.kind ? 'inset 0 0 0 1px var(--tp-accent)' : undefined }}>
              <span>{p.kind === 'BALANCED' ? '✦ ' : ''}{p.label}</span>
              <strong>{t ? formatMoneyShort(t.cost) : '—'}</strong>
              <span>{t ? `${t.courses} khóa · ${t.seats} suất` : ''}</span>
            </button>
          );
        })}
      </div>

      {totals && totals.cost > 0 && (
        <div className="rp" style={{ gap: 8 }}>
          <div className="tp-card-head">
            <span className="tp-muted">Chi phí theo lĩnh vực</span>
            <span className="rp-key">
              <span><i style={{ background: 'var(--rp-p2)' }} />Trung cấp</span>
              <span><i style={{ background: 'var(--rp-p3)' }} />Nâng cao</span>
            </span>
          </div>
          <div className="rp-stack">
            {matrix.domains.map((domain, position) => {
              const [mid, high] = totals.costByDomain[trialDomainIndex(roadmap, domain.categoryId, position)] ?? [0, 0];
              return (
                <div key={domain.categoryId} className="rp-srow" style={{ gridTemplateColumns: '150px 1fr 52px' }}>
                  <span className="lab"><span>{domain.name}</span></span>
                  <span className="rp-bar cost" role="img" aria-label={`${domain.name}: ${formatMoneyShort(mid + high)}`}>
                    {mid > 0 && <i data-tier={2} style={{ flex: mid }} title={`Trung cấp: ${formatMoneyShort(mid)}`} />}
                    {high > 0 && <i data-tier={3} style={{ flex: high }} title={`Nâng cao: ${formatMoneyShort(high)}`} />}
                    <i className="rest" style={{ flex: maxCost - mid - high }} />
                  </span>
                  <b>{formatMoneyShort(mid + high)}</b>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
