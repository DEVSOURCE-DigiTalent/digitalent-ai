export type LoginPortal = 'default' | 'enterprise' | 'individual';

/** The only sign-in route: businesses and individuals share one form, the account decides where it lands. */
export const LOGIN_PATH = '/login';

export interface LoginCopy {
  /** Small label above the title; none on the shared login page. */
  eyebrow?: string;
  subtitle: string;
  homePath: string;
  pricingPath?: string;
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
  /** Puts the emphasis and tail on their own line (the lead is a sentence of its own). */
  quoteBreak?: boolean;
}

/** 'default' is the login page; 'enterprise' and 'individual' are the two sign-up pages, which share the frame. */
export const LOGIN_COPY: Record<LoginPortal, LoginCopy> = {
  default: {
    subtitle: 'Một tài khoản cho cả doanh nghiệp và cá nhân.',
    homePath: '/portal',
    registerPath: '/portal?intent=register',
    registerLabel: 'Đăng ký ngay',
    quoteLead: 'Chào mừng trở lại.',
    quoteBreak: true,
    quoteEmphasis: 'Hành trình số',
    quoteTail: ' của bạn vẫn đang chờ.',
  },
  enterprise: {
    eyebrow: 'Doanh nghiệp',
    subtitle: 'Quản lý năng lực số của đội ngũ bạn.',
    homePath: '/business',
    pricingPath: '/business/pricing',
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
    registerPath: '/individual/pricing',
    registerLabel: 'Chọn gói và đăng ký',
    quoteLead: 'Một mục tiêu, ',
    quoteEmphasis: 'một lộ trình',
    quoteTail: ' dựng riêng cho bạn.',
  },
};
