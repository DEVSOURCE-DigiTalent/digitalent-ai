import React from 'react';
import { Moon, Sun, Zap } from 'lucide-react';
import './workspaceRefresh.css';

export default function Navbar({ currentTab, setCurrentTab, isDark, setIsDark, currentUser }) {
  const personal = ['landing','home','matrix','path','report','classroom'].includes(currentTab);
  const rolePage = currentUser?.role === 'dept_manager' ? ['manager_eval','Duyệt bài'] : currentUser?.role === 'hr_manager' ? ['hr_dashboard','Quản trị'] : currentUser?.role === 'public_visitor' ? ['public_verify','Tra cứu'] : null;
  return <header className="navbar refresh-navbar"><div className="navbar-inner"><button className="brand-badge" onClick={()=>setCurrentTab(currentUser?.role==='enterprise_admin'?'enterprise':'home')}><span className="brand-icon"><Zap size={19} fill="#fff"/></span><span>DigiTalent</span></button><nav className="nav-links" aria-label="Điều hướng chính">{currentUser?.role==='enterprise_admin' && <button className={`nav-item ${currentTab==='enterprise'?'active':''}`} onClick={()=>setCurrentTab('enterprise')}>Doanh nghiệp</button>}{currentUser?.role!=='enterprise_admin' && <button className={`nav-item ${personal?'active':''}`} onClick={()=>setCurrentTab('home')}>Học tập</button>}{rolePage && <button className={`nav-item ${currentTab===rolePage[0]?'active':''}`} onClick={()=>setCurrentTab(rolePage[0])}>{rolePage[1]}</button>}<button className={`nav-item ${currentTab==='public_verify'?'active':''}`} onClick={()=>setCurrentTab('public_verify')}>Tra cứu</button></nav><div className="nav-right-actions"><button className="theme-toggle-btn" onClick={()=>setIsDark(!isDark)} title={isDark?'Chế độ sáng':'Chế độ tối'} aria-label={isDark?'Chế độ sáng':'Chế độ tối'}>{isDark?<Sun size={18}/>:<Moon size={18}/>}</button></div></div></header>;
}
