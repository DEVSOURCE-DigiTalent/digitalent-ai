import type { ApiResponse } from '@/types/api';

/** Machine codes the organization APIs put in `errors[].message` (docs/BE1_API_GUIDE.md §3). */
const ERROR_CODE_MESSAGES = new Map<string, string>([
  ['NO_ACCOUNT', 'Nhân viên này chưa có tài khoản nên chưa thể gán vai trò.'],
  ['NO_EMPLOYEE_PROFILE', 'Thành viên chưa có hồ sơ nhân viên. Hãy chọn phòng ban để tạo hồ sơ.'],
  ['INVALID_DEPARTMENT', 'Phòng ban không tồn tại hoặc không còn hoạt động.'],
  ['INVALID_JOB_POSITION', 'Vị trí công việc không tồn tại hoặc không còn hoạt động.'],
  ['INVALID_MANAGER', 'Trưởng phòng phải là nhân viên đang hoạt động của tổ chức.'],
  ['PASSWORD_SAME_AS_EMAIL', 'Mật khẩu không được trùng với email.'],
]);

/** Fixed backend messages that carry no machine code (mostly 403/404/409), shown in Vietnamese. */
const SERVER_MESSAGES = new Map<string, string>([
  ['Validation failed.', 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.'],
  ['The organization must keep at least one active Owner.', 'Tổ chức phải còn ít nhất một Chủ doanh nghiệp đang hoạt động.'],
  ['You cannot deactivate your own account.', 'Bạn không thể tự vô hiệu hóa tài khoản của mình.'],
  ['The member is already deactivated.', 'Thành viên này đã bị vô hiệu hóa.'],
  ['The member is already active.', 'Thành viên này đang hoạt động.'],
  [
    'No seats left on the plan. Upgrade the plan or free a seat first.',
    'Gói dịch vụ đã hết quyền sử dụng. Hãy nâng cấp gói hoặc giải phóng một quyền sử dụng trước.',
  ],
  [
    'The invitation has not been activated yet. Resend or revoke it instead.',
    'Lời mời chưa được kích hoạt. Hãy gửi lại hoặc thu hồi lời mời.',
  ],
  ['Only a pending invitation can be resent.', 'Chỉ gửi lại được lời mời đang chờ kích hoạt.'],
  ['The invitation has already been accepted.', 'Lời mời đã được kích hoạt nên không thể thu hồi.'],
  ['The invitation link is invalid or has expired.', 'Liên kết mời không hợp lệ hoặc đã hết hạn.'],
  ['An account with this e-mail already exists.', 'Email này đã có tài khoản.'],
  ['You are not allowed to assign roles.', 'Bạn không có quyền gán vai trò.'],
  ['Platform administrator accounts cannot be changed from the organization.', 'Không thể thay đổi tài khoản quản trị nền tảng từ tổ chức.'],
  ['Department still has employees. Transfer them before archiving.', 'Phòng ban vẫn còn nhân viên. Hãy điều chuyển họ trước khi lưu trữ.'],
  ['Department still has sub-departments. Archive or move them first.', 'Phòng ban vẫn còn phòng ban con. Hãy lưu trữ hoặc chuyển chúng trước.'],
  ['Department still has job positions. Move or archive them first.', 'Phòng ban vẫn còn vị trí công việc. Hãy chuyển hoặc lưu trữ chúng trước.'],
  ['A department cannot be its own parent or sub-department.', 'Phòng ban cấp trên không được là chính phòng ban này hoặc phòng ban con của nó.'],
  ['Parent department does not exist or is archived.', 'Phòng ban cấp trên không tồn tại hoặc đã lưu trữ.'],
  ['Archived departments cannot be edited.', 'Không thể sửa phòng ban đã lưu trữ.'],
  ['Archived job positions cannot be edited.', 'Không thể sửa vị trí công việc đã lưu trữ.'],
]);

/**
 * Message to show when an organization API call fails (members, invitations, roles, departments, positions, grades).
 * The backend answers in English, so a known machine code or message is translated; any other server message is
 * shown as is, and the fallback covers errors without one (network, unexpected). Reads the response body by shape,
 * so it also works for the mock adapters' rejections.
 */
export function organizationErrorMessage(error: unknown, fallback: string): string {
  const body = (error as { response?: { data?: Partial<ApiResponse<unknown>> } } | null)?.response?.data;
  const codeMessage = body?.errors?.map((item) => ERROR_CODE_MESSAGES.get(item.message)).find(Boolean);
  const message = body?.message;
  return codeMessage ?? (message ? (SERVER_MESSAGES.get(message) ?? message) : fallback);
}
