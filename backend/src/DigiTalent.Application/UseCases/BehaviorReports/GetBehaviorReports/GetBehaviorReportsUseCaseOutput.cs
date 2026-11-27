namespace DigiTalent.Application.UseCases.BehaviorReports;

public class GetBehaviorReportsUseCaseOutput
{
    public BehaviorReportCountsDto Counts { get; set; } = new();
    /// <summary>Mỗi nhân viên có bài cuối khóa đã nộp: mức nặng nhất trước, cùng mức thì bài mới nộp trước.</summary>
    public List<BehaviorEmployeeDto> Employees { get; set; } = new();
}

/// <summary>Số bài theo mức hiển thị, số bài AI đang phân tích và số người có bài rủi ro cao.</summary>
public class BehaviorReportCountsDto
{
    public int All { get; set; }
    public int High { get; set; }
    public int Medium { get; set; }
    public int Low { get; set; }
    public int Analyzing { get; set; }
    public int PeopleHigh { get; set; }
}
