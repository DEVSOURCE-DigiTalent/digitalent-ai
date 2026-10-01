import React, { useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog';
import { getDemoCompletionCode } from '../utils/demoCompletion';
import { lookupConfirmation, recordVerification } from '../utils/learningConfirmations';

export default function PublicVerificationView({ completedCourses = {}, user, initialCode = '' }) {
  const [code, setCode] = useState(initialCode);
  const [query, setQuery] = useState(initialCode || null);
  const match = query && Object.entries(completedCourses).find(([id,data]) => data?.completed && getDemoCompletionCode(user?.id, id) === query);
  const course = match ? ALL_DIGCOMP_COURSES[match[0]] : null;
  const record=query?lookupConfirmation(query):null;
  function search(event) {
    event.preventDefault();const normalized=code.trim().toUpperCase();setQuery(normalized);
    const found=lookupConfirmation(normalized);
    recordVerification(found?.organizationId||user?.organizationId,normalized,found?.status||'NOT_FOUND');
  }
  return <div className="rf"><div className="rf-hero"><div><span className="rf-eyebrow">TRA CỨU XÁC NHẬN HỌC TẬP · BẢN DEMO</span><h1>Kiểm tra mã hoàn thành</h1><p>Tra cứu kết quả học tập được lưu trong không gian thử nghiệm.</p></div><ShieldCheck size={34} color="var(--brand-primary)"/></div><section className="rf-panel"><form className="rf-form" onSubmit={search}><label>Mã hoàn thành<input value={code} onChange={event=>setCode(event.target.value)} placeholder="VD: DEMO-..." required/></label><button className="rf-primary" type="submit"><Search size={16}/>Tra cứu</button></form>{query && (record||match ? <div className={`rf-message ${record?.status==='REVOKED'?'rf-danger':''}`} role="status"><strong>{record?.status==='REVOKED'?'Xác nhận học tập đã thu hồi':'Tìm thấy kết quả học tập trong bản demo'}</strong><p>Người học: {record?.holder||user?.name}</p><p>Khóa học: {record?.courseTitle||course?.title||match?.[0]} · Hoàn thành: {record?.completedAt||match?.[1].completedAt}</p><small>Xác nhận hoàn thành khóa học trong bản FE; năng lực công việc được thẩm định riêng.</small></div> : <div className="rf-note rf-danger" role="status">Không tìm thấy mã hoàn thành trong dữ liệu phiên này.</div>)}</section></div>;
}
