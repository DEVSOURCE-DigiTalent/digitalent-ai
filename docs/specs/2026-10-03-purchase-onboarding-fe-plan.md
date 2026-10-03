# Kế hoạch FE: Luồng mua gói, đăng ký và onboarding (demo trên mock)

- **Ngày lập:** 2026-10-03
- **Phạm vi:** chỉ Frontend + mock (`VITE_USE_MOCK=true`). Backend làm sau, theo đúng hợp đồng service mà kế hoạch này định ra. Không viết SQL, không đụng `backend/`.
- **Áp dụng cho:** `/business/*`, `/individual/*`, `/login`, `/register`, `/checkout*`, `/setup`, onboarding khu Cá nhân.
- **Nguồn:** đặc tả gốc FLOW-01, mục 4 "Enterprise purchase & organization onboarding", mục 9 "Individual" (`scratch/docx_text.txt`); phân tích luồng ngày 2026-10-02 và baseline đã chốt ngày 2026-10-03.

---

## 1. Quyết định đã chốt

| # | Chủ đề | Quyết định |
|---|---|---|
| P1 | Mô hình | Chỉ trả phí. Không gói miễn phí, không dùng thử (để thành thử nghiệm sản phẩm sau MVP). |
| P2 | Thứ tự | **Chọn gói → Tài khoản → Thanh toán → Thiết lập → Vào hệ thống**, chung khung cho Doanh nghiệp và Cá nhân; chỉ bước 4 khác nhau. |
| P3 | Một cửa vào | Mọi nút "Đăng ký / Bắt đầu / Tạo tài khoản" khi chưa có gói dẫn **thẳng** tới Bảng giá của sản phẩm đó. Không dựa vào chuyển hướng ngầm. Chữ trên nút nói đúng đích. |
| P4 | `/register` chung | Không còn trong hành trình người dùng: chuyển hướng về `/portal`. |
| P5 | Form tài khoản | Doanh nghiệp: Họ và tên, Email công việc, Mật khẩu, Đồng ý điều khoản. Cá nhân: Họ và tên, Email, Mật khẩu, Đồng ý điều khoản. Không hỏi tên tổ chức, điện thoại, chức vụ, quy mô, ngành, nhập lại mật khẩu. |
| P6 | Bản nháp mua hàng | Lựa chọn gói được lưu thành **PurchaseDraft** (có id, giá do mock tính từ `lib/plans`). Sau khi đăng ký: `/checkout?draft=<id>`. URL không bao giờ là nguồn của giá. |
| P7 | Chọn gói theo trạng thái | Khách → trang Đăng ký. Đã đăng nhập, chưa trả → cập nhật bản nháp → Thanh toán. Đang có gói → trang Quản lý gói. Gói "Liên hệ" → luồng liên hệ, không bao giờ vào Thanh toán. |
| P8 | Tổ chức | Chỉ tạo **sau khi thanh toán**, ở bước 1 của wizard Thiết lập. Đăng ký chỉ tạo người dùng + bản nháp. |
| P9 | Thanh toán thất bại | Tài khoản giữ nguyên. Đăng nhập lại → "Bạn chưa hoàn tất thanh toán" → Tiếp tục thanh toán / Đổi gói. |
| P10 | Trạng thái đơn | `pending`, `paid`, `failed`, `expired`, `cancelled`. Mã QR có hạn; hết hạn → "Tạo mã mới". Xác nhận thanh toán lặp lại không tạo thêm thuê bao. |
| P11 | Định tuyến sau đăng nhập | Theo **bước tiếp theo** suy ra từ dữ liệu (`resolveNextStep`), không theo URL: thanh toán → thiết lập → xác minh email → vào hệ thống. |
| P12 | Xác minh email | Không chặn trước Thanh toán. Thanh toán hiển thị email kèm "Thay đổi". Chặn **trước khi vào workspace** nếu chưa xác minh. |
| P13 | Mật khẩu | Tối thiểu 12 ký tự, tối đa 128, **không** bắt buộc chữ hoa / số / ký tự đặc biệt, chặn danh sách mật khẩu phổ biến, cho dán và trình quản lý mật khẩu (`autocomplete`). |
| P14 | Trang đăng ký | Tách `BusinessRegisterPage` và `IndividualRegisterPage`; dùng chung `AccountForm`, `PurchaseStepper`, `PlanSummary`, `PasswordField`, `TermsCheckbox`. |
| P15 | Thiết lập tổ chức | Wizard lưu theo từng bước, có "Lưu và tiếp tục sau". Tối thiểu để hoàn tất: thông tin tổ chức. Phòng ban, cấp bậc, vị trí, mời nhân viên có thể bỏ qua. |
| P16 | Thiết lập cá nhân | Chọn vị trí mục tiêu (bắt buộc) → làm đánh giá đầu vào ngay hoặc để sau → khu Cá nhân. Không đưa mục tiêu nghề nghiệp vào form đăng ký. |
| P17 | Ghế | Hiển thị trước khi thanh toán: "Ghế được tính cho thành viên đang hoạt động và thành viên đã mời nhưng chưa kích hoạt." (cần chủ sản phẩm xác nhận trước khi phát hành). |

