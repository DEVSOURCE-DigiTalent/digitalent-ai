# DigiTalent AI

**Nền tảng đào tạo, đánh giá năng lực số và cấp chứng chỉ nội bộ cho nhân viên doanh nghiệp**

_Digital Competency Training, Internal Certification and Work-Based Assessment Platform_

---

## 📋 Giới thiệu

DigiTalent AI là nền tảng web dành cho doanh nghiệp nhằm quản lý đào tạo nội bộ, đánh giá năng lực số, cấp chứng chỉ nội bộ có thể xác minh và giao task thực hành sau đào tạo. Hệ thống quản lý vòng đời phát triển năng lực của nhân viên từ yêu cầu năng lực theo vị trí công việc đến bằng chứng năng lực thực tế.

## 🎯 Tính năng chính (MVP)

| Module                                 | Mô tả                                                      |
| -------------------------------------- | ---------------------------------------------------------- |
| **Authentication & Authorization**     | JWT, refresh token, RBAC, role-based navigation            |
| **Organization & Employee Management** | Department, job position, employee profile                 |
| **Competency Framework**               | Competency category, level, position requirement           |
| **Course & Learning Management**       | Course, lesson, material, progress tracking                |
| **Assessment & Question Bank**         | Quiz, final assessment, scoring, pass/fail rule            |
| **Capability Intelligence Engine**     | Skill gap, recommendation, training risk, readiness score  |
| **Certificate Management**             | Certificate generation, QR verification, expiry/revocation |
| **WMS-lite Task Management**           | Task assignment, submission, evaluation, evidence          |
| **Dashboard & Analytics**              | Role-based dashboards (HR, Manager, Trainer, Employee)     |
| **Notification & Reminder**            | SignalR/in-app notifications                               |

## 🛠️ Công nghệ

| Layer                       | Technology                                  |
| --------------------------- | ------------------------------------------- |
| **Frontend**                | ReactJS, TypeScript, TailwindCSS, ShadCN/UI |
| **Backend**                 | ASP.NET Core / C#                           |
| **Database**                | PostgreSQL                                  |
| **File Storage**            | MinIO (S3-compatible)                       |
| **Realtime**                | SignalR                                     |
| **Cache / Background Jobs** | Redis (optional)                            |
| **API Documentation**       | Swagger / OpenAPI                           |
| **Deployment**              | Docker, Docker Compose, Nginx               |
| **CI/CD**                   | GitHub Actions                              |

## 📁 Cấu trúc thư mục

```
digitalent-ai/
├── backend/               # ASP.NET Core solution
├── frontend/              # React + TypeScript + Tailwind + ShadCN/UI
├── infra/                 # Docker, Nginx, deployment scripts
│   ├── docker/
│   └── nginx/
├── docs/                  # Project documents, diagrams
├── scripts/               # Helper scripts, local setup
├── .github/               # Workflows, PR/issue templates
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

## 🚀 Bắt đầu nhanh

### Yêu cầu

- [.NET SDK 8.0+](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker & Docker Compose](https://docker.com/)

### Clone & Setup

```bash
git clone https://github.com/DEVSOURCE-DigiTalent/digitalent-ai.git
cd digitalent-ai
```

### Môi trường

```bash
cp .env.example .env
```

## 🌿 Git Branch Strategy

| Branch      | Purpose                            |
| ----------- | ---------------------------------- |
| `main`      | Production-ready / demo-ready code |
| `develop`   | Integration branch                 |
| `feature/*` | New features                       |
| `fix/*`     | Bug fixes                          |
| `release/*` | Release stabilization              |
| `hotfix/*`  | Emergency fixes                    |

## 📄 Tài liệu

Tài liệu dự án được lưu tại thư mục `docs/`.

---

**DigiTalent AI** © 2026 DEVSOURCE

# ── 1. Lấy code ────────────────────────────────────────────

git clone https://github.com/DEVSOURCE-DigiTalent/digitalent-ai.git
cd digitalent-ai
git checkout develop2
git pull

# ── 2. Cài công cụ (chỉ 1 lần) ─────────────────────────────

cd backend
dotnet tool restore

# ── 3. Khai báo kết nối database (chỉ 1 lần) ───────────────

cd src/DigiTalent.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=<YOUR_POSTGRES_HOST>;Database=<YOUR_DB>;Username=<YOUR_USER>;Password=<YOUR_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true"

# ── 4. Chạy API ────────────────────────────────────────────

dotnet run
