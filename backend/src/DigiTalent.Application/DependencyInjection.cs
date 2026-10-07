using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Events;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.Services.Intelligence.Recommendation;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Application.UseCases.Organization.Members;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace DigiTalent.Application;

public static class DependencyInjection
{
    /// <summary>
    /// Đăng ký toàn bộ tầng Application. Được gọi 1 lần trong Program.cs.
    /// Viết use case / validator mới KHÔNG cần sửa file này.
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        // 1. Tự đăng ký TẤT CẢ use case (mọi class implement IUseCase<,>)
        services.Scan(scan => scan
            .FromAssemblies(assembly)
            .AddClasses(classes => classes
                .AssignableTo(typeof(IUseCase<,>))
                .Where(type => !type.IsGenericTypeDefinition)) // bỏ qua chính ValidationUseCaseDecorator<,>
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        // 2. Bọc mọi use case bằng lớp validate Input
        services.Decorate(typeof(IUseCase<,>), typeof(ValidationUseCaseDecorator<,>));

        // 2b. Tự đăng ký domain event handler (mọi class implement IDomainEventHandler<>)
        services.Scan(scan => scan
            .FromAssemblies(assembly)
            .AddClasses(classes => classes.AssignableTo(typeof(IDomainEventHandler<>)))
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        // 3. Tự đăng ký tất cả validator (class kế thừa AbstractValidator<>)
        services.AddValidatorsFromAssembly(assembly);

        // 4. Tra quyền từ database (dùng cho [HasPermission] và /auth/me)
        services.AddScoped<IPermissionService, PermissionService>();

        // 5. Dịch vụ dùng chung giữa các use case (Scrutor chỉ tự quét IUseCase<,>)
        services.AddScoped<EmployeeScope>();
        services.AddScoped<SkillGapSettingsProvider>();
        services.AddScoped<SkillGapRunService>();
        services.AddScoped<SkillGapRunReader>();
        services.AddScoped<RecommendationWeightsProvider>();
        services.AddScoped<MemberDirectory>();

        return services;
    }
}
