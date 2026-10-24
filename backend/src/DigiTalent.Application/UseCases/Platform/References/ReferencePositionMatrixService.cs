using System.Text.Json;
using System.Globalization;
using System.Text;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.References;

/// <summary>Five platform-owned reference positions. Organization requirements remain separate.</summary>
public sealed class ReferencePositionMatrixService
{
    private const string SettingKey = "PLATFORM_REFERENCE_POSITION_DOMAIN_LEVELS_V1";
    private static readonly string[] Codes = ["CEO", "HR", "MARKETING", "SALES_CRM", "ACCOUNTANT"];
    private static readonly Dictionary<string, int[]> Defaults = new()
    {
        ["CEO"] = [3, 3, 2, 3, 3, 2],
        ["HR"] = [2, 3, 2, 3, 2, 1],
        ["MARKETING"] = [3, 3, 3, 2, 3, 3],
        ["SALES_CRM"] = [2, 3, 2, 2, 2, 1],
        ["ACCOUNTANT"] = [3, 2, 1, 3, 2, 1],
    };

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _audit;

    public ReferencePositionMatrixService(IApplicationDbContext context, ICurrentUser currentUser, IAuditService audit)
    {
        _context = context;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<ReferencePositionMatrix> GetAsync()
    {
        var setting = await _context.SystemSettings.AsNoTracking()
            .SingleOrDefaultAsync(s => s.OrganizationId == null && s.Key == SettingKey);
        return setting == null
            ? new ReferencePositionMatrix { Version = 1, Levels = CopyDefaults() }
            : JsonSerializer.Deserialize<ReferencePositionMatrix>(setting.Value)
              ?? throw new InvalidOperationException("The platform reference matrix is invalid.");
    }

    public async Task<ReferencePositionMatrix> SaveAsync(ReferencePositionMatrix input)
    {
        if (input.Levels == null || input.Levels.Count != Codes.Length ||
            input.Levels.Keys.Any(code => !Codes.Contains(code)) ||
            input.Levels.Values.Any(levels => levels == null || levels.Length != 6 || levels.Any(level => level is < 1 or > 3)))
        {
            throw new BadRequestException("Reference levels must contain five positions and six levels from 1 to 3.");
        }

        var setting = await _context.SystemSettings.SingleOrDefaultAsync(s => s.OrganizationId == null && s.Key == SettingKey);
        var old = setting == null ? new ReferencePositionMatrix { Version = 1, Levels = CopyDefaults() }
            : JsonSerializer.Deserialize<ReferencePositionMatrix>(setting.Value)
              ?? throw new InvalidOperationException("The platform reference matrix is invalid.");
        if (input.Version != old.Version)
        {
            throw new ConflictException("Reference levels changed. Reload before saving.");
        }

        var next = new ReferencePositionMatrix
        {
            Version = old.Version + 1,
            Levels = Codes.ToDictionary(code => code, code => input.Levels[code].ToArray()),
        };
        if (setting == null)
        {
            setting = new SystemSetting { Key = SettingKey, Description = "Mức tham chiếu theo 5 vị trí và 6 miền do quản trị nền tảng quản lý" };
            _context.SystemSettings.Add(setting);
        }
        setting.Value = JsonSerializer.Serialize(next);
        setting.UpdatedByUserId = _currentUser.UserId;
        await _context.SaveChangesAsync();
        await _audit.LogAsync("PLATFORM_REFERENCE_POSITIONS_UPDATED", "system_settings", setting.Id, old, next,
            "Mức năng lực tham chiếu theo vị trí");
        return next;
    }

    private static Dictionary<string, int[]> CopyDefaults() => Codes.ToDictionary(code => code, code => Defaults[code].ToArray());

    /// <summary>Match only the five supported sample roles; a department name is never treated as a position.</summary>
    public static string? MatchPosition(string code, string name)
    {
        static string Normalize(string value)
        {
            var result = new StringBuilder();
            foreach (var c in value.Normalize(NormalizationForm.FormD))
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark && char.IsLetterOrDigit(c))
                    result.Append(char.ToUpperInvariant(c == 'đ' || c == 'Đ' ? 'D' : c));
            }
            return result.ToString();
        }
        var codeKey = Normalize(code);
        var nameKey = Normalize(name);
        foreach (var key in new[] { codeKey, nameKey })
        {
            if (key is "CEO" or "GIAMDOC" or "GIAMDOCDIEUHANH") return "CEO";
            if (key is "HR" or "NHANSU") return "HR";
            if (key is "MARKETING" or "TIEPTHI") return "MARKETING";
            if (key is "SALE" or "SALES" or "SALESCRM" or "KINHDOANH" or "KINHDOANHCRM") return "SALES_CRM";
            if (key is "ACCOUNTANT" or "ACCOUNTING" or "KETOAN" or "KETOANVIEN") return "ACCOUNTANT";
        }
        return null;
    }
}

public sealed class ReferencePositionMatrix
{
    public int Version { get; set; }
    public Dictionary<string, int[]> Levels { get; set; } = new();
}
