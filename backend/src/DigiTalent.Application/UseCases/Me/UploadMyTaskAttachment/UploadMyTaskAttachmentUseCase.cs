using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-16 — Tải tệp minh chứng lên trước khi nộp: lưu vào thư mục riêng của nhiệm vụ + tạo file_objects (PRIVATE).
/// Tệp chỉ gắn vào bài nộp khi gửi bài (SubmitMyTask kiểm tra người tải + thư mục).
/// </summary>
public class UploadMyTaskAttachmentUseCase : IUseCase<UploadMyTaskAttachmentUseCaseInput, MyTaskFileDto>
{
    private const int MaxPendingUploads = MyTaskAttachmentRules.MaxFilesPerSubmission * 3;

    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly IFileStorageService _fileStorage;

    public UploadMyTaskAttachmentUseCase(IApplicationDbContext context, MyEmployeeContext me, IFileStorageService fileStorage)
    {
        _context = context;
        _me = me;
        _fileStorage = fileStorage;
    }

    public async Task<MyTaskFileDto> ExecuteAsync(UploadMyTaskAttachmentUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var assignment = await _context.TaskAssignments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == input.AssignmentId && a.EmployeeId == employee.Id && a.Status != Statuses.TaskAssignment.Cancelled)
            ?? throw new NotFoundException("Không tìm thấy nhiệm vụ được giao cho bạn.");
        if (assignment.Status is not (Statuses.TaskAssignment.Assigned or Statuses.TaskAssignment.NeedsRevision))
        {
            throw new ConflictException("Nhiệm vụ này hiện không nhận bài nộp.");
        }

        var folder = MyTaskAttachmentRules.FolderFor(assignment.Id);
        var userId = _me.UserId;
        var pending = await _context.FileObjects.AsNoTracking().CountAsync(f =>
            f.UploadedByUserId == userId
            && f.ObjectKey.StartsWith(folder + "/")
            && !_context.TaskSubmissionFiles.Any(link => link.FileObjectId == f.Id));
        if (pending >= MaxPendingUploads)
        {
            throw new ConflictException("Bạn đã tải lên quá nhiều tệp chưa nộp cho nhiệm vụ này.");
        }

        var fileName = Path.GetFileName(input.FileName.Trim());
        var contentType = string.IsNullOrWhiteSpace(input.ContentType) ? "application/octet-stream" : input.ContentType;
        var storagePath = await _fileStorage.UploadAsync(input.Content!, fileName, contentType, folder);

        var file = new FileObject
        {
            OrganizationId = employee.OrganizationId,
            Bucket = MyTaskAttachmentRules.Bucket,
            ObjectKey = storagePath,
            OriginalName = fileName,
            MimeType = contentType,
            SizeBytes = input.SizeBytes,
            AccessLevel = Statuses.FileAccessLevel.Private,
            UploadedByUserId = userId,
        };
        _context.FileObjects.Add(file);
        await _context.SaveChangesAsync();

        return new MyTaskFileDto { Id = file.Id, FileName = file.OriginalName, ContentType = file.MimeType, SizeBytes = file.SizeBytes };
    }
}
