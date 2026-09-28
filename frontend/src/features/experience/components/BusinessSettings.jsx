import React, { useState } from 'react';
import { AREA_NAMES } from '../data/enterpriseDemo';
import { JOB_ROLE_BENCHMARKS } from '../utils/competenceEngine';
import { saveCompanySettings, savePositionSettings, saveSurveyRequirement } from '../utils/businessSettings';

export default function BusinessSettings({ organization, user, act, onPeople, onPolicy, onRequirements }) {
  return <>
    <div className="bm-settings-links" aria-label="Các cấu hình liên quan">
      <button className="rf-secondary" onClick={onPeople}>Nhân viên & phòng ban</button>
      <button className="rf-secondary" onClick={onPolicy}>Hạn mức & khóa được tài trợ</button>
      <button className="rf-secondary" onClick={onRequirements}>Khung yêu cầu theo vị trí</button>
    </div>
    <CompanyForm organization={organization} user={user} act={act}/>
    <section className="rf-panel">
      <div className="bm-panel-head"><h2>Vị trí & đặc thù doanh nghiệp</h2><span>{organization.roles.length} vị trí</span></div>
      <p>Mở từng vị trí để sửa thông tin, định biên và mức ưu tiên đào tạo.</p>
      {organization.roles.map(role => <details className="bm-position" key={role.id}>
        <summary>{role.name}<small>{role.specialty || role.family} · P{role.priority} · {role.headcount} người dự kiến</small></summary>
        <PositionForm role={role} user={user} act={act}/>
        <details className="bm-survey-settings">
          <summary>Mức yêu cầu & trọng số khảo sát nội bộ</summary>
          <p className="bm-muted">Thang khảo sát nội bộ 0–6; mức yêu cầu từ 1–6. Dùng cho so sánh khảo sát trước/sau, không quy đổi tự động sang mức DigComp 3.0 hoặc hồ sơ năng lực đã xác nhận. Thay đổi được lưu ngay và cập nhật kết quả đối chiếu theo chuẩn hiện tại.</p>
          <div className="bm-requirements-scroll"><table className="bm-requirements"><caption>Chuẩn khảo sát của {role.name}</caption><thead><tr><th>Lĩnh vực</th><th>Mức yêu cầu</th><th>Trọng số %</th><th>Cốt lõi</th></tr></thead><tbody>
            {(role.requirements || []).map((item, index) => <tr key={item.areaId}>
              <th scope="row">{AREA_NAMES[index] || item.areaId}</th>
              <td><select aria-label={`Mức yêu cầu ${role.name}: ${AREA_NAMES[index]}`} value={item.level} onChange={e => act(() => saveSurveyRequirement(user, role.id, index, 'level', e.target.value), 'Đã lưu mức yêu cầu khảo sát.')}>
                {[1,2,3,4,5,6].map(level => <option key={level} value={level}>{level}</option>)}</select></td>
              <td><WeightInput key={`${item.areaId}:${item.weight}`} value={item.weight} label={`Trọng số ${role.name}: ${AREA_NAMES[index]}`} onSave={value => act(() => saveSurveyRequirement(user, role.id, index, 'weight', value), 'Đã lưu và cân bằng trọng số thành 100%.')}/></td>
              <td><input type="checkbox" aria-label={`Cốt lõi ${role.name}: ${AREA_NAMES[index]}`} checked={!!item.mandatory} onChange={e => act(() => saveSurveyRequirement(user, role.id, index, 'mandatory', e.target.checked), 'Đã lưu năng lực cốt lõi.')}/></td>
            </tr>)}
          </tbody></table></div>
          <small>Tổng trọng số: {(role.requirements || []).reduce((sum, item) => sum + item.weight, 0)}%. Trọng số được cân bằng khi rời ô nhập.</small>
          <button className="pw-link" onClick={onRequirements}>Mở khung yêu cầu có phiên bản theo vị trí →</button>
        </details>
      </details>)}
      <details className="bm-position"><summary>+ Thêm vị trí đặc thù</summary><PositionForm user={user} act={act}/></details>
    </section>
  </>;
}

