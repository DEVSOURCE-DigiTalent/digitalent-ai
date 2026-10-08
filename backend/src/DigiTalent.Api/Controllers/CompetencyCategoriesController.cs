using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/competency-categories")]
public class CompetencyCategoriesController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CompetencyCategoriesController(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    [HttpGet]
    [HasPermission(Permissions.Competency.Read)]
    public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetCategories()
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var categories = await _context.CompetencyCategories
            .AsNoTracking()
            .Where(x => x.OrganizationId == organizationId && x.Status == Statuses.MasterData.Active)
            .OrderBy(x => x.SortOrder)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Name,
                x.Description,
                x.SortOrder
            })
            .ToListAsync();

        return Ok(ApiResponse<IEnumerable<object>>.Ok(categories));
    }
}
