import type { PulseCourseSummary } from '@/services/pulse.service';
import { formatDate } from '@/lib/utils';
import { SLOT_LABELS, levelName, slotTone } from './labels';

/** Màu của ô / nút trạng thái khóa: khóa học vượt chưa mở và khóa chưa mua có kiểu riêng. */
export function courseTone(course: PulseCourseSummary): string {
  if (course.zone === 'ABOVE_CEILING' || course.zone === 'OUTSIDE_PATH') return 'beyond';
  if (course.zone === 'OPTIONAL' && course.slotStatus === 'AFTER_PRIOR_LEVEL') return 'optional';
  return slotTone(course.slotStatus);
}

export function courseLabel(course: PulseCourseSummary): string {
  if (course.zone === 'OPTIONAL' && course.slotStatus === 'AFTER_PRIOR_LEVEL') return 'Học vượt';
  return SLOT_LABELS[course.slotStatus];
}

/**
 * Nhãn của khóa đã đạt. Bài đánh giá dùng thử không công nhận khóa nào; khóa chỉ đạt qua bài cuối khóa (bài kiểm tra đầu
 * vào ≥ 80% chỉ bỏ qua phần học) hoặc bài đánh giá trước khi học cũ đã có kết luận.
 */
export function doneLabel(course: PulseCourseSummary): string {
  return course.approvedVia === 'PRE_ASSESSMENT' ? 'Công nhận qua bài đánh giá đầu vào' : 'Đã hoàn thành';
}

/** Có hiện thanh % đã học không: khóa đang / đã học trong Pulse (khóa công nhận qua bài đánh giá thì không học). */
export const showsProgress = (course: PulseCourseSummary) =>
  ['TO_LEARN', 'IN_PROGRESS', 'FINAL_READY', 'IN_REVIEW', 'RETRY_WAIT', 'NEEDS_SUPPORT'].includes(course.slotStatus)
  || (course.slotStatus === 'COMPLETED' && course.approvedVia === 'FINAL');

/** Một câu mô tả trạng thái của khóa cho nhân viên. */
/** Khóa chưa mua ở trên mức tối thiểu doanh nghiệp yêu cầu không hiện trong danh sách khóa của nhân viên. */
export const withinCeiling = (courses: PulseCourseSummary[]) => courses.filter((c) => c.zone !== 'ABOVE_CEILING');

export function courseStatusText(course: PulseCourseSummary, courses: PulseCourseSummary[], _reviewerName?: string | null, departmentName?: string | null): string {
    const modules = course.moduleCount;
  const prior = courses.find((c) => c.categoryId === course.categoryId && c.tier === course.tier - 1);
  const optional = course.zone === 'OPTIONAL' ? 'Học vượt: cao hơn mức tối thiểu doanh nghiệp yêu cầu, doanh nghiệp đã mua khóa này. Được khuyến khích. ' : '';
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
      return `Đã nộp bài đánh giá trước khi học ngày ${formatDate(course.preAssessment?.submittedAt)}. Đang chờ Mentor đánh giá.`;
    case 'TO_LEARN':
      return course.preStatus === 'NOT_YET'
        ? `Bài đánh giá trước khi học ngày ${formatDate(course.preAssessment?.submittedAt)} chưa đạt. Học ${modules} mô-đun rồi làm bài cuối khóa.`
        : `Học ${modules} mô-đun rồi làm bài cuối khóa.`;
    case 'IN_PROGRESS':
      return `${optional}Đã qua ${course.modulesPassed}/${modules} mô-đun.`;
    case 'FINAL_READY':
      return `Đã học hết ${modules} mô-đun. Bài cuối khóa được ghi hình màn hình, camera và micro để Mentor đánh giá.`;
    case 'IN_REVIEW':
      return `Bài cuối khóa đang chờ Mentor đánh giá.`;
    case 'RETRY_WAIT':
      return 'Lần nộp đầu chưa đạt. Xem nhận xét và chờ mở lần nộp cuối.';
    case 'NEEDS_SUPPORT':
      return 'Người hướng dẫn sẽ sắp xếp hỗ trợ trước khi lộ trình tiếp tục.';
    case 'PURCHASE_NEEDED':
      return 'Cần học khóa này. Doanh nghiệp chưa mua khóa có phí này; bạn xem trước được đề cương.';
    case 'AFTER_PRIOR_LEVEL':
      return `${optional}Mở khi bạn đạt ${prior ? `khóa ${levelName(prior.tier)} "${prior.title}"` : 'khóa cấp trước'}. Khóa này cũng bắt đầu bằng bài đánh giá trước khi học.`;
    case 'ABOVE_CEILING':
      return `Doanh nghiệp chưa mua khóa ${levelName(course.tier)} của lĩnh vực này. Mức tối thiểu ${departmentName ? `phòng ${departmentName}` : 'phòng ban của bạn'} cần đạt thấp hơn, khi doanh nghiệp mua khóa sẽ mở để bạn học vượt.`;
    case 'OUTSIDE_PATH':
      return 'Vị trí của bạn không yêu cầu lĩnh vực này.';
    default:
      return 'Bạn chưa được gán vị trí công việc.';
  }
}
