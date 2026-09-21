namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Id lấy từ URL (controller gán vào). Không có gì cần kiểm tra nên không có file Validator.
/// </summary>
public class GetDepartmentByIdUseCaseInput
{
    public Guid Id { get; set; }
}
