using System.Text;
using DigiTalent.Api.Auth;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace DigiTalent.Api.Extensions;

/// <summary>
/// Các đoạn cấu hình dài được tách ra đây cho Program.cs dễ đọc.
/// File này là hạ tầng chung — không cần sửa khi làm module.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Kiểm tra token FE gửi lên (header "Authorization: Bearer {token}"):
    /// đúng chữ ký, đúng Issuer/Audience, chưa hết hạn → HttpContext.User có thông tin user.
    /// </summary>
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false; // giữ nguyên tên claim trong token: "sub", "email", "role"
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SigningKey)),
                };
            });

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();

        return services;
    }

    /// <summary>
    /// Swagger có nút "Authorize" để dán token vào khi test API cần đăng nhập.
    /// </summary>
    public static IServiceCollection AddSwaggerWithJwt(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            var bearerScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "Dán access token lấy từ API login (không cần gõ chữ Bearer).",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
            };

            options.AddSecurityDefinition("Bearer", bearerScheme);
            options.AddSecurityRequirement(new OpenApiSecurityRequirement { [bearerScheme] = Array.Empty<string>() });
        });

        return services;
    }
}
