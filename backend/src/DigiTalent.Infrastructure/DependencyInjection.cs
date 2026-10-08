using DigiTalent.Application.Common.Events;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Events;
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

        // Domain event: handler chạy trong transaction của SaveChangesAsync, tác vụ ngoài chạy sau commit
        services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();
        services.AddScoped<AfterCommitQueue>();
        services.AddScoped<IAfterCommitQueue>(provider => provider.GetRequiredService<AfterCommitQueue>());

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

        // Individual Commerce & Registration (v3.0)
        services.Configure<DigiTalent.Application.IndividualCommerce.IndividualCommerceOptions>(
            configuration.GetSection(DigiTalent.Application.IndividualCommerce.IndividualCommerceOptions.SectionName));
        services.AddScoped<DigiTalent.Application.IndividualCommerce.IOtpHashingService, DigiTalent.Infrastructure.IndividualCommerce.OtpHashingService>();
        services.AddSingleton<DigiTalent.Application.IndividualCommerce.IIndividualPlanCatalog, DigiTalent.Infrastructure.IndividualCommerce.IndividualPlanCatalog>();
        services.AddScoped<DigiTalent.Application.IndividualCommerce.IIndividualEmailSender, DigiTalent.Infrastructure.IndividualCommerce.SmtpIndividualEmailSender>();
        services.AddHttpClient<DigiTalent.Application.IndividualCommerce.IPayOSService, DigiTalent.Infrastructure.IndividualCommerce.PayOSService>();
        services.AddScoped<DigiTalent.Application.IndividualCommerce.IndividualCommerceService>();

        // Personal Learning (Learner Workspace)
        services.AddScoped<DigiTalent.Application.PersonalLearning.Services.IPersonalLearningService, DigiTalent.Infrastructure.PersonalLearning.PersonalLearningService>();

        return services;
    }
}
