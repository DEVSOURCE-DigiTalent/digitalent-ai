# Nhân vật 3D ra dấu

`business-male-02.vrm` là nhân vật **"Business_Male_02"** của thư viện **Microsoft Rocketbox**, chuyển sang VRM 0.x.

- Giấy phép: **MIT**, Copyright (c) 2020 Microsoft. Toàn văn ở `LICENSE-rocketbox.txt`, phải đi kèm tệp nhân vật.
  Được dùng thương mại và được sửa đổi.
- Nguồn: https://github.com/microsoft/Microsoft-Rocketbox, thư mục `Assets/Avatars/Professions/Business_Male_02`
  (`Export/Business_Male_02_facial.fbx` và ảnh vân `m008_*`).
- Đã chuyển bằng `scripts/avatar-converter/`. Các thay đổi so với bản gốc:
  - tư thế nghỉ đổi sang chữ T;
  - đơn vị đổi sang mét;
  - ảnh vân giảm xuống 1024 px;
  - chỉ giữ 16 biểu cảm: chớp mắt, khẩu hình a/i/u/e/o, cười, nhướn mày, nhíu mày, mở to mắt.
- Thông số: VRM 0.x, 2,8 MB, khoảng 4.600 đỉnh, 52 xương humanoid (đủ 30 xương ngón tay), vật liệu PBR.
- Nhân vật cũ là Erika của bộ 100Avatars (CC0). Đã bỏ vì trông không hợp với nền tảng doanh nghiệp. Tệp gốc vẫn tải được tại
  https://arweave.net/GZkfa0SNnrBWluRL_pXpakg7T3K3d4l87__wR4mD3UM

Muốn thay nhân vật: chuyển một nhân vật khác bằng `scripts/avatar-converter/` (hoặc dùng bất kỳ tệp `.vrm` nào có xương ngón
tay), đặt tệp vào thư mục này rồi đổi `DEFAULT_AVATAR_URL` trong `src/features/sign-language/sign-avatar.ts`.
