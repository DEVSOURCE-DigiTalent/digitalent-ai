using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>EM-08 — Tải học liệu dạng tệp của bài học (chỉ khi đã ghi danh khóa).</summary>
public class DownloadMyLessonMaterialUseCase : IUseCase<DownloadMyLessonMaterialUseCaseInput, MyFileContentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyLearningProgressService _progress;
    private readonly IFileStorageService _fileStorage;

    public DownloadMyLessonMaterialUseCase(
        IApplicationDbContext context, MyEmployeeContext me, MyLearningProgressService progress, IFileStorageService fileStorage)
    {
        _context = context;
        _me = me;
        _progress = progress;
        _fileStorage = fileStorage;
    }

    public async Task<MyFileContentDto> ExecuteAsync(DownloadMyLessonMaterialUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        await _progress.GetEnrolledLessonAsync(employee, input.CourseId, input.LessonId, trackEnrollment: false);

        var file = await (
                from material in _context.LearningMaterials.AsNoTracking()
                join f in _context.FileObjects.AsNoTracking() on material.FileObjectId equals f.Id
                where material.Id == input.MaterialId
                      && material.LessonId == input.LessonId
                      && material.MaterialType == Statuses.LearningMaterialType.File
                select new { f.ObjectKey, f.OriginalName, f.MimeType })
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException("Không tìm thấy tệp học liệu.");

        return new MyFileContentDto
        {
            Content = await _fileStorage.DownloadAsync(file.ObjectKey),
            FileName = file.OriginalName,
            ContentType = string.IsNullOrWhiteSpace(file.MimeType) ? "application/octet-stream" : file.MimeType,
        };
    }
}
