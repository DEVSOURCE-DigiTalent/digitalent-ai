import type { PlanAudience } from '@/lib/plans';
import { TT02_DOMAINS, getReferencePosition } from '@/lib/reference-positions';

/**
 * Building blocks and the enterprise copy of the landing pages. The per-product content objects
 * (enterprise "/business", individual "/individual") are assembled in landing-variants.ts.
 * Figures come from Circular 02/2025/TT-BGDĐT and the product rules
 * (docs/specs/2026-09-29-tt02-position-competency-matrix.md).
 */

export const SECTION_IDS = {
  top: 'trang-chu',
  main: 'noi-dung',
  careers: 'vi-tri',
  process: 'cach-hoat-dong',
  skillPath: 'lo-trinh',
  learning: 'trai-nghiem-hoc',
  progress: 'tien-bo',
  pricing: 'bang-gia',
  faq: 'cau-hoi',
  bridge: 'van-de',
  teamGap: 'khoang-trong',
  evidence: 'minh-chung',
  roles: 'vai-tro',
  deployment: 'trien-khai',
  about: 'khung',
  features: 'tinh-nang',
  finale: 'bat-dau',
} as const;

export interface LandingLink {
  label: string;
  /** Section id for in-page links, route path otherwise. */
  to: string;
  kind: 'section' | 'route';
  /** Label shown on phones; the full label stays the accessible name. */
  shortLabel?: string;
  /** Hidden on phones to keep the hanging nav on one line. */
  wideOnly?: boolean;
}

export interface BackgroundVideo {
  src?: string;
  poster?: string;
  /** Enlarges the clip around `origin` to push a corner (e.g. a generator watermark) out of the frame. */
  zoom?: number;
  /** CSS transform-origin of the zoom, default "center". */
  origin?: string;
}

/** Background video of each section that has one; an empty entry keeps the canvas scene. */
export type LandingMedia = Record<'hero' | 'card' | 'finale' | 'learning' | 'evidence', BackgroundVideo>;

/**
 * Background videos. Leave `src` empty until self-hosted files exist in `public/videos/`
 * (no audio, ~2–4 MB each, `-movflags +faststart`). The canvas scene shows until a video plays.
 */
// TODO(landing-video): temporary preview only. These are the reference template's clips, hotlinked from a
// third-party CDN with no stated licence (14–18 MB each). Replace with self-hosted files before release.
const REFERENCE_CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/';

export const LANDING_MEDIA: LandingMedia = {
  hero: { src: `${REFERENCE_CDN}hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4` },
  card: { src: `${REFERENCE_CDN}hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4` },
  finale: { src: `${REFERENCE_CDN}hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4` },
  learning: {},
  evidence: {},
};

export const HERO_EYEBROW = {
  title: 'Nền tảng năng lực số cho doanh nghiệp',
  basis: 'Căn cứ Khung chuẩn năng lực số',
};

export const HERO_LEDE =
  'DigiTalent AI đo năng lực số của từng nhân viên theo đúng yêu cầu vị trí, chỉ ra phần còn thiếu, xếp lộ trình học và cấp chứng chỉ nội bộ mà ai cũng tra cứu được.';

export interface TextSegment {
  text: string;
  className?: string;
}

/** Emphasised words in titles: serif italic, filled with the product gradient (lp-em in landing.css). */
export const SERIF_ITALIC = 'lp-em font-landing-serif italic text-[1.1em] tracking-[-0.01em]';

export const ABOUT_LABEL = 'Khung chuẩn năng lực số';

export const ABOUT_TITLE: TextSegment[] = [
  { text: 'Mỗi vị trí cần' },
  { text: 'một bộ năng lực số riêng.', className: SERIF_ITALIC },
  { text: 'Chúng tôi đo đúng bộ đó, dạy phần còn thiếu và chứng nhận khi đạt.' },
];

