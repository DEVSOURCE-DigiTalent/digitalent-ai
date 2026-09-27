import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../../../hooks/use-auth';
import { isSafeReturnTo } from '../auth-redirect';

/**
 * Admin Login Page — Dark Glassmorphism / Blue Brick Wall Design
 * Matches reference: wall-sconce lamp above frosted glass card on blue brick wall.
 * Flow: POST /auth/login → save tokens → GET /auth/me → store user → redirect by role.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError]           = useState('');
  const loginMutation = useLogin();
  const loading = loginMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const defaultPath = await loginMutation.mutateAsync({ email, password });
      
      const returnTo = searchParams.get('returnTo');
      let targetPath = defaultPath;
      if (isSafeReturnTo(returnTo)) {
        targetPath = returnTo;
      }
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center">

      {/* ═══════════════════════════════════════════
          SECTION 1 — Top dark zone (above the wall)
          ═══════════════════════════════════════════ */}
      <div
        className="w-full flex-shrink-0"
        style={{ height: '18vh', background: '#06080f' }}
      />

      {/* ═══════════════════════════════════════════
          SECTION 2 — Blue brick wall area
          ═══════════════════════════════════════════ */}
      <div
        className="relative w-full flex flex-col items-center"
        style={{
          flex: 1,
          /* Blue brick wall via CSS repeating gradients */
          background: `
            /* mortar vertical lines */
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 56px,
              rgba(0,20,60,0.9) 56px,
              rgba(0,20,60,0.9) 60px
            ),
            /* mortar horizontal lines */
            repeating-linear-gradient(
              180deg,
              transparent 0px,
              transparent 26px,
              rgba(0,20,60,0.9) 26px,
              rgba(0,20,60,0.9) 30px
            ),
            /* offset every-other row vertical lines */
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 26px,
              rgba(0,20,60,0.5) 26px,
              rgba(0,20,60,0.5) 30px,
              transparent 30px,
              transparent 86px,
              rgba(0,20,60,0.5) 86px,
              rgba(0,20,60,0.5) 90px
            ),
            /* base brick color */
            #1a3a6e
          `,
        }}
      >
        {/* Subtle brick depth — inner shadow at top to blend with dark header */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(6,8,15,0.7) 0%, rgba(6,8,15,0.0) 25%, rgba(0,0,0,0.25) 100%)',
          }}
        />

        {/* ── Warm glow from the lamp ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '520px',
            height: '420px',
            background: `
              radial-gradient(
                ellipse 55% 48% at 50% 8%,
                rgba(255,210,80,0.38) 0%,
                rgba(255,180,50,0.18) 30%,
                rgba(200,130,30,0.06) 60%,
                transparent 80%
              )
            `,
          }}
        />

        {/* ════════════════════════════════
            WALL SCONCE LAMP
            ════════════════════════════════ */}
        <div
          className="relative flex flex-col items-center pointer-events-none select-none"
          style={{ marginTop: '0px', zIndex: 10 }}
        >
          {/* Wall bracket / back plate */}
          <div
            style={{
              width: '72px',
              height: '28px',
              background: 'linear-gradient(180deg, #2d3a4a 0%, #1a2430 100%)',
              borderRadius: '4px 4px 0 0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
          {/* Lamp body */}
          <div
            style={{
              width: '80px',
              height: '18px',
              background: 'linear-gradient(180deg, #3a4a5a 0%, #232f3e 100%)',
              borderRadius: '2px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          />
          {/* Lamp glass / glow source */}
          <div
            style={{
              width: '56px',
              height: '12px',
              background: 'linear-gradient(180deg, #ffe680 0%, #ffd040 50%, #ffb800 100%)',
              borderRadius: '0 0 28px 28px',
              boxShadow: '0 0 22px 12px rgba(255,200,50,0.55), 0 0 5px 2px rgba(255,240,120,0.8)',
            }}
          />
        </div>

        {/* ════════════════════════════════
            GLASSMORPHISM CARD
            ════════════════════════════════ */}
        <div
          className="relative z-10 w-full"
          style={{
            maxWidth: '420px',
            margin: '0 16px',
            marginTop: '18px',
            marginBottom: '32px',
          }}
        >
          <div
            className="rounded-3xl px-8 py-9"
            style={{
              background: 'rgba(30, 45, 80, 0.45)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 12px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* ── Title ── */}
            <h1
              className="text-center font-bold text-white mb-7"
              style={{ fontSize: '2rem', letterSpacing: '-0.01em', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
            >
              Đăng nhập
            </h1>

            {/* ── Error ── */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── Phone / Username input (pill) ── */}
              <div
                className="flex items-center overflow-hidden transition-all"
                style={{
                  borderRadius: '999px',
                  background: 'rgba(15, 25, 55, 0.55)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  height: '52px',
                }}
              >
                {/* VN flag + dial code */}
                <div className="flex items-center gap-1.5 pl-5 pr-2 flex-shrink-0">
                  <span className="text-base leading-none">🇻🇳</span>
                  <span className="text-sm font-semibold text-white/70">+84</span>
                </div>
                {/* Divider */}
                <div className="w-px h-5 bg-white/15 flex-shrink-0" />
                {/* Input */}
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent px-4 text-sm text-white placeholder-white/45 outline-none"
                  placeholder="Tên đăng nhập / Email"
                  autoComplete="username"
                  required
                />
                {/* User icon */}
                <div className="pr-5 flex-shrink-0 text-white/50">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
              </div>

              {/* ── Password input (pill) ── */}
              <div
                className="flex items-center overflow-hidden transition-all"
                style={{
                  borderRadius: '999px',
                  background: 'rgba(15, 25, 55, 0.55)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  height: '52px',
                }}
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent pl-5 pr-2 text-sm text-white placeholder-white/45 outline-none"
                  placeholder="Mật khẩu"
                  autoComplete="current-password"
                  required
                />
                {/* Eye toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="pr-4 pl-2 flex-shrink-0 text-white/50 hover:text-white/80 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}
                </button>
                {/* Lock icon */}
                <div className="pr-5 flex-shrink-0 text-white/50">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1C9.24 1 7 3.24 7 6v1H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3v1H9V6c0-1.65 1.35-3 3-3zm0 9a2 2 0 110 4 2 2 0 010-4z"/>
                  </svg>
                </div>
              </div>

              {/* ── Remember me + Forgot password ── */}
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative w-4 h-4 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className="w-4 h-4 rounded-sm border border-white/50 bg-transparent peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center"
                    >
                      {rememberMe && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                          <path d="M1.5 5 L4 7.5 8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                    Ghi nhớ phiên
                  </span>
                </label>

                <button
                  type="button"
                  title="Tính năng chưa khả dụng"
                  onClick={() => alert('Tính năng chưa khả dụng')}
                  className="text-sm text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* ── CTA Login Button (white pill) ── */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #e8eef8 100%)',
                  color: '#0f172a',
                  boxShadow: '0 4px 20px rgba(255,255,255,0.20), 0 1px 3px rgba(0,0,0,0.3)',
                  fontSize: '0.95rem',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Đang xác thực...
                  </span>
                ) : (
                  'Đăng nhập vào hệ thống'
                )}
              </button>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
                <span className="text-[11px] tracking-widest text-white/35 uppercase font-medium">
                  Hoặc tiếp tục với
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
              </div>

              {/* ── Google Login ── */}
              <button
                type="button"
                title="Tính năng chưa khả dụng"
                onClick={() => alert('Tính năng chưa khả dụng')}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-full text-sm font-medium text-white transition-all cursor-pointer"
                style={{
                  background: 'rgba(15, 25, 55, 0.55)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                </span>
                Đăng nhập với Google
              </button>
            </form>

            {/* ── Footer ── */}
            <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Cần hỗ trợ truy cập?{' '}
              <a
                href="mailto:it@company.com"
                className="font-semibold transition-colors"
                style={{ color: 'rgba(255,255,255,0.85)' }}
              >
                Liên hệ IT Helpdesk
              </a>
            </p>
          </div>

          {/* Brand tag below card */}
          <p
            className="text-center mt-4 text-xs tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            DigiTalent AI · Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
}
