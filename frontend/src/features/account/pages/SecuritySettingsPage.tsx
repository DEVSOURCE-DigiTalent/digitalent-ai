import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { LockKeyhole, Eye, EyeOff, ShieldCheck, KeyRound, Laptop, Smartphone, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useChangePassword, useLoginHistory } from '@/hooks/use-platform';
import { apiErrorMessage, formatDateTime } from '@/lib/utils';
import { AccountWorkspace } from '../components/AccountWorkspace';

function PasswordField({id,label,value,onChange,autoComplete}:{id:string;label:string;value:string;onChange:(v:string)=>void;autoComplete:string}) {
  useUiLanguage();
  const [visible,setVisible]=useState(false);
  return <label className="aw-field" htmlFor={id}>{translateUi(label)}<span className="aw-input-icon aw-password"><LockKeyhole size={16}/><input id={id} type={visible?'text':'password'} autoComplete={autoComplete} required value={value} onChange={e=>onChange(e.target.value)}/><button type="button" aria-label={translateUi(`${visible?'Ẩn':'Hiện'} ${label.toLowerCase()}`)} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label>;
}
export function SecuritySettingsPage() {
  useUiLanguage();
  const change=useChangePassword();
  const history=useLoginHistory();
  const [current,setCurrent]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
  const [error,setError]=useState(''),[saved,setSaved]=useState(false);
  const criteria=[{label:'Ít nhất 8 ký tự',met:password.length>=8},{label:'Chữ hoa và chữ thường',met:/[A-Z]/.test(password)&&/[a-z]/.test(password)},{label:'Có chữ số',met:/[0-9]/.test(password)},{label:'Có ký tự đặc biệt',met:/[^A-Za-z0-9]/.test(password)}];
  const score=criteria.filter(c=>c.met).length;
  const strength=password.length<8?'Yếu':score===4?'Mạnh':score>=3?'Tốt':'Trung bình';
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setSaved(false);setError('');if(password.length<8){setError('Mật khẩu mới cần ít nhất 8 ký tự.');return;}if(password!==confirm){setError('Mật khẩu xác nhận không khớp.');return;}if(password===current){setError('Mật khẩu mới phải khác mật khẩu hiện tại.');return;}try{await change.mutateAsync({currentPassword:current,newPassword:password});setCurrent('');setPassword('');setConfirm('');setSaved(true);}catch(err){setError(apiErrorMessage(err,'Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.'));}};
  return <AccountWorkspace title={translateUi("Bảo mật tài khoản")} section="security">
    <div className="aw-security-grid">
      <form className="aw-card" onSubmit={submit}>
        <div className="aw-section-title"><span className="aw-icon aw-icon--blue"><KeyRound size={21}/></span><div><h2>{translateUi("Đổi mật khẩu")}</h2><p>{translateUi("Bảo vệ quyền truy cập tài khoản của bạn.")}</p></div></div>
        {error&&<p className="aw-alert aw-alert--error" role="alert"><AlertCircle size={17}/>{translateUi(error)}</p>}{saved&&<p className="aw-alert aw-alert--success" role="status"><ShieldCheck size={17}/>{translateUi("Đã cập nhật mật khẩu.")}</p>}
        <div className="aw-password-fields"><PasswordField id="curr-pass" label={translateUi("Mật khẩu hiện tại")} value={current} onChange={setCurrent} autoComplete="current-password"/><div className="aw-fields"><PasswordField id="new-pass" label={translateUi("Mật khẩu mới")} value={password} onChange={setPassword} autoComplete="new-password"/><PasswordField id="conf-pass" label={translateUi("Xác nhận mật khẩu mới")} value={confirm} onChange={setConfirm} autoComplete="new-password"/></div></div>
        <div className="aw-strength"><div><span>{translateUi("Độ mạnh mật khẩu")}</span><strong>{password?strength:translateUi('Chưa nhập mật khẩu mới')}</strong></div><div className="aw-strength__bars" data-strength={password.length<8?1:score}>{[1,2,3,4].map(n=><i key={n} data-filled={Boolean(password)&&n<=score}/>)}</div><ul>{criteria.map(c=><li key={c.label} data-met={c.met}><Check size={14}/>{translateUi(c.label)}</li>)}</ul></div>
        <footer className="aw-actions"><span>{translateUi("Không chia sẻ mật khẩu với người khác.")}</span><button type="submit" className="aw-primary" disabled={change.isPending||!current||!password||!confirm}><LockKeyhole size={15}/>{change.isPending?'Đang cập nhật…':translateUi('Cập nhật mật khẩu')}</button></footer>
      </form>
      <aside className="aw-security-note"><span className="aw-security-note__shield"><ShieldCheck size={40}/></span><h2>{translateUi("Chủ động bảo vệ")}<br/>{translateUi("tài khoản của bạn")}</h2><ul><li>{translateUi("Sử dụng mật khẩu riêng cho DigiTalent.")}</li><li>{translateUi("Kiểm tra lịch sử đăng nhập để nhận biết truy cập bất thường.")}</li><li>{translateUi("Đăng xuất khi sử dụng máy tính dùng chung.")}</li></ul></aside>
    </div>
    <section className="aw-card aw-history"><div className="aw-section-title"><span className="aw-icon aw-icon--blue"><Laptop size={20}/></span><div><h2>{translateUi("Lịch sử đăng nhập")}</h2><p>{translateUi("Các lần truy cập được hệ thống ghi nhận.")}</p></div><button type="button" className="aw-icon-button" aria-label={translateUi("Làm mới lịch sử đăng nhập")} disabled={history.isFetching} onClick={()=>void history.refetch()}><RefreshCw size={16}/></button></div>
      {history.isLoading?<p role="status" className="aw-state">{translateUi("Đang tải lịch sử đăng nhập…")}</p>:history.isError?<p className="aw-alert aw-alert--error" role="alert">{translateUi("Không tải được lịch sử đăng nhập. Vui lòng thử làm mới.")}</p>:!history.data?.length?<p className="aw-state">{translateUi("Chưa có lịch sử đăng nhập.")}</p>:<div className="aw-table-scroll"><table><thead><tr><th>{translateUi("Thời gian")}</th><th>{translateUi("Thiết bị")}</th><th>{translateUi("Địa chỉ IP")}</th><th>{translateUi("Kết quả")}</th></tr></thead><tbody>{[...history.data].sort((a,b)=>Date.parse(b.timestamp)-Date.parse(a.timestamp)).slice(0,15).map(item=>{const Icon=/mobile|android|iphone/i.test(`${item.browser} ${item.os}`)?Smartphone:Laptop;return <tr key={item.id}><td>{formatDateTime(item.timestamp)}</td><td><span className="aw-device"><Icon size={17}/><span>{item.browser||translateUi('Không xác định')}<small>{item.os||'Chưa có thông tin hệ điều hành'}</small></span></span></td><td className="aw-mono">{item.ip||'Chưa ghi nhận'}</td><td><span className={`aw-status ${item.status==='SUCCESS'?'aw-status--ok':'aw-status--bad'}`}>{item.status==='SUCCESS'?translateUi('Thành công'):'Không thành công'}</span></td></tr>;})}</tbody></table></div>}
    </section>
  </AccountWorkspace>;
}
