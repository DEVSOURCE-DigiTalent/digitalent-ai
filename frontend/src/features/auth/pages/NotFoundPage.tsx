import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  Maximize2,
  Minimize2,
  Sparkles,
  Terminal,
  EyeOff,
  X,
} from 'lucide-react';
import { useCurrentUser } from '../../../hooks/use-current-user';
import { getHomePath } from '../../../lib/navigation';

export function NotFoundPage() {
  const user = useCurrentUser((state) => state.user);
  const navigate = useNavigate();
  const homePath = user ? getHomePath(user) : '/';

  // Chế độ toàn màn hình vs khung tranh studio
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Toggle ảnh nền AI mới tạo và ảnh gốc tham chiếu
  const [wallpaperMode, setWallpaperMode] = useState<'ai' | 'reference'>('ai');
  // Chế độ "Enjoy the view" (ẩn tạm thời giao diện để ngắm trọn vẹn cảnh nền)
  const [zenMode, setZenMode] = useState(false);
  // CRT Monitor Terminal modal
  const [showTerminal, setShowTerminal] = useState(false);

  // Nhấn ESC để thoát chế độ ngắm cảnh hoặc thoát terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZenMode(false);
        setShowTerminal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const bgImage =
    wallpaperMode === 'ai'
      ? '/images/404-bg.jpg'
      : '/images/404-reference.jpg';

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center transition-colors duration-700 select-none ${
        isFullscreen
          ? 'bg-[#090b0e] p-0'
          : 'bg-[#EAE5D9] p-2 sm:p-5 md:p-8 lg:p-12'
      }`}
      style={{
        backgroundColor: isFullscreen ? '#090B0E' : '#EAE5D9',
      }}
    >
      {/* ── Khung Tranh Chính (Studio Canvas Card) ── */}
      <div
        className={`relative w-full overflow-hidden transition-all duration-700 ease-out flex flex-col justify-between ${
          isFullscreen
            ? 'h-screen w-screen rounded-none shadow-none border-none'
            : 'max-w-6xl aspect-[16/10] min-h-[580px] max-h-[92vh] rounded-2xl sm:rounded-[32px] md:rounded-[36px] shadow-[0_24px_60px_-15px_rgba(20,20,30,0.38)] border border-black/20'
        }`}
      >
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-100"
          style={{
            backgroundImage: `url('${bgImage}')`,
          }}
        />

        {/* Lớp hạt nhiễu analog / film grain và vignette mềm */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(5, 7, 10, 0.4) 100%)',
          }}
        />

        {/* ── Nút Thoát Zen Mode (khi đang thưởng thức cảnh) ── */}
        {zenMode && (
          <button
            type="button"
            onClick={() => setZenMode(false)}
            className="absolute top-6 right-6 z-30 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white/90 text-xs font-mono tracking-wider backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 shadow-lg"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hiển thị lại menu (ESC)</span>
          </button>
        )}

        {/* ── Floating Controls Bar (Góc trên cùng bên phải) ── */}
        <div
          className={`absolute top-4 right-4 sm:top-6 sm:right-6 z-20 transition-opacity duration-300 ${
            zenMode ? 'opacity-0 pointer-events-none' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md border border-white/15 rounded-full px-2.5 py-1 text-white/70 text-xs shadow-md">
            <button
              type="button"
              onClick={() =>
                setWallpaperMode((m) => (m === 'ai' ? 'reference' : 'ai'))
              }
              title={
                wallpaperMode === 'ai'
                  ? 'Chuyển sang ảnh mẫu gốc'
                  : 'Chuyển sang ảnh AI mới tạo'
              }
              className="px-2 py-0.5 rounded-full hover:text-white hover:bg-white/15 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span className="hidden sm:inline">
                {wallpaperMode === 'ai' ? 'Ảnh AI' : 'Ảnh gốc'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowTerminal(true)}
              title="Mở CRT Terminal"
              className="p-1 rounded-full hover:text-white hover:bg-white/15 transition-colors"
              aria-label="Mở CRT terminal"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((f) => !f)}
              title={isFullscreen ? 'Thu nhỏ khung card' : 'Toàn màn hình'}
              className="p-1 rounded-full hover:text-white hover:bg-white/15 transition-colors"
              aria-label={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Header / Top Bar ── */}
        <header
          className={`relative z-10 p-6 sm:p-8 md:p-10 flex items-start justify-between transition-opacity duration-500 ${
            zenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Logo Monogram góc trên bên trái giống hệt ảnh mẫu */}
          <Link
            to={homePath}
            aria-label="DigiTalent AI"
            title="DigiTalent AI Home"
            className="group flex items-center gap-3 text-white/80 hover:text-white transition-opacity pt-1"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-xs hover:border-white/80 transition-colors">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white/80 group-hover:text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3.5 12h17" />
                <path
                  d="M12 3.5a14 14 0 0 1 4 8.5 14 14 0 0 1-4 8.5 14 14 0 0 1-4-8.5 14 14 0 0 1 4-8.5z"
                  strokeOpacity="0.35"
                />
              </svg>
            </div>
          </Link>

          {/* Typography 404 phong cách nghệ thuật cổ điển với số 0 gạch chéo */}
          <div
            className="text-right select-none pointer-events-none pt-2 sm:pt-4 pr-1 sm:pr-4"
            aria-hidden="true"
          >
            <div
              className="text-7xl sm:text-9xl md:text-[140px] lg:text-[175px] xl:text-[200px] leading-[0.8] tracking-[-0.04em] text-white/45 drop-shadow-[0_2px_30px_rgba(255,255,255,0.22)] font-normal"
              style={{
                fontFamily:
                  "'Newsreader', 'Didot', 'Bodoni MT', Georgia, serif",
              }}
            >
              <span className="inline-flex items-center">
                <span>4</span>
                {/* Số 0 với đường gạch chéo Ø tuyệt đẹp */}
                <span className="relative inline-flex items-center justify-center mx-[0.02em]">
                  <span>0</span>
                  <span
                    className="absolute w-[114%] h-[2.5px] sm:h-[3.5px] md:h-[4.5px] lg:h-[5.5px] bg-white/50 -rotate-[42deg] rounded-full"
                    style={{
                      boxShadow: '0 0 2px rgba(255, 255, 255, 0.7)',
                    }}
                  />
                </span>
                <span>4</span>
              </span>
            </div>
          </div>
        </header>

        {/* ── Điểm chạm tương tác tại màn hình CRT trên ngọn đồi (Easter Egg) ── */}
        <button
          type="button"
          onClick={() => setShowTerminal(true)}
          title="Nhấp vào máy tính CRT trên đồi"
          aria-label="Khám phá máy tính CRT"
          className="absolute z-10 left-[51%] top-[54%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center group cursor-pointer"
        >
          <span className="absolute w-5 h-5 rounded-full bg-amber-300/20 group-hover:animate-ping group-hover:bg-amber-300/40" />
          <span className="relative w-3 h-3 rounded-full bg-amber-200/60 border border-white/60 shadow-[0_0_10px_rgba(251,191,36,0.8)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* ── Hộp thoại mô phỏng Terminal CRT cổ điển ── */}
        {showTerminal && (
          <div className="absolute inset-0 z-20 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0e14] border border-cyan-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl font-mono text-xs sm:text-sm text-cyan-300 relative animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={() => setShowTerminal(false)}
                className="absolute top-4 right-4 text-cyan-400/70 hover:text-cyan-100 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-500/20 text-cyan-400">
                <Terminal className="w-4 h-4" />
                <span className="font-semibold tracking-wider uppercase text-xs">
                  VINTAGE CRT // 404 DIAGNOSTIC LOG
                </span>
              </div>

              <div className="space-y-2 text-xs sm:text-[13px] text-cyan-200/90 leading-relaxed">
                <p className="text-emerald-400">&gt; DIAL-UP HANDSHAKE: CONNECTED TO OUTER REACHES</p>
                <p>&gt; REQUESTED_ROUTE: &quot;{window.location.pathname}&quot;</p>
                <p className="text-amber-300">&gt; ERROR_CODE: 404 (RESOURCE_NOT_FOUND)</p>
                <p>&gt; LOCATION: HILLTOP MATRIX STATION #04</p>
                <p className="text-neutral-400 pt-2 border-t border-cyan-500/20">
                  &gt; Gợi ý: Trang bạn truy cập có thể đã được chuyển dời. Hãy quay lại trang chủ của DigiTalent AI hoặc dừng chân thưởng ngoạn cảnh sắc.
                </p>
              </div>

              <div className="mt-5 flex gap-3 justify-end font-sans">
                <Link
                  to={homePath}
                  onClick={() => setShowTerminal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500 text-black font-medium text-xs hover:bg-cyan-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <Home className="w-3.5 h-3.5" />
                  Về trang chủ ngay
                </Link>
                <button
                  type="button"
                  onClick={() => setShowTerminal(false)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 text-xs transition-colors"
                >
                  Đóng màn hình
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Bottom Section: Dark Vignette Gradient + Typewriter Quote + Footer Dock ── */}
        <div
          className={`relative z-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-28 pb-6 sm:pb-8 px-6 sm:px-10 md:px-12 transition-opacity duration-500 ${
            zenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Dòng trích dẫn phong cách máy đánh chữ cổ điển y hệt ảnh */}
          <div className="text-center mb-6 sm:mb-8 space-y-1.5">
            <p className="font-mono text-xs sm:text-sm md:text-[15px] tracking-wide text-[#E2DFD8] font-light drop-shadow">
              We&apos;re sorry. We can&apos;t connect to the outer reaches of the web right now.
            </p>
            <p className="font-sans text-[11px] sm:text-xs text-[#9B978F] font-light tracking-normal">
              Rất tiếc. Không thể kết nối đến trang bạn yêu cầu trong không gian mạng lúc này.
            </p>
          </div>

          {/* Thanh Footer Dock 3 phân đoạn y hệt ảnh mẫu */}
          <footer className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-xs font-mono text-[#9B978F]">
            {/* Phân đoạn Trái: Thương hiệu sukoya.design / digitalent.ai */}
            <div className="text-center md:text-left">
              <Link
                to={homePath}
                className="hover:text-[#EDEAE2] transition-colors tracking-widest"
              >
                digitalent.ai
              </Link>
            </div>

            {/* Phân đoạn Giữa: Câu hỏi hành động "Head home or enjoy the view?" */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-center">
              <Link
                to={homePath}
                aria-label="Head home"
                title="Quay về trang chủ"
                className="text-[#D0CDC4] hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all font-mono"
              >
                Head home
              </Link>

              <span className="text-[#68655E]">or</span>

              <button
                type="button"
                onClick={() => setZenMode(true)}
                className="text-[#A7A39B] hover:text-[#EDEAE2] transition-colors font-mono cursor-pointer"
                title="Nhấp để ẩn giao diện và ngắm trọn cảnh"
              >
                enjoy the view?
              </button>

              {/* Nút Về trang chủ & Quay lại bổ trợ, đảm bảo tương thích trọn vẹn test và accessibility */}
              <div className="inline-flex items-center gap-1.5 ml-2 font-sans">
                <Link
                  to={homePath}
                  aria-label="Về trang chủ"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[#EDEAE2] text-[11px] border border-white/15 transition-all"
                  title="Về trang chủ"
                >
                  <Home className="w-3 h-3" />
                  <span>Về trang chủ</span>
                </Link>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-white/10 text-[#A7A39B] hover:text-white text-[11px] transition-colors"
                  title="Quay lại trang trước"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Quay lại</span>
                </button>
              </div>
            </div>

            {/* Phân đoạn Phải: web • product • brand */}
            <div className="flex items-center justify-center md:justify-end gap-2.5 tracking-wider text-[11px]">
              <Link
                to="/"
                className="hover:text-[#EDEAE2] transition-colors"
                title="Trang chủ / Cổng thông tin"
              >
                web
              </Link>
              <span className="text-[#68655E]">•</span>
              <Link
                to="/careers"
                className="hover:text-[#EDEAE2] transition-colors"
                title="Danh mục nghề nghiệp & Khóa học"
              >
                product
              </Link>
              <span className="text-[#68655E]">•</span>
              <Link
                to="/business"
                className="hover:text-[#EDEAE2] transition-colors"
                title="Giải pháp Doanh nghiệp"
              >
                brand
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
