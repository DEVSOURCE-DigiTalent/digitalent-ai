# Hợp đồng API Người học Tự do và Danh mục Khóa học Công khai (SEP-09 / Task 8)

**Tài liệu tham chiếu:**
- `docs/specs/2026-09-27-two-surfaces-september-plan.md`
- `docs/superpowers/plans/2026-09-27-two-surfaces-september.md`

**Trạng thái:** `APPROVED` (Đã phê duyệt các quyết định sản phẩm ngày 2026-09-27)

---

## 1. Mục tiêu và Phạm vi

Thiết lập hợp đồng giao tiếp (API contract) cho trải nghiệm người học độc lập (Public Learner Surface) tích hợp cùng backend DigiTalent AI, đảm bảo:
1. Người học chưa đăng nhập (anonymous) duyệt được danh mục vị trí nghề nghiệp công khai và danh mục khóa học của nền tảng.
2. Người học có thể đăng ký tài khoản tự do (không phụ thuộc tổ chức doanh nghiệp) để lưu mục tiêu học tập và tiến độ.
3. Nhân viên doanh nghiệp có thể vừa tham gia đào tạo bắt buộc của tổ chức, vừa tự chọn lộ trình phát triển kỹ năng cá nhân.
4. Bảo vệ dữ liệu: Nội dung đào tạo riêng của doanh nghiệp (private tenant courses) tuyệt đối không lộ ra danh mục công khai.

---

## 2. Mô hình Định danh (Identity Architecture)

### 2.1. Cấu trúc bảng `learner_profiles` (Đã phê duyệt)

```sql
-- ĐÃ PHÊ DUYỆT (2026-09-27) THEO QUYẾT ĐỊNH D-01 .. D-04 - SẴN SÀNG CHO MIGRATION SPRINT TIẾP THEO
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

- **Endpoint:** `GET /api/v1/public/career-roles`
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

### 3.3. Quản lý Vị trí Mục tiêu Cá nhân (Learner Target Roles)

- **Endpoint:** `GET /api/v1/learner/me/targets`, `PUT /api/v1/learner/me/targets`
- **Xác thực:** Bắt buộc (`Bearer token`) - áp dụng cho chính người dùng đang đăng nhập
- **Request Body (PUT):**
```json
{
  "targetRoleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
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

## 4. Bảng Quyết định Sản phẩm Đã Phê Duyệt (Approved Decisions)

| # | Quyết định Nghiệp vụ | Phương án Đã Phê Duyệt | Trạng thái |
| :--- | :--- | :--- | :--- |
| **D-01** | Quy trình Đăng ký (Self-signup) của người học tự do | Đăng ký bằng Email + Mật khẩu, bắt buộc xác thực (OTP/Link kích hoạt) qua email trước khi kích hoạt tài khoản. | **APPROVED** (2026-09-27) |
| **D-02** | Quan hệ giữa `CareerRoleTemplate` (chuẩn công khai) và `JobPosition` (vị trí doanh nghiệp) | `JobPosition` của doanh nghiệp có trường `career_role_template_id` (nullable) để liên kết với khung năng lực chuẩn công khai khi cần. | **APPROVED** (2026-09-27) |
| **D-03** | Phạm vi Public Catalog của Khóa học | Khóa học của doanh nghiệp luôn riêng tư (Private). Chỉ nội dung do Platform Admin tạo (`organization_id = NULL`, `is_public = true`) mới được xuất hiện trên Public Catalog. | **APPROVED** (2026-09-27) |
| **D-04** | Xử lý tài khoản khi Nhân viên nghỉ việc | Giữ tài khoản `User` với vai trò Người học tự do (`LEARNER`); bảo lưu chứng chỉ và tiến độ cá nhân, ngắt quyền truy cập toàn bộ tài nguyên nội bộ doanh nghiệp. | **APPROVED** (2026-09-27) |

---

## 5. Kết luận và Kế hoạch Tiếp nối

1. **Quyết định đã chốt:** Toàn bộ 4 câu hỏi nghiệp vụ nền tảng (D-01 đến D-04) đã được phê duyệt chính thức.
2. **Kế hoạch thực hiện:**
   - **Task 7 (P1):** Triển khai JobFamily & JobPosition CRUD với phạm vi tổ chức (`OrganizationId`), có trường `CareerRoleTemplateId` (nullable) sẵn sàng đón đầu kết nối danh mục công khai.
   - **Backlog sau 30/09 (Deferred):** Triển khai migration `AddPublicLearnerAndCatalogTables`, luồng gửi OTP kích hoạt email, và API quản lý CareerRoleTemplate / Public Course Catalog.
