import { useState } from 'react';
import { toast } from 'sonner';
import { useReferencePositionLevels, useUpdateReferencePositionLevels } from '@/hooks/use-reference-position-levels';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { REFERENCE_POSITIONS, TT02_DOMAINS } from '@/lib/reference-positions';
import { errorMessage } from '../components/pulse-format';
import { Footer, PageHead } from '../components/pulse-ui';

const LEVELS = ['—', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

export function PlatformReferencePositions() {
  const { data, isLoading, isError } = useReferencePositionLevels();
  return (
    <section className="surface pad pa-gap-top" aria-labelledby="reference-positions-title">
      <div className="pa-card-head">
        <div>
          <h2 id="reference-positions-title" className="panel-title">Mức năng lực tham chiếu theo vị trí</h2>
          <p className="panel-desc">Năm vị trí mẫu của DigiTalent. Doanh nghiệp xem bảng này để tham khảo và tự đặt yêu cầu riêng. Sửa mẫu không tự đổi yêu cầu doanh nghiệp đã áp dụng.</p>
        </div>
      </div>
      {isLoading && <p>Đang tải mức tham chiếu…</p>}
      {isError && <p role="alert">Chưa tải được mức tham chiếu.</p>}
      {data && <ReferenceEditor key={data.version} version={data.version} initial={data.levels} />}
    </section>
  );
}

export function PlatformReferencePositionsPage() {
  return <>
    <PageHead eyebrow="Nền tảng / Mẫu vị trí" title="Mức năng lực tham chiếu." description="Quản lý 5 mẫu vị trí mà doanh nghiệp có thể xem để đặt mục tiêu riêng." />
    <PlatformReferencePositions />
    <Footer />
  </>;
}

function ReferenceEditor({ version, initial }: { version: number; initial: Record<string, number[]> }) {
  const { can } = usePermission();
  const canEdit = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const save = useUpdateReferencePositionLevels();
  const [levels, setLevels] = useState(() => Object.fromEntries(Object.entries(initial).map(([code, values]) => [code, [...values]])));
  const dirty = JSON.stringify(levels) !== JSON.stringify(initial);

  const change = (code: string, index: number, value: number) => {
    setLevels((current) => ({ ...current, [code]: current[code].map((level, i) => i === index ? value : level) }));
  };
  const submit = async () => {
    try {
      await save.mutateAsync({ version, levels });
      toast.success('Đã cập nhật bảng tham chiếu cho doanh nghiệp.');
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[690px] text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead><tr>
            <th className="px-3 py-3 text-left">Miền năng lực</th>
            {REFERENCE_POSITIONS.map((position) => <th key={position.code} className="px-2 py-3 text-center">{position.name}</th>)}
          </tr></thead>
          <tbody>{TT02_DOMAINS.map((domain, index) => <tr key={domain.number} style={{ borderTop: '1px solid #dce3f3' }}>
            <th className="px-3 py-3 text-left font-medium">{String(domain.number).padStart(2, '0')} · {domain.name}</th>
            {REFERENCE_POSITIONS.map((position) => <td key={position.code} className="px-2 py-2 text-center">
              {canEdit ? <select
                aria-label={`${position.name} · ${domain.name}`}
                value={levels[position.code]?.[index] ?? 1}
                onChange={(event) => change(position.code, index, Number(event.target.value))}
                className="rounded-lg border px-2 py-2"
              >{[1, 2, 3].map((level) => <option value={level} key={level}>{LEVELS[level]}</option>)}</select>
                : LEVELS[levels[position.code]?.[index] ?? 0]}
            </td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <div className="button-row pa-gap-top">
        <span className="pa-hint">Phiên bản tham chiếu {version} · chỉ quản trị nền tảng được sửa.</span>
        {canEdit && <button type="button" className="btn btn-primary" disabled={!dirty || save.isPending} onClick={submit}>
          {save.isPending ? 'Đang lưu…' : 'Lưu mức tham chiếu'}
        </button>}
      </div>
    </>
  );
}
