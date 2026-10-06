using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>EM-15 / EM-17 — Tải lại tệp minh chứng của chính mình (đã nộp hoặc vừa tải lên cho nhiệm vụ này).</summary>
public class DownloadMyTaskAttachmentUseCase : IUseCase<DownloadMyTaskAttachmentUseCaseInput, MyFileContentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly IFileStorageService _fileStorage;

    public DownloadMyTaskAttachmentUseCase(IApplicationDbContext context, MyEmployeeContext me, IFileStorageService fileStorage)
    {
        _context = context;
        _me = me;
        _fileStorage = fileStorage;
    }

    public async Task<MyFileContentDto> ExecuteAsync(DownloadMyTaskAttachmentUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var ownsAssignment = await _context.TaskAssignments
            .AsNoTracking()
            .AnyAsync(a => a.Id == input.AssignmentId && a.EmployeeId == employee.Id);
        if (!ownsAssignment)
        {
            throw new NotFoundException("Không tìm thấy tệp.");
        }

        var folder = MyTaskAttachmentRules.FolderFor(input.AssignmentId) + "/";
        var userId = _me.UserId;
        var file = await _context.FileObjects
            .AsNoTracking()
            .Where(f => f.Id == input.FileId)
            .Where(f =>
                (from link in _context.TaskSubmissionFiles
                 join submission in _context.TaskSubmissions on link.SubmissionId equals submission.Id
                 where link.FileObjectId == f.Id && submission.TaskAssignmentId == input.AssignmentId
                 select link).Any()
                || (f.UploadedByUserId == userId && f.ObjectKey.StartsWith(folder)))
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException("Không tìm thấy tệp.");

        return new MyFileContentDto
        {
            Content = await _fileStorage.DownloadAsync(file.ObjectKey),
            FileName = file.OriginalName,
            ContentType = string.IsNullOrWhiteSpace(file.MimeType) ? "application/octet-stream" : file.MimeType,
        };
    }
}
