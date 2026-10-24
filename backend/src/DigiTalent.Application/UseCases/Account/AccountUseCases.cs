using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Account;

public class AccountProfileOutput
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? JobTitle { get; set; }
    public string? AvatarUrl { get; set; }
    public string? RoleTitle { get; set; }
}

public class GetAccountProfileInput { }

public class UpdateAccountProfileInput
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
}

public class ChangePasswordInput
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class LoginHistoryItem
{
    public string Id { get; set; } = string.Empty;
    public DateTimeOffset Timestamp { get; set; }
    public string Ip { get; set; } = string.Empty;
    public string Browser { get; set; } = string.Empty;
    public string Os { get; set; } = string.Empty;
    public string Status { get; set; } = "SUCCESS";
}

public class GetLoginHistoryInput { }

internal static class AccountProfileReader
{
    public static async Task<AccountProfileOutput> ReadAsync(IApplicationDbContext context, ICurrentUser currentUser)
    {
        var userId = currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập.");
        var user = await context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new NotFoundException("Không tìm thấy tài khoản.");
        var employee = await context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.UserId == userId);
        string? jobTitle = null;
        if (employee?.JobPositionId is { } positionId)
            jobTitle = await context.JobPositions.AsNoTracking()
                .Where(p => p.Id == positionId).Select(p => p.Name).FirstOrDefaultAsync();
        return new AccountProfileOutput
        {
            Id = user.Id.ToString(),
            FullName = employee?.FullName ?? user.DisplayName,
            Email = user.Email,
            Phone = employee?.Phone,
            JobTitle = jobTitle,
            AvatarUrl = user.AvatarUrl,
            RoleTitle = currentUser.Roles.FirstOrDefault(),
        };
    }
}

public class GetAccountProfileUseCase : IUseCase<GetAccountProfileInput, AccountProfileOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetAccountProfileUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public Task<AccountProfileOutput> ExecuteAsync(GetAccountProfileInput input) =>
        AccountProfileReader.ReadAsync(_context, _currentUser);
}

public class UpdateAccountProfileUseCase : IUseCase<UpdateAccountProfileInput, AccountProfileOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateAccountProfileUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<AccountProfileOutput> ExecuteAsync(UpdateAccountProfileInput input)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập.");
        var fullName = input.FullName?.Trim();
        if (fullName is { Length: 0 } or { Length: > 200 })
            throw new BadRequestException("Họ tên phải từ 1 đến 200 ký tự.", "fullName", "INVALID_FULL_NAME");
        var phone = string.IsNullOrWhiteSpace(input.Phone) ? null : input.Phone.Trim();
        if (phone is { Length: > 30 })
            throw new BadRequestException("Số điện thoại tối đa 30 ký tự.", "phone", "INVALID_PHONE");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new NotFoundException("Không tìm thấy tài khoản.");
        if (fullName != null) user.DisplayName = fullName;

        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee != null)
        {
            if (fullName != null) employee.FullName = fullName;
            employee.Phone = phone;
        }

        await _context.SaveChangesAsync();
        return await AccountProfileReader.ReadAsync(_context, _currentUser);
    }
}

public class ChangePasswordUseCase : IUseCase<ChangePasswordInput, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPasswordHasher _hasher;

    public ChangePasswordUseCase(IApplicationDbContext context, ICurrentUser currentUser, IPasswordHasher hasher)
    {
        _context = context;
        _currentUser = currentUser;
        _hasher = hasher;
    }

    public async Task<bool> ExecuteAsync(ChangePasswordInput input)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập.");
        if (string.IsNullOrEmpty(input.NewPassword) || input.NewPassword.Length < 12 || input.NewPassword.Length > 128)
            throw new BadRequestException("Mật khẩu mới phải từ 12 đến 128 ký tự.", "newPassword", "PASSWORD_LENGTH");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new NotFoundException("Không tìm thấy tài khoản.");
        if (!_hasher.Verify(input.CurrentPassword ?? string.Empty, user.PasswordHash))
            throw new BadRequestException("Mật khẩu hiện tại không đúng.", "currentPassword", "WRONG_CURRENT_PASSWORD");
        if (string.Equals(input.NewPassword, user.Email, StringComparison.OrdinalIgnoreCase)
            || _hasher.Verify(input.NewPassword, user.PasswordHash))
            throw new BadRequestException("Mật khẩu mới phải khác mật khẩu hiện tại và email.", "newPassword", "PASSWORD_REUSED");

        var now = DateTimeOffset.UtcNow;
        user.PasswordHash = _hasher.Hash(input.NewPassword);
        user.UpdatedAt = now;

        var activeTokens = await _context.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null).ToListAsync();
        foreach (var token in activeTokens) token.RevokedAt = now;

        await _context.SaveChangesAsync();
        return true;
    }
}

/// <summary>Phiên đăng nhập gần đây = các refresh token đã cấp (mỗi lần đăng nhập tạo một token).</summary>
public class GetLoginHistoryUseCase : IUseCase<GetLoginHistoryInput, List<LoginHistoryItem>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetLoginHistoryUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<LoginHistoryItem>> ExecuteAsync(GetLoginHistoryInput input)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập.");
        var tokens = await _context.RefreshTokens.AsNoTracking()
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(20)
            .ToListAsync();
        return tokens.Select(t =>
        {
            var (browser, os) = ParseUserAgent(t.UserAgent);
            return new LoginHistoryItem
            {
                Id = t.Id.ToString(),
                Timestamp = t.CreatedAt,
                Ip = string.IsNullOrEmpty(t.IpHash) ? "—" : t.IpHash[..Math.Min(8, t.IpHash.Length)],
                Browser = browser,
                Os = os,
                Status = "SUCCESS",
            };
        }).ToList();
    }

    private static (string Browser, string Os) ParseUserAgent(string? ua)
    {
        if (string.IsNullOrWhiteSpace(ua)) return ("Không rõ", "Không rõ");
        var browser = ua.Contains("Edg/") ? "Edge" : ua.Contains("Chrome/") ? "Chrome"
            : ua.Contains("Firefox/") ? "Firefox" : ua.Contains("Safari/") ? "Safari" : "Khác";
        var os = ua.Contains("Windows") ? "Windows" : ua.Contains("Android") ? "Android"
            : ua.Contains("iPhone") || ua.Contains("iPad") ? "iOS" : ua.Contains("Mac OS") ? "macOS"
            : ua.Contains("Linux") ? "Linux" : "Khác";
        return (browser, os);
    }
}
