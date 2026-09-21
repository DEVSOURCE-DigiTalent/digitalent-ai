namespace DigiTalent.Application.Common.Models;

/// <summary>
/// Kết quả phân trang trả về cho frontend.
/// Output của use case "GetPaged..." kế thừa class này.
/// </summary>
public class PagedList<T>
{
    public List<T> Items { get; set; } = new();
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalItems / (double)PageSize);
}
