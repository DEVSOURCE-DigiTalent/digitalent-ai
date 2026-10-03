using System.Reflection;
using DigiTalent.Application.Common.Events;
using DigiTalent.Domain.Common;
using Microsoft.Extensions.DependencyInjection;

namespace DigiTalent.Infrastructure.Events;

/// <summary>
/// Gom event theo loại và gọi mọi IDomainEventHandler&lt;T&gt; đã đăng ký (resolve lười từ scope hiện tại,
/// nên handler dùng chung DbContext với use case).
/// </summary>
public class DomainEventDispatcher : IDomainEventDispatcher
{
    private static readonly MethodInfo DispatchGroupMethod =
        typeof(DomainEventDispatcher).GetMethod(nameof(DispatchGroupAsync), BindingFlags.NonPublic | BindingFlags.Instance)!;

    private readonly IServiceProvider _serviceProvider;

    public DomainEventDispatcher(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task DispatchAsync(IReadOnlyList<IDomainEvent> events, CancellationToken cancellationToken)
    {
        foreach (var group in events.GroupBy(e => e.GetType()))
        {
            var dispatch = (Task)DispatchGroupMethod
                .MakeGenericMethod(group.Key)
                .Invoke(this, new object[] { group.ToList(), cancellationToken })!;
            await dispatch;
        }
    }

    private async Task DispatchGroupAsync<TEvent>(List<IDomainEvent> events, CancellationToken cancellationToken)
        where TEvent : IDomainEvent
    {
        var typed = events.Cast<TEvent>().ToList();
        foreach (var handler in _serviceProvider.GetServices<IDomainEventHandler<TEvent>>())
        {
            await handler.HandleAsync(typed, cancellationToken);
        }
    }
}
