using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Competency.DTOs;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Competency.Services;

public class CompetencyService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CompetencyService(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    // ═══════════════════════════════════════
    // Categories
    // ═══════════════════════════════════════

    public async Task<PagedList<CompetencyCategoryResponse>> SearchCategoriesAsync(PaginationRequest request)
    {
        var query = _context.CompetencyCategories.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(kw) || c.Code.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CompetencyCategoryResponse
            {
                Id = c.Id, Code = c.Code, Name = c.Name,
                Description = c.Description, SortOrder = c.SortOrder,
                Status = c.Status,
                CompetencyCount = c.Competencies.Count,
                CreatedAt = c.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<CompetencyCategoryResponse>
        {
            Items = items, PageIndex = request.PageIndex,
            PageSize = request.PageSize, TotalItems = totalItems,
        };
    }

    public async Task<List<CompetencyCategoryResponse>> GetAllCategoriesAsync()
    {
        return await _context.CompetencyCategories
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new CompetencyCategoryResponse
            {
                Id = c.Id, Code = c.Code, Name = c.Name,
                Description = c.Description, SortOrder = c.SortOrder,
                Status = c.Status,
                CompetencyCount = c.Competencies.Count,
                CreatedAt = c.CreatedAt,
            })
            .ToListAsync();
    }

    public async Task<CompetencyCategoryDetailResponse> GetCategoryAsync(Guid categoryId)
    {
        var category = await _context.CompetencyCategories
            .Include(c => c.Competencies)
            .FirstOrDefaultAsync(c => c.Id == categoryId)
            ?? throw new KeyNotFoundException("Competency category not found.");

        return new CompetencyCategoryDetailResponse
        {
            Id = category.Id, Code = category.Code, Name = category.Name,
            Description = category.Description, SortOrder = category.SortOrder,
            Status = category.Status,
            CompetencyCount = category.Competencies.Count,
            CreatedAt = category.CreatedAt,
            Competencies = category.Competencies
                .OrderBy(c => c.Code)
                .Select(c => new CompetencyResponse
                {
                    Id = c.Id, CategoryId = c.CategoryId,
                    CategoryName = category.Name, Code = c.Code,
                    Name = c.Name, Description = c.Description,
                    Status = c.Status, CreatedAt = c.CreatedAt,
                })
                .ToList(),
        };
    }

    public async Task<CompetencyCategoryResponse> CreateCategoryAsync(CreateCompetencyCategoryRequest request)
    {
        if (await _context.CompetencyCategories.AnyAsync(c => c.Code == request.Code.ToUpper()))
            throw new InvalidOperationException("Competency category code already exists.");

        var orgId = await _context.Organizations.Select(o => o.Id).FirstAsync();

        var entity = new Domain.Entities.Competency.CompetencyCategory
        {
            OrganizationId = orgId,
            Code = request.Code.ToUpper(),
            Name = request.Name,
            Description = request.Description,
            SortOrder = request.SortOrder,
            Status = "ACTIVE",
        };
        _context.CompetencyCategories.Add(entity);
        await _context.SaveChangesAsync(default);

        return new CompetencyCategoryResponse
        {
            Id = entity.Id, Code = entity.Code, Name = entity.Name,
            Description = entity.Description, SortOrder = entity.SortOrder,
            Status = entity.Status, CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<CompetencyCategoryResponse> UpdateCategoryAsync(Guid categoryId, UpdateCompetencyCategoryRequest request)
    {
        var category = await _context.CompetencyCategories
            .Include(c => c.Competencies)
            .FirstOrDefaultAsync(c => c.Id == categoryId)
            ?? throw new KeyNotFoundException("Competency category not found.");

        if (request.Name != null) category.Name = request.Name;
        if (request.Description != null) category.Description = request.Description;
        if (request.SortOrder.HasValue) category.SortOrder = request.SortOrder.Value;
        await _context.SaveChangesAsync(default);

        return new CompetencyCategoryResponse
        {
            Id = category.Id, Code = category.Code, Name = category.Name,
            Description = category.Description, SortOrder = category.SortOrder,
            Status = category.Status,
            CompetencyCount = category.Competencies.Count,
            CreatedAt = category.CreatedAt,
        };
    }

    public async Task ChangeCategoryStatusAsync(Guid categoryId, string status)
    {
        var category = await _context.CompetencyCategories.FindAsync(categoryId)
            ?? throw new KeyNotFoundException("Competency category not found.");
        category.Status = status;
        await _context.SaveChangesAsync(default);
    }

    // ═══════════════════════════════════════
    // Competencies
    // ═══════════════════════════════════════

    public async Task<PagedList<CompetencyResponse>> SearchCompetenciesAsync(PaginationRequest request)
    {
        var query = _context.Competencies
            .Include(c => c.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(kw) || c.Code.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderBy(c => c.Category.SortOrder).ThenBy(c => c.Code)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CompetencyResponse
            {
                Id = c.Id, CategoryId = c.CategoryId,
                CategoryName = c.Category.Name, Code = c.Code,
                Name = c.Name, Description = c.Description,
                Status = c.Status, CreatedAt = c.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<CompetencyResponse>
        {
            Items = items, PageIndex = request.PageIndex,
            PageSize = request.PageSize, TotalItems = totalItems,
        };
    }

    public async Task<List<CompetencyResponse>> GetCompetenciesByCategoryAsync(Guid categoryId)
    {
        return await _context.Competencies
            .Include(c => c.Category)
            .Where(c => c.CategoryId == categoryId)
            .OrderBy(c => c.Code)
            .Select(c => new CompetencyResponse
            {
                Id = c.Id, CategoryId = c.CategoryId,
                CategoryName = c.Category.Name, Code = c.Code,
                Name = c.Name, Description = c.Description,
                Status = c.Status, CreatedAt = c.CreatedAt,
            })
            .ToListAsync();
    }

    public async Task<CompetencyResponse> CreateCompetencyAsync(CreateCompetencyRequest request)
    {
        if (await _context.Competencies.AnyAsync(c => c.Code == request.Code.ToUpper()))
            throw new InvalidOperationException("Competency code already exists.");

        var category = await _context.CompetencyCategories.FindAsync(request.CategoryId)
            ?? throw new KeyNotFoundException("Competency category not found.");

        var entity = new Domain.Entities.Competency.Competency
        {
            CategoryId = request.CategoryId,
            Code = request.Code.ToUpper(),
            Name = request.Name,
            Description = request.Description,
            Status = "ACTIVE",
        };
        _context.Competencies.Add(entity);
        await _context.SaveChangesAsync(default);

        return new CompetencyResponse
        {
            Id = entity.Id, CategoryId = entity.CategoryId,
            CategoryName = category.Name, Code = entity.Code,
            Name = entity.Name, Description = entity.Description,
            Status = entity.Status, CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<CompetencyResponse> UpdateCompetencyAsync(Guid competencyId, UpdateCompetencyRequest request)
    {
        var competency = await _context.Competencies
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == competencyId)
            ?? throw new KeyNotFoundException("Competency not found.");

        if (request.Name != null) competency.Name = request.Name;
        if (request.Description != null) competency.Description = request.Description;
        if (request.Status != null) competency.Status = request.Status;
        await _context.SaveChangesAsync(default);

        return new CompetencyResponse
        {
            Id = competency.Id, CategoryId = competency.CategoryId,
            CategoryName = competency.Category.Name, Code = competency.Code,
            Name = competency.Name, Description = competency.Description,
            Status = competency.Status, CreatedAt = competency.CreatedAt,
        };
    }

    // ═══════════════════════════════════════
    // Competency Levels
    // ═══════════════════════════════════════

    public async Task<List<CompetencyLevelResponse>> GetAllLevelsAsync()
    {
        return await _context.CompetencyLevels
            .OrderBy(l => l.LevelValue)
            .Select(l => new CompetencyLevelResponse
            {
                Id = l.Id, LevelValue = l.LevelValue, Name = l.Name,
                Description = l.Description, AchievementCriteria = l.AchievementCriteria,
                Status = l.Status, CreatedAt = l.CreatedAt,
            })
            .ToListAsync();
    }

    public async Task<CompetencyLevelResponse> CreateLevelAsync(CreateCompetencyLevelRequest request)
    {
        if (await _context.CompetencyLevels.AnyAsync(l => l.LevelValue == request.LevelValue))
            throw new InvalidOperationException("Competency level with this value already exists.");

        var orgId = await _context.Organizations.Select(o => o.Id).FirstAsync();

        var entity = new Domain.Entities.Competency.CompetencyLevel
        {
            OrganizationId = orgId,
            LevelValue = request.LevelValue,
            Name = request.Name,
            Description = request.Description,
            AchievementCriteria = request.AchievementCriteria,
            Status = "ACTIVE",
        };
        _context.CompetencyLevels.Add(entity);
        await _context.SaveChangesAsync(default);

        return new CompetencyLevelResponse
        {
            Id = entity.Id, LevelValue = entity.LevelValue, Name = entity.Name,
            Description = entity.Description, AchievementCriteria = entity.AchievementCriteria,
            Status = entity.Status, CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<CompetencyLevelResponse> UpdateLevelAsync(Guid levelId, UpdateCompetencyLevelRequest request)
    {
        var level = await _context.CompetencyLevels.FindAsync(levelId)
            ?? throw new KeyNotFoundException("Competency level not found.");

        if (request.Name != null) level.Name = request.Name;
        if (request.Description != null) level.Description = request.Description;
        if (request.AchievementCriteria != null) level.AchievementCriteria = request.AchievementCriteria;
        if (request.Status != null) level.Status = request.Status;
        await _context.SaveChangesAsync(default);

        return new CompetencyLevelResponse
        {
            Id = level.Id, LevelValue = level.LevelValue, Name = level.Name,
            Description = level.Description, AchievementCriteria = level.AchievementCriteria,
            Status = level.Status, CreatedAt = level.CreatedAt,
        };
    }

    // ═══════════════════════════════════════
    // Position Competency Requirements
    // ═══════════════════════════════════════

    public async Task<List<PositionCompetencyRequirementResponse>> GetPositionRequirementsAsync(Guid positionId)
    {
        return await _context.PositionCompetencyRequirements
            .Include(r => r.Competency).ThenInclude(c => c.Category)
            .Where(r => r.JobPositionId == positionId)
            .OrderBy(r => r.Competency.Category.SortOrder).ThenBy(r => r.Competency.Code)
            .Select(r => new PositionCompetencyRequirementResponse
            {
                Id = r.Id, CompetencyId = r.CompetencyId,
                CompetencyCode = r.Competency.Code, CompetencyName = r.Competency.Name,
                CategoryName = r.Competency.Category.Name,
                RequiredLevelValue = r.RequiredLevelValue, Weight = r.Weight,
                IsMandatory = r.IsMandatory,
            })
            .ToListAsync();
    }

    public async Task<List<PositionCompetencyRequirementResponse>> SavePositionRequirementsAsync(
        Guid positionId, SavePositionRequirementsRequest request)
    {
        var position = await _context.JobPositions.FindAsync(positionId)
            ?? throw new KeyNotFoundException("Job position not found.");

        // Remove existing requirements for this position
        var existing = await _context.PositionCompetencyRequirements
            .Where(r => r.JobPositionId == positionId)
            .ToListAsync();
        _context.PositionCompetencyRequirements.RemoveRange(existing);

        // Add new requirements
        foreach (var req in request.Requirements)
        {
            _context.PositionCompetencyRequirements.Add(
                new Domain.Entities.Competency.PositionCompetencyRequirement
                {
                    JobPositionId = positionId,
                    CompetencyId = req.CompetencyId,
                    RequiredLevelValue = req.RequiredLevelValue,
                    Weight = req.Weight,
                    IsMandatory = req.IsMandatory,
                });
        }

        await _context.SaveChangesAsync(default);

        return await GetPositionRequirementsAsync(positionId);
    }

    // ═══════════════════════════════════════
    // Employee Competency Profiles
    // ═══════════════════════════════════════

    public async Task<List<EmployeeCompetencyProfileDetailResponse>> GetEmployeeProfileAsync(Guid employeeId)
    {
        var employee = await _context.Employees
            .Include(e => e.JobPosition)
            .FirstOrDefaultAsync(e => e.Id == employeeId)
            ?? throw new KeyNotFoundException("Employee not found.");

        // Get all competency profiles for the employee
        var profiles = await _context.EmployeeCompetencyProfiles
            .Include(p => p.Competency).ThenInclude(c => c.Category)
            .Where(p => p.EmployeeId == employeeId)
            .OrderBy(p => p.Competency.Category.SortOrder).ThenBy(p => p.Competency.Code)
            .ToListAsync();

        // Get position requirements for gap analysis
        var positionRequirements = employee.JobPositionId != default
            ? await _context.PositionCompetencyRequirements
                .Where(r => r.JobPositionId == employee.JobPositionId)
                .ToDictionaryAsync(r => r.CompetencyId, r => r.RequiredLevelValue)
            : new Dictionary<Guid, int>();

        return profiles.Select(p => new EmployeeCompetencyProfileDetailResponse
        {
            Id = p.Id, EmployeeId = p.EmployeeId,
            CompetencyId = p.CompetencyId,
            CompetencyCode = p.Competency.Code,
            CompetencyName = p.Competency.Name,
            CategoryName = p.Competency.Category.Name,
            CurrentLevelValue = p.CurrentLevelValue,
            ConfidenceScore = p.ConfidenceScore,
            LastEvaluatedAt = p.LastEvaluatedAt,
            PositionRequiredLevel = positionRequirements.GetValueOrDefault(p.CompetencyId),
        }).ToList();
    }

    public async Task<EmployeeCompetencyProfileResponse> UpdateEmployeeProfileAsync(
        Guid employeeId, Guid competencyId, UpdateEmployeeCompetencyProfileRequest request)
    {
        var employee = await _context.Employees.FindAsync(employeeId)
            ?? throw new KeyNotFoundException("Employee not found.");

        // Find existing profile or create new one
        var profile = await _context.EmployeeCompetencyProfiles
            .Include(p => p.Competency).ThenInclude(c => c.Category)
            .FirstOrDefaultAsync(p => p.EmployeeId == employeeId && p.CompetencyId == competencyId);

        if (profile == null)
        {
            profile = new Domain.Entities.Competency.EmployeeCompetencyProfile
            {
                EmployeeId = employeeId,
                CompetencyId = competencyId,
                CurrentLevelValue = request.CurrentLevelValue,
                ConfidenceScore = request.ConfidenceScore,
                LastEvaluatedAt = DateTimeOffset.UtcNow,
            };
            _context.EmployeeCompetencyProfiles.Add(profile);
        }
        else
        {
            profile.CurrentLevelValue = request.CurrentLevelValue;
            profile.ConfidenceScore = request.ConfidenceScore;
            profile.LastEvaluatedAt = DateTimeOffset.UtcNow;
        }

        await _context.SaveChangesAsync(default);

        return new EmployeeCompetencyProfileResponse
        {
            Id = profile.Id, EmployeeId = profile.EmployeeId,
            CompetencyId = profile.CompetencyId,
            CompetencyCode = profile.Competency.Code,
            CompetencyName = profile.Competency.Name,
            CategoryName = profile.Competency.Category.Name,
            CurrentLevelValue = profile.CurrentLevelValue,
            ConfidenceScore = profile.ConfidenceScore,
            LastEvaluatedAt = profile.LastEvaluatedAt,
        };
    }

    // ═══════════════════════════════════════
    // Competency Evidence
    // ═══════════════════════════════════════

    public async Task<PagedList<CompetencyEvidenceResponse>> SearchEvidencesAsync(
        Guid employeeId, PaginationRequest request)
    {
        var query = _context.CompetencyEvidences
            .Include(e => e.Competency)
            .Where(e => e.EmployeeId == employeeId)
            .AsQueryable();

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new CompetencyEvidenceResponse
            {
                Id = e.Id, EmployeeId = e.EmployeeId,
                CompetencyId = e.CompetencyId,
                CompetencyName = e.Competency.Name,
                EvidenceType = e.EvidenceType,
                SourceEntityType = e.SourceEntityType,
                SourceEntityId = e.SourceEntityId,
                EvidenceScore = e.EvidenceScore,
                ConfirmedLevelValue = e.ConfirmedLevelValue,
                Status = e.Status, Notes = e.Notes,
                CreatedAt = e.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<CompetencyEvidenceResponse>
        {
            Items = items, PageIndex = request.PageIndex,
            PageSize = request.PageSize, TotalItems = totalItems,
        };
    }

    public async Task<CompetencyEvidenceResponse> CreateEvidenceAsync(
        Guid employeeId, CreateCompetencyEvidenceRequest request)
    {
        var employee = await _context.Employees.FindAsync(employeeId)
            ?? throw new KeyNotFoundException("Employee not found.");

        var competency = await _context.Competencies.FindAsync(request.CompetencyId)
            ?? throw new KeyNotFoundException("Competency not found.");

        var entity = new Domain.Entities.Competency.CompetencyEvidence
        {
            EmployeeId = employeeId,
            CompetencyId = request.CompetencyId,
            EvidenceType = request.EvidenceType,
            SourceEntityType = request.SourceEntityType,
            SourceEntityId = request.SourceEntityId,
            EvidenceScore = request.EvidenceScore,
            Status = "PENDING",
            Notes = request.Notes,
        };
        _context.CompetencyEvidences.Add(entity);
        await _context.SaveChangesAsync(default);

        return new CompetencyEvidenceResponse
        {
            Id = entity.Id, EmployeeId = entity.EmployeeId,
            CompetencyId = entity.CompetencyId,
            CompetencyName = competency.Name,
            EvidenceType = entity.EvidenceType,
            SourceEntityType = entity.SourceEntityType,
            SourceEntityId = entity.SourceEntityId,
            EvidenceScore = entity.EvidenceScore,
            Status = entity.Status, Notes = entity.Notes,
            CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<CompetencyEvidenceResponse> ReviewEvidenceAsync(
        Guid evidenceId, ReviewEvidenceRequest request)
    {
        var evidence = await _context.CompetencyEvidences
            .Include(e => e.Competency)
            .FirstOrDefaultAsync(e => e.Id == evidenceId)
            ?? throw new KeyNotFoundException("Competency evidence not found.");

        if (request.Status != "APPROVED" && request.Status != "REJECTED")
            throw new InvalidOperationException("Status must be APPROVED or REJECTED.");

        evidence.Status = request.Status;
        evidence.Notes = request.Notes ?? evidence.Notes;
        evidence.VerifiedByUserId = _currentUser.UserId;

        if (request.ConfirmedLevelValue.HasValue)
            evidence.ConfirmedLevelValue = request.ConfirmedLevelValue;

        // If approved, auto-update the employee's competency profile
        if (request.Status == "APPROVED")
        {
            var profile = await _context.EmployeeCompetencyProfiles
                .FirstOrDefaultAsync(p =>
                    p.EmployeeId == evidence.EmployeeId &&
                    p.CompetencyId == evidence.CompetencyId);

            var levelValue = request.ConfirmedLevelValue
                ?? (evidence.EvidenceScore.HasValue
                    ? (int)Math.Round(evidence.EvidenceScore.Value)
                    : 0);

            if (profile == null)
            {
                _context.EmployeeCompetencyProfiles.Add(
                    new Domain.Entities.Competency.EmployeeCompetencyProfile
                    {
                        EmployeeId = evidence.EmployeeId,
                        CompetencyId = evidence.CompetencyId,
                        CurrentLevelValue = levelValue,
                        LastEvidenceId = evidence.Id,
                        LastEvaluatedAt = DateTimeOffset.UtcNow,
                        UpdatedBy = _currentUser.UserId,
                    });
            }
            else
            {
                profile.CurrentLevelValue = levelValue;
                profile.LastEvidenceId = evidence.Id;
                profile.LastEvaluatedAt = DateTimeOffset.UtcNow;
                profile.UpdatedBy = _currentUser.UserId;
            }
        }

        await _context.SaveChangesAsync(default);

        return new CompetencyEvidenceResponse
        {
            Id = evidence.Id, EmployeeId = evidence.EmployeeId,
            CompetencyId = evidence.CompetencyId,
            CompetencyName = evidence.Competency.Name,
            EvidenceType = evidence.EvidenceType,
            SourceEntityType = evidence.SourceEntityType,
            SourceEntityId = evidence.SourceEntityId,
            EvidenceScore = evidence.EvidenceScore,
            ConfirmedLevelValue = evidence.ConfirmedLevelValue,
            Status = evidence.Status, Notes = evidence.Notes,
            CreatedAt = evidence.CreatedAt,
        };
    }
}
