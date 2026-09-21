namespace DigiTalent.Api.Common;

/// <summary>
/// Khuôn response chung cho MỌI API (thành công lẫn lỗi) để frontend chỉ xử lý 1 kiểu:
/// { "success": true, "message": "...", "data": { ... }, "errors": [] }
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<ApiError> Errors { get; set; } = new();

    public static ApiResponse<T> Ok(T data, string message = "Success")
    {
        return new ApiResponse<T> { Success = true, Message = message, Data = data };
    }

    public static ApiResponse<T> Fail(string message, List<ApiError>? errors = null)
    {
        return new ApiResponse<T> { Success = false, Message = message, Errors = errors ?? new() };
    }
}

/// <summary>
/// 1 lỗi validate của 1 field. VD: { "field": "code", "message": "'Code' must not be empty." }
/// </summary>
public class ApiError
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
