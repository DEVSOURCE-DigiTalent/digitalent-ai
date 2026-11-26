using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Organization.Research;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Pulse;

public class EnterpriseResearchTests
{
    [Fact]
    public async Task OwnerControlsResearchAndOnlyAppliedContentReachesTheLearner()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var context = world.Context;
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var researcher = await world.UserAsync(PulseTestWorld.ManagerEmail);
        var organizationId = owner.OrganizationId!.Value;
        var rndRole = await context.Roles.SingleAsync(role => role.Code == Roles.Research);
        context.UserRoles.Add(new UserRole { UserId = researcher.Id, RoleId = rndRole.Id });
        await context.SaveChangesAsync();

        var catalog = new PulseCatalogReader(context);
        var ownerApi = new EnterpriseResearch(context, Caller(owner, organizationId), catalog);
        var rndApi = new EnterpriseResearch(context, Caller(researcher, organizationId), catalog);

        (await rndApi.GetEnabledAsync()).Should().BeFalse();
        await Assert.ThrowsAsync<ForbiddenException>(() => rndApi.ListAsync());
        await Assert.ThrowsAsync<ForbiddenException>(() => rndApi.SetEnabledAsync(true));
        await Assert.ThrowsAsync<ForbiddenException>(() => new EnterpriseResearch(
            context, Caller(researcher, Guid.NewGuid()), catalog).ListAsync());
        await ownerApi.SetEnabledAsync(true);

        var all = await catalog.LoadAsync(organizationId);
        var basic = (await rndApi.ListAsync()).Where(course => course.Tier == 1).ToList();
        basic.Select(course => course.Code).Should().BeEquivalentTo(Enumerable.Range(1, 6).Select(index => $"M{index}-F"));
        var paid = await context.PlatformCourses.FirstAsync(course => course.Code == "M1-I");
        context.CourseOrders.Add(new CourseOrder { OrganizationId = organizationId, CourseId = paid.Id, Amount = 100 });
        await context.SaveChangesAsync();
        var listed = await rndApi.ListAsync();
        listed.Should().Contain(course => course.Code == "M1-I");
        var excluded = all.First(course => course.Tier > 1 && !listed.Any(item => item.CourseId == course.CourseId));

        var source = basic.Single(course => course.Code == "M2-F");
        var content = new ResearchCourseContent("Khóa học nội bộ", "Lập báo cáo theo mẫu công ty.", "Dùng dữ liệu đào tạo để thực hành.");
        await Assert.ThrowsAsync<NotFoundException>(() => rndApi.SaveAsync(excluded.CourseId, content, apply: false));
        await Assert.ThrowsAsync<NotFoundException>(() => rndApi.PreviewAsync(excluded.CourseId, Mock.Of<IPlatformAssetUrlSigner>()));
        (await rndApi.PreviewAsync(source.CourseId, Mock.Of<IPlatformAssetUrlSigner>()))
            .Should().Contain(module => module.Lessons.Count > 0);

        var learner = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var input = new GetPulseCourseUseCaseInput { CourseId = source.CourseId };
        await rndApi.SaveAsync(source.CourseId, content, apply: false);
        (await learner.GetCourse.ExecuteAsync(input)).EnterpriseContent.Should().BeNull();
        await rndApi.SaveAsync(source.CourseId, content, apply: true);
        await rndApi.SaveAsync(source.CourseId, content with { Title = "Bản nháp mới" }, apply: false);
        (await learner.GetCourse.ExecuteAsync(input)).EnterpriseContent.Should().Be(content);

        await ownerApi.SetEnabledAsync(false);
        await Assert.ThrowsAsync<ForbiddenException>(() => rndApi.SaveAsync(source.CourseId, content, apply: true));
        (await learner.GetCourse.ExecuteAsync(input)).EnterpriseContent.Should().Be(content);
    }

    private static ICurrentUser Caller(User user, Guid organizationId)
    {
        var current = new Mock<ICurrentUser>();
        current.SetupGet(actor => actor.UserId).Returns(user.Id);
        current.Setup(actor => actor.GetRequiredOrganizationId()).Returns(organizationId);
        return current.Object;
    }
}