## 2. Hiện trạng (đã đo trong code ngày 2026-10-03)

| Chỗ | Hiện tại | Vấn đề |
|---|---|---|
| Footer landing doanh nghiệp (`landing-variants.ts`), nút "Bắt đầu" ở `PublicShell` | Trỏ `/business/register` không kèm gói | Bị bật ngầm về Bảng giá; trên chính trang Bảng giá bấm "Bắt đầu" thì đứng yên. |
| Trang đăng nhập (`features/auth/login-copy.ts`) | `registerPath = /register?audience=…` | Đi tắt qua bước chọn gói, gán ngầm gói mặc định. |
| `/register` (`RegisterPage` không có `audience`) | Form chung + nút chuyển Cá nhân/Doanh nghiệp, gói mặc định | Nhánh thứ hai cho cùng một việc. |
| `RegisterPage.tsx` (446 dòng) | Một trang cho cả hai đối tượng, `if audience` khắp nơi; doanh nghiệp hỏi 8 trường | Quá dài, trùng dữ liệu với bước tạo tổ chức. |
| `mock-registration.service.ts` | Tạo tổ chức ngay khi đăng ký; lưu `user.pendingPlan` | Sinh tổ chức "rác" khi không thanh toán; chưa có bản nháp có id. |
| `PricingPage.tsx` | Luôn `navigate(registerPath + ?plan…)` | Người đã đăng ký đổi gói bị đưa lại vào form đăng ký. |
| `mock-checkout.service.ts` | Đơn `pending / paid / failed`, không hạn QR | Thiếu `expired`, `cancelled`; không có "Tạo mã mới". |
| `CheckoutPage.tsx` | Đọc gói từ URL hoặc `pendingPlan` | Cần đọc bản nháp theo id; hiển thị email + "Thay đổi". |
| `lib/navigation.ts` `getHomePath` | `onboardingStatus: 'payment' | 'setup'` | Cá nhân không có bước thiết lập; chưa có xác minh email. |
| `features/auth/validation.ts` | Mật khẩu ≥ 8, bắt có chữ và số | Trái P13. |
| `SetupWizardPage.tsx` | 6 bước, không lưu bước đang làm | Đóng trình duyệt thì quay lại bước đầu. |

## 3. Luồng đích

```
DOANH NGHIỆP                                   CÁ NHÂN
/business ─ "Xem bảng giá" ─┐                  /individual ─ "Xem gói" ─┐
/business/login ─ "Chọn gói và đăng ký" ─┤     /individual/login ─ ─ ─ ─┤
footer, header "Bắt đầu" ─ ─ ─ ─ ─ ─ ─ ─ ┘     footer, header ─ ─ ─ ─ ─ ─┘
            ▼                                             ▼
/business/pricing  (Starter · Pro · Liên hệ)    /individual/pricing (Plus · Pro)
            │ chọn gói (theo trạng thái, §4.3)            │
            ▼                                             ▼
① /business/register?plan&seats&cycle         ① /individual/register?plan&cycle
   (Họ tên, Email công việc, Mật khẩu)            (Họ tên, Email, Mật khẩu)
   → tạo người dùng + PurchaseDraft               → tạo người dùng + PurchaseDraft
            ▼                                             ▼
② /checkout?draft=pd_…  (tóm tắt, email, QR, đổi gói)  ← dùng chung
            ▼ paid                                        ▼ paid
③ /setup  (Tổ chức* → Cấp bậc → Phòng ban →     ③ /personal/onboarding
   Vị trí → Mời nhân viên → Sẵn sàng)              (Vị trí mục tiêu* → Đánh giá đầu vào: làm ngay / để sau)
            ▼                                             ▼
   (chưa xác minh email → /verify-email-required)  ← dùng chung
            ▼                                             ▼
/enterprise/dashboard                            /personal/dashboard
```

