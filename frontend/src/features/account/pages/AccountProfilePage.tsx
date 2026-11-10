import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { UserRound, Mail, Phone, Briefcase, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useUserProfile, useUpdateUserProfile } from '@/hooks/use-platform';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLE_LABELS, type Role } from '@/lib/roles';
import { apiErrorMessage } from '@/lib/utils';
import { AccountWorkspace } from '../components/AccountWorkspace';

export function AccountProfilePage() {
  useUiLanguage();
  const {data:profile,isLoading,isError,refetch}=useUserProfile();
  const update=useUpdateUserProfile();
  const user=useCurrentUser(s=>s.user);
  const [fullName,setFullName]=useState('');
  const [phone,setPhone]=useState('');
  const [jobTitle,setJobTitle]=useState('');
  const [saved,setSaved]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{if(profile){setFullName(profile.fullName??'');setPhone(profile.phone??'');setJobTitle(profile.jobTitle??'');}},[profile]);
  const dirty=Boolean(profile && (fullName.trim()!==profile.fullName || phone.trim()!==(profile.phone??'') || jobTitle.trim()!==(profile.jobTitle??'')));
  const save=async(e:React.FormEvent)=>{
    e.preventDefault();setError('');setSaved(false);
    if(!fullName.trim()){setError('Vui lòng nhập họ và tên.');return;}
    try{await update.mutateAsync({fullName:fullName.trim(),phone:phone.trim(),jobTitle:jobTitle.trim()});setSaved(true);}catch(err){setError(apiErrorMessage(err,'Không thể lưu thông tin cá nhân.'));}
  };
  return <AccountWorkspace title={translateUi("Hồ sơ của tôi")} section="profile">
    {isLoading?<div className="aw-card aw-state" role="status">{translateUi("Đang tải hồ sơ…")}</div>:isError?<div className="aw-alert aw-alert--error" role="alert">{translateUi("Không tải được hồ sơ. ")}<button onClick={()=>void refetch()}>{translateUi("Thử lại")}</button></div>:<div className="aw-profile-grid">
      <aside className="aw-identity"><span className="aw-avatar">{(profile?.fullName||user?.fullName||'U').charAt(0).toUpperCase()}</span><h2>{profile?.fullName||user?.fullName}</h2><span className="aw-identity__email">{profile?.email||user?.email}</span><div className="aw-roles">{user?.roles.map(role=><span key={role}><ShieldCheck size={12}/>{translateUi(ROLE_LABELS[role as Role])??role}</span>)}</div><dl><div><dt>{translateUi("Chức danh")}</dt><dd>{profile?.jobTitle||translateUi('Chưa cập nhật')}</dd></div><div><dt>{translateUi("Số điện thoại")}</dt><dd>{profile?.phone||translateUi('Chưa cập nhật')}</dd></div></dl></aside>
      <form className="aw-card aw-profile-form" onSubmit={save}>
        <div className="aw-section-title"><span className="aw-icon"><UserRound size={20}/></span><div><h2>{translateUi("Thông tin cá nhân")}</h2><p>{translateUi("Cập nhật thông tin liên hệ của bạn.")}</p></div></div>
        {saved&&<p className="aw-alert aw-alert--success" role="status"><CheckCircle2 size={17}/>{translateUi("Đã lưu thông tin cá nhân.")}</p>}{error&&<p className="aw-alert aw-alert--error" role="alert">{translateUi(error)}</p>}
        <div className="aw-fields">
          <label className="aw-field" htmlFor="user-fullname">{translateUi("Họ và tên")}<span className="aw-input-icon"><UserRound size={16}/><input id="user-fullname" autoComplete="name" required maxLength={200} value={fullName} onChange={e=>{setFullName(e.target.value);setSaved(false);}}/></span></label>
          <label className="aw-field" htmlFor="user-email">{translateUi("Email đăng nhập")}<span className="aw-input-icon"><Mail size={16}/><input id="user-email" type="email" readOnly value={profile?.email||user?.email||''}/></span><small>{translateUi("Email được dùng để đăng nhập và nhận thông báo.")}</small></label>
          <label className="aw-field" htmlFor="user-phone">{translateUi("Số điện thoại")}<span className="aw-input-icon"><Phone size={16}/><input id="user-phone" type="tel" autoComplete="tel" value={phone} onChange={e=>{setPhone(e.target.value);setSaved(false);}} placeholder={translateUi("Chưa cập nhật")}/></span></label>
          <label className="aw-field" htmlFor="user-jobtitle">{translateUi("Chức danh")}<span className="aw-input-icon"><Briefcase size={16}/><input id="user-jobtitle" autoComplete="organization-title" value={jobTitle} onChange={e=>{setJobTitle(e.target.value);setSaved(false);}} placeholder={translateUi("Chưa cập nhật")}/></span></label>
        </div>
        <footer className="aw-actions"><span>{dirty?translateUi('Có thay đổi chưa được lưu'):translateUi('Thông tin đã được đồng bộ')}</span><button className="aw-primary" type="submit" disabled={!dirty||update.isPending}><Save size={16}/>{update.isPending?translateUi('Đang lưu…'):translateUi('Lưu thông tin')}</button></footer>
      </form>
    </div>}
  </AccountWorkspace>;
}
