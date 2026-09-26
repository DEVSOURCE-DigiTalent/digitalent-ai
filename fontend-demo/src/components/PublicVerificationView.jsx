import React, { useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog';
import { getDemoCompletionCode } from '../utils/demoCompletion';
import './workspaceRefresh.css';

export default function PublicVerificationView({ completedCourses = {}, user, initialCode = '' }) {
  const [code, setCode] = useState(initialCode);
  const [query, setQuery] = useState(initialCode || null);
  const match = query && Object.entries(completedCourses).find(([id,data]) => data?.completed && getDemoCompletionCode(user?.id, id) === query);
  const course = match ? ALL_DIGCOMP_COURSES[match[0]] : null;
  return <div className="rf"><div className="rf-hero"><div><span className="rf-eyebrow">TRA CỨU XÁC NHẬN HỌC TẬP · BẢN DEMO</span><h1>Kiểm tra mã hoàn thành</h1><p>Nhập mã được cấp khi hoàn thành bài kiểm tra cuối khóa trong phiên này.</p></div><ShieldCheck size={34} color="var(--brand-primary)"/></div><section className="rf-panel"><form className="rf-form" onSubmit={e=>{e.preventDefault();setQuery(code.trim().toUpperCase())}}><label>Mã hoàn thành<input value={code} onChange={e=>setCode(e.target.value)} placeholder="VD: DEMO-..." required/></label><button className="rf-primary" type="submit"><Search size={16}/>Tra cứu</button></form>{query && (match ? <div className="rf-message" role="status"><strong>Tìm thấy kết quả học tập trong bản demo</strong><p>Khóa học: {course?.title || match[0]} · Điểm cuối khóa: {match[1].score}/100 · Hoàn thành: {match[1].completedAt}</p><small>Mã này chỉ minh họa xác nhận học tập nội bộ; không phải chứng chỉ có chữ ký số hoặc xác thực công khai.</small></div> : <div className="rf-note rf-danger" role="status">Không tìm thấy mã hoàn thành trong dữ liệu phiên này.</div>)}</section></div>;
}
