# Đánh giá và chỉnh sửa UX khu vực Chủ doanh nghiệp (Owner): 18/11/2026

Nhánh: `feature/DT-trial-owner-ux` (tạo từ `develop` f691329d). **Chưa commit, chưa push.**
Ảnh chụp trước và sau khi sửa (tài khoản `owner@digitalent.ai`, dữ liệu thật):
`C:\Users\ADMIN\AppData\Local\Temp\claude\a08808766572c9fe\a4791359-df03-4a2e-bbec-d440d65286f3\scratchpad\owner\`
(`before-*.png` / `after-*.png`; thư mục tạm, có thể bị xóa khi khởi động lại máy).

## 1. Đánh giá nhanh từng tab

| Tab | Dễ dùng lần đầu? | Trùng lặp / thừa | Luồng và dữ liệu |
|---|---|---|---|
| **Tổng quan** | Trung bình. 3 ô số không bấm được. | Mỗi ô có biểu đồ cột mini là **số bịa cố định**, trông như xu hướng thật. Chấm xanh nhấp nháy cạnh tên công ty không mang nghĩa gì. | "Độ phủ chuẩn 16.7%" khó hiểu, thực ra là 1/6 người có kết quả. Tab "Tiến độ đánh giá" lặp trang Khảo sát, dùng chữ cũ, và vẫn ghi "Chưa nộp 4" khi đợt đã chốt. |
| **Khảo sát năng lực số** | Đã làm lại hôm qua (xem mục 3). | | |
| **Khung năng lực số** | Khó: ô ma trận ghi mã M1-F, M1-I… mà chủ doanh nghiệp không hiểu. | 3 lớp tiêu đề chồng nhau: "Kiến trúc năng lực doanh nghiệp", "Khung năng lực số", "Phạm vi năng lực số". Breadcrumb lại ghi "Thiết lập kiến trúc năng lực". | Cột "Miền năng lực" lệch với từ "Lĩnh vực" dùng ở mọi trang khác. |
| **Nhân sự** | Khá. | Breadcrumb ghi "Thành viên", sidebar và tiêu đề ghi "Nhân sự". | Nút "Đợt đánh giá" mang icon bình thí nghiệm, tên cũ của trang Khảo sát. Tổng quan ghi 6 nhân sự, trang này ghi 7 thành viên (khác cách đếm, chưa có chú thích). |
| **Khoảng trống năng lực** | Khá. | | **Kết luận quá mức:** "100% · Đội ngũ đã đạt chuẩn" trong khi mới 1/6 người có kết quả. Tiêu đề "Cần cải thiện ở đâu?" vẫn hiện khi không lĩnh vực nào cần cải thiện. |
| **Khóa học** | Khá. | Tiêu đề "Khóa học năng lực số" khác sidebar. | Nhãn trên thẻ khóa học bị bóp vỡ 2 dòng ("I · TRUNG CẤP", "ĐÃ MUA"). |
| **Báo cáo chu kỳ** | Trung bình. | Tiêu đề "Từ năng lực đến hành động" không khớp sidebar. Phần năng lực **lặp gần y hệt** trang Khoảng trống. | Cùng lỗi kết luận quá mức "100% đạt chuẩn". Biểu đồ 6 cột đều 100% không cho thêm thông tin gì. |
| **Chứng nhận** | Khá. | Bố cục 2 cột lạ: tiêu đề "Chứng nhận" to ở cột trái, cột phải lại có tiêu đề "Chứng nhận đã cấp". | |
| **Hoạt động** | Khó hiểu tên. | Một trang có 3 tên: sidebar "Hoạt động", breadcrumb "Thông báo", eyebrow "THÔNG BÁO", tiêu đề "Hoạt động", khung "Thông báo". | **Lỗi hiển thị:** danh sách tràn ra ngoài khung bên phải, gây cuộn ngang. |
| **Góp ý / Báo lỗi** | Tốt. | | Nút chính màu xanh dương, lệch tông xanh ngọc của khu Owner. |
| **Chung** | | | Ô cuối sidebar ghi chữ **"Tổ chức"** thay cho tên công ty, vì `/auth/me` thật không trả tên tổ chức. |

**Nguyên tắc áp dụng khi sửa:**
1. Tên trên sidebar, breadcrumb và tiêu đề trang phải giống nhau.
2. Số lớn chỉ kết luận khi đủ dữ liệu; luôn kèm độ phủ (X/Y người).
3. Mỗi con số là một lối tắt tới trang chi tiết.
4. Bỏ trang trí giả dạng dữ liệu và tiêu đề lặp.

## 2. Đã sửa hôm nay

**Tên gọi đồng bộ**
- Breadcrumb: "Tổng quan tổ chức" thành "Tổng quan"; "Thiết lập kiến trúc năng lực" thành "Khung năng lực số"; "Thành viên" thành "Nhân sự" (`lib/screens/enterprise/owner.ts`).
- Sidebar Owner: "Hoạt động" thành **"Thông báo"** (`lib/sidebars/owner.ts`).
- Tiêu đề trang:
  - Tổng quan: "Tổng quan doanh nghiệp" thành "Tổng quan", tên công ty hiện ở dòng dưới.
  - Báo cáo chu kỳ: "Từ năng lực đến hành động" thành "Báo cáo chu kỳ", kèm một dòng mô tả.
  - Khóa học: "Khóa học năng lực số" thành "Khóa học".
  - Thông báo: "Hoạt động" thành "Thông báo".
- Cột "Miền năng lực" thành "Lĩnh vực năng lực" (`PositionReferenceMatrix.tsx`).

**Tổng quan** (`OwnerOverviewPage.tsx`, `OwnerProgressTabs.tsx`, `OwnerAssessmentHeatmap.tsx`)
- 3 ô số bấm được, **bỏ biểu đồ cột giả**:
  - **Nhân sự** (N người · số người chờ kích hoạt hoặc đã khóa), dẫn tới Nhân sự.
  - **Phòng ban** (N phòng ban · M vị trí), dẫn tới Nhân sự.
  - **Đã có kết quả năng lực** (1/6 người, thanh tiến độ thật, "5 người chờ khảo sát"), dẫn tới Khoảng trống. Lấy cùng nguồn dữ liệu với trang Khoảng trống nên hai trang luôn khớp số.
- Tab "Tiến độ đánh giá" thành **"Khảo sát năng lực số"**.
- Bên trong tab:
  - Tiêu đề là "Tiến độ làm bài", hoặc "Kết quả tham gia" khi đợt đã chốt.
  - Nút "Quản lý đợt đánh giá" thành "Mở trang khảo sát" (hoặc "Xem kết quả khảo sát" khi đợt đã chốt).
  - Bỏ eyebrow "TỔNG QUAN ĐỘI NGŨ" và nhãn "5 phòng ban" (đã có ở ô số).
  - Đợt đã chốt thì "Chưa nộp" đổi thành **"Không nộp"**.

**Khoảng trống năng lực** (`OwnerCapabilityGapPage.tsx`) và **Báo cáo chu kỳ** (`OwnerCycleReportPage.tsx`)
- Khi chưa tới một nửa đội có kết quả, dòng tiêu đề lớn ghi **"Mới có 1/6 người có kết quả · Chưa đủ để kết luận cho cả đội"**, thay vì "Đội ngũ đã đạt chuẩn".
- "Cần cải thiện ở đâu?" chỉ hiện khi có lĩnh vực cần cải thiện; nếu không thì ghi "Kết quả theo lĩnh vực".
- "Cần đánh giá" / "chờ đánh giá" thành "Chờ khảo sát" (khớp tên trang Khảo sát).

**Các trang khác**
- **Nhân sự:** nút "Đợt đánh giá" (bình thí nghiệm) thành "Khảo sát năng lực số" (icon checklist); bỏ eyebrow "THAO TÁC NHANH".
- **Khung năng lực số:** bỏ eyebrow "Kiến trúc năng lực doanh nghiệp", thêm một dòng nói trang dùng để làm gì.
- **Khóa học:** nhãn trên thẻ xuống dòng gọn, mỗi nhãn giữ trên một dòng, chữ 11px thay vì 10px.
- **Chứng nhận:** một tiêu đề duy nhất kèm số chứng nhận đã cấp; bỏ cột trái thừa.
- **Thông báo:**
  - Một tên duy nhất; dòng phụ cho biết số thông báo chưa đọc.
  - **Sửa lỗi tràn ngang** (`owner-operations.css`: lưới `minmax(0,1fr)`).
- **Sidebar:** ô cuối hiện **đúng tên công ty**, lấy từ API tổng quan tổ chức (`SidebarPulseOrgCard.tsx`).

### Sáng 18/11: thanh tiến độ và bảng kết quả của Khảo sát năng lực số

- **Thanh tiến độ còn 3 bước**: Chọn người làm bài → Đặt hạn, gửi lời mời → **Làm bài & nhận kết quả**.
  - Hai bước cuối cũ được gộp vì chủ doanh nghiệp không làm gì ở cả hai và không biết khi nào bước 3 chuyển sang bước 4.
  - Dòng phụ của bước 3 nói đang ở đâu: "2/6 đã nộp" → "Chuyên gia đang chấm" (mọi người đã nộp hoặc đã hết hạn) → "Đã có kết quả" (hoặc "Hết hạn, chưa ai nộp").
- **Trang theo dõi**:
  - Thêm một dòng nói khi nào có kết quả: "Khi mọi người nộp xong hoặc hết hạn, hệ thống sẽ trả kết quả đánh giá." Câu cũ nhắc chuyên gia chấm bài, nhưng báo cáo tự công bố (`TrialProgramReader.FinalizeSurveyAsync`).
  - Chiều 18/11: bỏ số to "4/10 người đã nộp" ở góc phải, vì thanh tiến độ và dòng chú thích đã nói số này. Chỗ đó giờ là nút **Đổi hạn nộp**, form đổi hạn mở thành một khung nền nhạt ngay dưới tiêu đề.
  - Danh sách người làm bài có ô tìm kiếm và bộ lọc phòng ban từ **6 người** trở lên; trước đây các công cụ này chỉ hiện khi có hơn 10 người. Phân trang giữ 10 người một trang.
  - Thanh tiến độ và dòng chú thích gộp thành **một dải**: mỗi nhóm (Đã nộp / Chưa nộp / Chưa kích hoạt) có nhãn + số người ngay trên đoạn màu của nó, đoạn rộng theo số người. Bấm một nhóm để lọc danh sách (các nhóm khác mờ đi, chip "Chưa nộp (3) ×" hiện cạnh bộ lọc để bỏ lọc), nên bỏ ô chọn trạng thái vốn lặp lại cùng con số. Danh sách trong báo cáo đã chốt vẫn giữ ô chọn trạng thái vì ở đó không có dải này.
  - Dải tiến độ hiện như **một thanh tiến độ liền** (cao 10px, bo tròn hai đầu, các đoạn sát nhau chỉ cách bằng vạch trắng 2px); di chuột vào đoạn nào thì đoạn đó đậm lên.
  - **Hộp "Kết quả của …" (từng người)** có điểm nhấn: dải tóm tắt nền xanh nhạt với chữ cái đầu tên, phòng ban, vị trí, email, giờ nộp và ba ô số (Đạt chuẩn vị trí x/6 lĩnh vực kèm thanh tỷ lệ, Trắc nghiệm x/90 kèm vòng phần trăm, Cần học thêm n khóa). Mỗi lĩnh vực là một thẻ có nhãn trạng thái (⚠ Thiếu n cấp / ✓ Đạt chuẩn), **thang 3 bậc** (bậc đã đạt tô xanh, bậc còn thiếu tới chuẩn tô sọc vàng, bậc chuẩn có cờ), dòng trắc nghiệm gọn và các khóa cần học; thẻ còn thiếu có nền vàng rất nhạt. Dòng chữ "Nâng cao · Chuẩn hệ thống: Trung cấp" đã bỏ theo yêu cầu, vì thang bậc đã nói cả mức hiện tại lẫn chuẩn. Trên điện thoại, hai ô số nằm cạnh nhau, ô trắc nghiệm chiếm cả hàng.
  - Ô tìm kiếm và bộ lọc phòng ban nằm chung một khung viền mảnh, cao 40px bằng nút "+ Mời thêm", chữ bộ lọc nhạt hơn. Trên điện thoại khung tách hai hàng: tìm kiếm ở trên, bộ lọc ở dưới.
  - Bỏ hộp "Kết quả tạm thời sẽ hiện ở đây khi có bài nộp đầu tiên". Hộp này sai khi đã có người nộp, vì kết quả chỉ tính bài đã chấm. Giờ hộp chỉ còn khi chưa ai nộp mà đã hết hạn.
- **Bỏ khối tối "Kết quả chung"**. Bảng "Kết quả theo lĩnh vực" lên đầu và làm luôn việc của khối đó:
  - Độ phủ "6/6 người có kết quả", kèm cảnh báo khi còn ít người.
  - Lĩnh vực cần ưu tiên có nhãn "Ưu tiên học trước".
- **Bảng gọn, bấm "Chi tiết" mới mở** (người dùng chọn hướng này sau khi thấy bảng dạng ma trận giống chế độ xem chi tiết):
  - Bỏ cột "Mức trung bình" và cột "Số người theo mức".
  - Mỗi lĩnh vực một dòng: **Năng lực hiện tại của công ty** (mức trung bình của những người có kết quả), **Chuẩn cần đạt** (vd. "Nâng cao"), nút **Chi tiết**.
  - Màu của ô năng lực hiện tại:
    - Hổ phách: trung bình thấp hơn chuẩn.
    - Xanh có dấu ✓: mọi người đều đạt chuẩn.
    - Trung tính: chưa có chuẩn, hoặc trung bình đạt nhưng vẫn còn người dưới chuẩn (xem trong Chi tiết).
  - Cột "Dưới chuẩn vị trí" (x/y người) được thay bằng cột này theo yêu cầu.
  - **Khóa học đề xuất cho công ty** (cột mới): các khóa công ty cần ở lĩnh vực đó, lần lượt, từ khóa người yếu nhất phải học trước tới mức chuẩn cao nhất, vd. "Khóa Cơ bản → Trung cấp → Nâng cao". Khóa trả phí mua một lần cho cả công ty, nên đây là danh sách cần mua. Mọi người đã đạt chuẩn thì ghi "Không cần thêm khóa".
  - **Chi tiết** sau cùng chỉ còn "Số người ở từng mức" (theo yêu cầu). Danh sách từng người cần học gì đã bỏ khỏi bảng; lộ trình của từng người xem trong "Kết quả từng người" → "Xem chi tiết".
  - **Tên cột rút gọn:** "Mức hiện tại" · "Mức cần đạt" · "Khóa nên học" (trước là "Năng lực hiện tại của công ty" · "Chuẩn cần đạt" · "Khóa học đề xuất cho công ty").
  - **Bỏ dòng "2/2 người có kết quả · 15 câu trắc nghiệm mỗi lĩnh vực"** dưới tiêu đề. Dòng này chỉ còn hiện khi quá ít người có kết quả, dưới dạng cảnh báo "x/y người có kết quả · Chưa đủ để kết luận cho cả đội".
  - **Chi tiết thiết kế lại** (bản "bậc thang" thẻ nổi nền cam đã bỏ: màu cam/xanh lẫn lộn, thẻ nổi lệch khỏi bảng, và chiều cao bậc là mức chứ không phải số người nên dễ đọc sai):
    - Mở ngay trong dòng của bảng, cùng nền nhạt với dòng đang mở. Không có thẻ, viền hay bóng riêng. Nội dung thẳng hàng với tên lĩnh vực.
    - Bên trái là ô tóm tắt (thẻ trắng viền mảnh), từ trên xuống:
      - Nhãn có biểu tượng: "⚠ Chưa đạt chuẩn Nâng cao" (hoặc "✓ Đã đạt chuẩn …").
      - Số người: "1/6 người".
      - Thanh tỷ lệ: phần hổ phách là dưới chuẩn, phần xanh là đạt chuẩn.
      - Chú thích: "● 1 dưới chuẩn ● 5 đạt chuẩn".
    - Đã bỏ dòng "Đông nhất", vì cột cao nhất trong biểu đồ bên cạnh đã cho thấy điều đó.
    - Bên phải là biểu đồ cột: **chiều cao cột = số người**, cột mảnh 24px trên một đường đáy, số ghi trên đầu cột. Cột dưới chuẩn màu hổ phách, từ chuẩn trở lên màu xanh. Mức chuẩn có cờ. Dưới trục có ngoặc "Dưới chuẩn / Đạt chuẩn", nên nghĩa của màu được ghi bằng chữ, không chỉ dựa vào màu.
    - Cột mọc lên khi mở (tắt khi máy bật giảm chuyển động).
  - **Bỏ "Ưu tiên học trước"** (nhãn và nền cam của dòng đó) theo yêu cầu.
  - **Bộ lọc theo phòng ban** ở góc phải tiêu đề bảng, ví dụ "Tất cả phòng ban (6 người)", "Kế toán (3 người)", "Marketing (3 người)":
    - Chọn một phòng ban thì mọi cột (mức hiện tại, mức cần đạt, khóa nên học) và biểu đồ trong Chi tiết được tính lại chỉ với người của phòng đó.
    - Dữ liệu lấy từ kết quả từng người đã có trong báo cáo, không cần đổi backend.
    - Bộ lọc chỉ hiện khi có từ 2 phòng ban trở lên.
  - **Đường phân chia rõ hơn** giữa dòng đang mở và phần chi tiết: dòng đang mở có nền đậm hơn, chi tiết có nền sáng hơn, ở giữa là một đường kẻ chạy hết chiều ngang bảng, và một đường nữa khép lại ở đáy.
  - **Chi tiết** mở ngay dưới dòng, gồm hai phần:
    - Số người ở từng mức (Chưa đạt Cơ bản / Cơ bản / Trung cấp / Nâng cao). Ô tô màu theo chuẩn: hổ phách = dưới chuẩn, xanh = đạt. Ô của mức chuẩn có viền đứt và chữ "Chuẩn". Không tô màu khi các vị trí có chuẩn khác nhau.
    - **Cần học (n)**: mỗi người dưới chuẩn một dòng, "Đang ở Cơ bản · chuẩn Nâng cao", kèm các khóa phải học lần lượt (vd. "Khóa Trung cấp → Nâng cao"). Mỗi khóa là một link. Người đã đạt chuẩn gom vào một dòng tên.
  - Lộ trình đi từ mức kế tiếp của từng người tới mức chuẩn. Lý do: khóa học nối tiếp nhau (học xong khóa trước mới học khóa sau). Bản trước chỉ hiện một khóa, nên chuẩn Nâng cao mà nút ghi "Khóa Trung cấp", dễ hiểu nhầm.
  - Ô "Xem chi tiết" của từng nhân viên cũng hiện cùng lộ trình đó, thay cho dòng backend chỉ ghi khóa kế tiếp.
  - Trên điện thoại mỗi lĩnh vực là một thẻ; chi tiết mở ngay dưới thẻ.
- **Sửa lỗi cũ: trang kết quả tràn ngang trên điện thoại.** Nhãn ẩn "Thao tác" của bảng từng người (`sr-only`, định vị tuyệt đối) thoát khỏi khung cuộn. Đã thêm `relative` cho khung cuộn của 3 bảng.
- File:
  - `trial-program/pages/TrialProgramPage.tsx`
  - `trial-program/components/OwnerTrialUi.tsx`
  - `trial-program/owner-team-assessment.css`
  - `lib/i18n/owner-messages.ts`
  - 2 file test cập nhật + 1 test mới cho bước 3 gộp.

### Chiều 18/11: kết quả khảo sát dạng biểu đồ đường

- "Kết quả theo lĩnh vực" (OW-T1) có biểu đồ đường phía trên bảng (`components/DomainLineChart.tsx`): trục ngang 6 lĩnh vực, trục dọc Chưa đạt → Nâng cao; đường cong mềm (monotone, không vọt quá giá trị) — liền xanh có chấm = mức hiện tại trung bình, đường đứt xám có hình thoi = mức cần đạt trung bình, vùng vàng = còn thiếu. Rê chuột hoặc Tab vào một lĩnh vực: đường dóng + ô số (hiện tại, cần đạt, còn thiếu bao nhiêu mức). Theo bộ lọc phòng ban; bảng chi tiết giữ nguyên bên dưới. Màu chữ luôn là màu mực; hai đường phân biệt bằng nét liền/đứt và hình chấm/thoi, không chỉ bằng màu.

- Khi đã có kết quả, khối "Danh sách người làm bài" (10/10 người đã nộp · Xem) được ẩn vì bảng "Kết quả từng người" đã liệt kê người làm bài; khối này chỉ còn khi đợt khảo sát kết thúc mà không ai nộp.

### Chiều 18/11: thiết kế lại Khung năng lực số (`/enterprise/setup`)

Nghiệp vụ chủ dự án xác nhận: **toàn doanh nghiệp = mọi khóa doanh nghiệp đã mua và dùng ở đâu, không đặt gì cả; chọn phòng ban mới là đặt năng lực cho từng phòng ban.**

- **Đổi tên để tránh hiểu nhầm.** Hai phần của trang thành hai thẻ đánh số theo thứ tự nên làm:
  - **1. Khóa học của doanh nghiệp** (trước là "Toàn doanh nghiệp"): mỗi ô ghi "✓ Miễn phí" / "✓ Đã mua" kèm "Dùng ở: Mọi phòng ban / 2/5 phòng ban", hoặc "🔒 Chưa mua · giá · Thêm vào giỏ". Không có ô chọn mức, không có "Cài đặt vị trí". Trên cùng có dải tóm tắt "11/18 khóa đã có" (Cơ bản miễn phí, Đã mua, Chưa mua).
  - **2. Năng lực từng phòng ban** (trước là "Chọn phòng ban"): danh sách phòng ban dạng thẻ (số người, "Đã đặt mức" / "Chưa đặt"), một câu hướng dẫn theo tên phòng ban, mỗi hàng đọc như một **dải** từ Cơ bản tới mức chọn ("✓ Đã gồm" → "✓ Mức cần đạt"), nhãn "Đề xuất" lấy từ chuẩn vị trí của phòng ban, nút "Dùng mức đề xuất" / "Bỏ mức riêng".
- **Tách việc mua và việc đặt mức** (theo yêu cầu sau đó): mua khóa chỉ ở phần 1, giỏ hàng chỉ hiện ở phần 1.
- **Đặt trước, mua sau** (yêu cầu tiếp theo): phần 2 đặt được cả cấp chưa mua; ô mang nhãn "🔒 Chưa mua", thẻ phòng ban đếm "Khóa cần mua" và dẫn về phần 1. Phần 1 viền vàng các khóa phòng ban đang cần ("Marketing cần") và có ô nổi bật "Phòng ban đang cần N khóa chưa mua · Tổng … · Thêm cả N vào giỏ". Backend bỏ chặn mức phòng ban cao hơn khóa đã có; nhân viên thấy khóa chưa mua trên lộ trình, học được khi doanh nghiệp mua.
- **Điểm nhấn cho cả hai bảng:** thẻ đang chọn tô đặc màu xanh (chỉ còn tên phần, bỏ dòng số và câu giải thích theo yêu cầu); mỗi lĩnh vực một màu riêng ở biểu tượng; tiêu đề cột có chấm ●○○ → ●●● chỉ cấp. Phần 1: vòng tiến độ "11/18", ô khóa đã có đậm dần theo cấp (Cơ bản nhạt → Nâng cao đậm). Phần 2: thẻ phòng ban có chữ cái đại diện và ba con số (Nhân viên, Lĩnh vực đã đặt, Khóa cần mua); ba cấp của một lĩnh vực ghép thành **một thanh liền**, tô đầy từ Cơ bản tới mức cần đạt, đầu thanh cắm cờ.
- **Lần chỉnh tiếp theo:** nhãn "CEO cần" lặp ở mọi ô thay bằng "Cần cho" + huy hiệu chữ cái các phòng ban (cùng màu với danh sách phòng ban), ô nhạt màu hơn. Danh sách phòng ban chuyển thành **cột bên trái** (tiêu đề "Phòng ban · x/y đã đặt", thanh tiến độ, ô tìm kiếm từ 7 phòng ban, cuộn được), nội dung phòng ban ở bên phải; trên điện thoại cột nằm trên và cuộn trong khung. **Bỏ "Chuẩn vị trí"** (nút ở từng lĩnh vực và bảng mức tham chiếu) vì trang chỉ đặt mức cho phòng ban; đã xóa `DomainPositionStandardPanel` và `PositionReferenceMatrix` không còn dùng. Bỏ hai dòng số dưới tên hai thẻ và câu giải thích ở đầu phần Khóa học.
- **Chọn phòng ban khi có rất nhiều phòng ban:** bỏ cột liệt kê hết, thay bằng một thanh: ô chọn phòng ban có tìm kiếm (danh sách cuộn trong menu), nút ‹ › chuyển nhanh, "x/y phòng ban đã đặt mức" kèm thanh tiến độ, nút "Phòng ban chưa đặt tiếp theo →".
- **Bỏ** tiêu đề thứ hai "Phạm vi năng lực số", nhãn "Đã lưu", dòng hướng dẫn ký hiệu ở cuối, mã khóa trong ô (mã chỉ còn ở phần chi tiết và chú thích khi rê chuột). "Quy tắc & Hướng dẫn" thành nút "Cách hoạt động" với nội dung viết lại theo nghiệp vụ mới.
- **Điện thoại:** mỗi lĩnh vực một khối, ba ô cấp nằm ngang, mỗi ô tự ghi tên cấp; không còn ô bị cắt chữ.
- **Backend:** mức "toàn doanh nghiệp" = cấp cao nhất đã có (Cơ bản + khóa đã mua), không còn chọn tay; phòng ban đặt mức không cần lưu mức doanh nghiệp trước, chỉ không được vượt khóa đã có. Lộ trình nhân viên: mức của phòng ban nếu đã đặt, chưa đặt thì theo chuẩn vị trí; khóa chưa mua vẫn hiện (bị khóa) như trước. API `PUT /capability-ceilings/organization` để lại nhưng giao diện không gọi nữa.
- Kiểm tra: backend 143/144 (1 test cần Postgres riêng, lỗi sẵn); frontend tổ chức + mock + i18n 77/77 trước khi mở rộng, các nhóm liên quan 429/431 (2 test SkillGapPages lỗi sẵn).

## 3. Cùng nhánh, đã làm ngày 17/11

- **Trang Khảo sát năng lực số** (đổi tên từ "Đánh giá đội ngũ"):
  - Thanh tiến độ 4 mốc kèm số liệu, giữ số 1–4.
  - Dải "bài khảo sát gồm gì" và bước 1 gọn hơn.
  - Bản tóm tắt trước khi gửi.
  - Báo cáo tính đến độ phủ dữ liệu; bảng phòng ban và vị trí tách 2 cột.
  - Bảng nổi checklist thu nhỏ mặc định.
- **Backend:** giới hạn 15 giây khi gửi email SMTP (`Infrastructure/Email/SmtpSending.cs`, dùng ở cả 5 chỗ gửi mail), để "Gửi lời mời" không treo vô hạn khi Gmail không trả lời.
- **Dữ liệu (theo yêu cầu):** 2 tài khoản của tổ chức "Sao Mai" trên database chung đã được cho nộp bài khảo sát (mật khẩu các tài khoản thử không ghi ở đây).

## 4. Kiểm tra

- `tsc -b`: không lỗi. `oxlint` các thư mục đã sửa: chỉ còn cảnh báo cũ.
- Vitest các khu vực đã sửa (organization, notifications, layout, lib, trial-program, intelligence, feedback, app, commerce, experience, pulse-manager): mọi test liên quan đều qua. Đã cập nhật test theo tên mới và thêm test cho trường hợp "ít người có kết quả".
- Còn **12 test hỏng có sẵn từ trước, không liên quan**. Đã chạy lại trên code gốc chưa sửa và chúng hỏng y hệt:
  - `router.test.tsx` (6),
  - `foundation-v2-1` (sidebar Manager),
  - `enterprise-trial.test.tsx` (2),
  - `SkillGapPages.test.tsx` (2),
  - `signup-journeys` ("checkout → login").

## 5. Chưa làm (đề xuất tiếp theo)

1. **Gộp Báo cáo chu kỳ và Khoảng trống năng lực.** Phần năng lực của hai trang gần như trùng nhau. Đề xuất: Báo cáo chu kỳ chỉ giữ *thay đổi theo thời gian* (so với chu kỳ trước) và *tiến độ học*, còn Khoảng trống giữ *hiện trạng*.
2. ~~**Khung năng lực số:** thay mã khóa học bằng chữ dễ hiểu~~ Đã làm chiều 18/11 (xem mục 2).
3. **Số nhân sự lệch** giữa Tổng quan (6) và Nhân sự (7): thống nhất cách đếm (có tính lời mời chờ kích hoạt hay chủ doanh nghiệp không) và ghi rõ cạnh con số.
4. **Nút "Gửi góp ý / Gửi báo lỗi" màu xanh dương:** màu này cố ý dùng cho cổng nhân viên. Muốn đổi riêng cho Owner phải thêm lớp theo layout.
5. **Bảng nổi "Nhiệm vụ tân thủ 0/5":** tiến độ chỉ tính số lần bấm "Xem tính năng", không theo việc thật đã làm (ví dụ đã gửi khảo sát).
6. **Nút "Nhắc người chưa nộp"** ở trang Khảo sát: cần API backend gửi email nhắc.
7. **Gửi email bền hơn:** chuyển sang thư viện MailKit và cổng 465. Từ mạng ở nhà, riêng IP Gmail `74.125.130.109` không trả lời ở cổng 587.

## 6. Cách xem lại

```bash
git switch feature/DT-trial-owner-ux
git status          # các file đã sửa
git diff --stat
```
Dự án đang chạy: web http://localhost:5173, API http://localhost:5000, database chung qua đường hầm cổng 15433.
Đăng nhập `owner@digitalent.ai` / `Admin@1234`.
