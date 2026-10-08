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

Môi trường: frontend Vite `http://localhost:5173`, API Development `http://localhost:5000`, PostgreSQL 17 với DB dựng mới
(migration + seed), Chrome headless 1440×900. Các ca chạy tuần tự trên cùng DB: ca sau dùng dữ liệu của ca trước
(lời mời ở TC02 → TC04–TC06, bài nộp ở TC50 → TC51–TC53).