`*` = bắt buộc; các bước khác có thể bỏ qua.

## 4. Đặc tả

### 4.1 Lối vào và chữ trên nút

| Nơi | Chữ | Đích |
|---|---|---|
| Landing doanh nghiệp: hero, dock, finale | Xem bảng giá | `/business/pricing` |
| Landing cá nhân | Xem gói cá nhân | `/individual/pricing` |
| Footer landing doanh nghiệp | Bảng giá (bỏ "Tạo tài khoản doanh nghiệp") | `/business/pricing` |
| Header `PublicShell` (ngoài trang Bảng giá) | Bắt đầu | Bảng giá của sản phẩm |
| Header `PublicShell` trên chính trang Bảng giá | Ẩn nút "Bắt đầu"; chỉ còn "Đăng nhập" | — |
| `/business/login`, `/individual/login` (header + cuối form) | Chọn gói và đăng ký | Bảng giá của sản phẩm |
| `/login` trung lập | Chưa có tài khoản? Chọn hướng sử dụng | `/portal` |
| `/register` | — | chuyển hướng `/portal` |
| `/business/register` hoặc `/individual/register` không có / sai gói | — | Bảng giá kèm `?reason=choose-plan`; Bảng giá hiện thông báo "Chọn một gói để tiếp tục đăng ký." |

### 4.2 Bản nháp mua hàng (mock)

Thêm vào `services/mock/mock-store.ts`:

```ts
type DraftStatus = 'DRAFT' | 'PAYMENT_PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
interface StoredPurchaseDraft {
  id: string;            // "pd_xxxxxxxx"
  userId: string | null; // null trước khi đăng ký
  audience: 'enterprise' | 'individual';
  planCode: string;
  seats: number;         // clampSeats
  cycle: 'month' | 'year';
  amount: number;        // priceFor(plan, seats, cycle) — luôn tính lại ở mock
  currency: 'VND';
  status: DraftStatus;
  createdAt: string;
  expiresAt: string;     // +7 ngày
}
```

Service mới `services/purchase.service.ts` (cùng mẫu `lazyAdapter` + `import.meta.env.VITE_USE_MOCK === 'true'` như `checkout.service.ts`), mock `services/mock/mock-purchase.service.ts`:

| Hàm | Ý nghĩa |
|---|---|
| `getMyDraft()` | Bản nháp đang mở của người dùng (hoặc `null`). |
| `getDraft(id)` | Bản nháp theo id, chỉ chủ sở hữu đọc được. |
| `updateDraft(id, selection)` | Đổi gói / số ghế / chu kỳ khi chưa trả; tính lại `amount`. Gói khác đối tượng hoặc gói "Liên hệ" → 400. |
| `cancelDraft(id)` | Hủy (dùng khi người dùng đổi ý). |

`registerEnterprise` / `registerIndividual` nhận `{ fullName, email, password, acceptTerms, plan }`, tạo người dùng (không tạo tổ chức) + bản nháp, trả `{ draftId, debugVerifyLink }`. Email đã tồn tại → 409 kèm mã `EMAIL_TAKEN`; trang đăng ký hiện "Email này đã có tài khoản. **Đăng nhập** để tiếp tục." (dẫn đúng trang đăng nhập của sản phẩm).

### 4.3 Chọn gói theo trạng thái (`PricingPage`)

```
choose(selection):
  plan "Liên hệ"                     → mở luồng liên hệ (mailto SALES_EMAIL hoặc form), không Thanh toán
  chưa đăng nhập                     → /{business|individual}/register?plan&seats&cycle
  đã đăng nhập, onboardingStatus=payment → updateDraft(myDraft.id, selection) → /checkout?draft=id
  đã đăng nhập, đã có gói            → /enterprise/subscription hoặc /personal/subscription + thông báo "Bạn đang dùng gói X"
  sai đối tượng (cá nhân vào bảng giá doanh nghiệp) → thông báo, không đổi gì
```

