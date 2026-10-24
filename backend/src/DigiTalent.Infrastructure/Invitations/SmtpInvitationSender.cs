using System.Net;
using System.Net.Mail;
using System.Text.Encodings.Web;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.IndividualCommerce;
using Microsoft.Extensions.Options;

namespace DigiTalent.Infrastructure.Invitations;

/// <summary>Sends a single-use invitation link. The invitee chooses their own password.</summary>
public sealed class SmtpInvitationSender : IInvitationSender
{
    private readonly InvitationSettings _links;
    private readonly SmtpOptions _smtp;

    public SmtpInvitationSender(InvitationSettings links, IOptions<IndividualCommerceOptions> options)
    {
        _links = links;
        _smtp = options.Value.Smtp;
    }

    public async Task<string?> SendAsync(InvitationMessage invitation, CancellationToken cancellationToken = default)
    {
        var link = $"{_links.FrontendBaseUrl.TrimEnd('/')}/activate/{Uri.EscapeDataString(invitation.Token)}";
        var safeName = HtmlEncoder.Default.Encode(invitation.FullName);
        var safeOrganization = HtmlEncoder.Default.Encode(invitation.OrganizationName);
        var safeLink = HtmlEncoder.Default.Encode(link);
        using var email = new MailMessage
        {
            From = new MailAddress(_smtp.FromEmail, _smtp.FromName),
            Subject = $"Lời mời tham gia {invitation.OrganizationName} · DigiTalent Pulse",
            IsBodyHtml = true,
            Body = $"<p>Xin chào {safeName},</p><p>{safeOrganization} đã mời bạn tham gia DigiTalent Pulse.</p>" +
                   $"<p><a href=\"{safeLink}\">Xác nhận lời mời và tự đặt mật khẩu</a></p>" +
                   $"<p>Liên kết chỉ dùng một lần và có thời hạn. Nếu bạn không mong đợi lời mời này, hãy bỏ qua email.</p>" +
                   $"<p>Liên kết: {safeLink}</p>"
        };
        email.To.Add(invitation.Email);
        using var client = new SmtpClient(_smtp.Host, _smtp.Port)
        {
            EnableSsl = _smtp.EnableSsl,
            Credentials = new NetworkCredential(_smtp.UserName, _smtp.Password)
        };
        await client.SendMailAsync(email, cancellationToken);
        // A delivered email should never echo its one-time activation link in the API response.
        return null;
    }
}
