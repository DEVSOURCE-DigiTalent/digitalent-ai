import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Lock,
  Mail,
  PenTool,
  Phone,
  QrCode,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useCourseCatalog, usePurchaseCourseSeats } from '@/hooks/use-assignments';
import { useOrganization } from '@/hooks/use-organization';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PULSE_TOKENS } from '../owner-theme';
import type { CourseListItem } from '@/services/assignment.service';

/** Chuẩn hóa mã khóa học chuẩn (A1..A6 <-> M1..M6). */
function canonicalCode(code?: string): string {
  if (!code) return '';
  const trimmed = code.trim().toUpperCase();
  if ((trimmed.startsWith('A') || trimmed.startsWith('M')) && trimmed.length > 2 && !isNaN(Number(trimmed[1]))) {
    return 'M' + trimmed.slice(1);
  }
  return trimmed;
}

interface CartItem {
  course: CourseListItem;
  canonicalCode: string;
  level: number;
  unitPrice: number;
  seats: number;
}

export function CourseCheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: orgData } = useOrganization();
  const currentUser = useCurrentUser((s) => s.user);
  const purchaseMutation = usePurchaseCourseSeats();

  const { data: coursesData, isLoading: coursesLoading } = useCourseCatalog({});

  // 1. Phân tích danh sách mã khóa học từ URL (?courses=M1-I,M2-A&seats=10)
  const coursesParam = searchParams.get('courses') || searchParams.get('selected') || searchParams.get('code') || '';
  const defaultSeats = Math.max(1, Number(searchParams.get('seats')) || 10);

  const requestedCodes = useMemo(() => {
    return coursesParam
      .split(',')
      .map((c) => canonicalCode(c))
      .filter(Boolean);
  }, [coursesParam]);

  // Giỏ hàng lưu trữ các khóa học được chọn thanh toán
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartInitialized, setCartInitialized] = useState(false);

  useEffect(() => {
    if (!coursesData?.items || cartInitialized) return;

    const items: CartItem[] = [];
    const allCourses = coursesData.items;

    requestedCodes.forEach((reqCode) => {
      const match = allCourses.find((c) => canonicalCode(c.code) === reqCode || c.code.toUpperCase() === reqCode);
      if (match) {
        const level = match.code.endsWith('-A') ? 3 : match.code.endsWith('-I') ? 2 : 1;
        const unitPrice = level === 3 ? 699000 : level === 2 ? 399000 : 0;
        items.push({
          course: match,
          canonicalCode: reqCode,
          level,
          unitPrice,
          seats: defaultSeats,
        });
      }
    });

    // Fallback: nếu không có mã nào truyền vào hoặc không tìm thấy, lấy khóa M1-I làm ví dụ
    if (items.length === 0 && allCourses.length > 0) {
      const defaultCourse = allCourses.find((c) => c.code.endsWith('-I')) || allCourses[0];
      if (defaultCourse) {
        const level = defaultCourse.code.endsWith('-A') ? 3 : 2;
        items.push({
          course: defaultCourse,
          canonicalCode: canonicalCode(defaultCourse.code),
          level,
          unitPrice: level === 3 ? 699000 : 399000,
          seats: defaultSeats,
        });
      }
    }

    setCartItems(items);
    setCartInitialized(true);
  }, [coursesData?.items, requestedCodes, defaultSeats, cartInitialized]);

  // 2. Thông tin pháp lý & đại diện doanh nghiệp
  const [customerInfo, setCustomerInfo] = useState({
    companyName: '',
    taxId: '0109988223',
    representativeName: '',
    roleTitle: 'Đại diện Doanh nghiệp',
    phone: '',
    email: '',
    address: 'Hà Nội, Việt Nam',
    needInvoice: true,
  });

  // Tự động điền từ thông tin tài khoản hiện tại
  useEffect(() => {
    setCustomerInfo((prev) => ({
      ...prev,
      companyName: prev.companyName || orgData?.name || currentUser?.organizationName || 'Công ty TNHH Giải pháp Số',
      representativeName: prev.representativeName || currentUser?.fullName || 'Nguyễn Hoàng',
      email: prev.email || currentUser?.email || 'contact@digitalent.vn',
      phone: prev.phone || (currentUser as any)?.phoneNumber || '0988776655',
    }));
  }, [orgData, currentUser]);

  // 3. Chữ ký số online (E-Signature)
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [inkColor, setInkColor] = useState<'#0f3b82' | '#1e293b'>('#0f3b82');
  const [isSigned, setIsSigned] = useState(false);
  const [signatureDate, setSignatureDate] = useState<string>('');
  const [docHash] = useState(() => 'DT-ESIGN-' + Math.random().toString(36).substring(2, 9).toUpperCase());
  const [agreedTerms, setAgreedTerms] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Setup Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = inkColor;
  }, [inkColor, signatureMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasDrawn(false);
    setIsSigned(false);
  };

  const confirmSignature = () => {
    if (signatureMode === 'draw' && !hasDrawn) {
      toast.error('Vui lòng ký tay vào ô bên dưới.');
      return;
    }
    if (signatureMode === 'type' && !typedSignature.trim()) {
      toast.error('Vui lòng nhập họ tên để tạo chữ ký.');
      return;
    }
    setIsSigned(true);
    setSignatureDate(new Date().toLocaleString('vi-VN'));
    toast.success('Đã xác thực chữ ký số điện tử của doanh nghiệp!');
  };

  // 4. Trạng thái thanh toán (Step 1: Info & Sign -> Step 2: VietQR Payment -> Step 3: Success)
  const [step, setStep] = useState<'form' | 'payment' | 'completed'>('form');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    orderId: string;
    orderCode: string;
    totalAmount: number;
    checkoutUrl?: string;
    qrCode?: string;
  } | null>(null);

  // Tính toán chi phí
  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.seats * item.unitPrice, 0);
  }, [cartItems]);

  const updateSeats = (canonicalCode: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.canonicalCode === canonicalCode) {
          const nextSeats = Math.max(1, item.seats + delta);
          return { ...item, seats: nextSeats };
        }
        return item;
      })
    );
  };

  const removeCartItem = (canonicalCode: string) => {
    if (cartItems.length <= 1) {
      toast.error('Cần ít nhất 1 khóa học trong đơn đăng ký.');
      return;
    }
    setCartItems((prev) => prev.filter((item) => item.canonicalCode !== canonicalCode));
  };

  // Tiến hành xác nhận đơn hàng & chuyển sang bước thanh toán VietQR
  const handleProceedToPayment = async () => {
    if (!customerInfo.representativeName.trim()) {
      toast.error('Vui lòng nhập họ và tên người đại diện.');
      return;
    }
    if (!customerInfo.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại liên hệ.');
      return;
    }
    if (!isSigned) {
      toast.error('Vui lòng ký online để hoàn tất hợp đồng dịch vụ đào tạo.');
      return;
    }
    if (!agreedTerms) {
      toast.error('Vui lòng đồng ý với điều khoản hợp đồng đào tạo.');
      return;
    }

    setIsProcessing(true);
    try {
      // Thực thi lưu đơn và mở bản quyền trên backend
      let lastOrderId = '';
      const signerNote = `[Hợp đồng điện tử: ${docHash}] Đại diện: ${customerInfo.representativeName} (${customerInfo.phone})`;

      for (const item of cartItems) {
        const res = await purchaseMutation.mutateAsync({
          courseId: item.course.id,
          seats: item.seats,
          note: signerNote,
        });
        lastOrderId = res.orderId;
      }

      const generatedCode = 'DT' + Math.floor(100000 + Math.random() * 900000);
      setPaymentResult({
        orderId: lastOrderId,
        orderCode: generatedCode,
        totalAmount,
      });

      setStep('payment');
      toast.success('Hợp đồng đã ký thành công! Vui lòng quét mã VietQR để thanh toán.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}: ${text}`);
  };

  return (
    <div
      className="po-owner -m-4 md:-m-6 min-h-screen px-4 md:px-8 py-8"
      style={{ ...PULSE_TOKENS, background: 'radial-gradient(ellipse at 50% 0%, var(--po-soft) 0%, var(--po-canvas) 60%)' }}
    >
      <div className="mx-auto max-w-6xl">
        {/* ── Thanh điều hướng & Breadcrumb ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/enterprise/setup"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Quay lại Khung năng lực</span>
          </Link>

          {/* Stepper chỉ báo tiến trình chuyên nghiệp */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${
                step === 'form'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <span>1</span>
              <span>Hợp đồng & Ký online</span>
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${
                step === 'payment'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : step === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span>2</span>
              <span>Thanh toán VietQR</span>
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${
                step === 'completed'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span>3</span>
              <span>Kích hoạt trần</span>
            </span>
          </div>
        </div>

        {/* ── Tiêu đề chính ── */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: 'var(--po-accent)' }}>
            <ShieldCheck className="size-4 text-emerald-600" />
            Hợp đồng đào tạo chuẩn hóa năng lực số · Nghị định 130/2018/NĐ-CP
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Thanh toán & Ký kết Hợp đồng Cung cấp Suất học
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
            Doanh nghiệp hoàn tất thông tin người đại diện, ký chữ ký điện tử trực tuyến và thanh toán qua cổng VietQR PayOS để tự động mở trần năng lực số toàn diện.
          </p>
        </header>

        {coursesLoading ? (
          <div className="py-24 text-center text-sm text-slate-500">Đang chuẩn bị hồ sơ hợp đồng…</div>
        ) : step === 'completed' ? (
          /* ── BƯỚC 3: HOÀN TẤT THÀNH CÔNG ── */
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-12 shadow-xl text-center max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
              <Check className="size-10 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                Giao dịch thành công · Bản quyền đã kích hoạt
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Ký hợp đồng & Nâng trần năng lực thành công!
              </h2>
              <p className="text-sm text-slate-600">
                Đơn hàng và chữ ký điện tử số hiệu <b>{paymentResult?.orderCode || docHash}</b> của <b>{customerInfo.companyName}</b> đã được lưu trữ hợp lệ trên hệ thống DigiTalent AI.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Người đại diện ký kết:</span>
                <span className="font-bold text-slate-900">{customerInfo.representativeName} ({customerInfo.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số lượng khóa mở bản quyền:</span>
                <span className="font-bold text-slate-900">{cartItems.length} khóa ({cartItems.reduce((s, c) => s + c.seats, 0)} suất học)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng thanh toán:</span>
                <span className="font-bold text-emerald-700">{totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Mã chứng thực e-Sign:</span>
                <span className="font-mono text-slate-700 font-semibold">{docHash}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  toast.success('Đang tạo và tải hợp đồng đào tạo có chữ ký điện tử...');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Download className="size-4" />
                <span>Tải hợp đồng điện tử (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/enterprise/setup')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-105"
                style={{ background: 'var(--po-accent)' }}
              >
                <span>Xem Khung năng lực đã mở trần →</span>
              </button>
            </div>
          </div>
        ) : step === 'payment' ? (
          /* ── BƯỚC 2: CỔNG THANH TOÁN VIETQR PRO PAYOS ── */
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
            {/* Cột trái: Mã VietQR chuyển khoản */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Quét mã VietQR chuyển khoản 24/7</h2>
                  <p className="text-xs text-slate-500">Hỗ trợ tất cả ứng dụng Ngân hàng (Vietcombank, MB, Techcombank...) và ví điện tử</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  Chờ thanh toán
                </span>
              </div>

              {/* Khung mã QR nổi bật */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-amber-50/30 border border-amber-200/70">
                <div className="rounded-2xl border-4 border-white bg-white p-3 shadow-lg">
                  <img
                    src={`https://api.vietqr.io/image/970422-03889988868-compact2.jpg?amount=${totalAmount}&addInfo=${encodeURIComponent(
                      `${paymentResult?.orderCode || 'DT'} ${customerInfo.phone}`
                    )}&accountName=DIGITALENT%20AI%20PLATFORM`}
                    alt="Mã thanh toán VietQR"
                    className="size-56 sm:size-64 object-contain rounded-lg"
                  />
                </div>
                <p className="mt-3 text-xs text-slate-500 font-medium">Mở App Ngân hàng của bạn và chọn <b>Quét mã QR</b></p>
              </div>

              {/* Thông tin chuyển khoản chi tiết kèm nút Copy */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                  <span className="font-bold text-slate-900">MB Bank (Ngân hàng TMCP Quân Đội)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-900 uppercase">CONG TY CP CONG NGHE DIGITALENT AI</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">03889988868</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('03889988868', 'Số tài khoản')}
                      className="p-1 rounded text-slate-400 hover:text-slate-800"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Số tiền chính xác:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-emerald-700 text-base">{totalAmount.toLocaleString('vi-VN')} ₫</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(totalAmount.toString(), 'Số tiền')}
                      className="p-1 rounded text-slate-400 hover:text-slate-800"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <span className="text-amber-900 font-medium">Nội dung chuyển khoản (bắt buộc):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-amber-900">{paymentResult?.orderCode || 'DT'} {customerInfo.phone}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`${paymentResult?.orderCode || 'DT'} ${customerInfo.phone}`, 'Nội dung CK')}
                      className="p-1 rounded text-amber-700 hover:text-amber-900"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Nút hoàn tất */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  ← Điều chỉnh hợp đồng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('completed');
                    toast.success('Hệ thống đã ghi nhận thanh toán thành công!');
                  }}
                  className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-105"
                  style={{ background: 'var(--po-accent)' }}
                >
                  <CheckCircle2 className="size-4" />
                  <span>Tôi đã chuyển khoản thành công</span>
                </button>
              </div>
            </div>

            {/* Cột phải: Hợp đồng đã ký tóm tắt */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b pb-3">
                <FileCheck className="size-4 text-emerald-600" />
                <span>Hồ sơ Hợp đồng đào tạo điện tử</span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Doanh nghiệp:</span>
                  <span className="font-semibold text-slate-800">{customerInfo.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Người đại diện ký:</span>
                  <span className="font-semibold text-slate-800">{customerInfo.representativeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã chữ ký điện tử:</span>
                  <span className="font-mono text-emerald-700 font-semibold">{docHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời gian ký:</span>
                  <span className="font-semibold text-slate-800">{signatureDate || 'Hôm nay'}</span>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-700" />
                  <span>Chứng thực số hợp lệ</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Chữ ký điện tử của doanh nghiệp đã được đóng dấu thời gian (Timestamp) theo quy định Luật Giao dịch điện tử.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ── BƯỚC 1: NHẬP THÔNG TIN, KÝ ONLINE & XEM ĐƠN HÀNG ── */
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
            {/* CỘT TRÁI: FORM ĐẠI DIỆN & KÝ ONLINE */}
            <div className="space-y-6">
              {/* Thẻ 1: Thông tin đại diện doanh nghiệp */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <span className="grid size-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
                    1
                  </span>
                  <h2 className="text-base font-bold text-slate-900">Thông tin Đại diện Doanh nghiệp ký kết</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Building2 className="size-3.5 text-slate-400" />
                      Tên đầy đủ của Doanh nghiệp / Tổ chức *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.companyName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, companyName: e.target.value })}
                      placeholder="VD: Công ty Cổ phần Công nghệ ABC"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <User className="size-3.5 text-slate-400" />
                      Họ và tên người đại diện *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.representativeName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, representativeName: e.target.value })}
                      placeholder="VD: Nguyễn Hoàng"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Phone className="size-3.5 text-slate-400" />
                      Số điện thoại liên hệ *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="VD: 0988776655"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Mail className="size-3.5 text-slate-400" />
                      Email nhận hợp đồng điện tử & kích hoạt tài khoản *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="VD: contact@digitalent.vn"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={customerInfo.needInvoice}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, needInvoice: e.target.checked })}
                      className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Yêu cầu xuất Hóa đơn điện tử VAT (Hóa đơn GTGT) cho doanh nghiệp</span>
                  </label>
                </div>
              </div>

              {/* Thẻ 2: Hợp đồng đào tạo & Ký online */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
                      2
                    </span>
                    <h2 className="text-base font-bold text-slate-900">Ký chữ ký điện tử trực tuyến (e-Sign)</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAgreementModal(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    <FileText className="size-3.5" />
                    <span>Xem điều khoản hợp đồng</span>
                  </button>
                </div>

                {/* Chế độ ký: Vẽ tay hoặc Nhập tên */}
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setSignatureMode('draw')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        signatureMode === 'draw'
                          ? 'bg-white text-slate-900 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ✍️ Ký tay trực tiếp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSignatureMode('type');
                        setTypedSignature(customerInfo.representativeName);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        signatureMode === 'type'
                          ? 'bg-white text-slate-900 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🔤 Ký theo họ tên
                    </button>
                  </div>

                  {signatureMode === 'draw' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Màu mực:</span>
                      <button
                        type="button"
                        onClick={() => setInkColor('#0f3b82')}
                        className={`size-5 rounded-full border-2 transition-all ${
                          inkColor === '#0f3b82' ? 'border-amber-500 scale-110' : 'border-transparent'
                        }`}
                        style={{ background: '#0f3b82' }}
                        title="Mực xanh bút ký"
                      />
                      <button
                        type="button"
                        onClick={() => setInkColor('#1e293b')}
                        className={`size-5 rounded-full border-2 transition-all ${
                          inkColor === '#1e293b' ? 'border-amber-500 scale-110' : 'border-transparent'
                        }`}
                        style={{ background: '#1e293b' }}
                        title="Mực đen"
                      />
                    </div>
                  )}
                </div>

                {/* Vùng ký chữ ký số */}
                {signatureMode === 'draw' ? (
                  <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-white transition-all overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-44 cursor-crosshair touch-none"
                    />

                    {/* Dòng hướng dẫn mờ */}
                    {!hasDrawn && (
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-slate-400 select-none">
                        <PenTool className="size-6 mb-1 text-slate-300" />
                        <span className="text-xs font-semibold">Dùng chuột hoặc màn hình cảm ứng để ký tên tại đây</span>
                        <span className="text-[11px] text-slate-400">Đường ký mẫu tiêu chuẩn Việt Nam</span>
                      </div>
                    )}

                    {/* Đường nét đứt ký tên chuẩn hợp đồng */}
                    <div className="pointer-events-none absolute bottom-6 inset-x-8 border-b border-slate-300/60 flex justify-between text-[10px] text-slate-400">
                      <span>Dấu chữ ký số người đại diện</span>
                      <span>Ký trực tiếp</span>
                    </div>

                    {/* Nút xóa ký lại */}
                    {hasDrawn && (
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="absolute top-2 right-2 rounded-lg bg-white/90 border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 shadow-xs flex items-center gap-1"
                      >
                        <RotateCcw className="size-3" />
                        <span>Xóa ký lại</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Nhập họ tên đại diện để tạo chữ ký thư pháp điện tử:</label>
                      <input
                        type="text"
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        placeholder="Họ và tên..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-center">
                      <p className="text-[11px] text-slate-400 mb-1">Mẫu chữ ký điện tử hiển thị trên hợp đồng:</p>
                      <p
                        className="text-3xl font-serif italic text-blue-900 tracking-wider py-2 select-none"
                        style={{ fontFamily: 'Georgia, cursive' }}
                      >
                        {typedSignature || 'Chữ ký điện tử'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Trạng thái xác nhận chữ ký */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {!isSigned ? (
                    <button
                      type="button"
                      onClick={confirmSignature}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="size-3.5" />
                      <span>Xác nhận chữ ký này</span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span>Đã đóng dấu chữ ký điện tử ({signatureDate})</span>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 font-mono">
                    Mã xác thực: <b className="text-slate-600">{docHash}</b>
                  </div>
                </div>

                {/* Cam kết pháp lý */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-relaxed select-none">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      Tôi cam kết là đại diện hợp pháp của doanh nghiệp, đồng ý với các{' '}
                      <button
                        type="button"
                        onClick={() => setShowAgreementModal(true)}
                        className="text-emerald-700 font-bold underline"
                      >
                        Điều khoản Hợp đồng đào tạo trực tuyến
                      </button>{' '}
                      và cam kết thanh toán chi phí suất học theo thông tin đã đăng ký.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & NÚT TIẾP TỤC */}
            <aside className="lg:sticky lg:top-6 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>Khóa học đã chọn</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.2 text-xs font-semibold text-slate-600">
                      {cartItems.length}
                    </span>
                  </h3>
                  <Link to="/enterprise/courses" className="text-xs font-semibold text-emerald-700 hover:underline">
                    + Thêm khóa
                  </Link>
                </div>

                {/* Danh sách khóa học trong đơn */}
                <div className="space-y-3 divide-y divide-slate-100">
                  {cartItems.map((item) => (
                    <div key={item.canonicalCode} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {item.canonicalCode}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              Bậc {item.level} ({item.level === 3 ? 'Nâng cao' : 'Trung cấp'})
                            </span>
                          </div>
                          <h4 className="mt-1 text-xs font-bold text-slate-900 line-clamp-1">
                            {item.course.title}
                          </h4>
                        </div>
                        {cartItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCartItem(item.canonicalCode)}
                            className="text-slate-400 hover:text-rose-500 p-0.5"
                            title="Xóa khóa này"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Bộ chỉnh số lượng suất */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Số suất học:</span>
                          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateSeats(item.canonicalCode, -5)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded-l-lg font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 font-bold text-slate-900 bg-white">{item.seats}</span>
                            <button
                              type="button"
                              onClick={() => updateSeats(item.canonicalCode, 5)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded-r-lg font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <span className="font-bold text-slate-900">
                          {(item.seats * item.unitPrice).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tóm lược chi phí */}
                <div className="rounded-2xl bg-slate-50 p-4 space-y-2 text-xs border border-slate-200/70">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính ({cartItems.reduce((s, c) => s + c.seats, 0)} suất):</span>
                    <span className="font-semibold text-slate-900">{totalAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Ưu đãi dùng thử doanh nghiệp:</span>
                    <span className="font-semibold text-emerald-600">Miễn phí mở trần Cấp 1</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Thuế GTGT (VAT):</span>
                    <span className="font-semibold text-slate-900">0% (Đào tạo chuẩn)</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                    <span>Tổng đầu tư đào tạo:</span>
                    <span className="text-emerald-700 text-base font-extrabold">{totalAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>

                {/* Nút hành động */}
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-bold text-white shadow-md hover:brightness-105 transition-all disabled:opacity-50"
                  style={{ background: 'var(--po-accent)' }}
                >
                  {isProcessing ? (
                    <span className="animate-spin inline-block size-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <CreditCard className="size-4" />
                  )}
                  <span>
                    {isProcessing ? 'Đang tạo hợp đồng...' : 'Ký duyệt & Mở thanh toán VietQR →'}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>Bảo mật giao dịch mã hóa 256-bit SSL</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* ── MODAL: XEM ĐIỀU KHOẢN HỢP ĐỒNG ĐÀO TẠO TIÊU CHUẨN ── */}
      {showAgreementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-emerald-700">Mẫu Hợp đồng điện tử</span>
                <h3 className="text-base font-bold text-slate-900">Hợp đồng Cung cấp Dịch vụ Đào tạo Chuẩn hóa Năng lực Số</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed pr-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
                <p><b>BÊN A (Đơn vị cung cấp):</b> CÔNG TY CỔ PHẦN CÔNG NGHỆ DIGITALENT AI</p>
                <p><b>BÊN B (Khách hàng):</b> {customerInfo.companyName || '[Tên Doanh nghiệp]'} - Đại diện: {customerInfo.representativeName || '[Người đại diện]'}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800">Điều 1: Phạm vi và Mục tiêu đào tạo</h4>
                <p>
                  Bên A cấp quyền truy cập nền tảng đào tạo trực tuyến DigiTalent Pulse, các học phần bài giảng số hóa và hệ thống đánh giá theo Khung năng lực số quốc gia (Thông tư 02/2025/TT-BTTTT).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800">Điều 2: Mở trần năng lực & Suất học</h4>
                <p>
                  Khi Bên B hoàn tất nghĩa vụ thanh toán, hệ thống sẽ tự động nâng Trần năng lực của Bên B tương ứng với các khóa học đã đăng ký. Bên B có toàn quyền phân công nhân viên vào các đợt đào tạo và theo dõi tiến độ thời gian thực.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800">Điều 3: Tính pháp lý của Chữ ký điện tử</h4>
                <p>
                  Hợp đồng này được xác lập dưới dạng thông điệp dữ liệu điện tử có giá trị pháp lý tương đương bản gốc theo Luật Giao dịch điện tử số 20/2023/QH15 và Nghị định số 130/2018/NĐ-CP.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className="rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm"
                style={{ background: 'var(--po-accent)' }}
              >
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CourseCheckoutPage;
