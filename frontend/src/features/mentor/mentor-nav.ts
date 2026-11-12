import type { LucideIcon } from 'lucide-react';
import { Building2 } from 'lucide-react';

export interface MentorNavItem {
  readonly to: string;
  readonly label: string;
  readonly glyph: string;
  readonly icon: LucideIcon;
  readonly description?: string;
}

/** Top navigation của không gian Mentor (/mentor/...). */
export const MENTOR_NAV: readonly MentorNavItem[] = [
  {
    to: '/mentor/enterprises',
    label: 'Doanh nghiệp được giao',
    glyph: '',
    icon: Building2,
    description: 'Theo dõi các doanh nghiệp phụ trách và tiến độ bài nộp cuối cấp',
  },
] as const;
