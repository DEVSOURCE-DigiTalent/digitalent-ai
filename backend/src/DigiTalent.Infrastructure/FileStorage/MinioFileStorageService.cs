using System.Security.Cryptography;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;

namespace DigiTalent.Infrastructure.FileStorage;

/// <summary>
/// Lưu trữ tệp trên MinIO (tương thích S3):
/// - Hỗ trợ upload/tải trực tiếp bằng Presigned URL (không qua API server) khi cấu hình MinioPublicEndpoint.
/// - Ghi hình giám sát (AppendAsync) lưu từng mẩu thành part tạm rồi hợp nhất bằng FinalizeAsync thành 1 tệp để tua Range mượt.
/// </summary>
public sealed class MinioFileStorageService : IFileStorageService, IDirectFileStorageService, IChunkedFileFinalizer, IDisposable
{
    private const string PartsSuffix = ".parts/";

    private readonly FileStorageSettings _settings;
    private readonly IMinioClient _internalClient;
    private readonly IMinioClient? _publicSigningClient;
    private readonly string _publicBasePath;
    private readonly SemaphoreSlim _bucketLock = new(1, 1);
    private bool _bucketVerified;
    private long _partSequence;

    public MinioFileStorageService(FileStorageSettings settings)
    {
        _settings = settings;
        _internalClient = BuildClient(
            settings.MinioEndpoint,
            settings.MinioUseSsl,
            settings.MinioAccessKey,
            settings.MinioSecretKey,
            settings.MinioRegion);

        var (publicEndpoint, publicSsl, publicBasePath) = ResolvePublicEndpoint(settings);
        _publicBasePath = publicBasePath;
        if (!string.IsNullOrEmpty(publicEndpoint))
        {
            _publicSigningClient = BuildClient(
                publicEndpoint,
                publicSsl,
                settings.MinioAccessKey,
                settings.MinioSecretKey,
                settings.MinioRegion);
        }
    }

    public bool SupportsDirectAccess => _publicSigningClient != null;

    public async Task<string> UploadAsync(
        Stream content,
        string fileName,
        string contentType,
        string folder = "general",
        CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);

        var sanitizedFolder = SanitizeKey(folder);
        var dateFolder = DateTime.UtcNow.ToString("yyyyMM");
        var extension = Path.GetExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
        var objectKey = string.IsNullOrEmpty(sanitizedFolder)
            ? $"{dateFolder}/{uniqueFileName}"
            : $"{sanitizedFolder}/{dateFolder}/{uniqueFileName}";

