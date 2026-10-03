# Prompt giao việc: Thiết kế lại khung Enterprise (Sidebar · Topbar · Content) — tối mặc định

> Dán toàn bộ nội dung dưới đây cho AI agent (Claude Code hoặc tương đương) chạy trong repo `D:\digitalent-ai`.

---

## Vai trò

Bạn là kỹ sư frontend cấp cao kiêm product designer, chuyên giao diện dashboard B2B (SaaS quản trị nhân sự / đào tạo). Nhiệm vụ: thiết kế lại **khung ứng dụng** của cổng Enterprise (`/enterprise/*`, dùng chung với `/platform/*`) gồm sidebar, topbar và khung nội dung, theo phong cách **"Mực & Giấy"**, **theme tối là mặc định**, có nút chuyển sang sáng. Bạn tự thực hiện đến khi xong, kiểm tra trên trình duyệt và báo cáo kết quả.

## Đọc trước khi làm (theo thứ tự)

1. `CLAUDE.md` — quy ước dự án (bắt buộc tuân theo: tiếng Việt cho UI, TanStack Query + Zustand, `apiClient`, sitemap-driven routing, quy tắc mock).
2. `docs/specs/2026-10-02-enterprise-shell-redesign-plan.md` — **plan chính**: hiện trạng H1–H7, quyết định E1–E6, token §4.1, đặc tả §5, giai đoạn §6, nghiệm thu §7. Prompt này tóm tắt và bổ sung chuẩn dashboard; khi mâu thuẫn, **plan thắng**.
3. Code hiện tại: `frontend/src/components/layout/{MainLayout,RoleSidebar,Topbar,NotificationPopover,UserAvatarMenu}.tsx`, `frontend/src/app/layouts/{EnterpriseLayout,PlatformLayout}.tsx`, `frontend/src/lib/sidebars/*`, `frontend/src/lib/screens/*`, `frontend/src/lib/portals.ts`, `frontend/src/components/shared/*`, `frontend/src/index.css`.
4. Tham chiếu cách làm theme đã có ở khu Cá nhân: `frontend/src/features/learner/theme/*` (token `pt-*`, store Zustand nhớ theme), `frontend/src/features/learner/components/ui.tsx`. Tái dùng **ý tưởng**, không import chéo vào Enterprise.

## Ràng buộc

- **Không commit, không push, không tạo nhánh.** Working tree có nhiều thay đổi chưa commit của người dùng.
- **Không sửa** các file chưa track của người dùng trong `frontend/src/features/employee/*` và `frontend/src/features/tasks/pages/EvaluateEvidencePage.tsx`. Chúng đang làm `tsc -b` báo lỗi sẵn — bỏ qua các lỗi đó khi kiểm tra, chỉ đảm bảo không có lỗi mới.
- **Không đổi** route, sitemap (`lib/screens/*`), cấu trúc menu theo vai trò (`lib/sidebars/*` — chỉ được thêm field hiển thị nếu cần), quyền, entitlement, mock data.
- Giữ `data-testid` đang có: `enterprise-layout`, `sidebar-backdrop`, các testid trang. Test cũ phải giữ nguyên ý nghĩa; chỉ cập nhật chuỗi khi bạn đổi chữ.
- Không thêm thư viện UI mới. Có sẵn: React 19, Tailwind 4, lucide-react, zustand, sonner, react-router.
- Toàn bộ chữ trên giao diện bằng **tiếng Việt**, câu thường (không VIẾT HOA cả dòng, trừ nhãn rất ngắn).
- Hàm < 50 dòng, file < 400 dòng (tối đa 800); tách component nhỏ. Không `console.log`.

## Định hướng thiết kế

**Phong cách "Mực & Giấy":** gần với landing (`/business`: kem trên đen, Be Vietnam Pro, serif nghiêng Newsreader điểm xuyết) nhưng đặc hơn, tối ưu cho làm việc nhiều giờ với bảng và số liệu. Tham chiếu tinh thần: Linear, Vercel dashboard, Stripe dashboard, Carbon UI shell. **Không** làm kiểu template (khối xanh lớn, gradient, bóng đổ dày, thẻ đồng loạt).

### Token (tóm tắt plan §4.1, khai báo `--ent-*` + `@theme inline` → utility `bg-ent-card`, `text-ent-fg-2`…)

