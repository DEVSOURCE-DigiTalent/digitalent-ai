import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useCertificates } from '@/hooks/use-learning';
import { CertificateCard } from '../components/CertificateCard';

const PULSE_TOKENS = {
  '--po-canvas': '#f7f9fd',
  '--po-surface': '#fff',
  '--po-ink': '#172442',
  '--po-muted': '#62718d',
  '--po-accent': '#304bdf',
  '--po-accent-strong': '#203bbf',
  '--po-coral': '#ef735c',
  '--po-line': '#dfe6f3',
  '--po-soft': '#eef2ff',
  '--po-tint': '#edf1ff',
} as React.CSSProperties;

export function OwnerCertificatesPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useCertificates({ search: search || undefined, pageSize: 50 });
  const certificates = data?.items ?? [];

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
      <section className="px-4 md:px-6 pt-8 pb-2 mx-auto" style={{ maxWidth: 1220 }}>
        <p
          className="text-[10px] font-black uppercase tracking-[0.12em]"
          style={{ color: 'var(--po-muted)' }}
        >
          35 / Chứng nhận
          <span
            className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
            style={{ background: 'var(--po-coral)' }}
          />
        </p>
        <h1
          className="mt-[11px] text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.08]"
          style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
        >
          Kết quả đã xác minh
        </h1>
        <p
          className="mt-2 text-sm leading-relaxed max-w-[58ch]"
          style={{ color: 'var(--po-muted)' }}
        >
          Chứng nhận với nguồn truy vết rõ ràng. Mỗi bản ghi gắn với bài cuối khóa
          đã được duyệt hoặc minh chứng thực tế do Quản lý phê duyệt.
        </p>
      </section>

      {/* ── Search ── */}
      <section className="px-4 md:px-6 pt-4 pb-2 mx-auto" style={{ maxWidth: 1220 }}>
        <div className="relative max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
            style={{ color: 'var(--po-muted)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã chứng nhận, khóa học…"
            className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs outline-none transition focus:ring-2"
            style={{
              background: 'var(--po-surface)',
              borderColor: 'var(--po-line)',
              color: 'var(--po-ink)',
            }}
          />
        </div>
      </section>

      {/* ── Certificates grid ── */}
      <section className="px-4 md:px-6 py-6 mx-auto" style={{ maxWidth: 1220 }}>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl"
                style={{
                  background: 'linear-gradient(125deg, #fff, #f1f4ff)',
                  border: '1px solid var(--po-line)',
                  minHeight: 190,
                }}
              />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'var(--po-surface)',
              border: '1px solid var(--po-line)',
            }}
          >
            <h2
              className="text-lg font-bold"
              style={{ color: 'var(--po-ink)', letterSpacing: '-0.04em' }}
            >
              Chưa có chứng nhận nào được cấp.
            </h2>
            <p className="mt-2 text-xs" style={{ color: 'var(--po-muted)' }}>
              Duyệt bài cuối khóa hoặc minh chứng thực tế để tạo bản ghi có thể truy vết.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            {certificates.map((cert) => (
              <Link key={cert.id} to={`/enterprise/certificates/${cert.id}`}>
                <CertificateCard
                  title={cert.courseTitle}
                  employeeName={cert.employeeName}
                  issueDate={cert.issueDate}
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