export const ABOUT_BODY =
  'Khung chuẩn năng lực số chia thành 6 miền với 24 năng lực thành phần, từ khai thác dữ liệu đến ứng dụng trí tuệ nhân tạo. Doanh nghiệp chọn cho mỗi vị trí từ 9 đến 24 năng lực và đặt mức yêu cầu cho từng năng lực. Nhân viên làm bài chẩn đoán, hệ thống so với yêu cầu của vị trí, xếp mức thiếu hụt và gợi ý các khóa học theo đúng thứ tự tiên quyết.';

export const FRAMEWORK_SPECS = [
  { value: '6', label: 'miền năng lực, gồm cả ứng dụng AI' },
  { value: '24', label: 'năng lực thành phần cốt lõi' },
  { value: '9–24', label: 'năng lực được chọn cho mỗi vị trí' },
  { value: '3', label: 'tầng chương trình: Cơ bản · Trung cấp · Nâng cao' },
];

export const FEATURES_HEADLINE: TextSegment[] = [{ text: 'Từ khung năng lực đến chứng chỉ, trên cùng một nền tảng.' }];
export const FEATURES_SUBLINE: TextSegment[] = [{ text: 'Đo đúng người. Dạy đúng chỗ. Công nhận minh bạch.' }];

/**
 * Sample personal competency profile (assessed levels 0–3 per domain), shown on the individual landing page.
 * Assessed by DigiTalent AI's own tests; nobody at a workplace has confirmed it.
 */
export const PROGRESS_SAMPLE = [
  { domain: 'Khai thác dữ liệu', level: 2 },
  { domain: 'Giao tiếp số', level: 3 },
  { domain: 'Sáng tạo nội dung', level: 1 },
  { domain: 'An toàn', level: 2 },
  { domain: 'Giải quyết vấn đề', level: 1 },
  { domain: 'Ứng dụng AI', level: 2 },
];