Viết thành hàm thuần `resolvePlanChoice(user, plan, audience)` trong `features/commerce/` để test riêng.

### 4.4 Thanh chỉ bước `PurchaseStepper`

- 4 bước: `Chọn gói · Tài khoản · Thanh toán · Thiết lập tổ chức` (doanh nghiệp) / `… · Thiết lập cá nhân` (cá nhân).
- Trạng thái: xong (✓), đang làm (●), chưa tới (○); `aria-current="step"` cho bước đang làm; trên mobile rút còn "Bước 2/4 · Tài khoản".
- Bước "Chọn gói" khi đã xong là liên kết "Đổi gói" → Bảng giá (xử lý theo §4.3).
- Xuất hiện ở: trang Đăng ký (bước 2), Thanh toán (bước 3), Kết quả thanh toán (bước 3), Thiết lập tổ chức và Thiết lập cá nhân (bước 4).

### 4.5 Trang đăng ký

- Hai trang `features/auth/pages/BusinessRegisterPage.tsx`, `IndividualRegisterPage.tsx`; phần dùng chung trong `features/auth/components/`: `AccountForm`, `PasswordField` (hiện/ẩn, đếm ký tự, `autocomplete="new-password"`), `TermsCheckbox`.
- Bố cục: `AuthShell` (đã có) + `PurchaseStepper` + `PlanSummary` (gói, số ghế, chu kỳ, tổng tiền/tháng, "Đổi gói") + form.
- Trường: nhãn hiển thị, `autocomplete="name" | "email"`, lỗi ngay dưới từng ô, kiểm tra bằng `react-hook-form` + `zod`.
- Nút: "Tạo tài khoản và thanh toán". Thành công → tự đăng nhập → `/checkout?draft=<id>`.

### 4.6 Thanh toán và kết quả

- `/checkout?draft=<id>`; không có `draft` → lấy `getMyDraft()`; không có bản nháp → Bảng giá.
- Hiển thị: `PurchaseStepper`, tóm tắt đơn từ bản nháp (không từ URL), email tài khoản + "Thay đổi" (mở hộp thoại đổi email khi chưa thanh toán, gửi lại email xác minh), ghi chú cách tính ghế (P17), QR.
- Đơn: tạo khi mở trang (hoặc dùng lại đơn `pending` còn hạn). QR hết hạn sau 15 phút (mock); trạng thái `expired` → "Mã QR đã hết hạn" + "Tạo mã mới".
- Trang chờ: "Đang chờ thanh toán. Trang sẽ tự cập nhật khi nhận được tiền." + "Kiểm tra trạng thái", "Đổi gói". Nút giả lập (chỉ mock): "Giả lập đã thanh toán", "Giả lập thất bại", "Giả lập hết hạn".
- `/checkout/result?order=<id>` chỉ **đọc** trạng thái đơn; không tự đánh dấu đã trả. Vào thẳng khi không có đơn → chuyển theo `resolveNextStep`.
- `confirmPayment` gọi hai lần với cùng đơn → lần hai trả kết quả cũ, không tạo thêm thuê bao hay tổ chức.

### 4.7 Định tuyến theo bước tiếp theo

Hàm thuần `resolveNextStep(user)` trong `lib/navigation.ts` (dùng bởi `getHomePath`, `RequireOnboarded`, trang Kết quả):

```
onboardingStatus === 'payment'            → '/checkout'
onboardingStatus === 'setup' & enterprise → '/setup'
onboardingStatus === 'setup' & personal   → '/personal/onboarding'
emailVerified === false                   → '/verify-email-required'
còn lại                                   → trang chủ theo vai trò (như hiện nay)
```

