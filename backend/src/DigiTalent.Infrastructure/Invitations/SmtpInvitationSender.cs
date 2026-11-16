using System.Net;
using System.Net.Mail;
using DigiTalent.Application.Common.Email;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.IndividualCommerce;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigiTalent.Infrastructure.Invitations;

/// <summary>Gửi email mời nhân viên kèm liên kết thiết lập mật khẩu một lần.</summary>
public sealed class SmtpInvitationSender : IInvitationSender
{
    private readonly InvitationSettings _links;
    private readonly IAppUrlResolver _urlResolver;
    private readonly SmtpOptions _smtp;
    private readonly ILogger<SmtpInvitationSender> _logger;

    public SmtpInvitationSender(
        InvitationSettings links,
        IAppUrlResolver urlResolver,
        IOptions<IndividualCommerceOptions> options,
        ILogger<SmtpInvitationSender> logger)
    {
        _links = links;
        _urlResolver = urlResolver;
        _smtp = options.Value.Smtp;
        _logger = logger;
    }

    public async Task<string?> SendAsync(InvitationMessage invitation, CancellationToken cancellationToken = default)
    {
        var baseUrl = _urlResolver.GetFrontendBaseUrl();
        var link = $"{baseUrl}/activate/{Uri.EscapeDataString(invitation.Token)}";
        var bodyHtml = EmailTemplateBuilder.BuildInvitationEmail(
            invitation.FullName,
            invitation.OrganizationName,
            link,
            invitation.Note);

        using var email = new MailMessage
        {
            From = new MailAddress(_smtp.FromEmail, string.IsNullOrWhiteSpace(_smtp.FromName) ? "DigiTalent AI" : _smtp.FromName),
            Subject = $"Lời mời tham gia {invitation.OrganizationName} · DigiTalent AI",
            IsBodyHtml = true,
            Body = bodyHtml
        };
        email.To.Add(invitation.Email);

        using var client = new SmtpClient(_smtp.Host, _smtp.Port)
        {
            EnableSsl = _smtp.EnableSsl,
            Credentials = new NetworkCredential(_smtp.UserName, _smtp.Password)
        };

        try
        {
            await client.SendMailAsync(email, cancellationToken);
            _logger.LogInformation("[SmtpInvitationSender] Successfully sent invitation email to {Email} with link {Link}", invitation.Email, link);
            return _links.ExposeDebugLink ? link : null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[SmtpInvitationSender] Failed to send email to {Email} via SMTP ({Host}:{Port}).", invitation.Email, _smtp.Host, _smtp.Port);
            if (_links.ExposeDebugLink)
            {
                return link;
            }
            throw;
        }
    }
}
