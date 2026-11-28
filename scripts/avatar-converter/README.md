# Chuyển nhân vật Rocketbox sang VRM (nhân vật ra dấu)

Nhân vật ra dấu `frontend/public/avatars/business-male-02.vrm` được tạo bằng công cụ này từ
"Business_Male_02" của thư viện [Microsoft Rocketbox](https://github.com/microsoft/Microsoft-Rocketbox)
(giấy phép MIT). Có thể dùng lại công cụ để đổi sang nhân vật khác trong thư viện, ví dụ Business_Female_01.

Công cụ chạy trong trình duyệt, dùng three.js của frontend, không cần Blender. Nó làm các việc sau:

- đọc FBX bằng `FBXLoader`;
- duỗi tay thẳng ngang vai và duỗi phẳng các ngón (trừ ngón cái), rồi lấy tư thế đó làm tư thế nghỉ (chữ T), vì VRM yêu cầu
  chữ T còn Rocketbox để chữ A;
- đổi đơn vị sang mét, quay mặt về −Z (VRM 0.x), đặt chân chạm đất;
- chỉ giữ 16 biểu cảm khuôn mặt: chớp mắt, khẩu hình a/i/u/e/o, cười, nhướn mày, nhíu mày, mở to mắt;
- chuyển sang vật liệu PBR, xuất GLB rồi thêm phần mở rộng `VRM` (khung xương humanoid, biểu cảm, thông tin giấy phép).

## Cách dùng

1. Tải về một thư mục làm việc tệp FBX có biểu cảm và các ảnh vân của nhân vật trong
   `Assets/Avatars/Professions/<Tên>/` (`Export/<Tên>_facial.fbx` và `Textures/<mã>_*.tga`; mã là tiền tố của tên
   ảnh, ví dụ `m008`).
2. Đổi ảnh vân sang PNG cỡ 1024 bằng ffmpeg:

   ```bash
   for t in body_color body_normal head_color head_normal; do
     ffmpeg -y -i m008_$t.tga -vf scale=1024:1024 -pix_fmt rgb24 m008_$t.png
   done
   ffmpeg -y -i m008_opacity_color.tga -vf scale=1024:1024 -pix_fmt rgba m008_opacity_color.png
   ```

3. Chạy máy chủ (cần `npm install` trong `frontend/` trước) và mở trang bằng Chrome:

   ```bash
   node scripts/avatar-converter/server.mjs <thư mục làm việc>
   # http://localhost:5199/convert.html?f=Business_Male_02_facial.fbx&tex=m008&out=business-male-02.vrm&title=Business%20Male%2002
   ```

   Khi xong, `window.__result` có nhật ký các bước, tệp nằm ở `<thư mục làm việc>/out/`.
4. Chép tệp vào `frontend/public/avatars/`, đổi `DEFAULT_AVATAR_URL` trong
   `frontend/src/features/sign-language/sign-avatar.ts` và ghi nguồn vào `frontend/public/avatars/README.md`.
