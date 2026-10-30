import { useState } from 'react';
import { useReferencePositionLevels } from '@/hooks/use-reference-position-levels';
import {
  REFERENCE_POSITIONS,
  TT02_DOMAINS,
} from '@/lib/reference-positions';

const LEVEL_TONES: Record<number, { bg: string; fg: string; name: string }> = {
  1: { bg: '#edf7dd', fg: '#557327', name: 'Cơ bản' },
  2: { bg: 'var(--po-soft)', fg: '#137b84', name: 'Trung cấp' },
  3: { bg: '#fdeee9', fg: '#c4553f', name: 'Nâng cao' },
};

const POSITION_SHORT: Record<string, string> = {
  CEO: 'CEO',
  HR: 'HR',
  MARKETING: 'Marketing',
  SALES_CRM: 'Sales/CRM',
  ACCOUNTANT: 'Kế toán',
};

const COLUMNS = REFERENCE_POSITIONS.map((position) => ({ code: position.code, name: position.name, label: POSITION_SHORT[position.code] ?? position.name }));

function LevelChip({ level }: { level: number }) {
  const tone = LEVEL_TONES[level];
  if (!tone) return <span style={{ color: 'var(--po-muted)' }}>—</span>;
  return (
    <span className="inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: tone.bg, color: tone.fg }}>
      {tone.name}
    </span>
  );
}

/**
 * Reference levels per domain for the 5 sample positions, defined by DigiTalent AI (OW-05). Read-only: it helps the
 * owner set the organization levels above; each organization adjusts the requirements of its own positions.
 */
export function PositionReferenceMatrix() {
  const [focused, setFocused] = useState<string | null>(null);
  const { data: reference, isLoading, isError } = useReferencePositionLevels();

  return (
    <section
      aria-labelledby="position-reference-title"
      className="rounded-[22px] border p-6"
      style={{ borderColor: 'var(--po-line)', background: 'var(--po-surface)', boxShadow: '0 10px 35px rgba(29,48,102,.025)' }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div style={{ maxWidth: 680 }}>
          <span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--po-accent)' }}>
            Tham khảo · DigiTalent AI đề xuất
          </span>
          <h2 id="position-reference-title" className="mt-2 text-xl font-semibold" style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}>
            Mức năng lực tham chiếu theo vị trí{reference ? ` · v${reference.version}` : ''}.
          </h2>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--po-muted)' }}>
            Mức tham khảo cho 5 vị trí mẫu do quản trị DigiTalent công bố. Doanh nghiệp tự đặt yêu cầu cho vị trí của mình;
            thay đổi ở đây không tự đổi mục tiêu đã áp dụng cho nhân viên.
          </p>
        </div>
      </div>

      {isLoading && <p className="mt-4 text-sm">Đang tải mức tham chiếu…</p>}
      {isError && <p className="mt-4 text-sm" role="alert">Chưa tải được mức tham chiếu. Vui lòng thử lại.</p>}

      {reference && <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th scope="col" className="border-b px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ borderColor: 'var(--po-line)', color: 'var(--po-muted)' }}>
                Miền năng lực
              </th>
              {COLUMNS.map((column) => {
                const active = focused === column.code;
                return (
                  <th
                    key={column.code}
                    scope="col"
                    className="border-b px-2 py-2 text-center"
                    style={{ borderColor: 'var(--po-line)', background: active ? 'var(--po-soft)' : undefined }}
                  >
                    <button
                      type="button"
                      title={column.name}
                      aria-pressed={active}
                      onClick={() => setFocused(active ? null : column.code)}
                      className="rounded-md px-2 py-1 text-xs font-bold hover:bg-[var(--po-soft)]"
                      style={{ color: active ? 'var(--po-accent)' : 'var(--po-ink)' }}
                    >
                      {column.label}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {TT02_DOMAINS.map((domain, index) => {
              const last = index === TT02_DOMAINS.length - 1;
              return (
                <tr key={domain.number}>
                  <th
                    scope="row"
                    className="px-3 py-2.5 text-left text-[13px] font-semibold"
                    style={{ borderBottom: last ? 'none' : '1px solid var(--po-line)', color: 'var(--po-ink)' }}
                  >
                    <span className="mr-2 inline-grid size-6 place-items-center rounded-md text-[10px] font-black" style={{ background: 'var(--po-soft)', color: 'var(--po-accent)' }}>
                      {String(domain.number).padStart(2, '0')}
                    </span>
                    {domain.name}
                    {domain.number === 6 && (
                      <span className="ml-1.5 text-[11px] font-normal italic" style={{ color: 'var(--po-muted)' }}>(mới, chưa khảo sát)</span>
                    )}
                  </th>
                  {COLUMNS.map((column) => (
                    <td
                      key={column.code}
                      className="px-2 py-2.5 text-center"
                      style={{
                        borderBottom: last ? 'none' : '1px solid var(--po-line)',
                        background: focused === column.code ? 'var(--po-soft)' : undefined,
                      }}
                    >
                      <LevelChip level={reference.levels[column.code]?.[domain.number - 1] ?? 0} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>}
    </section>
  );
}
