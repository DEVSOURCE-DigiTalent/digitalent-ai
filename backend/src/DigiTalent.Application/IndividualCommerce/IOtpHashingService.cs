namespace DigiTalent.Application.IndividualCommerce;

public interface IOtpHashingService
{
    string GenerateSecureToken(int byteLength = 32);
    string GenerateOtp(int length = 6);
    string HashToken(string token);
    string HashOtp(string otp);
    string HashNormalizedEmail(string email);
    bool VerifyHash(string input, string hash);
    bool VerifyOtp(string inputOtp, string hash);
}
