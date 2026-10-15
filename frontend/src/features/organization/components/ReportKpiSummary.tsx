interface KpiItem {
  label: string;
  value: number | string;
  sub: string;
}

interface ReportKpiSummaryProps {
  approved: number;
  learners: number;
  submissions: number;
  underway: number;
}

export function ReportKpiSummary({
  approved,
  learners,
  submissions,
  underway,
}: ReportKpiSummaryProps) {
  const items: KpiItem[] = [
    { label: 'Khóa hoàn thành', value: approved, sub: 'Manager đã xác nhận' },
    { label: 'Học viên trong chu kỳ', value: learners, sub: 'Trong phạm vi hiển thị' },
    { label: 'Bài đánh giá đã chấm', value: submissions, sub: 'Bao gồm lần thi lại' },
    { label: 'Khóa đang triển khai', value: underway, sub: 'Có thể vào báo cáo sau' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[20px] border p-5"
          style={{
            borderColor: 'rgba(209,221,245,.55)',
            background: 'var(--po-surface)',
            boxShadow: '0 6px 20px rgba(20,38,100,.03)',
            transition:
              'transform .22s cubic-bezier(.2,.7,.35,1), box-shadow .22s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow =
              '0 12px 32px rgba(20,38,100,.07)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow =
              '0 6px 20px rgba(20,38,100,.03)';
          }}
        >
          <span className="text-[10px]" style={{ color: 'var(--po-muted)' }}>
            {item.label}
          </span>
          <strong
            className="block text-[28px] tabular-nums"
            style={{
              color: 'var(--po-ink)',
              letterSpacing: '-0.06em',
              margin: '8px 0 2px',
            }}
          >
            {item.value}
          </strong>
          <small className="text-[11px]" style={{ color: '#8c99ae' }}>
            {item.sub}
          </small>
        </div>
      ))}
    </div>
  );
}