        var resolvedContentType = string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType;
        await PutSeekableAsync(objectKey, content, resolvedContentType, cancellationToken);
        return objectKey;
    }

    public async Task AppendAsync(string storagePath, Stream content, CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);

        var key = SanitizeKey(storagePath);
        if (await TryStatAsync(key, cancellationToken) == null)
        {
            throw new NotFoundException($"Storage file '{storagePath}' not found.");
        }

        var seq = Interlocked.Increment(ref _partSequence);
        var partKey = $"{key}{PartsSuffix}{DateTime.UtcNow.Ticks:D19}_{seq:D10}_{Guid.NewGuid():N}";
        await PutSeekableAsync(partKey, content, "application/octet-stream", cancellationToken);
    }

    public async Task FinalizeAsync(string storagePath, string? contentType = null, CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);

        var key = SanitizeKey(storagePath);
        var partKeys = await ListPartKeysAsync(key, cancellationToken);
        if (partKeys.Count == 0)
        {
            return;
        }

        var stat = await TryStatAsync(key, cancellationToken)
                   ?? throw new NotFoundException($"Storage file '{storagePath}' not found.");
        var resolvedContentType = !string.IsNullOrWhiteSpace(contentType)
            ? contentType
            : (!string.IsNullOrWhiteSpace(stat.ContentType) ? stat.ContentType : "application/octet-stream");

        var tempPath = Path.Combine(Path.GetTempPath(), $"dt-merge-{Guid.NewGuid():N}.tmp");
        try
        {
            await using (var merged = new FileStream(
                tempPath,
                FileMode.Create,
                FileAccess.ReadWrite,
                FileShare.None,
                81920,
                FileOptions.Asynchronous | FileOptions.DeleteOnClose))
            {
                await CopyObjectToStreamAsync(key, merged, cancellationToken);
                foreach (var partKey in partKeys)
                {
                    await CopyObjectToStreamAsync(partKey, merged, cancellationToken);
                }

                merged.Position = 0;
                await _internalClient.PutObjectAsync(
                    new PutObjectArgs()
                        .WithBucket(_settings.MinioBucketName)
                        .WithObject(key)
                        .WithStreamData(merged)
                        .WithObjectSize(merged.Length)
                        .WithContentType(resolvedContentType),
                    cancellationToken);
            }

            foreach (var partKey in partKeys)
            {
                await _internalClient.RemoveObjectAsync(
                    new RemoveObjectArgs().WithBucket(_settings.MinioBucketName).WithObject(partKey),
                    cancellationToken);
            }
        }
        finally
        {
            if (File.Exists(tempPath))
            {
                try { File.Delete(tempPath); } catch { /* DeleteOnClose handles normal cleanup */ }
            }
        }
    }

    public async Task<Stream> DownloadAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);

        var key = SanitizeKey(storagePath);
        await FinalizeAsync(key, null, cancellationToken);

        if (await TryStatAsync(key, cancellationToken) == null)
        {
            throw new NotFoundException($"Storage file '{storagePath}' not found.");
        }

        var tempPath = Path.Combine(Path.GetTempPath(), $"dt-dl-{Guid.NewGuid():N}.tmp");
        var stream = new FileStream(
            tempPath,
            FileMode.Create,
            FileAccess.ReadWrite,
            FileShare.None,
            81920,
            FileOptions.Asynchronous | FileOptions.DeleteOnClose);

        try
        {
            await CopyObjectToStreamAsync(key, stream, cancellationToken);
            stream.Position = 0;
            return stream;
        }
        catch
        {
            await stream.DisposeAsync();
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);

        var key = SanitizeKey(storagePath);
        var exists = await TryStatAsync(key, cancellationToken) != null;
        var partKeys = await ListPartKeysAsync(key, cancellationToken);

        foreach (var partKey in partKeys)
        {
            await _internalClient.RemoveObjectAsync(
                new RemoveObjectArgs().WithBucket(_settings.MinioBucketName).WithObject(partKey),
                cancellationToken);
        }

        if (!exists)
        {
            return partKeys.Count > 0;
        }

        await _internalClient.RemoveObjectAsync(
            new RemoveObjectArgs().WithBucket(_settings.MinioBucketName).WithObject(key),
            cancellationToken);
        return true;
    }

    public async Task<string> GetDownloadUrlAsync(string storagePath, TimeSpan? expiresIn = null, CancellationToken cancellationToken = default)
    {
        var key = SanitizeKey(storagePath);
        var presigned = await GetPresignedDownloadUrlAsync(key, expiresIn ?? TimeSpan.FromHours(1), null, true, cancellationToken);
        return presigned ?? $"/api/v1/files/{key}";
    }

    public async Task<string?> GetPresignedUploadUrlAsync(
        string storageKey,
        string contentType,
        TimeSpan expiresIn,
        CancellationToken cancellationToken = default)
    {
        if (_publicSigningClient == null)
        {
            return null;
        }

        await EnsureBucketAsync(cancellationToken);
        var key = SanitizeKey(storageKey);
        var expirySeconds = Math.Clamp((int)expiresIn.TotalSeconds, 60, 7 * 24 * 3600);
        var args = new PresignedPutObjectArgs()
            .WithBucket(_settings.MinioBucketName)
            .WithObject(key)
            .WithExpiry(expirySeconds);

        var signedUrl = await _publicSigningClient.PresignedPutObjectAsync(args);
        return ApplyPublicBasePath(signedUrl);
    }

    public async Task<string?> GetPresignedDownloadUrlAsync(
        string storageKey,
        TimeSpan expiresIn,
        string? fileName = null,
        bool inline = true,
        CancellationToken cancellationToken = default)
    {
        if (_publicSigningClient == null)
        {
            return null;
        }

        var key = SanitizeKey(storageKey);
        var expirySeconds = Math.Clamp((int)expiresIn.TotalSeconds, 60, 7 * 24 * 3600);
        var reqParams = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (inline)
        {
            reqParams["response-content-disposition"] = string.IsNullOrWhiteSpace(fileName)
                ? "inline"
                : $"inline; filename=\"{SanitizeDispositionFileName(fileName)}\"";
        }
        else
        {
            reqParams["response-content-disposition"] = string.IsNullOrWhiteSpace(fileName)
                ? "attachment"
                : $"attachment; filename=\"{SanitizeDispositionFileName(fileName)}\"";
        }

        var args = new PresignedGetObjectArgs()
            .WithBucket(_settings.MinioBucketName)
            .WithObject(key)
            .WithExpiry(expirySeconds)
            .WithHeaders(reqParams);

        var signedUrl = await _publicSigningClient.PresignedGetObjectAsync(args);
        return ApplyPublicBasePath(signedUrl);
    }

    public async Task<StoredObjectMetadata?> GetMetadataAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);
        var stat = await TryStatAsync(SanitizeKey(storageKey), cancellationToken);
        return stat == null ? null : new StoredObjectMetadata(stat.Size, stat.ContentType);
    }

    public void Dispose()
    {
        _bucketLock.Dispose();
        _internalClient.Dispose();
        _publicSigningClient?.Dispose();
    }

    private async Task EnsureBucketAsync(CancellationToken cancellationToken)
    {
        if (_bucketVerified)
        {
            return;
        }

        await _bucketLock.WaitAsync(cancellationToken);
        try
        {
            if (_bucketVerified)
            {
                return;
            }

            var exists = await _internalClient.BucketExistsAsync(
                new BucketExistsArgs().WithBucket(_settings.MinioBucketName),
                cancellationToken);
            if (!exists)
            {
                await _internalClient.MakeBucketAsync(
                    new MakeBucketArgs().WithBucket(_settings.MinioBucketName),
                    cancellationToken);
            }

            _bucketVerified = true;
        }
        finally
        {
            _bucketLock.Release();
        }
    }

    private async Task PutSeekableAsync(string objectKey, Stream content, string contentType, CancellationToken cancellationToken)
    {
        if (content.CanSeek)
        {
            if (content.Position != 0)
            {
                content.Position = 0;
            }

            await _internalClient.PutObjectAsync(
                new PutObjectArgs()
                    .WithBucket(_settings.MinioBucketName)
                    .WithObject(objectKey)
                    .WithStreamData(content)
                    .WithObjectSize(content.Length)
                    .WithContentType(contentType),
                cancellationToken);
            return;
        }

        var tempPath = Path.Combine(Path.GetTempPath(), $"dt-up-{Guid.NewGuid():N}.tmp");
        await using var temp = new FileStream(
            tempPath,
            FileMode.Create,
            FileAccess.ReadWrite,
            FileShare.None,
            81920,
            FileOptions.Asynchronous | FileOptions.DeleteOnClose);

        await content.CopyToAsync(temp, cancellationToken);
        temp.Position = 0;

        await _internalClient.PutObjectAsync(
            new PutObjectArgs()
                .WithBucket(_settings.MinioBucketName)
                .WithObject(objectKey)
                .WithStreamData(temp)
                .WithObjectSize(temp.Length)
                .WithContentType(contentType),
            cancellationToken);
    }

    private async Task<Minio.DataModel.ObjectStat?> TryStatAsync(string key, CancellationToken cancellationToken)
    {
        try
        {
            return await _internalClient.StatObjectAsync(
                new StatObjectArgs().WithBucket(_settings.MinioBucketName).WithObject(key),
                cancellationToken);
        }
        catch (ObjectNotFoundException)
        {
            return null;
        }
        catch (BucketNotFoundException)
        {
            return null;
        }
    }

    private async Task<List<string>> ListPartKeysAsync(string key, CancellationToken cancellationToken)
    {
        var prefix = $"{key}{PartsSuffix}";
        var keys = new List<string>();
        await foreach (var item in _internalClient.ListObjectsEnumAsync(
            new ListObjectsArgs()
                .WithBucket(_settings.MinioBucketName)
                .WithPrefix(prefix)
                .WithRecursive(true),
            cancellationToken))
        {
            if (!string.IsNullOrEmpty(item.Key))
            {
                keys.Add(item.Key);
            }
        }

        keys.Sort(StringComparer.Ordinal);
        return keys;
    }

    private async Task CopyObjectToStreamAsync(string objectKey, Stream target, CancellationToken cancellationToken)
    {
        await _internalClient.GetObjectAsync(
            new GetObjectArgs()
                .WithBucket(_settings.MinioBucketName)
                .WithObject(objectKey)
                .WithCallbackStream((source, ct) => source.CopyToAsync(target, ct)),
            cancellationToken);
    }

    private string ApplyPublicBasePath(string signedUrl)
    {
        if (string.IsNullOrEmpty(_publicBasePath))
        {
            return signedUrl;
        }

        var builder = new UriBuilder(signedUrl);
        var path = builder.Path.StartsWith('/') ? builder.Path : "/" + builder.Path;
        builder.Path = _publicBasePath + path;
        return builder.Uri.ToString();
    }

    private static IMinioClient BuildClient(string endpoint, bool useSsl, string accessKey, string secretKey, string region)
    {
        var normalized = endpoint.Trim();
        if (normalized.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
        {
            normalized = normalized["http://".Length..];
            useSsl = false;
        }
        else if (normalized.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            normalized = normalized["https://".Length..];
            useSsl = true;
        }

        normalized = normalized.TrimEnd('/');
        return new MinioClient()
            .WithEndpoint(normalized)
            .WithCredentials(accessKey, secretKey)
            .WithRegion(string.IsNullOrWhiteSpace(region) ? "us-east-1" : region)
            .WithSSL(useSsl)
            .Build();
    }

    private static (string? Endpoint, bool UseSsl, string BasePath) ResolvePublicEndpoint(FileStorageSettings settings)
    {
        var raw = settings.MinioPublicEndpoint?.Trim();
        if (string.IsNullOrWhiteSpace(raw))
        {
            // Local development convenience: if MinioEndpoint points to localhost/127.0.0.1, browser can reach it directly.
            var ep = settings.MinioEndpoint?.Trim() ?? string.Empty;
            if (ep.StartsWith("localhost", StringComparison.OrdinalIgnoreCase)
                || ep.StartsWith("127.0.0.1", StringComparison.OrdinalIgnoreCase))
            {
                return (ep, settings.MinioUseSsl, string.Empty);
            }

            return (null, false, string.Empty);
        }

        if (!raw.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
            && !raw.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            raw = (settings.MinioUseSsl ? "https://" : "http://") + raw;
        }

        var uri = new Uri(raw);
        var endpoint = uri.IsDefaultPort ? uri.Host : $"{uri.Host}:{uri.Port}";
        var basePath = uri.AbsolutePath.TrimEnd('/');
        if (basePath == "/")
        {
            basePath = string.Empty;
        }

        return (endpoint, uri.Scheme.Equals("https", StringComparison.OrdinalIgnoreCase), basePath);
    }

    private static string SanitizeKey(string path) =>
        path.Replace('\\', '/').Replace("..", "").Trim('/');

    private static string SanitizeDispositionFileName(string fileName)
    {
        var name = Path.GetFileName(fileName)
            .Replace("\"", "")
            .Replace("\r", "")
            .Replace("\n", "")
            .Replace('đ', 'd')
            .Replace('Đ', 'D')
            .Normalize(System.Text.NormalizationForm.FormD);

        var ascii = new System.Text.StringBuilder(name.Length);
        foreach (var ch in name)
        {
            if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch) == System.Globalization.UnicodeCategory.NonSpacingMark)
                continue;
            ascii.Append(ch >= 0x20 && ch <= 0x7E ? ch : '_');
        }

        var result = ascii.ToString().Trim();
        return string.IsNullOrEmpty(result) ? "file" : result;
    }
}
