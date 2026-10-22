using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Competency.Ceilings;
using DigiTalent.Application.UseCases.Platform.References;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Competency;

public sealed class ReferencePositionMatrixTests : IDisposable
{
    private readonly AppDbContext _db = new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
    private readonly Mock<ICurrentUser> _user = new();
    private readonly Mock<IAuditService> _audit = new();

    private ReferencePositionMatrixService Service => new(_db, _user.Object, _audit.Object);

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task AdminChange_IsSavedGlobally_AndRequiresCurrentVersion()
    {
        var sample = await Service.GetAsync();
        sample.Levels.Should().HaveCount(5);
        sample.Levels["CEO"].Should().HaveCount(6);
        sample.Levels["CEO"][0] = 2;

        var published = await Service.SaveAsync(sample);

        published.Version.Should().Be(2);
        (await Service.GetAsync()).Levels["CEO"][0].Should().Be(2);
        await FluentActions.Invoking(() => Service.SaveAsync(sample)).Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task NewPosition_UsesPlatformSample_ForDepartmentSuggestionWithoutPublishingRequirements()
    {
        var org = Guid.NewGuid();
        var department = new Department { OrganizationId = org, Code = "SALES", Name = "Sales" };
        var position = new JobPosition { OrganizationId = org, DepartmentId = department.Id, Code = "SALES", Name = "Sales" };
        _db.Departments.Add(department);
        _db.JobPositions.Add(position);
        _db.CompetencyCategories.AddRange(
            new CompetencyCategory { OrganizationId = org, Code = "TT02_D1", Name = "Khai thác dữ liệu", SortOrder = 1 },
            new CompetencyCategory { OrganizationId = org, Code = "TT02_D6", Name = "AI", SortOrder = 6 });
        await _db.SaveChangesAsync();

        var reader = new CapabilityCeilingReader(_db, new PulseCatalogReader(_db), Service);
        var matrix = await reader.ReadAsync<GetCapabilityCeilingsUseCaseOutput>(org);

        matrix.Departments.Single().HasSuggestion.Should().BeTrue();
        matrix.Departments.Single().Ceilings.OrderBy(c => matrix.Domains.FindIndex(d => d.CategoryId == c.CategoryId))
            .Select(c => c.Suggested).Should().Equal(2, 1);

        var changed = await Service.GetAsync();
        changed.Levels["SALES_CRM"][0] = 3;
        await Service.SaveAsync(changed);
        var refreshed = await reader.ReadAsync<GetCapabilityCeilingsUseCaseOutput>(org);
        refreshed.Departments.Single().Ceilings.Single(c => c.CategoryId == matrix.Domains[0].CategoryId)
            .Suggested.Should().Be(3);
    }

    [Theory]
    [InlineData("CEO", "Giám đốc", "CEO")]
    [InlineData("SALES", "Sales", "SALES_CRM")]
    [InlineData("KT", "Kế toán", "ACCOUNTANT")]
    [InlineData("NEW", "Chuyên viên mới", null)]
    public void OnlyFiveSupportedSamplesAreMatched(string code, string name, string? expected) =>
        ReferencePositionMatrixService.MatchPosition(code, name).Should().Be(expected);
}
