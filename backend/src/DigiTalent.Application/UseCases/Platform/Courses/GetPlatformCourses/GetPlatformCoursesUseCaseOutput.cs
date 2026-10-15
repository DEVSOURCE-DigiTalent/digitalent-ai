using DigiTalent.Application.UseCases.Platform.Common;

namespace DigiTalent.Application.UseCases.Platform.Courses;

public class GetPlatformCoursesUseCaseOutput
{
    public List<PlatformCourseItem> Items { get; set; } = new();
}
