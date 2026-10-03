# Prompt giao việc: Luồng mua gói, đăng ký và onboarding (FE demo trên mock)

> Dán toàn bộ nội dung dưới đây cho AI agent (Claude Code hoặc tương đương) chạy trong repo `D:\digitalent-ai`.

---

## Vai trò

Bạn là kỹ sư frontend cấp cao kiêm product designer, chuyên luồng đăng ký – thanh toán – onboarding của SaaS thuê bao. Nhiệm vụ: làm lại luồng **Chọn gói → Tài khoản → Thanh toán → Thiết lập** cho hai sản phẩm (Doanh nghiệp, Cá nhân) của DigiTalent AI, **chỉ ở frontend + mock** (`VITE_USE_MOCK=true`). Backend làm sau, nên mọi API mới phải là service có hợp đồng rõ ràng để backend làm theo. Tự làm đến khi xong, kiểm tra trên trình duyệt và báo cáo.

## Đọc trước khi làm (theo thứ tự)

1. `CLAUDE.md` — quy ước dự án (tiếng Việt cho UI, TanStack Query + Zustand, service qua `apiClient` hoặc `lazyAdapter`, mock nạp động sau `import.meta.env.VITE_USE_MOCK === 'true'`).
2. **`docs/specs/2026-10-03-purchase-onboarding-fe-plan.md` — plan chính.** Quyết định P1–P17, hiện trạng, luồng đích, đặc tả §4, 22 tình huống test §5, giai đoạn §6, nghiệm thu §7. Khi prompt và plan khác nhau, **plan thắng**.
3. Code hiện tại:
   - Bảng giá, thanh toán: `features/commerce/pages/{PricingPage,CheckoutPage,PaymentResultPage}.tsx`, `features/commerce/components/*`, `lib/plans.ts`, `lib/plan-query.ts`, `features/commerce/sales-contact.ts`.
   - Đăng ký, đăng nhập: `features/auth/pages/{RegisterPage,LoginPage,PasswordPages,ActivateInvitationPage}.tsx`, `features/auth/components/AuthShell.tsx`, `features/auth/login-copy.ts`, `features/auth/validation.ts`.
   - Onboarding: `features/onboarding/pages/SetupWizardPage.tsx`, `features/onboarding/components/*`, `app/routes/onboarding.routes.tsx`, `components/guards/RequireOnboarded.tsx`, `lib/navigation.ts`, `types/session.ts`.
   - Mock: `services/mock/{mock-store,mock-registration.service,mock-checkout.service,mock-onboarding.service,mock-accounts,mock-auth.service}.ts`, `services/{checkout,registration,onboarding}.service.ts`, `services/lazy-adapter.ts`.
   - Lối vào: `features/public/landing/landing-variants.ts`, `features/public/landing/components/{EnterprisePricingSection,PricingPreviewSection}.tsx`, `features/public/components/PublicShell.tsx`, `app/routes/public.routes.tsx`.
   - Khu Cá nhân (cho bước 4 cá nhân): `features/learner/pages/LearnerTargetPage.tsx`, `features/learner/components/ui.tsx`, `features/learner/theme/*`, `hooks/use-personal-learning.ts`.
   - Test hành trình hiện có: `features/commerce/__tests__/signup-journeys.test.tsx`, `features/portal/__tests__/portal.test.tsx`, `features/auth/__tests__/auth.test.tsx`, `app/__tests__/router.test.tsx`.

## Ràng buộc

