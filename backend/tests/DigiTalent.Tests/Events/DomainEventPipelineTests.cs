using DigiTalent.Application.Common.Events;
using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Infrastructure.Events;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace DigiTalent.Tests.Events;

/// <summary>
/// Cơ chế domain event trong AppDbContext.SaveChangesAsync (spec Sprint 3 §6.1, §6.4 E2–E4).
/// </summary>
public class DomainEventPipelineTests
{
    private sealed record OrganizationRenamed(string Code) : IDomainEvent
    {
        public DateTimeOffset OccurredAt { get; } = DateTimeOffset.UtcNow;
    }

    private sealed record Ping(int Depth) : IDomainEvent
    {
        public DateTimeOffset OccurredAt { get; } = DateTimeOffset.UtcNow;
    }

    /// <summary>Ghi lại kích thước lô, thêm 1 organization để kiểm tra thay đổi của handler được lưu, đăng ký tác vụ sau commit.</summary>
    private sealed class RecordingHandler : IDomainEventHandler<OrganizationRenamed>
    {
        private readonly AppDbContext _context;
        private readonly IAfterCommitQueue _afterCommit;
        private readonly Probe _probe;

        public RecordingHandler(AppDbContext context, IAfterCommitQueue afterCommit, Probe probe)
        {
            _context = context;
            _afterCommit = afterCommit;
            _probe = probe;
        }

        public Task HandleAsync(IReadOnlyList<OrganizationRenamed> events, CancellationToken cancellationToken)
        {
            _probe.BatchSizes.Add(events.Count);
            _context.Organizations.Add(new Domain.Entities.Organization { Code = $"H_{events[0].Code}", Name = "Added by handler" });
            _afterCommit.Enqueue("record push", _ =>
            {
                _probe.AfterCommitRuns++;
                return Task.CompletedTask;
            });
            if (_probe.FailingAfterCommit)
            {
                _afterCommit.Enqueue("failing push", _ => throw new InvalidOperationException("SignalR down"));
            }
            return Task.CompletedTask;
        }
    }

    private sealed class ThrowingHandler : IDomainEventHandler<OrganizationRenamed>
    {
        public Task HandleAsync(IReadOnlyList<OrganizationRenamed> events, CancellationToken cancellationToken) =>
            throw new InvalidOperationException("handler failed");
    }

    /// <summary>Mỗi event lại phát event mới → phải bị chặn sau số vòng tối đa.</summary>
    private sealed class EndlessHandler : IDomainEventHandler<Ping>
    {
        private readonly AppDbContext _context;

        public EndlessHandler(AppDbContext context) => _context = context;

        public Task HandleAsync(IReadOnlyList<Ping> events, CancellationToken cancellationToken)
        {
            _context.AddDomainEvent(new Ping(events[0].Depth + 1));
            return Task.CompletedTask;
        }
    }

    private sealed class Probe
    {
        public List<int> BatchSizes { get; } = new();
        public int AfterCommitRuns { get; set; }
        public bool FailingAfterCommit { get; set; }
    }

    private static (IServiceScope Scope, AppDbContext Context, Probe Probe) Build(Action<IServiceCollection> registerHandlers)
    {
        var services = new ServiceCollection();
        var databaseName = Guid.NewGuid().ToString();
        services.AddLogging();
        services.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase(databaseName));
        services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();
        services.AddScoped<AfterCommitQueue>();
        services.AddScoped<IAfterCommitQueue>(sp => sp.GetRequiredService<AfterCommitQueue>());
        services.AddSingleton<Probe>();
        registerHandlers(services);

        var scope = services.BuildServiceProvider().CreateScope();
        return (scope, scope.ServiceProvider.GetRequiredService<AppDbContext>(), scope.ServiceProvider.GetRequiredService<Probe>());
    }

    private static Domain.Entities.Organization NewOrganization(string code) =>
        new() { Code = code, Name = code, Status = Statuses.Simple.Active };

    [Fact]
    public async Task SaveChanges_DispatchesEventsAsOneBatch_AndPersistsHandlerChanges()
    {
        var (scope, context, probe) = Build(s => s.AddScoped<IDomainEventHandler<OrganizationRenamed>, RecordingHandler>());
        using var _ = scope;
        context.Organizations.Add(NewOrganization("MAIN"));
        context.AddDomainEvent(new OrganizationRenamed("A"));
        context.AddDomainEvent(new OrganizationRenamed("B"));

        await context.SaveChangesAsync();

        probe.BatchSizes.Should().Equal(2);
        (await context.Organizations.CountAsync()).Should().Be(2, "the main change and the handler change are both saved");
        probe.AfterCommitRuns.Should().Be(1);
    }

    [Fact]
    public async Task SaveChanges_WhenHandlerThrows_FailsAndSkipsAfterCommitAndClearsEvents()
    {
        var (scope, context, probe) = Build(s =>
        {
            s.AddScoped<IDomainEventHandler<OrganizationRenamed>, RecordingHandler>();
            s.AddScoped<IDomainEventHandler<OrganizationRenamed>, ThrowingHandler>();
        });
        using var _ = scope;
        context.AddDomainEvent(new OrganizationRenamed("A"));

        var act = () => context.SaveChangesAsync();

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("handler failed");
        probe.AfterCommitRuns.Should().Be(0);
        context.ChangeTracker.Entries().Should().BeEmpty("a failed save must not leak tracked changes into the next save");

        // Event đã bị xóa: lần lưu sau không chạy lại handler lỗi
        await context.SaveChangesAsync();
        probe.BatchSizes.Should().Equal(1);
    }

    [Fact]
    public async Task SaveChanges_WhenAfterCommitActionFails_StillSucceeds()
    {
        var (scope, context, probe) = Build(s => s.AddScoped<IDomainEventHandler<OrganizationRenamed>, RecordingHandler>());
        using var _ = scope;
        probe.FailingAfterCommit = true;
        context.AddDomainEvent(new OrganizationRenamed("A"));

        var act = () => context.SaveChangesAsync();

        await act.Should().NotThrowAsync();
        probe.AfterCommitRuns.Should().Be(1);
    }

    [Fact]
    public async Task SaveChanges_StopsEventsThatKeepRaisingEvents()
    {
        var (scope, context, _) = Build(s => s.AddScoped<IDomainEventHandler<Ping>, EndlessHandler>());
        using var __ = scope;
        context.AddDomainEvent(new Ping(0));

        var act = () => context.SaveChangesAsync();

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*rounds*");
    }

    [Fact]
    public async Task SaveChanges_WithoutHandlers_SavesNormally()
    {
        var (scope, context, _) = Build(_ => { });
        using var __ = scope;
        context.Organizations.Add(NewOrganization("PLAIN"));
        context.AddDomainEvent(new OrganizationRenamed("NOBODY_LISTENS"));

        await context.SaveChangesAsync();

        (await context.Organizations.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task ContextCreatedWithoutDispatcher_IgnoresEvents()
    {
        using var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        context.Organizations.Add(NewOrganization("LEGACY"));
        context.AddDomainEvent(new OrganizationRenamed("IGNORED"));

        await context.SaveChangesAsync();

        (await context.Organizations.CountAsync()).Should().Be(1);
    }
}
