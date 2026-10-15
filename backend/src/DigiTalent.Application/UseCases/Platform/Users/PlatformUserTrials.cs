using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Users;

/// <summary>
/// The 7-day reverse trial of personal accounts as Platform Admin follows it. A trial whose end date passed counts as
/// ended even while its row still says TRIALING (the account falls back to the Free plan lazily, at sign-in).
/// </summary>
public static class PlatformUserTrials
{
    public const string Active = "ACTIVE";
    public const string EndingSoon = "ENDING_SOON";
    public const string Ended = "ENDED";
    public const string Any = "ANY";
    public const string FreePlan = "IND_FREE";

    public static readonly string[] Filters = { Active, EndingSoon, Ended, Any };

    /// <summary>Same window as the overview's "hết hạn trong 2 ngày".</summary>
    public static readonly TimeSpan EndingSoonWindow = TimeSpan.FromDays(2);

    public static bool IsEnded(UserSubscription s, DateTimeOffset now) =>
        s.Status == UserSubscriptionStatuses.TrialExpired
        || (s.Status == UserSubscriptionStatuses.Trialing && s.TrialEndsAt.HasValue && s.TrialEndsAt.Value <= now);

    public static bool IsActive(UserSubscription s, DateTimeOffset now) =>
        s.Status == UserSubscriptionStatuses.Trialing && s.TrialEndsAt.HasValue && s.TrialEndsAt.Value > now;

    /// <summary>Accounts filtered by trial state (see <see cref="Filters"/>).</summary>
    public static IQueryable<User> Filter(IApplicationDbContext context, IQueryable<User> users, string trial, DateTimeOffset now)
    {
        var subscriptions = context.UserSubscriptions;
        var soon = now + EndingSoonWindow;
        return trial switch
        {
            Active => users.Where(u => subscriptions.Any(s =>
                s.UserId == u.Id && s.Status == UserSubscriptionStatuses.Trialing && s.TrialEndsAt > now)),
            EndingSoon => users.Where(u => subscriptions.Any(s =>
                s.UserId == u.Id && s.Status == UserSubscriptionStatuses.Trialing && s.TrialEndsAt > now && s.TrialEndsAt <= soon)),
            Ended => users.Where(u => subscriptions.Any(s =>
                s.UserId == u.Id
                && (s.Status == UserSubscriptionStatuses.TrialExpired || (s.Status == UserSubscriptionStatuses.Trialing && s.TrialEndsAt <= now)))),
            Any => users.Where(u => subscriptions.Any(s => s.UserId == u.Id && s.TrialStartedAt != null)),
            _ => users.Where(_ => false),
        };
    }

    /// <summary>Trial counts over every personal account (independent of the list filters).</summary>
    public static async Task<PlatformTrialSummary> SummarizeAsync(IApplicationDbContext context, DateTimeOffset now)
    {
        var trials = await context.UserSubscriptions.AsNoTracking()
            .Where(s => s.TrialStartedAt != null || s.Status == UserSubscriptionStatuses.Trialing || s.Status == UserSubscriptionStatuses.TrialExpired)
            .ToListAsync();
        return new PlatformTrialSummary
        {
            Active = trials.Count(s => IsActive(s, now)),
            EndingSoon = trials.Count(s => IsActive(s, now) && s.TrialEndsAt!.Value <= now + EndingSoonWindow),
            Ended = trials.Count(s => IsEnded(s, now)),
        };
    }
}

public class PlatformTrialSummary
{
    public int Active { get; set; }
    public int EndingSoon { get; set; }
    public int Ended { get; set; }
}
