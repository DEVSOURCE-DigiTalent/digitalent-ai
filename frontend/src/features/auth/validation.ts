import { z } from 'zod';

export const COMMON_PASSWORDS = [
  '123456789012',
  '1234567890123',
  'matkhau12345',
  'matkhau123456',
  'password1234',
  'password12345',
  'qwertyuiop12',
  '111111111111',
  '000000000000',
];

/**
 * P13 & §4.10: At least 12 characters, up to 128 characters, no composition rules,
 * blocks common passwords. Email non-collision is verified in form schemas.
 */
export const passwordSchema = z
  .string()
  .min(12, 'Mật khẩu cần ít nhất 12 ký tự')
  .max(128, 'Mật khẩu tối đa 128 ký tự')
  .refine(
    (value) => !COMMON_PASSWORDS.includes(value.toLowerCase().trim()),
    'Mật khẩu quá phổ biến, vui lòng chọn mật khẩu an toàn hơn',
  );

export const requiredText = (label: string) => z.string().trim().min(1, `Nhập ${label.toLowerCase()}`);
