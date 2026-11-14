import { ownerEnglish } from './owner-messages';
import { assessmentEnglish } from './assessment-messages';
/** Vietnamese source copy is the stable key. Course content and personal data are not translated. */
export const english: Record<string, string> = { ...ownerEnglish, ...assessmentEnglish, ...Object.fromEntries(`
Tổng quan|Overview
Tổng quan doanh nghiệp|Business overview
Tổng quan tổ chức|Organization overview
Tổng quan phòng ban|Department overview
Chỉ số phòng ban|Department metrics
Thông báo của bạn|Your notifications
Chưa có thông báo.|No notifications yet.
Nhân viên đã nộp bài cuối khóa|An employee submitted a final assessment
Nhân viên đã nộp bài đánh giá trước khi học|An employee submitted a pre-assessment
Chưa cập nhật được trạng thái đã đọc. Vui lòng thử lại.|Couldn't update the read status. Try again.
Đã đánh dấu thông báo là đã đọc.|Notification marked as read.
Đã đánh dấu tất cả là đã đọc.|All notifications marked as read.
chưa đọc, đánh dấu là đã đọc|unread, mark as read
Không tìm thấy thông báo phù hợp.|No notifications match your search.
Xóa tìm kiếm|Clear search
Phân trang thông báo|Notification pagination
Không rõ ngày|Unknown date
Lượt nộp bài|Submissions
Học và chuẩn bị làm bài|Learning and preparing for assessment
Hạn học|Learning deadline
Tự học|Independent learning
Được giao|Assigned
Chưa gán vị trí|No position assigned
Tiến độ bài học|Lesson progress
Tìm học viên hoặc khóa học|Search learners or courses
Lọc theo trạng thái học|Filter by learning status
Chưa có dữ liệu đánh giá để lọc.|Assessment status is unavailable.
Không có lượt học phù hợp với bộ lọc.|No enrollments match your filters.
Chưa có lượt học trong phòng ban.|No enrollments in this department yet.
Khóa được giao và khóa tự học sẽ xuất hiện tại đây.|Assigned and independent courses will appear here.
Đang tải kết quả bài cuối khóa…|Loading final assessment results…
Các trạng thái dưới đây dựa trên dữ liệu học tập hiện có.|The statuses below reflect the learning data currently available.
Lượt học đã hoàn thành|Completed enrollments
Tiến độ lượt học chưa hoàn thành|Progress for incomplete enrollments
Tìm theo tên hoặc mã khóa học|Search by course name or code
Chưa có dữ liệu học tập của phòng ban.|There is no learning data for this department yet.
Không có khóa học phù hợp với bộ lọc.|No courses match your filters.
Chờ đánh giá / nộp lại|Awaiting review or resubmission
Tiến độ trung bình|Average progress
Phân trang khóa học|Course pagination
Tài khoản chưa có quyền xem tiến độ học tập.|Your account does not have access to learning progress.
Đang tải kết quả bài làm…|Loading assessment results…
Chưa ghi nhận mốc học tập hoặc đánh giá.|No learning or assessment milestones yet.
Minh chứng và năng lực|Evidence and competencies
Đang tải minh chứng thực tế…|Loading practical evidence…
Ghi nhận phân công từ|Assignments recorded since
Tiến độ theo khóa học|Progress by course
Đang tải tiến độ học tập…|Loading learning progress…
Mốc học tập và đánh giá|Learning and assessment milestones
Khi nào mức năng lực được cập nhật?|When are competency levels updated?
Mức năng lực đã xác nhận cập nhật khi bài cuối khóa hoặc minh chứng được duyệt.|Confirmed competency levels are updated when a final assessment or evidence is approved.
Danh sách kết quả bài làm|Assessment results list
Tìm nhân viên hoặc khóa học|Search employees or courses
Chờ Mentor đánh giá|Awaiting mentor review
Không có bài phù hợp với bộ lọc.|No submissions match these filters.
Đề bài và yêu cầu|Instructions and requirements
Nhân viên có kết quả đối chiếu|Employees with comparison results
Nhân viên đang xem|Selected employee
Năng lực yêu cầu đã xác nhận|Required competencies confirmed
Trong các năng lực đã xác nhận|Among confirmed competencies
Chưa đủ dữ liệu đối chiếu|Insufficient data to compare
Đối chiếu theo lĩnh vực|Comparison by domain
Tìm năng lực|Search competencies
Tìm theo tên hoặc mã năng lực|Search by competency name or code
Lọc theo lĩnh vực|Filter by domain
Mức yêu cầu chung|Common target level
Mức hiện tại|Current level
Mức yêu cầu|Required level
Khoảng cách đã xác nhận|Confirmed gaps
Chưa xác nhận mức|Level not confirmed
Ngoài lộ trình|Outside role requirements
Độ phủ mục tiêu|Target coverage
Minh chứng xác nhận|Confirming evidence
Ngày xác nhận|Confirmation date
Chưa có minh chứng xác nhận.|No confirming evidence yet.
Đào tạo đề xuất|Recommended training
Cần mức năng lực đã xác nhận để đề xuất khóa học.|Confirmed competency levels are needed to recommend courses.
Chưa có khóa học phù hợp.|No matching courses yet.
Không tìm thấy năng lực phù hợp.|No matching competencies.
Chưa có số liệu|No data available
Lọc hoạt động|Filter activity
Bạn đã đọc tất cả thông báo.|You have read all notifications.
Chọn nhóm chỉ số|Choose a metric group
Mở trang|Open page
Có khoảng trống năng lực|Have competency gaps
Đang có khóa học|Currently taking courses
Không có khóa đang học|No courses in progress
bài cuối khóa|Final submissions
lượt học|Course enrollments
Nhân viên đang học|Employees currently learning
Bài cuối khóa chờ đánh giá|Final submissions awaiting review
Bài cuối khóa cần hỗ trợ|Final submissions needing support
Nhân viên phòng ban|Department employees
Đang làm việc|Active
Đã chuyển công tác|Transferred
Đã lưu trữ|Archived
Chưa xác định|Unknown
Lọc theo vị trí công việc|Filter by job position
Không tải được bộ lọc vị trí.|Could not load job position filters.
Phòng ban chưa có nhân viên|This department has no employees
Chưa đối chiếu|Not yet benchmarked
Đạt chuẩn vị trí|Meets role standards
{count} khoảng trống năng lực|{count} competency gaps
{count} khóa đang học|{count} courses in progress
Chưa có khóa đang học|No courses in progress
Xem kết quả bài làm|View assessment results
Đang tải số liệu…|Loading metrics…
Không tải được số liệu.|Could not load metrics.
Không tải được danh sách nhân viên trong phòng ban.|Could not load department employees.
Phòng ban chưa có nhân viên đang hoạt động.|There are no active employees in this department.
Chủ doanh nghiệp|Business owner
CHỦ DOANH NGHIỆP|BUSINESS OWNER
CÁC CÔNG CỤ KHÁC|OTHER TOOLS
Các công cụ khác|Other tools
Đánh giá đội ngũ|Team assessment
Đánh Giá Năng Lực Đội Ngũ|Team competency assessment
Khung năng lực số|Digital competency framework
Nhân sự|People
Thành viên|Members
Khoảng trống năng lực|Competency gaps
Khóa học|Courses
Báo cáo chu kỳ|Cycle report
Báo cáo & Phân tích|Reports & analytics
Đợt đào tạo|Training programs
Nhiệm vụ thực tế|Practical tasks
Chứng nhận|Certificates
Hoạt động|Activity
Tổ chức|Organization
Gói doanh nghiệp|Business plan
Suất nhân viên|Employee seats
Thu gọn|Collapse
Mở rộng|Expand
Thu gọn thanh bên|Collapse sidebar
Mở rộng thanh bên|Expand sidebar
Thu gọn thanh bên (Ctrl+B)|Collapse sidebar (Ctrl+B)
Mở rộng thanh bên (Ctrl+B)|Expand sidebar (Ctrl+B)
Điều hướng chính|Main navigation
Mở điều hướng|Open navigation
Đường dẫn|Breadcrumbs
Tìm kiếm|Search
Tìm nhanh|Quick search
Tìm kiếm (Ctrl+K)|Search (Ctrl+K)
Hướng dẫn|Help
Xem lại hướng dẫn sử dụng|View the product tour
Tạo nhanh|Quick create
Menu tài khoản|Account menu
Thông báo|Notifications
Hồ sơ của tôi|My profile
Bảo mật tài khoản|Account security
Cài đặt tổ chức|Organization settings
Cài đặt tài khoản|Account settings
Góp ý|Feedback
Báo lỗi|Report a bug
Chuyển giao diện sáng|Switch to light mode
Chuyển giao diện tối|Switch to dark mode
Đăng xuất|Sign out
Học tập của tôi|My learning
Quản lý|Manager
Nhân viên|Employee
Quản trị viên|Administrator
Nền tảng|Platform
Học viên|Learner
Giảng viên|Instructor
Đang hoạt động|Active
Đang dùng|Active
Không hoạt động|Inactive
Vô hiệu hóa|Deactivate
Đã vô hiệu hóa|Deactivated
Kích hoạt|Activate
Dùng thử|Trial
Hết hạn|Expired
Đã hết hạn|Expired
Đã lưu|Saved
Chưa lưu|Unsaved
Lưu|Save
Lưu thay đổi|Save changes
Đang lưu…|Saving…
Đang lưu...|Saving...
Hủy|Cancel
Hủy bỏ|Cancel
Đóng|Close
Xác nhận|Confirm
Hoàn tác|Discard changes
Thử lại|Try again
Làm mới|Refresh
Quay lại|Back
Tiếp tục|Continue
Trước|Previous
Sau|Next
Trang|Page
Hiển thị|Show
Sắp xếp|Sort
Tất cả|All
Không có|None
Chưa có dữ liệu|No data yet
Không có dữ liệu|No data
Đang tải…|Loading…
Đang tải...|Loading...
Đang tải trang|Loading page
Đang tải trang …|Loading page …
Đang chuẩn bị không gian làm việc|Preparing your workspace
Bỏ qua đến nội dung|Skip to content
Thông tin cá nhân|Personal information
Cập nhật thông tin liên hệ của bạn.|Update your contact details.
Họ và tên|Full name
Email đăng nhập|Sign-in email
Email được dùng để đăng nhập và nhận thông báo.|Used for signing in and receiving notifications.
Số điện thoại|Phone number
Chức danh|Job title
Chưa cập nhật|Not provided
Lưu thông tin|Save profile
Thông tin đã được đồng bộ|Your information is up to date
Có thay đổi chưa được lưu|You have unsaved changes
Đã lưu thông tin cá nhân.|Profile saved.
Vui lòng nhập họ và tên.|Please enter your full name.
Không thể lưu thông tin cá nhân.|Unable to save your profile.
Không tải được hồ sơ.|Unable to load your profile.
Đang tải hồ sơ…|Loading your profile…
Đổi mật khẩu|Change password
Bảo vệ quyền truy cập tài khoản của bạn.|Protect access to your account.
Mật khẩu hiện tại|Current password
Mật khẩu mới|New password
Xác nhận mật khẩu mới|Confirm new password
Hiện mật khẩu hiện tại|Show current password
Ẩn mật khẩu hiện tại|Hide current password
Hiện mật khẩu mới|Show new password
Ẩn mật khẩu mới|Hide new password
Hiện xác nhận mật khẩu mới|Show password confirmation
Ẩn xác nhận mật khẩu mới|Hide password confirmation
Độ mạnh mật khẩu|Password strength
Chưa nhập mật khẩu mới|Enter a new password
Ít nhất 8 ký tự|At least 8 characters
Chữ hoa và chữ thường|Uppercase and lowercase letters
Có chữ số|Contains a number
Có ký tự đặc biệt|Contains a special character
Không chia sẻ mật khẩu với người khác.|Never share your password.
Cập nhật mật khẩu|Update password
Chủ động bảo vệ tài khoản của bạn|Keep your account secure
Sử dụng mật khẩu riêng cho DigiTalent.|Use a unique password for DigiTalent.
Kiểm tra lịch sử đăng nhập để nhận biết truy cập bất thường.|Review your sign-in history for unusual activity.
Đăng xuất khi sử dụng máy tính dùng chung.|Sign out when using a shared computer.
Lịch sử đăng nhập|Sign-in history
Các lần truy cập được hệ thống ghi nhận.|Sign-in activity recorded by the system.
Làm mới lịch sử đăng nhập|Refresh sign-in history
Thời gian|Time
Thiết bị|Device
Địa chỉ IP|IP address
Kết quả|Result
Thành công|Successful
Thất bại|Failed
Chưa có lịch sử đăng nhập.|No sign-in history yet.
Đang tải lịch sử…|Loading sign-in history…
Không tải được lịch sử đăng nhập.|Unable to load sign-in history.
Mật khẩu mới phải có ít nhất 8 ký tự.|Your new password must contain at least 8 characters.
Mật khẩu xác nhận không khớp.|Passwords do not match.
Mật khẩu mới phải khác mật khẩu hiện tại.|Your new password must differ from your current password.
Đã cập nhật mật khẩu.|Password updated.
Yếu|Weak
Trung bình|Fair
Khá|Good
Mạnh|Strong
Tổ chức của bạn|Your organization
Thông tin doanh nghiệp|Company information
Thông tin sử dụng trong không gian làm việc.|Details used in your workspace.
Tên tổ chức|Organization name
Tên tổ chức đã được xác lập khi đăng ký.|Your organization name was set during registration.
Ngành hoạt động|Industry
Quy mô nhân sự|Company size
Thiết lập vận hành|Operational settings
Giá trị mặc định cho hoạt động đào tạo.|Defaults for your training activities.
Múi giờ|Time zone
Việt Nam (UTC+7)|Vietnam (UTC+7)
Thời hạn hoàn thành khóa học|Course completion deadline
Số ngày mặc định|Default number of days
Áp dụng khi giao khóa học mà không chọn thời hạn riêng.|Used for course assignments without a custom deadline.
Cài đặt đang được áp dụng|Settings are up to date
Đã lưu cài đặt tổ chức.|Organization settings saved.
Đang tải cài đặt…|Loading settings…
Không tải được cài đặt tổ chức.|Unable to load organization settings.
Dịch vụ|Services
Công nghệ thông tin|Information technology
Sản xuất|Manufacturing
Giáo dục|Education
Tài chính|Finance
Y tế|Healthcare
Bán lẻ|Retail
Khác|Other
1–20 nhân viên|1–20 employees
21–100 nhân viên|21–100 employees
101–500 nhân viên|101–500 employees
Trên 500 nhân viên|Over 500 employees
ngày|days
giờ|hours
phút|minutes
người|people
nhân viên|employees
thành viên|members
phòng ban|departments
vị trí|positions
khóa học|courses
suất|seats
đợt|programs
Tổng quan đội ngũ|Team overview
Tiến độ đánh giá|Assessment progress
Tỷ lệ nộp bài|Submission rate
TỶ LỆ NỘP BÀI|SUBMISSION RATE
Hành trình tham gia|Participation status
Phân bố trạng thái|Status distribution
Quản lý đợt đánh giá|Manage assessments
Phòng ban|Departments
Nhân viên|Employee
Chưa kích hoạt|Not activated
Chưa nộp|Not submitted
Đã nộp|Submitted
Đã chấm|Graded
Tỷ lệ nộp|Submission rate
Tất cả phòng ban|All departments
Mọi phòng ban|All departments
Cột trạng thái|Status columns
Tỷ lệ thấp trước|Lowest rate first
Tỷ lệ cao trước|Highest rate first
Tên phòng ban|Department name
Tìm phòng ban hoặc nhân viên|Search departments or employees
Xóa bộ lọc|Clear filters
Đặt lại|Reset
Chọn tất cả|Select all
Bỏ chọn tất cả|Deselect all
Không tìm thấy kết quả|No results found
Không có kết quả phù hợp|No matching results
Xem chi tiết|View details
Gửi thông báo|Send announcement
Phòng ban & vị trí|Departments & positions
Độ phủ chuẩn năng lực|Competency coverage
Đợt đào tạo đang chạy|Active training programs
Danh sách thành viên|Member directory
Nhân viên theo phòng ban và vị trí.|Employees by department and position
Tìm tên hoặc email|Search name or email
Mọi vai trò|All roles
Mọi trạng thái|All statuses
Mời thành viên|Invite member
Mời nhân sự|Invite employees
Mời nhân viên|Invite employees
Mời nhanh|Quick invite
Đợt đánh giá|Assessment
Gửi thông báo & Hạn chót|Announcements & deadlines
Quản lý phòng ban|Manage departments
Quản lý vị trí|Manage positions
Vị trí công việc|Job positions
Phân công quản lý|Assign managers
Chưa phân công|Unassigned
Đã phân công|Assigned
Thêm nhân viên mới|Add an employee
Xem tất cả|View all
Tìm kiếm nhân viên|Search employees
Hồ sơ nhân viên|Employee profile
Hồ sơ thành viên|Member profile
Chi tiết thành viên|Member details
Chi tiết nhân viên|Employee details
Phòng ban & vị trí|Department & position
Đổi vai trò|Change role
Xác nhận cải thiện|Confirm improvement
Xác nhận mức|Confirm level
Năng lực|Competencies
Khoảng trống|Gaps
Học tập|Learning
Đánh giá|Assessment
Nhiệm vụ|Tasks
Minh chứng|Evidence
Thành tựu|Achievements
Năng lực theo lĩnh vực|Competencies by domain
Hiện tại|Current
Yêu cầu|Required
Chưa đánh giá|Not assessed
Chưa xác nhận|Unverified
Đã xác nhận|Verified
Chuẩn vị trí|Position standard
Đánh giá đầu vào|Initial assessment
Lộ trình học tập|Learning path
Khóa học đề xuất|Recommended courses
Khóa học phù hợp|Suggested course
Xem khóa học|View course
Xem chi tiết khóa học|View course details
Cơ bản|Foundation
Trung cấp|Intermediate
Nâng cao|Advanced
Chưa đạt|Not yet achieved
Đã đạt|Achieved
Đạt chuẩn|Meets standard
Cần bổ sung|Development needed
Năng lực cần bổ sung|Competencies to develop
Năng lực chưa đáp ứng|Competencies below target
Khai thác dữ liệu và thông tin|Data and information literacy
Giao tiếp và hợp tác trong môi trường số|Digital communication and collaboration
Sáng tạo nội dung số|Digital content creation
An toàn|Digital safety
Giải quyết vấn đề|Problem solving
Ứng dụng trí tuệ nhân tạo|Artificial intelligence applications
Khai thác dữ liệu và thông tin|Data and information literacy
Lĩnh vực|Domain
Lĩnh vực năng lực|Competency domains
Chọn để cài đặt vị trí|Select to configure positions
Thiết lập kiến trúc năng lực|Competency architecture
Kiến trúc năng lực doanh nghiệp|Organizational competency architecture
Phạm vi năng lực số|Digital competency scope
Phạm vi đào tạo|Training scope
Phạm vi áp dụng|Scope
Toàn doanh nghiệp|Entire organization
Chọn phòng ban|Select department
Quy tắc & Hướng dẫn|Rules & guidance
Danh mục khóa học|Course catalog
Xem khoảng trống|View gaps
Đã hiểu|Got it
Quy tắc & Hướng dẫn phạm vi năng lực|Competency scope rules & guidance
Trong phạm vi đang chọn|In the selected scope
Trong phạm vi doanh nghiệp|In the organization scope
Đã mở · ngoài phạm vi|Unlocked · outside scope
Chưa mua|Not purchased
Đã chọn vào giỏ|Added to cart
Trạng thái|Status
Chọn ô|Select a cell
Đặt phạm vi & lưu|Set scope & save
Khóa học & suất học|Courses & learning seats
Tên lĩnh vực|Domain name
Cài đặt vị trí|Configure positions
Kế thừa phạm vi doanh nghiệp|Inherit organization scope
Kế thừa doanh nghiệp|Inherit organization
Phạm vi riêng|Custom scope
Phạm vi chung toàn doanh nghiệp|Organization-wide scope
Cấp 1|Level 1
Cấp 2|Level 2
Cấp 3|Level 3
Chọn mua +|Add to purchase +
Đang áp dụng|Applied
Đã có quyền học|Access unlocked
Miễn phí|Free
Miễn phí (Trial)|Free (trial)
Học phần|Modules
Năng lực đáp ứng|Competencies covered
Xem mô tả khóa học|View course description
Mua thêm suất|Buy more seats
Thêm vào giỏ|Add to cart
Thêm suất vào giỏ|Add seats to cart
Mua suất học|Buy learning seats
Tổng suất học|Total seats
Đã sử dụng|Used
Còn lại|Available
Mỗi suất dành cho một nhân viên trong khóa học này.|Each seat gives one employee access to this course.
Chọn cấp cho vị trí|Set the position level
Vị trí áp dụng|Applicable position
Lưu chuẩn vị trí|Save position standard
Không áp dụng|Not applicable
Mức tham chiếu theo vị trí|Reference levels by position
Tham khảo|Reference
Chuẩn theo lĩnh vực|Domain standard
Chọn khóa học cho vị trí|Select a course for the position
Tổng quan năng lực|Competency overview
Chi tiết khoảng trống năng lực|Competency gap details
Thu hẹp khoảng trống|Close competency gaps
Theo chuẩn vị trí · các lĩnh vực đã đánh giá|Against position standards · assessed domains
Lĩnh vực đang xem|Selected domain
Năng lực còn thiếu|Competencies to develop
Khóa học bù đắp|Courses to close gaps
Tra cứu nhân viên|Find employees
Xem chi tiết từng người|View individual details
Tìm tên hoặc mã nhân viên|Search name or employee ID
Tất cả vị trí|All positions
Mọi cấp bậc|All job grades
Tính lại|Recalculate
Tính lại toàn bộ|Recalculate all
Chờ kết quả đánh giá tổng thể.|Awaiting the overall assessment results.
Chưa có chuẩn vị trí|No position standard
Chờ đánh giá|Awaiting assessment
Khóa học năng lực số|Digital competency courses
Chương trình chuẩn|Course catalog
Cấp độ|Level
1 · Cơ bản|1 · Foundation
2 · Trung cấp|2 · Intermediate
3 · Nâng cao|3 · Advanced
Tìm miền, tên hoặc mã khóa (VD: A4-I)...|Search domain, course name or code (e.g. A4-I)...
Khóa học đang xem|Selected course
Khóa học đề xuất cho nhân viên|Recommended employee course
Về khoảng trống năng lực|Back to competency gaps
Lĩnh vực|Domain
Mã khóa|Course code
Thời lượng|Duration
Điều kiện|Prerequisites
Không yêu cầu|None
Phân công|Assignments
Đưa vào đợt đào tạo|Add to training program
Thanh toán|Checkout
Giỏ hàng|Cart
Số lượng|Quantity
Đơn giá|Unit price
Thành tiền|Subtotal
Tổng cộng|Total
Tiếp tục thanh toán|Continue to checkout
Xóa|Delete
Chỉnh sửa|Edit
Tạo mới|Create
Thêm mới|Add new
Tạo phòng ban|Create department
Sửa phòng ban|Edit department
Danh sách phòng ban|Departments
Chi tiết phòng ban|Department details
Cấu trúc tổ chức|Organization structure
Mã phòng ban|Department code
Mô tả|Description
Người quản lý|Manager
Phòng ban cấp trên|Parent department
Không có (phòng ban gốc)|None (root department)
Chưa phân công quản lý|No manager assigned
Lưu trữ|Archive
Lưu trữ phòng ban|Archive department
Nhân sự trên trang|Employees on this page
Có quản lý trên trang|Managed departments on this page
Phòng ban phù hợp|Matching departments
Tìm theo tên hoặc mã phòng ban|Search department name or code
Tổng nhân sự|Total employees
Chưa có mô tả|No description
Tiến độ đào tạo|Training progress
Vị trí phù hợp|Matching positions
Có chuẩn trên trang|Positions with standards on this page
Quản lý vị trí công việc|Manage job positions
Tạo vị trí mới|Create position
Tạo vị trí công việc|Create job position
Sửa vị trí công việc|Edit job position
Mã vị trí|Position code
Tên vị trí|Position name
Cấp bậc|Job grade
Chưa gắn phòng ban|No department assigned
Chưa xếp cấp bậc|No job grade assigned
Lưu trữ vị trí công việc|Archive job position
Tìm theo tên hoặc mã vị trí|Search position name or code
Chi tiết vị trí|Position details
Yêu cầu năng lực|Competency requirements
Chỉnh yêu cầu năng lực|Edit competency requirements
Lịch sử phiên bản|Version history
Phủ khóa học|Course coverage
Phiên bản đang áp dụng|Active version
Hiệu lực từ|Effective from
Nhân sự đang giữ vị trí|Employees in this position
Chưa có mô tả cho vị trí này.|No description for this position.
Phát triển đội ngũ|Team development
Từ năng lực đến hành động|From competency to action
Bản đồ phát triển|Development map
Lĩnh vực cần tập trung|Priority domains
Chọn lĩnh vực để xem hướng bồi dưỡng|Select a domain to explore development options
Mức đáp ứng vị trí|Position readiness
Tiến độ đào tạo|Training progress
Hoàn thành khóa học|Course completion
Đang học|In progress
Xem phân công|View assignments
Tiến độ thấp trước|Lowest progress first
Tiến độ cao trước|Highest progress first
Tìm khóa học|Search courses
Chưa bắt đầu|Not started
Đang tiến triển|In progress
Hoàn thành|Completed
Đã hoàn thành|Completed
Cần đánh giá|Assessment needed
Cần thiết lập chuẩn|Position standard needed
Ưu tiên bồi dưỡng|Development priority
Kết quả hiện tại|Current results
Theo phòng ban|By department
Theo vị trí|By position
Theo cấp bậc|By job grade
Nhân sự tham gia|Participants
Hạn làm bài|Assessment deadline
Theo dõi bài làm|Track submissions
Báo cáo năng lực|Competency report
Về Tổng quan|Back to overview
Đang đánh giá|Assessment in progress
Chưa gửi|Not sent
Tiến độ tham gia|Participation progress
Đã kích hoạt|Activated
Hoàn thành bài làm|Assessment completed
Đã đăng ký danh sách|Registered participants
Đã sẵn sàng làm bài|Ready to take the assessment
Đã nộp bài đánh giá|Assessment submitted
Hạn hoàn thành bài đánh giá|Assessment deadline
Điều chỉnh thời hạn|Adjust deadline
Danh sách nhân sự tham gia|Participant list
Nhập file Excel / CSV|Import Excel / CSV
Thêm từng người|Add individually
Tải mẫu .csv|Download CSV template
Dán dữ liệu trực tiếp từ Excel|Paste data from Excel
Chọn tải file lên hoặc dán trực tiếp:|Upload a file or paste data:
Thêm dòng mới|Add row
Xóa tất cả|Clear all
Họ và tên|Full name
Email|Email
Hợp lệ|Valid
Không hợp lệ|Invalid
Gán phòng ban|Assign department
Áp dụng|Apply
Gửi lời mời|Send invitations
Gửi lại|Resend
Mời thêm|Invite more
Thu gọn danh sách|Collapse list
Mở danh sách|Expand list
Tìm nhân viên, phòng ban...|Search employee or department...
Tìm nhân viên, phòng ban…|Search employee or department…
Thời điểm nộp|Submitted at
Thao tác|Actions
Đã mời|Invited
Bài khảo sát của bạn đã hoàn thành|Your assessment is complete
Xem kết quả của tôi|View my results
Làm bài khảo sát|Take the assessment
Bài đánh giá năng lực|Competency assessment
Kết quả theo lĩnh vực|Results by domain
Chi tiết từng nhân viên|Individual results
Chi tiết đánh giá theo 6 lĩnh vực|Results across six domains
Đánh giá chung|Overall level
Phân bố|Distribution
Chọn lĩnh vực để xem chi tiết|Select a domain to view details
Gửi thông báo & Giao hạn hoàn thành|Announcements & deadlines
Chọn nhanh mẫu nội dung:|Quick templates:
Đánh giá năng lực|Competency assessment
Khóa học bắt buộc|Required course
Khảo sát doanh nghiệp|Organization survey
Tiêu đề thông báo|Announcement title
Phân loại|Category
Nội dung thông điệp|Message
Thời hạn hoàn thành (Deadline):|Completion deadline:
3 ngày|3 days
7 ngày|7 days
Cuối tháng|End of month
Không đặt hạn chót (thông báo thường)|No deadline (general announcement)
Đối tượng nhận thông báo:|Recipients:
Toàn công ty|Entire organization
Chọn từng người|Select individuals
Gửi thông báo ngay|Send announcement
Đăng nhập|Sign in
Đăng ký|Sign up
Mật khẩu|Password
Quên mật khẩu?|Forgot password?
Ghi nhớ đăng nhập|Remember me
Chưa có tài khoản?|Don't have an account?
Đã có tài khoản?|Already have an account?
Đăng ký ngay|Sign up now
Chào mừng trở lại|Welcome back
Trang chủ|Home
Liên hệ|Contact
Hỗ trợ|Support
Điều khoản sử dụng|Terms of use
Chính sách bảo mật|Privacy policy
Lộ trình|Learning path
Tổng quan học tập|Learning overview
Lộ trình năng lực|Competency path
Chứng nhận và kết quả|Certificates & results
Hồ sơ cá nhân|Personal profile
Góp ý của tôi|My feedback
Báo lỗi của tôi|My bug reports
Điều hướng|Navigation
Hồ sơ|Profile
Cổng học tập DigiTalent AI|DigiTalent AI learning portal
Chi tiết khóa học|Course details
Bắt đầu học|Start learning
Tiếp tục học|Continue learning
Làm bài|Take assessment
Nộp bài|Submit assessment
Câu tiếp theo|Next question
Câu trước|Previous question
Kết thúc|Finish
Đã hoàn thành bài đánh giá|Assessment complete
Trợ lý AI|AI assistant
Mở trợ lý hỗ trợ đào tạo|Open learning assistant
Không thể tải thông tin tổng quan doanh nghiệp|Unable to load the business overview
Đang tải tổng quan|Loading overview
Đang tải dữ liệu|Loading data
Lưu thành công|Saved successfully
Có lỗi xảy ra|Something went wrong
Đang xử lý…|Processing…
Đang xử lý...|Processing...
Xem thêm|Show more
Tải xuống|Download
Xuất báo cáo|Export report
Xuất Excel|Export Excel
Tìm kiếm...|Search...
Tìm kiếm…|Search…
Đã chọn|Selected
Lựa chọn|Options
Thông tin|Information
Chi tiết|Details
Hành động|Actions
Quyền truy cập|Access permissions
Vai trò|Role
Mã nhân viên|Employee ID
Quản lý đội ngũ|Team management
Danh sách nhân viên|Employee directory
Phòng ban - Vị trí|Department - Position
Chưa có kết quả|No results yet
Không tìm thấy nhân viên|No employees found
Tất cả trạng thái|All statuses
Tất cả vai trò|All roles
Tất cả lĩnh vực|All domains
Tất cả cấp độ|All levels
Đã đạt yêu cầu|Meets requirements
Chưa đạt yêu cầu|Below requirements
Chưa có thông tin|Not available
Thông tin chung|General information
Nội dung|Content
Ghi chú|Notes
Ngày tạo|Created on
Ngày cập nhật|Updated on
Đang cập nhật|Updating
Tạo đợt đào tạo|Create training program
Giao nhiệm vụ|Assign task
Chưa có trong gói|Not included in your plan
Đã mua|Purchased
Đang chọn mua|Selected for purchase
Chương trình khóa học|Course syllabus
Chứng chỉ|Certificate
Giao khóa học|Assign course
Giao đào tạo|Assign training
Người tham gia|Participants
Ngày bắt đầu|Start date
Ngày kết thúc|End date
Hạn hoàn thành|Deadline
Tên đợt đào tạo|Training program name
Mục tiêu|Goal
Đang diễn ra|In progress
Sắp diễn ra|Upcoming
Đã kết thúc|Ended
Tạo nhiệm vụ|Create task
Danh sách nhiệm vụ|Task list
Tên nhiệm vụ|Task name
Nhiệm vụ của tôi|My tasks
Nộp minh chứng|Submit evidence
Xem minh chứng|View evidence
Đang chờ|Pending
Đã duyệt|Approved
Từ chối|Reject
Phê duyệt|Approve
Mới nhất|Newest first
Cũ nhất|Oldest first
Tên A–Z|Name A–Z
Tên Z–A|Name Z–A
Tên A-Z|Name A-Z
Tên Z-A|Name Z-A
Theo tên|By name
Tìm theo tên|Search by name
Tìm theo tên hoặc email|Search by name or email
Chưa có thông báo|No notifications
Đánh dấu đã đọc|Mark as read
Đánh dấu tất cả đã đọc|Mark all as read
Xem tất cả thông báo|View all notifications
Không có thông báo mới|No new notifications
Mở rộng danh sách|Expand list
Tên khóa học|Course name
Mức độ|Priority
Cao|High
Thấp|Low
Xác nhận mức năng lực|Confirm competency level
Năng lực|Competencies
Trình độ xác nhận|Verified level
Bằng chứng / ghi chú đánh giá|Evidence / assessment notes
Xác nhận mức|Confirm level
Đang xác nhận…|Confirming…
Chưa có bằng chứng|No evidence yet
Gửi|Send
Chọn|Select
Sao chép|Copy
Đã sao chép|Copied
Đường dẫn|Breadcrumbs
Chọn tệp|Choose file
Tải lên|Upload
Xóa bộ lọc|Clear filters
Tìm kiếm phòng ban...|Search departments...
Tìm kiếm vị trí...|Search positions...
Chọn vị trí|Select position
Chọn khóa học|Select course
Chọn nhân viên|Select employees
Hoàn tất|Done
Tải lại|Reload
Đã gửi|Sent
Lưu bản nháp|Save draft
Bản nháp|Draft
Đang mở|Open
Đã đóng|Closed
Hủy thay đổi|Discard changes
Khôi phục|Restore
Không thể tải dữ liệu|Unable to load data
Vui lòng thử lại.|Please try again.
Không tìm thấy|Not found
Quay về tổng quan|Back to overview
Về tổng quan|Back to overview
Thêm|Add
Chỉnh|Edit
Sửa|Edit
Tùy chọn|Optional
Bắt buộc|Required
Không bắt buộc|Optional
Giới hạn|Limit
Sử dụng|Usage
Gói dịch vụ|Subscription plan
Hóa đơn|Invoices
Thanh toán thành công|Payment successful
Quản trị hệ thống|System administration
Quản lý tổ chức|Organizations
Người dùng|Users
Cài đặt|Settings
Thống kê|Analytics
Nhật ký hoạt động|Audit log
Quản lý khóa học|Course management
Quản lý người dùng|User management
Tài khoản|Account
Quyền hạn|Permissions
Mã|Code
Tên|Name
Mô tả ngắn|Short description
Đang gửi…|Sending…
Đang gửi...|Sending...
Đang tải danh sách…|Loading list…
Tạo|Create
Chờ xử lý|Pending
Chưa phân loại|Uncategorized
Đang sử dụng|In use
Ngừng hoạt động|Inactive
Thông tin đã được lưu|Information saved
Tìm hiểu thêm|Learn more
Chi tiết chứng nhận|Certificate details
Thời hạn|Deadline
Số người tham gia|Number of participants
Kết quả đánh giá|Assessment results
Chưa hoàn thành|Incomplete
Tổng|Total
Tất cả nhân viên|All employees
Quản lý nhân sự|People management
Không có kết quả|No results
Xem báo cáo|View report
Thông tin khóa học|Course information
Giao cho nhân viên|Assign to employees
Không tìm thấy khóa học|No courses found
Số suất|Seats
Học phần đã hoàn thành|Completed modules
Nội dung khóa học|Course content
Tổng quan khóa học|Course overview
Quản lý đào tạo|Training management
Lịch sử|History
Thời gian hoàn thành|Completion time
Làm lại|Try again
Tiếp theo|Next
Về trước|Previous
Đã đọc|Read
Chưa đọc|Unread
Hôm nay|Today
Hôm qua|Yesterday
Tuần này|This week
Tháng này|This month
Đang kết nối|Connecting
Tìm theo tên hoặc mã nhân viên|Search name or employee ID
Đã chọn tất cả|All selected
Chọn phòng ban để xem|Select a department
Giữ nguyên|Keep unchanged
Áp dụng thay đổi|Apply changes
Gửi lời mời & bắt đầu đánh giá|Send invitations & start assessment
Hạn hoàn thành bài khảo sát|Survey deadline
Tự động chấm điểm|Automatically graded
Kết quả khảo sát|Survey results
Đánh giá theo lĩnh vực|Assessment by domain
Hoàn thành bài khảo sát|Complete the survey
Xem kết quả|View results
Chờ hoàn thành|Awaiting completion
Làm bài đánh giá|Take assessment
Chưa làm bài|Not started
Đang làm bài|In progress
Đã nộp bài|Submitted
Thời điểm hoàn thành|Completed at
Mời nhân viên tham gia đánh giá năng lực|Invite employees to the competency assessment
Tìm kiếm theo tên hoặc email|Search by name or email
Theo dõi tiến độ|Track progress
Gửi nhắc nhở|Send reminder
Đã hết thời hạn|Deadline passed
Chưa đến hạn|Before deadline
Kết quả tạm thời|Live results
Kết quả cuối cùng|Final results
Tổng quan đánh giá|Assessment overview
Xem kết quả đánh giá|View assessment results
Đóng danh sách|Close list
Xem danh sách|View list
Mời nhân sự vào phòng này|Invite employees to this department
Nhân sự phân tích|Analyzed employees
Mức đáp ứng|Readiness
Theo lĩnh vực|By domain
Miền|Domains
Khóa học đang xem|Selected course
Trong phạm vi|In scope
Ngoài phạm vi|Outside scope
Đặt phạm vi doanh nghiệp|Set organization scope
Đang là phạm vi doanh nghiệp|Current organization scope
Miễn phí (TRIAL)|Free (TRIAL)
Học phần đã mở|Unlocked modules
Quy tắc|Rules
Phạm vi năng lực|Competency scope
Phạm vi năng lực doanh nghiệp|Organizational competency scope
Phạm vi đang chọn|Selected scope
Phạm vi doanh nghiệp|Organization scope
Phạm vi phòng ban|Department scope
Kế thừa phạm vi năng lực doanh nghiệp|Inherit organization competency scope
Danh sách|List
Thêm thành viên|Add member
Quản lý thành viên|Manage members
Nhập từ Excel|Import from Excel
Mời bằng email|Invite by email
Gửi email|Send email
Hồ sơ năng lực|Competency profile
Làm mới dữ liệu|Refresh data
Đăng nhập gần đây|Recent sign-ins
Không xác định|Unknown
Đổi mật khẩu thành công.|Password changed successfully.
Không thể đổi mật khẩu.|Unable to change your password.
Không thể cập nhật cài đặt.|Unable to update settings.
Thông tin tổ chức|Organization information
Tên doanh nghiệp|Company name
Mặc định|Default
Việt Nam|Vietnam
Quốc tế|International
Lưu cài đặt|Save settings
Vui lòng kiểm tra thông tin.|Please check your information.
Tải dữ liệu|Load data
Đang làm mới…|Refreshing…
Đã lưu thay đổi|Changes saved
Chọn ngôn ngữ|Choose language
Ngôn ngữ|Language
Tiếng Việt|Vietnamese
Tiếng Anh|English
Gợi ý|Suggestions
Đã có suất học|Seats available
Tất cả khóa học|All courses
Đang phân công|Assigned
Chưa phân công|Unassigned
Theo dõi|Track
Tiến độ|Progress
Xem lộ trình|View learning path
Tìm kiếm khóa học|Search courses
Chưa có chuẩn năng lực|No competency standard
Không tìm thấy phòng ban|No departments found
Không tìm thấy vị trí|No positions found
Tỷ lệ hoàn thành|Completion rate
Ngày hoàn thành|Completion date
Đã hoàn tất|Completed
Tình trạng|Status
Số lượng nhân viên|Employee count
Danh sách phòng ban|Department list
Danh sách vị trí|Position list
Tổng số|Total
Lưu trữ vị trí|Archive position
Lưu trữ nhân viên|Archive employee
Xác nhận lưu trữ|Confirm archive
Quay về|Back
Mở rộng tất cả|Expand all
Thu gọn tất cả|Collapse all
Chọn cấp độ|Select level
Hành trình phát triển|Development journey
Đã có quyền học|Access unlocked
Đã mua suất|Seats purchased
Xem giỏ hàng|View cart
Mua ngay|Buy now
Giá|Price
Tổng tiền|Total amount
Thanh toán ngay|Pay now
Thông tin thanh toán|Billing information
Phương thức thanh toán|Payment method
Xác nhận thanh toán|Confirm payment
Tên người nhận|Recipient name
Tải mẫu|Download template
Nhập danh sách|Import list
Tải danh sách|Download list
Tất cả phòng ban và vị trí|All departments and positions
Gần đây|Recent
Tìm nội dung|Search content
Tìm nhân viên|Search employees
Hoạt động gần đây|Recent activity
Hướng dẫn sử dụng|User guide
Nâng cấp|Upgrade
Nâng cấp gói|Upgrade plan
Xem gói|View plans
Quản lý gói|Manage subscription
Hủy gói|Cancel subscription
Hỗ trợ khách hàng|Customer support
Tình trạng hệ thống|System status
Trung tâm trợ giúp|Help center
Liên kết|Link
Đi tới|Go to
Xem hồ sơ|View profile
Mời|Invite
Thêm phòng ban|Add department
Thêm vị trí|Add position
Chưa có nhân viên|No employees yet
Chưa có phòng ban|No departments yet
Chưa có vị trí|No positions yet
Hệ thống|System
Giao diện|Appearance
Chế độ sáng|Light mode
Chế độ tối|Dark mode
Đã chọn vào giỏ hàng|Added to cart
Tiếp tục mua sắm|Continue shopping
Quay lại danh mục|Back to catalog
Xóa khỏi giỏ|Remove from cart
Đang tải khóa học…|Loading courses…
Đang tải báo cáo…|Loading report…
Đang tải nhân sự…|Loading employees…
Đang tải phòng ban…|Loading departments…
Đang tải vị trí…|Loading positions…
Đang tải kết quả…|Loading results…
Tìm kiếm nhanh|Quick search
Kết quả tìm kiếm|Search results
Trang trước|Previous page
Trang sau|Next page
Không tìm thấy dữ liệu|No data found
Chọn số dòng|Choose rows per page
Số dòng mỗi trang|Rows per page
Mỗi trang|Per page
Đóng menu|Close menu
Mở menu|Open menu
Chọn trạng thái|Select status
Lọc|Filter
Bộ lọc|Filters
Lọc theo|Filter by
Làm sạch bộ lọc|Clear filters
Quản trị nền tảng|Platform administration
Người quản lý|Manager
Quản lý trực tiếp|Line manager
Chuyên viên|Specialist
Trưởng nhóm|Team leader
Lãnh đạo|Leadership
Chưa gán|Unassigned
Tổng quan năng lực đội ngũ|Team competency overview
Nội dung bài học|Lesson content
Làm bài kiểm tra|Take quiz
Kiểm tra|Quiz
Thời gian còn lại|Time remaining
Lưu câu trả lời|Save answers
Chọn câu trả lời|Select an answer
Trở về|Back
Chưa có hoạt động mới|No recent activity
Đóng lại|Close
Mở ra|Open
Ghi nhận|Record
Đã ghi nhận|Recorded
Hủy thao tác|Cancel
Thông tin bổ sung|Additional information
Truy cập|Access
Lần đăng nhập|Sign-in
Hành vi|Action
Người thực hiện|Performed by
Tài nguyên|Resource
Lọc theo thời gian|Filter by date
Từ ngày|From date
Đến ngày|To date
Xem|View
Trống|Empty
Hiện|Show
Ẩn|Hide
Tùy chỉnh|Customize
Chỉnh sửa thông tin|Edit information
Thông tin cơ bản|Basic information
Lưu và tiếp tục|Save and continue
Lưu và đóng|Save and close
Bạn có thay đổi chưa lưu.|You have unsaved changes.
Quay lại chỉnh sửa|Back to editing
Tiếp tục chỉnh sửa|Continue editing
Chọn ngày|Select date
Chọn thời gian|Select time
Chọn hạn hoàn thành|Select deadline
Tạo thành công|Created successfully
Thêm thành công|Added successfully
Gửi thành công|Sent successfully
Đã cập nhật|Updated
Vui lòng nhập thông tin|Please enter the required information
Thông tin không hợp lệ|Invalid information
Không có quyền truy cập|Access denied
Bạn không có quyền truy cập trang này.|You do not have permission to access this page.
Không tìm thấy trang|Page not found
Về trang chủ|Back to home
Đang xác thực…|Authenticating…
Đang đăng nhập…|Signing in…
Đăng nhập bằng email|Sign in with email
Địa chỉ email|Email address
Nhập email|Enter your email
Nhập mật khẩu|Enter your password
Xác nhận mật khẩu|Confirm password
Tạo tài khoản|Create account
Tên đầy đủ|Full name
Đăng nhập ngay|Sign in now
Gửi liên kết đặt lại|Send reset link
Đặt lại mật khẩu|Reset password
Quay lại đăng nhập|Back to sign in
Tiếp tục với Google|Continue with Google
Hoặc|Or
Đăng nhập tài khoản|Sign in to your account
Chào mừng bạn trở lại|Welcome back
Khám phá|Explore
Giới thiệu|About
Bảng giá|Pricing
Sản phẩm|Product
Giải pháp|Solutions
Đăng ký dùng thử|Start free trial
Trải nghiệm ngay|Try it now
Xem thêm khóa học|Explore more courses
Đối tác|Partners
Điều khoản|Terms
Chính sách|Policies
Tất cả quyền được bảo lưu.|All rights reserved.
`.trim().split('\n').map(line => { const separator = line.indexOf('|'); return [line.slice(0, separator), line.slice(separator + 1)]; })) };
