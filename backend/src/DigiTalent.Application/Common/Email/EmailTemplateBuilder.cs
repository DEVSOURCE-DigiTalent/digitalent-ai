using System.Net;

namespace DigiTalent.Application.Common.Email;

/// <summary>
/// Trình tạo khuôn mẫu Email HTML hiện đại, chuẩn responsive, giao diện trực quan và dễ thao tác trên mọi ứng dụng mail (Gmail, Outlook, Apple Mail).
/// </summary>
public static class EmailTemplateBuilder
{
    private const string BrandColor = "#2563eb"; // Royal Blue
    private const string BrandName = "DigiTalent AI";
    private const string PrimaryBg = "#f4f6fb";
    private const string CardBg = "#ffffff";
    private const string TextColor = "#334155";
    private const string HeadingColor = "#0f172a";
    private const string BorderColor = "#e2e8f0";

    /// <summary>
    /// Email mời nhân viên tham gia doanh nghiệp và tự thiết lập mật khẩu.
    /// </summary>
    public static string BuildInvitationEmail(
        string recipientName,
        string organizationName,
        string activationLink,
        string? note = null)
    {
        var safeName = WebUtility.HtmlEncode(recipientName);
        var safeOrg = WebUtility.HtmlEncode(organizationName);
        var safeLink = WebUtility.HtmlEncode(activationLink);
        var safeNote = string.IsNullOrWhiteSpace(note) ? null : WebUtility.HtmlEncode(note);

        var contentHtml = $@"
            <div style=""margin-bottom: 24px;"">
                <p style=""font-size: 16px; font-weight: 600; color: {HeadingColor}; margin: 0 0 8px;"">Xin chào {safeName},</p>
                <p style=""font-size: 15px; color: {TextColor}; line-height: 1.6; margin: 0 0 16px;"">
                    Bạn đã được doanh nghiệp <strong>{safeOrg}</strong> mời tham gia không gian làm việc và đào tạo trên hệ thống <strong>{BrandName}</strong>.
                </p>
            </div>

            {(safeNote != null ? $@"
            <div style=""background-color: #f8fafc; border-left: 4px solid {BrandColor}; border-radius: 4px 8px 8px 4px; padding: 14px 18px; margin: 0 0 24px;"">
                <div style=""font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;"">Ghi chú từ quản trị viên</div>
                <div style=""font-size: 14px; color: {HeadingColor}; line-height: 1.5;"">{safeNote}</div>
            </div>" : "")}

            <div style=""background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin: 0 0 28px;"">
                <div style=""font-size: 14px; color: #166534; line-height: 1.5;"">
                    <strong>Bảo mật mật khẩu:</strong> Bạn sẽ tự thiết lập mật khẩu cá nhân cho tài khoản. Doanh nghiệp và quản trị viên không biết và không lưu mật khẩu của bạn.
                </div>
            </div>

            <div style=""text-align: center; margin: 28px 0;"">
                <a href=""{safeLink}"" target=""_blank"" style=""display: inline-block; background-color: {BrandColor}; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);"">
                    Xác nhận lời mời & Đặt mật khẩu
                </a>
            </div>

            <div style=""background-color: #f8fafc; border: 1px solid {BorderColor}; border-radius: 8px; padding: 14px; margin-top: 24px; font-size: 12.5px; color: #64748b; line-height: 1.5; word-break: break-all;"">
                <span style=""font-weight: 600; color: #475569;"">Nếu nút bấm trên không mở được:</span> Vui lòng sao chép liên kết sau và dán vào thanh địa chỉ trình duyệt:<br/>
                <a href=""{safeLink}"" style=""color: {BrandColor}; text-decoration: underline;"">{safeLink}</a>
            </div>

            <p style=""font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 24px 0 0; text-align: center;"">
                Liên kết này chỉ có hiệu lực một lần duy nhất. Nếu bạn không mong đợi lời mời này, bạn có thể an tâm bỏ qua email.
            </p>";

        return WrapInLayout("Lời mời tham gia doanh nghiệp", $"Tham gia {safeOrg}", contentHtml);
    }

    /// <summary>
    /// Email gửi mã OTP xác minh tài khoản (cho cá nhân hoặc doanh nghiệp).
    /// </summary>
    public static string BuildVerificationOtpEmail(
        string recipientName,
        string otp,
        int expiryMinutes = 15,
        string? verifyLink = null)
    {
        var safeName = WebUtility.HtmlEncode(recipientName);
        var safeLink = string.IsNullOrWhiteSpace(verifyLink) ? null : WebUtility.HtmlEncode(verifyLink);

        var contentHtml = $@"
            <div style=""margin-bottom: 24px;"">
                <p style=""font-size: 16px; font-weight: 600; color: {HeadingColor}; margin: 0 0 8px;"">Kính gửi {safeName},</p>
                <p style=""font-size: 15px; color: {TextColor}; line-height: 1.6; margin: 0 0 20px;"">
                    Cảm ơn bạn đã đăng ký tài khoản tại <strong>{BrandName}</strong>. Để bảo mật và hoàn tất kích hoạt, vui lòng nhập mã xác thực OTP 6 chữ số dưới đây:
                </p>
            </div>

            <div style=""background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px 16px; text-align: center; margin: 0 0 24px;"">
                <div style=""font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;"">Mã xác thực của bạn</div>
                <div style=""font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: 'SF Mono', Consolas, Menlo, Monaco, monospace; padding-left: 8px;"">{otp}</div>
                <div style=""font-size: 13px; color: #64748b; margin-top: 10px;"">Mã có hiệu lực trong vòng <strong>{expiryMinutes} phút</strong></div>
            </div>

            {(safeLink != null ? $@"
            <div style=""text-align: center; margin: 24px 0 20px;"">
                <p style=""font-size: 14px; color: {TextColor}; margin-bottom: 14px;"">Hoặc bạn có thể nhấn trực tiếp vào nút bên dưới để xác thực tự động:</p>
                <a href=""{safeLink}"" target=""_blank"" style=""display: inline-block; background-color: {BrandColor}; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);"">
                    Xác thực tài khoản ngay
                </a>
            </div>" : "")}

            <div style=""background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin-top: 24px; font-size: 13px; color: #92400e; line-height: 1.5;"">
                <strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã OTP này với bất kỳ ai để đảm bảo an toàn tài khoản của bạn.
            </div>";

        return WrapInLayout("Xác minh bảo mật", "Mã xác thực tài khoản", contentHtml);
    }

    /// <summary>
    /// Email yêu cầu đặt lại mật khẩu.
    /// </summary>
    public static string BuildPasswordResetEmail(
        string recipientName,
        string resetLink,
        int expiryMinutes = 30)
    {
        var safeName = WebUtility.HtmlEncode(recipientName);
        var safeLink = WebUtility.HtmlEncode(resetLink);

        var contentHtml = $@"
            <div style=""margin-bottom: 24px;"">
                <p style=""font-size: 16px; font-weight: 600; color: {HeadingColor}; margin: 0 0 8px;"">Xin chào {safeName},</p>
                <p style=""font-size: 15px; color: {TextColor}; line-height: 1.6; margin: 0 0 16px;"">
                    Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>{BrandName}</strong> của bạn.
                </p>
                <p style=""font-size: 15px; color: {TextColor}; line-height: 1.6; margin: 0 0 24px;"">
                    Để tạo mật khẩu mới, vui lòng nhấn vào nút bên dưới:
                </p>
            </div>

            <div style=""text-align: center; margin: 28px 0;"">
                <a href=""{safeLink}"" target=""_blank"" style=""display: inline-block; background-color: {BrandColor}; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);"">
                    Đặt lại mật khẩu
                </a>
            </div>

            <div style=""background-color: #f8fafc; border: 1px solid {BorderColor}; border-radius: 8px; padding: 14px; margin-top: 24px; font-size: 12.5px; color: #64748b; line-height: 1.5; word-break: break-all;"">
                <span style=""font-weight: 600; color: #475569;"">Nếu nút bấm không mở được:</span> Sao chép và dán liên kết sau vào trình duyệt:<br/>
                <a href=""{safeLink}"" style=""color: {BrandColor}; text-decoration: underline;"">{safeLink}</a>
            </div>

            <div style=""background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 14px; margin-top: 24px; font-size: 13px; color: #854d0e; line-height: 1.5;"">
                <strong>Thời hạn:</strong> Liên kết có hiệu lực trong vòng <strong>{expiryMinutes} phút</strong>. Nếu bạn không gửi yêu cầu này, hãy yên tâm bỏ qua email; mật khẩu hiện tại vẫn an toàn.
            </div>";

        return WrapInLayout("Bảo mật tài khoản", "Yêu cầu đặt lại mật khẩu", contentHtml);
    }

    /// <summary>
    /// Email xác nhận thanh toán đơn hàng thành công.
    /// </summary>
    public static string BuildPaymentReceiptEmail(
        string recipientName,
        string orderCode,
        string planName,
        long amount,
        DateTimeOffset paidAt,
        string portalLink)
    {
        var safeName = WebUtility.HtmlEncode(recipientName);
        var safeOrder = WebUtility.HtmlEncode(orderCode);
        var safePlan = WebUtility.HtmlEncode(planName);
        var safePortal = WebUtility.HtmlEncode(portalLink);
        var formattedAmount = $"{amount:N0} đ";

        var contentHtml = $@"
            <div style=""margin-bottom: 24px;"">
                <p style=""font-size: 16px; font-weight: 600; color: {HeadingColor}; margin: 0 0 8px;"">Xin chào {safeName},</p>
                <p style=""font-size: 15px; color: {TextColor}; line-height: 1.6; margin: 0 0 16px;"">
                    Giao dịch thanh toán của bạn đã được xác nhận thành công. Gói dịch vụ đã sẵn sàng để sử dụng.
                </p>
            </div>

            <div style=""background-color: #f8fafc; border: 1px solid {BorderColor}; border-radius: 12px; padding: 20px 24px; margin: 0 0 28px;"">
                <table style=""width: 100%; border-collapse: collapse; font-size: 14px;"">
                    <tr>
                        <td style=""padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Mã đơn hàng:</td>
                        <td style=""padding: 10px 0; font-weight: 700; color: {HeadingColor}; text-align: right; border-bottom: 1px solid #f1f5f9; font-family: monospace;"">#{safeOrder}</td>
                    </tr>
                    <tr>
                        <td style=""padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Gói dịch vụ:</td>
                        <td style=""padding: 10px 0; font-weight: 600; color: {HeadingColor}; text-align: right; border-bottom: 1px solid #f1f5f9;"">{safePlan}</td>
                    </tr>
                    <tr>
                        <td style=""padding: 10px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;"">Số tiền thanh toán:</td>
                        <td style=""padding: 10px 0; font-weight: 800; color: #16a34a; font-size: 16px; text-align: right; border-bottom: 1px solid #f1f5f9;"">{formattedAmount}</td>
                    </tr>
                    <tr>
                        <td style=""padding: 10px 0; color: #64748b;"">Thời gian thanh toán:</td>
                        <td style=""padding: 10px 0; color: #475569; text-align: right;"">{paidAt:dd/MM/yyyy HH:mm}</td>
                    </tr>
                </table>
            </div>

            <div style=""text-align: center; margin: 28px 0;"">
                <a href=""{safePortal}"" target=""_blank"" style=""display: inline-block; background-color: {BrandColor}; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);"">
                    Truy cập không gian học tập
                </a>
            </div>";

        return WrapInLayout("Biên nhận thanh toán", "Thanh toán thành công", contentHtml);
    }