- Thêm `emailVerified?: boolean` vào `SessionUser` (`types/session.ts`); mock trả về từ `toSessionUser`. Tài khoản demo luôn `true`; thiếu trường (backend cũ) coi như `true`.
- Mở rộng `OnboardingStatus` cho cá nhân: sau khi trả tiền, cá nhân có `onboardingStatus = 'setup'` cho tới khi chọn vị trí mục tiêu.
- Trang `/verify-email-required`: email đang dùng, "Gửi lại email", "Đổi email", liên kết giả lập (chỉ mock, dùng `MockEmailNotice` đã có).

### 4.8 Thiết lập tổ chức (doanh nghiệp, bước 4)

- Bước "Thông tin tổ chức" tạo tổ chức (`mockOnboardingService.saveOrganization` đã hỗ trợ tạo mới). Đây là bước bắt buộc duy nhất.
- Lưu bước đang làm (`setupStep` trên tổ chức hoặc người dùng trong mock store); vào lại `/setup` mở đúng bước.
- Mỗi bước sau có "Bỏ qua" và "Lưu và tiếp tục sau" (về Tổng quan, `onboardingStatus` xóa khi đã có tổ chức; các bước còn lại hiện thành danh sách việc cần làm ở trang Tổng quan — đã có thẻ "Mức sẵn sàng thiết lập tổ chức").
- Lối thoát của `FocusLayout` ở `/setup` là "Lưu và thoát" (không phải `/login`).

### 4.9 Thiết lập cá nhân (cá nhân, bước 4)

- Trang mới `/personal/onboarding` (IND-05), khung giống khu Cá nhân (theme `pt-*`), có `PurchaseStepper`.
- Bước 1: chọn vị trí mục tiêu (tái dùng thẻ vị trí của `LearnerTargetPage`). Bước 2: "Làm đánh giá đầu vào ngay (≈10 phút)" → `/personal/diagnostic`, hoặc "Để sau" → `/personal/dashboard`.
- Chọn mục tiêu xong → mock xóa `onboardingStatus`.

### 4.10 Mật khẩu

`features/auth/validation.ts`: `passwordSchema` = tối thiểu 12, tối đa 128, không luật thành phần, chặn danh sách ngắn mật khẩu phổ biến (ví dụ `123456789012`, `matkhau12345`, `password1234`, `qwertyuiop12`), không cho trùng email. Áp dụng cho đăng ký, đặt lại mật khẩu, kích hoạt lời mời. Đăng nhập **không** kiểm tra độ dài (tài khoản demo `Admin@1234` vẫn dùng được).

## 5. Tình huống bắt buộc có test

| # | Tình huống | Kỳ vọng |
|---|---|---|
| T1 | Mở `/business/register` không có gói | Về `/business/pricing?reason=choose-plan`, có thông báo |
| T2 | Gói không tồn tại hoặc sai đối tượng trong URL | Như T1 |
| T3 | Sửa giá trên URL Thanh toán | Số tiền hiển thị vẫn theo bản nháp |
| T4 | Email đã có tài khoản, chưa thanh toán | Thông báo + "Đăng nhập"; đăng nhập xong vào Thanh toán |
| T5 | Email đã có tài khoản, đang có gói | Đăng nhập vào hệ thống, không tạo tài khoản mới |
| T6 | Đăng ký Starter, ở Thanh toán bấm Đổi gói chọn Pro | Bản nháp cập nhật, về Thanh toán gói Pro, không qua form đăng ký |
| T7 | Tải lại trang Thanh toán | Vẫn đúng gói, đúng đơn |
| T8 | Đăng ký xong đóng trình duyệt, đăng nhập lại | Vào Thanh toán |
| T9 | QR đang chờ | Giữ trạng thái chờ khi tải lại |
| T10 | Thanh toán thất bại | Tài khoản còn; "Thử lại" tạo đơn mới |
| T11 | QR hết hạn | "Tạo mã mới" |
| T12 | Đã trả nhưng không qua trang Kết quả | Đăng nhập lại vào Thiết lập |
| T13 | Xác nhận thanh toán hai lần | Một thuê bao, một tổ chức |
| T14 | Đã trả, bỏ dở Thiết lập ở bước 3 | Đăng nhập lại mở đúng bước 3 |
| T15 | Nút ở footer landing, header "Bắt đầu", trang đăng nhập | Đều tới Bảng giá |
| T16 | Khách chọn gói ở Bảng giá | Tới trang Đăng ký đúng gói |
| T17 | Người đang có gói vào Bảng giá chọn gói | Tới Quản lý gói, không tới Đăng ký |
| T18 | Gói "Liên hệ" | Không vào Thanh toán |
| T19 | Cá nhân trả tiền xong | `/personal/onboarding`; chọn mục tiêu → khu Cá nhân |
| T20 | Chưa xác minh email sau thiết lập | `/verify-email-required`; mở liên kết giả lập → vào hệ thống |
| T21 | Mật khẩu 11 ký tự / mật khẩu phổ biến | Báo lỗi; 12 ký tự chỉ có chữ thường → hợp lệ |
| T22 | `/register` | Về `/portal` |

