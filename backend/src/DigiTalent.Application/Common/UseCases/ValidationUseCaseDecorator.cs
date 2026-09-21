using FluentValidation;

namespace DigiTalent.Application.Common.UseCases;

/// <summary>
/// "Lớp bọc" chạy TRƯỚC mọi use case: tìm validator của Input và kiểm tra.
/// Input sai → throw ValidationException → middleware trả 400 kèm danh sách lỗi.
/// Nhờ vậy trong use case KHÔNG cần tự gọi validator.
///
/// File này là hạ tầng chung — không cần sửa khi làm module.
/// </summary>
public class ValidationUseCaseDecorator<TInput, TOutput> : IUseCase<TInput, TOutput>
{
    private readonly IUseCase<TInput, TOutput> _useCase;
    private readonly IEnumerable<IValidator<TInput>> _validators;

    public ValidationUseCaseDecorator(IUseCase<TInput, TOutput> useCase, IEnumerable<IValidator<TInput>> validators)
    {
        _useCase = useCase;
        _validators = validators;
    }

    public async Task<TOutput> ExecuteAsync(TInput input)
    {
        foreach (var validator in _validators)
        {
            await validator.ValidateAndThrowAsync(input);
        }

        return await _useCase.ExecuteAsync(input);
    }
}
