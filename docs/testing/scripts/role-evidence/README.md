# Evidence kiểm thử theo vai trò

Bộ script dựng file evidence cho từng vai trò (PLATFORM_ADMIN, MENTOR, OWNER, MANAGER, EMPLOYEE) theo mẫu
`docs/test-evidence/2026-10-05-overview-api`:

| File | Nội dung |
|------|----------|
| `Evidence_API_<ROLE>.xlsx` | Sheet **Tong hop** (số ca, PASS/FAIL tính bằng công thức, mỗi ca 1 dòng có liên kết), mỗi ca 1 sheet `TCxx` có ảnh request/response với vùng khoanh đỏ, sheet `AUTOxx` là kết quả test tự động |
| `Evidence_FE_<ROLE>.xlsx` | Sheet **Tong hop**, mỗi ca 1 sheet `FExx`: thông tin ca, chú thích khoanh đỏ, API backend trình duyệt đã gọi, ảnh màn hình có khung đỏ đánh số |
| `images/` | Ảnh gốc `TCxx.png`, `FExx.png`, `AUTOxx.png` |
| `api_results.json`, `fe_results.json` | Dữ liệu của hai file Excel |

Kết quả nằm ở `docs/test-evidence/2026-11-09-role-<vai-trò>/`.

## Ca kiểm thử

- `api_cases.py`: mỗi vai trò 11–13 ca gọi API thật — đăng nhập, `/auth/me`, các màn hình chính của vai trò (200 và
  dữ liệu đúng seed), các API của vai trò khác (403) và gọi không có token (401).
- `fe_cases.py`: mỗi vai trò 4–8 ca trên trình duyệt — đăng nhập vào đúng không gian, các màn hình chính, và màn
  hình của vai trò khác bị chặn (trang "Truy cập bị từ chối" hoặc chuyển về cổng của mình).
- AUTO: `dotnet test` của `<Role>AccessTests` (ma trận quyền: đọc `[HasPermission]` của mọi endpoint, so với
  `RolePermissions.Defaults`) và test use case của các màn hình liên quan (`run_api_evidence.py`, `AUTO_TESTS`).

## Chạy lại

1. DB PostgreSQL **mới** (không dùng DB của team). Backend Development tự migrate và seed dữ liệu demo:

   ```bash
   cd backend
   ASPNETCORE_ENVIRONMENT=Development ConnectionStrings__DefaultConnection="Host=127.0.0.1;Port=5432;Database=digitalent_evidence;Username=...;Password=..." \
     dotnet run --project src/DigiTalent.Api --launch-profile http        # http://localhost:5000
   cd ../frontend && npm run dev                                          # http://localhost:5173, VITE_USE_MOCK=false
   ```

2. Công cụ: `pip install playwright openpyxl pillow` rồi `playwright install chromium`
   (hoặc trỏ `EVIDENCE_CHROMIUM` tới một Chromium có sẵn). Test tích hợp của phần AUTO cần
   `DIGITALENT_TEST_POSTGRES_CONNECTION` tới một DB tên kết thúc bằng `_test`, và backend đã build (`dotnet build`).

3. Mỗi vai trò:

   ```bash
   cd docs/testing/scripts/role-evidence
   python run_api_evidence.py owner      # TCxx + AUTOxx
   python run_fe_evidence.py owner       # FExx
   python build_workbooks.py owner       # hai file Excel
   ```

   Vai trò: `platform-admin`, `mentor`, `owner`, `manager`, `employee`.

Ca TC07 của OWNER tạo phòng ban `EVD01`, nên chạy lại cần DB mới (hoặc xóa phòng ban đó).
