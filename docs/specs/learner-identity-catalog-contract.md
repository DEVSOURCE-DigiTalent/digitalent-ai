# Hợp đồng API Người học Tự do và Danh mục Khóa học Công khai (SEP-09 / Task 8)

**Tài liệu tham chiếu:**
- `docs/specs/2026-09-27-two-surfaces-september-plan.md`
- `docs/superpowers/plans/2026-09-27-two-surfaces-september.md`

**Trạng thái:** `BLOCKED-BY-DECISION` (Chờ quyết định sản phẩm trước khi cập nhật `AppDbContext` và tạo migration)

---

## 1. Mục tiêu và Phạm vi

Thiết lập hợp đồng giao tiếp (API contract) cho trải nghiệm người học độc lập (Public Learner Surface) tích hợp cùng backend DigiTalent AI, đảm bảo:
1. Người học chưa đăng nhập (anonymous) duyệt được danh mục vị trí nghề nghiệp công khai và danh mục khóa học của nền tảng.
2. Người học có thể đăng ký tài khoản tự do (không phụ thuộc tổ chức doanh nghiệp) để lưu mục tiêu học tập và tiến độ.
3. Nhân viên doanh nghiệp có thể vừa tham gia đào tạo bắt buộc của tổ chức, vừa tự chọn lộ trình phát triển kỹ năng cá nhân.
4. Bảo vệ dữ liệu: Nội dung đào tạo riêng của doanh nghiệp (private tenant courses) tuyệt đối không lộ ra danh mục công khai.

---

## 2. Mô hình Định danh (Identity Architecture)

### 2.1. Đề xuất bảng `learner_profiles`

```sql
-- DRAFT PROPOSAL - CHƯA ÁP DỤNG MIGRATION CHO ĐẾN KHI PRODUCT OWNER CHỐT
CREATE TABLE learner_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    target_role_id UUID NULL, -- Liên kết tới career_role_templates
    headline VARCHAR(255) NULL,
    bio TEXT NULL,
    interests TEXT[] NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_learner_profiles_user UNIQUE (user_id)
);
```

### 2.2. Phân biệt Người học Tự do vs Nhân viên Doanh nghiệp

| Tiêu chí | Người học Tự do (Independent Learner) | Nhân viên Doanh nghiệp (Enterprise Employee) |
| :--- | :--- | :--- |
| `users.organization_id` | `NULL` | `UUID` (thuộc tổ chức cụ thể) |
| Hồ sơ nghiệp vụ | `learner_profiles` | `employees` (thuộc phòng ban, có chức danh) |
| Lộ trình học | Tự chọn theo `career_role_templates` | Doanh nghiệp giao (`course_assignments`) + Tự chọn cá nhân |
| Quyền truy cập | Công khai + các khóa học `is_public = true` | Toàn bộ khóa học của tổ chức + khóa học công khai |

---

## 3. Đặc tả Hợp đồng API (API Contracts)

### 3.1. Danh mục Vị trí Nghề nghiệp Công khai (Public Career Roles)

- **Endpoint:** `GET /api/v1/public/careers`
- **Xác thực:** Không bắt buộc (Anonymous)
- **Response:**
```json
{
  "success": true,
  "message": "Career roles retrieved successfully",
  "data": {
    "items": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "code": "AI-ENG",
        "title": "AI / Machine Learning Engineer",
        "slug": "ai-machine-learning-engineer",
        "category": "Công nghệ thông tin",
        "description": "Thiết kế, xây dựng và triển khai các giải pháp trí tuệ nhân tạo và học máy.",
        "requiredSkills": ["Python", "PyTorch", "LLM Fine-tuning", "Vector Database"],
        "recommendedCoursesCount": 6
      }
    ],
    "totalItems": 1,
    "pageIndex": 1,
    "pageSize": 20,
    "totalPages": 1
  },
  "errors": []
}
```

### 3.2. Danh mục Khóa học Công khai (Public Course Catalog)

- **Endpoint:** `GET /api/v1/public/courses`
- **Xác thực:** Không bắt buộc (Anonymous)
- **Truy vấn:** `?careerRole=ai-machine-learning-engineer&level=INTERMEDIATE&search=transformer`
- **Response:**
```json
{
  "success": true,
  "message": "Public catalog courses retrieved successfully",
  "data": {
    "items": [
      {
        "id": "7ca85f64-5717-4562-b3fc-2c963f66afa8",
        "code": "CRS-AI-01",
        "title": "Nhập môn Kỹ thuật Prompt và LLM ứng dụng",
        "thumbnailUrl": "https://cdn.digitalent.ai/courses/prompt-engineering.jpg",
        "provider": "DigiTalent Platform",
        "level": "BEGINNER",
        "durationHours": 12,
        "isPublic": true,
        "competenciesCovered": [
          { "code": "AI_PROMPT", "name": "Prompt Engineering" }
        ]
      }
    ],
    "totalItems": 1,
    "pageIndex": 1,
    "pageSize": 20,
    "totalPages": 1
  },
  "errors": []
}
```

