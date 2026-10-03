namespace DigiTalent.Application.UseCases.Auth;

/// <summary>
/// FE lưu AccessToken và RefreshToken (localStorage) rồi gửi kèm mọi request: header "Authorization: Bearer {token}".
/// </summary>
public class LoginUseCaseOutput
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
}
