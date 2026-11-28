using System.Text.Json;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using TrackStatus = DigiTalent.Domain.Constants.Statuses.SignLanguageTrack;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// "Xuất bản video ký hiệu": the rendered video becomes what learners see, at once, wherever the lesson video is shown.
/// Only a real, current, readable output of a fully mapped and reviewed map is published (docs/specs §14); the
/// lesson video and its captions are untouched. The settings and sentences are kept as a snapshot for "Hủy bản nháp".
/// </summary>
public class PublishSignLanguageVideoUseCase : IUseCase<PublishSignLanguageVideoUseCaseInput, SignLanguageVideoDto>
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _storage;
    private readonly IDirectFileStorageService? _directStorage;
    private readonly SignLanguageVideoReader _reader;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _audit;
    private readonly TimeProvider _time;

    public PublishSignLanguageVideoUseCase(
        IApplicationDbContext context,
        IFileStorageService storage,
        SignLanguageVideoReader reader,
        ICurrentUser currentUser,
        IAuditService audit,
        TimeProvider time,
        IDirectFileStorageService? directStorage = null)
    {
        _context = context;
        _storage = storage;
        _directStorage = directStorage;
        _reader = reader;
        _currentUser = currentUser;
        _audit = audit;
        _time = time;
    }

    public async Task<SignLanguageVideoDto> ExecuteAsync(PublishSignLanguageVideoUseCaseInput input)
    {
        var now = _time.GetUtcNow();
        var track = await SignVideoStore.TrackAsync(_context, input.TrackId);
        if (track.Status == TrackStatus.Published && track.PublishedOutputAssetId == track.OutputAssetId)
        {
            return await _reader.ReadAsync(track.SourceAssetId, track.SignLanguage);
        }

        var states = await SignVideoStore.SegmentsAsync(_context, track.Id);
        var entries = await SignDictionaryLoader.ByIdsAsync(_context, states.SelectMany(s => s.Items).Where(i => i.GlossId != null).Select(i => i.GlossId!.Value));
        var output = track.OutputAssetId == null ? null : await _context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == track.OutputAssetId);
        var problem = SignVideoRules.PublishProblems(track, states, entries, output, now).FirstOrDefault();
        if (problem != null)
        {
            if (problem.Code == SignVideo.Errors.JobAlreadyRunning) throw new ConflictException(problem.Message, "trackId", problem.Code);
            throw new BadRequestException(problem.Message, "trackId", problem.Code);
        }

        if (!await SignVideoStore.IsStoredAsync(_storage, _directStorage, output!.StorageKey))
        {
            throw new BadRequestException("Không tìm thấy tệp video ký hiệu trong kho lưu trữ. Dựng lại video.", "trackId", SignVideo.Errors.OutputInvalid);
        }

        track.PublishedOutputAssetId = track.OutputAssetId;
        track.PublishedRenderMode = track.RenderMode;
        track.PublishedSnapshot = JsonSerializer.Serialize(SignVideoSnapshot.Of(track, states), Json);
        track.PublishedAt = now;
        track.PublishedByUserId = _currentUser.UserId;
        track.Status = TrackStatus.Published;
        await _context.SaveChangesAsync();

        await _audit.LogAsync(
            "PLATFORM_SIGN_VIDEO_PUBLISHED",
            "platform_sign_language_tracks",
            track.Id,
            newValues: new
            {
                sourceAssetId = track.SourceAssetId,
                outputAssetId = track.OutputAssetId,
                renderMode = track.RenderMode,
                signLanguage = track.SignLanguage,
                region = track.Region,
                sentences = states.Count,
                signs = states.Sum(s => s.Signed.Count()),
            },
            entityLabel: $"Video ngôn ngữ ký hiệu {output.FileName}");

        return await _reader.ReadAsync(track.SourceAssetId, track.SignLanguage);
    }
}