- **Không commit, không push, không tạo nhánh.** Working tree có nhiều thay đổi chưa commit của người dùng.
- **Không đụng `backend/`, không viết SQL.**
- Không thêm thư viện mới. Có sẵn: React 19, react-router, TanStack Query, Zustand, react-hook-form + zod, lucide-react, sonner, Tailwind 4.
- Giữ phong cách trang công khai hiện có: kem trên đen (`AuthShell`, `PublicShell`, `FormControls`: `DARK_INPUT_CLASS`, `DARK_PRIMARY_BUTTON`, `Field`, `FormError`, `MockEmailNotice`; logo `components/brand/Wordmark.tsx`). `/personal/onboarding` dùng theme khu Cá nhân (`pt-*`). `/setup` giữ `FocusLayout` + theme Enterprise.
- Mọi service mới theo mẫu `services/checkout.service.ts` (`lazyAdapter` + kiểm tra `VITE_USE_MOCK` ngay trước `import()`), để bản build production không chứa mock.
- Tài khoản demo (`owner@`, `manager@`, `employee@`, `starter@`, `expired@`, `personal@`, `platform@digitalent.demo`, mật khẩu `Admin@1234`) phải đăng nhập vào thẳng hệ thống như cũ: coi như đã xác minh email, không có bản nháp.
- Hàm < 50 dòng, file < 400 dòng (tối đa 800). `RegisterPage.tsx` hiện 446 dòng: tách, không viết thêm vào.
- Toàn bộ chữ trên giao diện bằng tiếng Việt, nút ghi đúng hành động ("Xem bảng giá", "Chọn gói và đăng ký", "Tạo tài khoản và thanh toán", "Tạo mã mới", "Lưu và tiếp tục sau"). Không dùng một chữ "Đăng ký" cho nhiều đích khác nhau.

## Chuẩn UX bắt buộc

1. **Một cửa vào (P3):** nút nào chưa có gói thì dẫn thẳng Bảng giá. Không liên kết tới `/…/register` mà không kèm gói.
2. **Form ngắn (P5):** 3 trường + đồng ý điều khoản. Nhãn hiển thị, không chỉ placeholder; `autocomplete` đúng (`name`, `email`, `new-password`); lỗi hiện ngay dưới ô, có `aria-invalid` + `aria-describedby`; trường đầu tự focus.
3. **Thanh chỉ bước (§4.4)** ở mọi màn của luồng; bước xong có thể bấm "Đổi gói".
4. **Tóm tắt gói luôn thấy được** ở Đăng ký và Thanh toán: tên gói, số ghế, chu kỳ, tổng tiền, "Đổi gói".
5. **Không mất tiến độ:** tải lại, đóng trình duyệt, đăng nhập lại đều quay về đúng bước (§4.7).
6. **Trạng thái thật:** trang Kết quả chỉ đọc trạng thái đơn; đơn đang chờ, thất bại, hết hạn đều có hành động tiếp theo rõ ràng.
7. **Tiếp cận:** điều khiển dùng được bằng bàn phím, focus thấy rõ, vùng bấm ≥ 44px trên mobile, tương phản chữ ≥ 4.5:1, thông báo trạng thái thanh toán đặt trong `role="status"` / `aria-live="polite"`.
8. **Mobile 375px:** không cuộn ngang; thanh chỉ bước rút gọn thành "Bước 2/4 · Tài khoản".

## Thứ tự thực hiện

Làm tuần tự theo plan §6; hết mỗi giai đoạn chạy test liên quan rồi mới sang giai đoạn sau.

1. **GĐ 1 — Lối vào:** sửa các liên kết theo bảng §4.1 (landing, `PublicShell`, `login-copy.ts`), `/register` → `/portal`, trang đăng ký không có gói → Bảng giá kèm `?reason=choose-plan` và Bảng giá hiện thông báo.
2. **GĐ 2 — Đăng ký:** `PurchaseStepper` (`features/commerce/components/`), tách `BusinessRegisterPage` / `IndividualRegisterPage`, tạo `AccountForm`, `PasswordField`, `TermsCheckbox`; cập nhật `passwordSchema` (§4.10) và các trang dùng nó; xóa phần không còn dùng của `RegisterPage.tsx` (chỉ giữ nếu còn route cần).
3. **GĐ 3 — Bản nháp mua hàng:** `StoredPurchaseDraft` trong `mock-store`, `services/purchase.service.ts` + `services/mock/mock-purchase.service.ts` (§4.2), đăng ký tạo người dùng + bản nháp (không tạo tổ chức), `resolvePlanChoice` (§4.3) dùng trong `PricingPage` và các thẻ giá trên landing, gói "Liên hệ" không vào Thanh toán, Thanh toán đọc `?draft=`.
4. **GĐ 4 — Thanh toán:** đơn đủ `pending / paid / failed / expired / cancelled`, QR hết hạn 15 phút + "Tạo mã mới", nút giả lập (chỉ mock), `confirmPayment` idempotent, trang Kết quả chỉ đọc, đổi email ở Thanh toán, ghi chú tính ghế (P17).
5. **GĐ 5 — Sau thanh toán:** `resolveNextStep` (§4.7) dùng cho `getHomePath`, `RequireOnboarded`, trang Kết quả; `emailVerified` trong `SessionUser`; trang `/verify-email-required`; wizard `/setup` tạo tổ chức ở bước 1, lưu bước đang làm, "Bỏ qua", "Lưu và tiếp tục sau", lối thoát "Lưu và thoát"; trang `/personal/onboarding` (§4.9).
6. **GĐ 6 — Kiểm tra và tài liệu:** đủ test T1–T22, kiểm tra trình duyệt, cập nhật `CLAUDE.md` (mục "Entry, sign-up and purchase") và bảng Tiến độ §9 của plan.

