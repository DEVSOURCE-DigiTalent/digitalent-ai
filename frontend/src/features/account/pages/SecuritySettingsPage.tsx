import { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, KeyRound } from 'lucide-react';
import { PageHeader, StatusBadge } from '@/components/shared';
import { useChangePassword, useLoginHistory } from '@/hooks/use-platform';
import { formatDateTime } from '@/lib/utils';

export function SecuritySettingsPage() {
  const changePassword = useChangePassword();
  const { data: history } = useLoginHistory();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [successMsg, setSuccessMsg] = useState<string>();
  const [errorMsg, setErrorMsg] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(undefined);
    setSuccessMsg(undefined);

    if (newPassword.length < 8) {
      setErrorMsg('Mật khẩu mới cần tối thiểu 8 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setSuccessMsg('Đã đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(undefined), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể đổi mật khẩu.');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader
        title="Bảo mật & Mật khẩu"
        subtitle="Quản lý mật khẩu đăng nhập và xem lịch sử các phiên hoạt động tài khoản của bạn"
      />

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorMsg}
        </div>
      )}

      {/* Change password form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <KeyRound className="size-5 text-primary-600" />
          Đổi mật khẩu tài khoản
        </h2>

        <div>
          <label htmlFor="curr-pass" className="block text-sm font-medium text-slate-700 mb-1">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              id="curr-pass"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="new-pass" className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu mới (tối thiểu 8 ký tự)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                id="new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="conf-pass" className="block text-sm font-medium text-slate-700 mb-1">
              Nhập lại mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                id="conf-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {changePassword.isPending ? 'Đang cập nhật…' : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>

      {/* Login History */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-600" />
          Lịch sử phiên đăng nhập gần đây
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Thời gian</th>
                <th className="py-2.5 px-3">Địa chỉ IP</th>
                <th className="py-2.5 px-3">Trình duyệt & Thiết bị</th>
                <th className="py-2.5 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {history?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono">{formatDateTime(item.timestamp)}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{item.ip}</td>
                  <td className="py-2.5 px-3">{item.browser}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge
                      label={item.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                      variant={item.status === 'SUCCESS' ? 'success' : 'danger'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
