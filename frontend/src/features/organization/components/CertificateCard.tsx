import { formatDate } from '@/lib/utils';

interface CertificateCardProps {
  title: string;
  employeeName: string;
  issueDate: string;
}

export function CertificateCard({ title, employeeName, issueDate }: CertificateCardProps) {
  return (
    <div
      className="grid gap-[10px] rounded-2xl p-[23px] transition-all hover:-translate-y-0.5"
      style={{
        minHeight: 190,
        border: '1px solid #dce4f3',
        background: 'linear-gradient(125deg, #fff, #f1f4ff)',
        color: 'var(--po-ink)',
      }}
    >
      <span
        className="text-[10px] font-black uppercase tracking-[0.12em]"
        style={{ color: 'var(--po-muted)' }}
      >
        DIGITAL AI / XÁC MINH
      </span>
      <strong
        className="leading-[1.15]"
        style={{ fontSize: 23, letterSpacing: '-0.04em' }}
      >
        {title}
      </strong>
      <small className="text-[11px]" style={{ color: '#64738e' }}>
        {employeeName} · {formatDate(issueDate)}
      </small>
      <em
        className="self-end text-[11px] font-[850] not-italic"
        style={{ color: '#137b84' }}
      >
        Xem chứng nhận ↗
      </em>
    </div>
  );
}
