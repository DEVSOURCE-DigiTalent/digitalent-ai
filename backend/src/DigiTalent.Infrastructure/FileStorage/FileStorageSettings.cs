namespace DigiTalent.Infrastructure.FileStorage;

public class FileStorageSettings
{
    public string Provider { get; set; } = "Local"; // "Local" hoặc "Minio"
    public string LocalBasePath { get; set; } = "uploads";
    public string MinioEndpoint { get; set; } = "localhost:9000";
    /// <summary>URL công khai trình duyệt dùng để truy cập MinIO (VD: https://digitalent-ai.duckdns.org/storage hoặc http://localhost:9000).</summary>
    public string? MinioPublicEndpoint { get; set; }
    public string MinioAccessKey { get; set; } = "minioadmin";
    public string MinioSecretKey { get; set; } = "minioadmin";
    public string MinioBucketName { get; set; } = "digitalent-ai";
    public string MinioRegion { get; set; } = "us-east-1";
    public bool MinioUseSsl { get; set; } = false;
    public int PresignedUploadExpiresMinutes { get; set; } = 30;
}
