using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.IndividualCommerce;
using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace DigiTalent.Tests.IndividualCommerce;

public sealed class IndividualCommerceServiceTests
{
    [Fact]
    public async Task StartRegistration_Trial_CreatesPendingRegistrationAndSendsEmail()
    {
        using var fixture = new TestFixture();
        var request = new StartIndividualRegistrationRequest(
            FullName: "Nguyễn Văn A",
            Email: "user.trial@example.com",
            Password: "Password123!",
            AcceptTerms: true,
            Intent: "TRIAL",
            Source: "pricing",
            PositionCode: "AI_ENGINEER",
            TryOrientation: null,
            PlanSelection: null
        );

        var response = await fixture.Service.StartRegistrationAsync(request);

        Assert.Equal("verification_pending", response.State);
        Assert.NotNull(response.RegistrationAccessToken);
        Assert.NotEmpty(response.RegistrationAccessToken);
        Assert.Contains("@example.com", response.MaskedEmail);

        var regInDb = await fixture.Db.IndividualRegistrations.SingleAsync();
        Assert.Equal("user.trial@example.com", regInDb.Email);
        Assert.Equal("PENDING", regInDb.State);
        Assert.Equal("TRIAL", regInDb.Intent);

        var challengeInDb = await fixture.Db.IndividualEmailVerificationChallenges.SingleAsync();
        Assert.Equal(regInDb.Id, challengeInDb.RegistrationId);
        Assert.NotEmpty(challengeInDb.CodeHash);
        Assert.Equal(0, challengeInDb.AttemptCount);

        Assert.Single(fixture.CapturingEmail.SentVerificationEmails);
        Assert.Equal("user.trial@example.com", fixture.CapturingEmail.SentVerificationEmails[0].Email);
    }

    [Fact]
    public async Task StartRegistration_DuplicateEmail_ThrowsConflictException()
    {
        using var fixture = new TestFixture();
        fixture.Db.Users.Add(new User
        {
            Email = "existing@example.com",
            DisplayName = "Existing User",
            PasswordHash = "hash"
        });
        await fixture.Db.SaveChangesAsync();

        var request = new StartIndividualRegistrationRequest(
            FullName: "Nguyễn Văn A",
            Email: "existing@example.com",
            Password: "Password123!",
            AcceptTerms: true,
            Intent: "TRIAL",
            Source: "pricing",
            PositionCode: null,
            TryOrientation: null,
            PlanSelection: null
        );

        await Assert.ThrowsAsync<ConflictException>(() => fixture.Service.StartRegistrationAsync(request));
    }

    [Fact]
    public async Task StartRegistration_TrialAlreadyRedeemed_ThrowsConflictException()
    {
        using var fixture = new TestFixture();
        var emailHmac = fixture.OtpHashing.HashNormalizedEmail("redeemed@example.com");
        fixture.Db.IndividualTrialRedemptions.Add(new IndividualTrialRedemption
        {
            NormalizedEmailHmac = emailHmac,
            UserId = Guid.NewGuid(),
            RedeemedAt = DateTimeOffset.UtcNow
        });
        await fixture.Db.SaveChangesAsync();

        var request = new StartIndividualRegistrationRequest(
            FullName: "Nguyễn Văn A",
            Email: "redeemed@example.com",
            Password: "Password123!",
            AcceptTerms: true,
            Intent: "TRIAL",
            Source: "pricing",
            PositionCode: null,
            TryOrientation: null,
            PlanSelection: null
        );

        await Assert.ThrowsAsync<ConflictException>(() => fixture.Service.StartRegistrationAsync(request));
    }

