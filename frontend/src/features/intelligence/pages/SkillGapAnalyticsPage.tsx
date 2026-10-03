import { SkillGapAnalyticsView } from '../components/SkillGapAnalyticsView';

/**
 * OW-21: Skill Gap Dashboard (/enterprise/skill-gap)
 * Bảng điều khiển phân tích khoảng trống năng lực toàn tổ chức theo chuẩn TT02.
 */
export function SkillGapAnalyticsPage() {
  return (
    <SkillGapAnalyticsView
      title="Khoảng trống năng lực"
      subtitle="Phân tích mức độ đáp ứng năng lực và khoảng trống của nhân sự so với chuẩn vị trí, theo phòng ban, vị trí và Cấp bậc G1–G3"
    />
  );
}
