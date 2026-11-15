using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Verifies the signed upload ticket and confirms the object exists in Object Storage before persisting PlatformAsset.
/// </summary>
public class CompletePlatformAssetUploadUseCase : IUseCase<CompletePlatformAssetUploadUseCaseInput, PlatformAssetDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly PlatformCourseContentReader _reader;
    private readonly IPlatformAssetUploadSigner? _uploadSigner;
    private readonly IDirectFileStorageService? _directStorage;

    public CompletePlatformAssetUploadUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        PlatformCourseContentReader reader,
        IPlatformAssetUploadSigner? uploadSigner = null,
        IDirectFileStorageService? directStorage = null)
    {
        _context = context;
        _currentUser = currentUser;
        _reader = reader;
        _uploadSigner = uploadSigner;
        _directStorage = directStorage;
    }

    public async Task<PlatformAssetDto> ExecuteAsync(CompletePlatformAssetUploadUseCaseInput input)
    {
        if (_uploadSigner == null || _directStorage is not { SupportsDirectAccess: true })
        {
            throw new BadRequestException("Hệ thống chưa bật lưu trữ Object Storage trực tiếp.", "uploadToken", "DIRECT_STORAGE_DISABLED");
        }

        if (!_uploadSigner.TryVerify(input.UploadToken, out var ticket) || ticket == null || ticket.UserId != _currentUser.UserId)
        {
            throw new BadRequestException("Vé tải tệp không hợp lệ hoặc đã hết hạn.", "uploadToken", "INVALID_UPLOAD_TOKEN");
        }

        var metadata = await _directStorage.GetMetadataAsync(ticket.StorageKey);
        if (metadata == null
            || metadata.SizeBytes <= 0
            || metadata.SizeBytes != ticket.ExpectedSizeBytes
            || metadata.SizeBytes > PlatformCatalog.AssetKind.MaxBytes(ticket.Kind))
        {
            throw new BadRequestException("Tệp tải lên chưa hoàn tất hoặc không khớp kích thước.", "uploadToken", "UPLOAD_INCOMPLETE");
        }

        var asset = new PlatformAsset
        {
            Kind = ticket.Kind,
            FileName = ticket.FileName,
            ContentType = ticket.ContentType,
            SizeBytes = metadata.SizeBytes,
            StorageKey = ticket.StorageKey,
            UploadedByUserId = _currentUser.UserId,
        };
        _context.PlatformAssets.Add(asset);
        await _context.SaveChangesAsync();
        return _reader.Asset(asset);
    }
}
