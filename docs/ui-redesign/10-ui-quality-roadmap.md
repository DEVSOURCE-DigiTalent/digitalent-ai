# Pulse UI — kế hoạch nâng chất lượng trải nghiệm

## Mục tiêu và cách chấm

Bản đánh giá nhanh hiện tại: **thẩm mỹ 7/10, dễ dùng 6/10, di động 6/10**. Đây là nhận xét chuyên gia trên prototype, chưa phải kết quả thử nghiệm với người dùng. Mục tiêu của vòng thiết kế tiếp theo là **ít nhất 9/10 cho từng mặt** trong buổi đánh giá có cùng tiêu chí, đồng thời vượt qua các bài kiểm tra hành vi bên dưới. Điểm 10 tuyệt đối vẫn phụ thuộc ngữ cảnh và người đánh giá.

| Mặt đánh giá | Dấu hiệu đạt mục tiêu |
| --- | --- |
| Dễ dùng | Người thuộc từng vai trò hoàn thành ít nhất 9/10 lượt thử nhiệm vụ chính mà không cần hướng dẫn; tìm được hành động tiếp theo ngay trong màn đầu. |
| Thẩm mỹ | Ít nhất 4/5 người đánh giá cho từ 9/10; bố cục có trọng tâm riêng cho từng vai trò, biểu đồ và hình ảnh làm rõ nội dung. |
| Di động | Không tràn ngang ngoài vùng cuộn có chủ ý tại 360, 390 và 768 px; hành động chính và trạng thái quan trọng thấy được sớm; thao tác được bằng chạm. |
| Tiếp cận | Các luồng chính đáp ứng WCAG 2.2 AA: tương phản chữ, nhãn, thứ tự focus, thông tin không chỉ truyền bằng màu, mục tiêu chạm và hỗ trợ bàn phím. |
| Hiệu năng khi vào ứng dụng thật | Đo ở phân vị 75 trên dữ liệu thực: LCP ≤ 2,5 giây, INP ≤ 200 ms, CLS ≤ 0,1; tách kết quả mobile và desktop. |

Trước khi chỉnh, ghi thời gian và tỉ lệ hoàn thành các nhiệm vụ mẫu để có mốc so sánh. Mục tiêu giảm ít nhất **30% thời gian** cho các việc hiện đang nhiều bước; không lấy cảm giác đẹp làm bằng chứng thay cho việc hoàn thành tác vụ.

## Vòng 0 — chốt bài kiểm tra và dữ liệu mẫu

1. Lập bảng cho cả **63 màn hình**: vai trò, route code hiện có, mục tiêu, hành động chính, dữ liệu cần hiển thị, quyền truy cập và trạng thái trống/lỗi/đang tải.
2. Chọn 10 hành trình để kiểm tra liên vai trò: bắt đầu dùng thử; lập vị trí và chuẩn năng lực; mời thành viên bằng CSV; xem khoảng trống năng lực; quản lý minh chứng; học bài; nộp bài; phản hồi; xem trước và mua khóa; phát hành khóa.
3. Dùng cùng một bộ dữ liệu thực tế đã ẩn danh hoặc mẫu nhất quán: có người thiếu đánh giá, có gap đã xác nhận, bài nộp lại, khóa Basic, khóa trả phí chưa mua/đã mua, ghế còn/hết. Mỗi nhãn số phải có nguồn và trạng thái rõ ràng.
4. Chụp và ghi lại bản hiện tại ở 1440, 768, 390 và 360 px. Bắt đầu từ MG-01, MG-02, OW-02, OW-07, OW-13 và EM-01 vì các màn này chứa phần đặc trưng nhất.

**Điều kiện qua vòng:** có bảng đối chiếu route–chức năng và kết quả thử hiện trạng. Chưa thay giao diện ứng dụng thật.

## Vòng 1 — sửa cấu trúc thông tin và hệ thiết kế