    [Fact]
    public async Task VerifyRegistration_Trial_ActivatesUserAndCreates7DaySubscription()
    {
        using var fixture = new TestFixture();
        var regResponse = await fixture.Service.StartRegistrationAsync(new StartIndividualRegistrationRequest(
            FullName: "Nguyễn Văn B",
            Email: "learner.trial@example.com",
            Password: "Password123!",
            AcceptTerms: true,
            Intent: "TRIAL",
            Source: "pricing",
            PositionCode: "BACKEND_DEV",
            TryOrientation: null,
            PlanSelection: null
        ));

        var sentOtp = fixture.CapturingEmail.SentVerificationEmails[0].Otp;

        var verifyResponse = await fixture.Service.VerifyRegistrationAsync(
            regResponse.RegistrationId,
            new VerifyIndividualRegistrationRequest(
                RegistrationAccessToken: regResponse.RegistrationAccessToken,
                Otp: sentOtp,
                MagicLinkToken: null
            )
        );

        Assert.NotNull(verifyResponse.AccessToken);
        Assert.Equal("/personal/onboarding", verifyResponse.NextPath);
        Assert.Equal("personal", verifyResponse.User.Workspace);
        Assert.True(verifyResponse.User.EmailVerified);
        Assert.Equal("trialing", verifyResponse.User.Subscription?.Status);
        Assert.Equal("IND_PLUS", verifyResponse.User.Subscription?.PlanCode);

        // Kiểm tra database
        var userInDb = await fixture.Db.Users.SingleAsync(u => u.Email == "learner.trial@example.com");
        Assert.NotNull(userInDb.EmailVerifiedAt);
        Assert.NotNull(userInDb.TrialUsedAt);
        Assert.Null(userInDb.OrganizationId);

        var learnerProfile = await fixture.Db.LearnerProfiles.SingleAsync(lp => lp.UserId == userInDb.Id);
        Assert.Equal("BACKEND_DEV", learnerProfile.Headline);
        Assert.Equal("BACKEND_DEV", learnerProfile.TargetPositionCode);

        var subInDb = await fixture.Db.UserSubscriptions.SingleAsync(s => s.UserId == userInDb.Id);
        Assert.Equal(UserSubscriptionStatuses.Trialing, subInDb.Status);
        Assert.Equal("IND_PLUS", subInDb.PlanCode);

        var redemption = await fixture.Db.IndividualTrialRedemptions.SingleAsync(r => r.UserId == userInDb.Id);
        Assert.NotNull(redemption);
    }

    [Fact]
    public async Task VerifyRegistration_WrongOtp_IncrementsAttemptCountAndFails()
    {
        using var fixture = new TestFixture();
        var regResponse = await fixture.Service.StartRegistrationAsync(new StartIndividualRegistrationRequest(
            FullName: "Nguyễn Văn C",
            Email: "wrong.otp@example.com",
            Password: "Password123!",
            AcceptTerms: true,
            Intent: "TRIAL",
            Source: "pricing",
            PositionCode: null,
            TryOrientation: null,
            PlanSelection: null
        ));

        await Assert.ThrowsAsync<BadRequestException>(() => fixture.Service.VerifyRegistrationAsync(
            regResponse.RegistrationId,
            new VerifyIndividualRegistrationRequest(
                RegistrationAccessToken: regResponse.RegistrationAccessToken,
                Otp: "000000",
                MagicLinkToken: null
            )
        ));

        var challenge = await fixture.Db.IndividualEmailVerificationChallenges.SingleAsync();
        Assert.Equal(1, challenge.AttemptCount);
    }

    [Fact]
    public async Task CreateOrder_And_PayOSWebhook_ActivatesSubscription()
    {
        using var fixture = new TestFixture();
        var user = new User
        {
            Email = "buyer@example.com",
            DisplayName = "Buyer",
            PasswordHash = "hash",
            EmailVerifiedAt = DateTimeOffset.UtcNow
        };
        fixture.Db.Users.Add(user);

        var draft = await fixture.Service.CreatePurchaseDraftAsync(
            user.Id,
            new CreatePurchaseDraftRequest("IND_PLUS", "MONTH")
        );

        Assert.Equal(149000, draft.Amount);
        Assert.Equal("DRAFT", draft.Status);

        var order = await fixture.Service.CreateOrderAsync(
            user.Id,
            new CreateIndividualOrderRequest(draft.Id)
        );

        Assert.Equal("PENDING", order.Status);
        Assert.True(order.OrderCode > 0);
        Assert.NotNull(order.Payment.QrPayload);

        // Giả lập PayOS Webhook
        var webhook = new PayOSWebhookRequest
        {
            Code = "00",
            Desc = "success",
            Data = new PayOSWebhookData
            {
                OrderCode = order.OrderCode,
                Amount = 149000,
                PaymentLinkId = "pl_test"
            },
            Signature = "valid_sig"
        };

        fixture.MockPayOS.Setup(p => p.VerifyWebhookSignature(It.IsAny<string>(), "valid_sig")).Returns(true);

        var webhookSuccess = await fixture.Service.HandlePayOSWebhookAsync(webhook, "{}");
        Assert.True(webhookSuccess);

        var updatedOrder = await fixture.Db.Orders.SingleAsync(o => o.Id == order.Id);
        Assert.Equal("PAID", updatedOrder.Status);
        Assert.NotNull(updatedOrder.PaidAt);

        var sub = await fixture.Db.UserSubscriptions.SingleAsync(s => s.UserId == user.Id);
        Assert.Equal(UserSubscriptionStatuses.Active, sub.Status);
        Assert.Equal("IND_PLUS", sub.PlanCode);

        // Kiểm tra tính Idempotent: gọi lại webhook không bị nhân bản
        var replay = await fixture.Service.HandlePayOSWebhookAsync(webhook, "{}");
        Assert.True(replay);
        Assert.Single(await fixture.Db.UserSubscriptions.Where(s => s.UserId == user.Id).ToListAsync());
    }

