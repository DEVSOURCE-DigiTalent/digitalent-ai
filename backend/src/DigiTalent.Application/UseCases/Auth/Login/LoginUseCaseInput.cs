namespace DigiTalent.Application.UseCases.Auth;

public class LoginUseCaseInput
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
