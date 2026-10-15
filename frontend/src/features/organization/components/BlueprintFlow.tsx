import type { SetupItem } from '@/services/organization.service';

interface BlueprintFlowProps {
  setup: SetupItem[];
  setupCompleted: boolean;
}

const TIERS = [
  { step: '01', label: 'Digital AI standard' },
  { step: '02', label: 'Business ceiling' },
  { step: '03', label: 'Department ceiling' },
  { step: '04', label: 'Position target' },
];

export function BlueprintFlow({ setup, setupCompleted }: BlueprintFlowProps) {
  return (
    <div>
      {/* Pulse-sequence lane */}
      <div
        className="flex items-center gap-2 overflow-x-auto whitespace-nowrap"
        style={{ margin: '-5px 0 18px', padding: '3px 2px 9px' }}
        aria-label="Phân cấp năng lực"
      >
        {TIERS.map((tier, i) => (
          <div key={tier.step} className="contents">
            {i > 0 && (
              <i
                className="shrink-0 font-black not-italic"
                style={{ color: '#7383ae' }}
              >
                →
              </i>
            )}
            <span
              className="flex flex-1 min-w-max items-center gap-[10px] rounded-xl border px-4 py-[13px] text-[11px] font-[850]"
              style={{
                borderColor: '#dfe5f5',
                background: '#fff',
                color: '#28385a',
              }}
            >
              <b
                className="grid size-[25px] shrink-0 place-items-center rounded-lg text-[10px] font-bold"
                style={{ background: '#e9edff', color: '#3448cf' }}
              >
                {tier.step}
              </b>
              {tier.label}
            </span>
          </div>
        ))}
      </div>

      {/* Setup checklist */}
      <section
        className="rounded-[22px] border p-6"
        style={{
          borderColor: 'var(--po-line)',
          background: 'var(--po-surface)',
          boxShadow: '0 10px 35px rgba(29,48,102,.025)',
        }}
      >
        <span
          className="text-[10px] font-black uppercase tracking-[0.12em]"
          style={{ color: 'var(--po-accent)' }}
        >
          Tiến độ thiết lập
        </span>
        <h2
          className="mt-2 text-xl font-semibold"
          style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
        >
          {setupCompleted
            ? 'Kiến trúc năng lực đã sẵn sàng.'
            : 'Hoàn tất từng bước để công bố.'}
        </h2>

        <div className="mt-4 grid gap-2">
          {setup.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-3 rounded-[10px] border px-4 py-3"
              style={{ borderColor: 'var(--po-line)' }}
            >
              <span
                className="grid size-5 shrink-0 place-items-center rounded-md text-[9px] font-bold"
                style={
                  item.done
                    ? { background: '#ecfdf5', color: '#16a34a' }
                    : { background: '#fef3c7', color: '#d97706' }
                }
              >
                {item.done ? '✓' : '·'}
              </span>
              <div className="flex-1 min-w-0">
                <strong
                  className="block text-[13px]"
                  style={{ color: 'var(--po-ink)' }}
                >
                  {item.label}
                </strong>
                {item.detail && (
                  <small
                    className="text-[11px]"
                    style={{ color: 'var(--po-muted)' }}
                  >
                    {item.detail}
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
