using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;

namespace DigiTalent.Infrastructure.FileStorage;

public class LocalFileStorageService : IFileStorageService
{
    private readonly FileStorageSettings _settings;

    public LocalFileStorageService(FileStorageSettings settings)
    {
        _settings = settings;
    }

    public async Task<string> UploadAsync(Stream content, string fileName, string contentType, string folder = "general", CancellationToken cancellationToken = default)
    {
        var sanitizedFolder = folder.Replace("..", "").Trim('/', '\\');
        var dateFolder = DateTime.UtcNow.ToString("yyyyMM");
        var directory = Path.Combine(AppContext.BaseDirectory, _settings.LocalBasePath, sanitizedFolder, dateFolder);

        Directory.CreateDirectory(directory);

        var extension = Path.GetExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(directory, uniqueFileName);

        await using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, true);
        await content.CopyToAsync(fileStream, cancellationToken);

        var relativePath = Path.Combine(sanitizedFolder, dateFolder, uniqueFileName).Replace('\\', '/');
        return relativePath;
    }

    public Task<Stream> DownloadAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var sanitized = storagePath.Replace("..", "").TrimStart('/', '\\');
        var fullPath = Path.Combine(AppContext.BaseDirectory, _settings.LocalBasePath, sanitized);

        if (!File.Exists(fullPath))
        {
            throw new NotFoundException($"Storage file '{storagePath}' not found.");
        }

        Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, true);
        return Task.FromResult(stream);
    }

    public Task<bool> DeleteAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var sanitized = storagePath.Replace("..", "").TrimStart('/', '\\');
        var fullPath = Path.Combine(AppContext.BaseDirectory, _settings.LocalBasePath, sanitized);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }

    public Task<string> GetDownloadUrlAsync(string storagePath, TimeSpan? expiresIn = null, CancellationToken cancellationToken = default)
    {
        var sanitized = storagePath.Replace('\\', '/').TrimStart('/');
        return Task.FromResult($"/api/v1/files/{sanitized}");
    }
}