    /// <summary>
    /// Email phân công khóa học mới cho nhân viên.
    /// </summary>
    public static string BuildCourseAssignmentEmail(
        string recipientName,
        string courseCode,
        string courseTitle,
        DateOnly? dueDate,
        string actionUrl)
    {
        var safeName = WebUtility.HtmlEncode(recipientName);
        var safeCode = WebUtility.HtmlEncode(courseCode);
        var safeTitle = WebUtility.HtmlEncode(courseTitle);
        var safeLink = WebUtility.HtmlEncode(actionUrl);

        var contentHtml = $@"
            <div style=""margin-bottom: 24px;"">
                <p style=""font-size: 16px; font-weight: 600; color: {HeadingColor}; margin: 0 0 8px;"">Kính gửi {safeName},</p>
                <p style=""font-size: 15px; color: {TextColor}; line-height: 1.6; margin: 0 0 16px;"">
                    Bạn vừa được phân công tham gia khóa học phát triển năng lực sau:
                </p>
            </div>

            <div style=""background-color: #f8fafc; border: 1px solid {BorderColor}; border-radius: 12px; padding: 20px 24px; margin: 0 0 24px;"">
                <div style=""font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;"">Khóa học được giao</div>
                <div style=""font-size: 17px; font-weight: 700; color: {HeadingColor}; line-height: 1.4;"">{safeCode} · {safeTitle}</div>
                {(dueDate.HasValue ? $@"
                <div style=""margin-top: 14px; padding-top: 12px; border-top: 1px dashed {BorderColor}; font-size: 14px; color: #c2410c;"">
                    <strong>Hạn hoàn thành:</strong> {dueDate.Value:dd/MM/yyyy}
                </div>" : "")}
            </div>

            <div style=""text-align: center; margin: 28px 0;"">
                <a href=""{safeLink}"" target=""_blank"" style=""display: inline-block; background-color: {BrandColor}; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);"">
                    Bắt đầu học ngay
                </a>
            </div>";

        return WrapInLayout("Đào tạo doanh nghiệp", "Phân công khóa học mới", contentHtml);
    }

    /// <summary>
    /// Email thông báo toàn thể từ ban quản lý hoặc chủ doanh nghiệp.
    /// </summary>
    public static string BuildBroadcastNotificationEmail(
        string recipientName,
        string organizationName,
        string title,
        string message,
        DateOnly? dueDate,
        string actionUrl)
    {
        var safeName = WebUtility.HtmlEncode(recipientName);
        var safeOrg = WebUtility.HtmlEncode(organizationName);
        var safeTitle = WebUtility.HtmlEncode(title);
        var safeMsg = WebUtility.HtmlEncode(message);
        var safeLink = WebUtility.HtmlEncode(actionUrl);

        var contentHtml = $@"
            <div style=""margin-bottom: 24px;"">
                <p style=""font-size: 16px; font-weight: 600; color: {HeadingColor}; margin: 0 0 8px;"">Kính gửi {safeName},</p>
                <p style=""font-size: 15px; color: {TextColor}; line-height: 1.6; margin: 0 0 16px;"">
                    Bạn có thông báo mới từ <strong>{safeOrg}</strong>:
                </p>
            </div>

            <div style=""background-color: #f8fafc; border: 1px solid {BorderColor}; border-radius: 12px; padding: 20px 24px; margin: 0 0 24px;"">
                <div style=""font-size: 17px; font-weight: 700; color: {HeadingColor}; line-height: 1.4; margin-bottom: 12px;"">{safeTitle}</div>
                <div style=""font-size: 14.5px; color: {TextColor}; line-height: 1.6; white-space: pre-wrap;"">{safeMsg}</div>
                {(dueDate.HasValue ? $@"
                <div style=""margin-top: 16px; padding: 10px 14px; background: #fff7ed; border-left: 3px solid #f97316; border-radius: 4px; font-size: 13.5px; color: #9a3412;"">
                    <strong>Thời hạn:</strong> {dueDate.Value:dd/MM/yyyy}
                </div>" : "")}
            </div>

            <div style=""text-align: center; margin: 28px 0;"">
                <a href=""{safeLink}"" target=""_blank"" style=""display: inline-block; background-color: {BrandColor}; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);"">
                    Xem chi tiết trên hệ thống
                </a>
            </div>";

        return WrapInLayout(safeOrg, safeTitle, contentHtml);
    }

    /// <summary>
    /// Email nhắc nhở khóa học sắp đến hạn hoàn thành.
    /// </summary>
    public static string BuildDeadlineReminderEmail(
        string recipientName,
        string courseCode,
        string courseTitle,
        string dueDateStr,
        string actionUrl)
    {
        var safeName = WebUtility.HtmlEncode(recipientName);
        var safeCode = WebUtility.HtmlEncode(courseCode);
        var safeTitle = WebUtility.HtmlEncode(courseTitle);
        var safeDate = WebUtility.HtmlEncode(dueDateStr);
        var safeLink = WebUtility.HtmlEncode(actionUrl);

        var contentHtml = $@"
            <div style=""margin-bottom: 24px;"">
                <p style=""font-size: 16px; font-weight: 600; color: {HeadingColor}; margin: 0 0 8px;"">Kính gửi {safeName},</p>
                <p style=""font-size: 15px; color: {TextColor}; line-height: 1.6; margin: 0 0 16px;"">
                    Hệ thống xin gửi lời nhắc về thời hạn hoàn thành khóa học của bạn:
                </p>
            </div>

            <div style=""background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px 24px; margin: 0 0 24px;"">
                <div style=""font-size: 12px; font-weight: 700; color: #c2410c; text-transform: uppercase; margin-bottom: 6px;"">Khóa học sắp đến hạn</div>
                <div style=""font-size: 17px; font-weight: 700; color: #7c2d12; line-height: 1.4;"">{safeCode} · {safeTitle}</div>
                <div style=""margin-top: 12px; font-size: 14px; font-weight: 600; color: #c2410c;"">
                    Thời hạn: {safeDate}
                </div>
            </div>

            <div style=""text-align: center; margin: 28px 0;"">
                <a href=""{safeLink}"" target=""_blank"" style=""display: inline-block; background-color: {BrandColor}; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);"">
                    Tiếp tục học ngay
                </a>
            </div>";

        return WrapInLayout("Nhắc nhở thời hạn", "Sắp hết hạn hoàn thành", contentHtml);
    }

    /// <summary>
    /// Email chương trình dùng thử (Trial verification / invite).
    /// </summary>
    public static string BuildTrialEmail(
        string email,
        string actionUrl,
        bool isVerify,
        string? code = null)
    {
        var safeEmail = WebUtility.HtmlEncode(email);
        var safeLink = WebUtility.HtmlEncode(actionUrl);
        var heading = isVerify ? "Xác minh tài khoản dùng thử" : "Lời mời tham gia không gian doanh nghiệp";
        var badge = isVerify ? "Dùng thử doanh nghiệp" : "Lời mời thành viên";

        var contentHtml = $@"
            <div style=""margin-bottom: 24px;"">
                <p style=""font-size: 15px; color: {TextColor}; line-height: 1.6; margin: 0 0 16px;"">
                    {(isVerify
                        ? "Cảm ơn bạn đã đăng ký trải nghiệm dùng thử DigiTalent AI. Vui lòng xác thực email để truy cập không gian doanh nghiệp:"
                        : "Bạn vừa nhận được lời mời tham gia vào không gian dùng thử của tổ chức trên DigiTalent AI:")}
                </p>
            </div>

            {(code != null ? $@"
            <div style=""background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;"">
                <div style=""font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px;"">Mã xác thực dùng thử</div>
                <div style=""font-size: 30px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: monospace; padding-left: 8px;"">{code}</div>
            </div>" : "")}

            <div style=""text-align: center; margin: 28px 0;"">
                <a href=""{safeLink}"" target=""_blank"" style=""display: inline-block; background-color: {BrandColor}; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);"">
                    {(isVerify ? "Xác thực tài khoản ngay" : "Tham gia không gian dùng thử")}
                </a>
            </div>

            <div style=""background-color: #f8fafc; border: 1px solid {BorderColor}; border-radius: 8px; padding: 14px; margin-top: 24px; font-size: 12.5px; color: #64748b; line-height: 1.5; word-break: break-all;"">
                <span style=""font-weight: 600; color: #475569;"">Đường dẫn trực tiếp:</span><br/>
                <a href=""{safeLink}"" style=""color: {BrandColor}; text-decoration: underline;"">{safeLink}</a>
            </div>";

        return WrapInLayout(badge, heading, contentHtml);
    }

    /// <summary>
    /// Khung bọc chung (Layout shell) chuẩn HTML Email responsive, typography và bóng đổ tinh tế.
    /// </summary>
    private static string WrapInLayout(string categoryBadge, string mainTitle, string bodyContent)
    {
        var year = DateTime.UtcNow.Year;

        return $@"<!DOCTYPE html>
<html lang=""vi"">
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{mainTitle} · {BrandName}</title>
    <!--[if mso]>
    <style type=""text/css"">
        body, table, td {{ font-family: Arial, sans-serif !important; }}
    </style>
    <![endif]-->
</head>
<body style=""margin: 0; padding: 0; background-color: {PrimaryBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: {TextColor};"">
    <table role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: {PrimaryBg}; padding: 32px 16px;"">
        <tr>
            <td align=""center"">
                <!-- Master Container Card -->
                <table role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""max-width: 580px; background-color: {CardBg}; border-radius: 16px; border: 1px solid {BorderColor}; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04); overflow: hidden;"">
                    <!-- Brand Topbar -->
                    <tr>
                        <td style=""padding: 28px 32px 20px; border-bottom: 1px solid #f1f5f9;"">
                            <table role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"">
                                <tr>
                                    <td>
                                        <span style=""font-size: 20px; font-weight: 800; color: {HeadingColor}; letter-spacing: -0.5px;"">
                                            DigiTalent <span style=""color: {BrandColor};"">AI</span>
                                        </span>
                                    </td>
                                    <td align=""right"">
                                        <span style=""display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 11.5px; font-weight: 600; padding: 4px 10px; border-radius: 9999px;"">
                                            {categoryBadge}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Email Body -->
                    <tr>
                        <td style=""padding: 32px 32px 24px;"">
                            <h1 style=""font-size: 22px; font-weight: 700; color: {HeadingColor}; line-height: 1.35; margin: 0 0 20px;"">
                                {mainTitle}
                            </h1>
                            {bodyContent}
                        </td>
                    </tr>

                    <!-- Footer Note -->
                    <tr>
                        <td style=""padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;"">
                            <p style=""font-size: 12.5px; color: #64748b; line-height: 1.5; margin: 0 0 6px;"">
                                <strong>DigiTalent AI</strong> · Nền tảng Đào tạo & Phát triển Năng lực Số
                            </p>
                            <p style=""font-size: 11.5px; color: #94a3b8; line-height: 1.4; margin: 0;"">
                                Email này được gửi tự động từ hệ thống. Vui lòng không phản hồi trực tiếp email này.<br/>
                                &copy; {year} DigiTalent AI. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
}
