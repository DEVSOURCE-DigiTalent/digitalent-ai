import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronDown, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PulsePublicShell } from '@/features/public/pulse-landing/PulsePublicShell';
import { rememberPortalChoice } from '../../portal/portal-preference';
import { plansFor, suggestPlanForUsers, type BillingCycle, type PlanAudience } from '@/lib/plans';
import { PlanCard } from '../components/PlanCard';
import { PlanComparison } from '../components/PlanComparison';
import { SALES_EMAIL } from '../sales-contact';
import { resolvePlanChoice } from '../resolve-plan-choice';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefreshSession } from '@/hooks/use-refresh-session';
import { purchaseService } from '@/services/purchase.service';
import type { PlanSelection } from '@/types/commerce';

interface PricingPageProps {
  audience: PlanAudience;
}

const FAQ_ITEMS = [
  {
    q: 'Doanh nghiệp có được xuất hóa đơn VAT điện tử hợp pháp không?',
    a: 'Có. Toàn bộ các gói dịch vụ trả phí của DigiTalent AI đều được xuất hóa đơn giá trị gia tăng (VAT) điện tử theo đúng quy định của Tổng cục Thuế Việt Nam ngay sau khi thanh toán thành công.',
  },
  {
    q: 'Gói Dùng thử Miễn phí (Free Trial) có bị giới hạn thời gian 14 hay 30 ngày không?',
    a: 'Hoàn toàn không giới hạn thời gian. Bạn có thể kích hoạt không gian tổ chức cho tối đa 10 nhân sự, mở toàn bộ khóa học Cơ bản (Level 1-2) và làm bài đánh giá đầu vào miễn phí trọn đời mà không cần nhập thẻ tín dụng.',
  },
  {
    q: 'Hệ thống có ký Thỏa thuận Bảo mật Thông tin (NDA / DPA) riêng không?',
    a: 'Đối với gói Enterprise Custom, DigiTalent hỗ trợ ký kết hợp đồng dịch vụ riêng, Thỏa ước Bảo vệ Dữ liệu (DPA) và cam kết mức độ sẵn sàng dịch vụ (SLA) 99.9%.',
  },
  {
    q: 'Nếu nhân viên đã có kỹ năng thực tế, họ có bắt buộc phải học lý thuyết từ đầu không?',
    a: 'Không. Hệ thống tích hợp bài Đánh giá Đầu vào (Pre-assessment) có AI giám sát. Nhân viên đạt chuẩn sẽ được công nhận và miễn học tới 70% thời gian lý thuyết, chỉ tập trung vào nhiệm vụ thực tế còn thiếu.',
  },
];

/**
 * Trang Bảng Giá & Gói Dịch Vụ B2B DigiTalent Pulse v3.0
 * Ngôn ngữ thiết kế: Light Pearl Glassmorphism, chuẩn Thông tư 02/2025/TT-BGDĐT.
 */
