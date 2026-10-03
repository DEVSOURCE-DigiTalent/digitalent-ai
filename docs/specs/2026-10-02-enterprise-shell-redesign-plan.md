# Kế hoạch thiết kế lại khung giao diện Enterprise (Sidebar · Topbar · Content)

- **Ngày lập:** 2026-10-02
- **Phạm vi:** khung ứng dụng (application shell) của `/enterprise/*`. `/platform/*` dùng chung `MainLayout` nên hưởng cùng thay đổi. Không đổi route, sitemap (`lib/screens/*`) hay cấu hình menu theo vai trò (`lib/sidebars/*`), chỉ đổi cách hiển thị.
- **Trạng thái:** đề xuất, chờ chốt các câu hỏi ở §9.

---

## 1. Hiện trạng (đo trên trình duyệt, tài khoản owner@, 1280×800)

| # | Vấn đề | Bằng chứng |
|---|---|---|
| H1 | **Topbar và sidebar trôi theo trang.** Trang Thành viên cuộn 828px thì topbar ở `top = -828px`; sidebar cao 1628px (kéo dài bằng cả trang), phần tên người dùng ở chân sidebar chỉ thấy khi cuộn hết trang. | `MainLayout` dùng `min-h-screen` (không phải `h-screen`), nên `<main class="overflow-auto">` không bao giờ cuộn; cả tài liệu cuộn. Sidebar `md:static`. |
| H2 | Topbar trống: chỉ có chữ "DigiTalent AI", không breadcrumb, không ngữ cảnh trang. Nút tìm kiếm đổi state `showSearch` nhưng không hiện gì. | `components/layout/Topbar.tsx` |
| H3 | Sidebar Owner có **21 mục / 7 nhóm**, mở hết; tên tổ chức bị cắt ("Doanh ng…"); trạng thái thu gọn không được nhớ khi tải lại; ở chế độ thu gọn không có tooltip thật. | `RoleSidebar.tsx`, `lib/sidebars/owner.ts` |
| H4 | `RoleSidebar` có **2 nhánh render gần giống nhau** (SidebarConfig v2.1 và `portal.sidebarGroups` cũ), ~345 dòng. Platform đã có `PLATFORM_SIDEBAR` nên nhánh cũ gần như chết. | `RoleSidebar.tsx`, `lib/portals.ts` |
| H5 | Vùng nội dung không có giới hạn bề rộng, chỉ `p-4 md:p-6`; bảng dữ liệu bị bóp: nhãn "Đang hoạt động" xuống 3 dòng, "Nhân viên" 2 dòng. | Trang `/enterprise/members` |
| H6 | Màu sắc là mặc định kiểu template: sidebar `slate-900` + xanh `primary-600`, nền `slate-50`, chữ Inter; không liên hệ với landing (cream/đen, Be Vietnam Pro) và khu Cá nhân vừa làm lại. | `index.css`, 116 file dùng `bg-white`/`slate-*` trực tiếp |
| H7 | Banner "Gói dịch vụ đã hết hạn" nằm ngoài shell, cũng trôi theo trang. | `EnterpriseLayout.tsx` |

Điểm tốt nên giữ: menu theo vai trò lấy từ sitemap (ẩn mục không có quyền, khóa mục ngoài gói), drawer trên mobile, 84 trang đã dùng chung `PageHeader` → đổi một chỗ là cả loạt trang đổi theo.

## 2. Nguồn tham khảo và điều rút ra

