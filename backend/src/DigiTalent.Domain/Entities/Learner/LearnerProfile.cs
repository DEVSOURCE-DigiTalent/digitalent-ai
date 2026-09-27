using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities.Learner;

/// <summary>
/// Hồ sơ người học độc lập (SEP-09 Decision D-01 to D-04).
/// Tạo khi người học tự do đăng ký, hoặc khi nhân viên doanh nghiệp nghỉ việc và chuyển thành LEARNER.
/// users.organization_id == NULL → người học tự do; != NULL → nhân viên doanh nghiệp có thêm hồ sơ learner.
/// </summary>
public class LearnerProfile : BaseEntity
{
    /// <summary>Liên kết 1-1 với Users (UNIQUE). Không xóa cascade.</summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Vị trí nghề nghiệp mục tiêu — liên kết tới bảng career_role_templates (public catalog).
    /// Nullable: người học chưa chọn mục tiêu.
    /// </summary>
    public Guid? TargetRoleId { get; set; }

    /// <summary>Tiêu đề nghề nghiệp tự khai (VD: "Aspiring AI Engineer").</summary>
    public string? Headline { get; set; }

    /// <summary>Giới thiệu bản thân.</summary>
    public string? Bio { get; set; }

    /// <summary>Danh sách lĩnh vực quan tâm (PostgreSQL text[]).</summary>
    public string[] Interests { get; set; } = [];
}
