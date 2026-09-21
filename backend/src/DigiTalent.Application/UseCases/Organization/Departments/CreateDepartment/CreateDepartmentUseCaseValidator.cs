using FluentValidation;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Kiểm tra dữ liệu ĐẦU VÀO (rỗng, độ dài, định dạng...). Tự chạy trước use case.
/// Kiểm tra cần đọc database (VD: trùng mã) thì viết trong use case, không viết ở đây.
/// </summary>
public class CreateDepartmentUseCaseValidator : AbstractValidator<CreateDepartmentUseCaseInput>
{
    public CreateDepartmentUseCaseValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}
