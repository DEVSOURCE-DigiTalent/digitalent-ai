using DigiTalent.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.Invitations;

/// <summary>
/// Placeholder sender until an e-mail provider is integrated: writes the activation link to the log and returns it
/// when <see cref="InvitationSettings.ExposeDebugLink"/> is on (Development).
/// </summary>
public class LoggingInvitationSender : IInvitationSender
{
    private readonly InvitationSettings _settings;
    private readonly ILogger<LoggingInvitationSender> _logger;

    public LoggingInvitationSender(InvitationSettings settings, ILogger<LoggingInvitationSender> logger)
    {
        _settings = settings;
        _logger = logger;
    }

    public Task<string?> SendAsync(InvitationMessage message, CancellationToken cancellationToken = default)
    {
        var link = $"{_settings.FrontendBaseUrl.TrimEnd('/')}/activate/{Uri.EscapeDataString(message.Token)}";

        // The link grants account creation, so it is only logged where debug links are allowed
        if (_settings.ExposeDebugLink)
        {
            _logger.LogInformation("Invitation for {Email} to {Organization}: {Link}", message.Email, message.OrganizationName, link);
            return Task.FromResult<string?>(link);
        }

        _logger.LogInformation("Invitation created for {Email} to {Organization} (e-mail delivery not configured).",
            message.Email, message.OrganizationName);
        return Task.FromResult<string?>(null);
    }
}
