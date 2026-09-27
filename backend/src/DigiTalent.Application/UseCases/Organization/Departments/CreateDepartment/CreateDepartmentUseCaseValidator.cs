using FluentValidation;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Kiểm tra dữ liệu ĐẦU VÀO (rỗng, độ dài, định dạng...). Tự chạy trước use case.
/// Kiểm tra cần đọc database (VD: trùng mã) thì viết trong use case, không viết ở đây.
/// Độ dài khớp cột trong SQL v2.3 (code varchar(50), name varchar(180)).
/// </summary>
public class CreateDepartmentUseCaseValidator : AbstractValidator<CreateDepartmentUseCaseInput>
{
    public CreateDepartmentUseCaseValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(180);
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}
