import { translateUi, useUiLanguage } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Shield, Settings, LogOut, ChevronDown, Sun, Moon, GraduationCap, MessageSquare, Bug } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogout } from '@/hooks/use-auth';
import { ROLE_LABELS, type Role } from '@/lib/roles';
import { useEnterpriseThemeStore } from '@/hooks/use-enterprise-theme';


interface UserAvatarMenuProps {
  accountPath: string;
  settingsPath?: string;
  canManageSettings?: boolean;
  /** Link to the user's own learning workspace (shown for managers). */
  learningPath?: string;
}

export function UserAvatarMenu({
  accountPath,
  settingsPath,
  canManageSettings = false,
  learningPath,
}: UserAvatarMenuProps) {
  useUiLanguage();
  const navigate = useNavigate();
  const user = useCurrentUser((s) => s.user);
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, supportsDark, toggle: toggleTheme } = useEnterpriseThemeStore();

  useEffect(() => {
    if (isOpen) { setIsMounted(true); return; }
    const timer = window.setTimeout(() => setIsMounted(false), 180);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout.mutateAsync();
    navigate('/login');
  };

  const initial = user.fullName?.charAt(0)?.toUpperCase() || 'U';
  const roleLabel = user.roles.map((r) => translateUi(ROLE_LABELS[r as Role] ?? r)).join(', ');

  return (
    <div className="account-menu relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="account-menu__trigger flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200/60 cursor-pointer"
        aria-label={translateUi("Menu tài khoản")}
        aria-expanded={isOpen}
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#137b84] via-[#0d9488] to-[#0284c7] text-white flex items-center justify-center text-xs font-black shadow-xs">
            {initial}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 border-2 border-white" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold text-[#17243f] leading-none truncate max-w-[120px]">
            {user.fullName}
          </p>
          <p className="text-[10px] text-[#64748b] font-medium leading-none mt-1 truncate max-w-[120px]">
            {translateUi(roleLabel)}
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isMounted && (
        <div data-open={isOpen} aria-hidden={!isOpen} inert={!isOpen} className="account-menu__panel absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-5rem)] bg-ent-card rounded-xl shadow-xl border border-ent-line z-50 py-1.5 overflow-y-auto">
          <div className="account-menu__identity px-4 py-2.5 border-b border-ent-line">
            <span className="account-menu__avatar" aria-hidden="true">{initial}</span>
            <p className="text-sm font-semibold text-ent-fg truncate">{user.fullName}</p>
            <p className="text-xs text-ent-fg-3 truncate mt-0.5">{user.email}</p>
            <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium bg-ent-raised text-ent-fg-2 rounded-md">
              {translateUi(roleLabel)}
            </span>
          </div>

          <div className="sm:hidden px-4 py-3 flex items-center justify-between border-b border-ent-line"><span className="text-xs text-ent-fg-2">{translateUi('Ngôn ngữ')}</span><LanguageSwitcher /></div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => { navigate(accountPath); setIsOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
            >
              <UserCircle className="w-4 h-4 text-ent-fg-3" />{translateUi("Hồ sơ của tôi")}</button>

            <button
              type="button"
              onClick={() => { navigate(`${accountPath}/security`); setIsOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
            >
              <Shield className="w-4 h-4 text-ent-fg-3" />{translateUi("Bảo mật tài khoản")}</button>

            {learningPath && (
              <button
                type="button"
                onClick={() => { navigate(learningPath); setIsOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-ent-fg-3" />{translateUi("Học tập của tôi")}</button>
            )}

            {canManageSettings && settingsPath && (
              <button
                type="button"
                onClick={() => { navigate(settingsPath); setIsOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
              >
                <Settings className="w-4 h-4 text-ent-fg-3" />{translateUi("Cài đặt tổ chức")}</button>
            )}

            <button
              type="button"
              onClick={() => { navigate('/enterprise/feedbacks'); setIsOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-ent-fg-3" />{translateUi("Góp ý")}</button>

            <button
              type="button"
              onClick={() => { navigate('/enterprise/bug-reports'); setIsOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
            >
              <Bug className="w-4 h-4 text-ent-fg-3" />{translateUi("Báo lỗi")}</button>

            {/* Khung chỉ có bản sáng (cổng nhân viên, platform) không hiện nút chuyển. */}
            {supportsDark && (
              <button
                type="button"
                onClick={() => toggleTheme()}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors"
              >
                {theme === 'dark'
                  ? <Sun className="w-4 h-4 text-ent-fg-3" />
                  : <Moon className="w-4 h-4 text-ent-fg-3" />}
                {theme === 'dark' ? translateUi('Chuyển giao diện sáng') : translateUi('Chuyển giao diện tối')}
              </button>
            )}
          </div>

          <div className="border-t border-ent-line pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-ent-bad hover:bg-[var(--ent-bad-soft)] transition-colors font-medium"
            >
              <LogOut className="w-4 h-4 text-ent-bad" />{translateUi("Đăng xuất")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
