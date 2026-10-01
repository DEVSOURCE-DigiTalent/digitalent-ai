using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.FileStorage;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DigiTalent.Infrastructure;

public static class DependencyInjection
{
    /// <summary>
    /// Đăng ký database và các service kỹ thuật. Được gọi 1 lần trong Program.cs.
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database.
        // Schema do file SQL quản lý (xem docs/db), code KHÔNG tự tạo bảng.
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<AppDbContext>(options => options
            .UseNpgsql(connectionString)
            .UseSnakeCaseNamingConvention());

        // Use case chỉ biết IApplicationDbContext → trỏ nó về AppDbContext
        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        // Đăng nhập: tạo token + mã hóa mật khẩu
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
        services.AddSingleton(jwtSettings);
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        // Phân quyền: đọc quyền của role từ database, có cache
        services.AddMemoryCache();
        services.AddScoped<IPermissionReader, PermissionReader>();

        // Lưu trữ file (File Storage)
        var fileStorageSettings = configuration.GetSection("FileStorage").Get<FileStorageSettings>() ?? new FileStorageSettings();
        services.AddSingleton(fileStorageSettings);
        services.AddScoped<IFileStorageService, LocalFileStorageService>();

        // Audit Logging
        services.AddScoped<IAuditService, AuditService>();

        return services;
    }
}
