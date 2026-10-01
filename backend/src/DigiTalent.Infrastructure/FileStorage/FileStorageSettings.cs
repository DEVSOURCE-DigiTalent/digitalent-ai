namespace DigiTalent.Infrastructure.FileStorage;

public class FileStorageSettings
{
    public string Provider { get; set; } = "Local"; // "Local" hoặc "Minio"
    public string LocalBasePath { get; set; } = "uploads";
    public string MinioEndpoint { get; set; } = "localhost:9000";
    public string MinioAccessKey { get; set; } = "minioadmin";
    public string MinioSecretKey { get; set; } = "minioadmin";
    public string MinioBucketName { get; set; } = "digitalent";
    public bool MinioUseSsl { get; set; } = false;
}