| Nguồn | Điều áp dụng |
|---|---|
| [Carbon – UI shell header](https://carbondesignsystem.com/components/UI-shell-header/usage/) · [UI shell left panel](https://v10.carbondesignsystem.com/components/UI-shell-left-panel/usage/) | Header cố định cao 48px chứa tên sản phẩm + thao tác toàn cục; left panel cố định dưới header, chứa điều hướng phụ. → Topbar và sidebar **luôn cố định**, nội dung cuộn riêng. |
| [Atlassian – thiết kế điều hướng mới](https://www.atlassian.com/blog/how-we-build/designing-atlassians-new-navigation) · [@atlaskit/navigation-system](https://cdn.jsdelivr.net/npm/@atlaskit/navigation-system@10.6.0/README.md) | Đưa menu nghiệp vụ sang sidebar có thể thu gọn/đổi rộng; topbar chỉ giữ **Tìm kiếm** và **Tạo mới**. → Topbar gọn, không lặp menu. |
| [Material 3 – navigation rail / drawer, window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation) | Compact < 600 dp: drawer dạng modal; medium < 840: rail; expanded: drawer cố định. → 3 trạng thái sidebar theo bề rộng. |
| [Smashing – Designing Sticky Menus](https://www.smashingmagazine.com/2023/05/sticky-menus-ux-guidelines/) | Thanh dính phải mỏng, không chiếm quá nhiều chiều cao, có tương phản rõ khi nội dung trôi bên dưới. → Topbar 56px, có viền + nền mờ khi đã cuộn. |

**Trả lời câu hỏi "sidebar và topbar phải luôn hiện đúng không":** đúng, với ứng dụng quản trị dùng lâu, nhiều bảng dữ liệu thì điều hướng và thao tác toàn cục phải luôn trong tầm tay. Ngoại lệ có chủ đích:
- **Mobile (< 768px):** topbar vẫn dính; sidebar thành drawer mở từ nút menu.
- **Màn tập trung** (làm bài đánh giá, xem bài học, wizard thiết lập): ẩn sidebar, topbar rút gọn chỉ còn "Thoát" và tiến độ, để người dùng không bấm nhầm ra ngoài giữa chừng.

## 3. Quyết định đề xuất

| # | Chủ đề | Đề xuất | Lý do |
|---|---|---|---|
| E1 | Cơ chế cuộn | **Cuộn theo tài liệu**: sidebar `position: fixed` (cuộn menu riêng bên trong), topbar `position: sticky; top: 0`, nội dung cuộn bằng thanh cuộn của trình duyệt. Không dùng khung `h-screen` + `<main overflow-auto>`. | Giữ được khôi phục vị trí cuộn khi Back, Ctrl+F, cuộn bằng phím, thanh địa chỉ mobile tự ẩn; các phần dính bên trong trang (đầu bảng, thanh thao tác) chỉ cần `top: var(--shell-top)`. |
| E2 | Kích thước | Topbar **56px**; sidebar **248px** khi mở, **64px** khi thu gọn (rail); nội dung có 4 bề rộng: `narrow` 768, `default` 1200, `wide` 1440, `full`. Lề 16 / 24 / 32px theo màn hình. | 56px đủ chỗ cho breadcrumb + tìm kiếm; 248px chứa nhãn tiếng Việt dài ("Khoảng trống năng lực") không cắt chữ. |
| E3 | Hành vi theo bề rộng | < 768: drawer; 768–1279: rail mặc định (bấm mở thành lớp phủ); ≥ 1280: mở mặc định. Lựa chọn của người dùng được nhớ (`dt-sidebar`). | Theo M3 window size classes, quy đổi sang breakpoint Tailwind (`md`, `xl`). |
| E4 | Theme | **Đã chốt 2026-10-02: Tối là mặc định**, có nút chuyển Sáng, nhớ lựa chọn (`dt-enterprise-theme`). Phong cách "Mực & Giấy" cùng họ với landing và khu Cá nhân. Theme gắn lên `<html>` (class `ent-theme`, `data-theme`) để cả Modal/Drawer render qua portal cũng nhận màu. | Thống nhất với landing và khu Cá nhân. Vì các trang đang gắn cứng màu sáng (~3.300 lần `slate-*`, ~630 lần `white`), cần **lớp tương thích** (GĐ 2b) đảo các thang màu Tailwind trong phạm vi `html.ent-theme[data-theme=dark]`, rồi chuyển dần từng trang sang token. |
| E5 | Chữ | Đổi toàn Enterprise sang **Be Vietnam Pro** (đã nạp sẵn), số dùng `tabular-nums`. Newsreader nghiêng chỉ dùng điểm xuyết (lời chào ở Tổng quan, trạng thái rỗng). | Thống nhất thương hiệu với landing và khu Cá nhân; Be Vietnam Pro vẽ dấu tiếng Việt tốt. |
| E6 | Một nhánh render | Bỏ nhánh `portal.sidebarGroups`; Platform dùng `PLATFORM_SIDEBAR`. | Giảm ~150 dòng trùng lặp. |

## 4. Hệ màu và phong cách: "Mực & Giấy"

Sidebar màu mực (gần đen của landing), vùng làm việc màu giấy ấm, thẻ trắng, **một** màu tương tác duy nhất cho liên kết, mục đang chọn, focus và biểu đồ chính. Màu trạng thái chỉ dùng cho trạng thái.

| Token | Giá trị | Dùng cho |
|---|---|---|
| `ink-950` | `#12120F` | Nền sidebar |
| `ink-900` | `#1C1B16` | Chữ chính; nút chính (nền mực, chữ giấy) |
| `ink-800` | `#26251F` | Hover trong sidebar |
| `sidebar-fg` / `sidebar-muted` | `#E7E5DA` / `#9C9A8E` | Chữ trong sidebar |
| `paper` | `#F6F5F1` | Nền vùng nội dung |
| `card` | `#FFFFFF` | Thẻ, bảng, modal |
| `line` | `#E6E3DA` | Viền, đường kẻ bảng |
| `fg-2` / `fg-3` | `#57554C` / `#6F6D63` | Chữ phụ / chú thích (đạt AA trên `paper`) |
| `accent` | `#2D5BD0` (hover `#244BB0`, nền nhạt `#EAF0FD`) | Liên kết, mục đang chọn, focus ring, chuỗi biểu đồ chính |
| `success` | `#2D7A3C` / nền `#EAF4EC` | Đạt, đang hoạt động |
| `warning` | `#8A5C00` / nền `#FBF2DE` | Sắp hết hạn, ưu tiên vừa |
| `danger` | `#B13A2C` / nền `#FBEAE7` | Lỗi, ưu tiên cao, hết hạn |
| Mức năng lực (thang tuần tự) | `#C9D6F5` → `#7C9BE6` → `#2D5BD0` | Cơ bản → Trung cấp → Nâng cao |

- **Mục đang chọn trong sidebar:** nền `rgba(231,229,218,.10)` + vạch trái 2px màu `accent` + chữ trắng, không tô khối xanh to.
- **Bo góc:** 10px cho nút/ô nhập, 14px cho thẻ (đặc hơn khu Cá nhân 20px vì màn quản trị dày dữ liệu). Hầu như không đổ bóng; dùng viền `line`. Chỉ menu nổi/modal có bóng.
- **Mật độ:** hàng bảng 44px (gọn 36px tùy chọn); chữ thân 14px, chú thích 12px, tiêu đề trang 24px semibold.
- **Chuyển động:** 150–200ms cho hover/thu gọn sidebar; tôn trọng `prefers-reduced-motion`.
- Khai báo bằng token ngữ nghĩa (`--ent-*`, cùng kiểu `pt-*` của khu Cá nhân); hai bộ giá trị Tối / Sáng dưới đây.

### 4.1 Bộ token hai theme (tối là mặc định)

| Token | Tối (mặc định) | Sáng | Dùng cho |
|---|---|---|---|
| `--ent-bg` | `#111110` | `#F6F5F1` | Nền vùng nội dung |
| `--ent-sidebar` | `#0A0A09` | `#12120F` | Nền sidebar (sidebar luôn tối ở cả hai theme) |
| `--ent-sidebar-fg` / `-muted` | `#E7E5DA` / `#9C9A8E` | như tối | Chữ sidebar |
| `--ent-sidebar-hover` / `-active` | `rgba(231,229,218,.06)` / `.10` | như tối | Hover / mục đang chọn |
| `--ent-topbar` | `rgba(17,17,16,.82)` | `rgba(246,245,241,.85)` | Topbar (có `backdrop-blur`) |
| `--ent-card` | `#181816` | `#FFFFFF` | Thẻ, bảng, modal |
| `--ent-raised` | `#1F1F1C` | `#FBFAF7` | Đầu bảng, hover hàng, ô nhập |
| `--ent-line` | `#2A2924` | `#E6E3DA` | Viền, kẻ bảng |
| `--ent-fg` | `#E7E5DA` | `#1C1B16` | Chữ chính |
| `--ent-fg-2` | `#B4B2A6` | `#57554C` | Chữ phụ |
| `--ent-fg-3` | `#8E8C80` | `#6F6D63` | Chú thích (≥ 4.5:1 trên nền) |
| `--ent-primary` / `--ent-on-primary` | `#E7E5DA` / `#12120F` | `#1C1B16` / `#F6F5F1` | Nút chính (kiểu landing: kem trên tối, mực trên sáng) |
| `--ent-accent` | `#7C9BE6` | `#2D5BD0` | Liên kết, mục chọn, focus ring, chuỗi biểu đồ chính |
| `--ent-accent-soft` | `rgba(124,155,230,.14)` | `#EAF0FD` | Nền nhạt của accent |
| `--ent-ok` / `-soft` | `#7FC48C` / `rgba(127,196,140,.14)` | `#2D7A3C` / `#EAF4EC` | Đạt, đang hoạt động |
| `--ent-warn` / `-soft` | `#E3B65A` / `rgba(227,182,90,.14)` | `#8A5C00` / `#FBF2DE` | Cảnh báo, ưu tiên vừa |
| `--ent-bad` / `-soft` | `#EE8E80` / `rgba(238,142,128,.14)` | `#B13A2C` / `#FBEAE7` | Lỗi, ưu tiên cao |
| `--ent-level-1..3` | `#3A4A72` · `#5C7BCB` · `#9DB6F0` | `#C9D6F5` · `#7C9BE6` · `#2D5BD0` | Cơ bản → Trung cấp → Nâng cao |

Ở theme tối không đổ bóng thẻ; phân tầng bằng độ sáng nền (`bg` < `card` < `raised`) và viền `line`.

## 5. Đặc tả khung

### 5.1 Bố cục tổng

```
┌──────────────┬──────────────────────────────────────────────────────┐
│ ▣ Acme Corp ▾│ ☰  Tổ chức / Thành viên        [⌘K Tìm…] [+] 🔔 (N) │ ← topbar 56px, sticky
│   Gói Pro    ├──────────────────────────────────────────────────────┤
│──────────────│ (banner hết hạn nếu có — dính cùng topbar)           │
│ ⌂ Tổng quan  │                                                      │
│ TỔ CHỨC      │  Thành viên                         [Mời thành viên] │
│ ▍Thành viên  │  14 / 100 ghế đang dùng                              │
│   Phòng ban  │  ┌────────────────────────────────────────────────┐  │
│   …          │  │ đầu bảng dính tại top: var(--shell-top)        │  │
│ (menu cuộn   │  │ …                                              │  │
│  riêng)      │  └────────────────────────────────────────────────┘  │
│──────────────│                       nội dung cuộn theo trang ↕     │
│ 14/100 ghế ▮ │                                                      │
│ « Thu gọn    │                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
  sidebar fixed 248px / rail 64px
```

Biến CSS do shell đặt: `--sidebar-w` (0 / 64 / 248px), `--topbar-h` (56px), `--banner-h` (0 hoặc 36px), `--shell-top = topbar + banner`. Vùng nội dung `padding-left: var(--sidebar-w)` ở ≥ 768px.

### 5.2 Sidebar

1. **Khối tổ chức (đầu):** logo chữ "DigiTalent AI", tên tổ chức đầy đủ (2 dòng nếu dài, không cắt), nhãn gói (Starter/Pro/Enterprise). Sau này là chỗ đổi workspace (P2).
2. **Menu:** nhóm có tiêu đề chữ thường nhỏ (không VIẾT HOA cả dòng); nhóm chứa trang hiện tại tự mở; trạng thái mở/đóng từng nhóm được nhớ. Mục bị khóa theo gói: biểu tượng khóa + tooltip "Có trong gói Pro". Chỗ cho **số đếm** (ví dụ "Chờ duyệt 3") ở giai đoạn sau.
3. **Rail 64px:** chỉ biểu tượng, tooltip bằng nhãn khi hover/focus, tiêu đề nhóm thành vạch ngăn.
4. **Chân sidebar:** thanh dùng ghế "14/100 ghế" (Owner), liên kết Trợ giúp, nút Thu gọn (phím tắt `Ctrl+B`). Bỏ tên người dùng ở chân (đã có ở avatar trên topbar).
5. **Mobile:** drawer 288px, có lớp phủ, khóa cuộn nền, giữ focus bên trong (dùng lại `useDialogFocus`), Escape để đóng, đóng khi đổi trang.

### 5.3 Topbar

- **Trái:** nút menu (mobile); **breadcrumb** sinh từ sitemap (`lib/screens/enterprise`) theo nhóm sidebar + màn hình + tên bản ghi khi có (trang chi tiết truyền qua context, ví dụ "Thành viên / Nguyễn Văn A").
- **Giữa/phải:** ô **Tìm kiếm** mở **command palette** (`Ctrl+K`): giai đoạn đầu tìm màn hình trong sitemap mà người dùng có quyền; sau đó mở rộng sang thành viên, khóa học.
- **Phải:** nút **Tạo nhanh (+)** theo quyền (Mời thành viên, Tạo đợt đào tạo, Giao nhiệm vụ), chuông thông báo, avatar (tên, vai trò, tài khoản, cài đặt tổ chức, đăng xuất).
- Nền `paper` mờ (`backdrop-blur`), viền dưới chỉ hiện khi trang đã cuộn.
- Banner hết hạn gói nằm ngay dưới topbar, dính cùng topbar, có nút "Thanh toán" (Owner) hoặc lời nhắn liên hệ Owner.

### 5.4 Vùng nội dung

- **`PageContainer`** (`width="narrow|default|wide|full"`), mặc định `default` 1200px; trang bảng nhiều cột (Thành viên, Kết quả đánh giá) dùng `wide`; form/chi tiết dùng `narrow`.
- **`PageHeader` v2:** tiêu đề 24px semibold, mô tả 14px `fg-2`, cụm thao tác bên phải, hàng **tab** tùy chọn ngay dưới (Employee: Tổng quan / Khoảng trống / Học tập / Minh chứng). Breadcrumb chuyển lên topbar.
- **Bảng:** đầu bảng dính tại `top: var(--shell-top)`; cuộn ngang trong khung bảng khi thiếu chỗ; huy hiệu trạng thái và vai trò `whitespace-nowrap`; cột số canh phải, `tabular-nums`.
- **Thanh thao tác dính** cho trang chỉnh sửa dài (Requirement Builder): dính đáy màn hình với nút Lưu / Hủy.
- **`FocusLayout`** cho làm bài đánh giá, xem bài học, wizard: không sidebar, topbar rút gọn.

## 6. Giai đoạn thực hiện

| GĐ | Nội dung | File chính | Ước lượng |
|---|---|---|---|
| **1** | **Sửa cơ chế cuộn + khung mới.** `MainLayout` viết lại theo E1–E3, biến CSS shell, banner vào shell, store trạng thái sidebar (Zustand, nhớ `dt-sidebar`), skip link "Bỏ qua đến nội dung". Giữ `data-testid` cũ (`enterprise-layout`, `sidebar-backdrop`). | `components/layout/MainLayout.tsx`, `app/layouts/EnterpriseLayout.tsx`, `hooks/use-sidebar-state.ts` (mới) | 1 ngày |
| **2** | **Token "Mực & Giấy".** Thêm `--ent-*` vào `index.css`; đổi font nền Enterprise/Platform sang Be Vietnam Pro; `PageHeader`, `DataTable`, `StatusBadge`, `EmptyState`, `Modal`, `Drawer`, `Tabs` dùng token (84 trang đổi theo mà không sửa từng trang). | `index.css`, `components/shared/*` | 1,5 ngày |
| **2b** | **Lớp tương thích theme tối.** File `styles/enterprise-dark-compat.css`: trong `html.ent-theme[data-theme='dark']`, gán lại biến Tailwind `--color-white`, `--color-slate-50…900`, `--color-gray-*`, `--color-primary-*`, `--color-blue-*`, `--color-emerald-*`, `--color-red-*`, `--color-amber-*`, `--color-rose-*`, `--color-purple-*`, `--color-indigo-*`, `--color-sky-*`, `--color-teal-*`, `--color-success/warning/danger-*` theo thang đảo (50↔900, 100↔800…) đã chỉnh cho nền tối. Không đổi `--color-black`. Chụp kiểm tra 10 trang tiêu biểu. Sau đó chuyển dần từng trang sang token `ent-*` và bỏ dần lớp này. | `index.css`, `styles/enterprise-dark-compat.css` | 1 ngày |
| **3** | **Sidebar.** Gộp còn một nhánh render (bỏ `portal.sidebarGroups`), khối tổ chức + gói, nhóm tự mở theo trang, rail có tooltip, chân sidebar (ghế, trợ giúp, thu gọn), drawer có focus trap. Tách nhỏ: `SidebarNav`, `SidebarItem`, `SidebarOrgBlock`. | `components/layout/RoleSidebar.tsx` → thư mục `components/layout/sidebar/`, `lib/portals.ts` | 1,5 ngày |
| **4** | **Topbar.** Breadcrumb từ sitemap (+ context tên bản ghi), command palette tìm màn hình, menu Tạo nhanh theo quyền, restyle thông báo/avatar. | `components/layout/Topbar.tsx`, `components/layout/CommandPalette.tsx`, `lib/breadcrumbs.ts` (mới) | 2 ngày |
| **5** | **Khung nội dung.** `PageContainer`, `PageHeader` v2 có tab, đầu bảng dính + nowrap huy hiệu, `FocusLayout` cho Assessment Attempt / Lesson Viewer / Setup wizard, thanh thao tác dính cho Requirement Builder. Gắn `width` cho các trang bảng lớn. | `components/shared/PageContainer.tsx`, `DataTable.tsx`, `app/routes/enterprise.routes.tsx` | 1,5 ngày |
| **6** | **Kiểm tra & hoàn thiện.** Chụp so sánh 375 / 768 / 1024 / 1280 / 1440 cho 4 vai trò, tương phản AA, bàn phím (Tab, Escape, Ctrl+B, Ctrl+K), giảm chuyển động; cập nhật `CLAUDE.md` và `frontend/DEVELOPER_GUIDE.md`. | — | 1 ngày |

Tổng khoảng **9–10 ngày làm việc**. Mỗi giai đoạn là một PR riêng, giai đoạn 1 có thể merge độc lập vì sửa lỗi H1.

## 7. Tiêu chí nghiệm thu

1. Ở ≥ 768px, cuộn bất kỳ trang Enterprise nào: topbar luôn ở `top = 0`, sidebar luôn đầy chiều cao màn hình và menu cuộn riêng khi dài hơn màn hình.
2. Đầu bảng Thành viên dính ngay dưới topbar khi cuộn; không huy hiệu nào xuống dòng ở 1280px.
3. Thu gọn sidebar, tải lại trang → vẫn thu gọn. `Ctrl+B` bật/tắt.
4. Mobile 375px: menu mở thành drawer, Tab không thoát khỏi drawer, Escape đóng và trả focus về nút menu.
5. Breadcrumb đúng cho mọi màn trong sitemap; `Ctrl+K` tìm thấy "Thành viên" và chỉ liệt kê màn người dùng có quyền.
6. Không còn `slate-900`/`primary-600` trong `components/layout/*`; chữ phụ đạt tương phản ≥ 4.5:1.
7. Lần đầu vào `/enterprise` là theme tối; chuyển sáng, tải lại vẫn sáng. Modal/Drawer (render qua portal) và toast đổi theo theme. Rời Enterprise (sang landing, `/personal`) thì class `ent-theme` được gỡ khỏi `<html>`. 10 trang cũ tiêu biểu không còn thẻ trắng hay chữ tối trên nền tối.
8. `npm test`, `tsc -b`, `oxlint` sạch; build với `VITE_USE_MOCK=false` không chứa mã mock.

## 8. Kiểm thử

- **Unit/RTL:** store sidebar (nhớ trạng thái), `buildBreadcrumbs(pathname)` cho từng screen, command palette lọc theo quyền, drawer (focus trap, Escape), `aria-current` cho mục đang chọn, mục khóa theo gói có nhãn.
- **Hồi quy:** `app/__tests__/foundation-v2-1.test.tsx`, `router.test.tsx`, `components/layout/__tests__/*` phải giữ nguyên ý nghĩa (chỉ cập nhật chuỗi nếu đổi chữ).
- **Trực quan:** chụp màn hình trước/sau cho Owner, Manager, Employee, Platform ở 5 bề rộng.

## 9. Câu hỏi cần chốt

1. ~~Theme~~ — **đã chốt 2026-10-02:** tối mặc định, có nút chuyển sáng (E4, §4.1, GĐ 2b).
2. **Màu tương tác:** giữ xanh cobalt `#2D5BD0` (gần màu xanh hiện tại, quen mắt người dùng doanh nghiệp) hay muốn một màu thương hiệu riêng?
3. **Command palette** có làm ở đợt này (GĐ 4) hay để sau, chỉ làm breadcrumb trước? → **Đã thực hiện đầy đủ ở GĐ 4**.
4. Menu Owner 21 mục: giữ cấu trúc 7 nhóm như spec v2.1, hay gộp bớt (ví dụ "Đánh giá & Minh chứng" vào "Đào tạo")? Plan này mặc định **giữ nguyên** cấu trúc menu.

---

## 10. Tiến độ thực hiện (Cập nhật 2026-10-02)

| Giai đoạn | Trạng thái | Ghi chú |
|---|---|---|
| **GĐ 1 — Khung & cuộn** | Hoàn thành | `MainLayout.tsx` sửa cuộn tài liệu, `use-sidebar-state.ts` (Zustand, key `dt-sidebar`), biến CSS shell `--sidebar-w`, `--topbar-h`, `--banner-h`, skip link. Banner hết hạn vào shell. |
| **GĐ 2 — Token & theme** | Hoàn thành | Token `--ent-*` hai bộ giá trị Dark/Light phong cách "Mực & Giấy" (`enterprise-theme.css`, `index.css`), store `use-enterprise-theme.ts` (key `dt-enterprise-theme`, mặc định dark), gắn `html.ent-theme[data-theme]`. Đã chuyển 10 component dùng chung `components/shared/*` sang token `ent-*`. |
| **GĐ 2b — Lớp tương thích tối** | Hoàn thành | `enterprise-dark-compat.css` đảo thang Tailwind trong `html.ent-theme[data-theme='dark']` để các trang cũ hiển thị tương thích. |
| **GĐ 3 — Sidebar** | Hoàn thành | Tách `components/layout/sidebar/` (`RoleSidebar`, `SidebarNav`, `SidebarItem`, `SidebarOrgBlock`, `SidebarFooter`), một nhánh render duy nhất, tự mở nhóm trang hiện tại, rail mode 64px, drawer mobile 288px. |
| **GĐ 4 — Topbar** | Hoàn thành | `breadcrumbs.ts` sinh breadcrumb từ sitemap, `CommandPalette.tsx` tìm kiếm lọc theo quyền (`Ctrl+K`), Quick Create menu theo quyền, nút chuyển theme trong `UserAvatarMenu.tsx`. |
| **GĐ 5 — Khung nội dung** | Hoàn thành | `PageContainer.tsx` (narrow/default/wide/full), `PageHeader.tsx` v2 (hỗ trợ tab & backward-compat), `FocusLayout.tsx`, `StickyActionBar.tsx`, `DataTable.tsx` (sticky thead, nowrap badges). Áp dụng 2 trang mẫu: Tổng quan Owner (`OrganizationOverviewPage.tsx`) và Thành viên (`MembersPage.tsx`). |
| **GĐ 6 — Kiểm tra & tài liệu** | Hoàn thành | Unit tests đầy đủ (102 tests pass, `tsc -b` sạch, `oxlint` sạch, build không mock-token), cập nhật `CLAUDE.md`. |
