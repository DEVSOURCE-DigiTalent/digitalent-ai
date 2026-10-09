namespace DigiTalent.Application.UseCases.Auth;

public class ValidateResetTokenInput
{
    public string Token { get; set; } = string.Empty;
}

public class ResetPasswordInput
{
    public string Token { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
