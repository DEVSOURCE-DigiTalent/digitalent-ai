# Đối chiếu luồng web DigiTalent Pulse — 13/10/2026

**Phạm vi:** bản duyệt tương tác [`14-pulse-product-site/index.html`](14-pulse-product-site/index.html#/welcome), không phải ứng dụng production. Đối chiếu với `D:/Program Files/QLNS/QLNS/Luồng vận hành Digital AI.html` làm luồng gốc, `D:/Program Files/QLNS/QLNS/DigiTalent AI User Flow và Wireframe.html` làm mô tả màn hình và nhánh phụ. Các quyết định mới nhất của người dùng thay những đề xuất cũ khi có xung đột.

## Kết luận

Luồng **trong bản duyệt** đã nối được hành trình chính và các nhánh phụ theo thứ tự nghiệp vụ mới. Không thể kết luận *hệ thống production đã khớp hoàn toàn*: các hành động tại trang này dùng dữ liệu mẫu trong `localStorage`, chưa gọi API, gửi email, thu tiền hoặc tạo báo cáo thật. Phần đánh giá đầu vào, gợi ý AI, chứng chỉ và bản phát hành nội dung cũng chỉ là tương tác minh họa.

| Điểm đối chiếu | Kết quả trong bản duyệt | Cách kiểm tra |
| --- | --- | --- |
| Landing → đăng ký/đăng nhập → xác minh → trial tự kích hoạt | Khớp quyết định mới: không chờ Platform Admin duyệt, không ngày hết hạn. | Tạo công ty mới từ landing; sau xác minh vào Blueprint. |
| Digital AI ≥ doanh nghiệp ≥ phòng ban ≥ vị trí | Khớp trong biểu mẫu và kiểm tra khi công bố; Owner phải công bố trước khi tạo Manager hoặc mời Employee. Manager chỉ đề xuất, Owner chấp nhận vào bản nháp và công bố lại. | Thử đặt trần con cao hơn cha, hạ trần cha thấp hơn con, hoặc lưu Manager khi khung chưa công bố. |
| Mời theo phòng ban rồi vị trí; tối đa 10 Employee | Khớp cho nhập từng người và CSV. Mười suất tính chung toàn doanh nghiệp; Manager không dùng suất Employee. | Tạo người ở hai phòng ban, thử người thứ 11; xem vị trí được lọc theo phòng ban. |
| Manager chỉ thấy phòng ban phụ trách | Khớp trong bản duyệt. Bộ chọn **Preview Manager account** mô phỏng chuyển tài khoản Manager để người duyệt kiểm tra từng phòng ban; một tài khoản đang chọn chỉ xem đội và bài của phòng đó. Production cần xác thực và phân quyền server. | Chọn Accounting hoặc Marketing trong sidebar Manager. |
| Employee tự làm baseline; current → target → gap | Khớp về thứ tự và hiển thị. Owner/Manager xem kết quả; mức chưa xác nhận được ghi Pending. Mỗi hàng cho thấy trần Digital AI, doanh nghiệp, phòng ban và đích vị trí. Bài test thật chưa có trong prototype. | Mời Employee rồi chuyển vai trò Employee → Take baseline → Path; xem cùng người ở Owner/Manager Capability. |
| Khóa đúng lộ trình vị trí | Khớp ở đường gán khóa: cần khung đã công bố, baseline đã có, khóa không vượt đích vị trí; cấp cao cần cấp trước đạt và suất do Owner gán. Khóa Basic ngoài lộ trình vẫn đọc miễn phí nhưng không ghi nhận tiến độ của vị trí; khóa trả phí ngoài lộ trình chỉ có outline và bài mẫu. | Thử gán Intermediate của một năng lực mà vị trí chỉ cần Basic. |
| Sáu khóa Basic miễn phí; cấp cao trả theo suất | Khớp ở giao diện: Basic xem toàn bộ; cấp cao xem outline và bài mẫu, Owner xem khu vực review có nhãn minh họa, mua/gán suất trong cùng luồng học. Thanh toán chỉ là mô phỏng. | Mở Course collection và một khóa Basic/cấp cao trước và sau khi mô phỏng mua. |
| Mỗi khóa có bài cuối do Manager chấm, AI hỗ trợ | Khớp về vai trò và trạng thái: học ba bài → learning check → nộp assignment → Manager xem bằng chứng, rubric và gợi ý AI → quyết định có lý do. Gợi ý AI hiện là kiểm tra văn bản mẫu. | Đi từ Employee Course/Practice sang Manager Final assignments. |
| Chưa đạt: hai lần nộp tổng cộng, có chờ và hạn chót | Khớp: lần đầu chưa đạt mở ôn tập; bản mẫu đặt 48 giờ chờ, 7 ngày để nộp lần hai và cho Owner chỉnh. Hết hạn là ca Manager cần hỗ trợ, khác với cờ hai lần không đạt. Lần hai không đạt tạo cờ hỗ trợ; không cấp tiếp. | Chấm Not yet lần đầu, tua giờ mẫu, nộp/chấm lần hai; hoặc tua qua hạn để xem ca quá hạn ở Manager. |
| Báo cáo sau một chu kỳ thử thành công; khóa mua dùng cùng chu kỳ | Khớp trong bản duyệt: báo cáo hiện người học, baseline, tiến độ, số lần nộp và kết quả, kể cả người đang học/chưa đạt. Một khóa đã mua dùng lại enrollment, chấm bài và báo cáo. | Duyệt bài của một Employee, mở Owner Cycle reports; sau đó mua/gán suất cao hơn. |
| Nhánh phụ theo wireframe | Có nhiệm vụ thực tế và minh chứng riêng, nhóm đào tạo, nội dung chuẩn, vòng đời khách hàng, lời mời/phục hồi tài khoản, chứng chỉ và hoạt động. | Xem các mục “More ways to work” theo từng vai trò; đọc [`README.md`](14-pulse-product-site/README.md). |

## Quy tắc xung đột đã chốt

Tài liệu vận hành gốc gợi ý duyệt trial thủ công, thời hạn/số suất khác, và đặt trần sau giai đoạn thử. Wireframe có chỗ gợi ý tự động chấm bài cuối. Theo yêu cầu mới nhất, bản duyệt dùng trial tự kích hoạt không giới hạn thời gian, tối đa 10 Employee, **công bố khung trước khi mời**, và **Manager quyết định bài cuối của từng khóa**. Hai lần nộp là **tổng số lần**, kèm thời gian chờ và hạn chót cho lần thứ hai; 48 giờ và 7 ngày chỉ là giá trị mẫu, chưa được chốt làm chính sách production.

## Giới hạn cần xử lý trước khi áp dụng vào code chính

1. Backend hiện vẫn có chính sách trial khác trong `backend/src/DigiTalent.Application/Trial/TrialPolicy.cs`. Cần đổi quy tắc và kiểm tra chặn từ server cho trần, suất Employee, quyền Manager theo phòng ban, quyền học theo vị trí, mua/gán suất và hai lần nộp.
2. Cần câu hỏi và chấm điểm baseline thật, lưu nguồn đo; không thể coi lựa chọn mức trong prototype là kết quả test thực tế. Bài học, minh chứng tệp và gợi ý AI cũng cần dịch vụ/dữ liệu thực.
3. Cần snapshot phiên bản khóa/khung cho Employee đang học khi Platform Admin phát hành bản mới. Bản duyệt có màn phiên bản nhưng chưa chứng minh được việc giữ nguyên nội dung học đang diễn ra, vốn là điểm của Giai đoạn IV trong tài liệu gốc.
4. Email, thanh toán, chứng chỉ tra cứu, bảo mật và báo cáo chính thức cần backend. Các review trước mua phải là review xác thực; thẻ review hiện tại có nhãn “sample”.

**Kiểm thử đã chạy:** luồng chính và nhánh phụ ở 1440px/390px; Employee học → Manager chấm → báo cáo; hai lần nộp và trễ hạn; phân vùng Manager; khung chưa công bố; chặn khóa vượt mục tiêu vị trí; giới hạn 10 Employee. Không thấy lỗi JavaScript hoặc tràn ngang ở các màn đã kiểm tra.
