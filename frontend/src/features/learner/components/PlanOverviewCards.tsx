import { Link } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import { formatDmy } from '@/lib/personal-access';
import { IND_FREE_KEEPS, IND_FREE_LOCKED } from '@/lib/plans';
import type { PersonalAccess } from '@/services/personal-learning.service';
import { Card, PT_BUTTON_SECONDARY, PT_EYEBROW, Tag } from './ui';
import { UpgradeLink } from './UpgradeLink';

/** "Gói của tôi" while the 7-day trial runs (spec §8.12). */
export function TrialPlanCard({ access }: { access: PersonalAccess }) {
  const used = access.trialCourseIds.length;

  return (
    <Card className="flex flex-col justify-between gap-8 p-7 md:p-9">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className={PT_EYEBROW}>Gói hiện tại</p>
          <Tag tone="info">Dùng thử</Tag>
        </div>
        <p className="mt-4 text-[28px] font-semibold leading-tight tracking-tight">Gói Plus (dùng thử)</p>
        <p className="mt-3 text-[15px] text-pt-fg-2">
          Hết hạn {access.trialEndsAt ? formatDmy(access.trialEndsAt) : ''} · còn {access.daysLeft ?? 0} ngày
        </p>
        <p className="mt-1 text-[15px] text-pt-fg-2">
          Lượt học thử {used}/{access.courseLimit ?? used}
        </p>
      </div>
      <p className="border-t border-pt-line pt-6 text-sm text-pt-fg-2">
        Sau khi hết hạn: giữ hồ sơ, kết quả, ghi chú; khóa bài học mới.
      </p>
      <div className="flex flex-wrap gap-3">
        <UpgradeLink placement="subscription">Nâng cấp ngay</UpgradeLink>
        <Link to="/individual/pricing" className={PT_BUTTON_SECONDARY}>Xem bảng giá</Link>
      </div>
    </Card>
  );
}

/** "Gói của tôi" on the Free plan: what stays, what an upgrade opens (spec §8.12 and §9). */
export function FreePlanCard() {
  return (
    <Card className="grid gap-8 p-7 md:p-9">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className={PT_EYEBROW}>Gói hiện tại</p>
          <Tag tone="ok">Đang hoạt động</Tag>
        </div>
        <p className="mt-4 text-[28px] font-semibold leading-tight tracking-tight">Gói Miễn phí</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <section aria-labelledby="free-keeps">
          <h2 id="free-keeps" className="text-sm font-semibold text-pt-fg">Bạn vẫn có</h2>
          <ul className="mt-3 grid gap-2">
            {IND_FREE_KEEPS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-pt-fg-2">
                <Check className="mt-0.5 size-4 shrink-0 text-pt-ok" aria-hidden="true" />{item}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="free-locked">
          <h2 id="free-locked" className="text-sm font-semibold text-pt-fg">Mở khi nâng cấp</h2>
          <ul className="mt-3 grid gap-2">
            {IND_FREE_LOCKED.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-pt-fg-2">
                <Lock className="mt-0.5 size-4 shrink-0 text-pt-fg-3" aria-hidden="true" />{item}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="flex flex-wrap gap-3">
        <UpgradeLink placement="subscription">Nâng cấp Plus</UpgradeLink>
        <Link to="/individual/pricing" className={PT_BUTTON_SECONDARY}>Xem bảng giá</Link>
      </div>
    </Card>
  );
}
