# Prompt: Setup System Architecture cho DigiTalent AI

> Copy và gửi prompt này cho AI để yêu cầu thực hiện setup.

---

## ✅ Những việc đã làm xong

### 1. GitHub Setup
- **Organization:** `DEVSOURCE-DigiTalent` đã tạo
- **Tài khoản GitHub:** `linhtv1209-fudn` (đã login GitHub CLI)
- **Repository:** `DEVSOURCE-DigiTalent/digitalent-ai` — public monorepo
- **Branch protection:** `main` và `develop` đều yêu cầu PR, 1 review, cấm force push
- **Remote origin:** Đã config tại `d:\digitalent-ai`

### 2. Branch hiện tại
- **`main`** — production-ready code (đã push)
- **`develop`** — integration branch **(đang active)**
- Working directory: `D:\digitalent-ai`

### 3. File đã tạo

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
| `scripts/setup.ps1` | Script kiểm tra prerequisites |

### 4. Tài liệu dự án
- Toàn bộ 17 tài liệu đã copy vào `docs/`
- Folder gốc `doc_DigiTalentAI/` đã xóa khỏi git tracking

### 5. Tech stack đã xác định
- **Frontend:** ReactJS, TypeScript, TailwindCSS, ShadCN/UI
- **Backend:** ASP.NET Core / C# (.NET 8)
- **Database:** PostgreSQL
- **File Storage:** MinIO (S3-compatible)
- **Cache/Jobs:** Redis (optional)
- **Realtime:** SignalR
- **Deployment:** Docker, Docker Compose, Nginx
- **CI/CD:** GitHub Actions

---

## 📋 Yêu cầu cần thực hiện

Dựa vào tài liệu [docs/06_System_Architecture_Document_DigiTalent_AI](docs/06_System_Architecture_Document_DigiTalent_AI), hãy thực hiện các bước sau:

### Phase 1: Backend ASP.NET Core Skeleton

Tạo cấu trúc solution theo modular monolith:

```
backend/
├── DigiTalent.sln
├── src/
│   ├── DigiTalent.Api/
│   │   ├── Controllers/
│   │   ├── Hubs/
│   │   ├── Middlewares/
│   │   ├── Filters/
│   │   └── Program.cs
│   ├── DigiTalent.Application/
│   │   ├── Auth/
│   │   ├── Organization/
│   │   ├── Competency/
│   │   ├── Learning/
│   │   ├── Assessment/
│   │   ├── Certificate/
│   │   ├── Intelligence/
│   │   ├── Task/
│   │   ├── Evidence/
│   │   ├── Dashboard/
│   │   ├── Notification/
│   │   └── Common/
│   ├── DigiTalent.Domain/
│   │   ├── Entities/
│   │   ├── Enums/
│   │   ├── Policies/
│   │   ├── Events/
│   │   └── ValueObjects/
│   ├── DigiTalent.Infrastructure/
│   │   ├── Persistence/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Configurations/
│   │   │   └── Migrations/
│   │   ├── FileStorage/
│   │   ├── Cache/
│   │   ├── PdfQr/
│   │   ├── AiProviders/
│   │   └── Email/
│   └── DigiTalent.Shared/
│       ├── ApiResponse/
│       ├── Errors/
│       ├── Pagination/
│       ├── Security/
│       └── Constants/
├── tests/
│   ├── DigiTalent.UnitTests/
│   └── DigiTalent.IntegrationTests/
└── DigiTalent.sln
```

Yêu cầu:
1. Tạo solution + projects
2. Cài NuGet: Swashbuckle, JwtBearer, EF Core PostgreSQL, Minio, QRCoder
3. Config Program.cs: JWT, Swagger, CORS, EF Core, DI
4. appsettings.json từ .env.example
5. Health Check endpoints
6. ApiResponse<T> model

### Phase 2: Frontend React Skeleton

```
frontend/
├── src/
│   ├── app/ (router.tsx, providers.tsx)
│   ├── features/ (auth, admin, organization, competency, learning, assessment, certificate, intelligence, task, dashboard, notification)
│   ├── components/ (ui, layout, data-table, forms, feedback)
│   ├── services/ (api-client, auth.service, file.service)
│   ├── hooks/ (use-current-user, use-permission)
│   ├── lib/ (constants, permissions, formatters, validators)
│   ├── types/ (api, auth, common)
│   └── assets/
```

Yêu cầu:
1. Vite + React + TypeScript
2. Cài: tailwindcss, shadcn/ui, react-router-dom, @tanstack/react-query, axios
3. Route guard + API client + Layout mẫu

### Phase 3: Docker Compose + Nginx

Tạo docker-compose.yml với: postgres, minio, backend, frontend, nginx.
Cấu hình Nginx routing.

### Phase 4: Git Workflow

1. Branch: `chore/DT-000-setup-architecture` từ `develop`
2. Commit theo phase
3. Push, tạo PR, merge vào develop

---

## Lưu ý

- **.NET 8, C# 12**
- **Commit:** Conventional Commits
- **Không commit secrets**
