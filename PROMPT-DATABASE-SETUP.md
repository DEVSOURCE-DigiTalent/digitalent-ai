# Prompt: Database Setup — EF Core Configurations, Migrations & Seed Data

> Copy và gửi prompt này cho AI để yêu cầu thực hiện database setup.
> Lưu ý: Đây là Phase tiếp theo sau khi đã hoàn thành Architecture Setup (PROMPT-SETUP-ARCHITECTURE.md)

---

## ✅ Những việc đã làm xong (Architecture Setup — branch `develop`)

### Repository & Git
- **Organization:** `DEVSOURCE-DigiTalent`
- **Repository:** `DEVSOURCE-DigiTalent/digitalent-ai` — public monorepo
- **Branch protection:** `main` và `develop` yêu cầu PR, 1 review, cấm force push
- **Remote origin:** `d:\digitalent-ai`
- **Branch hiện tại:** `develop` (đã merge PR #1 từ `chore/DT-000-setup-architecture`)

### File/Infrastructure đã tạo
| File | Mô tả |
|------|-------|
| `.gitignore` | Ignore .env, node_modules, bin/obj, ... |
| `.env.example` | Mẫu env với PostgreSQL, MinIO, JWT, Redis |
| `README.md` | Giới thiệu dự án, tech stack, hướng dẫn |
| `GIT-WORKFLOW-GUIDE.md` | Hướng dẫn git branch/commit/PR cho team |
| `.github/ISSUE_TEMPLATE/feature-issue.md` | Template issue |
| `.github/PULL_REQUEST_TEMPLATE.md` | Template PR |
| `.github/workflows/backend-ci.yml` | CI backend (.NET) |
| `.github/workflows/frontend-ci.yml` | CI frontend (React) |
| `docker/docker-compose.yml` | PostgreSQL, MinIO, Redis, Nginx, API |
| `docker/nginx/conf.d/default.conf` | Nginx config |
| `PROMPT-SETUP-ARCHITECTURE.md` | Prompt gốc |

### Backend ASP.NET Core (✅ Đã hoàn thành)
Cấu trúc solution: `backend/DigiTalent.slnx`

| Project | Vai trò |
|---------|---------|
| `DigiTalent.Api` | Controllers, Hubs, Middlewares, Filters, Program.cs |
| `DigiTalent.Application` | Use cases, DTOs, interfaces, validators |
| `DigiTalent.Domain` | **Entities (45+), Enums, Base classes** |
| `DigiTalent.Infrastructure` | **AppDbContext**, EF Core, MinIO, PDF, AI |
| `DigiTalent.Shared` | ApiResponse, Pagination, ErrorCodes, Security |

**Domain entities đã có (cần dùng cho database):**
- `Auth/User.cs` — User, Role, Permission, UserRole, RolePermission, RefreshToken
- `Organization/Organization.cs` — Organization, Department, JobPosition, Employee
- `Competency/Competency.cs` — CompetencyCategory, Competency, CompetencyLevel, PositionCompetencyRequirement, EmployeeCompetencyProfile, CompetencyEvidence
- `Learning/Learning.cs` — Course, CourseModule, Lesson, LearningMaterial, CourseCompetency, CourseAssignment, Enrollment, LessonProgress
- `Assessment/Assessment.cs` — QuestionBank, Question, QuestionOption, Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAnswer
- `Certificate/Certificate.cs` — CertificateTemplate, Certificate, CertificateVerificationLog
- `Task/PracticalTask.cs` — PracticalTask, TaskAssignment, TaskSubmission, TaskEvaluation
- `Intelligence/Intelligence.cs` — SkillGapResult, SkillGapItem, LearningRecommendation, TrainingRiskScore, ReadinessScore, AiExplanationLog
- `Shared/SharedEntities.cs` — FileObject, Notification, AuditLog, SystemSetting, ScoringConfig, ScoringConfigItem

**Base class:** `AuditableEntity` (Id, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy)
**Soft delete:** `SoftDeletableEntity` (kế thừa AuditableEntity + IsDeleted, DeletedAt, DeletedBy)
**Enums:** UserStatus, EmployeeStatus, PublishStatus, EnrollmentStatus, QuestionType, CertificateStatus, TaskAssignmentStatus, EvidenceType, RiskLevel, ReadinessLevel...

**NuGet packages đã cài:**
- Swashbuckle.AspNetCore, Microsoft.AspNetCore.Authentication.JwtBearer
- Npgsql.EntityFrameworkCore.PostgreSQL, Microsoft.EntityFrameworkCore.Tools
- Minio, QRCoder, BCrypt.Net-Next, Serilog.AspNetCore

### Frontend React (✅ Đã hoàn thành)
- Vite + React 19 + TypeScript + TailwindCSS v4
- Feature-based structure: `features/{module}/pages/`
- React Router + AuthGuard + MainLayout
- Login page, Dashboard page, 404 page
- API client (axios + auto-refresh token)
- React Query, TypeScript types matching backend

---

## 📋 Yêu cầu cần thực hiện — Database Setup

Tài liệu tham khảo chính:
- **docs/07_Database_Design_ERD_DigiTalent_AI/07_Database_Design_ERD_DigiTalent_AI.md** — Chi tiết entity, column, index, business rules
- **docs/09_RBAC_Permission_Matrix_DigiTalent_AI/09_RBAC_Permission_Matrix_DigiTalent_AI.md** — Seed data cho roles/permissions
- **docs/15_Security_Design_Document_DigiTalent_AI/15_Security_Design_Document_DigiTalent_AI.md**

### Phase DB-1: Entity Configurations (IEntityTypeConfiguration)

Tạo file config cho từng entity trong `backend/src/DigiTalent.Infrastructure/Persistence/Configurations/`:

1. **Schema: Auth & RBAC**
   - Cấu hình: Users, Roles, Permissions, UserRoles, RolePermissions, RefreshTokens
   - Map sang snake_case table names: `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `refresh_tokens`
   - Index: ux_users_email, ux_roles_code, ux_permissions_code

2. **Schema: Organization**
   - Cấu hình: Organizations, Departments, JobPositions, Employees
   - Index: ux_employees_org_code, ix_employees_department

3. **Schema: Competency**
   - Cấu hình: CompetencyCategories, Competencies, CompetencyLevels, PositionCompetencyRequirements, EmployeeCompetencyProfiles, CompetencyEvidences
   - Index: ux_competencies_category_code, ux_employee_competency

4. **Schema: Learning**
   - Cấu hình: Courses, CourseModules, Lessons, LearningMaterials, CourseCompetencies, CourseAssignments, Enrollments, LessonProgresses
   - Index: ux_courses_org_code, ux_enrollment_course_employee

5. **Schema: Assessment**
   - Cấu hình: QuestionBanks, Questions, QuestionOptions, Assessments, AssessmentQuestions, AssessmentAttempts, AssessmentAnswers
   - Index: ix_attempts_employee_assessment

6. **Schema: Certificate**
   - Cấu hình: CertificateTemplates, Certificates, CertificateVerificationLogs
   - Index: ux_certificates_code

7. **Schema: Task**
   - Cấu hình: PracticalTasks, TaskAssignments, TaskSubmissions, TaskEvaluations
   - Index: ix_task_assign_employee_status

8. **Schema: Intelligence**
   - Cấu hình: SkillGapResults, SkillGapItems, LearningRecommendations, TrainingRiskScores, ReadinessScores, AiExplanationLogs

9. **Schema: Shared**
   - Cấu hình: FileObjects, Notifications, AuditLogs, SystemSettings, ScoringConfigs, ScoringConfigItems
   - Index: ix_notifications_recipient_read, ix_audit_entity

Yêu cầu config:
- `ToTable("snake_case_table_name")`
- `HasKey(x => x.Id)`
- `Property(x => x.Name).HasMaxLength(255).IsRequired()`
- `HasIndex(x => x.Email).IsUnique()`
- `HasQueryFilter(x => !x.IsDeleted)` cho SoftDeletableEntity
- `HasOne(...).WithMany(...).HasForeignKey(...)` cho relationships
- `DeleteBehavior.Restrict` cho business relationships

### Phase DB-2: Migration cơ sở đầu tiên

1. Update `AppDbContext.OnModelCreating`:
   - Gọi `modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly)`

2. Tạo migration đầu tiên:
   ```bash
   cd backend
   dotnet ef migrations add InitialCreate -p src/DigiTalent.Infrastructure -s src/DigiTalent.Api
   ```

3. Tạo script SQL từ migration để review:
   ```bash
   dotnet ef migrations script -p src/DigiTalent.Infrastructure -s src/DigiTalent.Api -o migrations_initial.sql
   ```

### Phase DB-3: Seed Data

Tạo seed data trong `DigiTalent.Infrastructure/Persistence/Seed/`:

1. **Common/AppDbContextSeed.cs** — Class tổng điều phối seed

2. **SeedAuthData.cs** — Seed roles + permissions:
   - 6 roles: SYSTEM_ADMIN, HR_MANAGER, DEPT_MANAGER, TRAINER, EMPLOYEE, CERT_VERIFIER
   - ~60 permissions từ `PermissionConstants.cs`

3. **SeedOrganizationData.cs** — Seed 1 organization mẫu + departments + positions:
   - 1 Organization: "DEVSOURCE Corporation"
   - Departments: IT, HR, Marketing, Finance, Operations
   - Job positions: Software Engineer, HR Specialist, Marketing Executive, ...

4. **SeedCompetencyData.cs** — Seed competency framework mẫu:
   - Categories: AI_LITERACY, DATA_LITERACY, CYBERSECURITY, DIGITAL_COLLABORATION
   - Competency levels: Level 1-5
   - Sample competencies under each category

5. **SeedUserData.cs** — Seed users cho demo:
   - Admin account (admin@digitalent.dev / Admin@123)
   - HR account (hr@digitalent.dev / Hr@123)
   - Manager account (manager@digitalent.dev / Manager@123)
   - Trainer account (trainer@digitalent.dev / Trainer@123)
   - Employee account (employee@digitalent.dev / Employee@123)

### Phase DB-4: Apply Migration + Verify

1. Kiểm tra migration script an toàn
2. Apply migration vào local PostgreSQL (docker compose up)
3. Chạy seed data
4. Verify với API Health Check và Swagger

### Phase DB-5: Git Workflow

1. Tạo branch từ `develop`: `feature/DT-001-database-setup`
2. Commit theo phase (Configs → Migration → Seed)
3. Push, tạo PR, merge vào develop

---

## Cấu trúc thư mục dự kiến sau khi hoàn thành

```
backend/src/DigiTalent.Infrastructure/Persistence/
├── AppDbContext.cs                    # ✅ Đã có
├── Configurations/
│   ├── Auth/
│   │   ├── UserConfiguration.cs
│   │   ├── RoleConfiguration.cs
│   │   ├── PermissionConfiguration.cs
│   │   ├── UserRoleConfiguration.cs
│   │   ├── RolePermissionConfiguration.cs
│   │   └── RefreshTokenConfiguration.cs
│   ├── Organization/
│   │   ├── OrganizationConfiguration.cs
│   │   ├── DepartmentConfiguration.cs
│   │   ├── JobPositionConfiguration.cs
│   │   └── EmployeeConfiguration.cs
│   ├── Competency/
│   │   ├── CompetencyCategoryConfiguration.cs
│   │   ├── CompetencyConfiguration.cs
│   │   ├── CompetencyLevelConfiguration.cs
│   │   ├── PositionCompetencyRequirementConfiguration.cs
│   │   ├── EmployeeCompetencyProfileConfiguration.cs
│   │   └── CompetencyEvidenceConfiguration.cs
│   ├── Learning/
│   │   ├── CourseConfiguration.cs
│   │   ├── CourseModuleConfiguration.cs
│   │   ├── LessonConfiguration.cs
│   │   └── ...
│   ├── Assessment/
│   ├── Certificate/
│   ├── Task/
│   ├── Intelligence/
│   └── Shared/
├── Migrations/
│   ├── YYYYMMDD_HHMMSS_InitialCreate.cs
│   └── AppDbContextModelSnapshot.cs
├── Seed/
│   ├── AppDbContextSeed.cs
│   ├── SeedAuthData.cs
│   ├── SeedOrganizationData.cs
│   ├── SeedCompetencyData.cs
│   └── SeedUserData.cs
```

## Lưu ý kỹ thuật

- **Naming:** Table snake_case, column snake_case, FK `<entity>_id`
- **PK:** UUID cho tất cả entity tables
- **Audit:** `created_at`, `updated_at`, `created_by`, `updated_by`
- **Soft delete:** Chỉ cho phép soft delete, không hard delete business records
- **Enums:** Map C# enum → string/varchar trong DB (dùng `.HasConversion<string>()`)
- **Relationships:** Dùng `DeleteBehavior.Restrict` — tránh cascade delete vô tình
- **Seed passwords:** Dùng BCrypt để hash, không plain text
- **Migration:** Review migration script trước khi apply vào database thật
