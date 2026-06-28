# Frontend Developer Guide — DigiTalent AI

> **Đọc file này trước khi viết dòng code đầu tiên.** Giúp cả team code consistent, tránh conflict, review nhanh.

## 1. Quickstart

```bash
cd frontend
npm install
cp .env.example .env          # Mỗi người tự copy, .env đã gitignored
npm run dev                    # http://localhost:5173
```

**Yêu cầu:** Node.js 20+, VS Code + Tailwind CSS IntelliSense extension.

---

## 2. Cấu trúc thư mục — NƠI ĐẶT FILE

```
frontend/src/
├── app/
│   ├── router.tsx          ← TẤT CẢ routes ở đây, 1 file duy nhất
│   └── providers.tsx        ← React Query + Router provider
├── components/
│   ├── guards/              ← AuthGuard, RequirePermission, RequireRole
│   ├── layout/              ← MainLayout, RoleSidebar, Topbar
│   └── shared/              ← DataTable, PageHeader, StatusBadge, EmptyState...
├── features/<module>/pages/ ← TRANG — mỗi page 1 file .tsx
├── hooks/                   ← React Query hooks + Zustand stores
├── lib/                     ← Constants, sidebar config, utils (NO React)
├── services/                ← API calls (axios, raw promises)
├── types/                   ← Shared TypeScript interfaces
├── App.tsx
├── main.tsx
└── index.css
```

**QUY TẮC VÀNG:**

| Nếu bạn muốn... | Đặt vào đây | Ví dụ |
|---|---|---|
| Tạo trang mới | `features/<module>/pages/XPage.tsx` | `features/course/pages/CourseDetailPage.tsx` |
| Gọi API | `services/<module>.service.ts` | `services/course.service.ts` |
| React Query hook | `hooks/use-<module>.ts` | `hooks/use-courses.ts` |
| Component dùng chung | `components/shared/X.tsx` | `components/shared/FileUpload.tsx` |
| Route mới | Sửa `app/router.tsx` — THÊM 1 DÒNG | Bọc trong RequirePermission |
| Constant / config | `lib/constants.ts` hoặc file riêng `lib/x-config.ts` | |
| Type / interface | `types/` nếu dùng nhiều nơi, nếu không để trong file dùng | |

**TUYỆT ĐỐI KHÔNG:**
- Tự tạo file `router.tsx` thứ 2
- Tự tạo service gọi API bằng `fetch()` — phải dùng `apiClient` từ `services/api-client.ts`
- Import thẳng axios khi đã có `apiClient` và service
- Đặt component page vào `components/`

---

## 3. Pattern bắt buộc — LÀM THEO MẪU

### 3.1 Service (gọi API)

```typescript
// services/course.service.ts
import apiClient from './api-client';       // ← LUÔN dùng apiClient
import type { ApiResponse, PagedList, PaginationRequest } from '../types/api';

export interface CourseDto {                // ← Định nghĩa DTO ở đây hoặc types/
  id: string;
  title: string;
  status: string;
}

export const courseService = {              // ← Export object, KHÔNG export class
  getList: (params: PaginationRequest) =>
    apiClient.get<ApiResponse<PagedList<CourseDto>>>('/courses', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<CourseDto>>(`/courses/${id}`),

  create: (data: CreateCourseRequest) =>
    apiClient.post<ApiResponse<CourseDto>>('/courses', data),
};
```

### 3.2 React Query Hook

```typescript
// hooks/use-courses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService, type CourseDto } from '../services/course.service';
import type { PaginationRequest } from '../types/api';

export function useCourses(params: PaginationRequest) {
  return useQuery({
    queryKey: ['courses', params],                            // ← Query key chuẩn
    queryFn: () => courseService.getList(params).then(r => r.data.data!),
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourseRequest) => courseService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }), // ← Invalidate cache
  });
}
```

### 3.3 Trang với DataTable

```typescript
// features/course/pages/CourseListPage.tsx
import { useState } from 'react';
import { useCourses } from '@/hooks/use-courses';
import { DataTable, type Column } from '@/components/shared';
import { PageHeader } from '@/components/shared';
import type { CourseDto } from '@/services/course.service';

const columns: Column<CourseDto>[] = [
  { key: 'title', header: 'Title', cell: (r) => r.title, sortable: true },
  { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
];

export function CourseListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCourses({ pageNumber: page, pageSize: 20 });

  return (
    <div>
      <PageHeader title="Courses" />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        pageInfo={{
          page: data?.pageNumber ?? 1,
          pageSize: data?.pageSize ?? 20,
          total: data?.totalItems ?? 0,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
```

### 3.4 Thêm route mới

