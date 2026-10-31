import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Mail, CheckCircle2, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { PulseAuthLayout } from '@/features/public/pulse-landing/PulseAuthLayout';
import { passwordService } from '@/services/password.service';
import { passwordSchema } from '../validation';
import { USE_MOCK } from '@/services/mock/mock-config';

function errorMessage(error: unknown): string {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? (error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
}

const forgotSchema = z.object({
  email: z.string().trim().min(1, 'Vui lòng nhập email').pipe(z.email('Email không đúng định dạng')),
});

/**
 * AUTH-06 (1/2): Trang Yêu Cầu Đặt Lại Mật Khẩu (Quên Mật Khẩu)
 * Thiết kế chuẩn PulseAuthLayout ánh ngọc trai v3.0.
 */
export function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState('');
  const request = useMutation({
    mutationFn: async (email: string) => {
      setSubmittedEmail(email);
      const res = await passwordService.requestReset(email);
      return res.data?.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });

  return (
    <PulseAuthLayout
      mode="login"
      eyebrow="Bảo mật tài khoản doanh nghiệp"
      title="Khôi phục mật khẩu"
      subtitle="Nhập email tài khoản của bạn để nhận liên kết xác thực đặt lại mật khẩu an toàn mới."
      asideTitle="Bảo vệ toàn vẹn tài khoản của bạn."
      asideText="Mọi dữ liệu đánh giá năng lực, tiến độ học tập và minh chứng công việc của bạn luôn được mã hóa an toàn trên hệ sinh thái DigiTalent Pulse."
      asidePoints={[
        'Liên kết đặt lại mật khẩu có hiệu lực trong 30 phút',
        'Mật khẩu mới yêu cầu tối thiểu 8 ký tự kèm chữ và số',
      ]}
      footer={
        <p>
          Đã nhớ mật khẩu?{' '}
          <Link to="/login" className="font-bold text-amber-600 hover:text-amber-700 underline underline-offset-4">
            Đăng nhập ngay
          </Link>
        </p>
      }
    >
      {request.isSuccess ? (
        <div className="space-y-6 text-center py-3" role="status">
          <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <Mail className="size-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Đã gửi email khôi phục!</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Nếu email <strong className="font-mono text-slate-900 font-bold">{submittedEmail}</strong> tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu đến hộp thư của bạn.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-left text-slate-700 space-y-2.5">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>Liên kết bảo mật có thời hạn <strong>30 phút</strong> kể từ thời điểm gửi.</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <span>Kiểm tra thêm thư mục <em>Thư rác (Spam / Junk)</em> nếu chưa thấy trong hộp thư chính.</span>
            </div>
          </div>

          {USE_MOCK && request.data?.debugLink && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left">
              <strong>Môi trường thử nghiệm:</strong>{' '}
              <a href={request.data.debugLink} className="underline font-mono">
                Mở liên kết đặt lại mật khẩu mô phỏng
              </a>
            </div>
          )}

          <div className="grid gap-3 pt-2">
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition"
            >
              Quay lại đăng nhập <ArrowRight className="size-4" />
            </Link>
            <button
              type="button"
              onClick={() => request.reset()}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Gửi lại hoặc thử email khác
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(({ email }) => request.mutate(email))} noValidate className="space-y-5">
          {request.error && (
            <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMessage(request.error)}
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Email tài khoản của bạn
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ten@doanhnghiep.vn"
              aria-invalid={!!errors.email}
              className="w-full h-11 rounded-xl bg-white border border-slate-300 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm transition"
              {...register('email')}
            />
            {errors.email?.message && (
              <p className="text-xs text-rose-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={request.isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition cursor-pointer"
          >
            {request.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Đang gửi liên kết…
              </span>
            ) : (
              <>
                Gửi liên kết đặt lại mật khẩu <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
      )}
    </PulseAuthLayout>
  );
}

const resetSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu') })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  });

/**
 * AUTH-06 (2/2): Trang Đặt Lại Mật Khẩu Mới (Reset Password)
 * Thiết kế chuẩn PulseAuthLayout ánh ngọc trai v3.0.
 */
export function ResetPasswordPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validity = useQuery({
    queryKey: ['reset-token', token],
    queryFn: async () => (await passwordService.checkResetToken(token)).data,
    retry: false,
  });

  const reset = useMutation({
    mutationFn: async (password: string) => passwordService.resetPassword(token, password),
    onSuccess: () => setDone(true),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });

  return (
    <PulseAuthLayout
      mode="login"
      eyebrow="Bảo mật tài khoản doanh nghiệp"
      title="Thiết lập mật khẩu mới"
      subtitle="Tạo mật khẩu an toàn mới để tiếp tục đăng nhập vào không gian làm việc của bạn."
      asideTitle="An toàn và bảo mật theo chuẩn doanh nghiệp."
      asideText="DigiTalent áp dụng chính sách mật khẩu mạnh và mã hóa bcrypt đa tầng để bảo vệ dữ liệu hồ sơ nhân sự của bạn."
      asidePoints={[
        'Mật khẩu tối thiểu 8 ký tự',
        'Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt',
      ]}
      footer={
        <p>
          <Link to="/login" className="font-bold text-amber-600 hover:text-amber-700 underline underline-offset-4">
            Quay lại trang đăng nhập
          </Link>
        </p>
      }
    >
      {validity.isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
          <Loader2 className="size-8 animate-spin text-amber-500" />
          <p className="text-xs text-slate-500">Đang kiểm tra tính hợp lệ của liên kết xác thực…</p>
        </div>
      )}

      {validity.isError && (
        <div className="space-y-6 text-center py-4">
          <div className="size-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="size-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Liên kết không hợp lệ hoặc đã hết hạn</h2>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              {errorMessage(validity.error)}
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition"
          >
            Yêu cầu liên kết mới <ArrowRight className="size-4" />
          </Link>
        </div>
      )}

      {done && (
        <div className="space-y-6 text-center py-4" role="status">
          <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="size-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Đặt lại mật khẩu thành công!</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
              Mật khẩu mới đã được lưu an toàn. Bạn có thể đăng nhập ngay bằng mật khẩu vừa tạo.
            </p>
          </div>
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition cursor-pointer"
            onClick={() => navigate('/login', { replace: true })}
          >
            Đến trang đăng nhập ngay <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {validity.isSuccess && !done && (
        <form onSubmit={handleSubmit(({ password }) => reset.mutate(password))} noValidate className="space-y-5 text-left">
          {reset.error && (
            <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMessage(reset.error)}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Tối thiểu 8 ký tự"
                aria-invalid={!!errors.password}
                className="w-full h-11 rounded-xl bg-white border border-slate-300 px-4 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm transition"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password?.message && (
              <p className="text-xs text-rose-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nhập lại mật khẩu mới
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Xác nhận mật khẩu"
                aria-invalid={!!errors.confirmPassword}
                className="w-full h-11 rounded-xl bg-white border border-slate-300 px-4 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm transition"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword?.message && (
              <p className="text-xs text-rose-600 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={reset.isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition cursor-pointer"
          >
            {reset.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Đang lưu mật khẩu…
              </span>
            ) : (
              <>
                Lưu mật khẩu mới <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
      )}
    </PulseAuthLayout>
  );
}

/**
 * AUTH-07: Trang Xác Minh Địa Chỉ Email
 * Thiết kế chuẩn PulseAuthLayout ánh ngọc trai v3.0.
 */
export function VerifyEmailPage() {
  const { token = '' } = useParams();
  const verify = useMutation({ mutationFn: async () => passwordService.verifyEmail(token) });
  const { mutate } = verify;

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <PulseAuthLayout
      mode="login"
      eyebrow="Xác thực tài khoản"
      title="Xác minh địa chỉ email"
      subtitle="Kích hoạt quyền truy cập đầy đủ vào nền tảng DigiTalent Pulse."
      asideTitle="Một không gian phát triển năng lực số trọn vẹn."
      asideText="Sau khi xác minh email thành công, bạn có thể đăng nhập để trải nghiệm bài đánh giá đầu vào và lộ trình đào tạo chuẩn TT 02/2025."
      asidePoints={[
        'Kích hoạt bảo mật 2 lớp cho tài khoản',
        'Tự do tham gia các khóa học được phân bổ',
      ]}
    >
      <div className="space-y-6 text-center py-6" role="status">
        {(verify.isPending || verify.isIdle) && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="size-8 animate-spin text-amber-500" />
            <p className="text-xs text-slate-500">Đang đối soát mã xác thực email của bạn…</p>
          </div>
        )}

        {verify.isSuccess && (
          <>
            <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Email đã được xác minh thành công!</h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                Tài khoản của bạn đã sẵn sàng. Bạn có thể đăng nhập ngay để bắt đầu hành trình nâng cao năng lực số.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition"
            >
              Đến trang đăng nhập ngay <ArrowRight className="size-4" />
            </Link>
          </>
        )}

        {verify.isError && (
          <>
            <div className="size-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="size-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Xác thực không thành công</h2>
              <p className="text-xs text-rose-700 max-w-sm mx-auto">
                {errorMessage(verify.error)}
              </p>
            </div>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition"
            >
              Quay lại trang đăng nhập <ArrowRight className="size-4" />
            </Link>
          </>
        )}
      </div>
    </PulseAuthLayout>
  );
}
