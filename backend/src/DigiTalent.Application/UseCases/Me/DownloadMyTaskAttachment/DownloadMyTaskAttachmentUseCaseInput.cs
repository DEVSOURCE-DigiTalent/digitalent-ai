namespace DigiTalent.Application.UseCases.Me;

public class DownloadMyTaskAttachmentUseCaseInput
{
    public Guid AssignmentId { get; set; }
    public Guid FileId { get; set; }
}
