# 13 — Chiến Lược Kiểm Thử

> Nguồn gốc: Report 2 §1.2/§2.2 (quality plan) + code thực tế (`backend/tests/`) + quy tắc 80% coverage. Phiên bản docs_v3, tiếng Việt.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Chiến lược kiểm thử |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 2 §1.2/§2.2 + backend/tests |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; 3 tầng test + 80% coverage + UAT theo màn hình |

---

## 2. Mục đích và phạm vi

Chiến lược kiểm thử bảo đảm chất lượng xuyên suốt: **unit → integration → E2E/UAT**. Mục tiêu bao phủ tối thiểu **80%** (quy tắc ECC), ưu tiên logic nghiệp vụ tính điểm và RBAC.

**Ngoài phạm vi:** CI/CD pipeline chi tiết (14), checklist code trước push (11).

---

## 3. Tài liệu tham chiếu

- Report 2 §1.2 — Quality Objectives, §2.2 — Test Plan
- `backend/tests/` (UnitTests + IntegrationTests)
- `10_Dac_Ta_UI_UX.md` (danh sách màn hình cho UAT)
- `16_Thiet_Ke_Cham_Diem_AI_Rule.md` (công thức cần test)

---

## 4. Chiến lược tổng quan

| Tầng | Công cụ | Mục tiêu | Bao phủ |
|------|---------|----------|---------|
| Unit | xUnit (backend) | Hàm, service, công thức tính | Logic thuần |
| Integration | xUnit + Testcontainers/InMemory | Endpoint, DB, RBAC, middleware | Luồng API |
| E2E/UAT | Playwright (tương lai) | Luồng người dùng chính | Hành trình |

> Hiện trạng (code thực tế): backend có `UnitTests` + `IntegrationTests` (xUnit, `dotnet test`). Frontend chưa có test runner (chỉ `tsc --noEmit` + `oxlint`) — E2E sẽ bổ sung Playwright.

---

## 5. Mục tiêu chất lượng (Report 2 §1.2)

| Mục tiêu | Ngưỡng |
|----------|--------|
| Code coverage | ≥ 80% |
| Critical/High defect lúc release | 0 |
| Defect reopen | < 5% |
| Thời gian phản hồi API (P95) | < 500 ms (nội bộ) |

---

## 6. Chiến lược unit test

| Đối tượng | Trọng tâm |
|-----------|-----------|
| Service (Competency/Course/Assessment/Certificate/Task/Intelligence) | Business rule, validation |
| Công thức scoring | Risk score, readiness, skill gap (file 16) |
| RBAC helper | `can()`, `HasPermission`, data scope |
| Middleware | `ExceptionHandlingMiddleware` map HTTP |

**Kỹ thuật:** AAA (Arrange-Act-Assert), mock `IApplicationDbContext`, test đặt tên mô tả hành vi. Ví dụ:

```csharp
[Fact]
public void CalculateSkillGap_ReturnsGap_WhenCurrentBelowRequired()
{
    // Arrange
    // Act
    // Assert
}
```

---

## 7. Chiến lược integration test

| Luồng | Kiểm tra |
|-------|----------|
| Auth | Login → token → refresh → logout; khóa sau 5 lần sai |
| RBAC | Endpoint gắn `[HasPermission]`; scope department/ownership |
| Competency | Tạo requirement set → kích hoạt → archive bản cũ (BR-03) |
| Certificate | Attempt PASSED → cấp chứng chỉ; revoke |
| Task | Assign → submit → evaluate → evidence |
| Intelligence | Recalculate snapshot → đọc snapshot |

**Chú ý:** dùng transaction/rollback hoặc DB test riêng; không test trên dữ liệu production.

---

## 8. UAT theo màn hình (Report 3 §3.1.2)

Chạy UAT theo 44 màn hình / 7 khu vực (file 10). Mỗi màn hình: actor đúng, action đúng, trạng thái loading/empty/error đúng, scope dữ liệu đúng.

| Khu vực | Màn hình | Actor |
|---------|----------|-------|
| Common & Auth | Login → 404 | Tất cả |
| Administration | User/RBAC/Settings/Audit | Admin |
| Job Architecture | Position Requirement Editor | HR |
| Manager | Submission Review & Evidence Approval | Dept Manager |
| Trainer | Assessment Setup | Trainer |
| Employee | My Competency Profile & Gap | Employee |
| Public | Certificate Verification | Khách |

---

## 9. Các luồng nghiệp vụ ưu tiên (critical path)

1. **Đăng nhập → học → thi → cấp chứng chỉ** (UC-01..06, 24, 35..43, 27, 45)
2. **Thiết lập requirement → đo gap → gợi ý khóa học** (UC-14..22, 23, 24)
3. **Giao task → nộp bằng chứng → duyệt → nâng năng lực** (UC-30..33, 44)
4. **Tính risk/readiness → dashboard** (NF-01..03, UC-28, 29, 39, 40)
5. **Xác minh chứng chỉ công khai** (UC-46)

---

## 10. Dữ liệu kiểm thử

- Seed `admin@digitalent.ai` / `Admin@1234` (Development).
- Bộ dữ liệu mẫu: 5 job family, 7 job position, 21 competency, 3 level.
- Không dùng dữ liệu cá nhân thật; nhân viên mẫu là dữ liệu giả.

---

## 11. Tiêu chí hoàn thành (Definition of Done)

- [ ] Coverage ≥ 80%
- [ ] `dotnet test` xanh (Unit + Integration)
- [ ] `tsc --noEmit` + `oxlint` sạch (frontend)
- [ ] Không CRITICAL/HIGH defect
- [ ] UAT từng màn hình pass

---

## 12. Ma trận vết

| Hạng mục test | UC/BR | File |
|---------------|-------|------|
| Scoring formula | NF-01..03, BR-08 | 16 |
| RBAC & scope | UC-08..13, BR-12 | 09 |
| Requirement set version | UC-16, BR-02/03 | 07 |
| Certificate | UC-27, 45, 46, BR-06 | 15 |
| Task & evidence | UC-30..33, 44, BR-04 | 04 |
