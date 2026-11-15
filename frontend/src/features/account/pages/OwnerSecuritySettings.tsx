import { useState, type FormEvent } from 'react';
import { AlertCircle, Check, Eye, EyeOff, KeyRound, Laptop, LockKeyhole, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import { useChangePassword, useLoginHistory } from '@/hooks/use-platform';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { apiErrorMessage, formatDateTime } from '@/lib/utils';
import { AccountWorkspace } from '../components/AccountWorkspace';

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
};

function PasswordField({ id, label, value, onChange, autoComplete }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="aw-field">
      <label htmlFor={id}>{translateUi(label)}</label>
      <div className="aw-input-icon aw-password">
        <LockKeyhole size={16} aria-hidden="true" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          aria-label={`${translateUi('Hiện mật khẩu')} (${translateUi(label)})`}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

export function EnterpriseSecuritySettings({ compact = false }: { compact?: boolean }) {
  useUiLanguage();
  const changePassword = useChangePassword();
  const history = useLoginHistory();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const criteria = [
    { label: 'Ít nhất 8 ký tự', met: newPassword.length >= 8 },
    { label: 'Chữ hoa và chữ thường', met: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) },
    { label: 'Có chữ số', met: /[0-9]/.test(newPassword) },
    { label: 'Có ký tự đặc biệt', met: /[^A-Za-z0-9]/.test(newPassword) },
  ];
  const score = criteria.filter(({ met }) => met).length;
  const strength = newPassword.length < 8 ? 'Yếu' : ['Yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][score];
  const recentSessions = [...(history.data ?? [])]
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 15);
  const preview = compact && !expanded ? recentSessions.slice(0, 5) : recentSessions;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setError('');

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaved(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Không thể đổi mật khẩu.'));
    }
  }

  return (
    <AccountWorkspace title="Bảo mật tài khoản" section="security">
      <div className="aw-security-grid">
        <form className="aw-card" onSubmit={submit}>
          <div className="aw-section-title">
            <span className="aw-icon aw-icon--blue"><KeyRound size={21} /></span>
            <div>
              <h2>{translateUi('Đổi mật khẩu')}</h2>
              <p>{translateUi('Bảo vệ quyền truy cập tài khoản của bạn.')}</p>
            </div>
          </div>
          {error && <p className="aw-alert aw-alert--error" role="alert"><AlertCircle size={17} />{translateUi(error)}</p>}
          {saved && <p className="aw-alert aw-alert--success" role="status"><ShieldCheck size={17} />{translateUi('Đã cập nhật mật khẩu.')}</p>}
          <div className="aw-password-fields">
            <PasswordField id="curr-pass" label="Mật khẩu hiện tại" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
            <div className="aw-fields">
              <PasswordField id="new-pass" label="Mật khẩu mới" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
              <PasswordField id="conf-pass" label="Xác nhận mật khẩu mới" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
            </div>
          </div>
          {newPassword && (
            <div className="aw-strength">
              <div>
                <span>{translateUi('Độ mạnh mật khẩu')}</span>
                <strong>{translateUi(strength)}</strong>
              </div>
              <div className="aw-strength__bars" data-strength={newPassword.length < 8 ? 1 : score} aria-hidden="true">
                {[1, 2, 3, 4].map((step) => <i key={step} data-filled={step <= score} />)}
              </div>
              <ul>
                {criteria.map(({ label, met }) => (
                  <li key={label} data-met={met}><Check size={14} />{translateUi(label)}</li>
                ))}
              </ul>
            </div>
          )}
          <footer className="aw-actions">
            {!compact && <span>{translateUi('Không chia sẻ mật khẩu với người khác.')}</span>}
            <button type="submit" className="aw-primary" disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}>
              <LockKeyhole size={15} />
              {translateUi(changePassword.isPending ? 'Đang lưu…' : 'Cập nhật mật khẩu')}
            </button>
          </footer>
        </form>

        <aside className="aw-security-note">
          <span className="aw-security-note__shield"><ShieldCheck size={40} /></span>
          <h2>{translateUi('Chủ động bảo vệ tài khoản của bạn')}</h2>
          <ul>
            <li>{translateUi('Sử dụng mật khẩu riêng cho DigiTalent.')}</li>
            <li>{translateUi('Kiểm tra lịch sử đăng nhập để nhận biết truy cập bất thường.')}</li>
            <li>{translateUi('Đăng xuất khi sử dụng máy tính dùng chung.')}</li>
          </ul>
        </aside>
      </div>

      <section className="aw-card aw-history" aria-labelledby="account-history-title">
        <div className="aw-section-title">
          <span className="aw-icon aw-icon--blue"><Laptop size={20} /></span>
          <div>
            <h2 id="owner-history-title">{translateUi('Lịch sử đăng nhập')}</h2>
            {!compact && <p>{translateUi('Các lần truy cập được hệ thống ghi nhận.')}</p>}
          </div>
          <button
            type="button"
            className="aw-icon-button"
            aria-label={translateUi('Làm mới lịch sử đăng nhập')}
            disabled={history.isFetching}
            onClick={() => void history.refetch()}
          >
            <RefreshCw size={16} />
          </button>
        </div>
        {history.isLoading && <p role="status" className="aw-state">{translateUi('Đang tải lịch sử…')}</p>}
        {history.isError && <p role="alert" className="aw-alert aw-alert--error">{translateUi('Không tải được lịch sử đăng nhập.')}</p>}
        {!history.isLoading && !history.isError && recentSessions.length === 0 && (
          <p className="aw-state">{translateUi('Chưa có lịch sử đăng nhập.')}</p>
        )}
        {recentSessions.length > 0 && (
          <div className="aw-table-scroll" role="region" aria-labelledby="owner-history-title" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th scope="col">{translateUi('Thời gian')}</th>
                  <th scope="col">{translateUi('Thiết bị')}</th>
                  <th scope="col">{translateUi('Địa chỉ IP')}</th>
                  <th scope="col">{translateUi('Kết quả')}</th>
                </tr>
              </thead>
              <tbody id="account-history-entries">
                {preview.map((item) => {
                  const DeviceIcon = /mobile|android|iphone/i.test(`${item.browser} ${item.os}`) ? Smartphone : Laptop;
                  const successful = item.status === 'SUCCESS';
                  return (
                    <tr key={item.id}>
                      <td>{formatDateTime(item.timestamp)}</td>
                      <td>
                        <span className="aw-device">
                          <DeviceIcon size={17} />
                          <span>{item.browser || translateUi('Không xác định')}{item.os && <small>{item.os}</small>}</span>
                        </span>
                      </td>
                      <td className="aw-mono">{item.ip || '—'}</td>
                      <td>
                        <span className={`aw-status ${successful ? 'aw-status--ok' : 'aw-status--bad'}`}>
                          {translateUi(successful ? 'Thành công' : 'Thất bại')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {compact && recentSessions.length > 5 && (
          <div className="aw-history-actions">
            <span>{preview.length} / {recentSessions.length}</span>
            <button type="button" className="aw-secondary" aria-expanded={expanded} aria-controls="account-history-entries"
              onClick={() => setExpanded(!expanded)}>{translateUi(expanded ? 'Thu gọn' : 'Xem thêm')}</button>
          </div>
        )}
      </section>
    </AccountWorkspace>
  );
}
