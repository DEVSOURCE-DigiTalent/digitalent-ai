import type { PlatformOrganization } from '@/services/platform-admin.service';
import { formatDate } from '../../components/pulse-format';

/** Mã nội bộ dạng TRIAL-<32 ký tự> không có ích khi đọc: chỉ hiện mã ngắn như DIGITALENT. */
function readableOrgCode(code: string | null | undefined): string | null {
  return code && code.length <= 20 ? code : null;
}

/** The one line under the organization name (page header and drawer): owner, code, registration date. */
export function organizationHeaderLine(o: Pick<PlatformOrganization, 'ownerName' | 'ownerEmail' | 'code' | 'createdAt'>): string {
  const owner = o.ownerEmail
    ? `Chủ doanh nghiệp: ${o.ownerName ? `${o.ownerName} (${o.ownerEmail})` : o.ownerEmail}`
    : 'Chưa có chủ doanh nghiệp';
  const code = readableOrgCode(o.code);
  return [owner, code ? `Mã: ${code}` : null, o.createdAt ? `Đăng ký ${formatDate(o.createdAt)}` : null]
    .filter(Boolean)
    .join(' · ');
}