- Mỗi màn có **một câu trả lời đầu tiên** và **một hành động chính**. Bỏ các lớp lặp giữa breadcrumb, hero, thanh tab và thẻ tóm tắt. Đặt việc cần xử lý, trạng thái và bước kế tiếp trong vùng đầu trang.
- Giữ Pulse xanh điện + san hô trên nền sáng; Manager dùng nền slate/xanh dịu, san hô cho việc khẩn và quyết định. Owner mang tính điều hành, Employee mang tính học tập, Admin mang tính kiểm soát phiên bản. Hình trừu tượng không có người chỉ dùng ở điểm mở đầu hoặc chuyển ngữ cảnh; dữ liệu quan trọng vẫn là chữ và thành phần HTML.
- Chuẩn hóa chữ: nội dung chính 15–16 px, thông tin phụ tối thiểu 13–14 px, nhãn ngắn tối thiểu 12 px; tăng tương phản và khoảng cách giữa thẻ. Các con số có đơn vị, thời điểm, mẫu số và chú thích trạng thái.
- Tạo bộ thành phần dùng chung cho trạng thái/chip, competency level, course access, priority queue, empty state, lỗi nhập liệu, xác nhận, bộ lọc và điều hướng di động. Không ép tất cả vai trò vào cùng bố cục dashboard.
- Mobile: giữ một thanh điều hướng ngắn theo vai trò; đưa danh mục đầy đủ vào menu rõ nhãn. Nếu danh sách tab cuộn ngang, hiển thị dấu hiệu còn nội dung và vẫn cho truy cập bằng bàn phím. Hành động chính không bị đẩy xuống sau nhiều lớp giới thiệu.

**Điều kiện qua vòng:** token và các thành phần nhất quán, không còn chữ 9–11 px ở nội dung thao tác, không còn lớp điều hướng trùng chức năng ở màn mẫu.

## Vòng 2 — làm nổi bật chức năng từng vai trò

| Không gian | Thiết kế ưu tiên | Bài kiểm tra cần vượt qua |
| --- | --- | --- |
| **Manager — MG-01, MG-03/04** | Một hàng chờ quyết định duy nhất, có người nộp, hạn, lý do ưu tiên, minh chứng và nút xem/duyệt. Ba chỉ số chỉ tóm tắt cùng hàng chờ, không lặp lại thành ba khối nội dung khác. Khi mở hồ sơ, tiêu chí, file, lịch sử phản hồi và quyết định nằm cùng ngữ cảnh. | Manager tìm đúng bài nộp lại cần xử lý và gửi phản hồi có lý do trong tối đa 3 bước có ý nghĩa. |
| **Manager — MG-02, MG-05/06** | Bản đồ 6 lĩnh vực/24 năng lực có bộ lọc theo người/vị trí. Khi chọn một năng lực, chi tiết mức hiện tại, mức mục tiêu, gap, nguồn xác nhận và gợi ý học xuất hiện ngay cạnh hoặc cuộn/focus tới chi tiết. Biểu đồ team liên kết về người cụ thể. | Manager phân biệt được gap đã xác nhận với mức chưa xác nhận, rồi xác định người cần hỗ trợ mà không đoán qua màu. |
| **Owner — OW-02, OW-08/09** | Bản đồ năng lực toàn doanh nghiệp dẫn đến người và vị trí liên quan; thể hiện rõ phạm vi dữ liệu, số nhân viên chưa có đánh giá và ba quyết định: đặt mục tiêu, xác minh gap, giao học. Các màn nhân viên dùng cùng mô hình 24 năng lực. | Owner đi từ gap của một người tới hành động đúng, hiểu được tại sao gap được ghi nhận. |
| **Owner — OW-07** | CSV là luồng nhập nhiều người: tải mẫu → tải lên → đối chiếu lỗi từng dòng → xem tổng hợp → xác nhận; thêm một người ở tab riêng. Hiển thị rõ giới hạn 200 người mỗi lô như code hiện tại, và điều kiện quyền Pro. | Owner sửa được một dòng sai và biết chính xác số lời mời sẽ gửi trước khi xác nhận. |
| **Owner — OW-13/18** | Trình xem khóa gồm kết quả đạt được, đề cương, bài mẫu, phản hồi học viên có xác thực, điều kiện tiên quyết, giá và ghế. Basic xem/học toàn bộ miễn phí. Khóa cao hơn chưa mua chỉ mở tổng quan và bài mẫu; đã mua mở nội dung theo quyền và hiển thị ghế riêng. | Owner nhận biết nội dung được xem trước, nội dung mở sau mua và số ghế cần mua mà không nhầm với gói thuê bao hiện tại. |
| **Employee — EM-01–12** | Giữ không gian học riêng: bài học tiếp theo, tiến trình cá nhân, lộ trình từ gap tới mục tiêu, nhiệm vụ đang đến hạn. Trang đọc bài tập trung, có mục lục ngắn và điểm tiếp tục; phản hồi Manager nêu rõ việc cần sửa. Tương tác thành tựu dùng tiết chế, không che nhiệm vụ. | Employee bắt đầu học hoặc sửa bài nộp trong một lần chạm từ trang đầu, biết vì sao một khóa bị khóa. |
| **Public / Platform Admin** | Public nêu rõ Basic miễn phí và quyền truy cập khóa cao hơn trước đăng ký. Admin làm rõ phiên bản khung năng lực, bản nháp/đã phát hành, giá của khóa trả phí, tác động thay đổi và lịch sử kiểm toán. | Người mới hiểu cách bắt đầu; Admin biết chính xác phiên bản và đối tượng bị ảnh hưởng trước khi phát hành. |

