namespace DigiTalent.Application.UseCases.Auth;

public class LogoutUseCaseInput
{
    public string RefreshToken { get; set; } = string.Empty;
}
