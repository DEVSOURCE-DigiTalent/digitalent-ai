namespace DigiTalent.Application.Services.Intelligence;

/// <summary>Nhãn thang 3 mức (khớp frontend lib/competency-levels.ts). null / 0 = chưa có cấp độ xác nhận.</summary>
public static class CompetencyLevelLabels
{
    public static string For(short? level) => level switch
    {
        1 => "Basic",
        2 => "Intermediate",
        3 => "Advanced",
        null or 0 => "Not confirmed",
        _ => $"Level {level}",
    };
}
