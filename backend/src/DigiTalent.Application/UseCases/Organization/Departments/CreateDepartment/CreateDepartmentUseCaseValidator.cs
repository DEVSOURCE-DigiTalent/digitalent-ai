using FluentValidation;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Kiểm tra dữ liệu ĐẦU VÀO (rỗng, độ dài, định dạng...). Tự chạy trước use case.
/// Độ dài lấy theo cột trong database. Kiểm tra cần đọc database (VD: trùng mã) thì viết trong use case.
/// </summary>
public class CreateDepartmentUseCaseValidator : AbstractValidator<CreateDepartmentUseCaseInput>
{
    public CreateDepartmentUseCaseValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(180);
    }
}
