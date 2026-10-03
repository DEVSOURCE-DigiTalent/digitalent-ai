import { useState } from 'react';
import { toast } from 'sonner';

interface SocialAuthButtonsProps {
  mode?: 'login' | 'register';
}

export function SocialAuthButtons({ mode = 'login' }: SocialAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialClick = (providerName: string) => {
    setLoadingProvider(providerName);
    setTimeout(() => {
      setLoadingProvider(null);
      toast.info(`Tính năng đăng nhập qua ${providerName} đang được kích hoạt qua cổng SSO.`);
    }, 600);
  };

  return (
    <div className="mt-4">
      <div className="relative flex items-center justify-center mb-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative bg-[#141416] px-3 font-mono text-[10px] text-stone-500 lowercase tracking-wider">
          {mode === 'login' ? 'hoặc tiếp tục với' : 'hoặc đăng ký bằng'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Google */}
        <button
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleSocialClick('Google')}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#1e1e24] px-2 text-[11px] font-medium text-stone-300 transition-all hover:bg-[#282830] hover:border-white/20 hover:text-white active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          aria-label="Google"
        >
          <svg className="size-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.8 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.4-6.7-5.3L1.6 16c1.9 3.8 5.8 6.4 10.4 6.4z"
            />
          </svg>
          <span>Google</span>
        </button>

        {/* Apple */}
        <button
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleSocialClick('Apple')}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#1e1e24] px-2 text-[11px] font-medium text-stone-300 transition-all hover:bg-[#282830] hover:border-white/20 hover:text-white active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          aria-label="Apple"
        >
          <svg className="size-3.5 shrink-0 fill-current text-white" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1.01.08 2.03-.49 2.64-1.24z" />
          </svg>
          <span>Apple</span>
        </button>

        {/* Microsoft */}
        <button
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleSocialClick('Microsoft')}
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#1e1e24] px-2 text-[11px] font-medium text-stone-300 transition-all hover:bg-[#282830] hover:border-white/20 hover:text-white active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          aria-label="Microsoft"
        >
          <svg className="size-3.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#F25022" d="M1 1h10v10H1z" />
            <path fill="#00A4EF" d="M1 13h10v10H1z" />
            <path fill="#7FBA00" d="M13 1h10v10H13z" />
            <path fill="#FFB900" d="M13 13h10v10H13z" />
          </svg>
          <span>Microsoft</span>
        </button>
      </div>
    </div>
  );
}
