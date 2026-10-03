import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Download, FileText, KeyRound, ShieldCheck } from 'lucide-react';
import { PublicShell } from '../../public/components/PublicShell';
import {
  DARK_INPUT_CLASS,
  DARK_PRIMARY_BUTTON,
  DARK_SECONDARY_BUTTON,
  FormError,
} from '../../public/components/FormControls';
import { PurchaseStepper } from '../components/PurchaseStepper';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefreshSession } from '@/hooks/use-refresh-session';
import { formatVnd, getPlan } from '@/lib/plans';
import { contractService } from '@/services/contract.service';
import { purchaseService } from '@/services/purchase.service';
import { USE_MOCK } from '@/services/mock/mock-config';

export function EnterpriseContractPage() {
  const user = useCurrentUser((s) => s.user);
  const navigate = useNavigate();
  const refreshSession = useRefreshSession();

  const contractQuery = useQuery({
    queryKey: ['contract', user?.id],
    queryFn: async () => (await contractService.getContract()).data.data,
    enabled: Boolean(user),
  });

  const draftQuery = useQuery({
    queryKey: ['purchaseDraft', user?.id],
    queryFn: async () => (await purchaseService.getMyDraft()).data.data,
    enabled: Boolean(user),
  });

  const existingContract = contractQuery.data;
  const draft = draftQuery.data;

  // Form states - Customer inputs start blank
  const [orgName, setOrgName] = useState(user?.organization?.name || '');
  const [taxCode, setTaxCode] = useState('');
  const [address, setAddress] = useState('');
  const [signerName, setSignerName] = useState(user?.fullName || '');
  const [signerTitle, setSignerTitle] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDemoHint, setOtpDemoHint] = useState<string>();
  const [errorMsg, setErrorMsg] = useState<string>();

  const sendOtpMutation = useMutation({
    mutationFn: async () => (await contractService.sendOtp()).data.data!,
    onSuccess: (data: any) => {
      setOtpSent(true);
      setErrorMsg(undefined);
      if (USE_MOCK && data?.demoCode) setOtpDemoHint(data.demoCode);
    },
    onError: (err: any) => setErrorMsg(err?.response?.data?.message || 'Không thể gửi mã xác thực. Vui lòng thử lại.'),
  });

  const signMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(undefined);
      if (!orgName.trim()) throw new Error('Vui lòng nhập tên công ty / tổ chức.');
      if (!taxCode.trim()) throw new Error('Vui lòng nhập mã số thuế doanh nghiệp.');
      if (!address.trim()) throw new Error('Vui lòng nhập địa chỉ trụ sở.');
      if (!signerName.trim()) throw new Error('Vui lòng nhập họ tên người đại diện ký kết.');
      if (!signerTitle.trim()) throw new Error('Vui lòng nhập chức vụ người ký kết.');
      if (!termsAccepted) throw new Error('Bạn cần đồng ý với điều khoản hợp đồng và thỏa thuận DPA.');
      if (!otpCode.trim()) throw new Error('Vui lòng nhập mã xác thực OTP.');

      await contractService.verifyOtp(otpCode.trim());
      return (await contractService.signContract({
        organizationName: orgName.trim(),
        taxCode: taxCode.trim(),
        address: address.trim(),
        signerName: signerName.trim(),
        signerTitle: signerTitle.trim(),
        signMethod: 'otp',
      })).data.data!;
    },
    onSuccess: async () => {
      await refreshSession();
      contractQuery.refetch();
      navigate('/checkout', { replace: true });
    },
    onError: (err: any) => setErrorMsg(err?.response?.data?.message || err.message || 'Không thể ký hợp đồng. Vui lòng kiểm tra lại.'),
  });

  if (!user) return <Navigate to="/login" replace />;
  if (user.workspace !== 'enterprise') return <Navigate to="/portal" replace />;
  if (user.onboardingStatus === 'payment') return <Navigate to="/checkout" replace />;
  if (user.onboardingStatus === 'setup') return <Navigate to="/setup" replace />;

  const planCode = draft?.planCode || user.subscription?.planCode || 'ENT_STARTER';
  const plan = getPlan(planCode);
  const seats = draft?.seats || user.subscription?.seatLimit || 10;
  const cycle = draft?.cycle || 'month';
  const planName = plan?.name || 'Gói Doanh nghiệp';
  const totalAmount = draft?.amount || (plan?.monthlyPrice ? plan.monthlyPrice * seats * (cycle === 'year' ? 12 * 0.8 : 1) : 7900000);
  const isSigned = Boolean(existingContract);
  const contractData = existingContract;

  return (
    <PublicShell portal="enterprise" width="wide">
      <div className="mb-6 space-y-6">
        <PurchaseStepper audience="enterprise" currentStep={3} changePlanPath="/business/pricing" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-[clamp(24px,3.5vw,36px)] font-normal leading-[1.1] tracking-[-0.03em] text-cream">
              Hợp đồng dịch vụ điện tử B2B
            </h1>
            <p className="mt-1.5 text-xs text-stone-400">
              Bước 3/5: Xác nhận pháp nhân và ký kết điện tử trước khi thanh toán kích hoạt.
            </p>
          </div>
          {isSigned && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20 self-start sm:self-auto">
              <CheckCircle2 className="size-3.5" />
              Đã ký kết hợp đồng
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Cột trái: Văn bản hợp đồng điện tử & Điều khoản DPA */}
        <section className="lg:col-span-7 rounded-3xl bg-landing-panel p-6 sm:p-8 ring-1 ring-cream/15 space-y-6 max-h-[700px] overflow-y-auto text-xs text-stone-300 leading-relaxed font-sans">
          <div className="border-b border-cream/10 pb-5 text-center space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-cream-soft font-mono">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-[11px] font-medium text-stone-400">Độc lập - Tự do - Hạnh phúc</p>
            <div className="pt-2">
              <h2 className="text-sm font-semibold text-cream uppercase tracking-wide">
                HỢP ĐỒNG CUNG CẤP VÀ SỬ DỤNG DỊCH VỤ NỀN TẢNG DIGITALENT AI
              </h2>
              <p className="text-[11px] text-stone-400 font-mono mt-1">
                Số: {contractData?.contractNumber || 'HD-[Tự động sinh khi ký]'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-cream mb-1">BÊN A (BÊN CUNG CẤP DỊCH VỤ):</h3>
              <ul className="space-y-1 pl-3 text-stone-400">
                <li>• <strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ DIGITALENT AI</strong></li>
                <li>• Mã số thuế: <span className="italic">[Chờ pháp chế cung cấp]</span></li>
                <li>• Đại diện pháp lý: <span className="italic">[Chờ pháp chế cung cấp]</span></li>
                <li>• Trụ sở chính: <span className="italic">[Chờ pháp chế cung cấp]</span></li>
                <li>• Email hỗ trợ dịch vụ: support@digitalent.vn</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-cream mb-1">BÊN B (BÊN SỬ DỤNG DỊCH VỤ):</h3>
              <ul className="space-y-1 pl-3 text-stone-400">
                <li>• Tên doanh nghiệp: <strong className="text-cream">{orgName || '[Chưa nhập]'}</strong></li>
                <li>• Mã số thuế: <span className="text-cream font-mono">{taxCode || '[Chưa nhập]'}</span></li>
                <li>• Địa chỉ: <span className="text-cream">{address || '[Chưa nhập]'}</span></li>
                <li>• Người đại diện: <span className="text-cream">{signerName || '[Chưa nhập]'}</span> ({signerTitle || '[Chưa nhập chức vụ]'})</li>
                <li>• Email liên hệ: <span className="font-mono text-cream">{user.email}</span></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-cream mb-1">ĐIỀU 1. ĐỐI TƯỢNG VÀ PHẠM VI DỊCH VỤ</h3>
              <p>Bên A cung cấp quyền truy cập và sử dụng Nền tảng Đào tạo và Đánh giá Năng lực số DigiTalent AI theo gói dịch vụ:</p>
              <div className="mt-2 rounded-xl bg-landing-card p-3 ring-1 ring-cream/10 space-y-1">
                <div className="flex justify-between font-medium text-cream">
                  <span>{planName}</span>
                  <span className="font-mono">{formatVnd(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Quy mô: {seats} ghế nhân sự</span>
                  <span>Chu kỳ: {cycle === 'year' ? '12 tháng (Tiết kiệm 20%)' : 'Hàng tháng'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-cream mb-1">ĐIỀU 2. THỎA THUẬN XỬ LÝ DỮ LIỆU CÁ NHÂN (DPA)</h3>
              <p>
                Căn cứ Nghị định 13/2023/NĐ-CP và Luật Bảo vệ dữ liệu cá nhân 2025 (Luật số 91/2025/QH15, có hiệu lực từ ngày 01/01/2026):
              </p>
              <ul className="mt-1 space-y-1 pl-3 text-stone-400 list-disc list-inside">
                <li>Bên B là <strong>Bên Kiểm soát dữ liệu cá nhân</strong> đối với toàn bộ thông tin nhân sự và kết quả đánh giá kỹ năng của nhân viên đưa lên nền tảng.</li>
                <li>Bên A là <strong>Bên Xử lý dữ liệu cá nhân</strong>, cam kết chỉ xử lý dữ liệu theo phạm vi hợp đồng và ủy quyền của Bên B; áp dụng các biện pháp kỹ thuật và tổ chức bảo vệ an toàn dữ liệu.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-cream mb-1">ĐIỀU 3. MỨC ĐỘ DỊCH VỤ VÀ BẢO HÀNH (SLA)</h3>
              <p>
                Tiêu chuẩn cam kết chất lượng dịch vụ (SLA) và thời gian phản hồi kỹ thuật áp dụng theo Quy chế dịch vụ DigiTalent AI <span className="italic">[Chờ pháp chế cung cấp văn bản chi tiết]</span>.
              </p>
            </div>
          </div>

          {isSigned && contractData && (
            <div className="mt-6 rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 p-4 flex items-center gap-3">
              <CheckCircle2 className="size-6 text-emerald-300 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-300 uppercase">ĐÃ XÁC THỰC VÀ KÝ ĐIỆN TỬ</p>
                <p className="text-stone-300">
                  Đại diện: {contractData.signerName} ({contractData.signerTitle}) · {new Date(contractData.signedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Cột phải: Form thông tin pháp nhân & Ký kết OTP */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          {!isSigned ? (
            <div className="rounded-3xl bg-landing-panel p-6 sm:p-7 ring-1 ring-cream/15 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-cream-soft" />
                <h2 className="text-base font-medium text-cream">Thông tin pháp nhân ký hợp đồng</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="contract-org-name" className="text-xs text-cream/90 block mb-1">Tên tổ chức / Doanh nghiệp *</label>
                  <input
                    id="contract-org-name"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="VD: Công ty Cổ phần Công nghệ ABC"
                    className={DARK_INPUT_CLASS}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="contract-tax-code" className="text-xs text-cream/90 block mb-1">Mã số thuế (MST) *</label>
                    <input
                      id="contract-tax-code"
                      type="text"
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      placeholder="VD: 0109876543"
                      className={DARK_INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor="contract-signer-title" className="text-xs text-cream/90 block mb-1">Chức vụ người ký *</label>
                    <input
                      id="contract-signer-title"
                      type="text"
                      value={signerTitle}
                      onChange={(e) => setSignerTitle(e.target.value)}
                      placeholder="VD: Giám đốc điều hành"
                      className={DARK_INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contract-address" className="text-xs text-cream/90 block mb-1">Địa chỉ trụ sở đăng ký *</label>
                  <input
                    id="contract-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="VD: Tầng 5, Tòa nhà Landmark, Hà Nội"
                    className={DARK_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="contract-signer-name" className="text-xs text-cream/90 block mb-1">Họ tên người đại diện ký *</label>
                  <input
                    id="contract-signer-name"
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Họ và tên người ký"
                    className={DARK_INPUT_CLASS}
                  />
                </div>

                <label className="flex items-start gap-2.5 text-xs text-stone-300 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-cream/20 bg-landing-card accent-cream"
                  />
                  <span>
                    Tôi xác nhận là người đại diện hợp pháp của doanh nghiệp và đồng ý với các điều khoản Hợp đồng dịch vụ cùng Thỏa thuận xử lý dữ liệu (DPA).
                  </span>
                </label>

                {/* Khung OTP xác thực */}
                <div className="pt-2 border-t border-cream/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-cream flex items-center gap-1.5">
                      <KeyRound className="size-3.5 text-cream-soft" />
                      Xác thực OTP qua email
                    </span>
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={() => sendOtpMutation.mutate()}
                        disabled={sendOtpMutation.isPending}
                        className="text-xs text-cream underline hover:text-cream-soft"
                      >
                        {sendOtpMutation.isPending ? 'Đang gửi…' : 'Gửi mã OTP'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => sendOtpMutation.mutate()}
                        disabled={sendOtpMutation.isPending}
                        className="text-xs text-stone-400 hover:text-cream"
                      >
                        Gửi lại mã
                      </button>
                    )}
                  </div>

                  {otpSent && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Nhập mã OTP 6 số"
                        maxLength={6}
                        className={`${DARK_INPUT_CLASS} font-mono tracking-widest text-center text-base`}
                      />
                      {USE_MOCK && otpDemoHint && (
                        <p className="text-[11px] text-amber-300/90 text-center">
                          Mã xác thực thử nghiệm: <strong>{otpDemoHint}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {errorMsg && <FormError message={errorMsg} />}

                <button
                  type="button"
                  onClick={() => signMutation.mutate()}
                  disabled={signMutation.isPending || !otpSent}
                  className={`${DARK_PRIMARY_BUTTON} w-full mt-2`}
                >
                  {signMutation.isPending ? 'Đang xử lý ký kết…' : 'Xác nhận OTP và Ký hợp đồng'}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-landing-panel p-6 sm:p-8 ring-1 ring-cream/15 text-center space-y-5">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30">
                <ShieldCheck className="size-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-medium text-cream">Hợp đồng điện tử đã hoàn tất</h2>
                <p className="text-xs text-stone-400 max-w-[32ch] mx-auto">
                  Số hợp đồng <strong className="text-cream">{contractData?.contractNumber}</strong> đã được lưu trữ an toàn.
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className={`${DARK_SECONDARY_BUTTON} w-full flex items-center justify-center gap-2`}
                >
                  <Download className="size-4" />
                  Tải bản sao hợp đồng (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/checkout', { replace: true })}
                  className={DARK_PRIMARY_BUTTON}
                >
                  Tiếp tục thanh toán (Bước 4)
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
