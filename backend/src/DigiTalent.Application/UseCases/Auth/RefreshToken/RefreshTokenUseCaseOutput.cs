namespace DigiTalent.Application.UseCases.Auth;

public class RefreshTokenUseCaseOutput
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
}
