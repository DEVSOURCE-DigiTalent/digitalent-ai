import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Printer } from 'lucide-react';
import { usePersonalCertificates } from '@/hooks/use-personal-learning';
import { levelLabelVi, levelWithTier } from '@/lib/competency-levels';
import type { PersonalCertificate } from '@/services/personal-learning.service';
import { PtDialog } from '../components/PtDialog';
import {
  Card, EmptyState, ErrorBlock, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PT_EYEBROW, PageIntro, Tag
} from '../components/ui';
import { errorMessage } from '../utils/error-message';
import { formatDate } from '../utils/format';

/** IND-13 "/personal/certificates": one certificate per course passed, naming the competencies it confirms. */
export function LearnerCertificatesPage() {
  const { data, isLoading, isError, error, refetch } = usePersonalCertificates();
  const [selected, setSelected] = useState<PersonalCertificate | null>(null);

  return (
    <div data-testid="learner-certificates-page" className="grid gap-10">
      <PageIntro
        label="Chứng nhận"
        title="Chứng chỉ & Huy hiệu"
        accent="bạn đã đạt."
        lead="Mỗi khóa học bạn vượt qua bài đánh giá cuối khóa được cấp một chứng nhận, ghi rõ các năng lực và mức đạt theo Khung năng lực số của Thông tư 02/2025."
      />
      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message={errorMessage(error)} onRetry={() => refetch()} />}
      {data && data.length === 0 && (
        <EmptyState
          title="Chưa có chứng nhận nào"
          body="Học hết các bài của một khóa và đạt bài đánh giá cuối khóa để nhận chứng nhận đầu tiên."
          action={<Link to="/personal/path" className={PT_BUTTON}>Mở lộ trình</Link>}
        />
      )}
      {data && data.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.map((certificate) => (
            <Card as="li" key={certificate.id} className="relative flex flex-col justify-between gap-10 overflow-hidden p-7">
              <span aria-hidden="true" className="pointer-events-none absolute -right-6 -top-10 font-landing-serif text-[160px] italic leading-none text-pt-fg/5">
                {certificate.courseCode.split('-')[1]}
              </span>
              <div className="relative">
                <div className="flex flex-wrap gap-1.5">
                  <Tag>{levelLabelVi(certificate.level)}</Tag>
                  <Tag>{certificate.domainName}</Tag>
                </div>
                <h2 className="mt-5 text-[24px] font-normal leading-tight tracking-[-0.02em]">{certificate.courseTitle}</h2>
                <p className="mt-2 text-sm text-pt-fg-2">
                  Năng lực {certificate.competencies.map((competency) => competency.code).join(', ')} · đạt {certificate.scorePercent}%
                </p>
              </div>
              <div className="relative flex flex-wrap items-end justify-between gap-4 border-t border-pt-line pt-5">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  <dt className="text-pt-fg-3">Mã chứng nhận</dt>
                  <dt className="text-pt-fg-3">Ngày cấp</dt>
                  <dd className="font-mono text-pt-fg">{certificate.code}</dd>
                  <dd className="text-pt-fg">{formatDate(certificate.issuedAt)}</dd>
                </dl>
                <button type="button" onClick={() => setSelected(certificate)} className={PT_BUTTON_SECONDARY}>Xem chứng chỉ</button>
              </div>
            </Card>
          ))}
        </ul>
      )}

      <PtDialog open={Boolean(selected)} onClose={() => setSelected(null)} title="Chứng nhận năng lực số" className="max-w-3xl">
        {selected && <CertificateSheet certificate={selected} />}
      </PtDialog>
    </div>
  );
}

function CertificateSheet({ certificate }: { certificate: PersonalCertificate }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(certificate.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid gap-5">
      {/* A document: the same cream paper in both themes, and what gets printed. */}
      <article className="pt-print relative overflow-hidden rounded-2xl bg-[#f4f1e6] px-7 py-10 text-center text-[#1c1b16] sm:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-xl border border-[#1c1b16]/15" />
        <p className="text-sm font-semibold tracking-[-0.04em]">DigiTalent<sup className="ml-[2px] text-[0.55em]">AI</sup></p>
        <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-[#1c1b16]/60">Chứng nhận hoàn thành khóa học</p>
        <p className="mt-6 text-sm text-[#1c1b16]/70">Trao cho</p>
        <p className="mt-1 font-landing-serif text-[clamp(30px,5vw,44px)] italic leading-tight">{certificate.recipientName}</p>
        <p className="mx-auto mt-5 max-w-[46ch] text-sm leading-relaxed text-[#1c1b16]/80">
          đã hoàn thành khóa <span className="font-medium">{certificate.courseCode} · {certificate.courseTitle}</span> và đạt bài đánh giá cuối khóa
          với {certificate.scorePercent}%, ở mức {levelWithTier(certificate.level, 'vi')} của miền {certificate.domainName}.
        </p>
        <ul className="mx-auto mt-6 grid max-w-md gap-1 text-left text-xs text-[#1c1b16]/75">
          {certificate.competencies.map((competency) => (
            <li key={competency.code} className="flex gap-2"><span className="w-7 shrink-0 tabular-nums text-[#1c1b16]/50">{competency.code}</span>{competency.name}</li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-[#1c1b16]/15 pt-5 text-left text-[11px] text-[#1c1b16]/65">
          <span>Mã: <span className="font-mono text-[#1c1b16]">{certificate.code}</span></span>
          <span>Ngày cấp: {formatDate(certificate.issuedAt)}</span>
          <span>Căn cứ Thông tư 02/2025/TT-BGDĐT</span>
        </div>
      </article>
      <div className="flex flex-wrap justify-end gap-2">
        <span role="status" className="mr-auto self-center text-xs text-pt-fg-3">{copied ? 'Đã sao chép mã chứng nhận.' : ''}</span>
        <button type="button" onClick={copy} className={PT_BUTTON_SECONDARY}><Copy className="size-4" aria-hidden="true" /> Sao chép mã</button>
        <button type="button" onClick={() => window.print()} className={PT_BUTTON}><Printer className="size-4" aria-hidden="true" /> In chứng nhận</button>
      </div>
      <p className={PT_EYEBROW}>Chứng nhận ghi nhận kết quả học trên DigiTalent AI, không phải văn bằng nhà nước.</p>
    </div>
  );
}
