using System.Security.Cryptography;
using System.Text;
using DigiTalent.Application.IndividualCommerce;
using Microsoft.Extensions.Options;

namespace DigiTalent.Infrastructure.IndividualCommerce;

public class OtpHashingService : IOtpHashingService
{
    private readonly SecurityOptions _options;

    public OtpHashingService(IOptions<IndividualCommerceOptions> options)
    {
        _options = options.Value.Security;
    }

    public string GenerateSecureToken(int byteLength = 32)
    {
        var bytes = RandomNumberGenerator.GetBytes(byteLength);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    public string GenerateOtp(int length = 6)
    {
        var number = RandomNumberGenerator.GetInt32(0, (int)Math.Pow(10, length));
        return number.ToString($"D{length}");
    }

    public string HashToken(string token)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_options.EmailVerificationPepper));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public string HashOtp(string otp)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_options.OtpPepper));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(otp));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public string HashNormalizedEmail(string email)
    {
        var normalized = email.Trim().ToLowerInvariant();
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_options.EmailVerificationPepper));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(normalized));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public bool VerifyHash(string input, string hash)
    {
        var inputHash = HashToken(input);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(inputHash),
            Encoding.UTF8.GetBytes(hash));
    }

    public bool VerifyOtp(string inputOtp, string hash)
    {
        var inputHash = HashOtp(inputOtp);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(inputHash),
            Encoding.UTF8.GetBytes(hash));
    }
}