## Kiểm tra bắt buộc

- `cd frontend && npx vitest run` — toàn bộ pass. Test mới:
  - Hàm thuần: `resolveNextStep`, `resolvePlanChoice`, `passwordSchema`.
  - Mock service: bản nháp (tạo, đọc, cập nhật, hủy, giá luôn tính lại), đơn (5 trạng thái, hết hạn, xác nhận hai lần).
  - Hành trình (mở rộng `signup-journeys.test.tsx`, dùng `mockAdapter` hoặc service mock như test hiện có): đủ T1–T22 của plan §5.
  - Cập nhật test cũ khi đổi chữ hoặc đổi route, giữ nguyên ý nghĩa kiểm tra.
- `npx tsc -b` không lỗi; `npx oxlint src` không cảnh báo mới ở file bạn sửa.
- `VITE_USE_MOCK=false npx vite build --outDir <thư mục tạm>`, grep `mock-token` và `pd_` trong output: không được có.
- `grep -rn "/business/register'\|/individual/register'" src` không còn liên kết thiếu gói (trừ định nghĩa route và chỗ ghép `?plan=`).
- **Trình duyệt** (`npm run dev`, `frontend/.env` có `VITE_USE_MOCK=true`; xóa `dt-mock-db` trong localStorage trước khi thử):
  - Hành trình doanh nghiệp: `/business` → Bảng giá → Starter 10 ghế → Đăng ký → Thanh toán → Đổi gói sang Pro → Giả lập thất bại → Tạo mã mới → Giả lập đã thanh toán → Thiết lập (làm bước 1, bỏ qua phần còn lại) → Xác minh email (liên kết giả lập) → `/enterprise/dashboard`.
  - Hành trình cá nhân: `/individual` → Bảng giá → Plus → Đăng ký → Thanh toán → Giả lập đã thanh toán → `/personal/onboarding` → chọn Marketing → "Để sau" → `/personal/dashboard`.
  - Giữa chừng mỗi hành trình: tải lại trang; đăng xuất rồi đăng nhập lại → phải về đúng bước.
  - Làm ở 1440px và 375px; console không lỗi.

## Báo cáo khi xong

Trả lời bằng tiếng Việt, ngắn gọn:
1. Đã làm gì theo từng giai đoạn, file chính (dạng link markdown).
2. Kết quả kiểm tra: số test pass (ghi rõ test nào ứng với T1–T22), tsc, lint, build, kết quả grep.
3. Ảnh chụp từng bước của hai hành trình (1440px) và màn Đăng ký, Thanh toán ở 375px.
4. Tình huống nào ở plan §5 chưa đạt, vì sao.
5. Quyết định bạn tự đưa ra khi plan không nói rõ.
6. **Hợp đồng service cho backend:** liệt kê từng hàm mới hoặc đã đổi (`purchaseService`, `registrationService`, `checkoutService`, `onboardingService`, các trường mới trong `/auth/me`) với đầu vào, đầu ra, mã lỗi — để backend làm theo.

Nếu gặp điều plan không trả lời được và ảnh hưởng lớn (đổi route của khu đã có, xóa tính năng, đổi cách tính giá), dừng và hỏi. Chi tiết nhỏ thì tự quyết theo các quyết định P1–P17 và ghi lại trong báo cáo.
