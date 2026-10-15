using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Auth;

/// <summary>
/// Lấy thông tin user đang đăng nhập + role + danh sách quyền (đọc từ database).
/// </summary>
public class GetCurrentUserUseCase : IUseCase<GetCurrentUserUseCaseInput, GetCurrentUserUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPermissionService _permissionService;

    public GetCurrentUserUseCase(IApplicationDbContext context, ICurrentUser currentUser, IPermissionService permissionService)
    {
        _context = context;
        _currentUser = currentUser;
        _permissionService = permissionService;
    }

    public async Task<GetCurrentUserUseCaseOutput> ExecuteAsync(GetCurrentUserUseCaseInput input)
    {
        // 1. Lấy user theo Id trong token, kèm role đang ACTIVE và hồ sơ nhân sự (nếu có)
        var user = await _context.Users
            .Where(u => u.Id == _currentUser.UserId)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.DisplayName,
                u.OrganizationId,
                u.EmailVerifiedAt,
                Roles = u.UserRoles
                    .Where(ur => ur.Role!.Status == Statuses.Simple.Active)
                    .Select(ur => ur.Role!.Code)
                    .ToList(),
                EmployeeId = _context.Employees
                    .Where(e => e.UserId == u.Id)
                    .Select(e => (Guid?)e.Id)
                    .FirstOrDefault(),
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        var roles = user.Roles;
        var isPlatform = roles.Contains(Roles.PlatformAdmin);
        var isPersonal = user.OrganizationId == null && !isPlatform;
        if (isPersonal)
        {
            roles = new List<string> { "LEARNER" };
        }

        // 2. Đổi role → danh sách quyền (bảng role_permissions)
        var permissions = await _permissionService.GetPermissionsAsync(roles);
        var trial = user.OrganizationId == null ? null : await _context.TrialWorkspaces
            .AsNoTracking().SingleOrDefaultAsync(x => x.OrganizationId == user.OrganizationId);

        DigiTalent.Application.IndividualCommerce.IndividualSubscriptionDto? subDto = null;
        string? onboardingStatus = null;

        if (isPersonal)
        {
            var sub = await _context.UserSubscriptions
                .Where(s => s.UserId == user.Id)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            if (sub != null)
            {
                var trialEnded = sub.Status == DigiTalent.Domain.Entities.UserSubscriptionStatuses.TrialExpired
                    || (sub.Status == DigiTalent.Domain.Entities.UserSubscriptionStatuses.Trialing
                        && sub.TrialEndsAt.HasValue && sub.TrialEndsAt.Value <= DateTimeOffset.UtcNow);
                // Hết 7 ngày dùng thử → về gói Miễn phí và vẫn vào không gian cá nhân (như settleTrial của frontend).
                // Trạng thái trả về chữ thường như frontend dùng (SubscriptionStatus: trialing | active | expired).
                subDto = trialEnded
                    ? new DigiTalent.Application.IndividualCommerce.IndividualSubscriptionDto(
                        PlanCode: "IND_FREE",
                        PlanName: "Miễn phí",
                        Status: "active",
                        TrialStartedAt: sub.TrialStartedAt,
                        TrialEndsAt: sub.TrialEndsAt)
                    : new DigiTalent.Application.IndividualCommerce.IndividualSubscriptionDto(
                        PlanCode: sub.PlanCode,
                        PlanName: sub.PlanCode == "IND_PRO" ? "Cá nhân Pro" : sub.PlanCode == "IND_PLUS" ? "Cá nhân Plus" : sub.PlanCode,
                        Status: sub.Status.ToLowerInvariant(),
                        TrialStartedAt: sub.TrialStartedAt,
                        TrialEndsAt: sub.TrialEndsAt,
                        TrialCourseLimit: sub.Status == DigiTalent.Domain.Entities.UserSubscriptionStatuses.Trialing ? sub.TrialCourseLimit : null,
                        CurrentPeriodStart: sub.CurrentPeriodStart,
                        CurrentPeriodEnd: sub.CurrentPeriodEnd
                    );
            }

            // Chưa có gói (đăng ký để mua, chưa thanh toán) → bước thanh toán; có gói nhưng chưa chọn vị trí → khởi tạo học tập;
            // xong hết → null (frontend coi mọi giá trị khác null là còn bước onboarding).
            var hasLearner = await _context.LearnerProfiles.AnyAsync(lp => lp.UserId == user.Id);
            onboardingStatus = subDto?.Status is "trialing" or "active" ? (hasLearner ? null : "setup") : "payment";
        }

        return new GetCurrentUserUseCaseOutput
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.DisplayName,
            EmployeeId = user.EmployeeId,
            OrganizationId = user.OrganizationId,
            Workspace = isPlatform ? "platform" : isPersonal ? "personal" : "enterprise",
            EmailVerified = user.EmailVerifiedAt != null,
            OnboardingStatus = onboardingStatus,
            Subscription = subDto,
            EnterpriseTrialStatus = trial == null ? null : trial.ConvertedAt != null ? "converted" : DateTimeOffset.UtcNow < trial.EndsAt ? "trial_active" : "trial_read_only",
            Roles = roles,
            Permissions = permissions.ToList(),
        };
    }
}
