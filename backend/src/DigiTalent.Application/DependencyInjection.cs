using DigiTalent.Application.Common.UseCases;
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

        // 3. Tự đăng ký tất cả validator (class kế thừa AbstractValidator<>)
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}