| Token | Tối (mặc định) | Sáng |
|---|---|---|
| bg | `#111110` | `#F6F5F1` |
| sidebar (luôn tối) | `#0A0A09` | `#12120F` |
| card / raised | `#181816` / `#1F1F1C` | `#FFFFFF` / `#FBFAF7` |
| line | `#2A2924` | `#E6E3DA` |
| fg / fg-2 / fg-3 | `#E7E5DA` / `#B4B2A6` / `#8E8C80` | `#1C1B16` / `#57554C` / `#6F6D63` |
| primary (nút chính) / on-primary | `#E7E5DA` / `#12120F` | `#1C1B16` / `#F6F5F1` |
| accent / accent-soft | `#7C9BE6` / `rgba(124,155,230,.14)` | `#2D5BD0` / `#EAF0FD` |
| ok · warn · bad | `#7FC48C` · `#E3B65A` · `#EE8E80` (nền nhạt alpha .14) | `#2D7A3C` · `#8A5C00` · `#B13A2C` (nền `#EAF4EC` · `#FBF2DE` · `#FBEAE7`) |
| level 1→3 | `#3A4A72` · `#5C7BCB` · `#9DB6F0` | `#C9D6F5` · `#7C9BE6` · `#2D5BD0` |

Quy tắc màu: **một** màu nhấn (accent) cho liên kết, mục đang chọn, focus, chuỗi dữ liệu chính. Xanh lá / vàng / đỏ **chỉ** cho trạng thái. Không truyền nghĩa chỉ bằng màu — luôn kèm chữ hoặc biểu tượng.

### Chuẩn dashboard áp dụng cho khung và component dùng chung

1. **Lưới & khoảng cách:** thang 4px (4, 8, 12, 16, 24, 32, 48). Lưới 12 cột, gutter 16px (mobile) / 24px (≥1024). Lề trang 16 / 24 / 32px.
2. **Chữ:** Be Vietnam Pro cho toàn Enterprise/Platform. Thang: 12 (chú thích) · 13 (bảng, nhãn) · 14 (thân) · 16 (tiêu đề thẻ) · 20 (tiêu đề phần) · 24 semibold (tiêu đề trang) · 28–32 light (số KPI). Số luôn `tabular-nums`. Newsreader nghiêng chỉ cho lời chào ở trang Tổng quan và trạng thái rỗng.
3. **Phân tầng:** tối = nền < card < raised, phân bằng độ sáng + viền 1px `line`, không bóng đổ thẻ; chỉ menu nổi / modal có bóng. Bo góc: 8px (nút, ô nhập), 12px (thẻ), 16px (modal).
4. **Thẻ KPI:** nhãn 12px `fg-3` → số 28px light → delta có mũi tên + chữ ("▲ 4,2% so với tháng trước", màu ok/bad) → tối đa một sparkline. 3–4 thẻ một hàng ở ≥1280, 2 ở tablet, 1 ở mobile.
5. **Bảng dữ liệu:** đầu bảng dính tại `top: var(--shell-top)`, nền `raised`; hàng 44px (tùy chọn gọn 36px); hover hàng `raised`; số canh phải; huy hiệu `whitespace-nowrap`; cột đầu là thực thể (avatar + tên + mã phụ); cuộn ngang trong khung bảng khi thiếu chỗ, cột đầu dính trái; phân trang dưới cùng "1–15 / 15".
6. **Thanh lọc:** một hàng phía trên bảng: ô tìm kiếm (trái, rộng nhất) + các select lọc + "Xóa lọc" khi có lọc; trên mobile thu vào nút "Bộ lọc" mở Drawer.
7. **Biểu đồ:** nền trong suốt, lưới ngang mảnh màu `line`, không viền khung; chuỗi chính = accent, so sánh = `fg-3`; trục 12px `fg-3`; chú giải ngắn phía trên; tooltip nền `raised`. Thang mức năng lực dùng `level-1..3`.
8. **Trạng thái:** mỗi vùng dữ liệu có đủ loading (skeleton đúng hình khối, không spinner giữa trang), rỗng (tiêu đề mời hành động + 1 câu + nút), lỗi (thông điệp server + "Thử lại").
9. **Tương tác:** hover 150ms; focus ring 2px accent offset 2px trên mọi phần tử bấm được; vùng bấm ≥ 32px (desktop) / 44px (touch); tôn trọng `prefers-reduced-motion`.
10. **Tương phản:** chữ thường ≥ 4.5:1, chữ lớn và đường biểu đồ ≥ 3:1, kiểm cả hai theme.

