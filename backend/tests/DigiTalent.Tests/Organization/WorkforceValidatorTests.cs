using DigiTalent.Application.UseCases.Competency;
using DigiTalent.Application.UseCases.Intelligence.Analytics;
using DigiTalent.Application.UseCases.Organization.Workforce;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Organization;

/// <summary>Query filters of the workforce, matrix and analytics endpoints (400 on unknown values, case-insensitive).</summary>
public class WorkforceValidatorTests
{
    [Theory]
    [InlineData("high", null, true)]
    [InlineData("UNKNOWN", "overdue", true)]
    [InlineData("SOME", null, false)]
    [InlineData(null, "LATE", false)]
    public void Workforce_AcceptsKnownGapAndLearningFilters(string? gap, string? learning, bool valid)
    {
        var result = new GetWorkforceUseCaseValidator().Validate(new GetWorkforceUseCaseInput { Gap = gap, Learning = learning });

        result.IsValid.Should().Be(valid);
    }

    [Fact]
    public void Workforce_RejectsUnknownStatusAndOversizedPage()
    {
        var result = new GetWorkforceUseCaseValidator().Validate(new GetWorkforceUseCaseInput { Status = "LEFT", PageSize = 500 });

        result.Errors.Select(e => e.PropertyName).Should().BeEquivalentTo("Status", "PageSize");
    }

    [Theory]
    [InlineData("position", "G1", true)]
    [InlineData("GRADE", null, true)]
    [InlineData("team", null, false)]
    [InlineData(null, "G4", false)]
    public void GapOverview_AcceptsKnownGroupingsAndGrades(string? groupBy, string? grade, bool valid)
    {
        var result = new GetGapOverviewUseCaseValidator().Validate(new GetGapOverviewUseCaseInput { GroupBy = groupBy, JobGrade = grade });

        result.IsValid.Should().Be(valid);
    }

    [Fact]
    public void MatrixAndCompetencyGaps_RejectUnknownGrade()
    {
        new GetCompetencyMatrixUseCaseValidator().Validate(new GetCompetencyMatrixUseCaseInput { JobGrade = "X" }).IsValid.Should().BeFalse();
        new GetCompetencyGapsUseCaseValidator().Validate(new GetCompetencyGapsUseCaseInput { JobGrade = "g3" }).IsValid.Should().BeTrue();
    }
}
