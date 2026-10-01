namespace DigiTalent.Application.Common.Models;

/// <summary>
/// Tham số phân trang + tìm kiếm dùng chung.
/// Input của use case "GetPaged..." kế thừa class này.
/// </summary>
public class PaginationRequest
{
    public int PageIndex { get; set; } = 1; // trang đầu tiên là 1
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
}
