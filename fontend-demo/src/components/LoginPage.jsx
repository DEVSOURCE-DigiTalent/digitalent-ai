import React, { useState } from 'react';
import { ArrowRight, Building2, GraduationCap, Zap } from 'lucide-react';
import { USER_ACCOUNTS } from '../data/mockMarketingFlow';
import { enterpriseAdmin, loginEmployee, readOrganizations } from '../utils/demoAccess';
import './workspaceRefresh.css';
import './learningFlow.css';

export default function LoginPage({ onLogin }) {
  const organizations = readOrganizations();
  const [mode, setMode] = useState('enterprise');
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id || '');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    setError('');
    if (mode === 'enterprise') {
      const organization = organizations.find(item => item.id === organizationId);
      if (organization) onLogin(enterpriseAdmin(organization));
      return;
    }
    const user = loginEmployee(organizationId, username, code);
    if (user) onLogin(user);
    else setError('Không tìm thấy tài khoản. Kiểm tra doanh nghiệp, tên đăng nhập và mã được cấp.');
  }
  return <main className="rf rf-login"><div className="rf-login-card"><div className="rf-login-intro"><span className="brand-icon"><Zap size={21} fill="#fff"/></span><span className="rf-eyebrow">DIGITAL TALENT · BẢN DEMO</span><h1>Từ năng lực hiện tại đến lộ trình học đúng vị trí.</h1><p>Doanh nghiệp thiết lập vị trí và cấp tài khoản. Nhân viên đăng nhập, đánh giá khoảng thiếu rồi học theo gợi ý.</p><div className="rf-login-flow"><span>01 · Doanh nghiệp</span><ArrowRight size={15}/><span>02 · Nhân viên</span><ArrowRight size={15}/><span>03 · Đánh giá & học</span></div></div><section className="rf-panel"><span className="rf-eyebrow">BẮT ĐẦU</span><h2>Đăng nhập không gian thử nghiệm</h2><div className="rf-login-switch"><button className={mode==='enterprise'?'active':''} onClick={()=>{setMode('enterprise');setError('');}}><Building2 size={17}/> Doanh nghiệp</button><button className={mode==='employee'?'active':''} onClick={()=>{setMode('employee');setError('');}}><GraduationCap size={17}/> Nhân viên</button></div><form className="rf-form rf-login-form" onSubmit={submit}><label>Doanh nghiệp<select value={organizationId} onChange={event=>setOrganizationId(event.target.value)}>{organizations.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{mode==='employee' && <><label>Tên đăng nhập<input value={username} onChange={event=>setUsername(event.target.value)} autoComplete="username" required placeholder="Mã được doanh nghiệp cấp"/></label><label>Mã đăng nhập<input value={code} onChange={event=>setCode(event.target.value)} inputMode="numeric" required placeholder="6 chữ số"/></label><p>Quản trị viên cấp tài khoản trong mục Cấu hình doanh nghiệp → Tài khoản nhân viên.</p></>}{error && <div className="rf-note rf-danger" role="alert">{error}</div>}<button className="rf-primary" type="submit">{mode==='enterprise'?'Vào trang doanh nghiệp':'Vào không gian học'} <ArrowRight size={16}/></button><small>{mode==='enterprise'?'Đăng nhập một chạm để thử luồng quản trị. Chưa có xác thực máy chủ.':'Mã đăng nhập chỉ dùng trong trình duyệt demo, không dùng cho dữ liệu thật.'}</small></form><details className="rf-demo-roles"><summary>Xem các vai trò mẫu khác</summary><div className="rf-login-roles">{USER_ACCOUNTS.map(acc=><button key={acc.id} onClick={()=>onLogin(acc)}><span className="rf-login-avatar">{acc.avatar}</span><span><strong>{acc.roleLabel}</strong><small>{acc.name} · {acc.jobTitle}</small></span><ArrowRight size={17}/></button>)}</div></details></section></div></main>;
}
