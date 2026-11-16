import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { PlatformOrganization } from '@/services/platform-admin.service';
import type { PlatformTrialItem } from '@/services/trial-program.service';
import { formatNumber } from '../../components/pulse-format';

const HOUR_MS = 60 * 60 * 1000;
const DUE_SOON_HOURS = 48;
const ATTENTION_LIMIT = 6;

type Severity = 'danger' | 'warn' | 'info';

interface AttentionRow {
  key: string;
  organizationId: string;
  organizationName: string;
  reason: string;
  tag: string;
  severity: Severity;
}

const SEVERITY_ORDER: Record<Severity, number> = { danger: 0, warn: 1, info: 2 };

function percent(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/**
 * Phễu dùng thử: tổ chức đăng ký thử → gửi yêu cầu chấm → có báo cáo → mua khóa.
 * "Đã mua khóa" chỉ tính tổ chức có trong danh sách dùng thử, nên tỷ lệ cuối là tỷ lệ chuyển đổi thật của luồng thử.
 */
export function TrialFunnelCard({ trials, organizations }: { trials: PlatformTrialItem[]; organizations: PlatformOrganization[] }) {
  useUiLanguage();
  const paidIds = new Set(organizations.filter((o) => o.stage === 'PAID').map((o) => o.id));
  const steps = [
    { key: 'registered', label: 'Đăng ký dùng thử', value: trials.length },
    { key: 'requested', label: 'Đã gửi yêu cầu chấm', value: trials.filter((t) => t.stage !== 'SETUP').length },
    { key: 'reported', label: 'Đã có báo cáo', value: trials.filter((t) => t.stage === 'REPORTED').length },
    { key: 'paid', label: 'Đã mua khóa', value: trials.filter((t) => paidIds.has(t.organizationId)).length },
  ];
  const first = steps[0].value;

  return (
    <section className="pa-ov-panel" aria-labelledby="pa-funnel-title">
      <div className="pa-ov-panel-head">
        <div>
          <h2 className="pa-ov-panel-title" id="pa-funnel-title">{translateUi('Phễu dùng thử')}</h2>
          <p className="pa-ov-panel-sub">{translateUi('Từ đăng ký thử đến mua khóa, tính trên mọi tổ chức dùng thử')}</p>
        </div>
      </div>

      {first === 0 ? (
        <div className="pa-ov-empty-inline">
          <p>{translateUi('Chưa có tổ chức nào đăng ký dùng thử.')}</p>
        </div>
      ) : (
        <ol className="pa-funnel" aria-label={translateUi('Các bước của phễu dùng thử')}>
          {steps.map((step, index) => {
            const share = percent(step.value, first);
            return (
              <li key={step.key} className={`pa-funnel-row${index === steps.length - 1 ? ' is-final' : ''}`}>
                <span className="pa-funnel-label">{translateUi(step.label)}</span>
                <span className="pa-funnel-value">
                  <strong className="pa-insight-count">{formatNumber(step.value)}</strong>
                  {index > 0 && `${share}%`}
                </span>
                <span className="pa-funnel-track" aria-hidden="true">
                  <span className="pa-funnel-bar" style={{ transform: `scaleX(${share / 100})` }} />
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="pa-ov-panel-foot">
        <Link to="/platform/trials" className="pa-box-link">
          <span>{translateUi('Mở đánh giá dùng thử')}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function trialRows(trials: PlatformTrialItem[], now: number): AttentionRow[] {
  const rows: AttentionRow[] = [];
  for (const t of trials) {
    if (t.stage === 'REPORTED' || !t.testDeadline) continue;
    const deadline = new Date(t.testDeadline).getTime();
    if (Number.isNaN(deadline)) continue;
    const base = { organizationId: t.organizationId, organizationName: t.organizationName };

    if (deadline < now && t.submitted === 0) {
      rows.push({ ...base, key: `${t.organizationId}-expired`, severity: 'danger', tag: 'Dùng thử',
        reason: `Đã hết hạn nộp bài, chưa ai nộp (0/${t.participants})` });
    } else if (deadline < now && t.stage === 'ASSIGNED' && t.reviewed < t.submitted) {
      rows.push({ ...base, key: `${t.organizationId}-grading`, severity: 'warn', tag: 'Dùng thử',
        reason: `Đã hết hạn nộp, mentor mới chấm ${t.reviewed}/${t.submitted} bài` });
    } else if (deadline >= now && deadline - now <= DUE_SOON_HOURS * HOUR_MS && t.submitted < t.participants) {
      const hours = Math.max(1, Math.round((deadline - now) / HOUR_MS));
      rows.push({ ...base, key: `${t.organizationId}-due`, severity: 'warn', tag: 'Dùng thử',
        reason: `Còn ${hours} giờ, ${t.submitted}/${t.participants} người đã nộp` });
    }
  }
  return rows;
}

function organizationRows(organizations: PlatformOrganization[]): AttentionRow[] {
  const rows: AttentionRow[] = [];
  for (const o of organizations) {
    const base = { organizationId: o.id, organizationName: o.name };
    if (o.status === 'SUSPENDED') {
      rows.push({ ...base, key: `${o.id}-suspended`, severity: 'danger', tag: 'Tổ chức', reason: 'Đang tạm ngưng, nhân viên không đăng nhập được' });
    } else if (o.stage === 'PAID' && o.participantCount === 0) {
      rows.push({ ...base, key: `${o.id}-idle`, severity: 'warn', tag: 'Đã mua khóa',
        reason: `Đã mua ${formatNumber(o.seatsPurchased)} suất, chưa nhân viên nào học` });
    }
    if (!o.ownerEmail) {
      rows.push({ ...base, key: `${o.id}-owner`, severity: 'info', tag: 'Tổ chức', reason: 'Chưa có chủ doanh nghiệp' });
    }
  }
  return rows;
}

/** Tổ chức cần admin can thiệp, sắp theo mức độ: tạm ngưng hoặc quá hạn trước, thiếu chủ doanh nghiệp sau. */
export function AttentionListCard({ trials, organizations }: { trials: PlatformTrialItem[]; organizations: PlatformOrganization[] }) {
  useUiLanguage();
  const [now] = useState(() => Date.now());
  const rows = [...trialRows(trials, now), ...organizationRows(organizations)]
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  const shown = rows.slice(0, ATTENTION_LIMIT);

  return (
    <section className="pa-ov-panel" aria-labelledby="pa-attention-title">
      <div className="pa-ov-panel-head">
        <div>
          <h2 className="pa-ov-panel-title" id="pa-attention-title">{translateUi('Tổ chức cần chú ý')}</h2>
          <p className="pa-ov-panel-sub">
            {rows.length === 0
              ? translateUi('Không có tổ chức nào cần can thiệp')
              : `${rows.length} ${translateUi('trường hợp, sắp theo mức độ')}`}
          </p>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="pa-ov-empty-inline">
          <p>{translateUi('Không có tổ chức quá hạn, tạm ngưng hoặc đã mua mà chưa học.')}</p>
        </div>
      ) : (
        <ul className="pa-attention-list">
          {shown.map((row) => (
            <li key={row.key} className="pa-attention-item">
              <span className={`pa-attention-dot is-${row.severity}`} aria-hidden="true" />
              <div style={{ minWidth: 0 }}>
                <Link to={`/platform/organizations/${row.organizationId}`} className="pa-attention-name">
                  {row.organizationName}
                </Link>
                <div className="pa-attention-reason">{translateUi(row.reason)}</div>
              </div>
              <span className="pa-attention-tag">{translateUi(row.tag)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="pa-ov-panel-foot">
        <Link to="/platform/organizations" className="pa-box-link">
          <span>{translateUi('Xem tất cả tổ chức')}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