Mở `app/router.tsx`, thêm **1 dòng** vào `children` array:

```typescript
// Thêm import ở đầu file
import { CourseDetailPage } from '../features/course/pages/CourseDetailPage';

// Thêm route trong children array, kèm guard
{ path: 'courses/:id', element: <RequirePermission permission="course.read_catalog"><CourseDetailPage /></RequirePermission> },
```

**Quy tắc chọn guard:**

| Loại trang | Guard |
|---|---|
| Chỉ Admin được vào | `<RequireRole roles={['SYSTEM_ADMIN']}>` |
| Cần quyền cụ thể | `<RequirePermission permission="<key>">` (xem danh sách key ở §4) |
| Public (không cần login) | Không bọc guard, cho ra ngoài AuthGuard |
| Own-data (my-*) | Không cần guard thêm — authenticated là đủ |

---

## 4. Permission System

### Danh sách permission keys

Tất cả keys trong `hooks/use-permission.ts` — import `PERMISSIONS` để dùng:

```typescript
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';

function MyComponent() {
  const { can, is } = usePermission();

  // Check 1 permission
  if (can(PERMISSIONS.COURSE_CREATE)) { /* show create button */ }

  // Check role
  if (is('HR_MANAGER')) { /* HR-only action */ }
}
```

**Quan trọng:** SYSTEM_ADMIN luôn pass tất cả `can()` checks. Đây là behavior đúng theo RBAC doc.

### Route guard mapping nhanh

| Route path | Guard |
|---|---|
| `/admin/*` | SYSTEM_ADMIN (trừ audit-log: SYSTEM_ADMIN, HR_MANAGER) |
| `/hr/*` | SYSTEM_ADMIN, HR_MANAGER |
| `/organization/*` | Có permission `department.read` / `job_position.read` / `employee.read` |
| `/courses` | `course.read_catalog` |
| `/trainer/*` | TRAINER hoặc HR_MANAGER |
| `/my-*` | Authenticated (any role) |
| `/verify` | Public — không guard |

---

## 5. Quy tắc tránh conflict — AI LÀM GÌ

### Mỗi module = 1 người làm

| Module | Người phụ trách | Services | Hooks | Pages |
|---|---|---|---|---|
| Auth (done) | — | `auth.service.ts` | `use-auth.ts` | `LoginPage.tsx` |
| Admin | Người A | `user.service.ts` | `use-users.ts` | `admin/pages/*` |
| Organization | Người B | `department.service.ts`, `employee.service.ts` | `use-departments.ts`, `use-employees.ts` | `organization/pages/*` |
| Competency | Người C | **CẦN TẠO** `competency.service.ts` | **CẦN TẠO** `use-competencies.ts` | `competency/pages/*` |
| Courses | Người D | **CẦN TẠO** `course.service.ts` | **CẦN TẠO** `use-courses.ts` | `course/pages/*` |
| Assessment | Người C/D | **CẦN TẠO** `assessment.service.ts` | **CẦN TẠO** `use-assessments.ts` | `assessment/pages/*` |
| Certificate | Người E | **CẦN TẠO** | **CẦN TẠO** | `certificate/pages/*` |
| Task | Người E | **CẦN TẠO** | **CẦN TẠO** | `task/pages/*` |
| Intelligence | Người A/B | **CẦN TẠO** | **CẦN TẠO** | `intelligence/pages/*` |

### File chung — CHỈ 1 người sửa 1 lúc

| File | Ai sửa | Khi nào |
|---|---|---|
| `app/router.tsx` | **1 người làm trưởng nhóm** | Tất cả thành viên báo route cần thêm → 1 người update |
| `hooks/use-permission.ts` | **DONE** — không sửa thêm trừ khi backend thêm permission mới |
| `lib/constants.ts` | **DONE** — không sửa thêm trừ khi thêm role/status mới |
| `components/shared/*` | **Tạo component mới** thì được, **sửa component cũ** thì báo team |
| `services/api-client.ts` | **DONE** — không sửa |
| `hooks/use-current-user.ts` | **DONE** — không sửa |

### Quy trình thêm route mới

1. Bạn tạo page trong `features/<module>/pages/`
2. Bạn báo trưởng nhóm: "Tôi cần route `/courses/:id` với guard `course.read_catalog`"
3. Trưởng nhóm thêm 1 dòng vào `router.tsx` và push
4. Bạn pull về

**HOẶC** cả team thống nhất: ai thêm route thì pull router.tsx mới nhất → thêm → push ngay (tránh 2 người cùng sửa).

---

## 6. Git workflow

