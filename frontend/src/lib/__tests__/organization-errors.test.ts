import { describe, expect, it } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import { organizationErrorMessage } from '../organization-errors';

const failure = (status: number, message: string, errors: { field?: string; message: string }[] = []) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    data: { success: false, message, data: null, errors },
  } as AxiosResponse);

describe('organizationErrorMessage', () => {
  it('translates the machine code of a business rule', () => {
    const error = failure(400, 'This employee has no account yet, so roles cannot be assigned.', [
      { field: 'roles', message: 'NO_ACCOUNT' },
    ]);

    expect(organizationErrorMessage(error, 'Không đổi được vai trò.')).toBe(
      'Nhân viên này chưa có tài khoản nên chưa thể gán vai trò.',
    );
  });

  it('translates a known server message without a code', () => {
    const error = failure(409, 'The organization must keep at least one active Owner.');

    expect(organizationErrorMessage(error, 'Không đổi được vai trò.')).toBe(
      'Tổ chức phải còn ít nhất một Chủ doanh nghiệp đang hoạt động.',
    );
  });

  it('shows any other server message as is', () => {
    const error = failure(409, "Department code 'OPS' already exists.");

    expect(organizationErrorMessage(error, 'Không tạo được phòng ban')).toBe("Department code 'OPS' already exists.");
  });

  it('falls back when the server gave no message', () => {
    expect(organizationErrorMessage(new Error('Network Error'), 'Không tạo được phòng ban')).toBe('Không tạo được phòng ban');
  });

  it('reads the rejections of the mock adapters, which have the same body', () => {
    const mockRejection = { response: { status: 404, data: { success: false, message: 'Liên kết mời không hợp lệ hoặc đã hết hạn.' } } };

    expect(organizationErrorMessage(mockRejection, 'Không thể kích hoạt tài khoản.')).toBe('Liên kết mời không hợp lệ hoặc đã hết hạn.');
  });
});
