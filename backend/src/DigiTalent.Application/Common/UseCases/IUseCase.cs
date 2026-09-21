namespace DigiTalent.Application.Common.UseCases;

/// <summary>
/// Mỗi use case = 1 hành động nghiệp vụ = 1 class có đúng 1 method ExecuteAsync.
/// VD: CreateDepartmentUseCase : IUseCase&lt;CreateDepartmentUseCaseInput, CreateDepartmentUseCaseOutput&gt;
///
/// KHÔNG cần đăng ký DI: mọi class implement IUseCase được tự đăng ký (xem DependencyInjection.cs),
/// và Input được validate tự động trước khi ExecuteAsync chạy (xem ValidationUseCaseDecorator.cs).
/// </summary>
public interface IUseCase<TInput, TOutput>
{
    Task<TOutput> ExecuteAsync(TInput input);
}
