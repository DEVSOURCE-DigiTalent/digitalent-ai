using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Competency.Ceilings;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Application.UseCases.Learning.Courses;
using DigiTalent.Application.UseCases.Learning.Courses.PurchaseCourse;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Competency;

/// <summary>
/// Khung năng lực (OW-05): toàn doanh nghiệp = mọi khóa đã có (Cơ bản + khóa đã mua); phòng ban đặt mức riêng, không vượt
/// khóa đã có, xét từng lĩnh vực.
/// </summary>
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
        // Cấp 2–3 chỉ mở khi doanh nghiệp đã mua khóa học: mặc định đã mua đủ cho cả hai lĩnh vực.
        AddLicensedCourses(_dataId, domainNumber: 1);
        AddLicensedCourses(_aiId, domainNumber: 6);
        _context.SaveChanges();

        _reader = new CapabilityCeilingReader(_context, new PulseCatalogReader(_context));
    }

    /// <summary>Khóa Cấp 2 và Cấp 3 của lĩnh vực trong danh mục doanh nghiệp, mỗi khóa đã được doanh nghiệp mua.</summary>
    private void AddLicensedCourses(Guid categoryId, int domainNumber)
    {
        var competency = new Domain.Entities.Competency { Id = Guid.NewGuid(), CategoryId = categoryId, Code = $"TT02-{domainNumber}.1", Name = $"Năng lực {domainNumber}.1" };
        _context.Competencies.Add(competency);
        foreach (var (level, suffix) in new[] { (2, "I"), (3, "A") })
        {
            var code = $"M{domainNumber}-{suffix}";
            var course = new Course { OrganizationId = _orgId, Code = code, VersionNo = 1, Title = code, Status = Statuses.Course.Published, CreatedByUserId = Guid.NewGuid() };
            _context.Courses.Add(course);
            _context.CourseCompetencies.Add(new CourseCompetency { CourseId = course.Id, CompetencyId = competency.Id, TargetLevel = (short)level, CoverageType = "PRIMARY" });
            var platformCourse = new PlatformCourse { Code = code, Level = (short)level, Title = code, SalesStatus = Statuses.PlatformCourseSales.Open };
            _context.PlatformCourses.Add(platformCourse);
            _context.CourseOrders.Add(new CourseOrder { OrganizationId = _orgId, CourseId = platformCourse.Id, Amount = 399000 });
        }
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
    public async Task Get_WholeCompanyIsEveryOwnedCourse_AndDepartmentsUseItUntilTheyGetTheirOwnLevel()
    {
        var output = await new GetCapabilityCeilingsUseCase(_currentUser.Object, _reader).ExecuteAsync(new GetCapabilityCeilingsUseCaseInput());

        output.PlatformCourseCount.Should().Be(6);
        output.Domains.Select(d => d.OrganizationCeiling).Should().Equal(3, 3);
        output.Departments.Single().IsCustomized.Should().BeFalse();
        output.Departments.Single().Ceilings.Select(c => c.Level).Should().Equal(3, 3);

        // Nothing bought for AI: only its free Basic course is owned.
        var aiCourseIds = await _context.PlatformCourses.Where(c => c.Code.StartsWith("M6-")).Select(c => c.Id).ToListAsync();
        _context.CourseOrders.RemoveRange(_context.CourseOrders.Where(o => aiCourseIds.Contains(o.CourseId)));
        await _context.SaveChangesAsync();
        var matrix = await _reader.ReadAsync<CapabilityCeilingsDto>(_orgId);
        matrix.Domains.Select(d => d.OrganizationCeiling).Should().Equal(3, 1);
    }

    [Fact]
    public async Task DepartmentLevel_IsTheExpectedLevelOfItsPeople_OtherDomainsFollowThePositions()
    {
        await SaveDepartment(2);

        var expectation = await CapabilityExpectation.LoadAsync(_context, _orgId);

        expectation.ExpectedFor(_deptId, _dataId).Should().Be(2);
        expectation.ExpectedFor(_deptId, _aiId).Should().BeNull("not set for this department");
        expectation.ExpectedFor(null, _dataId).Should().BeNull("people without a department follow their position");
        (await _reader.EffectiveForDepartmentAsync(_orgId, _deptId, new[] { _dataId }))[_dataId].Should().Be(2);
    }

    [Fact]
    public async Task UpdateDepartment_NeedsNoCompanyLevelFirst()
    {
        var output = await SaveDepartment(2);

        output.Departments.Single().Ceilings.Single(c => c.CategoryId == _dataId)
            .Should().BeEquivalentTo(new { Level = 2, IsCustomized = true });
    }

    [Fact]
    public async Task UpdateDepartment_CanAimAboveTheOwnedCourses_SetFirstBuyLater()
    {
        var advanced = await _context.PlatformCourses.SingleAsync(c => c.Code == "M1-A");
        _context.CourseOrders.RemoveRange(_context.CourseOrders.Where(o => o.CourseId == advanced.Id));
        await _context.SaveChangesAsync();

        var output = await SaveDepartment(3);

        output.Domains.Single(d => d.CategoryId == _dataId).OrganizationCeiling.Should().Be(2, "M1-A is not bought yet");
        output.Departments.Single().Ceilings.Single(c => c.CategoryId == _dataId)
            .Should().BeEquivalentTo(new { Level = 3, IsCustomized = true });
    }

    [Fact]
    public async Task UpdateDepartment_UnknownDomain_IsRejected()
    {
        var action = () => DepartmentUseCase().ExecuteAsync(new UpdateDepartmentCeilingsUseCaseInput
        {
            DepartmentId = _deptId,
            Ceilings = { new CeilingInputItem { CategoryId = Guid.NewGuid(), Level = 1 } },
        });

        (await action.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("CATEGORY_NOT_IN_MATRIX");
    }

    [Fact]
    public async Task UpdateDepartment_KeepsItsLevelWhileTheCompanyOwnsOnlyBasic()
    {
        var dataCourseIds = await _context.PlatformCourses.Where(c => c.Code.StartsWith("M1-")).Select(c => c.Id).ToListAsync();
        _context.CourseOrders.RemoveRange(_context.CourseOrders.Where(o => dataCourseIds.Contains(o.CourseId)));
        await _context.SaveChangesAsync();

        var matrix = await _reader.ReadAsync<CapabilityCeilingsDto>(_orgId);
        matrix.Domains.Single(d => d.CategoryId == _dataId).OrganizationCeiling.Should().Be(1);
        var saved = await SaveDepartment(2);
        saved.Departments.Single().Ceilings.Single(c => c.CategoryId == _dataId).Level.Should().Be(2);
    }

    [Fact]
    public async Task UpdateOrganization_Lower_AdjustsDepartmentCeilings()
    {
        await SaveOrganization(data: 3, ai: 3);
        var department = await SaveDepartment(3);
        department.Departments.Single().CourseCount.Should().Be(6);

        var output = await SaveOrganization(data: 1, ai: 2);

        // Legacy endpoint (no longer used by OW-05): it still lowers department levels, the company keeps every owned course.
        output.AdjustedDepartmentCount.Should().Be(1);
        output.OrganizationCourseCount.Should().Be(6);
        var ceilings = output.Departments.Single().Ceilings;
        ceilings.Single(c => c.CategoryId == _dataId).Should().BeEquivalentTo(new { Level = 1, IsCustomized = true });
        ceilings.Single(c => c.CategoryId == _aiId).Should().BeEquivalentTo(new { Level = 3, IsCustomized = false });
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
    public async Task UpdateOrganization_AcceptsLegacyCourseCodeShownAsUnlocked()
    {
        var legacyCourse = await _context.PlatformCourses.SingleAsync(c => c.Code == "M1-I");
        legacyCourse.Code = "A1-I";
        var advanced = await _context.PlatformCourses.SingleAsync(c => c.Code == "M1-A");
        _context.CourseOrders.RemoveRange(_context.CourseOrders.Where(o => o.CourseId == advanced.Id));
        await _context.SaveChangesAsync();

        var matrix = await _reader.ReadAsync<CapabilityCeilingsDto>(_orgId);
        matrix.Domains.Single(d => d.CategoryId == _dataId).Courses.Single(c => c.Code == "M1-I")
            .IsUnlocked.Should().BeTrue();
        matrix.Domains.Single(d => d.CategoryId == _dataId).OrganizationCeiling.Should().Be(2, "the order on the A-code owns M1-I");

        var saved = await SaveOrganization(data: 2, ai: 1);
        saved.Domains.Single(d => d.CategoryId == _dataId).OrganizationCeiling.Should().Be(2);
    }

    [Fact]
    public async Task CourseCatalogAndDetailRecognizeAnOrderUnderEitherPrefix()
    {
        // Only an old order on the historical A-code: the M-code course of the organization is bought by it.
        _context.CourseOrders.RemoveRange(_context.CourseOrders);
        var course = await _context.Courses.SingleAsync(c => c.Code == "M1-I");
        course.Code = "A1-I";
        var legacyCourse = new PlatformCourse { Code = "A1-I", Level = 2, Title = course.Title };
        _context.PlatformCourses.Add(legacyCourse);
        _context.CourseOrders.Add(new CourseOrder
        {
            OrganizationId = _orgId, CourseId = legacyCourse.Id, Amount = 399000, Reason = "Doanh nghiệp mua khóa học",
        });
        await _context.SaveChangesAsync();

        var catalog = await new GetCoursesUseCase(_context, _currentUser.Object)
            .ExecuteAsync(new GetCoursesUseCaseInput { Search = "M1-I" });
        var item = catalog.Items.Should().ContainSingle().Which;
        item.Code.Should().Be("M1-I");
        item.IsPurchased.Should().BeTrue();
        item.HasLicense.Should().BeTrue();

        var detail = await new GetCourseByIdUseCase(_context, _currentUser.Object)
            .ExecuteAsync(new GetCourseByIdUseCaseInput { Id = course.Id });
        detail.Code.Should().Be("M1-I");
        detail.IsPurchased.Should().BeTrue();
        detail.HasLicense.Should().BeTrue();

        var other = await _context.Courses.SingleAsync(c => c.Code == "M1-A");
        (await new GetCourseByIdUseCase(_context, _currentUser.Object).ExecuteAsync(new GetCourseByIdUseCaseInput { Id = other.Id }))
            .HasLicense.Should().BeFalse();
    }

    [Fact]
    public async Task PurchaseCourse_UnlocksItForTheWholeOrganizationOnce()
    {
        _context.CourseOrders.RemoveRange(_context.CourseOrders);
        await _context.SaveChangesAsync();
        var course = await _context.Courses.SingleAsync(c => c.Code == "M1-I");
        var purchase = new PurchaseCourseUseCase(_context, _currentUser.Object);

        var result = await purchase.ExecuteAsync(new PurchaseCourseInput { CourseId = course.Id });

        result.CourseCode.Should().Be("M1-I");
        result.Amount.Should().Be(PlatformCatalog.DefaultPrice(2));
        var order = await _context.CourseOrders.SingleAsync();
        order.Amount.Should().Be(PlatformCatalog.DefaultPrice(2));
        (await _context.CapabilityCeilings.SingleAsync(c => c.CompetencyCategoryId == _dataId && c.DepartmentId == null))
            .CeilingLevel.Should().Be(2);

        var again = () => purchase.ExecuteAsync(new PurchaseCourseInput { CourseId = course.Id });
        await again.Should().ThrowAsync<ConflictException>();
        (await _context.CourseOrders.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task PurchaseCourse_BasicCourseIsFree()
    {
        var basic = new Course { OrganizationId = _orgId, Code = "M1-F", VersionNo = 1, Title = "M1-F", Status = Statuses.Course.Published, CreatedByUserId = Guid.NewGuid() };
        _context.Courses.Add(basic);
        await _context.SaveChangesAsync();

        var action = () => new PurchaseCourseUseCase(_context, _currentUser.Object).ExecuteAsync(new PurchaseCourseInput { CourseId = basic.Id });

        (await action.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("BASIC_COURSE_IS_FREE");
    }

    [Fact]
    public async Task UpdateOrganization_WithoutPurchasedCourse_IsRejected()
    {
        _context.CourseOrders.RemoveRange(_context.CourseOrders);
        await _context.SaveChangesAsync();

        var action = () => SaveOrganization(data: 2, ai: 1);

        (await action.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("COURSE_LICENSE_REQUIRED");
    }

    [Fact]
    public async Task UpdateDepartment_Inherit_DropsOwnCeilings()
    {
        await SaveDepartment(1);

        var output = await DepartmentUseCase().ExecuteAsync(new UpdateDepartmentCeilingsUseCaseInput { DepartmentId = _deptId, Inherit = true });

        output.Departments.Single().IsCustomized.Should().BeFalse();
        output.Departments.Single().CourseCount.Should().Be(6, "back to every course the company owns");
        (await _context.CapabilityCeilings.CountAsync(c => c.DepartmentId == _deptId)).Should().Be(0);
    }

    [Fact]
    public async Task UpdateOrganization_AboveThePurchasedLevel_IsRejected()
    {
        // Lĩnh vực dữ liệu chỉ mua khóa Cấp 2; lĩnh vực AI chưa mua khóa nào.
        var notBought = await _context.CourseOrders
            .Where(o => _context.PlatformCourses.Any(p => p.Id == o.CourseId && (p.Code == "M1-A" || p.Code.StartsWith("M6-"))))
            .ToListAsync();
        _context.CourseOrders.RemoveRange(notBought);
        await _context.SaveChangesAsync();

        var action = () => SaveOrganization(data: 3, ai: 3);
        (await action.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("COURSE_LICENSE_REQUIRED");
    }
}