## Đặc tả khung (tóm tắt plan §5)

- **Cuộn theo tài liệu** (plan E1): sidebar `position: fixed`, cao 100dvh, menu cuộn riêng; topbar `position: sticky; top: 0`; nội dung cuộn bằng thanh cuộn trình duyệt. **Không** dùng khung `h-screen` + `<main overflow-auto>`. Sửa dứt điểm lỗi H1 (topbar trôi, sidebar dài theo trang).
- **Biến CSS shell:** `--sidebar-w` (0 / 64 / 248px), `--topbar-h` (56px), `--banner-h` (0 / 36px), `--shell-top`.
- **Theo bề rộng:** < 768 drawer 288px (lớp phủ, khóa cuộn nền, giữ focus bằng `hooks/use-dialog-focus.ts`, Escape đóng, đóng khi đổi trang); 768–1279 rail 64px mặc định; ≥ 1280 mở 248px mặc định. Lựa chọn của người dùng nhớ ở `dt-sidebar`. Phím tắt `Ctrl+B`.
- **Sidebar:** khối tổ chức (tên đầy đủ, không cắt chữ + nhãn gói) → menu (nhóm chữ thường nhỏ, nhóm chứa trang hiện tại tự mở, trạng thái nhóm được nhớ, mục khóa theo gói có khóa + tooltip "Có trong gói …", mục đang chọn: nền `sidebar-active` + vạch trái 2px accent) → chân (thanh ghế "14/100 ghế" cho Owner, Trợ giúp, Thu gọn). Rail: chỉ biểu tượng + tooltip khi hover/focus. Bỏ khối tên người dùng ở chân. Gộp còn **một** nhánh render (bỏ `portal.sidebarGroups`).
- **Topbar 56px:** trái = nút menu (mobile) + breadcrumb sinh từ sitemap (nhóm sidebar / màn hình / tên bản ghi qua context); phải = ô tìm kiếm mở command palette `Ctrl+K` (tìm các màn trong sitemap người dùng có quyền), nút Tạo nhanh (+) theo quyền, chuông thông báo, avatar. Nền `--ent-topbar` + `backdrop-blur`, viền dưới chỉ hiện khi đã cuộn. Banner hết hạn gói dính ngay dưới topbar.
- **Theme:** store Zustand `use-enterprise-theme` (mặc định `dark`, key `dt-enterprise-theme`, try/catch quanh localStorage). Khi layout Enterprise/Platform mount: thêm class `ent-theme` + `data-theme` lên `<html>`, đặt `color-scheme`; gỡ khi unmount. Nút chuyển theme nằm trong menu avatar và có thể ở topbar. Toaster `sonner` nhận theme tương ứng.
- **Lớp tương thích tối (plan GĐ 2b):** `styles/enterprise-dark-compat.css` gán lại các biến màu Tailwind (`--color-white`, thang `slate`, `gray`, `primary`, `blue`, `emerald`, `red`, `amber`, `rose`, `purple`, `indigo`, `sky`, `teal`, `success`, `warning`, `danger`) bằng thang đảo đã chỉnh cho nền tối, **chỉ** trong `html.ent-theme[data-theme='dark']`. Không đổi `--color-black`. Mục tiêu: các trang chưa chuyển sang token vẫn đọc được ngay ở theme tối.
- **Khung nội dung:** `PageContainer` (`narrow` 768 · `default` 1200 · `wide` 1440 · `full`); `PageHeader` v2 (tiêu đề 24px semibold, mô tả, cụm thao tác, hàng tab tùy chọn; breadcrumb đã lên topbar); `FocusLayout` (không sidebar, topbar rút gọn) cho làm bài đánh giá, xem bài học, wizard thiết lập; thanh thao tác dính đáy cho trang chỉnh sửa dài.

## Thứ tự thực hiện

Làm tuần tự, mỗi giai đoạn chạy test liên quan rồi mới sang giai đoạn sau.

