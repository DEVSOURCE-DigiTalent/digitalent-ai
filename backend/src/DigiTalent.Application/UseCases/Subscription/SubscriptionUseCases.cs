using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Subscription;

// ── GET /subscription ──
public class GetSubscriptionUseCase : IUseCase<GetSubscriptionInput, SubscriptionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetSubscriptionUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<SubscriptionDto> ExecuteAsync(GetSubscriptionInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var sub = await _context.Subscriptions.AsNoTracking()
            .FirstOrDefaultAsync(s => s.OrganizationId == orgId)
            ?? throw new NotFoundException("No subscription found for this organization.");

        var entitlements = await _context.SubscriptionEntitlements.AsNoTracking()
            .Where(e => e.SubscriptionId == sub.Id)
            .Select(e => e.EntitlementKey)
            .ToListAsync();

        var invoices = await _context.Invoices.AsNoTracking()
            .Where(i => i.SubscriptionId == sub.Id)
            .OrderByDescending(i => i.IssuedAt)
            .Take(20)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                Code = i.Code,
                IssuedAt = i.IssuedAt,
                Description = i.Description,
                Amount = i.Amount,
                Status = i.Status,
            })
            .ToListAsync();

        return new SubscriptionDto
        {
            PlanCode = sub.PlanCode,
            PlanName = sub.PlanName,
            Status = sub.Status.ToLower(),
            Cycle = sub.Cycle,
            SeatLimit = sub.SeatLimit,
            SeatsUsed = sub.SeatsUsed,
            RenewsAt = sub.RenewsAt,
            CancelAtPeriodEnd = sub.CancelAtPeriodEnd,
            AmountPerPeriod = sub.AmountPerPeriod,
            Entitlements = entitlements,
            Invoices = invoices,
        };
    }
}

// ── GET /subscription/usage ──
public class GetUsageUseCase : IUseCase<GetUsageInput, UsageDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetUsageUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<UsageDto> ExecuteAsync(GetUsageInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var sub = await _context.Subscriptions.AsNoTracking()
            .FirstOrDefaultAsync(s => s.OrganizationId == orgId);

        var employees = _context.Employees.AsNoTracking()
            .Where(e => e.OrganizationId == orgId);

        var activeCount = await employees.CountAsync(e => e.Status == "ACTIVE");
        var pendingCount = await employees.CountAsync(e => e.Status == "PENDING");
        var inactiveCount = await employees.CountAsync(e => e.Status == "INACTIVE" || e.Status == "ARCHIVED");

        var entitlements = sub != null
            ? await _context.SubscriptionEntitlements.AsNoTracking()
                .Where(e => e.SubscriptionId == sub.Id)
                .Select(e => e.EntitlementKey)
                .ToListAsync()
            : new List<string>();

        var features = new List<FeatureUsage>
        {
            new() { Key = "practical_tasks", Label = "Nhiệm vụ thực hành", Enabled = entitlements.Contains("practical_tasks") },
            new() { Key = "internal_learning", Label = "Khóa học nội bộ", Enabled = entitlements.Contains("internal_learning") },
            new() { Key = "advanced_analytics", Label = "Phân tích nâng cao", Enabled = entitlements.Contains("advanced_analytics") },
            new() { Key = "bulk_import", Label = "Nhập hàng loạt", Enabled = entitlements.Contains("bulk_import") },
        };

        return new UsageDto
        {
            PlanName = sub?.PlanName ?? "Free",
            Seats = new SeatUsage { Used = activeCount, Limit = sub?.SeatLimit },
            Storage = new StorageUsage { UsedMb = 0, LimitMb = 5120 },
            Members = new MemberUsage { Active = activeCount, Pending = pendingCount, Inactive = inactiveCount },
            Features = features,
        };
    }
}

// ── POST /subscription/cancel ──
public class CancelSubscriptionUseCase : IUseCase<CancelSubscriptionInput, CancelSubscriptionOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CancelSubscriptionUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CancelSubscriptionOutput> ExecuteAsync(CancelSubscriptionInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var sub = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.OrganizationId == orgId)
            ?? throw new NotFoundException("No subscription found.");

        if (sub.Status == "CANCELLED")
            throw new BadRequestException("Subscription is already cancelled.");

        sub.CancelAtPeriodEnd = true;
        await _context.SaveChangesAsync();

        return new CancelSubscriptionOutput { CancelAtPeriodEnd = true };
    }
}

// ── POST /subscription/resume ──
public class ResumeSubscriptionUseCase : IUseCase<ResumeSubscriptionInput, ResumeSubscriptionOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ResumeSubscriptionUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ResumeSubscriptionOutput> ExecuteAsync(ResumeSubscriptionInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var sub = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.OrganizationId == orgId)
            ?? throw new NotFoundException("No subscription found.");

        if (!sub.CancelAtPeriodEnd)
            throw new BadRequestException("Subscription is not pending cancellation.");

        sub.CancelAtPeriodEnd = false;
        await _context.SaveChangesAsync();

        return new ResumeSubscriptionOutput { CancelAtPeriodEnd = false };
    }
}
