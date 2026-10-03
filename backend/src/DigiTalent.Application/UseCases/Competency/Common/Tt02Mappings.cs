using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Competency.Common;

/// <summary>
/// Mapping năng lực → khung Thông tư 02/2025. Dùng làm subquery trong projection để lấy mã "4.2" của năng lực.
/// </summary>
public static class Tt02Mappings
{
    public static IQueryable<CompetencyFrameworkMapping> Query(IApplicationDbContext context) =>
        from mapping in context.CompetencyFrameworkMappings
        join framework in context.CompetencyFrameworks on mapping.FrameworkId equals framework.Id
        where framework.Code == CompetencyFrameworks.Tt02.Code
        select mapping;
}