1. **GĐ 1 — Khung & cuộn:** viết lại `MainLayout`, biến CSS shell, banner vào shell, store sidebar, skip link "Bỏ qua đến nội dung". Kiểm: cuộn trang Thành viên, topbar giữ `top = 0`.
2. **GĐ 2 — Token & theme:** `--ent-*` hai bộ giá trị, `@theme inline`, store theme, gắn lên `<html>`, font Be Vietnam Pro; chuyển `components/shared/*` (PageHeader, DataTable, StatusBadge, EmptyState, Modal, Drawer, Tabs, ScoreCard, LevelBadge, ConfirmActionDialog, WizardShell) sang token.
3. **GĐ 2b — Lớp tương thích tối** như trên; chụp kiểm 10 trang: Tổng quan Owner, Thành viên, Phòng ban, Vị trí & Cấp bậc, Khung năng lực, Yêu cầu theo vị trí, Khoảng trống năng lực, Đợt đào tạo, Kết quả đánh giá, Gói dịch vụ. Sửa thang màu đến khi không còn thẻ trắng / chữ tối trên nền tối.
4. **GĐ 3 — Sidebar** theo đặc tả; tách `components/layout/sidebar/{SidebarNav,SidebarItem,SidebarOrgBlock,SidebarFooter}.tsx`.
5. **GĐ 4 — Topbar:** `lib/breadcrumbs.ts` (hàm thuần, có test), `CommandPalette.tsx` (lọc theo quyền, điều hướng bằng phím ↑ ↓ Enter, Escape đóng), menu Tạo nhanh, restyle thông báo / avatar.
6. **GĐ 5 — Khung nội dung:** `PageContainer`, `PageHeader` v2, `DataTable` (đầu bảng dính, nowrap, cột đầu dính), `FocusLayout` cho Assessment Attempt / Lesson Viewer / Setup wizard. Áp vào **2 trang mẫu**: Tổng quan Owner (OW-01: lời chào, hàng thẻ KPI, 1 biểu đồ, danh sách việc cần làm theo chuẩn dashboard ở trên) và Thành viên (OW-02: `width="wide"`, thanh lọc, bảng chuẩn). Không viết lại logic dữ liệu, chỉ trình bày.
7. **GĐ 6 — Kiểm tra & tài liệu:** xem mục dưới; cập nhật `CLAUDE.md` (mục Frontend: khung Enterprise, token `ent-*`, lớp tương thích) và `frontend/DEVELOPER_GUIDE.md`; ghi tiến độ vào cuối plan.

## Kiểm tra bắt buộc

- `cd frontend && npx vitest run` — toàn bộ pass. Viết test mới cho: store sidebar & theme (mặc định, nhớ lựa chọn, storage bị chặn), `buildBreadcrumbs`, command palette lọc theo quyền, drawer (focus trap, Escape trả focus), `aria-current`, mục khóa theo gói, gắn/gỡ class `ent-theme` trên `<html>`.
- `npx tsc -b` — không có lỗi mới (bỏ qua lỗi sẵn có ở file của người dùng nêu trên). `npx oxlint src` — không cảnh báo mới ở file bạn sửa.
- `VITE_USE_MOCK=false npx vite build --outDir <thư mục tạm>` rồi grep `mock-token` trong output: không được có.
- **Trình duyệt** (dev server `npm run dev`, `frontend/.env` có `VITE_USE_MOCK=true`): đăng nhập `/business/login` bằng `owner@`, `manager@`, `employee@digitalent.demo` và `platform@digitalent.demo` (mật khẩu demo `Admin@1234`). Ở mỗi tài khoản, kiểm tra 5 bề rộng 375 / 768 / 1024 / 1280 / 1440, cả theme tối và sáng: cuộn trang dài, thu gọn/mở sidebar, mở drawer mobile, `Ctrl+K`, `Ctrl+B`, mở một Modal và một Drawer, console không lỗi. Đối chiếu từng tiêu chí ở plan §7.

## Báo cáo khi xong

Trả lời bằng tiếng Việt, ngắn gọn:
1. Đã làm gì theo từng giai đoạn, file chính (dạng link markdown).
2. Kết quả kiểm tra: số test pass, tsc/lint/build, ảnh chụp trước–sau Thành viên và Tổng quan ở theme tối và sáng (1280px) và mobile (375px).
3. Tiêu chí nào ở plan §7 chưa đạt và vì sao.
4. Những trang cũ còn hiển thị lệch ở theme tối (cần chuyển sang token ở đợt sau).
5. Quyết định bạn tự đưa ra khi plan không nói rõ.

Nếu gặp điều plan không trả lời được và ảnh hưởng lớn (đổi cấu trúc menu, đổi route, xóa tính năng), dừng và hỏi; các chi tiết nhỏ thì tự quyết theo tinh thần "Mực & Giấy" và ghi lại trong báo cáo.