**Lưu ý sản phẩm:** cơ chế mua theo khóa và ghế trong prototype là đề xuất; ứng dụng hiện dùng plans/subscriptions. Trước khi đưa các màn mua vào sản phẩm, chốt quy tắc giá, quyền, API, chuyển đổi gói và thanh toán. Review mẫu trong prototype không được hiển thị như đánh giá thật khi triển khai.

## Vòng 3 — prototype tương tác và duyệt theo lô

1. Làm trước **6 màn chuẩn**: MG-01, MG-02, OW-02, OW-07, OW-13, EM-01. Mỗi màn có desktop và mobile, trạng thái mẫu và tương tác đúng tác vụ.
2. Duyệt lần 1 theo ba câu hỏi: *Tôi đang ở đâu? Tôi cần chú ý điều gì? Tôi làm gì tiếp?* Chỉ mở rộng khi người xem trả lời được trong vài giây mà không có người giải thích.
3. Mở rộng từ các mẫu đã duyệt sang đủ 63 màn. Mỗi màn vẫn có đặc trưng theo chức năng; dùng chung token và thành phần, không nhân bản bố cục nguyên trang.
4. Chạy thử nhiệm vụ với ít nhất 5 người cho mỗi vai trò chính Owner, Manager, Employee; ghi quan sát, lỗi và thời gian. Các luồng Admin/Public có nhóm kiểm tra tương ứng. Sửa và thử lại các trường hợp không đạt.

**Điều kiện qua vòng:** đạt bảng mục tiêu ở trên; prototype đã được duyệt trước khi chạm `frontend/src` hoặc `backend/src`.

## Vòng 4 — áp dụng vào ứng dụng và nghiệm thu

- Triển khai theo cùng thứ tự màn chuẩn, dùng route/data thật và quyền thật. Mỗi thay đổi chức năng đều so với bảng route–chức năng ở Vòng 0.
- Xử lý đầy đủ loading, empty, error, offline/network retry, permission, locked, success, validation, focus, reduced motion và dữ liệu dài. Kiểm tra bàn phím, đọc màn hình và kích thước chạm.
- Khóa nội dung trả phí bằng **API entitlement**; giao diện chỉ phản ánh quyền đã xác nhận. Review thật lấy từ dữ liệu xác thực. Không đưa số liệu/chứng chỉ minh họa vào hồ sơ thật.
- Kiểm tra responsive và Core Web Vitals trên ứng dụng thật; so sánh thời gian tác vụ với baseline. Bàn giao từng cụm role sau khi vượt tiêu chí, rồi đánh giá tổng thể 63 màn.

## Thứ tự làm việc đề xuất ngay sau khi duyệt kế hoạch

**MG-01 → MG-02 → OW-02 → OW-07 → OW-13 → EM-01**, rồi các màn còn lại theo 7 luồng liên vai trò. Thứ tự này giải quyết trước các vấn đề đã thấy trực tiếp: Manager lặp thông tin, chi tiết năng lực bị chìm, Owner nhiều chữ, nhập thành viên và mua khóa khó hiểu, mobile cần hành động hiện sớm.

## Cơ sở kiểm tra

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) cho tiêu chí tiếp cận.
- [Google Web Vitals](https://web.dev/articles/vitals/) cho ngưỡng LCP, INP và CLS.
- [Nielsen Norman Group — heuristics for complex applications](https://www.nngroup.com/articles/usability-heuristics-complex-applications/) cho nguyên tắc trạng thái rõ ràng, nhất quán, ngăn lỗi và giảm thông tin cạnh tranh.
