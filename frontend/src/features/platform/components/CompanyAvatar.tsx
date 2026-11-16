const COMPANY_PREFIX_REGEX =
  /^(công ty cổ phần công nghệ|công ty cổ phần thương mại dịch vụ|công ty cổ phần thương mại|công ty cổ phần giáo dục số|công ty cổ phần giáo dục|công ty cổ phần đầu tư|công ty cổ phần logistics|công ty cổ phần|công ty tnhh một thành viên|công ty tnhh mtv|công ty tnhh thương mại|công ty tnhh dịch vụ|công ty tnhh|công ty cp|công ty|tập đoàn bưu chính viễn thông|tập đoàn công nghệ|tập đoàn viễn thông|tập đoàn|tổng công ty|doanh nghiệp tư nhân|doanh nghiệp|ngân hàng tmcp|ngân hàng)\s+/i;

function getCompanyInitials(name: string): string {
  if (!name) return 'DN';
  const lower = name.toLowerCase();
  if (lower.includes('bưu chính viễn thông') || lower.includes('vnpt')) return 'VN';
  if (lower.includes('viettel')) return 'VT';
  if (lower.includes('fpt')) return 'FP';
  if (lower.includes('fuwa')) return 'FW';

  const clean = name.replace(COMPANY_PREFIX_REGEX, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return name.slice(0, 2).toUpperCase();

  if (words.length === 1) {
    const w = words[0];
    const camel = w.match(/([A-Z][a-z]+)([A-Z][a-z]+)/);
    if (camel) return (camel[1][0] + camel[2][0]).toUpperCase();
    return w.slice(0, 2).toUpperCase();
  }

  const first = words[0];
  const second = words[1];
  const camelFirst = first.match(/([A-Z][a-z]+)([A-Z][a-z]+)/);
  if (camelFirst) return (camelFirst[1][0] + camelFirst[2][0]).toUpperCase();

  return (first[0] + second[0]).toUpperCase();
}

export function CompanyAvatar({
  name,
  size = 36,
  className = '',
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initialsText = getCompanyInitials(name);
  const fontSize = Math.max(12, Math.round(size * 0.35));
  const borderRadius = Math.max(7, Math.round(size * 0.24));

  return (
    <div
      className={`pa-tr-monogram ${className}`}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius,
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '1px solid #bfdbfe',
        color: '#1d4ed8',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 1px 2px rgba(37, 99, 235, 0.08)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize,
        letterSpacing: '0.02em',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {initialsText}
    </div>
  );
}