function CompanyForm({ organization, user, act }) {
  const [form, setForm] = useState({ name: organization.name, sector: organization.sector || '', size: organization.size, hourlyCost: organization.hourlyCost ?? 100000 });
  const field = name => ({ value: form[name], onChange: e => setForm({ ...form, [name]: e.target.value }) });
  return <details className="rf-panel" open><summary>Thông tin doanh nghiệp</summary>
    <form className="rf-form" onSubmit={e => { e.preventDefault(); act(() => saveCompanySettings(user, form), 'Đã lưu thông tin doanh nghiệp.'); }}>
      <div className="bm-settings-grid">
        <label>Tên doanh nghiệp<input required maxLength="160" {...field('name')}/></label>
        <label>Ngành nghề<input required maxLength="160" {...field('sector')}/></label>
        <label>Quy mô khai báo (người)<input required type="number" min={Math.max(1, organization.employees.length)} max="500" step="1" {...field('size')}/></label>
        <label>Chi phí giờ công tham khảo (đ/giờ)<input required type="number" min="0" max="1000000000" step="1" {...field('hourlyCost')}/></label>
      </div>
      <small>Quy mô phục vụ hồ sơ tổ chức; số chỗ được cấp học phụ thuộc gói đào tạo. Chi phí giờ công dùng để ước tính nguồn lực học tập.</small>
      <button className="rf-primary">Lưu thông tin doanh nghiệp</button>
    </form>
  </details>;
}

const emptyPosition = () => ({ name: '', specialty: '', benchmark: 'marketing_specialist', headcount: 1, priority: 2 });
function PositionForm({ role, user, act }) {
  const [form, setForm] = useState(() => role ? { name: role.name, specialty: role.specialty || '', benchmark: role.benchmark, headcount: role.headcount, priority: role.priority } : emptyPosition());
  const field = name => ({ value: form[name], onChange: e => setForm({ ...form, [name]: e.target.value }) });
  return <form className="rf-form" onSubmit={e => { e.preventDefault(); const result = act(() => savePositionSettings(user, role?.id, form), role ? 'Đã cập nhật vị trí; giữ nguyên nhân viên và khung năng lực đã gắn.' : 'Đã thêm vị trí đặc thù. Có thể thiết lập yêu cầu và mời nhân viên vào vị trí này.'); if (result && !role) setForm(emptyPosition()); }}>
    <div className="bm-settings-grid">
      <label>Tên vị trí<input required maxLength="120" {...field('name')}/></label>
      <label>Đặc thù công việc<input maxLength="300" placeholder="Ví dụ: bán hàng B2B, sử dụng CRM" {...field('specialty')}/></label>
      <label>Số người dự kiến<input required type="number" min="1" max="500" step="1" {...field('headcount')}/></label>
      <label>Ưu tiên đào tạo<select {...field('priority')}><option value="1">P1 · Quan trọng</option><option value="2">P2 · Chính</option><option value="3">P3 · Bổ trợ</option></select></label>
      <label>Nhóm công việc tham khảo<select disabled={!!role} {...field('benchmark')}>{JOB_ROLE_BENCHMARKS.map(item => <option key={item.roleId} value={item.roleId}>{item.roleTitle}</option>)}</select></label>
    </div>
    {role && <small>Nhóm tham khảo được giữ từ lúc tạo vị trí. Điều chỉnh chuẩn riêng trong phần yêu cầu bên dưới hoặc khung yêu cầu có phiên bản.</small>}
    <button className="rf-primary">{role ? 'Lưu thay đổi vị trí' : 'Thêm vị trí'}</button>
  </form>;
}

function WeightInput({ value, label, onSave }) {
  const [draft, setDraft] = useState(String(value));
  return <input type="number" min="0" max="100" step="1" aria-label={label} value={draft} onChange={e => setDraft(e.target.value)} onBlur={() => {
    if (draft !== String(value) && !onSave(draft)) setDraft(String(value));
  }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}/>
}
