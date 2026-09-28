import DemoExperience from './ExperiencePage';
import '../experience.css';

const views = [
  { role: 'landing', label: 'Trang giới thiệu' },
  { role: 'enterprise', label: 'Doanh nghiệp' },
  { role: 'personal', label: 'Người học cá nhân' },
  { role: 'employee', label: 'Nhân viên' },
  { role: 'dept_manager', label: 'Trưởng phòng' },
  { role: 'hr_manager', label: 'Quản trị đào tạo' },
  { role: 'public_visitor', label: 'Tra cứu công khai' },
];

export function ExperienceRoute() {
  const activeRole = new URLSearchParams(window.location.search).get('role') ?? 'landing';

  return <div className="experience-app">
    <div className="experience-preview-bar">
      <strong>Giao diện mẫu</strong>
      <span>Chọn không gian để xem, không cần tài khoản hay seed.</span>
      <nav aria-label="Chọn giao diện mẫu">
        {views.map(view => <a key={view.role} href={`/experience?role=${view.role}`} aria-current={activeRole === view.role ? 'page' : undefined}>{view.label}</a>)}
      </nav>
      <a className="experience-preview-exit" href="/login">Đăng nhập API thật</a>
    </div>
    <DemoExperience />
  </div>;
}