/** Name of each programme tier by assessed level 0–3. */
export const TIER_LABELS = ['Chưa đánh giá', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

export const MEDIA_CARD = {
  label: 'Bảng năng lực HR',
  caption: 'Năng lực số của cả đội ngũ, trên một màn hình.',
};

export type FeatureVisualKind = 'matrix' | 'radar' | 'certificate' | 'progress';

export interface Feature {
  id: string;
  /** The cards follow the real process: define the matrix, measure the gap, certify. */
  number: string;
  title: string;
  visual: FeatureVisualKind;
  points: string[];
  link?: { label: string; to: string };
}

/** Interactive demo (prototype) the enterprise feature cards link to, until the real screens exist. */
const DEMO_PATH = '/experience?role=enterprise';

export const FEATURES: Feature[] = [
  {
    id: 'matrix',
    number: '01',
    title: 'Ma trận năng lực theo vị trí.',
    visual: 'matrix',
    points: [
      'Chọn 9–24 năng lực từ 24 năng lực cốt lõi',
      'Đặt mức yêu cầu riêng cho từng năng lực',
      'Luôn gồm năng lực an toàn 4.1 và 4.2',
      'Lưu nháp, kích hoạt và giữ lịch sử phiên bản',
    ],
    link: { label: 'Tìm hiểu thêm', to: DEMO_PATH },
  },
  {
    id: 'gap',
    number: '02',
    title: 'Phân tích khoảng trống kỹ năng.',
    visual: 'radar',
    points: [
      'Bài chẩn đoán đầu vào theo đúng vị trí',
      'Radar mức hiện tại so với yêu cầu, theo 6 miền',
      'Lộ trình khóa học xếp theo thứ tự tiên quyết',
    ],
    link: { label: 'Tìm hiểu thêm', to: '/experience?role=employee' },
  },
  {
    id: 'certificate',
    number: '03',
    title: 'Chứng nhận nội bộ có bằng chứng.',
    visual: 'certificate',
    points: [
      'Đánh giá qua nhiệm vụ thực tế tại nơi làm việc',
      'Cấp chứng chỉ nội bộ khi đạt mức yêu cầu',
      'Mỗi năng lực được xác nhận đều có bằng chứng đi kèm',
    ],
  },
];

/**
 * The accountant reference position as a matrix: one row per domain, value = required level
 * (0 not required, 1 Cơ bản, 2 Trung cấp, 3 Nâng cao). Read from the shared position data so the figures
 * (for example 21 of 24 competencies) always match what the product shows.
 */
export const MATRIX_SAMPLE: number[][] = (() => {
  const levels = getReferencePosition('ACCOUNTANT')?.levels ?? [];
  let offset = 0;
  return TT02_DOMAINS.map((domain) => {
    const row = levels.slice(offset, offset + domain.competencyCount);
    offset += domain.competencyCount;
    return row;
  });
})();

/** Sample skill gap per domain (levels 0–3). */
export const RADAR_SAMPLE = {
  required: [2, 2, 2, 3, 2, 2],
  current: [1, 2, 1, 2, 1, 1],
};

export const FINALE = {
  lead: 'Mỗi nhân viên',
  leadMuted: 'một lộ trình.',
  tail: 'Mỗi chứng chỉ',
  tailMuted: 'một bằng chứng.',
  guestBody: 'Bản trải nghiệm cho phép bạn chọn một vị trí, làm bài chẩn đoán mẫu và xem lộ trình học được dựng từ chính kết quả đó.',
  memberBody: 'Lộ trình học, nhiệm vụ và chứng chỉ của bạn đang chờ trong hệ thống.',
};

export const FOOTER_TEXT = {
  about: 'Nền tảng đào tạo, đánh giá và cấp chứng chỉ năng lực số nội bộ cho doanh nghiệp theo Khung chuẩn năng lực số.',
  basis: 'Khung chuẩn năng lực số gồm 6 miền và 24 năng lực cốt lõi.',
};

/** Everything that differs between the enterprise and the individual landing page. */
/** Heading block shared by the sections that are not the hero: small label, big title, optional lead. */
export interface SectionIntro {
  label: string;
  title: TextSegment[];
  lead?: string;
}

/**
 * Illustrative skill gap of a learner aiming at a reference position. The required level of each competency
 * comes from the position; only the learner's current level and the roadmap are sample data.
 */
export interface SkillPathSample {
  positionCode: string;
  rows: { code: string; current: number }[];
  roadmap: { courseCode: string; title: string; competencyCode: string; /** Course that must be finished first. */ after?: string }[];
}

/** Illustrative content of one module of a course, shown as a mock lesson viewer. */
export interface LearningPreviewSample {
  courseCode: string;
  courseTitle: string;
  modules: string[];
  /** Index in `modules` of the module on screen. */
  currentModule: number;
  lesson: {
    objective: string;
    example: string;
    practice: string;
    quiz: { question: string; options: string[] };
    progress: string;
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Small labelled figures floating over the hero footage. Always sample data, never statistics. */
export interface HeroFragments {
  caption: string;
  items: { label: string; value: string }[];
}

export type WorkflowPreview = 'requirements' | 'assessment' | 'gap' | 'assignment' | 'task' | 'profile';

export interface WorkflowStep {
  /** One or two words for the rail. */
  label: string;
  title: string;
  text: string;
  preview: WorkflowPreview;
}

/** A team's gap against its reference position. Required levels come from the position; the rest is sample data. */
export interface TeamGapSample {
  /** Tab label: the department or position the sample stands for. */
  label: string;
  department: string;
  positionCode: string;
  headcount: number;
  /** Share of the requirement the team already meets (sample). */
  coverage: number;
  rows: { code: string; /** Typical current level of the team, 0–3. */ current: number; /** Employees below the requirement. */ behind: number }[];
  /** Highest level the team reaches in each of the 6 domains (sample), for the radar. */
  radarCurrent: number[];
  recommendLabel: string;
}

export interface EvidenceSample {
  competencyCode: string;
  /** Reference position whose requirement the confirmed level is compared with. */
  positionCode: string;
  /** The level confirmed by the review, before and after (0–3). */
  levelChange: { from: number; to: number };
  task: string;
  criteria: string[];
  feedback: string;
  /** From the assigned task to the confirmed competency. */
  stages: string[];
}

export interface Persona {
  role: string;
  badge?: string;
  points: string[];
  note?: string;
}

export interface DeploymentStep {
  title: string;
  note?: string;
  /** What the product would show once the step is done (sample). */
  chip?: string;
}

export interface ProgressTimelineEvent {
  when: string;
  title: string;
  detail?: string;
}

/**
 * One block of a landing page, in the order shown. The hero and the footer are fixed; every product lists
 * the sections it needs, so the enterprise and individual pages can tell different stories from the same parts.
 */
export type LandingSectionConfig =
  | { kind: 'about' }
  | { kind: 'features' }
  | { kind: 'finale' }
  | { kind: 'careers'; intro: SectionIntro; exploreAllLabel: string; cardLinkLabel: string }
  | { kind: 'process'; intro: SectionIntro; steps: { title: string; text: string }[] }
  | { kind: 'skill-path'; intro: SectionIntro; sample: SkillPathSample }
  | { kind: 'learning-preview'; intro: SectionIntro; sample: LearningPreviewSample }
  | { kind: 'progress'; intro: SectionIntro; profileLabel: string; timeline: ProgressTimelineEvent[] }
  | { kind: 'pricing'; intro: SectionIntro; audience: PlanAudience; compareLabel: string }
  | { kind: 'faq'; intro: SectionIntro; items: FaqItem[] }
  | { kind: 'bridge'; statement: string; questions: string[]; closing: string }
  | { kind: 'pillars'; label: string; items: { label: string; to: string }[] }
  | { kind: 'workflow'; intro: SectionIntro; steps: WorkflowStep[] }
  | { kind: 'team-gap'; intro: SectionIntro; samples: TeamGapSample[]; tabsLabel: string }
  | { kind: 'evidence'; intro: SectionIntro; sample: EvidenceSample; note: string }
  | { kind: 'roles'; intro: SectionIntro; personas: Persona[] }
  | { kind: 'deployment'; intro: SectionIntro; steps: DeploymentStep[]; sampleNote: string };

export interface LandingContent {
  variant: 'enterprise' | 'individual';
  media: LandingMedia;
  sections: LandingSectionConfig[];
  mainNav: LandingLink[];
  dockNav: LandingLink[];
  footerGroups: { title: string; links: LandingLink[] }[];
  heroEyebrow: { title: string; basis?: string };
  heroLede: string;
  about: {
    label: string;
    title: TextSegment[];
    body: string;
    specs: { value: string; label: string }[];
    /** Heading of the specs list when a second, separate group follows it. */
    specsLabel?: string;
    /** Figures DigiTalent AI chose itself, shown apart from the framework's own. */
    configured?: { label: string; specs: { value: string; label: string }[] };
  };
  featuresLabel?: string;
  featuresHeadline: TextSegment[];
  featuresSubline: TextSegment[];
  mediaCard: { label: string; caption: string };
  /** Display headline in the hero, above the eyebrow. */
  heroHeadline?: TextSegment[];
  heroFragments?: HeroFragments;
  /** Multiplies the size of the DigiTalent wordmark in the hero (default 1). */
  heroWordmarkScale?: number;
  features: Feature[];
  finale: { lead: string; leadMuted: string; tail: string; tailMuted: string; guestBody: string; memberBody: string };
  footerText: { about: string; basis: string };
  cta: {
    /** Primary visitor destination: pricing for businesses, the guided trial for individuals. */
    guestTo: string;
    /** Optional second, quieter link in the hero. */
    secondaryLabel?: string;
    secondaryTo?: string;
    /** Optional line under the hero actions for visitors: another way in, as a text link. */
    trialLabel?: string;
    trialTo?: string;
    heroLabel: string;
    dockLabel: string;
    finaleLabel: string;
    /** Where a stored token without a loaded profile goes; the portal's guard restores the session. */
    signedInTo: string;
    loginPath: string;
  };
}
