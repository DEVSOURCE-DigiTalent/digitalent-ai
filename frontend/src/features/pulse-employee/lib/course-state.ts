import type { PulseCourseSummary } from '@/services/pulse.service';
import { formatDate } from '@/lib/utils';
import { SLOT_LABELS, levelName, slotTone } from './labels';

/** Màu của ô / nút trạng thái khóa: khóa tùy chọn chưa mở và khóa ngoài trần có kiểu riêng. */
export function courseTone(course: PulseCourseSummary): string {
  if (course.zone === 'ABOVE_CEILING' || course.zone === 'OUTSIDE_PATH') return 'beyond';
  if (course.zone === 'OPTIONAL' && course.slotStatus === 'AFTER_PRIOR_LEVEL') return 'optional';
  return slotTone(course.slotStatus);
}

export function courseLabel(course: PulseCourseSummary): string {
  if (course.zone === 'OPTIONAL' && course.slotStatus === 'AFTER_PRIOR_LEVEL') return 'Tùy chọn';
  return SLOT_LABELS[course.slotStatus];
}

/** Có hiện thanh % đã học không: khóa đang / đã học trong Pulse (khóa công nhận qua bài đánh giá thì không học). */
export const showsProgress = (course: PulseCourseSummary) =>
  ['TO_LEARN', 'IN_PROGRESS', 'FINAL_READY', 'IN_REVIEW', 'RETRY_WAIT', 'NEEDS_SUPPORT'].includes(course.slotStatus)
  || (course.slotStatus === 'COMPLETED' && course.approvedVia === 'FINAL');

/** Một câu mô tả trạng thái của khóa cho nhân viên. */
/** Khóa vượt trần doanh nghiệp đặt cho phòng ban không hiện trong danh sách khóa của nhân viên. */
export const withinCeiling = (courses: PulseCourseSummary[]) => courses.filter((c) => c.zone !== 'ABOVE_CEILING');

export function courseStatusText(course: PulseCourseSummary, courses: PulseCourseSummary[], _reviewerName?: string | null, departmentName?: string | null): string {
    const modules = course.moduleCount;
  const prior = courses.find((c) => c.categoryId === course.categoryId && c.tier === course.tier - 1);
  const optional = course.zone === 'OPTIONAL' ? 'Tùy chọn: cao hơn mức vị trí yêu cầu nhưng nằm trong trần của phòng ban. ' : '';
  switch (course.slotStatus) {
    case 'COMPLETED':
      return course.approvedVia === 'PRE_ASSESSMENT'
        ? `Được công nhận qua bài đánh giá trước khi học ngày ${formatDate(course.approvedAt)}, không cần học khóa này.`
        : course.approvedVia === 'FINAL'
          ? `Học xong ${modules} mô-đun và đạt bài cuối khóa ngày ${formatDate(course.approvedAt)}.`
          : 'Đã hoàn thành khóa ở luồng học trước.';
    case 'PRE_ASSESSMENT':
      return `${optional}Đạt: khóa được công nhận và bạn lên khóa tiếp theo. Chưa đạt: học khóa này rồi làm bài cuối khóa.`;
    case 'PRE_REVIEW':
      return `Đã nộp bài đánh giá trước khi học ngày ${formatDate(course.preAssessment?.submittedAt)}. Đang chờ Mentor chấm điểm.`;
    case 'TO_LEARN':
      return course.preStatus === 'NOT_YET'
        ? `Bài đánh giá trước khi học ngày ${formatDate(course.preAssessment?.submittedAt)} chưa đạt. Học ${modules} mô-đun rồi làm bài cuối khóa.`
        : `Học ${modules} mô-đun rồi làm bài cuối khóa.`;
    case 'IN_PROGRESS':
      return `${optional}Đã qua ${course.modulesPassed}/${modules} mô-đun.`;
    case 'FINAL_READY':
      return `Đã học hết ${modules} mô-đun. Bài cuối khóa được ghi hình màn hình, camera và micro để Mentor chấm điểm.`;
    case 'IN_REVIEW':
      return `Bài cuối khóa đang chờ Mentor chấm điểm.`;
    case 'RETRY_WAIT':
      return 'Lần nộp đầu chưa đạt. Xem nhận xét và chờ mở lần nộp cuối.';
    case 'NEEDS_SUPPORT':
      return 'Người hướng dẫn sẽ sắp xếp hỗ trợ trước khi lộ trình tiếp tục.';
    case 'SEAT_NEEDED':
      return 'Cần học khóa này. Cấp độ có phí cần suất học do chủ doanh nghiệp phân bổ; bạn xem trước được đề cương.';
    case 'AFTER_PRIOR_LEVEL':
      return `${optional}Mở khi ${prior?.code ?? 'khóa cấp trước'} đạt. Khóa này cũng bắt đầu bằng bài đánh giá trước khi học.`;
    case 'ABOVE_CEILING':
      return `Doanh nghiệp chưa mở mức ${levelName(course.tier)} của lĩnh vực này cho ${departmentName ? `phòng ${departmentName}` : 'phòng ban của bạn'}.`;
    case 'OUTSIDE_PATH':
      return 'Vị trí của bạn không yêu cầu lĩnh vực này.';
    default:
      return 'Bạn chưa được gán vị trí công việc.';
  }
}
