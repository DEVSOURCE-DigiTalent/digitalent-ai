import React from 'react';
import { EmptyState } from '@/components/shared';
import { CourseRecommendations } from '@/features/intelligence/components/CourseRecommendations';
import { SkillGapDetailView } from '@/features/intelligence/components/SkillGapDetailView';
import type { SkillGapRunDetail } from '@/services/intelligence.service';

interface SkillGapTabProps {
  run: SkillGapRunDetail | null;
  employeeId: string;
  blocker?: string | null;
  readOnly?: boolean;
}

const BLOCKER_LABELS: Record<string, string> = {
  NO_JOB_POSITION: 'Nhân viên chưa được xếp vị trí công việc',
  NO_ACTIVE_REQUIREMENT_SET: 'Vị trí công việc chưa kích hoạt bộ yêu cầu năng lực chuẩn',
  EMPLOYEE_NOT_ACTIVE: 'Nhân viên đang ở trạng thái không hoạt động',
};

export const SkillGapTab: React.FC<SkillGapTabProps> = ({ run, employeeId, blocker }) => {
  if (!run) {
    return (
      <EmptyState
        title="Chưa thể tính toán khoảng trống năng lực"
        description={
          blocker
            ? `${BLOCKER_LABELS[blocker] ?? blocker}. Vui lòng cập nhật thông tin để hệ thống phân tích.`
            : 'Chưa có đủ dữ liệu để tính khoảng trống năng lực cho nhân sự này.'
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <SkillGapDetailView run={run} />

      <section aria-labelledby="recommend-heading" className="space-y-4">
        <h3 id="recommend-heading" className="text-base font-semibold text-slate-900">
          Gợi ý khóa học đào tạo khắc phục khoảng trống
        </h3>
        <CourseRecommendations employeeId={employeeId} />
      </section>
    </div>
  );
};
