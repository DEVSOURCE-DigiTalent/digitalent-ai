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
/// Khung năng lực số (OW-05): toàn doanh nghiệp = mọi khóa đã có (Cơ bản + khóa đã mua); mức cần đạt đặt theo 5 vị trí chuẩn
/// (dùng chung mọi phòng ban), ghi vào chuẩn vị trí; chưa đặt thì theo đề xuất của hệ thống (mẫu TT02 của vị trí).
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

    private UpdatePositionCeilingsUseCase PositionUseCase() => new(_context, _currentUser.Object, _audit.Object, _reader);

    private Task<UpdateOrganizationCeilingsUseCaseOutput> SaveOrganization(int data, int ai) =>
        OrganizationUseCase().ExecuteAsync(new UpdateOrganizationCeilingsUseCaseInput
        {
            Ceilings = { new CeilingInputItem { CategoryId = _dataId, Level = data }, new CeilingInputItem { CategoryId = _aiId, Level = ai } },
        });

    private Task<UpdatePositionCeilingsUseCaseOutput> SavePosition(int data, string code = "ACCOUNTANT") =>
        PositionUseCase().ExecuteAsync(new UpdatePositionCeilingsUseCaseInput
        {
            Code = code,
            Ceilings = { new CeilingInputItem { CategoryId = _dataId, Level = data } },
        });

    private static CeilingPositionDto Accountant(CapabilityCeilingsDto output) => output.Positions.Single(p => p.Code == "ACCOUNTANT");

    private Task<List<PositionRequirementSet>> SetsOfAccountantAsync() =>
        _context.PositionRequirementSets.Include(s => s.Items)
            .Where(s => _context.JobPositions.Any(p => p.Id == s.JobPositionId && p.Code == "ACCOUNTANT"))
            .OrderBy(s => s.VersionNo).ToListAsync();

    [Fact]
    public async Task Get_WholeCompanyIsEveryOwnedCourse_AndTheFivePositionsFollowTheSystemSuggestion()
    {
        var output = await new GetCapabilityCeilingsUseCase(_currentUser.Object, _reader).ExecuteAsync(new GetCapabilityCeilingsUseCaseInput());

        output.PlatformCourseCount.Should().Be(6);
        output.Domains.Select(d => d.OrganizationCeiling).Should().Equal(3, 3);
        output.Positions.Select(p => p.Code).Should().Equal("CEO", "HR", "MARKETING", "SALES_CRM", "ACCOUNTANT");
        output.IsConfigured.Should().BeFalse();
        Accountant(output).IsCustomized.Should().BeFalse();
        Accountant(output).PositionId.Should().BeNull("the organization has no Kế toán row yet");
        Accountant(output).Ceilings.Select(c => (c.Level, c.Suggested)).Should().Equal((3, 3), (1, 1));

        // Nothing bought for AI: only its free Basic course is owned.
        var aiCourseIds = await _context.PlatformCourses.Where(c => c.Code.StartsWith("M6-")).Select(c => c.Id).ToListAsync();
        _context.CourseOrders.RemoveRange(_context.CourseOrders.Where(o => aiCourseIds.Contains(o.CourseId)));
        await _context.SaveChangesAsync();
        var matrix = await _reader.ReadAsync<CapabilityCeilingsDto>(_orgId);
        matrix.Domains.Select(d => d.OrganizationCeiling).Should().Equal(3, 1);
    }

    [Fact]
    public async Task PositionLevel_IsWrittenIntoThePositionStandard_AndRequiredInEveryDepartment()
    {
        var output = await SavePosition(2);

        output.IsConfigured.Should().BeTrue();
        Accountant(output).Ceilings.Single(c => c.CategoryId == _dataId)
            .Should().BeEquivalentTo(new { Level = 2, Suggested = 3, IsCustomized = true });
        Accountant(output).Ceilings.Single(c => c.CategoryId == _aiId)
            .Should().BeEquivalentTo(new { Level = 1, Suggested = 1, IsCustomized = false });
        var set = (await SetsOfAccountantAsync()).Should().ContainSingle().Subject;
        set.Status.Should().Be(Statuses.PositionRequirementSet.Active);
        set.Items.Sum(i => i.WeightPercent).Should().Be(100m);
        var dataItem = set.Items.Single(i => _context.Competencies.Any(c => c.Id == i.CompetencyId && c.CategoryId == _dataId));
        dataItem.Should().BeEquivalentTo(new { RequiredLevel = 2, Note = "OWNER_DOMAIN_LEVEL" });
        set.Items.Single(i => i.Id != dataItem.Id).Note.Should().Be("SYSTEM_REFERENCE_POSITION");

        // the level is the position's, whatever the department of the employee
        var position = await _context.JobPositions.SingleAsync(p => p.Code == "ACCOUNTANT");
        _context.Employees.Add(new Employee { OrganizationId = _orgId, DepartmentId = _deptId, JobPositionId = position.Id, FullName = "An", EmployeeCode = "NV1", Status = "ACTIVE" });
        await _context.SaveChangesAsync();
        var levels = await _reader.ForPositionAsync(_orgId, position.Id, new[] { _dataId, _aiId });
        levels[_dataId].Should().Be(new RequiredDomainLevel(2, IsCustom: true));
        levels[_aiId].Should().Be(new RequiredDomainLevel(1, IsCustom: false));
        (await _reader.EffectiveForDepartmentAsync(_orgId, _deptId, new[] { _dataId }))[_dataId].Should().Be(2);

        // the same level again writes nothing; another one makes a new version and archives the old
        await SavePosition(2);
        (await SetsOfAccountantAsync()).Should().HaveCount(1);
        await SavePosition(3);
        (await SetsOfAccountantAsync()).Select(s => (s.VersionNo, s.Status)).Should().Equal(
            (1, Statuses.PositionRequirementSet.Archived), (2, Statuses.PositionRequirementSet.Active));
    }

    [Fact]
    public async Task UpdatePosition_CanAimAboveTheOwnedCourses_SetFirstBuyLater()
    {
        var advanced = await _context.PlatformCourses.SingleAsync(c => c.Code == "M1-A");
        _context.CourseOrders.RemoveRange(_context.CourseOrders.Where(o => o.CourseId == advanced.Id));
        await _context.SaveChangesAsync();

        var output = await SavePosition(3, "SALES_CRM");

        output.Domains.Single(d => d.CategoryId == _dataId).OrganizationCeiling.Should().Be(2, "M1-A is not bought yet");
        output.Positions.Single(p => p.Code == "SALES_CRM").Ceilings.Single(c => c.CategoryId == _dataId)
            .Should().BeEquivalentTo(new { Level = 3, Suggested = 2, IsCustomized = true });
    }

    [Fact]
    public async Task UpdatePosition_UnknownDomainOrPosition_IsRejected()
    {
        var domain = () => PositionUseCase().ExecuteAsync(new UpdatePositionCeilingsUseCaseInput
        {
            Code = "ACCOUNTANT",
            Ceilings = { new CeilingInputItem { CategoryId = Guid.NewGuid(), Level = 1 } },
        });
        (await domain.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("CATEGORY_NOT_IN_MATRIX");

        var position = () => SavePosition(2, "LEGAL");
        (await position.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("INVALID_JOB_POSITION");
    }

    [Fact]
    public async Task UpdateOrganization_LegacyEndpoint_KeepsTheCompanyAtEveryOwnedCourse()
    {
        await SaveOrganization(data: 3, ai: 3);

        var output = await SaveOrganization(data: 1, ai: 2);

        // Legacy endpoint (no longer used by OW-05): the company keeps every owned course, positions are untouched.
        output.OrganizationCourseCount.Should().Be(6);
        Accountant(output).IsCustomized.Should().BeFalse();
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
    public async Task UpdatePosition_Inherit_GoesBackToTheSystemSuggestion()
    {
        await SavePosition(1);

        var output = await PositionUseCase().ExecuteAsync(new UpdatePositionCeilingsUseCaseInput { Code = "ACCOUNTANT", Inherit = true });

        Accountant(output).IsCustomized.Should().BeFalse();
        Accountant(output).Ceilings.Select(c => c.Level).Should().Equal(3, 1);
        (await SetsOfAccountantAsync()).Last().Items.Should().OnlyContain(i => i.Note == "SYSTEM_REFERENCE_POSITION");
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
