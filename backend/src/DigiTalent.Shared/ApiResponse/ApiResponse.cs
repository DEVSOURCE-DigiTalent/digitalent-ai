using System.Diagnostics;

namespace DigiTalent.Shared.ApiResponse;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<ApiError> Errors { get; set; } = new();
    public string? TraceId { get; set; } = Activity.Current?.Id;
    public string Timestamp { get; set; } = DateTimeOffset.UtcNow.ToString("o");

    public static ApiResponse<T> Ok(T data, string message = "Success")
        => new() { Success = true, Message = message, Data = data, TraceId = Activity.Current?.Id };

    public static ApiResponse<T> Fail(string message, List<ApiError>? errors = null)
        => new() { Success = false, Message = message, Errors = errors ?? new(), TraceId = Activity.Current?.Id };
}

public class ApiResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? Data { get; set; }
    public List<ApiError> Errors { get; set; } = new();
    public string? TraceId { get; set; } = Activity.Current?.Id;
    public string Timestamp { get; set; } = DateTimeOffset.UtcNow.ToString("o");

    public static ApiResponse Ok(object? data = null, string message = "Success")
        => new() { Success = true, Message = message, Data = data, TraceId = Activity.Current?.Id };

    public static ApiResponse Fail(string message, List<ApiError>? errors = null)
        => new() { Success = false, Message = message, Errors = errors ?? new(), TraceId = Activity.Current?.Id };
}

public class ApiError
{
    public string? Field { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
