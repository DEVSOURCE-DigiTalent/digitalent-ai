namespace DigiTalent.Application.UseCases.Auth;

public class ForgotPasswordInput
{
    public string Email { get; set; } = string.Empty;
}

public class ForgotPasswordOutput
{
    public string? DebugLink { get; set; }
}
