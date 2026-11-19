using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure;
using DigiTalent.Infrastructure.FileStorage;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace DigiTalent.Tests.FileStorage;

public class FileStorageDiLifetimeTests
{
    [Fact]
    public void MinioStorage_ResolvedFromScope_IsNotDisposedWhenScopeEnds()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Database=dummy;",
                ["FileStorage:Provider"] = "Minio",
                ["FileStorage:MinioEndpoint"] = "localhost:9000",
                ["FileStorage:MinioAccessKey"] = "minioadmin",
                ["FileStorage:MinioSecretKey"] = "minioadmin",
                ["FileStorage:MinioBucketName"] = "digitalent-ai",
            })
            .Build();

        var services = new ServiceCollection();
        services.AddInfrastructure(config);

        using var rootProvider = services.BuildServiceProvider();

        MinioFileStorageService instanceFirstScope;
        using (var scope = rootProvider.CreateScope())
        {
            var storage = scope.ServiceProvider.GetRequiredService<IFileStorageService>();
            var direct = scope.ServiceProvider.GetRequiredService<IDirectFileStorageService>();
            var finalizer = scope.ServiceProvider.GetRequiredService<IChunkedFileFinalizer>();

            storage.Should().BeSameAs(direct);
            direct.Should().BeSameAs(finalizer);

            instanceFirstScope = (MinioFileStorageService)storage;
        }

        // Scope 1 has completed and been disposed.
        // If IFileStorageService had been registered as Scoped with factory (the bug),
        // scope.Dispose() would have disposed instanceFirstScope, causing ObjectDisposedException.
        using (var scope2 = rootProvider.CreateScope())
        {
            var storage2 = scope2.ServiceProvider.GetRequiredService<IFileStorageService>();
            storage2.Should().BeSameAs(instanceFirstScope);
        }
    }
}
