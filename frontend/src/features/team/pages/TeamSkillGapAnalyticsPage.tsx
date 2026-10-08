import { SkillGapAnalyticsView } from '@/features/intelligence/components/SkillGapAnalyticsView';

/**
 * MG-05: Team Skill Gap Analytics View
 * Bảng điều khiển phân tích khoảng trống năng lực nhóm theo năng lực TT02, vị trí, cấp bậc và nhân viên.
 * Tái sử dụng SkillGapAnalyticsView ở chế độ readOnly={true} và hideDepartmentFilter={true}.
 */
export function TeamSkillGapAnalyticsPage() {
  return (
    <SkillGapAnalyticsView
      title="Khoảng trống năng lực nhóm (Skill Gap)"
      subtitle="Phân tích mức độ chênh lệch giữa năng lực thực tế của nhân viên trong nhóm và yêu cầu vị trí việc làm theo Khung chuẩn năng lực số"
      readOnly={true}
      hideDepartmentFilter={true}
    />
  );
}
