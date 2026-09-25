import React, { useState } from 'react';
import { FileCheck2 } from 'lucide-react';
import './workspaceRefresh.css';

const criteria = [
  ['data', 'Mục tiêu và dữ liệu', 30],
  ['content', 'Giải pháp và tác động', 40],
  ['testing', 'Kiểm thử và an toàn dữ liệu', 30]
];

export default function ManagerEvaluationView({ submission, onApproveSubmission, onRejectSubmission }) {
  const [scores, setScores] = useState({ data: 0, content: 0, testing: 0 });
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');
  const total = Object.values(scores).reduce((sum, value) => sum + Number(value || 0), 0);
  const pending = submission?.status === 'pending_manager';
  function approve() {
    if (!pending) return;
    if (total < 60) { setMessage('Cần ít nhất 60/100 điểm để phê duyệt. Có thể yêu cầu bổ sung minh chứng.'); return; }
    if (!feedback.trim()) { setMessage('Vui lòng ghi nhận xét trước khi duyệt.'); return; }
    onApproveSubmission({ score: total, managerFeedback: feedback.trim(), approvedAt: new Date().toLocaleString('vi-VN') });
    setMessage('Đã ghi nhận kết quả đánh giá trong bản demo.');
  }
  function reject() {
    if (!pending) return;
    if (!feedback.trim()) { setMessage('Vui lòng nêu nội dung cần bổ sung.'); return; }
    onRejectSubmission(feedback.trim());
    setMessage('Đã gửi yêu cầu bổ sung minh chứng.');
  }
  return <div className="rf"><div className="rf-hero"><div><span className="rf-eyebrow">DÀNH CHO TRƯỞNG PHÒNG · BẢN DEMO</span><h1>Duyệt minh chứng</h1><p>Chấm theo ba tiêu chí, ghi nhận xét và trả kết quả cho người học.</p></div><FileCheck2 size={34} color="var(--brand-primary)"/></div>
    {!submission ? <section className="rf-panel"><h2>Chưa có bài nộp</h2><p>Nhân viên có thể nộp minh chứng trong mục Kết quả của tôi.</p></section> : <div className="pw-grid"><section className="rf-panel"><h2>Bài thực hành</h2><div className="rf-rows"><div className="rf-row"><span>Trạng thái</span><strong>{submission.status === 'approved' ? 'Đã duyệt' : submission.status === 'rejected' ? 'Cần bổ sung' : 'Chờ duyệt'}</strong></div><div className="rf-row"><span>Tên bài</span><strong>{submission.campaignTitle}</strong></div><div className="rf-row"><span>Ngày nộp</span><strong>{submission.submittedAt}</strong></div><div className="rf-row"><span>Minh chứng</span><a href={submission.driveLink} target="_blank" rel="noreferrer">Mở liên kết</a></div></div><details><summary>Nội dung bổ sung</summary><p>{submission.assetNotes}</p><p>{submission.abTestHypothesis}</p></details>{submission.managerFeedback && <p className="rf-note">Nhận xét trước đó: {submission.managerFeedback}</p>}</section><section className="rf-panel"><h2>Thang chấm 100 điểm</h2><p>Điểm đạt từ 60. Phê duyệt minh chứng ghi nhận bài thực hành trong bản demo.</p><div className="rf-form">{criteria.map(([id,label,max]) => <label key={id}>{label} · {scores[id]}/{max}<input type="range" min="0" max={max} value={scores[id]} disabled={!pending} onChange={e=>setScores({...scores,[id]:Number(e.target.value)})}/></label>)}<div className="rf-metric"><span>Tổng điểm</span><strong>{submission.status === 'approved' ? submission.score : total}/100</strong></div><label>Nhận xét của quản lý<textarea value={feedback} disabled={!pending} onChange={e=>setFeedback(e.target.value)} placeholder="Nêu điểm tốt và nội dung cần cải thiện"/></label>{message && <div className="rf-note" role="status">{message}</div>}{pending && <div className="rf-actions"><button className="rf-secondary" onClick={reject}>Yêu cầu bổ sung</button><button className="rf-primary" onClick={approve}>Duyệt minh chứng</button></div>}</div></section></div>}
  </div>;
}
