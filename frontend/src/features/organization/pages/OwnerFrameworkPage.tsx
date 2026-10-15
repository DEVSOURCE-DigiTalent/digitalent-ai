import { Link } from 'react-router-dom';
import {
  useCompetencyCategories,
  useCompetencies,
} from '@/hooks/use-competencies';
import { FrameworkDomainList } from '../components/FrameworkDomainList';

const PULSE_TOKENS = {
  '--po-canvas': '#f7f9fd',
  '--po-surface': '#fff',
  '--po-ink': '#172442',
  '--po-muted': '#62718d',
  '--po-accent': '#304bdf',
  '--po-accent-strong': '#203bbf',
  '--po-coral': '#ef735c',
  '--po-lime': '#c6ec78',
  '--po-line': '#dfe6f3',
  '--po-soft': '#eef2ff',
  '--po-tint': '#edf1ff',
  '--po-warm': '#f1816b',
} as React.CSSProperties;

export function OwnerFrameworkPage() {
  const { data: categories = [], isLoading: catLoading } =
    useCompetencyCategories();
  const { data: compData, isLoading: compLoading } = useCompetencies({
    pageIndex: 1,
    pageSize: 100,
    status: 'ACTIVE',
  });

  const competencies = compData?.items ?? [];
  const isLoading = catLoading || compLoading;

  return (
    <div
      className="-m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, #dce5ff 0%, transparent 65%)',
      }}
    >
      {/* ── Page header ── */}
      <section
        className="px-4 md:px-6 pt-8 pb-2 mx-auto"
        style={{ maxWidth: 1220 }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.12em]"
          style={{ color: 'var(--po-muted)' }}
        >
          14 / Khung năng lực
          <span
            className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
            style={{ background: 'var(--po-coral)' }}
          />
        </p>
        <h1
          className="mt-[11px] text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.08]"
          style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
        >
          Chuẩn Digital AI chung.
        </h1>
        <p
          className="mt-2 text-sm leading-relaxed max-w-[58ch]"
          style={{ color: 'var(--po-muted)' }}
        >
          Sáu miền năng lực. Ba mức rõ ràng. Chuẩn Thông tư 02/2025 là trần
          cao nhất. Owner thiết lập trần doanh nghiệp, phòng ban và mục tiêu vị
          trí bên trong khung này.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/enterprise/setup"
            className="rounded-[11px] border px-4 py-2.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
            style={{
              borderColor: 'var(--po-line)',
              color: 'var(--po-ink)',
              background: 'var(--po-surface)',
            }}
          >
            Sửa kiến trúc doanh nghiệp
          </Link>
          <Link
            to="/enterprise/skill-gap"
            className="rounded-[11px] px-4 py-2.5 text-xs font-extrabold transition-opacity hover:opacity-70"
            style={{ color: 'var(--po-muted)' }}
          >
            Xem khoảng trống năng lực
          </Link>
        </div>
      </section>

      {/* ── Domain grid ── */}
      <div
        className="px-4 md:px-6 py-5 mx-auto"
        style={{ maxWidth: 1220 }}
      >
        <FrameworkDomainList
          categories={categories}
          competencies={competencies}
          isLoading={isLoading}
        />
      </div>

      {/* ── Hierarchy explanation ── */}
      <div
        className="px-4 md:px-6 pb-8 mx-auto"
        style={{ maxWidth: 1220 }}
      >
        <div
          className="rounded-[22px] border p-6"
          style={{
            borderColor: 'var(--po-line)',
            background: 'var(--po-surface)',
            boxShadow: '0 10px 35px rgba(29,48,102,.025)',
          }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.12em]"
            style={{ color: 'var(--po-muted)' }}
          >
            Cách chuẩn trở thành mục tiêu cá nhân
          </p>
          <h2
            className="mt-[11px] text-xl font-semibold"
            style={{
              color: 'var(--po-ink)',
              letterSpacing: '-0.045em',
            }}
          >
            Digital AI ≥ Doanh nghiệp ≥ Phòng ban ≥ Vị trí
          </h2>
          <p
            className="mt-2 text-xs leading-relaxed max-w-[65ch]"
            style={{ color: 'var(--po-muted)' }}
          >
            Chỉ Platform Admin công bố nội dung gốc. Doanh nghiệp thiết kế trần
            và vị trí riêng; mức năng lực hiện tại đã xác nhận của nhân viên
            được so sánh với mục tiêu tại vị trí của họ.
          </p>
        </div>
      </div>
    </div>
  );
}
