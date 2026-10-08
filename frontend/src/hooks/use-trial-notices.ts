import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { INDIVIDUAL_TRIAL } from '../lib/plans';
import { useMarkSeen, usePersonalAccess } from './use-personal-learning';

/**
 * In-app reminders of the trial, shown on the dashboard, each once (spec §10; the backend adds the e-mails):
 * - from day 2, while the entry assessment is still not done;
 * - when two days or less are left.
 * The server remembers each one in `seen.notice-<mốc>`, so a reload or another device does not repeat it.
 */
export function useTrialNotices(): void {
  const { data: access } = usePersonalAccess();
  const { mutate: markSeen } = useMarkSeen();
  const shown = useRef(new Set<string>());

  useEffect(() => {
    if (access?.mode !== 'trial' || access.daysLeft === null) return;
    const daysLeft = access.daysLeft;
    const diagnosticDone = access.checklist.find((item) => item.key === 'diagnostic')?.done ?? false;

    const show = (key: 'notice-day2' | 'notice-day5', message: string) => {
      if (access.seen[key] || shown.current.has(key)) return;
      shown.current.add(key);
      toast.info(message);
      markSeen(key);
    };

    if (daysLeft <= INDIVIDUAL_TRIAL.days - 1 && !diagnosticDone) {
      show('notice-day2', 'Làm bài đánh giá 10 phút để có lộ trình của riêng bạn.');
    }
    if (daysLeft <= INDIVIDUAL_TRIAL.reminderDays) {
      show('notice-day5', `Còn ${daysLeft} ngày dùng thử. Sau đó bạn vẫn giữ hồ sơ và kết quả.`);
    }
  }, [access, markSeen]);
}
