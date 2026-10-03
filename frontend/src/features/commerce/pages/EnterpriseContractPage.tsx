import { useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Download, FileText, KeyRound, PenLine, ShieldCheck } from 'lucide-react';
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
import type { EContract } from '@/types/commerce';

export function EnterpriseContractPage() {
  const user = useCurrentUser((s) => s.user);
  const navigate = useNavigate();
  const refreshSession = useRefreshSession();

  // If contract already signed and user is past contract step
  const contractQuery = useQuery({
    queryKey: ['contract', user?.id],
    queryFn: async () => (await contractService.getContract()).data.data,
    enabled: Boolean(user),
  });

  const existingContract = contractQuery.data;

  // Form states
  const [orgName, setOrgName] = useState(user?.organization?.name || 'Công ty TNHH Giải pháp Đổi mới');
  const [taxCode, setTaxCode] = useState('0109876543');
  const [signerTitle, setSignerTitle] = useState('Giám đốc điều hành');
  const [signMethod, setSignMethod] = useState<'draw' | 'otp'>('draw');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [signatureDrawn, setSignatureDrawn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>();

  // Canvas for drawing signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const signMutation = useMutation({
    mutationFn: async () => {
      let sigData: string | undefined;
      if (signMethod === 'draw' && canvasRef.current) {
        try {
          sigData = canvasRef.current.toDataURL('image/png');
        } catch {
          sigData = 'data:image/png;base64,mock-signature';
        }
      }
      return (
        await contractService.signContract({
          organizationName: orgName,
          taxCode,
          signerTitle,
          signatureData: sigData,
          signMethod,
        })
      ).data.data!;
    },
    onSuccess: async () => {
      await refreshSession();
      contractQuery.refetch();
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Không thể ký hợp đồng. Vui lòng thử lại.');
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async () => (await contractService.sendOtp()).data.data!,
    onSuccess: (data) => {
      setOtpSent(true);
      setOtpCode(data.demoCode);
      setOtpVerified(true);
    },
  });

  if (!user) return <Navigate to="/login" replace />;

  // If user is not enterprise, redirect to home
  if (user.workspace !== 'enterprise') {
    return <Navigate to="/portal" replace />;
  }

  // If user hasn't paid yet, redirect to checkout
  if (user.onboardingStatus === 'payment') {
    return <Navigate to="/checkout" replace />;
  }

  const planCode = user.subscription?.planCode || 'ENT_STARTER';
  const plan = getPlan(planCode);
  const seats = user.subscription?.seatLimit || 10;
  const planName = plan?.name || 'Gói Doanh nghiệp';
  const monthlyAmount = plan?.monthlyPrice ? plan.monthlyPrice * seats : 790000;

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setSignatureDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDrawn(false);
  };

  const contractData: EContract | null = existingContract || null;
  const isSigned = Boolean(contractData);

  const canSubmitSign =
    termsAccepted &&
    orgName.trim().length > 0 &&
    taxCode.trim().length > 0 &&
    (signMethod === 'draw' ? signatureDrawn : otpVerified);

  return (
    <PublicShell portal="enterprise" width="wide">
      <div className="mb-6 space-y-6">
        <PurchaseStepper audience="enterprise" currentStep={4} />
        <div>
          <h1 className="text-[clamp(28px,4vw,36px)] font-normal leading-[1.15] tracking-[-0.03em]">
            Ký hợp đồng dịch vụ điện tử
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            Hợp đồng dịch vụ B2B chuẩn pháp lý cho nền tảng đào tạo & đánh giá năng lực số DigiTalent AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cột trái: Văn bản hợp đồng (Document Preview) */}
        <section className="lg:col-span-7 rounded-3xl bg-landing-panel p-6 sm:p-8 ring-1 ring-cream/15 text-cream space-y-6 text-sm leading-[1.7]">
          {/* Header văn bản */}
          <div className="text-center border-b border-cream/15 pb-5 space-y-1">
            <p className="text-xs uppercase font-medium tracking-widest text-stone-400">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-xs italic text-stone-400">Độc lập - Tự do - Hạnh phúc</p>
            <h2 className="mt-4 text-base sm:text-lg font-semibold tracking-normal text-cream uppercase">
              HỢP ĐỒNG CUNG CẤP & SỬ DỤNG DỊCH VỤ SAAS
            </h2>
            <p className="text-xs text-stone-400 font-mono">
              Số: {contractData?.contractNumber || 'HD-2026/DGT-B2B'}
            </p>
          </div>

          {/* Các bên tham gia */}
          <div className="space-y-4">
            <div className="rounded-xl bg-landing-card p-4 space-y-2 border border-cream/10">
              <p className="font-semibold text-cream-soft">BÊN A (KHÁCH HÀNG DOANH NGHIỆP):</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-400">Đơn vị:</span>{' '}
                  <span className="font-medium text-cream">{orgName}</span>
                </div>
                <div>
                  <span className="text-stone-400">Mã số thuế:</span>{' '}
                  <span className="font-medium font-mono text-cream">{taxCode}</span>
                </div>
                <div>
                  <span className="text-stone-400">Đại diện:</span>{' '}
                  <span className="font-medium text-cream">{user.fullName}</span>
                </div>
                <div>
                  <span className="text-stone-400">Chức vụ:</span>{' '}
                  <span className="font-medium text-cream">{signerTitle}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-stone-400">Email công việc:</span>{' '}
                  <span className="font-medium text-cream">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-landing-card p-4 space-y-2 border border-cream/10">
              <p className="font-semibold text-cream-soft">BÊN B (ĐƠN VỊ CUNG CẤP NỀN TẢNG):</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="sm:col-span-2">
                  <span className="text-stone-400">Đơn vị:</span>{' '}
                  <span className="font-medium text-cream">CÔNG TY CỔ PHẦN CÔNG NGHỆ DIGITALENT AI</span>
                </div>
                <div>
                  <span className="text-stone-400">Mã số thuế:</span>{' '}
                  <span className="font-medium font-mono text-cream">0109988776</span>
                </div>
                <div>
                  <span className="text-stone-400">Đại diện:</span>{' '}
                  <span className="font-medium text-cream">Ông Trần Minh Trí</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-stone-400">Trụ sở:</span>{' '}
                  <span className="text-stone-300">Tòa nhà DigiTalent Tower, Cầu Giấy, Hà Nội</span>
                </div>
              </div>
            </div>
          </div>

          {/* Điều khoản thương mại */}
          <div className="space-y-3 pt-2">
            <h3 className="font-semibold text-sm text-cream">Điều 1: Phạm vi và Gói dịch vụ</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-stone-300">
              <li>
                Bên B cung cấp quyền truy cập nền tảng đào tạo & đánh giá năng lực số DigiTalent AI theo khung năng lực
                Thông tư 02/2025/TT-BGDĐT.
              </li>
              <li>
                Gói bản quyền đăng ký: <strong className="text-cream">{planName}</strong> ({seats} ghế người dùng).
              </li>
              <li>
                Giá trị gói thuê bao: <strong className="text-cream">{formatVnd(monthlyAmount)}/tháng</strong> (đã thanh
                toán thành công).
              </li>
            </ul>

            <h3 className="font-semibold text-sm text-cream pt-2">Điều 2: Bảo mật dữ liệu & Cam kết dịch vụ (SLA)</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-stone-300">
              <li>Bảo mật tuyệt đối toàn bộ thông tin nhân sự và kết quả đánh giá theo Nghị định 13/2023/NĐ-CP.</li>
              <li>Cam kết mức độ sẵn sàng dịch vụ (Uptime SLA) đạt tối thiểu 99.9%.</li>
              <li>Hợp đồng điện tử có giá trị pháp lý tương đương văn bản giấy theo Luật Giao dịch điện tử.</li>
            </ul>
          </div>

          {/* Dấu mộc điện tử khi đã ký */}
          {isSigned && contractData && (
            <div className="mt-6 rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 p-5 flex items-center gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold text-emerald-300 uppercase tracking-wide">
                  ĐÃ KÝ ĐIỆN TỬ BỞI ĐẠI DIỆN DOANH NGHIỆP
                </p>
                <p className="text-stone-300">
                  Người ký: <span className="text-cream">{contractData.signerName}</span> ({contractData.signerTitle})
                </p>
                <p className="text-stone-400 font-mono">
                  Thời gian ký: {new Date(contractData.signedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Cột phải: Khung ký điện tử (Signature Action Panel) */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          {!isSigned ? (
            <div className="rounded-3xl bg-landing-panel p-6 sm:p-7 ring-1 ring-cream/15 space-y-5">
              <div className="flex items-center gap-2.5">
                <PenLine className="size-5 text-cream-soft" />
                <h2 className="text-lg font-medium text-cream">Xác nhận & Ký hợp đồng</h2>
              </div>

              <FormError message={errorMsg} />

              {/* Thông tin pháp nhân */}
              <div className="space-y-3">
                <div className="grid gap-1.5">
                  <label htmlFor="orgNameInput" className="text-xs text-cream/90 font-medium">
                    Tên tổ chức / Doanh nghiệp
                  </label>
                  <input
                    id="orgNameInput"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className={DARK_INPUT_CLASS}
                    placeholder="Công ty TNHH..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <label htmlFor="taxCodeInput" className="text-xs text-cream/90 font-medium">
                      Mã số thuế (MST)
                    </label>
                    <input
                      id="taxCodeInput"
                      type="text"
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      className={DARK_INPUT_CLASS}
                      placeholder="010..."
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label htmlFor="signerTitleInput" className="text-xs text-cream/90 font-medium">
                      Chức vụ người ký
                    </label>
                    <input
                      id="signerTitleInput"
                      type="text"
                      value={signerTitle}
                      onChange={(e) => setSignerTitle(e.target.value)}
                      className={DARK_INPUT_CLASS}
                      placeholder="Giám đốc / Đại diện"
                    />
                  </div>
                </div>
              </div>

              {/* Lựa chọn phương thức ký */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-medium text-stone-300 block">Chọn phương thức ký số:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignMethod('draw')}
                    className={`rounded-xl px-3 py-2 text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                      signMethod === 'draw'
                        ? 'border-cream bg-cream-soft text-black'
                        : 'border-cream/20 bg-landing-card text-stone-400 hover:text-cream'
                    }`}
                  >
                    <PenLine className="size-3.5" />
                    Ký vẽ tay
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignMethod('otp')}
                    className={`rounded-xl px-3 py-2 text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                      signMethod === 'otp'
                        ? 'border-cream bg-cream-soft text-black'
                        : 'border-cream/20 bg-landing-card text-stone-400 hover:text-cream'
                    }`}
                  >
                    <KeyRound className="size-3.5" />
                    Xác thực OTP
                  </button>
                </div>

                {/* Canvas vẽ tay */}
                {signMethod === 'draw' ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl border border-cream/25 bg-black p-1">
                      <canvas
                        ref={canvasRef}
                        width={360}
                        height={130}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full touch-none cursor-crosshair rounded-lg bg-black"
                      />
                      {!signatureDrawn && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-stone-500">
                          Vẽ chữ ký của bạn tại đây
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-stone-400 hover:text-cream underline"
                      >
                        Xóa chữ ký
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const canvas = canvasRef.current;
                          if (canvas) {
                            try {
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                clearCanvas();
                                ctx.font = '24px "Playfair Display", serif';
                                ctx.fillStyle = '#ffffff';
                                ctx.fillText(user.fullName, 20, 70);
                              }
                            } catch {
                              // non-browser or unmocked canvas environment
                            }
                          }
                          setSignatureDrawn(true);
                        }}
                        className="text-stone-400 hover:text-cream underline"
                      >
                        Dùng mẫu chữ ký theo tên
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Xác thực OTP */
                  <div className="space-y-3 rounded-xl border border-cream/20 bg-landing-card p-4">
                    <p className="text-xs text-stone-300">
                      Mã xác thực ký điện tử sẽ gửi tới email: <strong>{user.email}</strong>
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value);
                          if (e.target.value.trim() === '686868') setOtpVerified(true);
                        }}
                        placeholder="Nhập mã 6 số"
                        maxLength={6}
                        className={`${DARK_INPUT_CLASS} text-center tracking-widest font-mono text-base`}
                      />
                      <button
                        type="button"
                        onClick={() => sendOtpMutation.mutate()}
                        disabled={sendOtpMutation.isPending}
                        className={DARK_SECONDARY_BUTTON}
                      >
                        {sendOtpMutation.isPending ? 'Đang gửi…' : 'Gửi mã'}
                      </button>
                    </div>
                    {otpSent && (
                      <p className="text-[11px] text-emerald-300">
                        Mã OTP demo <strong>686868</strong> đã được điền sẵn.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Điều khoản pháp lý */}
              <label className="flex items-start gap-3 cursor-pointer pt-1 select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 size-4 rounded border-cream/20 bg-landing-card text-cream-soft accent-cream"
                />
                <span className="text-xs leading-[1.6] text-stone-400">
                  Tôi cam kết là đại diện hợp pháp của doanh nghiệp; đã đọc, hiểu rõ và đồng ý toàn bộ điều khoản trong
                  hợp đồng dịch vụ.
                </span>
              </label>

              {/* Nút Ký hợp đồng */}
              <button
                type="button"
                onClick={() => signMutation.mutate()}
                disabled={!canSubmitSign || signMutation.isPending}
                className={DARK_PRIMARY_BUTTON}
              >
                {signMutation.isPending ? 'Đang xác nhận chữ ký số…' : 'Ký hợp đồng điện tử'}
              </button>
            </div>
          ) : (
            /* Khi đã hoàn tất ký hợp đồng */
            <div className="rounded-3xl bg-landing-panel p-6 sm:p-8 ring-1 ring-cream/15 text-center space-y-6">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30">
                <ShieldCheck className="size-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-medium text-cream">Hợp đồng đã có hiệu lực</h2>
                <p className="text-xs text-stone-400 leading-relaxed max-w-[36ch] mx-auto">
                  Hợp đồng điện tử số <strong className="text-cream">{contractData?.contractNumber}</strong> đã được lưu
                  trữ an toàn. Bản sao PDF đã được gửi tới email quản trị của bạn.
                </p>
              </div>

              <div className="space-y-3">
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
                  onClick={() => navigate('/setup', { replace: true })}
                  className={DARK_PRIMARY_BUTTON}
                >
                  Tiếp tục thiết lập tổ chức
                </button>
              </div>
            </div>
          )}

          {/* Thẻ phụ hỗ trợ */}
          <div className="rounded-2xl border border-cream/10 bg-landing-panel/50 p-4 flex items-center gap-3 text-xs text-stone-400">
            <FileText className="size-4 shrink-0 text-cream-soft" />
            <span>Cần hỗ trợ tùy chỉnh hợp đồng khung hoặc xuất hóa đơn VAT? Liên hệ: legal@digitalent.ai</span>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
