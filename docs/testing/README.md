# Kiểm thử màn hình cá nhân nhân viên (EM-01 → EM-18)

Thư mục này chứa kết quả kiểm thử phần việc BE1 + FE1: API `/api/v1/me/*` và 18 trang `/enterprise/me/*`.

| File | Nội dung |
|------|----------|
| `EM-01_EM-18_Test_Evidence.xlsx` | Báo cáo kiểm thử: tổng quan, 20 test case, từng bước kèm ảnh evidence, danh sách test tự động |
| `scripts/em_evidence.py` | Chạy các test case thủ công trên trình duyệt thật và chụp ảnh từng bước |
| `scripts/build_excel.py` | Dựng file Excel từ kết quả chạy, ảnh chụp và báo cáo test tự động |

## Cách đọc file Excel

- **Tổng quan** — môi trường test, số test case / số bước Pass–Fail (tính bằng công thức), kết quả test tự động.
- **Test cases** — 20 test case (18 màn EM + 2 test bảo mật). Cột *Số bước*, *Số bước Fail*, *Trạng thái* là công thức lấy từ sheet chi tiết.
- **Chi tiết bước & Evidence** — mỗi bước 1 dòng: thao tác, dữ liệu, kết quả mong đợi, kết quả thực tế, trạng thái và ảnh.
  Trong ảnh, **khung đỏ** là phần tử được thao tác/kiểm tra, **nhãn vàng** ghi mã test case và nội dung bước.
  Bước "Bấm …" được chụp ngay trước khi bấm; kết quả nằm ở cột *Kết quả thực tế* và ảnh của bước kế tiếp.
- **Test tự động** — các file test backend (xUnit) và frontend (Vitest) cho phần EM, số test, commit và kết quả.

## Chạy lại

### Test tự động

```bash
# Backend — cần PostgreSQL riêng cho test, tên DB kết thúc bằng _test
cd backend
export DIGITALENT_TEST_POSTGRES_CONNECTION="Host=127.0.0.1;Port=5432;Database=digitalent_test;Username=...;Password=..."
dotnet test --filter "FullyQualifiedName~DigiTalent.Tests.Me" --logger "trx;LogFileName=be-tests.trx" --results-directory <thư mục kết quả>/test-results

# Frontend
cd frontend
npx vitest run --reporter=json --outputFile=<thư mục kết quả>/vitest_tests_branch.json
```

### Test thủ công có ảnh evidence

1. Dùng một **DB local mới** (không dùng DB `digitalent` của team): backend ở Development sẽ tự migrate và seed dữ liệu demo
   (employee@digitalent.ai là nhân viên Kế toán có 3 khóa học, 3 nhiệm vụ, 1 chứng chỉ).
2. Chạy backend ở `http://localhost:5000` và frontend (`npm run dev`) ở `http://localhost:5173`.
3. Cài công cụ: `pip install playwright openpyxl pillow` rồi `playwright install chromium`.
4. Chạy:

```bash
python docs/testing/scripts/em_evidence.py <thư mục kết quả>/evidence
python docs/testing/scripts/build_excel.py <thư mục kết quả> docs/testing/EM-01_EM-18_Test_Evidence.xlsx <commit> <nhánh>
```

Kịch bản làm thay đổi dữ liệu (ghi danh khóa, làm bài, nộp nhiệm vụ), nên mỗi lần chạy lại cần tạo lại DB demo.
