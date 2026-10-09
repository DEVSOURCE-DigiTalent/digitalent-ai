import { z } from 'zod';

export const COMMON_PASSWORDS = [
  '12345678',
  '123456789',
  '1234567890',
  '123456789012',
  '1234567890123',
  'matkhau1',
  'matkhau12',
  'matkhau123',
  'matkhau12345',
  'matkhau123456',
  'password',
  'password1',
  'password12',
  'password1234',
  'password12345',
  'qwertyui',
  'qwertyuiop',
  'qwertyuiop12',
  '11111111',
  '111111111111',
  '00000000',
  '000000000000',
];

/**
 * Standard password policy: At least 8 characters, up to 128 characters,
 * blocks common passwords. Email non-collision is verified in form schemas.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu cần ít nhất 8 ký tự')
  .max(128, 'Mật khẩu tối đa 128 ký tự')
  .refine(
    (value) => !COMMON_PASSWORDS.includes(value.toLowerCase().trim()),
    'Mật khẩu quá phổ biến, vui lòng chọn mật khẩu an toàn hơn',
  );

export const requiredText = (label: string) => z.string().trim().min(1, `Nhập ${label.toLowerCase()}`);
