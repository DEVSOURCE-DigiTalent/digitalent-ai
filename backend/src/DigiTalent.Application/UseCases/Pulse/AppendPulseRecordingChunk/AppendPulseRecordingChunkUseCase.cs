using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// PUT /me/pulse/proctoring/{sessionId}/recordings/{recordingId}/chunks/{seq} — ghép một mẩu ghi hình (vài giây do
/// MediaRecorder cắt) vào tệp của đoạn ghi, đúng thứ tự từ 0. Mẩu đã nhận rồi (gửi lại sau lỗi mạng) được bỏ qua; mẩu
/// vượt thứ tự → 400 CHUNK_OUT_OF_ORDER. Số mẩu là concurrency token nên hai lần gửi cùng lúc một mẩu không bị ghép trùng (409): số mẩu được
/// giữ chỗ trước khi ghi tệp và trả lại nếu ghi tệp lỗi.
/// </summary>
public class AppendPulseRecordingChunkUseCase : IUseCase<AppendPulseRecordingChunkUseCaseInput, AppendPulseRecordingChunkUseCaseOutput>
{
    public const string OutOfOrder = "CHUNK_OUT_OF_ORDER";
    public const string TooLarge = "CHUNK_TOO_LARGE";
    public const string Empty = "CHUNK_EMPTY";

    private readonly IApplicationDbContext _context;
    private readonly PulseProctoring _proctoring;
    private readonly IFileStorageService _storage;

    public AppendPulseRecordingChunkUseCase(IApplicationDbContext context, PulseProctoring proctoring, IFileStorageService storage)
    {
        _context = context;
        _proctoring = proctoring;
        _storage = storage;
    }

    public async Task<AppendPulseRecordingChunkUseCaseOutput> ExecuteAsync(AppendPulseRecordingChunkUseCaseInput input)
    {
        var session = await _proctoring.LoadOwnOpenAsync(input.SessionId);
        var recording = await _context.ProctoringRecordings.FirstOrDefaultAsync(r => r.Id == input.RecordingId && r.SessionId == session.Id)
                        ?? throw new NotFoundException("Không tìm thấy đoạn ghi của phiên làm bài.");

        if (input.Seq < recording.ChunkCount)
        {
            return new AppendPulseRecordingChunkUseCaseOutput { Received = recording.ChunkCount, SizeBytes = recording.SizeBytes, Duplicate = true };
        }

        if (input.Seq > recording.ChunkCount)
        {
            throw new BadRequestException($"Mẩu ghi hình không đúng thứ tự: cần mẩu {recording.ChunkCount}.", "seq", OutOfOrder);
        }

        using var buffer = new MemoryStream();
        var read = new byte[81920];
        int count;
        while ((count = await input.Content.ReadAsync(read)) > 0)
        {
            if (buffer.Length + count > PulseRules.MaxRecordingChunkBytes)
            {
                throw new BadRequestException("Mẩu ghi hình quá lớn.", "content", TooLarge);
            }

            buffer.Write(read, 0, count);
        }

        if (buffer.Length == 0)
        {
            throw new BadRequestException("Mẩu ghi hình rỗng.", "content", Empty);
        }

        // Giữ chỗ mẩu này trước khi ghi tệp (xung đột → DbUpdateConcurrencyException → 409).
        var size = buffer.Length;
        recording.ChunkCount += 1;
        recording.SizeBytes += size;
        await _context.SaveChangesAsync();

        try
        {
            buffer.Position = 0;
            if (recording.StoragePath == null)
            {
                var extension = recording.ContentType.StartsWith("video/mp4", StringComparison.OrdinalIgnoreCase) ? ".mp4" : ".webm";
                recording.StoragePath = await _storage.UploadAsync(
                    buffer,
                    $"{recording.Track.ToLowerInvariant()}-{recording.SegmentNo}{extension}",
                    recording.ContentType,
                    $"proctoring/{session.Id:N}");
                await _context.SaveChangesAsync();
            }
            else
            {
                await _storage.AppendAsync(recording.StoragePath, buffer);
            }
        }
        catch
        {
            recording.ChunkCount -= 1;
            recording.SizeBytes -= size;
            await _context.SaveChangesAsync();
            throw;
        }

        return new AppendPulseRecordingChunkUseCaseOutput { Received = recording.ChunkCount, SizeBytes = recording.SizeBytes };
    }
}
