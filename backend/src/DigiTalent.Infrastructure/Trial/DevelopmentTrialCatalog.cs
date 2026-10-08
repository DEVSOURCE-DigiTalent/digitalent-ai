using DigiTalent.Application.Trial;

namespace DigiTalent.Infrastructure.Trial;

// Explicitly labelled development content; this is not professional certification or production approval.
public sealed class DevelopmentTrialCatalog : ITrialCatalog
{
    private readonly TrialOptions _options;
    public bool IsProductionApproved => _options.DevelopmentEnvironment || _options.PolicyApproved;
    public IReadOnlyList<TrialBundle> Bundles { get; }
    public DevelopmentTrialCatalog(TrialOptions options)
    {
        _options = options;
        Bundles = (options.DevelopmentEnvironment || options.EnableDevelopmentBundle) ? [CreateBundle(), Missing("hr", "Nhân sự"), Missing("crm", "Kinh doanh (CRM)"), Missing("accounting", "Kế toán"), Missing("marketing", "Marketing")] : [];
    }
    private static TrialBundle Missing(string id, string name) => new(id, name, "", "", "", false, false, [], [], []);
    public static TrialBundle CreateBundle() => new("digital-skills", "Kỹ năng số cơ bản — nội dung thử Development", "development-standard-v1", "development-diagnostic-v1", "development-rubric-v1", true, true,
        [new("digital-safety", "An toàn số cơ bản", 2, 2), new("communication", "Giao tiếp số (chưa đo)", 2, 2)],
        [new("q1", "digital-safety", "Khi nhận email yêu cầu đăng nhập khẩn cấp qua liên kết lạ, bạn nên làm gì?", [new("a", "Kiểm tra người gửi và truy cập trang chính thức"), new("b", "Nhập mật khẩu theo liên kết")], "a"),
         new("q2", "digital-safety", "Cách nào giúp bảo vệ tài khoản khi mật khẩu bị lộ?", [new("a", "Bật xác thực nhiều yếu tố và thay mật khẩu"), new("b", "Dùng chung mật khẩu cho mọi tài khoản")], "a")],
        [new("safe-accounts", "Bảo vệ tài khoản và nhận biết phishing", "development-lesson-v1", "digital-safety", 2, [],
            "Bài học thử: Trước khi mở liên kết trong email, kiểm tra tên miền người gửi, yêu cầu bất thường và địa chỉ đích. Truy cập dịch vụ bằng địa chỉ chính thức đã biết thay vì liên kết khẩn cấp. Dùng mật khẩu riêng cho mỗi tài khoản và bật xác thực nhiều yếu tố. Khi nghi ngờ lộ thông tin, đổi mật khẩu qua trang chính thức và báo cho đầu mối phụ trách. Bài thực hành: liệt kê ba dấu hiệu email phishing và kiểm tra trạng thái MFA của một tài khoản thử. Nội dung Development chỉ giúp kiểm tra vòng trải nghiệm; không chứng nhận năng lực nghề nghiệp.", true)]);
}

public sealed class UnavailableTrialEmailSender : ITrialEmailSender
{
    public bool IsReady => false;
    public Task SendAsync(string email, string kind, string token, CancellationToken ct = default) => throw new InvalidOperationException("Production trial email sender is not configured.");
}
public sealed class DevelopmentCaptureTrialEmailSender : ITrialEmailSender
{
    // Tokens are returned only to the corresponding registration/invite response under explicit development options.
    public bool IsReady => true;
    public Task SendAsync(string email, string kind, string token, CancellationToken ct = default) => Task.CompletedTask;
}
