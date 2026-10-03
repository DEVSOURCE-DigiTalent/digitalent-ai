import { WorkforceCompetencyMatrix } from '../components/WorkforceCompetencyMatrix';

/**
 * OW-19: Workforce Competency Matrix (/enterprise/competency-profiles)
 * Ma trận năng lực toàn tổ chức theo chuẩn Thông tư 02/2025.
 */
export function WorkforceCompetencyMatrixPage() {
  return (
    <WorkforceCompetencyMatrix
      title="Hồ sơ năng lực tổ chức"
      subtitle="Ma trận năng lực toàn diện của đội ngũ nhân sự: Trình độ hiện tại, yêu cầu vị trí, khoảng trống và trạng thái minh chứng"
    />
  );
}