export function PricingPage({ audience }: PricingPageProps) {
  const plans = plansFor(audience);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useCurrentUser((s) => s.user);
  const refreshSession = useRefreshSession();

  // Mặc định chọn chu kỳ hàng năm để tối ưu chi phí cho khách hàng (-20%)
  const [cycle, setCycle] = useState<BillingCycle>('year');
  const [projectedUsers, setProjectedUsers] = useState<string>('');
  const [notice, setNotice] = useState<string>();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const reason = searchParams.get('reason');
  const projectedNum = Number(projectedUsers);
  const suggestedPlan = projectedNum > 0 ? suggestPlanForUsers(projectedNum, audience) : undefined;

  useEffect(() => {
    rememberPortalChoice('enterprise');
    if (!user && localStorage.getItem('accessToken')) {
      refreshSession().catch(() => {});
    }
  }, [user, refreshSession]);

  const choose = async (selection: PlanSelection) => {
    let currentUser = user;
    if (!currentUser && localStorage.getItem('accessToken')) {
      try {
        currentUser = await refreshSession();
      } catch {
        // ignore
      }
    }
    const result = resolvePlanChoice(currentUser, selection, audience);

    if (result.type === 'contact') {
      window.location.href = `mailto:${result.email}?subject=Tu%20van%20goi%20doanh%20nghiep%20DigiTalent`;
      return;
    }

    if (result.type === 'register') {
      navigate(result.path);
      return;
    }

    if (result.type === 'mismatch') {
      setNotice(result.message);
      return;
    }

    if (result.type === 'subscription') {
      navigate(result.path, { state: { notice: result.message } });
      return;
    }

    if (result.type === 'checkout') {
      try {
        const myDraft = (await purchaseService.getMyDraft()).data?.data;
        if (myDraft) {
          const updated = await purchaseService.updateDraft(myDraft.id, selection);
          navigate(`${result.path}?draft=${updated.data.data?.id}`);
        } else {
          const created = await purchaseService.createDraft(selection, audience, currentUser?.id);
          navigate(`${result.path}?draft=${created.data.data?.id}`);
        }
      } catch {
        navigate(result.path);
      }
    }
  };

  return (
    <PulsePublicShell>
      <div className="py-12 sm:py-16 px-4 max-w-7xl mx-auto" data-testid="b2b-pricing-page">
        {/* Compliance Trust Pill */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200/80 px-4 py-1.5 text-xs font-semibold text-sky-800 shadow-sm">
            <ShieldCheck className="size-4 text-sky-600" aria-hidden="true" />
            Chuẩn hóa năng lực số theo Thông tư 02/2025/TT-BGDĐT (6 Lĩnh vực · 21 Năng lực)
          </span>
        </div>

        {/* Hero Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
            BẢNG GIÁ DOANH NGHIỆP B2B
          </p>
          <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Đầu tư đúng chỗ. <span className="font-serif italic font-normal text-slate-700">Tiến bộ nhìn thấy được.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Định mức quyền sử dụng minh bạch. Bắt đầu miễn phí với 10 nhân sự hoặc mở rộng linh hoạt theo quy mô phòng ban của doanh nghiệp.
          </p>

          {/* Dải thông báo cảnh báo/lỗi nếu có */}
          {reason === 'choose-plan' && (
            <div role="alert" className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm font-semibold text-amber-800">
              Vui lòng chọn một gói để tiếp tục đăng ký không gian doanh nghiệp.
            </div>
          )}
          {notice && (
            <div role="alert" className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm font-semibold text-blue-800">
              {notice}
            </div>
          )}

          {/* Banner Hero Dùng Thử Miễn Phí (Free Trial Anchor) */}
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 p-5 sm:p-6 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 text-white px-2 py-0.5 text-xs font-bold uppercase">
                <Sparkles className="size-3" /> Gói Khởi Tạo Miễn Phí
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                10 Ghế Nhân Sự Trọn Đời · Học Toàn Bộ Khóa Cơ Bản
              </h3>
              <p className="text-sm text-slate-600">
                Đánh giá đầu vào, đo khoảng cách kỹ năng và làm bài thực hành mà không cần nhập thẻ tín dụng.
              </p>
            </div>
            <Link
              to="/business/try"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 whitespace-nowrap transition-all"
            >
              Dùng thử miễn phí <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div
              role="group"
              aria-label="Chu kỳ thanh toán"
              className="inline-flex rounded-full border border-slate-300 bg-white p-1.5 shadow-sm text-sm"
            >
              <button
                type="button"
                aria-pressed={cycle === 'year'}
                onClick={() => setCycle('year')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-5 py-2 font-bold transition-all',
                  cycle === 'year'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span>Thanh toán theo năm</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-extrabold', cycle === 'year' ? 'bg-black/20 text-white' : 'bg-amber-100 text-amber-800')}>
                  Tiết kiệm −20%
                </span>
              </button>
              <button
                type="button"
                aria-pressed={cycle === 'month'}
                onClick={() => setCycle('month')}
                className={cn(
                  'rounded-full px-5 py-2 font-bold transition-all',
                  cycle === 'month'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Thanh toán theo tháng
              </button>
            </div>

            {/* Quick Estimator */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700 shadow-sm">
              <label htmlFor="projected-users" className="font-semibold text-slate-600 whitespace-nowrap">
                Dự kiến số nhân sự:
              </label>
              <input
                id="projected-users"
                type="number"
                min={1}
                placeholder="VD: 45"
                value={projectedUsers}
                onChange={(e) => setProjectedUsers(e.target.value)}
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-center text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <ul className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-3 items-stretch">
          {plans.map((plan) => (
            <li key={plan.code} className="flex">
              <PlanCard
                plan={plan}
                cycle={cycle}
                onChoose={choose}
                salesEmail={SALES_EMAIL}
                isSuggested={suggestedPlan?.code === plan.code}
              />
            </li>
          ))}
        </ul>

        {/* Feature Comparison Table */}
        <PlanComparison audience={audience} />

        {/* Enterprise FAQ Section */}
        <section className="mx-auto mt-24 max-w-3xl" aria-labelledby="faq-title">
          <div className="text-center mb-10">
            <h2 id="faq-title" className="text-2xl font-bold tracking-tight text-slate-900">
              Câu hỏi thường gặp của doanh nghiệp
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Mọi giải đáp về hợp đồng, hóa đơn tài chính và quy trình triển khai.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between text-left text-base font-bold text-slate-900 gap-4"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={cn('size-5 text-slate-400 transition-transform duration-200 flex-shrink-0', isOpen && 'rotate-180 text-amber-600')}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Banner */}
        <div className="mt-20 rounded-3xl bg-slate-900 p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Sẵn sàng chuẩn hóa năng lực cho đội ngũ?
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Bắt đầu ngay hôm nay với 10 nhân sự miễn phí. Kích hoạt không gian doanh nghiệp trong 60 giây.
            </p>
            <div className="pt-2">
              <Link
                to="/business/try"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                Tạo không gian dùng thử ngay <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PulsePublicShell>
  );
}
