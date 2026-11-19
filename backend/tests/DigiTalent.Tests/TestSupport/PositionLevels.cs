using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Competency.Ceilings;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Infrastructure.Persistence;
using Moq;

namespace DigiTalent.Tests.TestSupport;

/// <summary>Sets the owner's required levels of a standard position the way OW-05 "Năng lực từng vị trí" does.</summary>
internal static class PositionLevels
{
    public static async Task SetAsync(AppDbContext context, Guid organizationId, string code, params (Guid CategoryId, int Level)[] levels)
    {
        var user = new Mock<ICurrentUser>();
        user.Setup(u => u.GetRequiredOrganizationId()).Returns(organizationId);
        user.SetupGet(u => u.OrganizationId).Returns(organizationId);
        user.SetupGet(u => u.UserId).Returns(Guid.NewGuid());
        await new UpdatePositionCeilingsUseCase(context, user.Object, Mock.Of<IAuditService>(),
                new CapabilityCeilingReader(context, new PulseCatalogReader(context)))
            .ExecuteAsync(new UpdatePositionCeilingsUseCaseInput
            {
                Code = code,
                Ceilings = levels.Select(l => new CeilingInputItem { CategoryId = l.CategoryId, Level = l.Level }).ToList(),
            });
    }
}
