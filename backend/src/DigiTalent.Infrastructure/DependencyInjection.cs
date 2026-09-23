using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.Persistence;
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
        // Database
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

        return services;
    }
}
