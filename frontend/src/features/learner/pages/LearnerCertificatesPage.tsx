import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Printer } from 'lucide-react';
import { usePersonalCertificates } from '@/hooks/use-personal-learning';
import { formatDmy } from '@/lib/personal-access';
import { levelLabelVi } from '@/lib/competency-levels';
import type { PersonalCertificate } from '@/services/personal-learning.service';
import { PtDialog } from '../components/PtDialog';
import { UpgradeLink } from '../components/UpgradeLink';
import {
  Card, EmptyState, ErrorBlock, LoadingBlock, PT_BUTTON, PT_BUTTON_SECONDARY, PT_EYEBROW, PersonalPageHeader, Tag
} from '../components/ui';
import { errorMessage } from '../utils/error-message';
import { formatDate } from '../utils/format';
import { CertificateDocument } from '../components/CertificateDocument';

/** A certificate that has been issued: it has a code and a date, and can be shown and printed. */
type IssuedCertificate = PersonalCertificate & { code: string; issuedAt: string };

const isIssued = (certificate: PersonalCertificate): certificate is IssuedCertificate =>
  certificate.status === 'ISSUED' && certificate.code !== null && certificate.issuedAt !== null;

/** IND-13 "/personal/certificates": one certificate per course passed, naming the competencies it confirms. */
export function LearnerCertificatesPage() {
  const { data, isLoading, isError, error, refetch } = usePersonalCertificates();
  const [selected, setSelected] = useState<IssuedCertificate | null>(null);
  const pending = data?.filter((certificate) => !isIssued(certificate)).length ?? 0;

  return (
    <div data-testid="learner-certificates-page" className="grid gap-10">
      <PersonalPageHeader
        label="Chứng nhận"
        title="Chứng nhận hoàn thành khóa học"
        lead="Tài liệu ghi nhận khóa học đã hoàn thành và kết quả đánh giá liên quan."
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
      {pending > 0 && (
        <Card className="flex flex-col gap-4 border-[#E5A93C]/50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-pt-fg-2">
            Bạn có {pending} chứng nhận chờ cấp. Nâng cấp để phát hành, không cần làm lại bài.
          </p>
          <UpgradeLink placement="certificates">Nâng cấp Plus</UpgradeLink>
        </Card>
      )}
      {data && data.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.map((certificate) => (
            <Card as="li" key={certificate.id} className="relative flex flex-col justify-between gap-6 overflow-hidden p-6">
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
                {isIssued(certificate) ? (
                  <>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      <dt className="text-pt-fg-3">Mã chứng nhận</dt>
                      <dt className="text-pt-fg-3">Ngày cấp</dt>
                      <dd className="font-mono text-pt-fg">{certificate.code}</dd>
                      <dd className="text-pt-fg">{formatDate(certificate.issuedAt)}</dd>
                    </dl>
                    <button type="button" onClick={() => setSelected(certificate)} className={PT_BUTTON_SECONDARY}>Xem chứng nhận</button>
                  </>
                ) : (
                  <div className="grid gap-2">
                    <Tag tone="warn" className="w-fit">Chờ cấp</Tag>
                    <p className="text-xs text-pt-fg-2">Đạt ngày {formatDmy(certificate.passedAt)} · cấp khi nâng cấp gói</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </ul>
      )}

      <PtDialog open={Boolean(selected)} onClose={() => setSelected(null)} title="Chứng nhận hoàn thành khóa học" className="max-w-4xl">
        {selected && <CertificateModalContent certificate={selected} />}
      </PtDialog>
    </div>
  );
}

function CertificateModalContent({ certificate }: { certificate: IssuedCertificate }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(certificate.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  const verifyPath = `/verify/${certificate.code}`;

  return (
    <div className="grid gap-5">
      {/* Print CSS Injection specifically for this certificate modal */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          .certificate-print-sheet, .certificate-print-sheet * {
            visibility: visible;
          }
          .certificate-print-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 36px 48px !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Chuẩn CertificateDocument A4 Landscape */}
      <div className="overflow-x-auto pb-2">
        <CertificateDocument certificate={certificate} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pt-line pt-4">
        <div className="flex items-center gap-2">
          {copied && <span role="status" className="text-xs font-medium text-emerald-600">Đã sao chép mã chứng nhận vào bộ nhớ tạm.</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={verifyPath} target="_blank" rel="noopener noreferrer" className={PT_BUTTON_SECONDARY}>
            Tra cứu công khai
          </Link>
          <button type="button" onClick={copy} className={PT_BUTTON_SECONDARY}>
            <Copy className="size-4" aria-hidden="true" /> Sao chép mã
          </button>
          <button type="button" onClick={() => window.print()} className={PT_BUTTON}>
            <Printer className="size-4" aria-hidden="true" /> In / Tải PDF
          </button>
        </div>
      </div>
      <p className={PT_EYEBROW}>
        Chứng chỉ số DigiTalent AI xác thực kỹ năng theo Khung chuẩn năng lực số Thông tư 02/2025/TT-BGDĐT. Dùng mã hoặc quét mã QR để tra cứu công khai mọi lúc.
      </p>
    </div>
  );
}
