namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng course_prerequisites. Khóa học này phải học xong khóa nào trước.
/// Bảng nối chỉ có 2 cột khóa nên phải viết tay (scaffold không sinh ra).
/// </summary>
public class CoursePrerequisite
{
    public Guid CourseId { get; set; }
    public Guid PrerequisiteCourseId { get; set; }
}
