using DigiTalent.Api.Common;
using DigiTalent.Application.IndividualCommerce;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/individual/plans")]
public class IndividualPlansController : ControllerBase
{
    private readonly IIndividualPlanCatalog _planCatalog;

    public IndividualPlansController(IIndividualPlanCatalog planCatalog)
    {
        _planCatalog = planCatalog;
    }

    /// <summary>
    /// Bảng giá và thông tin các gói cá nhân đang mở bán (public, read-only).
    /// </summary>
    [HttpGet]
    public ActionResult<ApiResponse<IndividualPlanCatalogDto>> GetCatalog()
    {
        var catalog = _planCatalog.GetCatalog();
        return Ok(ApiResponse<IndividualPlanCatalogDto>.Ok(catalog));
    }

    /// <summary>
    /// Thông tin chi tiết một gói học cá nhân theo mã gói.
    /// </summary>
    [HttpGet("{planCode}")]
    public ActionResult<ApiResponse<IndividualPlanDto>> GetPlan([FromRoute] string planCode)
    {
        var plan = _planCatalog.GetPlan(planCode);
        if (plan == null)
        {
            return NotFound(ApiResponse<IndividualPlanDto>.Fail("Không tìm thấy thông tin gói này."));
        }

        return Ok(ApiResponse<IndividualPlanDto>.Ok(plan));
    }
}
