namespace DigiTalent.Application.UseCases.JobArchitecture.Grades;

/// <summary>
/// Serialized as a JSON array (frontend jobGradeService.getAll() expects JobGradeItem[]).
/// </summary>
public class GetJobGradesUseCaseOutput : List<JobGradeItem>
{
}
