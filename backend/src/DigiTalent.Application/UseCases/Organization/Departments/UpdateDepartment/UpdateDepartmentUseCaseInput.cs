using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.Departments;

public class UpdateDepartmentUseCaseInput
{
    // Id lấy từ URL (PUT api/v1/departments/{id}), controller gán vào.
    // [JsonIgnore] = không nhận Id từ body, Swagger cũng không hiện ô này.
    [JsonIgnore]
    public Guid Id { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}
