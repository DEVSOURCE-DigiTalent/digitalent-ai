import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCertificates } from '@/hooks/use-learning';
import { useOrganizationOverview } from '@/hooks/use-organization';
import { formatDate } from '@/lib/utils';
import { PULSE_TOKENS } from '../owner-theme';

export function OwnerCertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useCertificates({ pageSize: 100 });
  const { data: orgData } = useOrganizationOverview();
  const cert = (data?.items ?? []).find((c) => c.id === id);

  if (!cert) {
    return (
      <div
        className="po-owner -m-4 md:-m-6 min-h-screen"
        style={{ ...PULSE_TOKENS, background: 'var(--po-canvas)' }}
      >
        <section className="px-4 md:px-6 pt-8 pb-2 mx-auto" style={{ maxWidth: 1220 }}>
          <p
            className="text-[10px] font-black uppercase tracking-[0.12em]"
            style={{ color: 'var(--po-muted)' }}
          >
            36 / Chứng nhận
            <span
              className="ml-[7px] inline-block size-1.5 rounded-full align-middle"
              style={{ background: 'var(--po-coral)' }}
            />
          </p>
          <h1
            className="mt-[11px] text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.08]"
            style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
          >
            Chứng nhận không khả dụng
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--po-muted)' }}>
            Bản ghi này nằm ngoài phạm vi xem của bạn.
          </p>
          <Link
            to="/enterprise/certificates"
            className="mt-4 inline-flex rounded-[11px] border px-4 py-2.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
            style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
          >
            Quay lại danh sách chứng nhận
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div
      className="po-owner -m-4 md:-m-6 min-h-screen"
      style={{
        ...PULSE_TOKENS,
        background: 'var(--po-canvas)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% 0%, var(--po-glow) 0%, transparent 65%)',
      }}
    >
      {/* ── Page header ── */}
      <section className="px-4 md:px-6 pt-8 pb-2 mx-auto" style={{ maxWidth: 1220 }}>
        <p
          className="text-[10px] font-black uppercase tracking-[0.12em]"
          style={{ color: 'var(--po-muted)' }}
        >
          36 / Chứng nhận
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
        <p className="mt-2 text-sm" style={{ color: 'var(--po-muted)' }}>
          Chứng nhận với nguồn truy vết rõ ràng. Đây là bản xem trước nội bộ, không tạo
          chứng nhận ký số công khai.
        </p>
        <Link
          to="/enterprise/certificates"
          className="mt-4 inline-flex rounded-[11px] border px-4 py-2.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
          style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
        >
          Tất cả chứng nhận
        </Link>
      </section>

      {/* ── Certificate document ── */}
      <section className="px-4 md:px-6 py-6 mx-auto" style={{ maxWidth: 900 }}>
        <div
          className="relative isolate overflow-hidden rounded-[20px]"
          style={{
            padding: 'clamp(35px, 6vw, 70px)',
            border: '1px solid #cbd6ee',
            background: 'var(--po-surface)',
            boxShadow: '0 30px 70px rgba(34,53,107,.08)',
          }}
        >
          <span
            className="text-[10px] font-black uppercase tracking-[0.12em]"
            style={{ color: 'var(--po-muted)' }}
          >
            DIGITAL AI · PULSE
          </span>

          <h2
            className="max-w-[620px] leading-[1.06]"
            style={{
              fontSize: 'clamp(33px, 4vw, 54px)',
              letterSpacing: '-0.06em',
              margin: '22px 0',
              color: 'var(--po-ink)',
            }}
          >
            Chứng nhận năng lực đã xác minh
          </h2>

          <p className="text-xs" style={{ color: 'var(--po-ink)' }}>
            Cấp cho
          </p>

          <strong
            className="block"
            style={{
              fontSize: 'clamp(24px, 3vw, 37px)',
              color: '#137b84',
            }}
          >
            {cert.employeeName}
          </strong>

          <h3
            className="text-2xl font-bold"
            style={{
              margin: '10px 0 25px',
              color: 'var(--po-ink)',
            }}
          >
            {cert.courseTitle}
          </h3>

          {/* ── Metadata ── */}
          <div
            className="flex flex-wrap gap-[30px] pt-5 mt-8"
            style={{ borderTop: '1px solid #dce4f3' }}
          >
            <span className="min-w-[120px] text-[10px]" style={{ color: 'var(--po-muted)' }}>
              Tổ chức
              <b className="mt-[5px] block text-xs" style={{ color: 'var(--po-ink)' }}>
                {orgData?.name ?? 'DigiTalent AI'}
              </b>
            </span>
            <span className="min-w-[120px] text-[10px]" style={{ color: 'var(--po-muted)' }}>
              Ngày cấp
              <b className="mt-[5px] block text-xs" style={{ color: 'var(--po-ink)' }}>
                {formatDate(cert.issueDate)}
              </b>
            </span>
            <span className="min-w-[120px] text-[10px]" style={{ color: 'var(--po-muted)' }}>
              Mã tham chiếu
              <b className="mt-[5px] block text-xs" style={{ color: 'var(--po-ink)' }}>
                {cert.certificateCode}
              </b>
            </span>
          </div>

          <p
            className="mt-6 max-w-[650px] text-xs"
            style={{ color: 'var(--po-ink)' }}
          >
            Nguồn: Bài cuối khóa đã được Quản lý phê duyệt. Điểm:{' '}
            {cert.score}/100. Năng lực xác nhận:{' '}
            {cert.frameworkCompetencyCodes
              .map((c) => `CMP-${c.replace(/^TT02-/, '')}`)
              .join(', ')}
            .
          </p>
        </div>

        {/* ── Print button ── */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => {
              toast.success('In bản ghi chứng nhận (bản xem trước)…');
              window.print();
            }}
            className="rounded-[11px] border px-4 py-2.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
            style={{ borderColor: 'var(--po-line)', color: 'var(--po-ink)' }}
          >
            In bản ghi này ↗
          </button>
        </div>
      </section>
    </div>
  );
}
