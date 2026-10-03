import { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Save, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { useUserProfile, useUpdateUserProfile } from '@/hooks/use-platform';
import { useCurrentUser } from '@/hooks/use-current-user';

export function AccountProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const sessionUser = useCurrentUser((s) => s.user);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setJobTitle(profile.jobTitle || '');
    } else if (sessionUser) {
      setFullName(sessionUser.fullName || '');
    }
  }, [profile, sessionUser]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông tin tài khoản…</div>;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p className="font-medium">Không thể tải thông tin hồ sơ cá nhân.</p>
        <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline font-semibold">
          Thử lại
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(undefined);
    setSavedSuccess(false);

    try {
      await updateProfile.mutateAsync({
        fullName: fullName.trim(),
        phone: phone.trim(),
        jobTitle: jobTitle.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể cập nhật thông tin cá nhân.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Thông tin tài khoản"
        subtitle="Quản lý thông tin định danh cá nhân và chức vụ của bạn trên hệ thống DigiTalent AI"
      />

      {savedSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-5 text-emerald-600" />
          Đã lưu cập nhật thông tin tài khoản thành công!
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="size-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl">
            {fullName.slice(0, 1) || 'U'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{fullName || 'Người dùng'}</h2>
            <p className="text-xs text-slate-500 font-mono">{profile?.email || sessionUser?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="user-fullname" className="block text-sm font-medium text-slate-700 mb-1">
              Họ và tên
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                id="user-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="user-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email đăng nhập (cố định)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                id="user-email"
                type="email"
                disabled
                value={profile?.email || sessionUser?.email || ''}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label htmlFor="user-phone" className="block text-sm font-medium text-slate-700 mb-1">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                id="user-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="user-jobtitle" className="block text-sm font-medium text-slate-700 mb-1">
              Chức danh công việc
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                id="user-jobtitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Quản trị viên / Chuyên viên"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Vai trò hiện tại: <strong>{sessionUser?.roles?.join(', ') || 'PLATFORM_ADMIN'}</strong>
          </span>

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="size-4" />
            {updateProfile.isPending ? 'Đang lưu…' : 'Lưu thông tin'}
          </button>
        </div>
      </form>
    </div>
  );
}
