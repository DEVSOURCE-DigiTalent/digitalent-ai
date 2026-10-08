using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Entities.Learner;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigiTalent.Application.IndividualCommerce;

public class IndividualCommerceService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IOtpHashingService _otpHashing;
    private readonly IIndividualEmailSender _emailSender;
    private readonly IIndividualPlanCatalog _planCatalog;
    private readonly IPayOSService _payOSService;
    private readonly IndividualCommerceOptions _options;
    private readonly ILogger<IndividualCommerceService> _logger;

    public IndividualCommerceService(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IOtpHashingService otpHashing,
        IIndividualEmailSender emailSender,
        IIndividualPlanCatalog planCatalog,
        IPayOSService payOSService,
        IOptions<IndividualCommerceOptions> options,
        ILogger<IndividualCommerceService> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _otpHashing = otpHashing;
        _emailSender = emailSender;
        _planCatalog = planCatalog;
        _payOSService = payOSService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<StartIndividualRegistrationResponse> StartRegistrationAsync(
        StartIndividualRegistrationRequest request,
        string? idempotencyKey = null,
        CancellationToken cancellationToken = default)
    {
        // 1. Validation
        if (string.IsNullOrWhiteSpace(request.FullName))
            throw new BadRequestException("Họ và tên không được để trống.", "fullName", "REQUIRED");

        if (string.IsNullOrWhiteSpace(request.Email) || !Regex.IsMatch(request.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            throw new BadRequestException("Email không đúng định dạng.", "email", "INVALID_EMAIL");

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            throw new BadRequestException("Mật khẩu phải có tối thiểu 8 ký tự.", "password", "PASSWORD_TOO_SHORT");

        if (!request.AcceptTerms)
            throw new BadRequestException("Bạn cần đồng ý với điều khoản dịch vụ để tiếp tục.", "acceptTerms", "TERMS_REQUIRED");

        var normalizedIntent = request.Intent.Trim().ToUpperInvariant();
        if (normalizedIntent != IndividualRegistrationIntents.Trial && normalizedIntent != IndividualRegistrationIntents.Purchase)
            throw new BadRequestException("Mục đích đăng ký không hợp lệ.", "intent", "INVALID_INTENT");

        if (normalizedIntent == IndividualRegistrationIntents.Purchase)
        {
            if (request.PlanSelection == null)
                throw new BadRequestException("Vui lòng chọn gói đăng ký và chu kỳ thanh toán.", "planSelection", "PLAN_REQUIRED");

            if (!_planCatalog.TryGetPrice(request.PlanSelection.PlanCode, request.PlanSelection.Cycle, out _, out _))
                throw new BadRequestException("Gói đăng ký hoặc chu kỳ thanh toán không hợp lệ.", "planSelection", "INVALID_PLAN");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        // 2. Kiểm tra xem email đã có tài khoản chưa
        if (await _context.Users.AnyAsync(u => u.Email == normalizedEmail, cancellationToken))
            throw new ConflictException("Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.");

        // 3. Nếu intent = TRIAL, kiểm tra xem đã từng dùng trial chưa
        if (normalizedIntent == IndividualRegistrationIntents.Trial)
        {
            var emailHmac = _otpHashing.HashNormalizedEmail(normalizedEmail);
            if (await _context.IndividualTrialRedemptions.AnyAsync(r => r.NormalizedEmailHmac == emailHmac, cancellationToken))
                throw new ConflictException("Email này đã sử dụng thời gian dùng thử 7 ngày. Vui lòng chọn gói đăng ký để tiếp tục.");
        }

        // 4. Hủy các đăng ký PENDING cũ của email này nếu có
        var existingPendings = await _context.IndividualRegistrations
            .Where(r => r.Email == normalizedEmail && r.State == IndividualRegistrationStates.Pending)
            .ToListAsync(cancellationToken);
        foreach (var p in existingPendings)
        {
            p.State = IndividualRegistrationStates.Cancelled;
        }

        // 5. Sinh token bí mật và mã OTP
        var registrationAccessToken = _otpHashing.GenerateSecureToken(32);
        var accessTokenHash = _otpHashing.HashToken(registrationAccessToken);

        var otp = _otpHashing.GenerateOtp(6);
        var otpHash = _otpHashing.HashOtp(otp);

        var magicLinkToken = _otpHashing.GenerateSecureToken(32);
        var magicLinkHash = _otpHashing.HashToken(magicLinkToken);

        var now = DateTimeOffset.UtcNow;
        var expiresAt = now.AddHours(_options.Security.RegistrationExpiresInHours);
        var challengeExpiresAt = now.AddMinutes(_options.Security.OtpExpiresInMinutes);
        var resendAvailableAt = now.AddSeconds(_options.Security.ResendCooldownSeconds);

        var registration = new IndividualRegistration
        {
            Email = normalizedEmail,
            FullName = request.FullName.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            AccessTokenHash = accessTokenHash,
            Intent = normalizedIntent,
            SelectedPlanCode = request.PlanSelection?.PlanCode,
            SelectedCycle = request.PlanSelection?.Cycle,
            PricingVersion = request.PlanSelection != null ? _planCatalog.GetCatalog().PricingVersion : null,
            PositionCode = request.PositionCode,
            TryOrientationJson = request.TryOrientation?.ToJsonString(),
            Source = request.Source ?? "landing",
            AcceptedTermsAt = now,
            State = IndividualRegistrationStates.Pending,
            ExpiresAt = expiresAt
        };

        _context.IndividualRegistrations.Add(registration);

        var challenge = new IndividualEmailVerificationChallenge
        {
            RegistrationId = registration.Id,
            CodeHash = otpHash,
            MagicTokenHash = magicLinkHash,
            AttemptCount = 0,
            SentAt = now,
            ExpiresAt = challengeExpiresAt
        };

        _context.IndividualEmailVerificationChallenges.Add(challenge);
        await _context.SaveChangesAsync(cancellationToken);

        // 6. Gửi email xác thực
        var verifyLink = $"{_options.Security.PublicAppUrl.TrimEnd('/')}/individual/register/verify?registrationId={registration.Id}&token={magicLinkToken}";
        await _emailSender.SendVerificationEmailAsync(normalizedEmail, registration.FullName, otp, verifyLink, cancellationToken);

        var maskedEmail = MaskEmail(normalizedEmail);
        var isDev = _options.Security.IsDevelopment;

        return new StartIndividualRegistrationResponse(
            RegistrationId: registration.Id,
            MaskedEmail: maskedEmail,
            State: "verification_pending",
            VerificationExpiresAt: challengeExpiresAt,
            ResendAvailableAt: resendAvailableAt,
            RegistrationAccessToken: registrationAccessToken,
            DeliveryStatus: "queued",
            DevelopmentVerifyLink: isDev ? verifyLink : null,
            DevelopmentOtp: isDev ? otp : null
        );
    }

    public async Task<VerifyIndividualRegistrationResponse> VerifyRegistrationAsync(
        Guid registrationId,
        VerifyIndividualRegistrationRequest request,
        CancellationToken cancellationToken = default)
    {
        var registration = await _context.IndividualRegistrations
            .FirstOrDefaultAsync(r => r.Id == registrationId, cancellationToken);

        if (registration == null)
            throw new NotFoundException("Không tìm thấy thông tin đăng ký.");

        if (registration.State == IndividualRegistrationStates.Verified)
            throw new ConflictException("Đăng ký này đã được xác thực thành công trước đó.");

        if (registration.ExpiresAt <= DateTimeOffset.UtcNow)
            throw new BadRequestException("Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại.");

        // 1. Kiểm tra xác thực token/OTP
        IndividualEmailVerificationChallenge? activeChallenge;

        if (!string.IsNullOrWhiteSpace(request.MagicLinkToken))
        {
            var magicHash = _otpHashing.HashToken(request.MagicLinkToken);
            activeChallenge = await _context.IndividualEmailVerificationChallenges
                .Where(c => c.RegistrationId == registrationId && c.MagicTokenHash == magicHash && c.ConsumedAt == null && c.InvalidatedAt == null)
                .FirstOrDefaultAsync(cancellationToken);

            if (activeChallenge == null || activeChallenge.ExpiresAt <= DateTimeOffset.UtcNow)
                throw new BadRequestException("Liên kết xác thực không hợp lệ hoặc đã hết hạn.", "magicLinkToken", "INVALID_TOKEN");
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.RegistrationAccessToken))
                throw new BadRequestException("Thiếu token phiên xác thực.", "registrationAccessToken", "TOKEN_REQUIRED");

            if (!_otpHashing.VerifyHash(request.RegistrationAccessToken, registration.AccessTokenHash))
                throw new BadRequestException("Token phiên xác thực không hợp lệ.", "registrationAccessToken", "INVALID_SESSION");

            if (string.IsNullOrWhiteSpace(request.Otp))
                throw new BadRequestException("Vui lòng nhập mã OTP.", "otp", "OTP_REQUIRED");

            activeChallenge = await _context.IndividualEmailVerificationChallenges
                .Where(c => c.RegistrationId == registrationId && c.ConsumedAt == null && c.InvalidatedAt == null)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (activeChallenge == null || activeChallenge.ExpiresAt <= DateTimeOffset.UtcNow)
                throw new BadRequestException("Mã OTP đã hết hạn. Vui lòng nhấn gửi lại mã mới.", "otp", "OTP_EXPIRED");

            if (activeChallenge.AttemptCount >= _options.Security.MaxVerificationAttempts)
                throw new BadRequestException("Đã vượt quá số lần nhập sai mã OTP. Vui lòng nhấn gửi lại mã mới.", "otp", "MAX_ATTEMPTS_EXCEEDED");

            if (!_otpHashing.VerifyOtp(request.Otp, activeChallenge.CodeHash))
            {
                activeChallenge.AttemptCount++;
                await _context.SaveChangesAsync(cancellationToken);
                throw new BadRequestException("Mã OTP không chính xác.", "otp", "INVALID_OTP");
            }
        }

        activeChallenge.ConsumedAt = DateTimeOffset.UtcNow;

        // 2. Chống race condition: kiểm tra email đã có user chưa
        if (await _context.Users.AnyAsync(u => u.Email == registration.Email, cancellationToken))
            throw new ConflictException("Email này đã có tài khoản.");

        var now = DateTimeOffset.UtcNow;

        // 3. Tạo User chính thức
        var user = new User
        {
            Email = registration.Email,
            DisplayName = registration.FullName,
            PasswordHash = registration.PasswordHash,
            OrganizationId = null,
            EmailVerifiedAt = now,
            TrialUsedAt = registration.Intent == IndividualRegistrationIntents.Trial ? now : null
        };
        _context.Users.Add(user);

        // 4. Tạo LearnerProfile
        var learnerProfile = new LearnerProfile
        {
            UserId = user.Id,
            Headline = !string.IsNullOrWhiteSpace(registration.PositionCode) ? registration.PositionCode : null,
            TargetPositionCode = registration.PositionCode,
            TargetSetAt = !string.IsNullOrWhiteSpace(registration.PositionCode) ? now : null,
            TargetChangeCount = 0
        };
        _context.LearnerProfiles.Add(learnerProfile);

        IndividualSubscriptionDto? subscriptionDto = null;
        PurchaseDraftDto? purchaseDraftDto = null;
        string nextPath;

        // 5. Xử lý theo Intent
        if (registration.Intent == IndividualRegistrationIntents.Trial)
        {
            // Ghi nhận trial redemption
            var redemption = new IndividualTrialRedemption
            {
                NormalizedEmailHmac = _otpHashing.HashNormalizedEmail(registration.Email),
                UserId = user.Id,
                RegistrationId = registration.Id,
                RedeemedAt = now
            };
            _context.IndividualTrialRedemptions.Add(redemption);

            // Kích hoạt trial subscription 7 ngày
            var trialEnd = now.AddDays(_options.Security.TrialDurationDays);
            var subscription = new UserSubscription
            {
                UserId = user.Id,
                PlanCode = "IND_PLUS",
                Status = UserSubscriptionStatuses.Trialing,
                BillingCycle = "TRIAL",
                TrialStartedAt = now,
                TrialEndsAt = trialEnd,
                CurrentPeriodStart = now,
                CurrentPeriodEnd = trialEnd
            };
            _context.UserSubscriptions.Add(subscription);

            subscriptionDto = new IndividualSubscriptionDto(
                PlanCode: "IND_PLUS",
                PlanName: "Cá nhân Plus (Dùng thử)",
                Status: "trialing",
                TrialStartedAt: now,
                TrialEndsAt: trialEnd,
                TrialCourseLimit: _options.Security.TrialCourseLimit,
                CurrentPeriodStart: now,
                CurrentPeriodEnd: trialEnd
            );

            nextPath = "/personal/onboarding";
        }
        else
        {
            // Intent = PURCHASE: Tạo PurchaseDraft trạng thái DRAFT
            _planCatalog.TryGetPrice(registration.SelectedPlanCode!, registration.SelectedCycle!, out var amount, out var pricingVer);

            var draft = new PurchaseDraft
            {
                UserId = user.Id,
                PlanCode = registration.SelectedPlanCode!,
                Cycle = registration.SelectedCycle!,
                Amount = amount,
                Currency = "VND",
                PricingVersion = pricingVer,
                Status = PurchaseDraftStatuses.Draft,
                ExpiresAt = now.AddHours(_options.Security.DraftExpiresInHours)
            };
            _context.PurchaseDrafts.Add(draft);

            purchaseDraftDto = new PurchaseDraftDto(
                Id: draft.Id,
                PlanCode: draft.PlanCode,
                Cycle: draft.Cycle,
                Amount: draft.Amount,
                Currency: draft.Currency,
                PricingVersion: draft.PricingVersion,
                Status: draft.Status,
                CreatedAt: now,
                ExpiresAt: draft.ExpiresAt
            );

            subscriptionDto = new IndividualSubscriptionDto(
                PlanCode: "IND_FREE",
                PlanName: "Miễn phí",
                Status: "active"
            );

            nextPath = $"/checkout?draft={draft.Id}";
        }

        // 6. Cập nhật registration thành Verified
        registration.State = IndividualRegistrationStates.Verified;
        registration.UserId = user.Id;
        registration.UsedAt = now;

        await _context.SaveChangesAsync(cancellationToken);

        // 7. Tạo JWT Access & Refresh Token
        var tokenResult = _jwtTokenService.CreateToken(user, new[] { "LEARNER" }, null, null);

        var sessionDto = new IndividualUserSessionDto(
            Id: user.Id,
            Email: user.Email,
            FullName: user.DisplayName,
            Roles: new[] { "LEARNER" },
            Permissions: new[] { "account.view_own", "learner.access" },
            Workspace: "personal",
            EmailVerified: true,
            OnboardingStatus: registration.Intent == IndividualRegistrationIntents.Trial ? "setup" : "payment",
            Subscription: subscriptionDto
        );

        return new VerifyIndividualRegistrationResponse(
            AccessToken: tokenResult.AccessToken,
            RefreshToken: tokenResult.RefreshToken,
            ExpiresAt: tokenResult.ExpiresAt,
            User: sessionDto,
            NextPath: nextPath,
            PurchaseDraft: purchaseDraftDto
        );
    }

    public async Task<ResendIndividualVerificationResponse> ResendVerificationAsync(
        Guid registrationId,
        ResendIndividualVerificationRequest request,
        CancellationToken cancellationToken = default)
    {
        var registration = await _context.IndividualRegistrations
            .FirstOrDefaultAsync(r => r.Id == registrationId, cancellationToken);

        if (registration == null || !_otpHashing.VerifyHash(request.RegistrationAccessToken, registration.AccessTokenHash))
            throw new NotFoundException("Không tìm thấy thông tin đăng ký.");

        if (registration.State == IndividualRegistrationStates.Verified)
            throw new ConflictException("Đăng ký này đã được xác thực thành công trước đó.");

        if (registration.ExpiresAt <= DateTimeOffset.UtcNow)
            throw new BadRequestException("Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại.");

        var latestChallenge = await _context.IndividualEmailVerificationChallenges
            .Where(c => c.RegistrationId == registrationId)
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var resendAvailableAt = latestChallenge != null
            ? latestChallenge.SentAt.AddSeconds(_options.Security.ResendCooldownSeconds)
            : now;

        if (now < resendAvailableAt)
        {
            var waitSec = Math.Ceiling((resendAvailableAt - now).TotalSeconds);
            throw new BadRequestException($"Vui lòng chờ {waitSec} giây trước khi yêu cầu mã mới.");
        }

        // Vô hiệu hóa challenge cũ
        if (latestChallenge != null)
        {
            latestChallenge.InvalidatedAt = now;
        }

        // Sinh OTP & Magic Link mới
        var otp = _otpHashing.GenerateOtp(6);
        var otpHash = _otpHashing.HashOtp(otp);

        var magicLinkToken = _otpHashing.GenerateSecureToken(32);
        var magicLinkHash = _otpHashing.HashToken(magicLinkToken);

        var challengeExpiresAt = now.AddMinutes(_options.Security.OtpExpiresInMinutes);
        var nextResendAvailableAt = now.AddSeconds(_options.Security.ResendCooldownSeconds);

        var newChallenge = new IndividualEmailVerificationChallenge
        {
            RegistrationId = registrationId,
            CodeHash = otpHash,
            MagicTokenHash = magicLinkHash,
            AttemptCount = 0,
            SentAt = now,
            ExpiresAt = challengeExpiresAt
        };

        _context.IndividualEmailVerificationChallenges.Add(newChallenge);
        await _context.SaveChangesAsync(cancellationToken);

        var verifyLink = $"{_options.Security.PublicAppUrl.TrimEnd('/')}/individual/register/verify?registrationId={registration.Id}&token={magicLinkToken}";
        await _emailSender.SendVerificationEmailAsync(registration.Email, registration.FullName, otp, verifyLink, cancellationToken);

        return new ResendIndividualVerificationResponse(
            RegistrationId: registration.Id,
            MaskedEmail: MaskEmail(registration.Email),
            VerificationExpiresAt: challengeExpiresAt,
            ResendAvailableAt: nextResendAvailableAt,
            DevelopmentVerifyLink: _options.Security.IsDevelopment ? verifyLink : null
        );
    }

    public async Task<IndividualRegistrationStatusResponse> GetRegistrationStatusAsync(
        Guid registrationId,
        string registrationAccessToken,
        CancellationToken cancellationToken = default)
    {
        var registration = await _context.IndividualRegistrations
            .FirstOrDefaultAsync(r => r.Id == registrationId, cancellationToken);

        if (registration == null || !_otpHashing.VerifyHash(registrationAccessToken, registration.AccessTokenHash))
            throw new NotFoundException("Không tìm thấy thông tin đăng ký.");

        var latestChallenge = await _context.IndividualEmailVerificationChallenges
            .Where(c => c.RegistrationId == registrationId)
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var resendAvailableAt = latestChallenge != null
            ? latestChallenge.SentAt.AddSeconds(_options.Security.ResendCooldownSeconds)
            : DateTimeOffset.UtcNow;

        return new IndividualRegistrationStatusResponse(
            RegistrationId: registration.Id,
            MaskedEmail: MaskEmail(registration.Email),
            State: registration.State.ToLowerInvariant(),
            ExpiresAt: latestChallenge?.ExpiresAt ?? registration.ExpiresAt,
            ResendAvailableAt: resendAvailableAt
        );
    }

    public async Task<PurchaseDraftDto> CreatePurchaseDraftAsync(
        Guid userId,
        CreatePurchaseDraftRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!_planCatalog.TryGetPrice(request.PlanCode, request.Cycle, out var amount, out var pricingVer))
            throw new BadRequestException("Gói đăng ký hoặc chu kỳ thanh toán không hợp lệ.");

        // Hủy các draft đang ở trạng thái DRAFT của user này
        var pendingDrafts = await _context.PurchaseDrafts
            .Where(d => d.UserId == userId && d.Status == PurchaseDraftStatuses.Draft)
            .ToListAsync(cancellationToken);

        foreach (var d in pendingDrafts)
        {
            d.Status = PurchaseDraftStatuses.Cancelled;
        }

        var now = DateTimeOffset.UtcNow;
        var newDraft = new PurchaseDraft
        {
            UserId = userId,
            PlanCode = request.PlanCode,
            Cycle = request.Cycle,
            Amount = amount,
            Currency = "VND",
            PricingVersion = pricingVer,
            Status = PurchaseDraftStatuses.Draft,
            ExpiresAt = now.AddHours(_options.Security.DraftExpiresInHours)
        };

        _context.PurchaseDrafts.Add(newDraft);
        await _context.SaveChangesAsync(cancellationToken);

        return new PurchaseDraftDto(
            Id: newDraft.Id,
            PlanCode: newDraft.PlanCode,
            Cycle: newDraft.Cycle,
            Amount: newDraft.Amount,
            Currency: newDraft.Currency,
            PricingVersion: newDraft.PricingVersion,
            Status: newDraft.Status,
            CreatedAt: newDraft.CreatedAt,
            ExpiresAt: newDraft.ExpiresAt
        );
    }

    public async Task<PurchaseDraftDto> GetPurchaseDraftAsync(
        Guid userId,
        Guid draftId,
        CancellationToken cancellationToken = default)
    {
        var draft = await _context.PurchaseDrafts
            .FirstOrDefaultAsync(d => d.Id == draftId && d.UserId == userId, cancellationToken);

        if (draft == null)
            throw new NotFoundException("Không tìm thấy thông tin đơn hàng nháp.");

        return new PurchaseDraftDto(
            Id: draft.Id,
            PlanCode: draft.PlanCode,
            Cycle: draft.Cycle,
            Amount: draft.Amount,
            Currency: draft.Currency,
            PricingVersion: draft.PricingVersion,
            Status: draft.Status,
            CreatedAt: draft.CreatedAt,
            ExpiresAt: draft.ExpiresAt
        );
    }

    public async Task<IndividualOrderDto> CreateOrderAsync(
        Guid userId,
        CreateIndividualOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        var draft = await _context.PurchaseDrafts
            .FirstOrDefaultAsync(d => d.Id == request.PurchaseDraftId && d.UserId == userId, cancellationToken);

        if (draft == null)
            throw new NotFoundException("Không tìm thấy đơn hàng nháp.");

        if (draft.Status != PurchaseDraftStatuses.Draft && draft.Status != PurchaseDraftStatuses.PaymentPending)
            throw new BadRequestException("Đơn hàng nháp không ở trạng thái hợp lệ để thanh toán.");

        if (draft.ExpiresAt <= DateTimeOffset.UtcNow)
            throw new BadRequestException("Đơn hàng nháp đã hết hạn.");

        // Tạo orderCode ngẫu nhiên duy nhất (64-bit integer, độ dài 8-10 chữ số)
        var orderCode = (DateTimeOffset.UtcNow.ToUnixTimeSeconds() % 100000000) * 1000 + RandomNumberGenerator.GetInt32(100, 999);
        var publicCode = $"DT{orderCode}";

        // Gọi PayOS API để tạo link thanh toán VietQR
        var payResult = await _payOSService.CreatePaymentLinkAsync(
            orderCode: orderCode,
            amount: draft.Amount,
            description: $"DT {orderCode}",
            returnUrl: _options.PayOS.ReturnUrl,
            cancelUrl: _options.PayOS.CancelUrl,
            cancellationToken: cancellationToken
        );

        var now = DateTimeOffset.UtcNow;
        var expiresAt = now.AddMinutes(_options.Security.OrderExpiresInMinutes);

        var order = new Order
        {
            OrderCode = orderCode,
            PublicCode = publicCode,
            UserId = userId,
            PurchaseDraftId = draft.Id,
            Amount = draft.Amount,
            Currency = draft.Currency,
            Status = OrderStatuses.Pending,
            PaymentMethod = request.PaymentMethod,
            PayosPaymentLinkId = payResult.PaymentLinkId,
            PayosCheckoutUrl = payResult.CheckoutUrl,
            PayosQrCode = payResult.QrCode,
            ExpiresAt = expiresAt
        };

        _context.Orders.Add(order);
        draft.Status = PurchaseDraftStatuses.PaymentPending;

        await _context.SaveChangesAsync(cancellationToken);

        return new IndividualOrderDto(
            Id: order.Id,
            Code: order.PublicCode,
            OrderCode: order.OrderCode,
            Purpose: "NEW_PURCHASE",
            PlanCode: draft.PlanCode,
            Cycle: draft.Cycle,
            Amount: order.Amount,
            Currency: order.Currency,
            Status: order.Status,
            Payment: new IndividualOrderPaymentDto(
                Method: order.PaymentMethod,
                QrPayload: order.PayosQrCode,
                CheckoutUrl: order.PayosCheckoutUrl,
                TransferContent: publicCode
            ),
            CreatedAt: order.CreatedAt,
            ExpiresAt: order.ExpiresAt
        );
    }

    public async Task<IndividualOrderDto> GetOrderAsync(
        Guid userId,
        Guid orderId,
        CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .Include(o => o.PurchaseDraft)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId, cancellationToken);

        if (order == null)
            throw new NotFoundException("Không tìm thấy thông tin đơn thanh toán.");

        return new IndividualOrderDto(
            Id: order.Id,
            Code: order.PublicCode,
            OrderCode: order.OrderCode,
            Purpose: "NEW_PURCHASE",
            PlanCode: order.PurchaseDraft?.PlanCode ?? string.Empty,
            Cycle: order.PurchaseDraft?.Cycle ?? string.Empty,
            Amount: order.Amount,
            Currency: order.Currency,
            Status: order.Status,
            Payment: new IndividualOrderPaymentDto(
                Method: order.PaymentMethod,
                QrPayload: order.PayosQrCode,
                CheckoutUrl: order.PayosCheckoutUrl,
                TransferContent: order.PublicCode
            ),
            CreatedAt: order.CreatedAt,
            ExpiresAt: order.ExpiresAt
        );
    }

    public async Task<PurchaseDraftDto?> GetActivePurchaseDraftAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var draft = await _context.PurchaseDrafts
            .Where(d => d.UserId == userId && (d.Status == PurchaseDraftStatuses.Draft || d.Status == PurchaseDraftStatuses.PaymentPending) && d.ExpiresAt > now)
            .OrderByDescending(d => d.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (draft == null) return null;

        return new PurchaseDraftDto(
            Id: draft.Id,
            PlanCode: draft.PlanCode,
            Cycle: draft.Cycle,
            Amount: draft.Amount,
            Currency: draft.Currency,
            PricingVersion: draft.PricingVersion,
            Status: draft.Status,
            CreatedAt: draft.CreatedAt,
            ExpiresAt: draft.ExpiresAt
        );
    }

    public async Task<IndividualOrderDto?> GetActiveOrderAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var order = await _context.Orders
            .Include(o => o.PurchaseDraft)
            .Where(o => o.UserId == userId && o.Status == OrderStatuses.Pending && o.ExpiresAt > now)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (order == null) return null;

        return new IndividualOrderDto(
            Id: order.Id,
            Code: order.PublicCode,
            OrderCode: order.OrderCode,
            Purpose: "NEW_PURCHASE",
            PlanCode: order.PurchaseDraft?.PlanCode ?? string.Empty,
            Cycle: order.PurchaseDraft?.Cycle ?? string.Empty,
            Amount: order.Amount,
            Currency: order.Currency,
            Status: order.Status,
            Payment: new IndividualOrderPaymentDto(
                Method: order.PaymentMethod,
                QrPayload: order.PayosQrCode,
                CheckoutUrl: order.PayosCheckoutUrl,
                TransferContent: order.PublicCode
            ),
            CreatedAt: order.CreatedAt,
            ExpiresAt: order.ExpiresAt
        );
    }

    public async Task<bool> HandlePayOSWebhookAsync(
        PayOSWebhookRequest request,
        string rawJson,
        CancellationToken cancellationToken = default)
    {
        // 1. Kiểm tra chữ ký HMAC-SHA256
        var dataJson = JsonSerializer.Serialize(request.Data);
        var isValid = _payOSService.VerifyWebhookSignature(dataJson, request.Signature);
        if (!isValid)
        {
            _logger.LogWarning("PayOS webhook signature verification failed for OrderCode {OrderCode}", request.Data.OrderCode);
            return false;
        }

        // 2. Kiểm tra tính Idempotent qua payment_events
        var existingEvent = await _context.PaymentEvents
            .FirstOrDefaultAsync(e => e.OrderCode == request.Data.OrderCode && e.ProcessingStatus == "PROCESSED", cancellationToken);
        if (existingEvent != null)
        {
            _logger.LogInformation("PayOS webhook for OrderCode {OrderCode} was already processed", request.Data.OrderCode);
            return true;
        }

        // 3. Tìm order
        var order = await _context.Orders
            .Include(o => o.PurchaseDraft)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.OrderCode == request.Data.OrderCode, cancellationToken);

        if (order == null)
        {
            _logger.LogWarning("PayOS webhook: Order not found for OrderCode {OrderCode}", request.Data.OrderCode);
            return true;
        }

        if (order.Status == OrderStatuses.Paid)
        {
            return true;
        }

        // 4. Kiểm tra số tiền
        if (order.Amount != request.Data.Amount)
        {
            _logger.LogError("PayOS webhook amount mismatch for order {OrderCode}: expected {Expected}, received {Actual}",
                order.OrderCode, order.Amount, request.Data.Amount);
            return false;
        }

        var now = DateTimeOffset.UtcNow;
        order.Status = OrderStatuses.Paid;
        order.PaidAt = now;

        if (order.PurchaseDraft != null)
        {
            order.PurchaseDraft.Status = PurchaseDraftStatuses.Paid;
        }

        // 5. Kích hoạt / gia hạn gói UserSubscription
        var existingSub = await _context.UserSubscriptions
            .Where(s => s.UserId == order.UserId)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var cycleDays = order.PurchaseDraft?.Cycle == "YEAR" ? 365 : 30;

        if (existingSub != null && existingSub.Status == UserSubscriptionStatuses.Active && existingSub.CurrentPeriodEnd > now)
        {
            // Gia hạn nối tiếp
            existingSub.CurrentPeriodEnd = (existingSub.CurrentPeriodEnd ?? now).AddDays(cycleDays);
            existingSub.PlanCode = order.PurchaseDraft?.PlanCode ?? existingSub.PlanCode;
            existingSub.BillingCycle = order.PurchaseDraft?.Cycle ?? existingSub.BillingCycle;
        }
        else
        {
            // Tạo gói mới
            var newSub = new UserSubscription
            {
                UserId = order.UserId,
                PlanCode = order.PurchaseDraft?.PlanCode ?? "IND_PLUS",
                Status = UserSubscriptionStatuses.Active,
                BillingCycle = order.PurchaseDraft?.Cycle ?? "MONTH",
                CurrentPeriodStart = now,
                CurrentPeriodEnd = now.AddDays(cycleDays)
            };
            _context.UserSubscriptions.Add(newSub);
        }

        // 6. Ghi nhật ký thanh toán
        var paymentEvent = new PaymentEvent
        {
            Provider = "payos",
            ProviderEventId = request.Data.PaymentLinkId,
            OrderCode = order.OrderCode,
            Amount = order.Amount,
            Currency = order.Currency,
            RawPayload = rawJson,
            SignatureValid = true,
            ProcessingStatus = "PROCESSED",
            ProcessedAt = now
        };
        _context.PaymentEvents.Add(paymentEvent);

        await _context.SaveChangesAsync(cancellationToken);

        // 7. Gửi email biên nhận
        if (order.User != null)
        {
            var plan = _planCatalog.GetPlan(order.PurchaseDraft?.PlanCode ?? "IND_PLUS");
            _ = _emailSender.SendReceiptEmailAsync(
                order.User.Email,
                order.User.DisplayName,
                order.OrderCode.ToString(),
                order.Amount,
                plan?.Name ?? "Gói học tập",
                CancellationToken.None);
        }

        return true;
    }

    public async Task<IndividualSubscriptionDto?> GetUserSubscriptionAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var sub = await _context.UserSubscriptions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (sub == null) return null;

        var status = sub.Status;
        if (status == UserSubscriptionStatuses.Trialing && sub.TrialEndsAt.HasValue && sub.TrialEndsAt.Value <= DateTimeOffset.UtcNow)
        {
            status = UserSubscriptionStatuses.TrialExpired;
        }

        var plan = _planCatalog.GetPlan(sub.PlanCode);

        return new IndividualSubscriptionDto(
            PlanCode: sub.PlanCode,
            PlanName: plan?.Name ?? sub.PlanCode,
            Status: status.ToLowerInvariant(),
            TrialStartedAt: sub.TrialStartedAt,
            TrialEndsAt: sub.TrialEndsAt,
            TrialCourseLimit: status == UserSubscriptionStatuses.Trialing ? _options.Security.TrialCourseLimit : null,
            CurrentPeriodStart: sub.CurrentPeriodStart,
            CurrentPeriodEnd: sub.CurrentPeriodEnd
        );
    }

    private static string MaskEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2) return email;
        var name = parts[0];
        var domain = parts[1];
        if (name.Length <= 2) return $"{name[0]}***@{domain}";
        return $"{name[..2]}***@{domain}";
    }
}
