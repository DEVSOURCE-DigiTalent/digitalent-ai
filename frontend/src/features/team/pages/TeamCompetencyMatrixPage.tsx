import { WorkforceCompetencyMatrix } from '@/features/competency/components/WorkforceCompetencyMatrix';

/**
 * MG-04: Team Competency Matrix
 * Ma trận năng lực 2 chiều của nhân sự trong nhóm quản lý x Năng lực TT02 (hiện tại / yêu cầu / khoảng trống).
 * Dùng WorkforceCompetencyMatrix ở chế độ readOnly={true} và hideDepartmentFilter={true}.
 */
export function TeamCompetencyMatrixPage() {
  return (
    <WorkforceCompetencyMatrix
      title="Ma trận năng lực nhóm"
      subtitle="So sánh trực quan trình độ hiện tại, yêu cầu vị trí và khoảng trống năng lực của nhân sự trong nhóm theo Thông tư 02/2025"
      readOnly={true}
      hideDepartmentFilter={true}
    />
  );
}