    private sealed class TestFixture : IDisposable
    {
        public readonly AppDbContext Db = new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        public readonly CapturingEmailSender CapturingEmail = new();
        public readonly OtpHashingService OtpHashing;
        public readonly IndividualPlanCatalog PlanCatalog = new();
        public readonly Mock<IPayOSService> MockPayOS = new();
        public readonly Mock<IPasswordHasher> MockPasswordHasher = new();
        public readonly Mock<IJwtTokenService> MockJwtTokenService = new();
        public readonly IndividualCommerceService Service;

        public TestFixture()
        {
            var options = Options.Create(new IndividualCommerceOptions
            {
                Security = new SecurityOptions
                {
                    EmailVerificationPepper = "test-pepper",
                    OtpPepper = "test-otp-pepper",
                    ResendCooldownSeconds = 60,
                    IsDevelopment = true
                }
            });

            OtpHashing = new OtpHashingService(options);
            MockPasswordHasher.Setup(p => p.Hash(It.IsAny<string>())).Returns("hashed-pw");
            MockJwtTokenService.Setup(j => j.CreateToken(It.IsAny<User>(), It.IsAny<IEnumerable<string>>(), null, null))
                .Returns(new JwtTokenResult
                {
                    AccessToken = "mock-jwt",
                    RefreshToken = "mock-refresh",
                    ExpiresAt = DateTimeOffset.UtcNow.AddHours(2)
                });

            MockPayOS.Setup(p => p.CreatePaymentLinkAsync(
                It.IsAny<long>(), It.IsAny<long>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), default))
                .ReturnsAsync((long code, long amount, string desc, string ret, string cancel, CancellationToken ct) =>
                    new PayOSCreatePaymentResult(
                        CheckoutUrl: $"https://pay.payos.vn/web/{code}",
                        QrCode: $"00020101021238540010A00000072701240006970422011000000000000208QRIBFTTA5303704540{amount}5802VN62160812DT{code}6304",
                        PaymentLinkId: $"pl_{code}"
                    ));

            Service = new IndividualCommerceService(
                Db,
                MockPasswordHasher.Object,
                MockJwtTokenService.Object,
                OtpHashing,
                CapturingEmail,
                PlanCatalog,
                MockPayOS.Object,
                options,
                NullLogger<IndividualCommerceService>.Instance
            );
        }

        public void Dispose() => Db.Dispose();
    }

    private sealed class CapturingEmailSender : IIndividualEmailSender
    {
        public readonly List<(string Email, string Name, string Otp, string Link)> SentVerificationEmails = new();
        public readonly List<(string Email, string Name, string OrderCode, long Amount, string Plan)> SentReceiptEmails = new();

        public Task SendVerificationEmailAsync(string email, string name, string otp, string link, CancellationToken ct = default)
        {
            SentVerificationEmails.Add((email, name, otp, link));
            return Task.CompletedTask;
        }

        public Task SendReceiptEmailAsync(string email, string name, string orderCode, long amount, string plan, CancellationToken ct = default)
        {
            SentReceiptEmails.Add((email, name, orderCode, amount, plan));
            return Task.CompletedTask;
        }

        public Task SendPasswordResetEmailAsync(string email, string name, string resetLink, CancellationToken ct = default)
        {
            return Task.CompletedTask;
        }
    }
}
