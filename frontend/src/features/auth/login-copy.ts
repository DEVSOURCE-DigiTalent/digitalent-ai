export type LoginPortal = 'default' | 'enterprise' | 'individual';

export interface LoginCopy {
  /** Small label above the title; none on the neutral login page. */
  eyebrow?: string;
  subtitle: string;
  homePath: string;
  pricingPath?: string;
  loginPath: string;
  /**
   * Where "create an account" leads: the open sign-up form ("/register"). "/business/register" and
   * "/individual/register" need a plan in the query and send visitors without one back to pricing.
   */
  registerPath: string;
  registerLabel: string;
  /** Line set over the picture: lead, emphasis (serif italic), tail. */
  quoteLead: string;
  quoteEmphasis: string;
  quoteTail: string;
}

/** Same form for everyone; only the wording and the links depend on the product the visitor chose. */
export const LOGIN_COPY: Record<LoginPortal, LoginCopy> = {
  default: {
    subtitle: 'Một tài khoản cho cả doanh nghiệp và cá nhân.',
    homePath: '/portal',
    loginPath: '/login',
    registerPath: '/portal',
    registerLabel: 'Chọn hướng sử dụng',
    quoteLead: 'Đo lường và phát triển ',
    quoteEmphasis: 'năng lực số',
    quoteTail: ' theo Thông tư 02/2025.',
  },
  enterprise: {
    eyebrow: 'Doanh nghiệp',
    subtitle: 'Quản lý năng lực số của đội ngũ bạn.',
    homePath: '/business',
    pricingPath: '/business/pricing',
    loginPath: '/business/login',
    registerPath: '/business/pricing',
    registerLabel: 'Chọn gói và đăng ký',
    quoteLead: 'Năng lực số của cả đội ngũ, ',
    quoteEmphasis: 'trên một màn hình.',
    quoteTail: '',
  },
  individual: {
    eyebrow: 'Cá nhân',
    subtitle: 'Tiếp tục lộ trình học của bạn.',
    homePath: '/individual',
    pricingPath: '/individual/pricing',
    loginPath: '/individual/login',
    registerPath: '/individual/pricing',
    registerLabel: 'Chọn gói và đăng ký',
    quoteLead: 'Một mục tiêu, ',
    quoteEmphasis: 'một lộ trình',
    quoteTail: ' dựng riêng cho bạn.',
  },
};
