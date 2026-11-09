namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Ma trận phạm vi năng lực của tổ chức (OW-05 "Phạm vi năng lực"): 6 lĩnh vực × 3 cấp = 18 khóa là phạm vi Digital AI,
/// phạm vi doanh nghiệp và thiết lập riêng từng phòng ban nằm lồng bên trong.
/// </summary>
public class CapabilityCeilingsDto
{
    /// <summary>Danh mục Digital AI (số cấp của mỗi lĩnh vực).</summary>
    public int PlatformMaxLevel { get; set; }

    /// <summary>false = doanh nghiệp chưa lưu phạm vi; phạm vi doanh nghiệp đang hiển thị là gợi ý từ yêu cầu vị trí.</summary>
    public bool IsConfigured { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedByName { get; set; }

    public List<CeilingLevelDto> Levels { get; set; } = new();
    public List<CeilingDomainDto> Domains { get; set; } = new();
    public List<CeilingDepartmentDto> Departments { get; set; } = new();

    /// <summary>Số khóa nằm dưới phạm vi doanh nghiệp.</summary>
    public int OrganizationCourseCount { get; set; }

    /// <summary>Số ô của phạm vi Digital AI (lĩnh vực × cấp).</summary>
    public int PlatformCourseCount { get; set; }
}

public class CeilingLevelDto
{
    public int Level { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class CeilingDomainDto
{
    public Guid CategoryId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    /// <summary>Phạm vi doanh nghiệp ở lĩnh vực này (0–3).</summary>
    public int OrganizationCeiling { get; set; }

    /// <summary>Cấp độ tối đa doanh nghiệp được phép thiết lập dựa trên bản quyền đã mua (mặc định 1 - Cơ bản trong gói dùng thử).</summary>
    public int MaxAllowedCeiling { get; set; } = 1;

    /// <summary>Mức yêu cầu cao nhất của các vị trí đang có bộ yêu cầu ACTIVE.</summary>
    public int SuggestedCeiling { get; set; }

    /// <summary>Khóa chuẩn của từng cấp (null nếu tổ chức chưa có khóa đã xuất bản ở cấp đó).</summary>
    public List<CeilingCourseDto> Courses { get; set; } = new();
}

public class CeilingCourseDto
{
    public int Level { get; set; }
    public Guid? CourseId { get; set; }
    public string? Code { get; set; }
    public string? Title { get; set; }
    /// <summary>Năng lực và cấp đích thực tế của khóa đã xuất bản, từ course_competencies.</summary>
    public List<CeilingCourseCompetencyDto> Competencies { get; set; } = new();

    /// <summary>Khóa học đã mở bản quyền cho doanh nghiệp (Cấp 1 luôn mở, Cấp 2/3 khi đã mua suất).</summary>
    public bool IsUnlocked { get; set; } = true;
    public int SeatsPurchased { get; set; }
    public long PricePerSeat { get; set; }
}

public class CeilingCourseCompetencyDto
{
    public Guid CompetencyId { get; set; }
    public int TargetLevel { get; set; }
}

public class CeilingDepartmentDto
{
    public Guid DepartmentId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int EmployeeCount { get; set; }
    /// <summary>False when no position in the department has active requirements or a supported reference mapping.</summary>
    public bool HasSuggestion { get; set; }

    /// <summary>true khi phòng ban có ít nhất một thiết lập riêng; false = kế thừa phạm vi doanh nghiệp.</summary>
    public bool IsCustomized { get; set; }

    /// <summary>Số khóa nằm dưới phạm vi phòng ban (lộ trình của phòng ban).</summary>
    public int CourseCount { get; set; }
    public List<CeilingValueDto> Ceilings { get; set; } = new();
}

public class CeilingValueDto
{
    public Guid CategoryId { get; set; }

    /// <summary>Phạm vi hiệu lực: thiết lập riêng nếu có, không thì phạm vi doanh nghiệp.</summary>
    public int Level { get; set; }

    /// <summary>Mức yêu cầu cao nhất của các vị trí trong phòng ban, không vượt phạm vi doanh nghiệp.</summary>
    public int Suggested { get; set; }
    public bool IsCustomized { get; set; }
}

/// <summary>Một ô nhập liệu khi lưu phạm vi: lĩnh vực và cấp.</summary>
public class CeilingInputItem
{
    public Guid CategoryId { get; set; }
    public int Level { get; set; }
}