```bash
# Mỗi ngày bắt đầu
git checkout main
git pull

# Tạo branch mới cho task của bạn
git checkout -b feature/DT-XXX-ten-tinh-nang

# Code... rồi commit thường xuyên
git add <files>
git commit -m "feat(module): mô tả ngắn"

# Push và tạo PR
git push -u origin feature/DT-XXX-ten-tinh-nang
# → Vào GitHub tạo PR vào main
```

**Quy tắc commit message:** Theo convention từ Coding Convention doc:
```
feat(competency): add CompetencyFrameworkPage with DataTable
fix(course): handle empty course list
chore: update shared components
```

**Trước khi push:** Chạy `npx tsc --noEmit` — đảm bảo không lỗi TypeScript.

---

## 7. Công cụ có sẵn — ĐỪNG TỰ LÀM LẠI

| Cần gì | Dùng cái này | File |
|---|---|---|
| Gọi API | `apiClient` (axios + JWT auto-refresh) | `services/api-client.ts` |
| Auth state | `useCurrentUser` (Zustand) | `hooks/use-current-user.ts` |
| Permission check | `usePermission()` → `can()`, `is()` | `hooks/use-permission.ts` |
| Data table + phân trang | `<DataTable>` | `components/shared/DataTable.tsx` |
| Loading skeleton | `isLoading` prop trên DataTable | Tự động |
| Trạng thái trống | `<EmptyState>` | `components/shared/EmptyState.tsx` |
| Page header | `<PageHeader>` | `components/shared/PageHeader.tsx` |
| Badge trạng thái | `<StatusBadge>` | `components/shared/StatusBadge.tsx` |
| Confirm dialog | `<ConfirmActionDialog>` | `components/shared/ConfirmActionDialog.tsx` |
| Score card | `<ScoreCard>` | `components/shared/ScoreCard.tsx` |
| Toast notification | `toast()` từ `sonner` | Package `sonner` |
| Form validation | `react-hook-form` + `zod` (the pair này có sẵn) | Package |
| Sidebar config | `sidebarGroups` (filter theo role) | `lib/sidebar-config.ts` |
| Route path helper | `getDefaultPath(roles)` | `lib/sidebar-config.ts` |
| Tailwind utility | `cn()` (merge className) | `lib/utils.ts` |

---

## 8. Checklist trước khi push

- [ ] `npx tsc --noEmit` — không lỗi TypeScript
- [ ] Đã dùng `apiClient` (không dùng `fetch` hay `axios` trực tiếp)
- [ ] Route mới có `RequirePermission` hoặc `RequireRole` phù hợp
- [ ] File đặt đúng thư mục (page → `features/`, service → `services/`, hook → `hooks/`)
- [ ] Import dùng alias `@/` cho relative path xa (>= 3 levels)
- [ ] Không sửa file của người khác mà chưa báo
- [ ] Đã test thủ công ít nhất 1 lần (nếu backend sẵn sàng)

---

## 9. Các câu hỏi thường gặp

**Q: Backend chưa có API, tôi test frontend thế nào?**
A: Service trả về promise — bạn có thể mock `apiClient` tạm hoặc dùng backend seed data. Quan trọng là component render đúng với mọi trạng thái (loading, empty, error, data).

**Q: Tôi cần thêm permission key mới thì làm sao?**
A: Permission keys do backend định nghĩa trong `PermissionConstants.cs`. Nếu backend thêm permission mới, cập nhật `PERMISSIONS` object trong `hooks/use-permission.ts`.

**Q: Tôi muốn dùng React Context thay Zustand?**
A: KHÔNG. `useCurrentUser` đã dùng Zustand. Đừng thêm pattern state management khác. Tất cả data fetching khác dùng React Query.

**Q: Tôi nên đặt form validation ở đâu?**
A: Zod schema trong cùng file page hoặc `features/<module>/schemas.ts`. Dùng `react-hook-form` với `@hookform/resolvers/zod`.

---

## 10. Module cần làm tiếp — Thứ tự ưu tiên

| # | Module | Mức độ | Ghi chú |
|---|---|---|---|
| 1 | `course.service.ts` + `use-courses.ts` | 🔴 Cao | Courses CRUD — nền tảng cho learning |
| 2 | `competency.service.ts` + hook | 🔴 Cao | Competency framework |
| 3 | `assessment.service.ts` + hook | 🟡 Trung bình | Question bank + assessments |
| 4 | `certificate.service.ts` + hook | 🟡 Trung bình | Certificate management |
| 5 | `task.service.ts` + hook | 🟢 Thấp | WMS-lite tasks |
| 6 | Form pattern mẫu (create/edit form) | 🔴 Cao | **1 người làm → cả team dùng** |
| 7 | Notification + SignalR | 🟢 Thấp | Cần backend SignalR hub sẵn sàng |
