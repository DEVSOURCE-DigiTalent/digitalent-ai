namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Ma trận trần nhà của tổ chức (OW-05 "Lý thuyết trần nhà"): 6 lĩnh vực × 3 cấp = 18 khóa là trần Digital AI,
/// trần doanh nghiệp và trần riêng từng phòng ban nằm lồng bên trong.
/// </summary>
public class CapabilityCeilingsDto
{
    /// <summary>Trần Digital AI (số cấp của mỗi lĩnh vực).</summary>
    public int PlatformMaxLevel { get; set; }

    /// <summary>false = doanh nghiệp chưa lưu trần; trần doanh nghiệp đang hiển thị là gợi ý từ yêu cầu vị trí.</summary>
    public bool IsConfigured { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedByName { get; set; }

    public List<CeilingLevelDto> Levels { get; set; } = new();
    public List<CeilingDomainDto> Domains { get; set; } = new();
    public List<CeilingDepartmentDto> Departments { get; set; } = new();

    /// <summary>Số khóa nằm dưới trần doanh nghiệp.</summary>
    public int OrganizationCourseCount { get; set; }

    /// <summary>Số ô của trần Digital AI (lĩnh vực × cấp).</summary>
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

    /// <summary>Trần doanh nghiệp ở lĩnh vực này (0–3).</summary>
    public int OrganizationCeiling { get; set; }

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
}

public class CeilingDepartmentDto
{
    public Guid DepartmentId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int EmployeeCount { get; set; }
    /// <summary>False when no position in the department has active requirements or a supported reference mapping.</summary>
    public bool HasSuggestion { get; set; }

    /// <summary>true khi phòng ban có ít nhất một trần riêng; false = kế thừa trần doanh nghiệp.</summary>
    public bool IsCustomized { get; set; }

    /// <summary>Số khóa nằm dưới trần phòng ban (lộ trình của phòng ban).</summary>
    public int CourseCount { get; set; }
    public List<CeilingValueDto> Ceilings { get; set; } = new();
}

public class CeilingValueDto
{
    public Guid CategoryId { get; set; }

    /// <summary>Trần hiệu lực: trần riêng nếu có, không thì trần doanh nghiệp.</summary>
    public int Level { get; set; }

    /// <summary>Mức yêu cầu cao nhất của các vị trí trong phòng ban, không vượt trần doanh nghiệp.</summary>
    public int Suggested { get; set; }
    public bool IsCustomized { get; set; }
}

/// <summary>Một ô nhập liệu khi lưu trần: lĩnh vực và cấp.</summary>
public class CeilingInputItem
{
    public Guid CategoryId { get; set; }
    public int Level { get; set; }
}