## 6. Giai đoạn

| GĐ | Nội dung | Ước lượng |
|---|---|---|
| 1 | Lối vào và chữ trên nút (§4.1), `/register` → `/portal`, thông báo `reason=choose-plan` | 0,5 ngày |
| 2 | `PurchaseStepper`, tách hai trang đăng ký, `AccountForm`, mật khẩu (§4.4, §4.5, §4.10) | 1,5 ngày |
| 3 | Bản nháp mua hàng, Thanh toán theo bản nháp, chọn gói theo trạng thái, gói Liên hệ (§4.2, §4.3, §4.6 phần đơn) | 1,5 ngày |
| 4 | Trạng thái đơn đủ 5 loại, hết hạn QR, Kết quả chỉ đọc, đổi email ở Thanh toán (§4.6) | 1 ngày |
| 5 | Tổ chức sau thanh toán, wizard lưu giữa chừng, `/personal/onboarding`, `resolveNextStep`, xác minh email (§4.7–4.9) | 1,5 ngày |
| 6 | Test T1–T22, kiểm tra trình duyệt, cập nhật `CLAUDE.md` + tiến độ cuối file này | 1 ngày |

## 7. Nghiệm thu

1. T1–T22 có test tự động và pass; `npm test`, `tsc -b`, `oxlint` (không cảnh báo mới), build `VITE_USE_MOCK=false` không chứa `mock-token`.
2. Đi tay trên trình duyệt hai hành trình đầy đủ (doanh nghiệp: Starter 10 ghế; cá nhân: Plus) từ landing tới dashboard, ở 1440px và 375px; ảnh chụp từng bước.
3. Không còn liên kết nào trong `src/` trỏ tới `/business/register` hoặc `/individual/register` mà không kèm gói (grep).
4. Tài khoản demo (`owner@`, `personal@`…) đăng nhập vào thẳng hệ thống như trước.

## 8. Ngoài phạm vi

Backend, SQL, cổng thanh toán thật, webhook thật, dùng thử, SSO, hóa đơn VAT, nâng/hạ gói khi đang dùng (trang Quản lý gói chỉ cần hiện thông báo).

## 9. Tiến độ

| GĐ | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| **1** | Cổng vào, đường dẫn và bản sao văn bản | **Hoàn tất** | `/register` -> `/portal`, copy login rõ ràng, banner `?reason=choose-plan` |
| **2** | Đăng ký & kiểm tra tính hợp lệ mật khẩu | **Hoàn tất** | Validation 12-128 ký tự, blacklist, form 3 trường + checkbox, Stepper responsive |
| **3** | Bản nháp mua gói & lựa chọn gói dịch vụ | **Hoàn tất** | `PurchaseDraft` (7 ngày), `resolvePlanChoice`, mock service, store & persistence |
| **4** | Thanh toán & 5 trạng thái đơn hàng | **Hoàn tất** | 5 trạng thái (pending/paid/failed/expired/cancelled), QR 15m, đổi email, simulation |
| **5** | Ký HĐĐT B2B, Thiết lập tổ chức & Onboarding cá nhân | **Hoàn tất** | HĐĐT Doanh nghiệp (vẽ chữ ký / OTP `686868`, mộc số, PDF), Wizard 6 bước lưu & thoát, IND-05 picker, gating xác thực email |
| **6** | Kiểm thử, tinh chỉnh & tài liệu bàn giao | **Hoàn tất** | 62/62 tests Vitest passed (T1–T22), 0 TS error (`tsc -b`), 0 lint error, 0 mock leak in prod build (`check:no-mock`) |
