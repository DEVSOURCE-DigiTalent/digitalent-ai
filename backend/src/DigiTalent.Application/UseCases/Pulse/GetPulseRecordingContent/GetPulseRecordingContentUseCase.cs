using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /pulse/recordings/{recordingId}/content?exp=&amp;sig= — tệp ghi hình bài làm cho thẻ &lt;video&gt; của trang chấm
/// bài. Không kiểm tra quyền theo token (thẻ video không gửi token): link chỉ hợp lệ khi chữ ký đúng và chưa hết hạn, và
/// chỉ người chấm có quyền với bài làm mới nhận được link (hàng chờ chấm bài).
/// </summary>
public class GetPulseRecordingContentUseCase : IUseCase<GetPulseRecordingContentUseCaseInput, GetPulseRecordingContentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _storage;
    private readonly IProctoringRecordingUrlSigner _signer;
    private readonly IDirectFileStorageService? _directStorage;
    private readonly IChunkedFileFinalizer? _finalizer;

    public GetPulseRecordingContentUseCase(
        IApplicationDbContext context,
        IFileStorageService storage,
        IProctoringRecordingUrlSigner signer,
        IDirectFileStorageService? directStorage = null,
        IChunkedFileFinalizer? finalizer = null)
    {
        _context = context;
        _storage = storage;
        _signer = signer;
        _directStorage = directStorage;
        _finalizer = finalizer;
    }

    public async Task<GetPulseRecordingContentUseCaseOutput> ExecuteAsync(GetPulseRecordingContentUseCaseInput input)
    {
        if (!_signer.IsValid(input.RecordingId, input.ExpiresAt, input.Signature))
        {
            throw new ForbiddenException("Link xem bản ghi đã hết hạn. Hãy tải lại trang chấm bài.");
        }

        var recording = await _context.ProctoringRecordings.AsNoTracking()
            .Where(r => r.Id == input.RecordingId)
            .Select(r => new { r.StoragePath, r.ContentType })
            .FirstOrDefaultAsync();
        if (recording?.StoragePath == null)
        {
            throw new NotFoundException("Không tìm thấy bản ghi.");
        }

        var semicolon = recording.ContentType.IndexOf(';');
        var contentType = semicolon > 0 ? recording.ContentType[..semicolon] : recording.ContentType;

        if (_finalizer != null)
        {
            await _finalizer.FinalizeAsync(recording.StoragePath, contentType);
        }

        if (_directStorage is { SupportsDirectAccess: true })
        {
            var presignedUrl = await _directStorage.GetPresignedDownloadUrlAsync(
                recording.StoragePath,
                TimeSpan.FromMinutes(15),
                fileName: null,
                inline: true);
            if (!string.IsNullOrEmpty(presignedUrl))
            {
                return new GetPulseRecordingContentUseCaseOutput
                {
                    RedirectUrl = presignedUrl,
                    ContentType = contentType,
                };
            }
        }

        var content = await _storage.DownloadAsync(recording.StoragePath);
        return new GetPulseRecordingContentUseCaseOutput
        {
            Content = content,
            ContentType = contentType,
        };
    }
}
