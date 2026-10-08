# Evidence kiểm thử BE1 — Tổ chức, Năng lực, Nhân viên (2026-10-08)

Nhánh `feature/DT-be1-competency-apis`: 7 API BE1 mới (`/workforce`, `/workforce/{employeeId}`, `/competency-profiles/matrix`,
`/competencies/{id}/usage`, `/position-requirements/summaries`, `/intelligence/analytics/overview|competencies`) và frontend
nhóm Tổ chức / Năng lực / Nhân viên chạy với backend thật (`VITE_USE_MOCK=false`).

| File | Nội dung |
|------|----------|
| `Evidence_BE1_ToChuc_NangLuc_OW02-OW22_EM01-EM18.xlsx` | Sheet **Tong hop** (58 ca, API backend thật đã gọi, phát hiện PH-01…PH-06), **Ra soat rule**, mỗi ca một sheet có ảnh khoanh đỏ + chú thích |
| `images/` | Ảnh gốc: TC01–TC53 (E2E), AUTO01–AUTO05 (log kiểm thử tự động) |
| `results.json`, `auto.json` | Kết quả E2E / kiểm thử tự động (dữ liệu của file Excel) |
| `rules.json`, `findings.json` | Rà soát rule dự án, các phát hiện |
| `logs/` | Log AUTO01–AUTO05; `develop-vitest.txt` = toàn bộ Vitest trên `origin/develop` (mốc so sánh của AUTO02) |
| `scripts/` | Công cụ chạy lại |

## Chạy lại

Cần Node 24 (WebSocket sẵn có), Chrome, Python 3 + `openpyxl` + `Pillow`, backend Development trên một DB **mới**
(migration + seed) và frontend `npm run dev` với `VITE_USE_MOCK=false`.

```bash
EVIDENCE=docs/test-evidence/2026-10-08-be1-organization-competency-api
node $EVIDENCE/scripts/run.mjs  $EVIDENCE/images   # TC01–TC25 Tổ chức (ghi results.json)
node $EVIDENCE/scripts/run2.mjs $EVIDENCE/images   # TC26–TC53 Năng lực, Nhân viên, Quản lý (nối vào results.json)

# AUTO01–AUTO05: dừng backend trước (dotnet build), DB kiểm thử có tên kết thúc bằng _test
DIGITALENT_TEST_POSTGRES_CONNECTION="Host=127.0.0.1;Port=5432;Database=<ten>_test;Username=…;Password=…" \
  bash $EVIDENCE/scripts/auto-run.sh
node $EVIDENCE/scripts/auto.mjs $EVIDENCE/images $EVIDENCE/scripts/auto-specs.json

python $EVIDENCE/scripts/build_excel.py $EVIDENCE '{"branch": "…", "commit": "…", "date": "…", "file": "Evidence_BE1_ToChuc_NangLuc_OW02-OW22_EM01-EM18.xlsx"}'
```

Các ca chạy tuần tự trên cùng DB: ca sau dùng dữ liệu của ca trước (lời mời ở TC02 → TC04–TC06, bài nộp ở TC50 → TC51–TC53).
