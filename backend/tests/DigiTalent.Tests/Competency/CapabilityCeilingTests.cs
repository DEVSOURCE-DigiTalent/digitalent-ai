using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Competency.Ceilings;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Competency;

/// <summary>Trần nhà (OW-05): trần phòng ban ≤ trần doanh nghiệp ≤ trần Digital AI, xét từng lĩnh vực.</summary>
public class CapabilityCeilingTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _dataId = Guid.NewGuid();
    private readonly Guid _aiId = Guid.NewGuid();
    private readonly Guid _deptId = Guid.NewGuid();
    private readonly Mock<ICurrentUser> _currentUser = new();
    private readonly Mock<IAuditService> _audit = new();
    private readonly CapabilityCeilingReader _reader;

    public CapabilityCeilingTests()
    {
        _context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        _currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(_orgId);
        _currentUser.Setup(c => c.OrganizationId).Returns(_orgId);
        _currentUser.Setup(c => c.UserId).Returns(Guid.NewGuid());

        _context.CompetencyCategories.AddRange(
            new CompetencyCategory { Id = _dataId, OrganizationId = _orgId, Code = "TT02_D1", Name = "Khai thác dữ liệu", SortOrder = 1 },
            new CompetencyCategory { Id = _aiId, OrganizationId = _orgId, Code = "TT02_D6", Name = "Ứng dụng AI", SortOrder = 6 });
        _context.Departments.Add(new Department { Id = _deptId, OrganizationId = _orgId, Code = "KT", Name = "Kế toán" });
        _context.SaveChanges();

        var me = new MyEmployeeContext(_context, _currentUser.Object);
        _reader = new CapabilityCeilingReader(_context, new PulseLearnerReader(_context, me, new PulseModuleReader(_context), TimeProvider.System));
    }

    public void Dispose() => _context.Dispose();

    private UpdateOrganizationCeilingsUseCase OrganizationUseCase() => new(_context, _currentUser.Object, _audit.Object, _reader);

    private UpdateDepartmentCeilingsUseCase DepartmentUseCase() => new(_context, _currentUser.Object, _audit.Object, _reader);

    private Task<UpdateOrganizationCeilingsUseCaseOutput> SaveOrganization(int data, int ai) =>
        OrganizationUseCase().ExecuteAsync(new UpdateOrganizationCeilingsUseCaseInput
        {
            Ceilings = { new CeilingInputItem { CategoryId = _dataId, Level = data }, new CeilingInputItem { CategoryId = _aiId, Level = ai } },
        });

    private Task<UpdateDepartmentCeilingsUseCaseOutput> SaveDepartment(int data) =>
        DepartmentUseCase().ExecuteAsync(new UpdateDepartmentCeilingsUseCaseInput
        {
            DepartmentId = _deptId,
            Ceilings = { new CeilingInputItem { CategoryId = _dataId, Level = data } },
        });

    [Fact]
    public async Task Get_BeforeSaving_ShowsSuggestionAndDigitalAiCeiling()
    {
        var output = await new GetCapabilityCeilingsUseCase(_currentUser.Object, _reader).ExecuteAsync(new GetCapabilityCeilingsUseCaseInput());

        output.IsConfigured.Should().BeFalse();
        output.PlatformCourseCount.Should().Be(6);
        output.Domains.Select(d => d.OrganizationCeiling).Should().Equal(1, 1);
        output.Departments.Single().IsCustomized.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateDepartment_BeforeOrganization_IsRejected()
    {
        var action = () => SaveDepartment(1);

        (await action.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("ORGANIZATION_CEILING_REQUIRED");
    }

    [Fact]
    public async Task UpdateDepartment_AboveOrganization_IsRejected()
    {
        await SaveOrganization(data: 2, ai: 3);

        var action = () => SaveDepartment(3);

        (await action.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("CEILING_ABOVE_ORGANIZATION");
    }

    [Fact]
    public async Task UpdateOrganization_Lower_AdjustsDepartmentCeilings()
    {
        await SaveOrganization(data: 3, ai: 3);
        var department = await SaveDepartment(3);
        department.Departments.Single().CourseCount.Should().Be(6);

        var output = await SaveOrganization(data: 1, ai: 2);

        output.AdjustedDepartmentCount.Should().Be(1);
        output.OrganizationCourseCount.Should().Be(3);
        var ceilings = output.Departments.Single().Ceilings;
        ceilings.Single(c => c.CategoryId == _dataId).Should().BeEquivalentTo(new { Level = 1, IsCustomized = true });
        ceilings.Single(c => c.CategoryId == _aiId).Should().BeEquivalentTo(new { Level = 2, IsCustomized = false });
    }

    [Fact]
    public async Task UpdateOrganization_MissingDomain_IsRejected()
    {
        var action = () => OrganizationUseCase().ExecuteAsync(new UpdateOrganizationCeilingsUseCaseInput
        {
            Ceilings = { new CeilingInputItem { CategoryId = _dataId, Level = 2 } },
        });

        (await action.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("CEILINGS_INCOMPLETE");
    }

    [Fact]
    public async Task UpdateDepartment_Inherit_DropsOwnCeilings()
    {
        await SaveOrganization(data: 2, ai: 2);
        await SaveDepartment(1);

        var output = await DepartmentUseCase().ExecuteAsync(new UpdateDepartmentCeilingsUseCaseInput { DepartmentId = _deptId, Inherit = true });

        output.Departments.Single().IsCustomized.Should().BeFalse();
        output.Departments.Single().CourseCount.Should().Be(4);
        (await _context.CapabilityCeilings.CountAsync(c => c.DepartmentId == _deptId)).Should().Be(0);
    }
}