### 3.3. Lưu Vị trí Mục tiêu Cá nhân (Save Target Career Role)

- **Endpoint:** `POST /api/v1/learner/target-role`
- **Xác thực:** Bắt buộc (`Bearer token`) - áp dụng cho cả Người học Tự do và Nhân viên
- **Request Body:**
```json
{
  "careerRoleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Target career role saved successfully",
  "data": {
    "targetRoleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "targetRoleTitle": "AI / Machine Learning Engineer",
    "updatedAt": "2026-09-27T10:00:00Z"
  },
  "errors": []
}
```

### 3.4. Bảo vệ Dữ liệu Đa Tổ chức (Tenant Security Enforcement)

- Khi người học tự do hoặc người dùng của Tenant A cố tình truy cập vào khóa học thuộc Tenant B (`GET /api/v1/courses/{tenantB_courseId}`):
  - **HTTP Status:** `404 Not Found` (hoặc `403 Forbidden` nếu là nhân viên cùng hệ thống nhưng khác tenant)
  - **Quy tắc:** Backend use case bắt buộc kiểm tra `OrganizationId` hoặc cờ `IsPublic == true`. Tuyệt đối không dựa vào frontend để lọc.

---

## 4. Bảng Quyết định Sản phẩm Còn Mở (Open Decisions & Questions)

| # | Câu hỏi Cần Chốt | Mặc định Kỹ thuật Đề xuất | Trạng thái Hiện tại | Hệ quả nếu Thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| **D-01** | Quy trình Đăng ký (Self-signup) của người học tự do: có cần xác thực email qua OTP không? | Có xác thực email trước khi kích hoạt `User` trạng thái `ACTIVE`. Mặc định role gán là `LEARNER`. | `BLOCKED-BY-DECISION` (Chờ Product Owner xác nhận) | Ảnh hưởng use case `RegisterUseCase` và cấu hình mail service. |
| **D-02** | Quan hệ giữa `CareerRoleTemplate` (chuẩn công khai) và `JobPosition` (vị trí riêng của từng Doanh nghiệp)? | `CareerRoleTemplate` là danh mục chuẩn chung (không có `organization_id`). Doanh nghiệp khi tạo `JobPosition` có thể liên kết (mapping) tới 1 `CareerRoleTemplate` để dùng lại khung năng lực chuẩn. | `BLOCKED-BY-DECISION` (Chờ Product Owner xác nhận) | Ảnh hưởng FK trong bảng `job_positions` và logic tính skill gap. |
| **D-03** | Khóa học của Doanh nghiệp có được phép Publish ra ngoài công khai không? | Mặc định **KHÔNG**. Chỉ có các khóa học do Platform Admin tạo với `organization_id = NULL` và `is_public = true` mới xuất hiện trên Public Catalog. | `BLOCKED-BY-DECISION` (Chờ Product Owner xác nhận) | Nếu cho phép, cần cơ chế duyệt nội dung (moderation) và bản quyền giữa các bên. |
| **D-04** | Trải nghiệm chuyển đổi: Nhân viên doanh nghiệp có được chuyển tài khoản thành người học độc lập khi nghỉ việc không? | Tách biệt `users` (danh tính đăng nhập) và `employees` (hợp đồng nhân sự). Khi `employees.status = INACTIVE`, tài khoản `users` vẫn giữ quyền `LEARNER` tự do nếu chính sách công ty cho phép. | `BLOCKED-BY-DECISION` (Chờ Product Owner xác nhận) | Ảnh hưởng lifecycle của `User` khi Employee bị archive. |

---

## 5. Kết luận và Kế hoạch Tiếp nối

1. **Tuân thủ nguyên tắc cốt lõi:** Không tự ý sửa `AppDbContext`, không tạo migration suy đoán trước khi có phê duyệt chính thức bằng văn bản cho các câu hỏi D-01 đến D-04.
2. **Kế hoạch sau ngày 30/09:** Khi các quyết định được ký duyệt, tiến hành:
   - Tạo migration `AddPublicLearnerAndCatalogTables`.
   - Viết test `PublicCatalogContractTests.cs`.
   - Triển khai use cases và controller cho `/api/v1/public/*` và `/api/v1/learner/*`.
