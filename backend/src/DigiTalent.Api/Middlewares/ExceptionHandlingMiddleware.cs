using System.Text.Json;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.Exceptions;
using FluentValidation;

namespace DigiTalent.Api.Middlewares;

/// <summary>
/// Bắt mọi exception rồi đổi thành ApiResponse + status code phù hợp:
///   ValidationException → 400   (Input sai — do validator throw)
///   BadRequestException → 400
///   ForbiddenException  → 403
///   NotFoundException   → 404
///   ConflictException   → 409
///   Lỗi khác            → 500   (ghi log, không lộ chi tiết ra ngoài)
/// Nhờ vậy use case chỉ cần throw, controller không cần try/catch.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            var errors = ex.Errors
                .Select(e => new ApiError
                {
                    Field = JsonNamingPolicy.CamelCase.ConvertName(e.PropertyName), // "Code" → "code" cho khớp JSON
                    Message = e.ErrorMessage,
                })
                .ToList();

            await WriteErrorAsync(context, StatusCodes.Status400BadRequest, "Validation failed.", errors);
        }
        catch (BadRequestException ex)
        {
            await WriteErrorAsync(context, StatusCodes.Status400BadRequest, ex.Message);
        }
        catch (ForbiddenException ex)
        {
            await WriteErrorAsync(context, StatusCodes.Status403Forbidden, ex.Message);
        }
        catch (NotFoundException ex)
        {
            await WriteErrorAsync(context, StatusCodes.Status404NotFound, ex.Message);
        }
        catch (ConflictException ex)
        {
            await WriteErrorAsync(context, StatusCodes.Status409Conflict, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await WriteErrorAsync(context, StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, int statusCode, string message, List<ApiError>? errors = null)
    {
        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(message, errors));
    }
}
